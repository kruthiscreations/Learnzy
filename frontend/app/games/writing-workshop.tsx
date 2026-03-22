import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, PanResponder, Dimensions, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';
import { useAppStore } from '../../store/appStore';
import api from '../../utils/api';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');
const CANVAS_SIZE = width - 48;

// Tracing guides: letter + SVG path hint + start dot position
const TRACE_LETTERS = [
  { letter: 'A', emoji: '🍎', word: 'Apple', telugu: 'ఆపిల్', hint: 'Two lines going up and meeting at top, with a line across the middle', startDot: { x: 60, y: 160 } },
  { letter: 'B', emoji: '⚽', word: 'Ball', telugu: 'బంతి', hint: 'One straight line down, with two bumps on the right side', startDot: { x: 50, y: 40 } },
  { letter: 'C', emoji: '🐱', word: 'Cat', telugu: 'పిల్లి', hint: 'A curved line like a moon shape, open on the right', startDot: { x: 150, y: 60 } },
  { letter: 'D', emoji: '🐶', word: 'Dog', telugu: 'కుక్క', hint: 'A straight line down with a big bump on the right', startDot: { x: 50, y: 40 } },
  { letter: 'E', emoji: '🐘', word: 'Elephant', telugu: 'ఏనుగు', hint: 'A straight line down with three lines sticking out to the right', startDot: { x: 50, y: 40 } },
  { letter: 'M', emoji: '🥭', word: 'Mango', telugu: 'మామిడి', hint: 'Two tall lines with a V shape in the middle', startDot: { x: 40, y: 40 } },
  { letter: 'S', emoji: '☀️', word: 'Sun', telugu: 'సూర్యుడు', hint: 'Curved like a snake — first curve right, then curve left', startDot: { x: 150, y: 60 } },
  { letter: 'T', emoji: '🐯', word: 'Tiger', telugu: 'పులి', hint: 'One line across the top, one line straight down from the middle', startDot: { x: 50, y: 40 } },
];

// Copy sentences by level - FOR YOUNG KIDS (up to 6 years / LKG-1st only)
// Sentences are designed to be WRITTEN BY HAND, not typed
const COPY_SENTENCES = [
  { level: 'lkg-1st', sentences: [
    'I am happy.',
    'The cat is big.',
    'I love mango.',
    'Run and jump!',
    'My name is ___.',
    'A ball is round.',
    'I see a dog.',
    'The sun is hot.',
  ]},
];

// Handwriting prompts for young kids
const HANDWRITING_PROMPTS = [
  { prompt: 'Write your name:', emoji: '✍️', hint: 'Start with a capital letter!' },
  { prompt: 'Write the word CAT:', emoji: '🐱', hint: 'C - A - T' },
  { prompt: 'Write the word DOG:', emoji: '🐶', hint: 'D - O - G' },
  { prompt: 'Write the word SUN:', emoji: '☀️', hint: 'S - U - N' },
  { prompt: 'Write I LOVE MOM:', emoji: '❤️', hint: 'Use capital letters!' },
  { prompt: 'Write 1 2 3 4 5:', emoji: '🔢', hint: 'Numbers are fun!' },
];

type Phase = 'menu' | 'trace' | 'copy' | 'handwrite';

export default function WritingWorkshopScreen() {
  const router = useRouter();
  const { user } = useAppStore();
  const [phase, setPhase] = useState<Phase>('menu');
  const [letterIdx, setLetterIdx] = useState(0);
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [handwriteIdx, setHandwriteIdx] = useState(0);
  const [copyText, setCopyText] = useState('');
  const [copyDone, setCopyDone] = useState(false);
  const [handwriteDone, setHandwriteDone] = useState(false);
  const [score, setScore] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Drawing state for tracing
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState('');
  const [traceComplete, setTraceComplete] = useState(false);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      const { locationX, locationY } = e.nativeEvent;
      setCurrentPath(`M ${locationX} ${locationY}`);
    },
    onPanResponderMove: (e) => {
      const { locationX, locationY } = e.nativeEvent;
      setCurrentPath(prev => `${prev} L ${locationX} ${locationY}`);
    },
    onPanResponderRelease: () => {
      if (currentPath) {
        setPaths(prev => [...prev, currentPath]);
        setCurrentPath('');
      }
    },
  });

  const level = user?.current_level || 'lkg-1st';
  const sentences = COPY_SENTENCES[0].sentences; // Only for young kids
  const handwritePrompt = HANDWRITING_PROMPTS[handwriteIdx];

  const speakText = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      if (soundRef.current) { await soundRef.current.stopAsync(); await soundRef.current.unloadAsync(); }
      const response = await api.post('/tts/speak-base64', { text, voice: 'nova', speed: 0.8 });
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mp3;base64,${response.data.audio_base64}` },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate(s => { if (s.isLoaded && s.didJustFinish) setIsSpeaking(false); });
    } catch { setIsSpeaking(false); }
  };

  const clearTrace = () => { setPaths([]); setCurrentPath(''); setTraceComplete(false); };

  const nextLetter = () => {
    const next = (letterIdx + 1) % TRACE_LETTERS.length;
    setLetterIdx(next);
    clearTrace();
  };

  const checkCopy = () => {
    const target = sentences[sentenceIdx].replace(/___/g, '').replace(/[^a-zA-Z ]/g, '').toLowerCase().trim();
    const input = copyText.replace(/[^a-zA-Z ]/g, '').toLowerCase().trim();
    const correct = input.includes(target.slice(0, 8));
    if (correct) setScore(s => s + 10);
    setCopyDone(true);
  };

  const nextCopy = () => {
    setSentenceIdx(i => (i + 1) % sentences.length);
    setCopyText('');
    setCopyDone(false);
  };

  // Handwriting completion (finger traced on screen)
  const completeHandwrite = () => {
    if (paths.length > 0) {
      setScore(s => s + 15);
      setHandwriteDone(true);
      speakText("Great handwriting! You did it!");
    }
  };

  const nextHandwrite = () => {
    setHandwriteIdx(i => (i + 1) % HANDWRITING_PROMPTS.length);
    clearTrace();
    setHandwriteDone(false);
  };

  const letter = TRACE_LETTERS[letterIdx];
  const sentence = sentences[sentenceIdx];

  // MENU
  if (phase === 'menu') {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#F97316', '#EF4444']} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>✏️ Writing Workshop</Text>
          <Text style={styles.headerSubtitle}>Trace → Copy → Create!</Text>
        </LinearGradient>
        <ScrollView contentContainerStyle={styles.menuContent}>
          <Text style={styles.menuDesc}>Learn to write English by hand! ✍️</Text>
          <Text style={styles.ageNote}>For kids aged 3-6 years (LKG - 1st Std)</Text>

          {[
            { phase: 'trace' as Phase, emoji: '👆', title: 'Trace Letters', desc: 'Follow the guide and trace each letter with your finger', color: ['#F97316', '#EF4444'] as [string, string] },
            { phase: 'copy' as Phase, emoji: '📋', title: 'Copy Sentences', desc: 'Look at the sentence and write it on paper!', color: ['#8B5CF6', '#7C3AED'] as [string, string] },
            { phase: 'handwrite' as Phase, emoji: '✍️', title: 'Handwriting Practice', desc: 'Practice writing words with your finger on screen!', color: ['#10B981', '#059669'] as [string, string] },
          ].map(item => (
            <TouchableOpacity key={item.phase} style={styles.menuCard} onPress={() => setPhase(item.phase)}>
              <LinearGradient colors={item.color} style={styles.menuCardGradient}>
                <Text style={styles.menuCardEmoji}>{item.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuCardTitle}>{item.title}</Text>
                  <Text style={styles.menuCardDesc}>{item.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
              </LinearGradient>
            </TouchableOpacity>
          ))}

          <View style={styles.tipsBox}>
            <Text style={styles.tipsTitle}>✍️ Writing Tips</Text>
            <Text style={styles.tipsText}>• Hold the device steady with two hands{'\n'}• Trace slowly and carefully{'\n'}• Read the sentence aloud before copying{'\n'}• There are no mistakes — just practice!</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // TRACE phase
  if (phase === 'trace') {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#F97316', '#EF4444']} style={styles.header}>
          <TouchableOpacity onPress={() => setPhase('menu')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>👆 Trace the Letter</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBadge}><Text style={styles.statText}>{letterIdx + 1}/{TRACE_LETTERS.length}</Text></View>
            <View style={styles.statBadge}><Text style={styles.statText}>⭐ {score}</Text></View>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.traceContent}>
          {/* Letter info */}
          <View style={styles.letterInfo}>
            <Text style={styles.letterEmoji}>{letter.emoji}</Text>
            <View>
              <Text style={styles.letterTitle}>{letter.letter} for {letter.word}</Text>
              <Text style={styles.letterTelugu}>{letter.telugu}</Text>
            </View>
            <TouchableOpacity onPress={() => speakText(letter.word)} disabled={isSpeaking} style={styles.speakMini}>
              <Ionicons name="volume-high" size={22} color="#F97316" />
            </TouchableOpacity>
          </View>

          {/* Hint */}
          <Text style={styles.traceHint}>💡 {letter.hint}</Text>

          {/* Drawing canvas */}
          <View style={styles.canvasContainer}>
            {/* Ghost letter guide */}
            <Text style={styles.ghostLetter}>{letter.letter}</Text>

            {/* Start dot */}
            <View style={[styles.startDot, { left: letter.startDot.x - 10, top: letter.startDot.y - 10 }]}>
              <Text style={styles.startDotText}>▶ Start here</Text>
            </View>

            <View {...panResponder.panHandlers} style={styles.canvas}>
              <Svg width={CANVAS_SIZE} height={200}>
                {paths.map((p, i) => (
                  <Path key={i} d={p} stroke="#F97316" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                ))}
                {currentPath && (
                  <Path d={currentPath} stroke="#F97316" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                )}
                {paths.length === 0 && !currentPath && (
                  <SvgText x={CANVAS_SIZE / 2} y={110} textAnchor="middle" fill="#E5E7EB" fontSize={14}>
                    Trace the letter above with your finger
                  </SvgText>
                )}
              </Svg>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.traceControls}>
            <TouchableOpacity style={styles.clearBtn} onPress={clearTrace}>
              <Ionicons name="refresh" size={20} color="#EF4444" />
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>

            {paths.length > 0 && !traceComplete && (
              <TouchableOpacity style={styles.doneTraceBtn} onPress={() => { setTraceComplete(true); setScore(s => s + 5); }}>
                <Text style={styles.doneTraceBtnText}>Done Tracing ✓</Text>
              </TouchableOpacity>
            )}
          </View>

          {traceComplete && (
            <Animatable.View animation="bounceIn" style={styles.traceSuccessBox}>
              <Text style={styles.traceSuccessText}>🎉 Great tracing! You wrote the letter {letter.letter}!</Text>
              <TouchableOpacity style={styles.nextLetterBtn} onPress={nextLetter}>
                <Text style={styles.nextLetterBtnText}>Next Letter →</Text>
              </TouchableOpacity>
            </Animatable.View>
          )}
        </ScrollView>
      </View>
    );
  }

  // COPY phase
  if (phase === 'copy') {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
          <TouchableOpacity onPress={() => setPhase('menu')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📋 Copy the Sentence</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBadge}><Text style={styles.statText}>{sentenceIdx + 1}/{sentences.length}</Text></View>
            <View style={styles.statBadge}><Text style={styles.statText}>⭐ {score}</Text></View>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.copyContent}>
          <Animatable.View animation="fadeInDown" key={sentenceIdx} style={styles.sentenceCard}>
            <View style={styles.sentenceLabelRow}>
              <Text style={styles.sentenceLabel}>Read this sentence:</Text>
              <TouchableOpacity onPress={() => speakText(sentence)} disabled={isSpeaking}>
                <Ionicons name="volume-high" size={22} color="#8B5CF6" />
              </TouchableOpacity>
            </View>
            <Text style={styles.sentenceText}>{sentence}</Text>
          </Animatable.View>

          <Text style={styles.copyInstruction}>Now type the sentence below:</Text>

          <TextInput
            style={[styles.copyInput, copyDone && (copyText.toLowerCase().includes(sentence.slice(0, 8).toLowerCase()) ? styles.copyInputCorrect : styles.copyInputWrong)]}
            value={copyText}
            onChangeText={setCopyText}
            placeholder="Type the sentence here..."
            placeholderTextColor="#9CA3AF"
            multiline
            editable={!copyDone}
            autoCapitalize="sentences"
          />

          {!copyDone ? (
            <TouchableOpacity
              style={[styles.checkCopyBtn, copyText.trim().length < 3 && styles.checkCopyBtnDisabled]}
              onPress={checkCopy}
              disabled={copyText.trim().length < 3}
            >
              <Text style={styles.checkCopyBtnText}>Check ✓</Text>
            </TouchableOpacity>
          ) : (
            <Animatable.View animation="fadeIn" style={styles.copyFeedback}>
              <Text style={styles.copyFeedbackText}>
                {copyText.toLowerCase().includes(sentence.slice(0, 8).toLowerCase())
                  ? '✅ Well done! You copied it correctly!'
                  : '✍️ Good try! Look at the sentence again and practise!'}
              </Text>
              <TouchableOpacity style={styles.nextCopyBtn} onPress={nextCopy}>
                <Text style={styles.nextCopyBtnText}>Next Sentence →</Text>
              </TouchableOpacity>
            </Animatable.View>
          )}
        </ScrollView>
      </View>
    );
  }

  // CREATE phase
  if (phase === 'create') {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
          <TouchableOpacity onPress={() => setPhase('menu')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🌟 Write Your Own</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBadge}><Text style={styles.statText}>⭐ {score}</Text></View>
          </View>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.createContent}>
          <Animatable.View animation="fadeInDown" key={promptIdx} style={styles.promptCard}>
            <Text style={styles.promptEmoji}>{prompt.emoji}</Text>
            <Text style={styles.promptLabel}>Complete this sentence:</Text>
            <Text style={styles.promptText}>{prompt.prompt}</Text>
          </Animatable.View>

          <Text style={styles.createInstruction}>Write your answer below:</Text>

          <TextInput
            style={styles.createInput}
            value={createText}
            onChangeText={setCreateText}
            placeholder="Write your sentence here..."
            placeholderTextColor="#9CA3AF"
            multiline
            editable={!createDone}
            autoCapitalize="sentences"
          />

          <Text style={styles.charCount}>{createText.length} characters</Text>

          {!createDone ? (
            <View style={styles.createActions}>
              <TouchableOpacity
                style={[styles.submitCreateBtn, createText.trim().length < 5 && styles.submitCreateBtnDisabled]}
                onPress={submitCreate}
                disabled={createText.trim().length < 5}
              >
                <Text style={styles.submitCreateBtnText}>Submit & Hear It 🔊</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.newPromptBtn} onPress={() => setPromptIdx(i => (i + 1) % CREATIVE_PROMPTS.length)}>
                <Text style={styles.newPromptBtnText}>Try Another Prompt</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Animatable.View animation="bounceIn" style={styles.createSuccess}>
              <Text style={styles.createSuccessEmoji}>🎉</Text>
              <Text style={styles.createSuccessText}>Amazing writing! You created your own sentence!</Text>
              <TouchableOpacity
                style={styles.newPromptBtnFilled}
                onPress={() => { setCreateText(''); setCreateDone(false); setPromptIdx(i => (i + 1) % CREATIVE_PROMPTS.length); }}
              >
                <Text style={styles.newPromptBtnFilledText}>Write Another! ✍️</Text>
              </TouchableOpacity>
            </Animatable.View>
          )}
        </ScrollView>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  backButton: { marginBottom: 14 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: '#fff', opacity: 0.9 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  statBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5 },
  statText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  menuContent: { padding: 20, gap: 14 },
  menuDesc: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 4 },
  menuCard: { borderRadius: 20, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  menuCardGradient: { flexDirection: 'row', alignItems: 'center', padding: 22, gap: 14 },
  menuCardEmoji: { fontSize: 36 },
  menuCardTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  menuCardDesc: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 18 },
  tipsBox: { backgroundColor: '#FEF3C7', borderRadius: 16, padding: 16, gap: 8 },
  tipsTitle: { fontSize: 16, fontWeight: '700', color: '#92400E' },
  tipsText: { fontSize: 14, color: '#78350F', lineHeight: 22 },
  traceContent: { padding: 20, gap: 16 },
  letterInfo: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  letterEmoji: { fontSize: 40 },
  letterTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  letterTelugu: { fontSize: 16, color: '#6B7280' },
  speakMini: { marginLeft: 'auto' },
  traceHint: { fontSize: 14, color: '#6B7280', fontStyle: 'italic', backgroundColor: '#FEF3C7', borderRadius: 12, padding: 12 },
  canvasContainer: { position: 'relative', alignItems: 'center' },
  ghostLetter: { position: 'absolute', fontSize: 160, color: '#F3F4F6', fontWeight: 'bold', zIndex: 0, top: 10 },
  startDot: { position: 'absolute', zIndex: 3, flexDirection: 'row', alignItems: 'center', gap: 4 },
  startDotText: { fontSize: 11, fontWeight: '700', color: '#10B981', backgroundColor: '#ECFDF5', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  canvas: { width: CANVAS_SIZE, height: 200, backgroundColor: '#fff', borderRadius: 20, borderWidth: 2, borderColor: '#E5E7EB', overflow: 'hidden', zIndex: 2 },
  traceControls: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEE2E2', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 10 },
  clearBtnText: { fontSize: 15, fontWeight: '600', color: '#EF4444' },
  doneTraceBtn: { backgroundColor: '#10B981', borderRadius: 14, paddingHorizontal: 24, paddingVertical: 10 },
  doneTraceBtnText: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  traceSuccessBox: { backgroundColor: '#ECFDF5', borderRadius: 16, padding: 18, gap: 12, alignItems: 'center' },
  traceSuccessText: { fontSize: 16, fontWeight: '700', color: '#065F46', textAlign: 'center' },
  nextLetterBtn: { backgroundColor: '#10B981', borderRadius: 14, paddingHorizontal: 28, paddingVertical: 10 },
  nextLetterBtnText: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  copyContent: { padding: 20, gap: 16 },
  sentenceCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, gap: 10, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, elevation: 4 },
  sentenceLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sentenceLabel: { fontSize: 13, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase' },
  sentenceText: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', lineHeight: 34 },
  copyInstruction: { fontSize: 15, fontWeight: '600', color: '#374151' },
  copyInput: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 2, borderColor: '#E5E7EB', padding: 16, fontSize: 18, color: '#1F2937', minHeight: 80, textAlignVertical: 'top' },
  copyInputCorrect: { borderColor: '#10B981', backgroundColor: '#ECFDF5' },
  copyInputWrong: { borderColor: '#F59E0B', backgroundColor: '#FFFBEB' },
  checkCopyBtn: { backgroundColor: '#8B5CF6', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  checkCopyBtnDisabled: { backgroundColor: '#D1D5DB' },
  checkCopyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  copyFeedback: { backgroundColor: '#F5F3FF', borderRadius: 16, padding: 16, gap: 12 },
  copyFeedbackText: { fontSize: 16, fontWeight: '600', color: '#5B21B6', lineHeight: 22 },
  nextCopyBtn: { backgroundColor: '#8B5CF6', borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  nextCopyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  createContent: { padding: 20, gap: 16 },
  promptCard: { backgroundColor: '#fff', borderRadius: 20, padding: 22, alignItems: 'center', gap: 10, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, elevation: 4 },
  promptEmoji: { fontSize: 48 },
  promptLabel: { fontSize: 13, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase' },
  promptText: { fontSize: 20, fontWeight: '700', color: '#1F2937', textAlign: 'center', lineHeight: 28 },
  createInstruction: { fontSize: 15, fontWeight: '600', color: '#374151' },
  createInput: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 2, borderColor: '#E5E7EB', padding: 16, fontSize: 17, color: '#1F2937', minHeight: 100, textAlignVertical: 'top' },
  charCount: { fontSize: 12, color: '#9CA3AF', textAlign: 'right' },
  createActions: { gap: 10 },
  submitCreateBtn: { backgroundColor: '#10B981', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  submitCreateBtnDisabled: { backgroundColor: '#D1D5DB' },
  submitCreateBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  newPromptBtn: { backgroundColor: '#F3F4F6', borderRadius: 16, paddingVertical: 12, alignItems: 'center' },
  newPromptBtnText: { color: '#6B7280', fontWeight: '600', fontSize: 15 },
  createSuccess: { backgroundColor: '#ECFDF5', borderRadius: 20, padding: 24, alignItems: 'center', gap: 12 },
  createSuccessEmoji: { fontSize: 52 },
  createSuccessText: { fontSize: 17, fontWeight: '700', color: '#065F46', textAlign: 'center' },
  newPromptBtnFilled: { backgroundColor: '#10B981', borderRadius: 14, paddingHorizontal: 28, paddingVertical: 12 },
  newPromptBtnFilledText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
