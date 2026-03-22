/**
 * Inquisitive Kid — V1 Release
 * Maths Magic (tricks by class) + Daily Exercises (AI-generated)
 * Videos section → V2
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Dimensions, ActivityIndicator, Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/appStore';
import { CHARACTERS, CharacterId } from '../../constants/AppData';
import AnimatedCharacter, { Expression } from '../../components/AnimatedCharacter';
import { API_URL } from '../../utils/api';

const { width } = Dimensions.get('window');

// ── Types ─────────────────────────────────────────────────────────────────────
interface Trick {
  id: string;
  title: string;
  emoji: string;
  description: string;
  steps: string[];
  example: string;
  practice: { q: string; a: string }[];
}

interface Exercise {
  subject: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

type Section = 'home' | 'tricks' | 'exercises';

const SUBJECT_EMOJI: Record<string, string> = {
  english: '📖',
  maths:   '🔢',
  gk:      '🌍',
};

// ── Trick Card ────────────────────────────────────────────────────────────────
function TrickCard({ trick, expanded, onToggle }: {
  trick: Trick; expanded: boolean; onToggle: () => void;
}) {
  return (
    <TouchableOpacity
      style={s.trickCard}
      onPress={onToggle}
      activeOpacity={0.88}
    >
      <View style={s.trickHeader}>
        <Text style={s.trickEmoji}>{trick.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.trickTitle}>{trick.title}</Text>
          <Text style={s.trickDesc} numberOfLines={expanded ? 0 : 1}>
            {trick.description}
          </Text>
        </View>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#9CA3AF"
        />
      </View>

      {expanded && (
        <View style={s.trickBody}>
          {/* Steps */}
          <View style={s.stepsBox}>
            {trick.steps.map((step, i) => (
              <View key={i} style={s.stepRow}>
                <View style={s.stepDot}>
                  <Text style={s.stepNum}>{i + 1}</Text>
                </View>
                <Text style={s.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          {/* Example */}
          <View style={s.exampleBox}>
            <Text style={s.exampleLabel}>✨ Example</Text>
            <Text style={s.exampleText}>{trick.example}</Text>
          </View>

          {/* Practice */}
          <Text style={s.practiceLabel}>🎯 Try these:</Text>
          {trick.practice.map((p, i) => (
            <Text key={i} style={s.practiceRow}>
              {p.q}{' '}
              <Text style={s.practiceAnswer}>→ {p.a}</Text>
            </Text>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Exercise Card ─────────────────────────────────────────────────────────────
function ExerciseCard({ question, index, total, onAnswer, answered, selectedIdx }: {
  question: Exercise;
  index: number;
  total: number;
  onAnswer: (i: number) => void;
  answered: boolean;
  selectedIdx: number;
}) {
  const emoji = SUBJECT_EMOJI[question.subject] || '📝';
  return (
    <View style={s.exCard}>
      <View style={s.exCardTop}>
        <Text style={s.exSubject}>{emoji} {question.subject.toUpperCase()}</Text>
        <Text style={s.exProgress}>{index + 1}/{total}</Text>
      </View>
      <Text style={s.exQuestion}>{question.question}</Text>
      {question.options.map((opt, i) => {
        const isCorrect = i === question.correct_index;
        const isSelected = i === selectedIdx;
        let bg = '#F9FAFB', border = '#E5E7EB', color = '#374151';
        if (answered) {
          if (isCorrect)             { bg = '#ECFDF5'; border = '#6EE7B7'; color = '#065F46'; }
          else if (isSelected)       { bg = '#FEF2F2'; border = '#FCA5A5'; color = '#7F1D1D'; }
        } else if (isSelected) {
          bg = '#EEF2FF'; border = '#6366F1'; color = '#3730A3';
        }
        return (
          <TouchableOpacity
            key={i}
            style={[s.exOption, { backgroundColor: bg, borderColor: border }]}
            onPress={() => !answered && onAnswer(i)}
            disabled={answered}
            activeOpacity={0.8}
          >
            <Text style={[s.exOptText, { color }]}>
              {['A', 'B', 'C', 'D'][i]}. {opt}
            </Text>
            {answered && isCorrect && (
              <Text style={{ color: '#10B981', fontWeight: '700' }}>✓</Text>
            )}
          </TouchableOpacity>
        );
      })}
      {answered && (
        <Text style={s.exExplanation}>💡 {question.explanation}</Text>
      )}
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════════════════
export default function InquisitiveScreen() {
  const router  = useRouter();
  const { user } = useAppStore();
  const classId  = user?.current_class || 'class3';
  const charId   = (user?.selected_character as CharacterId) || 'cat';
  const character = CHARACTERS[charId] || CHARACTERS.cat;

  const [section,       setSection]       = useState<Section>('home');
  const [tricks,        setTricks]        = useState<Trick[]>([]);
  const [expandedTrick, setExpandedTrick] = useState<string | null>(null);
  const [exercises,     setExercises]     = useState<Exercise[]>([]);
  const [exerciseId,    setExerciseId]    = useState('');
  const [answers,       setAnswers]       = useState<number[]>([]);
  const [submitted,     setSubmitted]     = useState(false);
  const [result,        setResult]        = useState<any>(null);
  const [loading,       setLoading]       = useState(false);
  const [expression,    setExpression]    = useState<Expression>('happy');

  const bounceAnim = useRef(new Animated.Value(1)).current;

  const bounce = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 1.18, duration: 200, useNativeDriver: true }),
      Animated.timing(bounceAnim, { toValue: 1,    duration: 200, useNativeDriver: true }),
    ]).start();
  };

  // Load tricks whenever class changes
  useEffect(() => {
    fetch(`${API_URL}/api/inquisitive/tricks/${classId}`)
      .then(r => r.json())
      .then(d => setTricks(d.tricks || []))
      .catch(() => setTricks([]));
  }, [classId]);

  const openExercises = async () => {
    setSection('exercises');
    setLoading(true);
    setSubmitted(false);
    setAnswers([]);
    setResult(null);
    setExpression('thinking');
    try {
      const res = await fetch(`${API_URL}/api/inquisitive/exercises/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.user_id || 'guest', class_id: classId }),
      });
      const data = await res.json();
      setExercises(data.questions || []);
      setExerciseId(data.exercise_id || '');
      setExpression('happy');
    } catch {
      setExercises([]);
      setExpression('confused');
    } finally {
      setLoading(false);
    }
  };

  const submitExercises = async () => {
    if (!user || !exerciseId) return;
    setExpression('excited');
    try {
      const res = await fetch(`${API_URL}/api/inquisitive/exercises/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.user_id,
          exercise_id: exerciseId,
          answers,
          time_taken_seconds: 60,
        }),
      });
      const data = await res.json();
      setResult(data);
      setSubmitted(true);
      bounce();
      setExpression(data.score === exercises.length ? 'proud' : 'happy');
    } catch {
      setExpression('confused');
    }
  };

  const goBack = () => {
    if (section !== 'home') setSection('home');
    else router.back();
  };

  const headerTitle =
    section === 'home'      ? '🧠 Inquisitive Kid' :
    section === 'tricks'    ? '🔢 Maths Magic'     :
                              '✏️ Daily Exercise';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={s.container}>

      {/* Header */}
      <LinearGradient colors={['#312E81', '#4F46E5']} style={s.header}>
        <TouchableOpacity onPress={goBack} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{headerTitle}</Text>
        <View style={{ width: 36 }} />
      </LinearGradient>

      {/* ── HOME ── */}
      {section === 'home' && (
        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
          {/* Character greeting */}
          <View style={s.heroCard}>
            <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
              <AnimatedCharacter
                character={charId as any}
                expression="excited"
                size={110}
              />
            </Animated.View>
            <View style={{ flex: 1 }}>
              <Text style={s.heroTitle}>Hey {user?.name}! 🧠</Text>
              <Text style={s.heroSub}>
                Ready to learn some Maths magic and test your brain?
              </Text>
            </View>
          </View>

          {/* Two module cards */}
          <View style={s.moduleList}>

            {/* Maths Magic */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => setSection('tricks')}
            >
              <LinearGradient
                colors={['#D97706', '#F59E0B']}
                style={s.moduleCard}
              >
                <Text style={s.moduleEmoji}>🔢</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.moduleCardTitle}>Maths Magic</Text>
                  <Text style={s.moduleCardSub}>
                    {tricks.length} tricks for your class · Tap to unlock them!
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.8)" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Daily Exercise */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={openExercises}
            >
              <LinearGradient
                colors={['#059669', '#10B981']}
                style={s.moduleCard}
              >
                <Text style={s.moduleEmoji}>✏️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.moduleCardTitle}>Daily Exercise</Text>
                  <Text style={s.moduleCardSub}>
                    5 fresh AI questions every day · Earn up to 5 stars ⭐
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.8)" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Maths Quest */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => router.push('/inquisitive/quest' as any)}
            >
              <LinearGradient
                colors={['#D97706', '#F59E0B']}
                style={s.moduleCard}
              >
                <Text style={s.moduleEmoji}>🧩</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.moduleCardTitle}>Maths Quest</Text>
                  <Text style={s.moduleCardSub}>
                    One juicy daily puzzle · Strategy, logic & India maths!
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.8)" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Math Play Zone */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => router.push('/inquisitive/math-play' as any)}
            >
              <LinearGradient
                colors={['#7C3AED', '#8B5CF6']}
                style={s.moduleCard}
              >
                <Text style={s.moduleEmoji}>🎯</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.moduleCardTitle}>Math Play Zone</Text>
                  <Text style={s.moduleCardSub}>
                    Phase-based activities · New tricks · Games · Mindset!
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.8)" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Science Explorer */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => router.push('/inquisitive/science' as any)}
            >
              <LinearGradient
                colors={['#0891B2', '#06B6D4']}
                style={s.moduleCard}
              >
                <Text style={s.moduleEmoji}>🔬</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.moduleCardTitle}>Science Explorer</Text>
                  <Text style={s.moduleCardSub}>
                    Biology · Chemistry · Physics · Space · Class 1–5!
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.8)" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Brain Challenges */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => router.push('/inquisitive/brain' as any)}
            >
              <LinearGradient
                colors={['#DC2626', '#EF4444']}
                style={s.moduleCard}
              >
                <Text style={s.moduleEmoji}>🧩</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.moduleCardTitle}>Brain Challenges</Text>
                  <Text style={s.moduleCardSub}>
                    Riddles · Lateral thinking · Logic puzzles · 15 challenges!
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.8)" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Science Activities */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => router.push('/inquisitive/science-activities' as any)}
            >
              <LinearGradient
                colors={['#065F46', '#10B981']}
                style={s.moduleCard}
              >
                <Text style={s.moduleEmoji}>🦁</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.moduleCardTitle}>Science Activities</Text>
                  <Text style={s.moduleCardSub}>
                    Animal classifier · Senses detective · Mind map!
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.8)" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Growth Mindset */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => router.push('/inquisitive/growth-mindset' as any)}
            >
              <LinearGradient
                colors={['#0F172A', '#1E3A5F']}
                style={s.moduleCard}
              >
                <Text style={s.moduleEmoji}>🌱</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.moduleCardTitle}>Growth Mindset</Text>
                  <Text style={s.moduleCardSub}>
                    Daily challenge · Fixed vs growth · Affirmations!
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.8)" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Missions */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => router.push('/inquisitive/missions' as any)}
            >
              <LinearGradient
                colors={['#1E3A5F', '#2563EB']}
                style={s.moduleCard}
              >
                <Text style={s.moduleEmoji}>🚀</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.moduleCardTitle}>Learnzy Missions</Text>
                  <Text style={s.moduleCardSub}>
                    Real-world maths at home & market · 12 family missions · 5 stars each
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.8)" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Videos coming soon */}
            <View style={s.comingSoonCard}>
              <Text style={s.comingSoonEmoji}>🎬</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.comingSoonTitle}>Wonder Videos</Text>
                <Text style={s.comingSoonSub}>
                  50 videos with Arya · Coming in V2!
                </Text>
              </View>
              <View style={s.soonBadge}>
                <Text style={s.soonBadgeText}>Soon</Text>
              </View>
            </View>

          </View>
          <View style={{ height: 32 }} />
        </ScrollView>
      )}

      {/* ── MATHS TRICKS ── */}
      {section === 'tricks' && (
        <ScrollView
          style={s.scroll}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.sectionIntro}>
            <AnimatedCharacter
              character={charId as any}
              expression="thinking"
              size={80}
            />
            <Text style={s.sectionIntroText}>
              {tricks.length} tricks for your class!{'\n'}Tap each one to learn it.
            </Text>
          </View>

          {tricks.length === 0 && (
            <Text style={s.emptyText}>
              No tricks found for this class.{'\n'}
              Try changing your class in Settings!
            </Text>
          )}

          {tricks.map(trick => (
            <TrickCard
              key={trick.id}
              trick={trick}
              expanded={expandedTrick === trick.id}
              onToggle={() =>
                setExpandedTrick(expandedTrick === trick.id ? null : trick.id)
              }
            />
          ))}
        </ScrollView>
      )}

      {/* ── DAILY EXERCISE ── */}
      {section === 'exercises' && (
        <ScrollView
          style={s.scroll}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Loading */}
          {loading && (
            <View style={s.loadingBox}>
              <AnimatedCharacter
                character={charId as any}
                expression="thinking"
                size={90}
              />
              <Text style={s.loadingText}>
                {character.name} is preparing your questions...
              </Text>
              <ActivityIndicator
                style={{ marginTop: 12 }}
                color="#6366F1"
                size="large"
              />
            </View>
          )}

          {/* Questions */}
          {!loading && !submitted && exercises.length > 0 && (
            <>
              <View style={s.sectionIntro}>
                <AnimatedCharacter
                  character={charId as any}
                  expression={expression}
                  size={80}
                />
                <Text style={s.sectionIntroText}>
                  5 questions today!{'\n'}1 star for each correct answer ⭐
                </Text>
              </View>

              {exercises.map((q, i) => (
                <ExerciseCard
                  key={i}
                  question={q}
                  index={i}
                  total={exercises.length}
                  onAnswer={idx => {
                    const updated = [...answers];
                    updated[i] = idx;
                    setAnswers(updated);
                  }}
                  answered={false}
                  selectedIdx={answers[i] ?? -1}
                />
              ))}

              {answers.length === exercises.length && (
                <TouchableOpacity
                  style={s.submitBtn}
                  onPress={submitExercises}
                >
                  <Text style={s.submitBtnText}>Submit Answers 🎉</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Result */}
          {submitted && result && (
            <>
              <View style={s.resultBox}>
                <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
                  <AnimatedCharacter
                    character={charId as any}
                    expression={expression}
                    size={100}
                  />
                </Animated.View>
                <View style={s.starsRow}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Text
                      key={i}
                      style={[
                        s.starIcon,
                        { opacity: i < result.stars_earned ? 1 : 0.2 },
                      ]}
                    >
                      ⭐
                    </Text>
                  ))}
                </View>
                <Text style={s.resultScore}>
                  {result.score}/{result.total} Correct!
                </Text>
                <Text style={s.resultMsg}>{result.message}</Text>
              </View>

              {/* Show answers with explanations */}
              {exercises.map((q, i) => (
                <ExerciseCard
                  key={i}
                  question={q}
                  index={i}
                  total={exercises.length}
                  onAnswer={() => {}}
                  answered={true}
                  selectedIdx={answers[i] ?? -1}
                />
              ))}

              <TouchableOpacity
                style={[s.submitBtn, { backgroundColor: '#10B981', marginTop: 8 }]}
                onPress={() => setSection('home')}
              >
                <Text style={s.submitBtnText}>Back to Hub 🏠</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#F3F4F6' },
  header:       { flexDirection: 'row', alignItems: 'center', paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16 },
  backBtn:      { padding: 6 },
  headerTitle:  { flex: 1, fontSize: 18, fontWeight: '700', color: '#fff', textAlign: 'center' },
  scroll:       { flex: 1 },
  heroCard:     { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 14, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
  heroTitle:    { fontSize: 19, fontWeight: '700', color: '#111827', marginBottom: 4 },
  heroSub:      { fontSize: 13, color: '#6B7280', lineHeight: 19 },
  moduleList:   { paddingHorizontal: 16, gap: 12 },
  moduleCard:   { borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 },
  moduleEmoji:  { fontSize: 32 },
  moduleCardTitle: { fontSize: 17, fontWeight: '700', color: '#fff', marginBottom: 2 },
  moduleCardSub:   { fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 18 },
  comingSoonCard:  { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 16, padding: 18, borderWidth: 1.5, borderColor: '#E5E7EB', borderStyle: 'dashed' },
  comingSoonEmoji: { fontSize: 32, opacity: 0.5 },
  comingSoonTitle: { fontSize: 17, fontWeight: '700', color: '#9CA3AF', marginBottom: 2 },
  comingSoonSub:   { fontSize: 12, color: '#D1D5DB' },
  soonBadge:       { backgroundColor: '#F3F4F6', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  soonBadgeText:   { fontSize: 11, fontWeight: '600', color: '#9CA3AF' },
  sectionIntro:  { alignItems: 'center', marginBottom: 20, gap: 6 },
  sectionIntroText: { fontSize: 14, color: '#374151', textAlign: 'center', lineHeight: 21 },
  emptyText:     { textAlign: 'center', color: '#9CA3AF', marginTop: 40, lineHeight: 24 },
  // Trick card
  trickCard:    { backgroundColor: '#fff', borderRadius: 14, marginBottom: 10, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 3 },
  trickHeader:  { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  trickEmoji:   { fontSize: 28, width: 36 },
  trickTitle:   { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  trickDesc:    { fontSize: 12, color: '#6B7280' },
  trickBody:    { paddingHorizontal: 14, paddingBottom: 14 },
  stepsBox:     { backgroundColor: '#F9FAFB', borderRadius: 10, padding: 12, marginBottom: 10 },
  stepRow:      { flexDirection: 'row', gap: 8, marginBottom: 6, alignItems: 'flex-start' },
  stepDot:      { width: 20, height: 20, borderRadius: 10, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center' },
  stepNum:      { fontSize: 11, color: '#fff', fontWeight: '700' },
  stepText:     { flex: 1, fontSize: 13, color: '#374151', lineHeight: 19 },
  exampleBox:   { backgroundColor: '#EEF2FF', borderRadius: 10, padding: 12, marginBottom: 10 },
  exampleLabel: { fontSize: 12, fontWeight: '600', color: '#4338CA', marginBottom: 4 },
  exampleText:  { fontSize: 13, color: '#3730A3', lineHeight: 19 },
  practiceLabel:{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  practiceRow:  { fontSize: 13, color: '#374151', marginBottom: 4 },
  practiceAnswer: { color: '#10B981', fontWeight: '700' },
  // Exercise card
  exCard:       { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 3 },
  exCardTop:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  exSubject:    { fontSize: 11, fontWeight: '600', color: '#6B7280' },
  exProgress:   { fontSize: 11, color: '#9CA3AF' },
  exQuestion:   { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 12, lineHeight: 22 },
  exOption:     { borderRadius: 10, borderWidth: 1.5, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  exOptText:    { fontSize: 13, flex: 1 },
  exExplanation:{ fontSize: 12, color: '#6B7280', marginTop: 8, fontStyle: 'italic', lineHeight: 18 },
  // Submit / result
  submitBtn:    { backgroundColor: '#6366F1', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  submitBtnText:{ color: '#fff', fontSize: 16, fontWeight: '700' },
  loadingBox:   { alignItems: 'center', paddingTop: 40, gap: 8 },
  loadingText:  { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8 },
  resultBox:    { alignItems: 'center', backgroundColor: '#ECFDF5', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#6EE7B7' },
  starsRow:     { flexDirection: 'row', gap: 4, marginVertical: 10 },
  starIcon:     { fontSize: 22 },
  resultScore:  { fontSize: 24, fontWeight: '700', color: '#065F46', marginBottom: 4 },
  resultMsg:    { fontSize: 14, color: '#047857', textAlign: 'center' },
});
