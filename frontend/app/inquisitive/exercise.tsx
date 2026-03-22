/**
 * Daily Exercise Screen — 5 AI-generated questions per day
 * With timer, animations, and instant feedback
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, ActivityIndicator, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/appStore';
import { API_URL } from '../../utils/api';
import AnimatedCharacter from '../../components/AnimatedCharacter';
import { CHARACTERS, CharacterId } from '../../constants/AppData';

const OPTION_COLORS = ['#6366F1','#10B981','#F59E0B','#EF4444'];
const SUBJECT_COLORS: Record<string, string> = {
  english: '#6366F1', maths: '#10B981', gk: '#F59E0B', science: '#8B5CF6'
};

export default function DailyExercise() {
  const router   = useRouter();
  const { user } = useAppStore();
  const char     = CHARACTERS[(user?.selected_character as CharacterId) || 'cat'];

  const [exercises, setExercises] = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [current,   setCurrent]   = useState(0);
  const [answers,   setAnswers]   = useState<number[]>([]);
  const [selected,  setSelected]  = useState<number | null>(null);
  const [showResult,setShowResult]= useState(false);
  const [finished,  setFinished]  = useState(false);
  const [finalScore,setFinalScore]= useState<any>(null);
  const [timeLeft,  setTimeLeft]  = useState(15);
  const [startTime, setStartTime] = useState<number>(Date.now());

  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(1)).current;
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadExercises();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    if (!loading && !finished && !showResult) {
      setTimeLeft(15);
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current!);
            handleAnswer(-1);  // time out
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [current, loading, finished, showResult]);

  const loadExercises = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/inquisitive/exercises/generate?user_id=${user?.user_id}&class_id=${user?.current_class || 'class3'}`,
        { method: 'POST' }
      );
      const data = await res.json();
      setExercises(data.exercises || []);
    } catch {
      Alert.alert('Error', 'Could not load exercises. Check your connection.');
    } finally {
      setLoading(false);
      setStartTime(Date.now());
    }
  };

  const handleAnswer = (idx: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setSelected(idx);
    setShowResult(true);

    const correct = exercises[current]?.correct;
    if (idx === correct) {
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.15, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1,    duration: 150, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:-10, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,  duration: 80, useNativeDriver: true }),
      ]).start();
    }

    const newAnswers = [...answers, idx];
    setAnswers(newAnswers);

    setTimeout(() => {
      setShowResult(false);
      setSelected(null);
      if (current + 1 >= exercises.length) {
        submitAnswers(newAnswers);
      } else {
        setCurrent(c => c + 1);
      }
    }, 1800);
  };

  const submitAnswers = async (finalAnswers: number[]) => {
    try {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const res = await fetch(`${API_URL}/api/inquisitive/exercises/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.user_id,
          exercise_id: `daily_${user?.current_class}_${new Date().toISOString().split('T')[0]}`,
          answers: finalAnswers,
          time_taken_sec: elapsed,
        }),
      });
      const result = await res.json();
      setFinalScore(result);
    } catch {
      setFinalScore({ score: 0, total: exercises.length, stars_earned: 0, message: 'Could not save result.' });
    } finally {
      setFinished(true);
    }
  };

  // ── Loading ──
  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#10B981" />
      <Text style={styles.loadingText}>Preparing your questions... 🤔</Text>
    </View>
  );

  // ── Finished screen ──
  if (finished && finalScore) {
    const pct = Math.round((finalScore.score / finalScore.total) * 100);
    return (
      <LinearGradient colors={['#0F172A','#1E293B']} style={{ flex: 1, padding: 24, paddingTop: 60 }}>
        <AnimatedCharacter character={char.id as any}
          expression={pct >= 80 ? 'excited' : pct >= 50 ? 'happy' : 'confused'} size={160} />
        <Text style={styles.resultTitle}>{finalScore.message}</Text>
        <View style={styles.resultScore}>
          <Text style={styles.resultScoreNum}>{finalScore.score}/{finalScore.total}</Text>
          <Text style={styles.resultScoreLabel}>correct answers</Text>
        </View>
        <View style={styles.resultStars}>
          <Text style={styles.starsEmoji}>⭐</Text>
          <Text style={styles.starsNum}>+{finalScore.stars_earned} stars earned!</Text>
        </View>
        <TouchableOpacity style={styles.doneBtn} onPress={() => router.back()}>
          <Text style={styles.doneBtnText}>Back to Inquisitive Kid</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const q     = exercises[current];
  const subjectColor = q ? SUBJECT_COLORS[q.subject] || '#6366F1' : '#6366F1';

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A','#1E293B']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Daily Exercise ✏️</Text>
        {/* Progress dots */}
        <View style={styles.progressDots}>
          {exercises.map((_, i) => (
            <View key={i} style={[styles.dot,
              i < current  && styles.dotDone,
              i === current && { backgroundColor: subjectColor },
            ]} />
          ))}
        </View>
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {/* Timer + question count */}
        <View style={styles.metaRow}>
          <Text style={styles.questionCount}>Question {current + 1} of {exercises.length}</Text>
          <View style={[styles.timerBadge, { backgroundColor: timeLeft <= 5 ? '#EF4444' : '#334155' }]}>
            <Ionicons name="time" size={13} color="#fff" />
            <Text style={styles.timerText}>{timeLeft}s</Text>
          </View>
        </View>

        {/* Subject pill */}
        {q && (
          <View style={[styles.subjectPill, { backgroundColor: subjectColor + '22', borderColor: subjectColor + '44' }]}>
            <Text style={[styles.subjectText, { color: subjectColor }]}>
              {q.emoji} {q.subject.charAt(0).toUpperCase() + q.subject.slice(1)}
            </Text>
          </View>
        )}

        {/* Question */}
        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
          <Text style={styles.questionText}>{q?.question}</Text>
        </Animated.View>

        {/* Options */}
        <View style={styles.options}>
          {q?.options?.map((opt: string, idx: number) => {
            const isSelected = selected === idx;
            const isCorrect  = q.correct === idx;
            let bg = '#1E293B';
            if (showResult && isSelected && isCorrect)  bg = '#10B981';
            if (showResult && isSelected && !isCorrect) bg = '#EF4444';
            if (showResult && !isSelected && isCorrect) bg = '#10B98144';

            return (
              <TouchableOpacity key={idx} disabled={showResult}
                style={[styles.option, { backgroundColor: bg }]}
                onPress={() => handleAnswer(idx)}>
                <View style={[styles.optionBullet, { backgroundColor: OPTION_COLORS[idx] }]}>
                  <Text style={styles.optionBulletText}>{['A','B','C','D'][idx]}</Text>
                </View>
                <Text style={styles.optionText}>{opt}</Text>
                {showResult && isCorrect && <Ionicons name="checkmark-circle" size={20} color="#10B981" />}
                {showResult && isSelected && !isCorrect && <Ionicons name="close-circle" size={20} color="#EF4444" />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explanation */}
        {showResult && selected !== null && (
          <View style={styles.explanation}>
            <Text style={styles.explanationText}>💡 {q?.explanation}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#0F172A' },
  center:        { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0F172A' },
  loadingText:   { color: '#94A3B8', fontSize: 14, marginTop: 12 },
  header:        { paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16 },
  backBtn:       { marginBottom: 8 },
  headerTitle:   { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 12 },
  progressDots:  { flexDirection: 'row', gap: 6 },
  dot:           { width: 10, height: 10, borderRadius: 5, backgroundColor: '#334155' },
  dotDone:       { backgroundColor: '#10B981' },
  body:          { flex: 1 },
  bodyContent:   { padding: 16 },
  metaRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  questionCount: { fontSize: 13, color: '#94A3B8' },
  timerBadge:    { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  timerText:     { color: '#fff', fontSize: 13, fontWeight: '600' },
  subjectPill:   { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, marginBottom: 12 },
  subjectText:   { fontSize: 12, fontWeight: '600' },
  questionText:  { fontSize: 20, fontWeight: '700', color: '#F8FAFC', lineHeight: 28, marginBottom: 24 },
  options:       { gap: 10 },
  option:        { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, gap: 12 },
  optionBullet:  { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  optionBulletText:{ color: '#fff', fontSize: 13, fontWeight: '700' },
  optionText:    { flex: 1, fontSize: 15, color: '#E2E8F0' },
  explanation:   { marginTop: 16, backgroundColor: '#1E293B', borderRadius: 12, padding: 14, borderLeftWidth: 3, borderLeftColor: '#10B981' },
  explanationText:{ fontSize: 14, color: '#94A3B8', lineHeight: 20 },
  resultTitle:   { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center', marginVertical: 16 },
  resultScore:   { alignItems: 'center', marginBottom: 16 },
  resultScoreNum:{ fontSize: 52, fontWeight: '800', color: '#10B981' },
  resultScoreLabel:{ fontSize: 14, color: '#94A3B8' },
  resultStars:   { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 32 },
  starsEmoji:    { fontSize: 28 },
  starsNum:      { fontSize: 20, fontWeight: '700', color: '#FBBF24' },
  doneBtn:       { backgroundColor: '#6366F1', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  doneBtnText:   { color: '#fff', fontSize: 16, fontWeight: '700' },
});
