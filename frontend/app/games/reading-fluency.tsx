import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';
import { useAppStore } from '../../store/appStore';
import api from '../../utils/api';

const { width } = Dimensions.get('window');

interface Passage {
  id: string;
  title: string;
  emoji: string;
  level: string[];
  wordCount: number;
  targetWPM: { min: number; max: number };
  text: string;
  comprehension: { question: string; options: string[]; answer: string }[];
}

const PASSAGES: Passage[] = [
  {
    id: 'r1',
    title: 'My Dog',
    emoji: '🐶',
    level: ['lkg-1st'],
    wordCount: 30,
    targetWPM: { min: 20, max: 40 },
    text: 'I have a dog. His name is Tommy. Tommy is brown and white. He has big eyes. Tommy likes to eat rice. He runs and jumps all day. I love my dog.',
    comprehension: [
      { question: 'What is the dog\'s name?', options: ['Buddy', 'Tommy', 'Max', 'Rex'], answer: 'Tommy' },
      { question: 'What colour is the dog?', options: ['Black', 'Yellow', 'Brown and white', 'Orange'], answer: 'Brown and white' },
    ],
  },
  {
    id: 'r2',
    title: 'The Mango Tree',
    emoji: '🥭',
    level: ['lkg-1st', '2nd-3rd'],
    wordCount: 45,
    targetWPM: { min: 35, max: 55 },
    text: 'There is a big mango tree near our house. In summer, it gives us many sweet mangoes. Birds sit on its branches and sing. My grandmother makes mango pickle and jam. We all love our mango tree.',
    comprehension: [
      { question: 'When does the tree give mangoes?', options: ['In winter', 'In summer', 'In monsoon', 'In spring'], answer: 'In summer' },
      { question: 'What does grandmother make?', options: ['Juice', 'Mango cake', 'Mango pickle and jam', 'Rice'], answer: 'Mango pickle and jam' },
    ],
  },
  {
    id: 'r3',
    title: 'A Visit to the Zoo',
    emoji: '🦁',
    level: ['2nd-3rd'],
    wordCount: 60,
    targetWPM: { min: 45, max: 65 },
    text: 'Last Sunday, our class visited the city zoo. We saw many animals — lions, elephants, giraffes and colourful parrots. The elephant was the biggest animal. It had a long trunk and small eyes. The giraffes ate leaves from tall trees. We took many photos and returned home happy and tired.',
    comprehension: [
      { question: 'Which was the biggest animal they saw?', options: ['Lion', 'Giraffe', 'Elephant', 'Parrot'], answer: 'Elephant' },
      { question: 'What did the giraffes eat?', options: ['Grass', 'Mangoes', 'Fish', 'Leaves from tall trees'], answer: 'Leaves from tall trees' },
    ],
  },
  {
    id: 'r4',
    title: 'Kavya and the Rain',
    emoji: '🌧️',
    level: ['2nd-3rd', '4th-5th'],
    wordCount: 80,
    targetWPM: { min: 55, max: 80 },
    text: 'Kavya looked out of her window and smiled. The monsoon had finally arrived in her village. The dry fields were turning green. Farmers were happy because their crops needed water. Kavya wore her yellow raincoat and went outside to play. She jumped in the puddles and laughed with her friends. Her mother called her in for hot tea and bajji. It was the best day of the monsoon.',
    comprehension: [
      { question: 'Why were the farmers happy?', options: ['School was closed', 'Their crops needed water', 'There was a festival', 'Kavya gave them food'], answer: 'Their crops needed water' },
      { question: 'What did Kavya\'s mother give her?', options: ['Mango juice', 'Hot tea and bajji', 'Rice and sambar', 'Milk'], answer: 'Hot tea and bajji' },
    ],
  },
  {
    id: 'r5',
    title: 'The Clever Crow',
    emoji: '🐦‍⬛',
    level: ['4th-5th', '5th-adv'],
    wordCount: 100,
    targetWPM: { min: 65, max: 100 },
    text: 'A crow was flying over a village on a very hot day. He was terribly thirsty and searched everywhere for water. Finally, he spotted a clay pot with some water at the bottom. He tried to drink, but his beak could not reach the water. The clever crow did not give up. He picked up small pebbles and dropped them into the pot, one by one. Slowly, the water level rose. Finally, he was able to drink the water. Hard work and patience always pay off.',
    comprehension: [
      { question: 'What did the crow use to raise the water level?', options: ['Leaves', 'Sand', 'Pebbles', 'Sticks'], answer: 'Pebbles' },
      { question: 'What is the lesson of the story?', options: ['Always carry water', 'Hard work and patience pay off', 'Crows are smart', 'Never give up drinking'], answer: 'Hard work and patience pay off' },
    ],
  },
];

type Phase = 'select' | 'reading' | 'result' | 'comprehension' | 'final';

export default function ReadingFluencyScreen() {
  const router = useRouter();
  const { user } = useAppStore();
  const [phase, setPhase] = useState<Phase>('select');
  const [selectedPassage, setSelectedPassage] = useState<Passage | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [compIndex, setCompIndex] = useState(0);
  const [compScore, setCompScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerChecked, setAnswerChecked] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const level = user?.current_level || 'lkg-1st';
  const available = PASSAGES.filter(p => p.level.includes(level));
  const allPassages = available.length > 0 ? available : PASSAGES.slice(0, 2);

  const startTimer = () => {
    setTimerSeconds(0);
    setIsRunning(true);
    timerRef.current = setInterval(() => {
      setTimerSeconds(s => s + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
  };

  const finishReading = () => {
    stopTimer();
    const passage = selectedPassage!;
    const minutes = timerSeconds / 60;
    const calculatedWpm = Math.round(passage.wordCount / minutes);
    setWpm(calculatedWpm);
    setPhase('result');
  };

  const getWpmFeedback = (wpm: number, passage: Passage) => {
    if (wpm >= passage.targetWPM.max) return { label: 'Excellent! 🌟', color: '#10B981', desc: 'You read very fluently!' };
    if (wpm >= passage.targetWPM.min) return { label: 'Good! ⭐', color: '#F59E0B', desc: 'You\'re reading at a great pace!' };
    return { label: 'Keep Practising! 📚', color: '#6B7280', desc: 'Try reading a little faster next time.' };
  };

  const speakPassage = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      if (soundRef.current) { await soundRef.current.stopAsync(); await soundRef.current.unloadAsync(); }
      const response = await api.post('/tts/speak-base64', { text, voice: 'nova', speed: 0.85 });
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mp3;base64,${response.data.audio_base64}` },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate(s => { if (s.isLoaded && s.didJustFinish) setIsSpeaking(false); });
    } catch { setIsSpeaking(false); }
  };

  const handleCompAnswer = (answer: string) => {
    if (answerChecked) return;
    setSelectedAnswer(answer);
    setAnswerChecked(true);
    if (answer === selectedPassage!.comprehension[compIndex].answer) {
      setCompScore(s => s + 10);
    }
  };

  const nextCompQuestion = () => {
    const next = compIndex + 1;
    if (next >= selectedPassage!.comprehension.length) {
      setPhase('final');
    } else {
      setCompIndex(next);
      setSelectedAnswer(null);
      setAnswerChecked(false);
    }
  };

  const reset = () => {
    setPhase('select');
    setSelectedPassage(null);
    setTimerSeconds(0);
    setIsRunning(false);
    setWpm(0);
    setCompIndex(0);
    setCompScore(0);
    setSelectedAnswer(null);
    setAnswerChecked(false);
    stopTimer();
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  // PASSAGE SELECT
  if (phase === 'select') {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#0EA5E9', '#0284C7']} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📖 Reading Fluency</Text>
          <Text style={styles.headerSubtitle}>Read aloud & track your speed!</Text>
        </LinearGradient>
        <ScrollView contentContainerStyle={styles.selectContent}>
          <Text style={styles.selectLabel}>Choose a passage to read:</Text>
          {allPassages.map(p => (
            <TouchableOpacity key={p.id} style={styles.passageCard} onPress={() => { setSelectedPassage(p); setPhase('reading'); }}>
              <View style={styles.passageLeft}>
                <Text style={styles.passageEmoji}>{p.emoji}</Text>
                <View>
                  <Text style={styles.passageTitle}>{p.title}</Text>
                  <Text style={styles.passageMeta}>{p.wordCount} words · Target: {p.targetWPM.min}–{p.targetWPM.max} WPM</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
          <View style={styles.wpmGuideBox}>
            <Text style={styles.wpmGuideTitle}>📊 Reading Speed Guide</Text>
            <Text style={styles.wpmGuideText}>Class 1–2: 45–60 words/min{'\n'}Class 3: 60+ words/min{'\n'}Class 4–5: 70–100 words/min</Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  const passage = selectedPassage!;

  // READING PHASE
  if (phase === 'reading') {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#0EA5E9', '#0284C7']} style={styles.header}>
          <TouchableOpacity onPress={reset} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{passage.emoji} {passage.title}</Text>
          <Text style={styles.headerSubtitle}>{passage.wordCount} words · Read aloud</Text>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.readingContent}>
          {/* Timer */}
          <View style={styles.timerBox}>
            <Text style={styles.timerLabel}>{isRunning ? '⏱ Reading...' : 'Press START when ready'}</Text>
            <Text style={styles.timerValue}>{formatTime(timerSeconds)}</Text>
          </View>

          {/* Listen button */}
          <TouchableOpacity style={styles.listenBtn} onPress={() => speakPassage(passage.text)} disabled={isSpeaking}>
            <Ionicons name={isSpeaking ? 'pause' : 'volume-high'} size={20} color="#0EA5E9" />
            <Text style={styles.listenBtnText}>{isSpeaking ? 'Playing...' : 'Listen to model reading'}</Text>
          </TouchableOpacity>

          {/* Passage text */}
          <View style={styles.passageBox}>
            <Text style={styles.passageText}>{passage.text}</Text>
          </View>

          {/* Controls */}
          {!isRunning ? (
            <TouchableOpacity style={styles.startBtn} onPress={startTimer}>
              <Ionicons name="play" size={24} color="#fff" />
              <Text style={styles.startBtnText}>Start Reading Timer</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.doneBtn} onPress={finishReading}>
              <Ionicons name="stop" size={24} color="#fff" />
              <Text style={styles.doneBtnText}>I Finished Reading!</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    );
  }

  // RESULT PHASE
  if (phase === 'result') {
    const feedback = getWpmFeedback(wpm, passage);
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#0EA5E9', '#0284C7']} style={styles.header}>
          <Text style={styles.headerTitle}>📊 Your Reading Speed</Text>
        </LinearGradient>
        <ScrollView contentContainerStyle={styles.resultContent}>
          <Animatable.View animation="bounceIn" style={styles.wpmCard}>
            <Text style={styles.wpmValue}>{wpm}</Text>
            <Text style={styles.wpmUnit}>words per minute</Text>
            <Text style={[styles.wpmLabel, { color: feedback.color }]}>{feedback.label}</Text>
            <Text style={styles.wpmDesc}>{feedback.desc}</Text>
            <View style={styles.wpmRange}>
              <Text style={styles.wpmRangeText}>Target for your level: {passage.targetWPM.min}–{passage.targetWPM.max} WPM</Text>
            </View>
          </Animatable.View>

          <View style={styles.timeRow}>
            <View style={styles.timeCard}>
              <Text style={styles.timeLabel}>Time taken</Text>
              <Text style={styles.timeValue}>{formatTime(timerSeconds)}</Text>
            </View>
            <View style={styles.timeCard}>
              <Text style={styles.timeLabel}>Words read</Text>
              <Text style={styles.timeValue}>{passage.wordCount}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.compBtn} onPress={() => setPhase('comprehension')}>
            <Text style={styles.compBtnText}>Answer Comprehension Questions →</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // COMPREHENSION PHASE
  if (phase === 'comprehension') {
    const q = passage.comprehension[compIndex];
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#0EA5E9', '#0284C7']} style={styles.header}>
          <Text style={styles.headerTitle}>🧠 Comprehension Check</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBadge}><Text style={styles.statText}>{compIndex + 1}/{passage.comprehension.length}</Text></View>
          </View>
        </LinearGradient>
        <ScrollView contentContainerStyle={styles.compContent}>
          <Animatable.View animation="fadeInDown" key={compIndex} style={styles.questionCard}>
            <Text style={styles.questionLabel}>Question {compIndex + 1}:</Text>
            <Text style={styles.questionText}>{q.question}</Text>
          </Animatable.View>
          <View style={styles.optionsGrid}>
            {q.options.map((opt, i) => {
              let style = styles.optBtn;
              if (answerChecked) {
                if (opt === q.answer) style = { ...styles.optBtn, ...styles.optCorrect };
                else if (opt === selectedAnswer) style = { ...styles.optBtn, ...styles.optWrong };
              } else if (opt === selectedAnswer) {
                style = { ...styles.optBtn, borderColor: '#0EA5E9', backgroundColor: '#E0F2FE' };
              }
              return (
                <TouchableOpacity key={i} style={style} onPress={() => handleCompAnswer(opt)} disabled={answerChecked}>
                  <Text style={styles.optText}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {answerChecked && (
            <TouchableOpacity style={styles.nextCompBtn} onPress={nextCompQuestion}>
              <Text style={styles.nextCompText}>
                {compIndex + 1 >= passage.comprehension.length ? 'See Final Score 🏆' : 'Next Question →'}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    );
  }

  // FINAL
  if (phase === 'final') {
    const wpmFb = getWpmFeedback(wpm, passage);
    return (
      <LinearGradient colors={['#0EA5E9', '#0284C7']} style={styles.completeContainer}>
        <Animatable.View animation="bounceIn" style={styles.completeCard}>
          <Text style={styles.completeEmoji}>📖</Text>
          <Text style={styles.completeTitle}>Reading Complete!</Text>
          <View style={styles.finalStats}>
            <View style={styles.finalStat}>
              <Text style={styles.finalStatVal}>{wpm}</Text>
              <Text style={styles.finalStatLabel}>WPM</Text>
            </View>
            <View style={styles.finalStat}>
              <Text style={styles.finalStatVal}>{compScore}</Text>
              <Text style={styles.finalStatLabel}>Comp. Score</Text>
            </View>
          </View>
          <Text style={[styles.wpmLabel, { color: wpmFb.color }]}>{wpmFb.label}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={reset}>
            <Text style={styles.retryText}>Read Another Passage</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeBtn} onPress={() => router.back()}>
            <Text style={styles.homeBtnText}>Back to Games</Text>
          </TouchableOpacity>
        </Animatable.View>
      </LinearGradient>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  backButton: { marginBottom: 14 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: '#fff', opacity: 0.9 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  statBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5 },
  statText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  selectContent: { padding: 20, gap: 12 },
  selectLabel: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  passageCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  passageLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  passageEmoji: { fontSize: 32 },
  passageTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  passageMeta: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  wpmGuideBox: { backgroundColor: '#E0F2FE', borderRadius: 14, padding: 16, gap: 6, marginTop: 8 },
  wpmGuideTitle: { fontSize: 15, fontWeight: '700', color: '#0369A1' },
  wpmGuideText: { fontSize: 14, color: '#0C4A6E', lineHeight: 22 },
  readingContent: { padding: 20, gap: 16 },
  timerBox: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', gap: 6, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  timerLabel: { fontSize: 14, color: '#6B7280', fontStyle: 'italic' },
  timerValue: { fontSize: 48, fontWeight: 'bold', color: '#0EA5E9' },
  listenBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: '#E0F2FE', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  listenBtnText: { fontSize: 14, fontWeight: '600', color: '#0369A1' },
  passageBox: { backgroundColor: '#fff', borderRadius: 18, padding: 22, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, elevation: 4 },
  passageText: { fontSize: 20, color: '#1F2937', lineHeight: 34 },
  startBtn: { backgroundColor: '#0EA5E9', borderRadius: 16, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  startBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  doneBtn: { backgroundColor: '#10B981', borderRadius: 16, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  doneBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  resultContent: { padding: 20, gap: 16, alignItems: 'center' },
  wpmCard: { backgroundColor: '#fff', borderRadius: 24, padding: 32, alignItems: 'center', gap: 8, width: '100%', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 5 },
  wpmValue: { fontSize: 72, fontWeight: 'bold', color: '#0EA5E9' },
  wpmUnit: { fontSize: 16, color: '#6B7280' },
  wpmLabel: { fontSize: 22, fontWeight: 'bold' },
  wpmDesc: { fontSize: 15, color: '#6B7280', textAlign: 'center' },
  wpmRange: { backgroundColor: '#F0F9FF', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, marginTop: 4 },
  wpmRangeText: { fontSize: 13, color: '#0369A1', fontWeight: '600' },
  timeRow: { flexDirection: 'row', gap: 12, width: '100%' },
  timeCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', gap: 4, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  timeLabel: { fontSize: 13, color: '#6B7280' },
  timeValue: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
  compBtn: { backgroundColor: '#0EA5E9', borderRadius: 16, paddingVertical: 16, width: '100%', alignItems: 'center' },
  compBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  compContent: { padding: 20, gap: 16 },
  questionCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24, gap: 10, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  questionLabel: { fontSize: 13, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' },
  questionText: { fontSize: 22, fontWeight: '700', color: '#1F2937', lineHeight: 30 },
  optionsGrid: { gap: 12 },
  optBtn: { backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 2, borderColor: '#E5E7EB' },
  optCorrect: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  optWrong: { backgroundColor: '#FEF2F2', borderColor: '#EF4444' },
  optText: { fontSize: 17, color: '#1F2937', fontWeight: '600' },
  nextCompBtn: { backgroundColor: '#0EA5E9', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  nextCompText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  completeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  completeCard: { backgroundColor: '#fff', borderRadius: 28, padding: 40, alignItems: 'center', width: '100%', gap: 12, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  completeEmoji: { fontSize: 64 },
  completeTitle: { fontSize: 30, fontWeight: 'bold', color: '#1F2937' },
  finalStats: { flexDirection: 'row', gap: 24 },
  finalStat: { alignItems: 'center', gap: 4 },
  finalStatVal: { fontSize: 36, fontWeight: 'bold', color: '#0EA5E9' },
  finalStatLabel: { fontSize: 13, color: '#6B7280' },
  retryBtn: { marginTop: 8, backgroundColor: '#0EA5E9', borderRadius: 16, paddingVertical: 14, width: '100%', alignItems: 'center' },
  retryText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  homeBtn: { backgroundColor: '#F3F4F6', borderRadius: 16, paddingVertical: 12, width: '100%', alignItems: 'center' },
  homeBtnText: { color: '#374151', fontWeight: '600', fontSize: 16 },
});
