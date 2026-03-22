/**
 * Let's Talk Today
 * Buddy raises a fresh topic every day.
 * Conversation flows naturally with voice + text.
 * Time-limited by the existing 10-min daily voice limit.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Animated, TextInput, KeyboardAvoidingView,
  Platform, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useAppStore } from '../store/appStore';
import { CHARACTERS, CharacterId } from '../constants/AppData';
import AnimatedCharacter, { Expression } from '../components/AnimatedCharacter';
import { API_URL } from '../utils/api';

const { width } = Dimensions.get('window');

interface Topic {
  day: number;
  theme: string;
  emoji: string;
  title: string;
  starter: string;
  followups: string[];
  class_groups: string[];
}

interface Message { role: 'buddy' | 'user'; text: string; }

// ── Timer display ─────────────────────────────────────────────────────────────
function TimerBar({ elapsed, limit }: { elapsed: number; limit: number }) {
  const pct  = Math.min((elapsed / limit) * 100, 100);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const rem  = limit - elapsed;
  const color = pct > 80 ? '#EF4444' : pct > 50 ? '#F59E0B' : '#10B981';
  return (
    <View style={tb.wrap}>
      <Text style={tb.time}>{mins}:{String(secs).padStart(2,'0')}</Text>
      <View style={tb.bar}>
        <View style={[tb.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <Text style={[tb.rem, { color }]}>
        {rem > 0 ? `${Math.floor(rem/60)}m ${rem%60}s left` : 'Time up!'}
      </Text>
    </View>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DailyTalkScreen() {
  const router    = useRouter();
  const { user }  = useAppStore();
  const classId   = user?.current_class || 'class3';
  const charId    = (user?.selected_character as CharacterId) || 'cat';
  const character = CHARACTERS[charId] || CHARACTERS.cat;

  const [topic,       setTopic]       = useState<Topic | null>(null);
  const [messages,    setMessages]    = useState<Message[]>([]);
  const [input,       setInput]       = useState('');
  const [phase,       setPhase]       = useState<'intro' | 'chat' | 'done'>('intro');
  const [loading,     setLoading]     = useState(true);
  const [sending,     setSending]     = useState(false);
  const [recording,   setRecording]   = useState(false);
  const [expression,  setExpression]  = useState<Expression>('excited');
  const [elapsed,     setElapsed]     = useState(0);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);
  const [followupIdx, setFollowupIdx] = useState(0);
  const [voiceUsage,  setVoiceUsage]  = useState<any>(null);

  const TALK_LIMIT   = 5 * 60; // 5 minutes per session
  const scrollRef    = useRef<ScrollView>(null);
  const timerRef     = useRef<any>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef     = useRef<Audio.Sound | null>(null);
  const sessionStart = useRef<number>(0);
  const bounceAnim   = useRef(new Animated.Value(1)).current;

  const bounce = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 1.12, duration: 180, useNativeDriver: true }),
      Animated.timing(bounceAnim, { toValue: 1,    duration: 180, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    (async () => {
      try {
        const [tRes, vRes] = await Promise.all([
          fetch(`${API_URL}/api/daily-talk/${classId}`),
          fetch(`${API_URL}/api/voice-usage/${user?.user_id}`),
        ]);
        const [td, vd] = await Promise.all([tRes.json(), vRes.json()]);
        if (td.success) setTopic(td.topic);
        if (vd) setVoiceUsage(vd);
        // Check if done today
        const prog = await fetch(`${API_URL}/api/progress/${user?.user_id}`);
        // (We use a simple check from daily_talk_progress via completed marker)
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      soundRef.current?.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (phase === 'chat' && !alreadyDone) {
      sessionStart.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - sessionStart.current) / 1000));
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  useEffect(() => {
    if (elapsed >= TALK_LIMIT && phase === 'chat') wrapUp();
  }, [elapsed]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const speakText = async (text: string) => {
    try {
      if (soundRef.current) { await soundRef.current.unloadAsync(); soundRef.current = null; }
      const res = await fetch(`${API_URL}/api/tts/speak-base64`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'nova' }),
      });
      const { audio_base64 } = await res.json();
      if (!audio_base64) return;
      const uri = FileSystem.cacheDirectory + 'dt_tts.mp3';
      await FileSystem.writeAsStringAsync(uri, audio_base64, { encoding: FileSystem.EncodingType.Base64 });
      const { sound } = await Audio.Sound.createAsync({ uri });
      soundRef.current = sound;
      await sound.playAsync();
    } catch (e) { console.error(e); }
  };

  const addBuddy = (text: string) => {
    setMessages(p => [...p, { role: 'buddy', text }]);
    setExpression('speaking');
    bounce();
    speakText(text);
    setTimeout(() => setExpression('happy'), 2000);
  };

  const startChat = () => {
    if (!topic) return;
    setPhase('chat');
    setTimeout(() => addBuddy(topic.starter), 400);
  };

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || sending) return;
    setInput('');
    setMessages(p => [...p, { role: 'user', text: msg }]);
    setSending(true);
    setExpression('thinking');
    try {
      const followup = topic?.followups?.[followupIdx] || '';
      const systemPrompt = `You are ${character.name}, a warm friendly AI companion for an Indian child aged 3-12.
Today's conversation topic: "${topic?.theme}" — "${topic?.title}"
Original starter: "${topic?.starter}"
${followup ? `Suggested next question to naturally ask: "${followup}"` : ''}

RULES:
- Keep each response to 2-3 sentences MAXIMUM (this is voice conversation, keep it short!)
- Be warm, enthusiastic, curious — like a caring older friend
- Always end with ONE follow-up question to keep conversation flowing
- Use the suggested follow-up question naturally when appropriate, then move to the next
- If the child goes off-topic, gently bring back: "That's interesting! Going back to our topic..."
- Celebrate interesting answers: "Oh wow, that's a great answer!"
- NEVER correct grammar harshly — mirror back the correct version naturally
- If child seems done: say "That was such a good conversation! You've got 30 more seconds — anything else?"
- Class level: ${classId}
- Keep it age-appropriate, warm, and fun`;

      const history = messages.map(m => ({ role: m.role === 'buddy' ? 'assistant' : 'user', content: m.text }));
      history.push({ role: 'user', content: msg });

      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.user_id, character_id: charId,
          message: msg, system_prompt: systemPrompt,
          conversation_history: history,
        }),
      });
      const data = await res.json();
      addBuddy(data.response || data.message || "Tell me more!");
      setFollowupIdx(i => Math.min(i + 1, (topic?.followups?.length || 1) - 1));
    } catch { addBuddy("Hmm, I had a tiny hiccup! Keep going though — what were you saying?"); }
    finally { setSending(false); }
  };

  const startVoice = async () => {
    if (voiceUsage?.percent_used >= 100) {
      addBuddy("Your voice time for today is used up — but type to me and we'll keep going! 😊");
      return;
    }
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setRecording(true);
      setExpression('thinking');
    } catch (e) { console.error(e); }
  };

  const stopVoice = async () => {
    if (!recordingRef.current) return;
    setRecording(false);
    setSending(true);
    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      if (!uri) return;

      const formData = new FormData();
      formData.append('audio', { uri, type: 'audio/m4a', name: 'voice.m4a' } as any);
      formData.append('user_id', user?.user_id || '');
      formData.append('character_id', charId);
      formData.append('subject', 'conversation');
      formData.append('system_prompt', `You are ${character.name}. Topic today: "${topic?.theme}". Keep response 2-3 sentences. Ask ONE follow-up question. Warm, friendly, curious.`);
      formData.append('class_id', classId);

      const res = await fetch(`${API_URL}/api/voice-chat`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.transcript) setMessages(p => [...p, { role: 'user', text: data.transcript }]);
      if (data.message) addBuddy(data.message);
      if (data.usage) setVoiceUsage(data.usage);
      setFollowupIdx(i => Math.min(i + 1, (topic?.followups?.length || 1) - 1));
    } catch { addBuddy("I couldn't hear that clearly — try typing instead!"); }
    finally { setSending(false); setExpression('happy'); }
  };

  const wrapUp = useCallback(async () => {
    if (phase !== 'chat') return;
    clearInterval(timerRef.current);
    setPhase('done');
    setExpression('proud');
    bounce();
    const duration = Math.floor((Date.now() - sessionStart.current) / 1000);
    try {
      const res = await fetch(`${API_URL}/api/daily-talk/complete`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.user_id, topic_theme: topic?.theme, duration_seconds: duration }),
      });
      const data = await res.json();
      setStarsEarned(data.stars_earned || 0);
    } catch (e) { console.error(e); }
  }, [phase, topic]);

  const remainingVoice = voiceUsage ? Math.max(0, voiceUsage.remaining_seconds) : 600;
  const voiceLimitHit  = voiceUsage && voiceUsage.percent_used >= 100;

  if (loading) return (
    <View style={s.center}>
      <AnimatedCharacter character={charId as any} expression="happy" size={90} />
      <ActivityIndicator color="#EC4899" size="large" style={{ marginTop: 12 }} />
    </View>
  );

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

      {/* Header */}
      <LinearGradient colors={['#BE185D', '#EC4899']} style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={s.headerMid}>
          <Text style={s.headerTitle}>💬 Let's Talk Today!</Text>
          {topic && <Text style={s.headerSub}>{topic.emoji} {topic.theme}</Text>}
        </View>
        <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
          <AnimatedCharacter character={charId as any} expression={expression} size={46} />
        </Animated.View>
      </LinearGradient>

      {/* Timer — only in chat phase */}
      {phase === 'chat' && (
        <TimerBar elapsed={elapsed} limit={TALK_LIMIT} />
      )}

      <ScrollView
        ref={scrollRef}
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* ── INTRO ── */}
        {phase === 'intro' && topic && (
          <View style={s.introWrap}>
            <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
              <AnimatedCharacter character={charId as any} expression="excited" size={120} />
            </Animated.View>

            {/* Topic card */}
            <LinearGradient colors={['#BE185D','#EC4899']} style={s.topicCard}>
              <Text style={s.topicCardDay}>DAY {topic.day} CONVERSATION</Text>
              <Text style={s.topicCardEmoji}>{topic.emoji}</Text>
              <Text style={s.topicCardTitle}>{topic.title}</Text>
              <Text style={s.topicCardTheme}>{topic.theme}</Text>
            </LinearGradient>

            {/* How it works */}
            <View style={s.howBox}>
              <Text style={s.howTitle}>How it works</Text>
              <Text style={s.howItem}>💬  {character.name} raises a topic and asks you questions</Text>
              <Text style={s.howItem}>🎙️  Talk by voice — or type if you prefer</Text>
              <Text style={s.howItem}>⏱️  5 minutes of great conversation</Text>
              <Text style={s.howItem}>⭐  Earn up to 3 stars based on how long you chat</Text>
              {voiceLimitHit && (
                <Text style={[s.howItem, { color: '#DC2626' }]}>
                  ⚠️ Voice limit reached for today — text chat still works!
                </Text>
              )}
            </View>

            <TouchableOpacity style={s.startBtn} onPress={startChat} activeOpacity={0.88}>
              <LinearGradient colors={['#BE185D','#EC4899']} style={s.startBtnGrad}>
                <Text style={s.startBtnTxt}>Start Talking! 💬</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* ── CHAT ── */}
        {phase === 'chat' && (
          <View style={s.chatWrap}>
            <View style={s.charRow}>
              <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
                <AnimatedCharacter character={charId as any} expression={expression} size={72} />
              </Animated.View>
              <Text style={s.charName}>{character.name}</Text>
            </View>

            {messages.map((msg, i) => (
              <View key={i} style={[s.bubble, msg.role === 'buddy' ? s.buddyBubble : s.userBubble]}>
                <Text style={msg.role === 'buddy' ? s.buddyText : s.userText}>{msg.text}</Text>
              </View>
            ))}

            {sending && (
              <View style={s.typingWrap}>
                <ActivityIndicator size="small" color="#EC4899" />
                <Text style={s.typingText}>{character.name} is thinking...</Text>
              </View>
            )}

            {/* Suggested follow-up nudge */}
            {!sending && messages.length > 0 && messages.length % 4 === 0 && topic?.followups?.[followupIdx] && (
              <View style={s.nudgeBox}>
                <Text style={s.nudgeText}>💡 Try answering: "{topic.followups[followupIdx]}"</Text>
              </View>
            )}

            <TouchableOpacity style={s.wrapUpBtn} onPress={wrapUp}>
              <Text style={s.wrapUpBtnTxt}>Finish conversation ✓</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── DONE ── */}
        {phase === 'done' && (
          <View style={s.doneWrap}>
            <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
              <AnimatedCharacter character={charId as any} expression="proud" size={120} />
            </Animated.View>

            <View style={s.doneCard}>
              <Text style={s.doneEmoji}>🎉</Text>
              <Text style={s.doneTitle}>Great conversation, {user?.name}!</Text>
              <View style={s.starsRow}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Text key={i} style={{ fontSize: 28, opacity: i < starsEarned ? 1 : 0.2 }}>⭐</Text>
                ))}
              </View>
              <Text style={s.doneSub}>
                {elapsed >= 120 ? `You talked for ${Math.floor(elapsed/60)} minutes ${elapsed%60} seconds — amazing!` :
                 elapsed >= 60  ? 'Good start! Try to go a bit longer tomorrow!' :
                 'Every conversation counts — come back tomorrow!'}
              </Text>
            </View>

            {/* Replay last buddy message */}
            {messages.filter(m => m.role === 'buddy').length > 0 && (
              <View style={s.lastMsgBox}>
                <Text style={s.lastMsgLabel}>{character.name}'s last thought:</Text>
                <Text style={s.lastMsgText}>
                  {messages.filter(m => m.role === 'buddy').slice(-1)[0].text}
                </Text>
              </View>
            )}

            <Text style={s.tomorrowHint}>
              Come back tomorrow for a brand new topic! 🌅
            </Text>

            <TouchableOpacity style={s.homeBtn} onPress={() => router.back()}>
              <Text style={s.homeBtnTxt}>Back to Home 🏠</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Input bar — only in chat phase */}
      {phase === 'chat' && (
        <View style={s.inputBar}>
          {/* Voice button */}
          {!voiceLimitHit && (
            <TouchableOpacity
              style={[s.micBtn, recording && s.micBtnActive]}
              onPressIn={startVoice}
              onPressOut={stopVoice}
              disabled={sending}
            >
              <Ionicons name={recording ? 'mic' : 'mic-outline'} size={22} color={recording ? '#fff' : '#EC4899'} />
            </TouchableOpacity>
          )}

          {/* Text input */}
          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder={recording ? 'Listening...' : `Type to ${character.name}...`}
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={300}
            editable={!recording}
          />

          {/* Send button */}
          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() || sending || recording) && s.sendBtnOff]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || sending || recording}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

    </KeyboardAvoidingView>
  );
}

// ── Timer styles ──────────────────────────────────────────────────────────────
const tb = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB' },
  time:  { fontSize: 13, fontWeight: '600', color: '#374151', width: 40 },
  bar:   { flex: 1, height: 5, backgroundColor: '#F3F4F6', borderRadius: 10, overflow: 'hidden' },
  fill:  { height: '100%', borderRadius: 10 },
  rem:   { fontSize: 11, fontWeight: '500', width: 70, textAlign: 'right' },
});

// ── Main styles ───────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#FDF2F8' },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:       { flexDirection: 'row', alignItems: 'center', paddingTop: 52, paddingBottom: 12, paddingHorizontal: 14, gap: 10 },
  backBtn:      { padding: 6 },
  headerMid:    { flex: 1 },
  headerTitle:  { fontSize: 17, fontWeight: '700', color: '#fff' },
  headerSub:    { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  scroll:       { flex: 1 },
  scrollContent:{ padding: 16 },
  // Intro
  introWrap:    { alignItems: 'center', gap: 16 },
  topicCard:    { borderRadius: 18, padding: 20, width: '100%', alignItems: 'center' },
  topicCardDay: { fontSize: 10, color: 'rgba(255,255,255,0.65)', letterSpacing: 1, marginBottom: 6 },
  topicCardEmoji:{ fontSize: 44, marginBottom: 4 },
  topicCardTitle:{ fontSize: 18, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 2 },
  topicCardTheme:{ fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  howBox:       { backgroundColor: '#fff', borderRadius: 16, padding: 16, width: '100%', gap: 6, borderWidth: 0.5, borderColor: '#FBCFE8' },
  howTitle:     { fontSize: 14, fontWeight: '600', color: '#BE185D', marginBottom: 4 },
  howItem:      { fontSize: 13, color: '#374151', lineHeight: 20 },
  startBtn:     { width: '80%', borderRadius: 14, overflow: 'hidden' },
  startBtnGrad: { padding: 16, alignItems: 'center' },
  startBtnTxt:  { fontSize: 17, fontWeight: '700', color: '#fff' },
  // Chat
  chatWrap:     { gap: 8 },
  charRow:      { alignItems: 'center', gap: 4, marginBottom: 4 },
  charName:     { fontSize: 12, color: '#9CA3AF' },
  bubble:       { maxWidth: '83%', borderRadius: 18, padding: 12, marginBottom: 2 },
  buddyBubble:  { backgroundColor: '#fff', alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 0.5, borderColor: '#FBCFE8' },
  userBubble:   { backgroundColor: '#EC4899', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  buddyText:    { fontSize: 14, color: '#1F2937', lineHeight: 22 },
  userText:     { fontSize: 14, color: '#fff', lineHeight: 22 },
  typingWrap:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typingText:   { fontSize: 12, color: '#9CA3AF' },
  nudgeBox:     { backgroundColor: '#FDF2F8', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#FBCFE8' },
  nudgeText:    { fontSize: 12, color: '#BE185D', fontStyle: 'italic' },
  wrapUpBtn:    { alignSelf: 'center', marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#FBCFE8' },
  wrapUpBtnTxt: { fontSize: 13, color: '#BE185D', fontWeight: '500' },
  // Done
  doneWrap:     { alignItems: 'center', gap: 14 },
  doneCard:     { backgroundColor: '#fff', borderRadius: 18, padding: 20, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: '#FBCFE8' },
  doneEmoji:    { fontSize: 40, marginBottom: 6 },
  doneTitle:    { fontSize: 20, fontWeight: '700', color: '#BE185D', textAlign: 'center', marginBottom: 8 },
  starsRow:     { flexDirection: 'row', gap: 4, marginBottom: 8 },
  doneSub:      { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  lastMsgBox:   { backgroundColor: '#FDF2F8', borderRadius: 12, padding: 14, width: '100%', borderWidth: 1, borderColor: '#FBCFE8' },
  lastMsgLabel: { fontSize: 11, fontWeight: '600', color: '#BE185D', marginBottom: 4 },
  lastMsgText:  { fontSize: 13, color: '#374151', lineHeight: 20, fontStyle: 'italic' },
  tomorrowHint: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
  homeBtn:      { backgroundColor: '#EC4899', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32 },
  homeBtnTxt:   { fontSize: 16, fontWeight: '700', color: '#fff' },
  // Input
  inputBar:     { flexDirection: 'row', alignItems: 'flex-end', padding: 10, gap: 8, backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#FBCFE8' },
  micBtn:       { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#EC4899' },
  micBtnActive: { backgroundColor: '#EC4899' },
  input:        { flex: 1, backgroundColor: '#FDF2F8', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#111827', maxHeight: 80 },
  sendBtn:      { backgroundColor: '#EC4899', width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  sendBtnOff:   { opacity: 0.35 },
});
