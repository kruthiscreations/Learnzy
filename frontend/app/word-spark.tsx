/**
 * Word Spark — Daily vocabulary conversation
 * One word per day, introduced by your AI buddy,
 * explained through story, and practiced in conversation.
 */
import React, { useState, useEffect, useRef } from 'react';
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

// ── Types ─────────────────────────────────────────────────────────────────────
interface WordData {
  day: number;
  word: string;
  type: string;
  pron: string;
  class_groups: string[];
  ms: string;     // meaning simple
  ma: string;     // meaning advanced
  es: string;     // example simple
  ea: string;     // example advanced
  story: string;
  opener: string;
  ct: string;     // conversation type
}

interface Message {
  role: 'buddy' | 'user';
  text: string;
}

const CONV_TYPE_LABELS: Record<string, string> = {
  story_mode:     '📖 Story Mode',
  word_detective: '🕵️ Word Detective',
  act_it_out:     '🎭 Act It Out',
  opposite_game:  '🔄 Opposite Game',
  real_life:      '🌍 Real Life',
  make_sentence:  '🖊️ Make a Sentence',
  feelings:       '❤️ Feelings',
};

// ── Star celebration ──────────────────────────────────────────────────────────
function StarBurst({ stars }: { stars: number }) {
  const scale = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 5 }).start();
  }, []);
  return (
    <Animated.View style={[ss.starBurst, { transform: [{ scale }] }]}>
      <Text style={ss.starBurstText}>
        {Array.from({ length: stars }).map(() => '⭐').join('')}
      </Text>
      <Text style={ss.starBurstLabel}>+{stars} stars earned!</Text>
    </Animated.View>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function WordSparkScreen() {
  const router    = useRouter();
  const { user }  = useAppStore();
  const classId   = user?.current_class || 'class1';
  const charId    = (user?.selected_character as CharacterId) || 'cat';
  const character = CHARACTERS[charId] || CHARACTERS.cat;

  const [wordData,    setWordData]    = useState<WordData | null>(null);
  const [messages,    setMessages]    = useState<Message[]>([]);
  const [input,       setInput]       = useState('');
  const [loading,     setLoading]     = useState(true);
  const [sending,     setSending]     = useState(false);
  const [expression,  setExpression]  = useState<Expression>('happy');
  const [phase,       setPhase]       = useState<'intro'|'chat'|'done'>('intro');
  const [stars,       setStars]       = useState(0);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(false);

  const scrollRef   = useRef<ScrollView>(null);
  const inputRef    = useRef<TextInput>(null);
  const soundRef    = useRef<Audio.Sound | null>(null);
  const bounceAnim  = useRef(new Animated.Value(1)).current;

  const bounce = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 1.12, duration: 180, useNativeDriver: true }),
      Animated.timing(bounceAnim, { toValue: 1,    duration: 180, useNativeDriver: true }),
    ]).start();
  };

  // Load today's word
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API_URL}/api/word-spark/${classId}`);
        const data = await res.json();
        if (data.success) {
          setWordData(data.word);
          // Check progress
          const prog = await fetch(`${API_URL}/api/word-spark/progress/${user?.user_id}`);
          const pd   = await prog.json();
          const today = new Date().toISOString().split('T')[0];
          const done  = pd.history?.some((h: any) => h.date === today && h.word === data.word.word);
          setAlreadyDone(done);
          if (done) {
            setPhase('done');
            setStars(3);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [classId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  // Play TTS for a buddy message
  const speakText = async (text: string) => {
    try {
      setPlayingAudio(true);
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      const res = await fetch(`${API_URL}/api/tts/speak-base64`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'nova' }),
      });
      const { audio_base64 } = await res.json();
      if (!audio_base64) return;
      const uri = FileSystem.cacheDirectory + 'ws_tts.mp3';
      await FileSystem.writeAsStringAsync(uri, audio_base64, { encoding: FileSystem.EncodingType.Base64 });
      const { sound } = await Audio.Sound.createAsync({ uri });
      soundRef.current = sound;
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate(s => { if (s.isLoaded && s.didJustFinish) setPlayingAudio(false); });
    } catch {
      setPlayingAudio(false);
    }
  };

  const addMessage = (role: 'buddy' | 'user', text: string) => {
    setMessages(prev => [...prev, { role, text }]);
    if (role === 'buddy') {
      setExpression('speaking');
      bounce();
      speakText(text);
    }
  };

  // Start conversation
  const startChat = async () => {
    if (!wordData) return;
    setPhase('chat');
    setExpression('excited');
    addMessage('buddy', wordData.opener);
  };

  // Send user message to AI
  const sendMessage = async () => {
    if (!input.trim() || sending || !wordData) return;
    const userText = input.trim();
    setInput('');
    addMessage('user', userText);
    setSending(true);
    setExpression('thinking');

    try {
      const systemPrompt = `You are ${character.name}, a friendly AI buddy for Indian children learning English. 
Today's Word Spark is: "${wordData.word}" (${wordData.type}).
Simple meaning: ${wordData.ms}
Advanced meaning: ${wordData.ma}
Example: ${wordData.es}
Story starter: ${wordData.story}
Conversation type: ${wordData.ct}

Your role:
- Keep responses SHORT (2-3 sentences max for young kids)
- Be enthusiastic, warm, use emojis occasionally
- Guide the child to USE the word in a sentence
- If they use the word correctly, CELEBRATE loudly and say "SENTENCE COMPLETE! Well done!"
- If they ask unrelated questions, gently redirect: "Great question! Let's stay with our Word Spark for now..."
- After the child successfully uses the word, say: "WORD SPARK COMPLETE! You have mastered today's word! 🌟"
- Adapt to the child's class level: ${classId}`;

      const history = messages.map(m => ({ role: m.role === 'buddy' ? 'assistant' : 'user', content: m.text }));
      history.push({ role: 'user', content: userText });

      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.user_id,
          character_id: charId,
          message: userText,
          system_prompt: systemPrompt,
          conversation_history: history,
        }),
      });
      const data = await res.json();
      const reply = data.response || data.message || "Keep going — you are doing great!";

      addMessage('buddy', reply);
      setExpression('happy');

      // Check if word spark is complete
      if (reply.includes('WORD SPARK COMPLETE') || reply.includes('mastered today')) {
        setTimeout(() => completeWordSpark(userText), 1000);
      }
    } catch {
      addMessage('buddy', "Hmm, I had a little hiccup! Try again?");
      setExpression('confused');
    } finally {
      setSending(false);
    }
  };

  const completeWordSpark = async (sentence: string) => {
    try {
      const res = await fetch(`${API_URL}/api/word-spark/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.user_id,
          word: wordData?.word,
          class_id: classId,
          sentence_made: sentence,
        }),
      });
      const data = await res.json();
      setStars(data.stars_earned || 3);
      setPhase('done');
      bounce();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <View style={ss.loadWrap}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={ss.loadText}>Loading today's Word Spark...</Text>
      </View>
    );
  }

  if (!wordData) {
    return (
      <View style={ss.loadWrap}>
        <Text style={ss.loadText}>No word available. Please try again later.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={ss.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <LinearGradient colors={['#312E81', '#6366F1']} style={ss.header}>
        <TouchableOpacity onPress={() => router.back()} style={ss.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={ss.headerMid}>
          <Text style={ss.headerTitle}>✨ Word Spark</Text>
          <Text style={ss.headerSub}>Daily Vocabulary</Text>
        </View>
        <View style={ss.headerRight}>
          {playingAudio && <Ionicons name="volume-high" size={18} color="#A5B4FC" />}
        </View>
      </LinearGradient>

      <ScrollView
        ref={scrollRef}
        style={ss.scroll}
        contentContainerStyle={ss.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Word card — always visible at top */}
        <LinearGradient colors={['#6366F1', '#8B5CF6']} style={ss.wordCard}>
          <Text style={ss.wordCardLabel}>TODAY'S WORD · DAY {wordData.day}</Text>
          <Text style={ss.wordCardWord}>{wordData.word}</Text>
          <Text style={ss.wordCardType}>{wordData.type} · /{wordData.pron}/</Text>
          <Text style={ss.wordCardMeaning}>{wordData.ms}</Text>
          <Text style={ss.wordCardExample}>"{wordData.es}"</Text>
          {wordData.ct && (
            <View style={ss.convTypeBadge}>
              <Text style={ss.convTypeText}>{CONV_TYPE_LABELS[wordData.ct] || wordData.ct}</Text>
            </View>
          )}
        </LinearGradient>

        {/* INTRO phase */}
        {phase === 'intro' && (
          <View style={ss.introWrap}>
            <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
              <AnimatedCharacter character={charId as any} expression="excited" size={120} />
            </Animated.View>
            <Text style={ss.introGreet}>
              Hi {user?.name}! Ready for today's Word Spark? 🌟
            </Text>
            <Text style={ss.introHint}>
              Learn the word, use it in a sentence, and earn 3 stars!
            </Text>
            <TouchableOpacity style={ss.startBtn} onPress={startChat}>
              <LinearGradient colors={['#6366F1', '#8B5CF6']} style={ss.startBtnGrad}>
                <Text style={ss.startBtnText}>Let's Spark! ✨</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* CHAT phase */}
        {phase === 'chat' && (
          <View style={ss.chatWrap}>
            {/* Character */}
            <View style={ss.charRow}>
              <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
                <AnimatedCharacter character={charId as any} expression={expression} size={80} />
              </Animated.View>
              <Text style={ss.charName}>{character.name}</Text>
            </View>

            {/* Messages */}
            {messages.map((msg, i) => (
              <View
                key={i}
                style={[
                  ss.bubble,
                  msg.role === 'buddy' ? ss.buddyBubble : ss.userBubble,
                ]}
              >
                <Text style={msg.role === 'buddy' ? ss.buddyText : ss.userText}>
                  {msg.text}
                </Text>
              </View>
            ))}

            {sending && (
              <View style={ss.typingWrap}>
                <ActivityIndicator size="small" color="#6366F1" />
                <Text style={ss.typingText}>{character.name} is thinking...</Text>
              </View>
            )}
          </View>
        )}

        {/* DONE phase */}
        {phase === 'done' && (
          <View style={ss.doneWrap}>
            <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
              <AnimatedCharacter character={charId as any} expression="proud" size={120} />
            </Animated.View>
            <StarBurst stars={stars} />
            <Text style={ss.doneTitle}>
              {alreadyDone ? 'Already completed today!' : 'Word Spark Complete! 🎉'}
            </Text>
            <Text style={ss.doneWord}>You learned: {wordData.word}</Text>
            <Text style={ss.doneMeaning}>{wordData.ma}</Text>
            <TouchableOpacity style={ss.doneBtn} onPress={() => router.back()}>
              <Text style={ss.doneBtnText}>Back to Home 🏠</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Input bar — only in chat phase */}
      {phase === 'chat' && (
        <View style={ss.inputBar}>
          <TextInput
            ref={inputRef}
            style={ss.input}
            value={input}
            onChangeText={setInput}
            placeholder={`Talk to ${character.name}...`}
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={200}
            returnKeyType="send"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={[ss.sendBtn, (!input.trim() || sending) && ss.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!input.trim() || sending}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const ss = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#F3F4F6' },
  loadWrap:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadText:      { fontSize: 14, color: '#6B7280' },
  header:        { flexDirection: 'row', alignItems: 'center', paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16 },
  backBtn:       { padding: 6 },
  headerMid:     { flex: 1, alignItems: 'center' },
  headerTitle:   { fontSize: 18, fontWeight: '700', color: '#fff' },
  headerSub:     { fontSize: 11, color: '#A5B4FC' },
  headerRight:   { width: 36, alignItems: 'flex-end' },
  scroll:        { flex: 1 },
  scrollContent: { padding: 16 },
  // Word card
  wordCard:      { borderRadius: 18, padding: 20, marginBottom: 16 },
  wordCardLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: 1, marginBottom: 4 },
  wordCardWord:  { fontSize: 36, fontWeight: '700', color: '#fff', marginBottom: 2 },
  wordCardType:  { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 10 },
  wordCardMeaning:{ fontSize: 15, color: '#fff', lineHeight: 22, marginBottom: 8 },
  wordCardExample:{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', marginBottom: 10 },
  convTypeBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, alignSelf: 'flex-start' },
  convTypeText:  { fontSize: 12, color: '#fff', fontWeight: '500' },
  // Intro
  introWrap:     { alignItems: 'center', paddingTop: 8, gap: 12 },
  introGreet:    { fontSize: 18, fontWeight: '600', color: '#1F2937', textAlign: 'center' },
  introHint:     { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  startBtn:      { borderRadius: 14, overflow: 'hidden', marginTop: 8, width: '80%' },
  startBtnGrad:  { padding: 16, alignItems: 'center' },
  startBtnText:  { fontSize: 17, fontWeight: '700', color: '#fff' },
  // Chat
  chatWrap:      { gap: 8 },
  charRow:       { alignItems: 'center', marginBottom: 4, gap: 4 },
  charName:      { fontSize: 12, color: '#6B7280' },
  bubble:        { maxWidth: '82%', borderRadius: 18, padding: 12, marginBottom: 4 },
  buddyBubble:   { backgroundColor: '#fff', alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 0.5, borderColor: '#E5E7EB' },
  userBubble:    { backgroundColor: '#6366F1', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  buddyText:     { fontSize: 14, color: '#1F2937', lineHeight: 21 },
  userText:      { fontSize: 14, color: '#fff', lineHeight: 21 },
  typingWrap:    { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 4 },
  typingText:    { fontSize: 12, color: '#9CA3AF' },
  // Done
  doneWrap:      { alignItems: 'center', gap: 12, paddingTop: 8 },
  doneTitle:     { fontSize: 20, fontWeight: '700', color: '#1F2937', textAlign: 'center' },
  doneWord:      { fontSize: 16, fontWeight: '600', color: '#6366F1' },
  doneMeaning:   { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  doneBtn:       { backgroundColor: '#6366F1', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, marginTop: 8 },
  doneBtnText:   { fontSize: 16, fontWeight: '700', color: '#fff' },
  // Star burst
  starBurst:     { alignItems: 'center', gap: 4, backgroundColor: '#ECFDF5', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#6EE7B7', width: '90%' },
  starBurstText: { fontSize: 32 },
  starBurstLabel:{ fontSize: 16, fontWeight: '700', color: '#065F46' },
  // Input
  inputBar:      { flexDirection: 'row', alignItems: 'flex-end', padding: 12, gap: 8, backgroundColor: '#fff', borderTopWidth: 0.5, borderTopColor: '#E5E7EB' },
  input:         { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#111827', maxHeight: 80 },
  sendBtn:       { backgroundColor: '#6366F1', width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled:{ opacity: 0.4 },
});
