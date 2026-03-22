/**
 * Maths Quest — Daily thinking puzzle
 * Inspired by PlayMath.org: train minds not fingers.
 * Strategy, logic, patterns — not just drill.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Animated, TextInput, KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/appStore';
import { CHARACTERS, CharacterId } from '../../constants/AppData';
import AnimatedCharacter, { Expression } from '../../components/AnimatedCharacter';
import { API_URL } from '../../utils/api';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Puzzle {
  id: string;
  type: string;
  title: string;
  emoji: string;
  question: string;
  hint1?: string;
  hint2?: string;
  buddy_guide: string;
  difficulty: number;
}

interface HintState { shown: 0 | 1 | 2 }

const TYPE_COLORS: Record<string, [string, string]> = {
  pattern:      ['#6366F1', '#8B5CF6'],
  strategy:     ['#DC2626', '#EF4444'],
  detective:    ['#D97706', '#F59E0B'],
  india:        ['#059669', '#10B981'],
  visual:       ['#0891B2', '#06B6D4'],
  money:        ['#7C3AED', '#8B5CF6'],
  word_problem: ['#DB2777', '#EC4899'],
  logic:        ['#374151', '#6B7280'],
  real_world:   ['#065F46', '#059669'],
  measurement:  ['#9A3412', '#EA580C'],
};

const TYPE_LABELS: Record<string, string> = {
  pattern:      '🔢 Number Pattern',
  strategy:     '♟️ Strategy',
  detective:    '🕵️ Number Detective',
  india:        '🇮🇳 India Maths',
  visual:       '👁️ Visual',
  money:        '💰 Money Maths',
  word_problem: '📝 Word Problem',
  logic:        '🧠 Logic',
  real_world:   '🌍 Real World',
  measurement:  '📏 Measurement',
};

const DIFFICULTY_STARS = ['', '⭐', '⭐⭐', '⭐⭐⭐'];

export default function MathsQuestScreen() {
  const router   = useRouter();
  const { user } = useAppStore();
  const classId  = user?.current_class || 'class3';
  const charId   = (user?.selected_character as CharacterId) || 'cat';
  const character = CHARACTERS[charId] || CHARACTERS.cat;

  const [puzzle,      setPuzzle]      = useState<Puzzle | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [phase,       setPhase]       = useState<'intro'|'solving'|'done'>('intro');
  const [hints,       setHints]       = useState<HintState>({ shown: 0 });
  const [hintTexts,   setHintTexts]   = useState<string[]>([]);
  const [answer,      setAnswer]      = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [result,      setResult]      = useState<any>(null);
  const [expression,  setExpression]  = useState<Expression>('thinking');
  const [buddyMsg,    setBuddyMsg]    = useState('');

  const bounceAnim = useRef(new Animated.Value(1)).current;
  const scrollRef  = useRef<ScrollView>(null);

  const bounce = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 1.15, duration: 200, useNativeDriver: true }),
      Animated.timing(bounceAnim, { toValue: 1,    duration: 200, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API_URL}/api/maths-quest/${classId}`);
        const data = await res.json();
        if (data.success) setPuzzle(data.puzzle);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [classId]);

  const startSolving = () => {
    setPhase('solving');
    setBuddyMsg(puzzle?.buddy_guide || "Think carefully! What do you notice first?");
    setExpression('thinking');
    bounce();
  };

  const requestHint = async (hintNum: 1 | 2) => {
    if (!puzzle) return;
    if (hintTexts.length >= hintNum) return;
    try {
      const res  = await fetch(`${API_URL}/api/maths-quest/hint/${puzzle.id}?hint_number=${hintNum}`);
      const data = await res.json();
      if (data.hint) {
        setHintTexts(prev => [...prev, data.hint]);
        setHints({ shown: hintNum });
        setBuddyMsg(`Hint ${hintNum}: ${data.hint}`);
        setExpression('happy');
        bounce();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const submitAnswer = async () => {
    if (!puzzle || !answer.trim() || submitting) return;
    setSubmitting(true);
    setExpression('excited');
    try {
      const res  = await fetch(`${API_URL}/api/maths-quest/attempt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id:        user?.user_id,
          puzzle_id:      puzzle.id,
          answer_given:   answer.trim(),
          hints_used:     hints.shown,
          time_taken_seconds: 0,
        }),
      });
      const data = await res.json();
      setResult(data);
      setPhase('done');
      setExpression(data.correct ? 'proud' : 'happy');
      bounce();
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const colors = TYPE_COLORS[puzzle?.type || 'pattern'] || ['#6366F1', '#8B5CF6'];

  if (loading) {
    return (
      <View style={qs.loadWrap}>
        <AnimatedCharacter character={charId as any} expression="thinking" size={90} />
        <ActivityIndicator size="large" color="#F59E0B" style={{ marginTop: 12 }} />
        <Text style={qs.loadText}>Preparing your quest...</Text>
      </View>
    );
  }

  if (!puzzle) {
    return (
      <View style={qs.loadWrap}>
        <Text style={qs.loadText}>No puzzle available. Check back soon!</Text>
        <TouchableOpacity style={qs.backBtn2} onPress={() => router.back()}>
          <Text style={qs.backBtn2Text}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={qs.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <LinearGradient colors={colors} style={qs.header}>
        <TouchableOpacity onPress={() => router.back()} style={qs.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={qs.headerMid}>
          <Text style={qs.headerTitle}>🧩 Maths Quest</Text>
          <Text style={qs.headerSub}>Daily Puzzle</Text>
        </View>
        <View style={qs.starsWrap}>
          <Text style={qs.diffStars}>{DIFFICULTY_STARS[puzzle.difficulty]}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        ref={scrollRef}
        style={qs.scroll}
        contentContainerStyle={qs.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Puzzle type badge + title */}
        <View style={qs.typeRow}>
          <LinearGradient colors={colors} style={qs.typeBadge}>
            <Text style={qs.typeText}>{TYPE_LABELS[puzzle.type] || puzzle.type}</Text>
          </LinearGradient>
        </View>

        {/* Puzzle card */}
        <View style={qs.puzzleCard}>
          <Text style={qs.puzzleEmoji}>{puzzle.emoji}</Text>
          <Text style={qs.puzzleTitle}>{puzzle.title}</Text>
          <View style={qs.divider} />
          <Text style={qs.puzzleQuestion}>{puzzle.question}</Text>
        </View>

        {/* INTRO */}
        {phase === 'intro' && (
          <View style={qs.introWrap}>
            <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
              <AnimatedCharacter character={charId as any} expression="thinking" size={100} />
            </Animated.View>
            <Text style={qs.introTitle}>Ready to think? 🤔</Text>
            <Text style={qs.introSub}>
              Take your time. There is no rush. {character.name} will give you hints if you need them!
            </Text>
            <Text style={qs.introStars}>
              No hints = ⭐⭐⭐ · One hint = ⭐⭐ · Two hints = ⭐
            </Text>
            <TouchableOpacity onPress={startSolving}>
              <LinearGradient colors={colors} style={qs.startBtn}>
                <Text style={qs.startBtnText}>Start Solving! 🧠</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* SOLVING */}
        {phase === 'solving' && (
          <View style={qs.solvingWrap}>
            {/* Buddy guidance bubble */}
            <View style={qs.buddyRow}>
              <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
                <AnimatedCharacter character={charId as any} expression={expression} size={70} />
              </Animated.View>
              <View style={qs.buddyBubble}>
                <Text style={qs.buddyBubbleText}>{buddyMsg}</Text>
              </View>
            </View>

            {/* Hints revealed */}
            {hintTexts.map((h, i) => (
              <View key={i} style={qs.hintCard}>
                <Text style={qs.hintLabel}>💡 Hint {i + 1}</Text>
                <Text style={qs.hintText}>{h}</Text>
              </View>
            ))}

            {/* Hint buttons */}
            <View style={qs.hintBtnRow}>
              {hints.shown < 1 && (
                <TouchableOpacity style={qs.hintBtn} onPress={() => requestHint(1)}>
                  <Text style={qs.hintBtnText}>Get Hint 1 (−1 star)</Text>
                </TouchableOpacity>
              )}
              {hints.shown === 1 && (
                <TouchableOpacity style={qs.hintBtn} onPress={() => requestHint(2)}>
                  <Text style={qs.hintBtnText}>Get Hint 2 (−1 more star)</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Answer input */}
            <View style={qs.answerSection}>
              <Text style={qs.answerLabel}>Your answer:</Text>
              <TextInput
                style={qs.answerInput}
                value={answer}
                onChangeText={setAnswer}
                placeholder="Type your answer here..."
                placeholderTextColor="#9CA3AF"
                multiline
                maxLength={200}
              />
              <TouchableOpacity
                style={[qs.submitBtn, (!answer.trim() || submitting) && qs.submitBtnDisabled]}
                onPress={submitAnswer}
                disabled={!answer.trim() || submitting}
              >
                {submitting
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={qs.submitBtnText}>Submit Answer ✓</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* DONE */}
        {phase === 'done' && result && (
          <View style={qs.doneWrap}>
            {/* Result header */}
            <Animated.View style={{ transform: [{ scale: bounceAnim }], alignItems: 'center' }}>
              <AnimatedCharacter character={charId as any} expression={expression} size={110} />
            </Animated.View>

            <View style={[qs.resultBanner, result.correct ? qs.resultCorrect : qs.resultTried]}>
              <Text style={qs.resultIcon}>{result.correct ? '🎉' : '💪'}</Text>
              <Text style={qs.resultTitle}>{result.correct ? 'Brilliant!' : 'Great effort!'}</Text>
              <Text style={qs.resultMsg}>{result.message}</Text>
              <View style={qs.starsRow}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Text key={i} style={{ fontSize: 24, opacity: i < result.stars_earned ? 1 : 0.2 }}>⭐</Text>
                ))}
              </View>
              <Text style={qs.starsEarned}>+{result.stars_earned} stars</Text>
            </View>

            {/* Full answer */}
            <View style={qs.answerReveal}>
              <Text style={qs.answerRevealLabel}>✅ The Answer</Text>
              <Text style={qs.answerRevealText}>{result.answer}</Text>
            </View>

            {/* Explanation */}
            <View style={qs.explanationCard}>
              <Text style={qs.explanationLabel}>🔍 How to solve it</Text>
              <Text style={qs.explanationText}>{result.explanation}</Text>
            </View>

            {/* Buddy guide */}
            {result.buddy_guide && (
              <View style={qs.buddyGuideCard}>
                <Text style={qs.buddyGuideLabel}>{character.name} says:</Text>
                <Text style={qs.buddyGuideText}>{result.buddy_guide}</Text>
              </View>
            )}

            <TouchableOpacity style={qs.doneHomeBtn} onPress={() => router.back()}>
              <Text style={qs.doneHomeBtnText}>Back to Inquisitive Hub 🏠</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const qs = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#F3F4F6' },
  loadWrap:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  loadText:      { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  backBtn2:      { marginTop: 12, backgroundColor: '#6366F1', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  backBtn2Text:  { color: '#fff', fontWeight: '600' },
  header:        { flexDirection: 'row', alignItems: 'center', paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16 },
  backBtn:       { padding: 6 },
  headerMid:     { flex: 1, alignItems: 'center' },
  headerTitle:   { fontSize: 18, fontWeight: '700', color: '#fff' },
  headerSub:     { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  starsWrap:     { width: 50, alignItems: 'flex-end' },
  diffStars:     { fontSize: 13 },
  scroll:        { flex: 1 },
  scrollContent: { padding: 16 },
  // Type badge
  typeRow:       { marginBottom: 10 },
  typeBadge:     { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, alignSelf: 'flex-start' },
  typeText:      { fontSize: 12, fontWeight: '600', color: '#fff' },
  // Puzzle card
  puzzleCard:    { backgroundColor: '#fff', borderRadius: 18, padding: 20, marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
  puzzleEmoji:   { fontSize: 36, marginBottom: 4 },
  puzzleTitle:   { fontSize: 19, fontWeight: '700', color: '#1F2937', marginBottom: 10 },
  divider:       { height: 1, backgroundColor: '#F3F4F6', marginBottom: 12 },
  puzzleQuestion:{ fontSize: 16, color: '#111827', lineHeight: 26, fontWeight: '500' },
  // Intro
  introWrap:     { alignItems: 'center', gap: 12, paddingTop: 4 },
  introTitle:    { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  introSub:      { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  introStars:    { fontSize: 12, color: '#9CA3AF', textAlign: 'center' },
  startBtn:      { borderRadius: 14, paddingHorizontal: 32, paddingVertical: 15, marginTop: 4 },
  startBtnText:  { fontSize: 17, fontWeight: '700', color: '#fff' },
  // Solving
  solvingWrap:   { gap: 12 },
  buddyRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  buddyBubble:   { flex: 1, backgroundColor: '#fff', borderRadius: 14, borderBottomLeftRadius: 4, padding: 12, borderWidth: 0.5, borderColor: '#E5E7EB' },
  buddyBubbleText:{ fontSize: 13, color: '#374151', lineHeight: 20 },
  hintCard:      { backgroundColor: '#FFF7ED', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#FED7AA' },
  hintLabel:     { fontSize: 11, fontWeight: '600', color: '#C2410C', marginBottom: 4 },
  hintText:      { fontSize: 13, color: '#92400E', lineHeight: 19 },
  hintBtnRow:    { flexDirection: 'row', gap: 8 },
  hintBtn:       { borderRadius: 10, backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FED7AA', paddingHorizontal: 14, paddingVertical: 8 },
  hintBtnText:   { fontSize: 12, color: '#C2410C', fontWeight: '500' },
  answerSection: { gap: 8 },
  answerLabel:   { fontSize: 14, fontWeight: '600', color: '#374151' },
  answerInput:   { backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 15, color: '#111827', borderWidth: 1, borderColor: '#E5E7EB', minHeight: 60 },
  submitBtn:     { backgroundColor: '#6366F1', borderRadius: 12, padding: 15, alignItems: 'center' },
  submitBtnDisabled:{ opacity: 0.4 },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  // Done
  doneWrap:      { gap: 14, alignItems: 'stretch' },
  resultBanner:  { borderRadius: 16, padding: 18, alignItems: 'center', gap: 4 },
  resultCorrect: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#6EE7B7' },
  resultTried:   { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE' },
  resultIcon:    { fontSize: 32 },
  resultTitle:   { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  resultMsg:     { fontSize: 13, color: '#6B7280', textAlign: 'center' },
  starsRow:      { flexDirection: 'row', gap: 4, marginTop: 6 },
  starsEarned:   { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  answerReveal:  { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#86EFAC' },
  answerRevealLabel:{ fontSize: 12, fontWeight: '600', color: '#166534', marginBottom: 4 },
  answerRevealText:{ fontSize: 15, color: '#14532D', fontWeight: '500', lineHeight: 22 },
  explanationCard:{ backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 0.5, borderColor: '#E5E7EB' },
  explanationLabel:{ fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 6 },
  explanationText:{ fontSize: 13, color: '#374151', lineHeight: 21 },
  buddyGuideCard: { backgroundColor: '#EEF2FF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#C7D2FE' },
  buddyGuideLabel:{ fontSize: 12, fontWeight: '600', color: '#3730A3', marginBottom: 4 },
  buddyGuideText: { fontSize: 13, color: '#4338CA', lineHeight: 20 },
  doneHomeBtn:   { backgroundColor: '#6366F1', borderRadius: 14, padding: 15, alignItems: 'center', marginTop: 4 },
  doneHomeBtnText:{ fontSize: 16, fontWeight: '700', color: '#fff' },
});
