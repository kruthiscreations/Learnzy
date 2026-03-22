import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useAppStore } from '../../store/appStore';

interface Segment {
  text: string;
  isError: boolean;
  correction?: string;
  tapped?: boolean;
}

interface Paragraph {
  id: string;
  title: string;
  emoji: string;
  level: string[];
  segments: Segment[];
  tip: string;
}

// Each paragraph is split into segments — some correct, some with deliberate mistakes
const PARAGRAPHS: Paragraph[] = [
  {
    id: 'p1',
    title: 'Ravi Goes to School',
    emoji: '🎒',
    level: ['lkg-1st', '2nd-3rd'],
    tip: 'Check: does the verb match the subject? (she go → she goes)',
    segments: [
      { text: 'Ravi ', isError: false },
      { text: 'wake', isError: true, correction: 'wakes' },
      { text: ' up early every morning. He ', isError: false },
      { text: 'eat', isError: true, correction: 'eats' },
      { text: ' breakfast and ', isError: false },
      { text: 'go', isError: true, correction: 'goes' },
      { text: ' to school. His teacher ', isError: false },
      { text: 'are', isError: true, correction: 'is' },
      { text: ' very kind. Ravi ', isError: false },
      { text: 'love', isError: true, correction: 'loves' },
      { text: ' learning new words every day.', isError: false },
    ],
    tip: 'When the subject is he/she/it, add -s or -es to the verb! (go → goes, eat → eats)',
  },
  {
    id: 'p2',
    title: 'The Mango Tree',
    emoji: '🥭',
    level: ['lkg-1st', '2nd-3rd'],
    tip: 'Look for wrong plurals and missing words.',
    segments: [
      { text: 'There ', isError: false },
      { text: 'are', isError: true, correction: 'is' },
      { text: ' a big mango tree in our village. It ', isError: false },
      { text: 'have', isError: true, correction: 'has' },
      { text: ' many ', isError: false },
      { text: 'leafs', isError: true, correction: 'leaves' },
      { text: '. In summer, we eat ', isError: false },
      { text: 'mango', isError: true, correction: 'mangoes' },
      { text: ' every day. The tree ', isError: false },
      { text: 'give', isError: true, correction: 'gives' },
      { text: ' us shade in the afternoon.', isError: false },
    ],
    tip: 'Leaf → Leaves, Mango → Mangoes. Irregular plurals need special attention!',
  },
  {
    id: 'p3',
    title: 'Priya\'s Painting',
    emoji: '🎨',
    level: ['2nd-3rd', '4th-5th'],
    tip: 'Check past tense verbs — did they use the right form?',
    segments: [
      { text: 'Yesterday, Priya ', isError: false },
      { text: 'paint', isError: true, correction: 'painted' },
      { text: ' a beautiful picture. She ', isError: false },
      { text: 'use', isError: true, correction: 'used' },
      { text: ' red, blue and yellow colours. Her mother ', isError: false },
      { text: 'see', isError: true, correction: 'saw' },
      { text: ' the painting and ', isError: false },
      { text: 'say', isError: true, correction: 'said' },
      { text: ' it was wonderful. Priya ', isError: false },
      { text: 'feel', isError: true, correction: 'felt' },
      { text: ' very happy.', isError: false },
    ],
    tip: 'For past tense: paint → painted, use → used. But see → saw, say → said (irregular!)',
  },
  {
    id: 'p4',
    title: 'A Trip to Hyderabad',
    emoji: '🏙️',
    level: ['4th-5th', '5th-adv'],
    tip: 'Look for wrong prepositions and articles.',
    segments: [
      { text: 'Last month, our family went ', isError: false },
      { text: 'on', isError: true, correction: 'to' },
      { text: ' Hyderabad. We visited ', isError: false },
      { text: 'a', isError: true, correction: 'the' },
      { text: ' Charminar and ', isError: false },
      { text: 'a', isError: true, correction: 'the' },
      { text: ' Golconda Fort. The food was ', isError: false },
      { text: 'very more', isError: true, correction: 'much more' },
      { text: ' delicious than we expected. We stayed ', isError: false },
      { text: 'on', isError: true, correction: 'at' },
      { text: ' a hotel for three days.', isError: false },
    ],
    tip: '"The" is used for specific things (the Charminar). "At" is used for locations (at a hotel).',
  },
  {
    id: 'p5',
    title: 'The Science Project',
    emoji: '🔬',
    level: ['4th-5th', '5th-adv'],
    tip: 'Check subject-verb agreement and tense consistency.',
    segments: [
      { text: 'Our class ', isError: false },
      { text: 'were', isError: true, correction: 'was' },
      { text: ' very excited about the science fair. Each student ', isError: false },
      { text: 'have', isError: true, correction: 'had' },
      { text: ' to build a working model. Arjun ', isError: false },
      { text: 'make', isError: true, correction: 'made' },
      { text: ' a solar system model. His project ', isError: false },
      { text: 'were', isError: true, correction: 'was' },
      { text: ' the most impressive. The judges ', isError: false },
      { text: 'gives', isError: true, correction: 'gave' },
      { text: ' him first prize.', isError: false },
    ],
    tip: '"Each" and "class" are singular — use "was", not "were". Past tense: gives → gave.',
  },
];

export default function SpotTheMistakeScreen() {
  const router = useRouter();
  const { user } = useAppStore();
  const [paraIndex, setParaIndex] = useState(0);
  const [segments, setSegments] = useState<Segment[]>(
    PARAGRAPHS[0].segments.map(s => ({ ...s, tapped: false }))
  );
  const [score, setScore] = useState(0);
  const [checked, setChecked] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [totalErrors, setTotalErrors] = useState(0);
  const [foundErrors, setFoundErrors] = useState(0);

  const level = user?.current_level || 'lkg-1st';

  // Filter paragraphs to user's level
  const availableParas = PARAGRAPHS.filter(p => p.level.includes(level));
  const usedParas = availableParas.length > 0 ? availableParas : PARAGRAPHS.slice(0, 3);

  const loadParagraph = (idx: number) => {
    const para = usedParas[idx];
    if (!para) return;
    setSegments(para.segments.map(s => ({ ...s, tapped: false })));
    setChecked(false);
    setTotalErrors(para.segments.filter(s => s.isError).length);
    setFoundErrors(0);
  };

  React.useEffect(() => {
    loadParagraph(0);
    setParaIndex(0);
  }, []);

  const handleTap = (idx: number) => {
    if (checked) return;
    setSegments(prev =>
      prev.map((s, i) => i === idx ? { ...s, tapped: !s.tapped } : s)
    );
  };

  const checkAnswers = () => {
    setChecked(true);
    let correct = 0;
    let found = 0;
    segments.forEach(s => {
      if (s.isError && s.tapped) { correct += 10; found++; }
      if (!s.isError && s.tapped) correct -= 5; // penalty for wrong taps
    });
    setScore(sc => sc + Math.max(0, correct));
    setFoundErrors(found);
  };

  const nextParagraph = () => {
    const next = paraIndex + 1;
    if (next >= usedParas.length) {
      setGameComplete(true);
    } else {
      setParaIndex(next);
      loadParagraph(next);
    }
  };

  const reset = () => {
    setParaIndex(0);
    setScore(0);
    setGameComplete(false);
    loadParagraph(0);
  };

  const para = usedParas[paraIndex];

  if (gameComplete) {
    return (
      <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.completeContainer}>
        <Animatable.View animation="bounceIn" style={styles.completeCard}>
          <Text style={styles.completeEmoji}>🕵️</Text>
          <Text style={styles.completeTitle}>Great Detective Work!</Text>
          <Text style={styles.completeScore}>Score: {score} ⭐</Text>
          <Text style={styles.completeSub}>You spotted all the mistakes!</Text>
          <TouchableOpacity style={styles.playAgainBtn} onPress={reset}>
            <Text style={styles.playAgainText}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeBtn} onPress={() => router.back()}>
            <Text style={styles.homeBtnText}>Back to Games</Text>
          </TouchableOpacity>
        </Animatable.View>
      </LinearGradient>
    );
  }

  if (!para) return null;

  const errorsInPara = para.segments.filter(s => s.isError).length;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#7C3AED', '#4F46E5']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🕵️ Spot the Mistake</Text>
        <Text style={styles.headerSubtitle}>Find the grammar errors — be the teacher!</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBadge}><Text style={styles.statText}>⭐ {score}</Text></View>
          <View style={styles.statBadge}><Text style={styles.statText}>{paraIndex + 1}/{usedParas.length}</Text></View>
          <View style={styles.statBadge}><Text style={styles.statText}>🐛 {errorsInPara} errors</Text></View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Story card */}
        <Animatable.View animation="fadeInDown" key={paraIndex} style={styles.storyCard}>
          <View style={styles.storyHeader}>
            <Text style={styles.storyEmoji}>{para.emoji}</Text>
            <Text style={styles.storyTitle}>{para.title}</Text>
          </View>
          <Text style={styles.instruction}>
            Tap the {errorsInPara} wrong word{errorsInPara > 1 ? 's' : ''} below:
          </Text>
          <View style={styles.paragraphBox}>
            <Text style={styles.paragraphText}>
              {segments.map((seg, i) => {
                let chipStyle: object = styles.wordNormal;
                let textStyle: object = styles.wordNormalText;

                if (seg.tapped && !checked) {
                  chipStyle = styles.wordTapped;
                  textStyle = styles.wordTappedText;
                } else if (checked) {
                  if (seg.isError && seg.tapped) {
                    chipStyle = styles.wordCorrectFind;
                    textStyle = styles.wordCorrectFindText;
                  } else if (seg.isError && !seg.tapped) {
                    chipStyle = styles.wordMissed;
                    textStyle = styles.wordMissedText;
                  } else if (!seg.isError && seg.tapped) {
                    chipStyle = styles.wordWrongTap;
                    textStyle = styles.wordWrongTapText;
                  }
                }

                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => handleTap(i)}
                    disabled={checked || !seg.text.trim()}
                    style={[styles.wordChip, chipStyle]}
                  >
                    <Text style={[styles.wordBase, textStyle]}>{seg.text}</Text>
                    {checked && seg.isError && (
                      <Text style={styles.correctionLabel}> → {seg.correction}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </Text>
          </View>
        </Animatable.View>

        {/* Grammar tip */}
        {checked && (
          <Animatable.View animation="fadeIn" style={styles.tipBox}>
            <Text style={styles.tipTitle}>💡 Grammar Tip</Text>
            <Text style={styles.tipText}>{para.tip}</Text>
            <Text style={styles.foundText}>
              You found {foundErrors} of {errorsInPara} errors!
            </Text>
          </Animatable.View>
        )}

        {/* Legend */}
        {checked && (
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.legendText}>Found correctly ✓</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.legendText}>Missed error</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
              <Text style={styles.legendText}>Wrong tap</Text>
            </View>
          </View>
        )}

        {/* Actions */}
        {!checked ? (
          <TouchableOpacity style={styles.checkBtn} onPress={checkAnswers}>
            <Text style={styles.checkBtnText}>Check My Answers 🔍</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextBtn} onPress={nextParagraph}>
            <Text style={styles.nextBtnText}>
              {paraIndex + 1 >= usedParas.length ? 'Finish 🏆' : 'Next Paragraph →'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  backButton: { marginBottom: 14 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  headerSubtitle: { fontSize: 14, color: '#fff', opacity: 0.9, marginBottom: 10 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5 },
  statText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  content: { padding: 20, gap: 16 },
  storyCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, gap: 14, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  storyHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  storyEmoji: { fontSize: 32 },
  storyTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  instruction: { fontSize: 14, color: '#6B7280', fontStyle: 'italic' },
  paragraphBox: { backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14 },
  paragraphText: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline' },
  wordChip: { marginVertical: 2 },
  wordNormal: {},
  wordNormalText: {},
  wordTapped: { backgroundColor: '#DBEAFE', borderRadius: 6, paddingHorizontal: 2 },
  wordTappedText: { color: '#1D4ED8', fontWeight: '700' },
  wordCorrectFind: { backgroundColor: '#D1FAE5', borderRadius: 6, paddingHorizontal: 2 },
  wordCorrectFindText: { color: '#065F46', fontWeight: '700' },
  wordMissed: { backgroundColor: '#FEF3C7', borderRadius: 6, paddingHorizontal: 2 },
  wordMissedText: { color: '#92400E', fontWeight: '700' },
  wordWrongTap: { backgroundColor: '#FEE2E2', borderRadius: 6, paddingHorizontal: 2 },
  wordWrongTapText: { color: '#991B1B' },
  wordBase: { fontSize: 18, color: '#1F2937', lineHeight: 32 },
  correctionLabel: { fontSize: 14, color: '#10B981', fontWeight: '700' },
  tipBox: { backgroundColor: '#EDE9FE', borderRadius: 16, padding: 16, gap: 8 },
  tipTitle: { fontSize: 16, fontWeight: '700', color: '#5B21B6' },
  tipText: { fontSize: 14, color: '#4C1D95', lineHeight: 22 },
  foundText: { fontSize: 14, fontWeight: '700', color: '#7C3AED', marginTop: 4 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 13, color: '#6B7280' },
  checkBtn: { backgroundColor: '#7C3AED', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  checkBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  nextBtn: { backgroundColor: '#4F46E5', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  completeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  completeCard: { backgroundColor: '#fff', borderRadius: 28, padding: 40, alignItems: 'center', width: '100%', gap: 12, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  completeEmoji: { fontSize: 64 },
  completeTitle: { fontSize: 30, fontWeight: 'bold', color: '#1F2937' },
  completeScore: { fontSize: 22, fontWeight: '700', color: '#F59E0B' },
  completeSub: { fontSize: 15, color: '#6B7280', textAlign: 'center' },
  playAgainBtn: { marginTop: 8, backgroundColor: '#7C3AED', borderRadius: 16, paddingVertical: 14, width: '100%', alignItems: 'center' },
  playAgainText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  homeBtn: { backgroundColor: '#F3F4F6', borderRadius: 16, paddingVertical: 12, width: '100%', alignItems: 'center' },
  homeBtnText: { color: '#374151', fontWeight: '600', fontSize: 16 },
});
