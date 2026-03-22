/**
 * Chat Screen — Voice & Text AI with animated character + daily limit tracker
 * Shows: usage bar, remaining time, friendly limit-reached message
 * VAD auto-silence → sends → responds → auto-restarts (within limit)
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Dimensions, TextInput, KeyboardAvoidingView, Platform,
  Alert, Animated
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useAppStore } from '../../store/appStore';
import { CHARACTERS, CLASS_GROUPS, CharacterId } from '../../constants/AppData';
import AnimatedCharacter, { Expression } from '../../components/AnimatedCharacter';
import { API_URL } from '../../utils/api';

const { width } = Dimensions.get('window');

type SubjectMode = 'english' | 'science' | 'maths' | 'gk' | 'conversation' | 'storyplay' | 'wordspark';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface VoiceUsage {
  used_seconds: number;
  limit_seconds: number;
  remaining_seconds: number;
  used_minutes: number;
  limit_minutes: number;
  percent_used: number;
  is_unlimited: boolean;
}

const SUBJECTS: { id: SubjectMode; emoji: string; label: string; color: string }[] = [
  { id: 'english',      emoji: '📖', label: 'English',    color: '#667EEA' },
  { id: 'science',      emoji: '🔬', label: 'Science',    color: '#10B981' },
  { id: 'maths',        emoji: '🔢', label: 'Maths',      color: '#F59E0B' },
  { id: 'gk',           emoji: '🌍', label: 'GK',         color: '#8B5CF6' },
  { id: 'conversation', emoji: '💬', label: 'Talk',       color: '#EC4899' },
  { id: 'storyplay',    emoji: '📚', label: 'Storyplay',  color: '#F97316' },
  { id: 'wordspark',    emoji: '✨', label: 'Word Spark', color: '#6366F1' },
];

function detectExpression(text: string): Expression {
  const t = text.toLowerCase();
  if (/great|excellent|wonderful|amazing|fantastic|brilliant/.test(t)) return 'excited';
  if (/perfect|well done|correct|right!|star/.test(t)) return 'proud';
  if (/hmm|let me think|interesting|good question/.test(t)) return 'thinking';
  if (/try again|almost|not quite|close/.test(t)) return 'confused';
  return 'happy';
}

function buildSystemPrompt(
  characterName: string, personality: string,
  subject: SubjectMode, className: string, lang: string
): string {
  const base = `You are ${characterName}, a lively AI learning BUDDY for an Indian child in ${className}.
Personality: ${personality}
${lang !== 'none' ? `You may use occasional ${lang} words to explain hard concepts. Speak mainly English.` : 'Speak English only.'}
SAFETY: Never discuss adult/violent/inappropriate topics. You are for children only.
Rules: SHORT replies (2-3 sentences max) — this is voice. Be enthusiastic! WOW! AMAZING! Ask one follow-up question. Correct gently. Use emojis: 🌟 😊 🎉 🤔`;
  const extras: Record<SubjectMode, string> = {
    english:      '\nFocus: Vocabulary, grammar, spellings, storytelling.',
    science:      '\nFocus: Animals, plants, space, weather, human body — fun kid-friendly facts.',
    maths:        '\nFocus: Counting, addition, subtraction, shapes, word problems.',
    gk:           '\nFocus: Countries, capitals, festivals, Indian culture, fun world facts.',
    conversation: '\nFocus: Everyday talk — school, family, friends, feelings, hobbies.',
    storyplay:    '\nFocus: Co-create a story. Ask "What happens next?" every time!',
    wordspark:    '\nFocus: WORD SPARK mode. Introduce one interesting word, explain it simply with a story example, then ask the child to use it in their own sentence. Celebrate when they do! Keep it fun and dramatic.',
  };
  return base + extras[subject];
}

// ── Usage Bar Component ───────────────────────────────────────────────────────
function UsageBar({ usage, subjectColor }: { usage: VoiceUsage | null; subjectColor: string }) {
  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!usage) return;
    Animated.timing(animWidth, {
      toValue: usage.is_unlimited ? 5 : usage.percent_used,
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [usage?.percent_used]);

  if (!usage) return null;

  const pct        = usage.is_unlimited ? 0 : usage.percent_used;
  const remaining  = usage.remaining_seconds;
  const isLow      = !usage.is_unlimited && remaining < 120;  // < 2 min
  const isDone     = !usage.is_unlimited && remaining <= 0;
  const barColor   = isDone ? '#EF4444' : isLow ? '#F97316' : subjectColor;

  const label = usage.is_unlimited
    ? '∞ Unlimited voice'
    : isDone
      ? '⏰ Limit reached — resets at midnight'
      : isLow
        ? `⚠️ ${Math.ceil(remaining / 60)} min left today`
        : `🎙️ ${usage.used_minutes} / ${usage.limit_minutes} min used today`;

  return (
    <View style={uStyles.wrap}>
      <View style={uStyles.barBg}>
        <Animated.View style={[uStyles.barFill, {
          backgroundColor: barColor,
          width: animWidth.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] })
        }]} />
      </View>
      <Text style={[uStyles.label, isLow && { color: barColor }]}>{label}</Text>
    </View>
  );
}

const uStyles = StyleSheet.create({
  wrap:   { paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#1E293B' },
  barBg:  { height: 4, backgroundColor: '#334155', borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  barFill:{ height: 4, borderRadius: 2 },
  label:  { fontSize: 11, color: '#94A3B8', textAlign: 'center' },
});

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ChatScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAppStore();

  const charId    = (params.character as CharacterId) || (user?.selected_character as CharacterId) || 'cat';
  const character = CHARACTERS[charId] || CHARACTERS.cat;
  const classGroup = CLASS_GROUPS.find(c => c.id === (user?.current_class || 'class1')) || CLASS_GROUPS[2];

  const [subject,    setSubject]    = useState<SubjectMode>('english');
  const [messages,   setMessages]   = useState<Message[]>([]);
  const [inputText,  setInputText]  = useState('');
  const [listening,  setListening]  = useState(false);
  const [processing, setProcessing] = useState(false);
  const [speaking,   setSpeaking]   = useState(false);
  const [expression, setExpression] = useState<Expression>('idle');
  const [convId,     setConvId]     = useState<string | null>(null);
  const [usage,      setUsage]      = useState<VoiceUsage | null>(null);

  const scrollRef     = useRef<ScrollView>(null);
  const recordingRef  = useRef<Audio.Recording | null>(null);
  const soundRef      = useRef<Audio.Sound | null>(null);
  const meterInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load usage on mount and after each session
  const loadUsage = async () => {
    if (!user?.user_id) return;
    try {
      const res = await fetch(`${API_URL}/api/voice-usage/${user.user_id}`);
      if (res.ok) setUsage(await res.json());
    } catch {}
  };

  useEffect(() => {
    const greet = character.catchPhrases[Math.floor(Math.random() * character.catchPhrases.length)];
    addMessage('assistant', greet);
    setExpression('happy');
    loadUsage();
    return () => { stopRecording(); stopSound(); };
  }, [charId]);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role, content, timestamp: new Date() }]);
  };

  // ── Audio permission ──────────────────────────────────────────────────────
  const ensurePermission = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Microphone needed!', 'Please allow microphone access in Settings.');
      return false;
    }
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
    return true;
  };

  // ── Check limit before starting ───────────────────────────────────────────
  const isVoiceAllowed = () => {
    if (!usage) return true;          // not loaded yet — allow and let backend decide
    if (usage.is_unlimited) return true;
    return usage.remaining_seconds > 5;
  };

  // ── Start recording + VAD ─────────────────────────────────────────────────
  const startRecording = async () => {
    if (processing || speaking) return;
    if (!isVoiceAllowed()) {
      addMessage('assistant',
        `⏰ You've used all ${usage!.limit_minutes} minutes of voice chat for today! 🌙\nCome back tomorrow — or keep learning with games, phonics, and text chat!`
      );
      setExpression('confused');
      return;
    }
    if (!(await ensurePermission())) return;

    try {
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        android: { ...Audio.RecordingOptionsPresets.HIGH_QUALITY.android, audioEncoder: Audio.AndroidAudioEncoder.AAC },
        ios:     { ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios, audioQuality: Audio.IOSAudioQuality.HIGH },
      });
      await recording.startAsync();
      recordingRef.current = recording;
      setListening(true);
      setExpression('idle');

      // VAD: detect silence → auto-send
      let silentMs = 0;
      meterInterval.current = setInterval(async () => {
        try {
          const status = await recording.getStatusAsync();
          const db_val = (status as any).metering ?? -60;
          silentMs = db_val > -35 ? 0 : silentMs + 200;
          if (silentMs >= 1400) {
            clearInterval(meterInterval.current!);
            stopRecordingAndSend();
          }
        } catch {}
      }, 200);
    } catch (e) {
      console.error('Recording error:', e);
      setListening(false);
    }
  };

  const stopRecording = async () => {
    if (meterInterval.current) { clearInterval(meterInterval.current); meterInterval.current = null; }
    if (recordingRef.current) {
      try { await recordingRef.current.stopAndUnloadAsync(); } catch {}
      recordingRef.current = null;
    }
    setListening(false);
  };

  const stopRecordingAndSend = async () => {
    if (!recordingRef.current) return;
    if (meterInterval.current) { clearInterval(meterInterval.current); meterInterval.current = null; }
    const rec = recordingRef.current;
    recordingRef.current = null;
    setListening(false);
    setProcessing(true);
    setExpression('thinking');
    try {
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      if (!uri) { setProcessing(false); return; }
      await sendVoiceMessage(uri);
    } catch (e) {
      setProcessing(false);
      setExpression('confused');
    }
  };

  const stopSound = async () => {
    if (soundRef.current) {
      try { await soundRef.current.stopAsync(); await soundRef.current.unloadAsync(); } catch {}
      soundRef.current = null;
    }
    setSpeaking(false);
  };

  // ── Send voice to backend ─────────────────────────────────────────────────
  const sendVoiceMessage = async (audioUri: string) => {
    const systemPrompt = buildSystemPrompt(
      character.name, character.personality, subject,
      classGroup.fullName, user?.preferred_language || 'none'
    );
    const formData = new FormData();
    formData.append('audio',         { uri: audioUri, type: 'audio/m4a', name: 'voice.m4a' } as any);
    formData.append('user_id',       user?.user_id || 'guest');
    formData.append('character',     charId);
    formData.append('age_group',     user?.current_class || 'class1');
    formData.append('subject',       subject);
    formData.append('system_prompt', systemPrompt);
    if (convId) formData.append('conversation_id', convId);

    const res  = await fetch(`${API_URL}/api/voice-chat`, { method: 'POST', body: formData });
    const data = await res.json();

    if (!res.ok) throw new Error(data.detail || 'Voice chat failed');

    // Update usage from response
    if (data.usage) setUsage(data.usage);

    // Handle limit reached
    if (data.limit_reached) {
      addMessage('assistant', data.message || '⏰ Daily voice limit reached! Come back tomorrow.');
      setExpression('confused');
      setProcessing(false);
      loadUsage();
      return;
    }

    if (data.conversation_id) setConvId(data.conversation_id);
    addMessage('user',      data.user_text || '(voice)');
    addMessage('assistant', data.response_text);
    setExpression(detectExpression(data.response_text));
    setProcessing(false);

    if (data.response_audio_base64) {
      await playBase64Audio(data.response_audio_base64);
    } else {
      setTimeout(startRecording, 600);
    }
  };

  const playBase64Audio = async (base64: string) => {
    setSpeaking(true);
    setExpression('speaking');
    try {
      await stopSound();
      const path = `${FileSystem.cacheDirectory}resp_${Date.now()}.mp3`;
      await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 });
      const { sound } = await Audio.Sound.createAsync({ uri: path }, { shouldPlay: true });
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if ((status as any).didJustFinish) {
          setSpeaking(false);
          setExpression('happy');
          setTimeout(startRecording, 600);
        }
      });
    } catch {
      setSpeaking(false);
      setExpression('happy');
    }
  };

  // ── Send text message ─────────────────────────────────────────────────────
  const sendTextMessage = async () => {
    const text = inputText.trim();
    if (!text || processing) return;
    setInputText('');
    addMessage('user', text);
    setProcessing(true);
    setExpression('thinking');

    const systemPrompt = buildSystemPrompt(
      character.name, character.personality, subject,
      classGroup.fullName, user?.preferred_language || 'none'
    );
    try {
      const res  = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id:         user?.user_id || 'guest',
          message:         text,
          character:       charId,
          conversation_id: convId,
          system_prompt:   systemPrompt,
        }),
      });
      const data = await res.json();
      if (data.conversation_id) setConvId(data.conversation_id);
      addMessage('assistant', data.response || data.response_text || '...');
      setExpression(detectExpression(data.response || data.response_text || ''));
    } catch {
      addMessage('assistant', `Oops! Let's try again 😅`);
      setExpression('confused');
    } finally {
      setProcessing(false);
    }
  };

  const handleMicPress = () => {
    if (listening)       stopRecording();
    else if (speaking)   stopSound();
    else                 startRecording();
  };

  const subjectColor  = SUBJECTS.find(s => s.id === subject)?.color || '#667EEA';
  const limitReached  = usage && !usage.is_unlimited && usage.remaining_seconds <= 0;

  return (
    <View style={styles.container}>

      {/* ── Header ── */}
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerName}>{character.name}</Text>
          <Text style={styles.headerSub}>
            {classGroup.emoji} {classGroup.label} · {SUBJECTS.find(s=>s.id===subject)?.emoji} {SUBJECTS.find(s=>s.id===subject)?.label}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/settings')} style={styles.headerBtn}>
          <Ionicons name="settings-outline" size={20} color="#94A3B8" />
        </TouchableOpacity>
      </LinearGradient>

      {/* ── Daily usage bar ── */}
      <UsageBar usage={usage} subjectColor={subjectColor} />

      {/* ── Subject Tabs ── */}
      <View style={styles.subjectBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subjectScroll}>
          {SUBJECTS.map(s => (
            <TouchableOpacity key={s.id}
              style={[styles.subTab, subject === s.id && { backgroundColor: s.color }]}
              onPress={() => { setSubject(s.id); setExpression('happy'); }}>
              <Text style={styles.subTabEmoji}>{s.emoji}</Text>
              <Text style={[styles.subTabLabel, subject === s.id && { color: '#fff' }]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Character Stage ── */}
      <View style={[styles.stage, { backgroundColor: subjectColor + '18' }]}>
        <AnimatedCharacter
          character={charId as any}
          expression={limitReached ? 'confused' : expression}
          size={130} />
        {processing && (
          <View style={styles.statusBubble}>
            <Text style={styles.statusText}>
              {expression === 'thinking' ? '🤔 Thinking...' : '🎙️ Listening...'}
            </Text>
          </View>
        )}
        {listening && !processing && (
          <View style={[styles.listeningRing, { borderColor: subjectColor }]}>
            <Text style={styles.statusText}>🎙️ Listening...</Text>
          </View>
        )}
        {speaking && (
          <View style={[styles.speakingPill, { backgroundColor: subjectColor }]}>
            <Text style={styles.speakingText}>🔊 Speaking</Text>
          </View>
        )}
      </View>

      {/* ── Messages ── */}
      <ScrollView ref={scrollRef} style={styles.messages}
        contentContainerStyle={styles.messagesContent} showsVerticalScrollIndicator={false}>
        {messages.map(msg => (
          <View key={msg.id} style={[styles.bubble,
            msg.role === 'user' ? styles.userBubble : styles.botBubble]}>
            {msg.role === 'assistant' && (
              <Text style={styles.botName}>{character.name} {character.emoji}</Text>
            )}
            <Text style={[styles.bubbleText, msg.role === 'user' && styles.userBubbleText]}>
              {msg.content}
            </Text>
          </View>
        ))}
        {processing && (
          <View style={styles.botBubble}>
            <Text style={styles.typingDots}>● ● ●</Text>
          </View>
        )}
      </ScrollView>

      {/* ── Limit reached banner ── */}
      {limitReached && (
        <View style={styles.limitBanner}>
          <Text style={styles.limitBannerText}>
            ⏰ Voice limit reached for today. Text chat is unlimited! 👇
          </Text>
        </View>
      )}

      {/* ── Input Row ── */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={limitReached ? `Type to ${character.name}... (unlimited)` : `Ask ${character.name} anything...`}
            placeholderTextColor="#64748B"
            onSubmitEditing={sendTextMessage}
            returnKeyType="send" />
          {inputText.length > 0 ? (
            <TouchableOpacity style={[styles.sendBtn, { backgroundColor: subjectColor }]} onPress={sendTextMessage}>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.micBtn,
                listening && styles.micActive,
                speaking  && styles.micSpeaking,
                limitReached && styles.micDisabled,
              ]}
              onPress={handleMicPress}
              disabled={!!limitReached && !listening && !speaking}>
              <Ionicons
                name={listening ? 'stop' : speaking ? 'volume-high' : 'mic'}
                size={24}
                color={listening || speaking ? '#fff' : limitReached ? '#475569' : '#1E293B'} />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#0F172A' },
  header:        { flexDirection: 'row', alignItems: 'center', paddingTop: 52, paddingBottom: 12, paddingHorizontal: 14 },
  headerBtn:     { padding: 6 },
  headerCenter:  { flex: 1, alignItems: 'center' },
  headerName:    { fontSize: 17, fontWeight: '700', color: '#F8FAFC' },
  headerSub:     { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  subjectBar:    { backgroundColor: '#1E293B', paddingVertical: 8 },
  subjectScroll: { paddingHorizontal: 12, gap: 8 },
  subTab:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#334155', gap: 5 },
  subTabEmoji:   { fontSize: 13 },
  subTabLabel:   { fontSize: 12, fontWeight: '600', color: '#94A3B8' },
  stage:         { alignItems: 'center', paddingVertical: 12, gap: 6, minHeight: 170 },
  statusBubble:  { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  statusText:    { color: '#CBD5E1', fontSize: 13 },
  listeningRing: { borderWidth: 2, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  speakingPill:  { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  speakingText:  { color: '#fff', fontSize: 13, fontWeight: '600' },
  messages:      { flex: 1, backgroundColor: '#1E293B' },
  messagesContent: { padding: 12, gap: 8 },
  bubble:        { maxWidth: '82%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  botBubble:     { backgroundColor: '#334155', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  userBubble:    { backgroundColor: '#667EEA', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  botName:       { fontSize: 11, fontWeight: '600', color: '#94A3B8', marginBottom: 4 },
  bubbleText:    { fontSize: 14, color: '#E2E8F0', lineHeight: 20 },
  userBubbleText:{ color: '#fff' },
  typingDots:    { color: '#94A3B8', fontSize: 18, letterSpacing: 4 },
  limitBanner:   { backgroundColor: '#1E3A5F', paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 0.5, borderTopColor: '#334155' },
  limitBannerText: { color: '#93C5FD', fontSize: 12, textAlign: 'center' },
  inputRow:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', paddingHorizontal: 12, paddingVertical: 10, paddingBottom: Platform.OS === 'ios' ? 24 : 10, gap: 8, borderTopWidth: 0.5, borderTopColor: '#334155' },
  textInput:     { flex: 1, backgroundColor: '#334155', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, color: '#F8FAFC', fontSize: 14 },
  sendBtn:       { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  micBtn:        { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  micActive:     { backgroundColor: '#EF4444' },
  micSpeaking:   { backgroundColor: '#F97316' },
  micDisabled:   { backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155' },
});
