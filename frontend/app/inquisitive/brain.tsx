/**
 * Brain Challenges — Inquisitive Kid
 * Riddles · Lateral Thinking · Logic Puzzles · Number Mysteries
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/appStore';
import { CHARACTERS, CharacterId } from '../../constants/AppData';
import AnimatedCharacter, { Expression } from '../../components/AnimatedCharacter';
import { API_URL } from '../../utils/api';

const CAT_COLORS: Record<string, [string,string]> = {
  riddle:  ['#6366F1','#8B5CF6'],
  lateral: ['#D97706','#F59E0B'],
  logic:   ['#DC2626','#EF4444'],
  number:  ['#059669','#10B981'],
};
const CAT_LABELS: Record<string,string> = {
  riddle:'Classic Riddles', lateral:'Lateral Thinking', logic:'Logic Puzzles', number:'Number Mysteries'
};

interface Challenge {
  id:string; type:string; emoji:string; class_groups:string[];
  difficulty:number; question:string; answer:string; explanation:string; hint:string;
}

export default function BrainChallengesScreen() {
  const router    = useRouter();
  const { user }  = useAppStore();
  const classId   = user?.current_class || 'class3';
  const charId    = (user?.selected_character as CharacterId) || 'cat';
  const character = CHARACTERS[charId] || CHARACTERS.cat;

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [activeIdx,  setActiveIdx]  = useState(0);
  const [revealed,   setRevealed]   = useState<Set<string>>(new Set());
  const [hinted,     setHinted]     = useState<Set<string>>(new Set());
  const [completed,  setCompleted]  = useState<Set<string>>(new Set());
  const [expression, setExpression] = useState<Expression>('thinking');

  const bounceAnim = useRef(new Animated.Value(1)).current;
  const bounce = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 1.15, duration: 180, useNativeDriver: true }),
      Animated.timing(bounceAnim, { toValue: 1,    duration: 180, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API_URL}/api/brain-challenges/all/${classId}`);
        const data = await res.json();
        if (data.success) setChallenges(data.challenges || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [classId]);

  const revealAnswer = async (c: Challenge) => {
    const used = hinted.has(c.id);
    setRevealed(prev => new Set([...prev, c.id]));
    setExpression('proud');
    bounce();
    if (!completed.has(c.id)) {
      setCompleted(prev => new Set([...prev, c.id]));
      try {
        await fetch(`${API_URL}/api/brain-challenges/attempt`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user?.user_id, challenge_id: c.id, hint_used: used }),
        });
      } catch (e) { console.error(e); }
    }
  };

  const current = challenges[activeIdx];
  const colors  = current ? (CAT_COLORS[current.type] || ['#6366F1','#8B5CF6']) : ['#6366F1','#8B5CF6'];

  if (loading) return (
    <View style={bs.center}>
      <AnimatedCharacter character={charId as any} expression="thinking" size={90} />
      <ActivityIndicator color="#6366F1" size="large" style={{ marginTop: 12 }} />
    </View>
  );

  return (
    <View style={bs.container}>
      <LinearGradient colors={colors} style={bs.header}>
        <TouchableOpacity onPress={() => router.back()} style={bs.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={bs.headerMid}>
          <Text style={bs.headerTitle}>🧩 Brain Challenges</Text>
          <Text style={bs.headerSub}>{challenges.length} puzzles · {classId.toUpperCase()}</Text>
        </View>
        <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
          <AnimatedCharacter character={charId as any} expression={expression} size={46} />
        </Animated.View>
      </LinearGradient>

      {/* Category nav */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={bs.catScroll} contentContainerStyle={{ padding: 10, gap: 8, flexDirection: 'row' }}>
        {challenges.map((c, i) => (
          <TouchableOpacity key={c.id} style={[bs.catPill, activeIdx === i && { backgroundColor: CAT_COLORS[c.type]?.[0] || '#6366F1' }]}
            onPress={() => { setActiveIdx(i); setExpression('thinking'); }}>
            <Text style={[bs.catPillTxt, activeIdx === i && { color: '#fff' }]}>{c.emoji} {CAT_LABELS[c.type] || c.type}</Text>
            {completed.has(c.id) && <Text style={{ fontSize: 10, marginLeft: 2 }}>✓</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {current && (
        <ScrollView style={bs.scroll} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Category badge */}
          <LinearGradient colors={colors} style={bs.catBadge}>
            <Text style={bs.catBadgeTxt}>{current.emoji} {CAT_LABELS[current.type]}</Text>
            <Text style={bs.diffTxt}>{'⭐'.repeat(current.difficulty)}</Text>
          </LinearGradient>

          {/* Question */}
          <View style={bs.questionCard}>
            <Text style={bs.questionLabel}>Can you figure it out?</Text>
            <Text style={bs.questionTxt}>{current.question}</Text>
          </View>

          {/* Buddy guidance */}
          <View style={bs.buddyRow}>
            <AnimatedCharacter character={charId as any} expression={expression} size={62} />
            <View style={bs.buddyBubble}>
              <Text style={bs.buddyTxt}>
                {revealed.has(current.id)
                  ? `${character.name}: Great thinking! Here is the full explanation below.`
                  : `${character.name}: Take your time! Think about it carefully. There is no rush — the best thinkers are patient thinkers.`
                }
              </Text>
            </View>
          </View>

          {/* Hint */}
          {!revealed.has(current.id) && (
            <TouchableOpacity
              style={bs.hintBtn}
              onPress={() => { setHinted(prev => new Set([...prev, current.id])); setExpression('happy'); }}
            >
              <Text style={bs.hintBtnTxt}>
                {hinted.has(current.id) ? `💡 Hint: ${current.hint}` : '💡 Get a hint (costs 1 star)'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Reveal / Answer */}
          {!revealed.has(current.id) ? (
            <TouchableOpacity style={[bs.revealBtn, { backgroundColor: colors[0] }]} onPress={() => revealAnswer(current)}>
              <Text style={bs.revealBtnTxt}>Reveal Answer! {hinted.has(current.id) ? '⭐⭐' : '⭐⭐⭐'}</Text>
            </TouchableOpacity>
          ) : (
            <View style={bs.answerBox}>
              <Text style={bs.answerLabel}>✅ Answer</Text>
              <Text style={bs.answerTxt}>{current.answer}</Text>
              <View style={bs.expBox}>
                <Text style={bs.expLabel}>🔍 Explanation</Text>
                <Text style={bs.expTxt}>{current.explanation}</Text>
              </View>
              <Text style={bs.earnedTxt}>
                {completed.has(current.id) ? (hinted.has(current.id) ? 'Earned ⭐⭐' : 'Earned ⭐⭐⭐') : ''}
              </Text>
            </View>
          )}

          {/* Next challenge */}
          {activeIdx < challenges.length - 1 && (
            <TouchableOpacity style={bs.nextBtn} onPress={() => { setActiveIdx(i => i + 1); setExpression('thinking'); }}>
              <Text style={bs.nextBtnTxt}>Next Challenge →</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const bs = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  header:    { flexDirection: 'row', alignItems: 'center', paddingTop: 52, paddingBottom: 12, paddingHorizontal: 14, gap: 10 },
  backBtn:   { padding: 6 },
  headerMid: { flex: 1 },
  headerTitle:{ fontSize: 17, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  catScroll: { maxHeight: 52, backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB' },
  catPill:   { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 0.5, borderColor: '#E5E7EB', flexDirection: 'row', alignItems: 'center', gap: 4 },
  catPillTxt:{ fontSize: 12, fontWeight: '500', color: '#374151' },
  scroll:    { flex: 1 },
  catBadge:  { borderRadius: 12, padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  catBadgeTxt:{ fontSize: 13, fontWeight: '600', color: '#fff' },
  diffTxt:   { fontSize: 14 },
  questionCard:{ backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 0.5, borderColor: '#E5E7EB' },
  questionLabel:{ fontSize: 11, color: '#9CA3AF', fontWeight: '500', marginBottom: 6 },
  questionTxt:{ fontSize: 17, color: '#111827', lineHeight: 26, fontWeight: '500' },
  buddyRow:  { flexDirection: 'row', gap: 10, marginBottom: 12, alignItems: 'flex-start' },
  buddyBubble:{ flex: 1, backgroundColor: '#fff', borderRadius: 14, borderBottomLeftRadius: 4, padding: 12, borderWidth: 0.5, borderColor: '#E5E7EB' },
  buddyTxt:  { fontSize: 12, color: '#374151', lineHeight: 19 },
  hintBtn:   { backgroundColor: '#FFF7ED', borderRadius: 12, padding: 13, marginBottom: 10, borderWidth: 1, borderColor: '#FED7AA' },
  hintBtnTxt:{ fontSize: 13, color: '#C2410C', fontWeight: '500' },
  revealBtn: { borderRadius: 14, padding: 15, alignItems: 'center', marginBottom: 10 },
  revealBtnTxt:{ fontSize: 15, fontWeight: '700', color: '#fff' },
  answerBox: { backgroundColor: '#ECFDF5', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#6EE7B7', marginBottom: 10 },
  answerLabel:{ fontSize: 11, fontWeight: '600', color: '#065F46', marginBottom: 4 },
  answerTxt: { fontSize: 16, fontWeight: '700', color: '#065F46', marginBottom: 10 },
  expBox:    { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 8 },
  expLabel:  { fontSize: 11, fontWeight: '600', color: '#374151', marginBottom: 4 },
  expTxt:    { fontSize: 13, color: '#374151', lineHeight: 20 },
  earnedTxt: { fontSize: 14, textAlign: 'center', fontWeight: '600', color: '#065F46' },
  nextBtn:   { backgroundColor: '#6366F1', borderRadius: 14, padding: 14, alignItems: 'center', marginTop: 6 },
  nextBtnTxt:{ fontSize: 14, fontWeight: '700', color: '#fff' },
});
