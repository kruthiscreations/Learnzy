/**
 * Math Play Zone
 * Phase-based hands-on activities, interactive games,
 * new mental math tricks, and Math Mindset tools.
 * Inspired by the PlayMath.org and document methodology.
 * No duplication with Maths Magic or Maths Quest.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Animated, Modal, Dimensions,
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
interface Activity {
  id: string; title: string; emoji: string; type: string;
  description: string; instructions: string; buddy_prompt: string;
  duration_min: number; stars: number; interactive?: boolean;
}
interface Phase {
  id: string; title: string; subtitle: string; emoji: string;
  color: string; description: string; activities: Activity[];
}
interface Trick {
  id: string; title: string; emoji: string; description: string;
  the_trick: string; steps: string[]; example: string;
  practice: { q: string; a: string }[]; why_it_works: string;
}
interface Game {
  id: string; title: string; emoji: string; type: string;
  description: string; how_to_play_with_buddy: string;
  skill: string; stars: number; players: string; difficulty: number;
}
interface Mindset {
  title: string; emoji: string;
  buddy_anxiety_responses: { trigger: string; response: string }[];
  confidence_boosters: string[];
  daily_affirmations: string[];
}

type Tab = 'activities' | 'tricks' | 'games' | 'mindset';

// ── Activity Card ─────────────────────────────────────────────────────────────
function ActivityCard({ activity, color, onStart }: {
  activity: Activity; color: string; onStart: () => void;
}) {
  return (
    <View style={ac.card}>
      <View style={ac.header}>
        <Text style={ac.emoji}>{activity.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={ac.title}>{activity.title}</Text>
          <Text style={ac.desc}>{activity.description}</Text>
        </View>
        <View style={ac.meta}>
          <Text style={ac.dur}>⏱ {activity.duration_min}m</Text>
          <Text style={ac.stars}>{'⭐'.repeat(activity.stars)}</Text>
        </View>
      </View>
      <Text style={ac.instructions}>{activity.instructions}</Text>
      <TouchableOpacity
        style={[ac.startBtn, { backgroundColor: color }]}
        onPress={onStart}
        activeOpacity={0.85}
      >
        <Text style={ac.startBtnText}>
          {activity.interactive ? '▶ Play with Buddy' : '✓ Mark as Done'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Trick Card ────────────────────────────────────────────────────────────────
function TrickCard({ trick }: { trick: Trick }) {
  const [open, setOpen] = useState(false);
  return (
    <TouchableOpacity style={tc.card} onPress={() => setOpen(!open)} activeOpacity={0.88}>
      <View style={tc.header}>
        <Text style={tc.emoji}>{trick.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={tc.title}>{trick.title}</Text>
          <Text style={tc.desc} numberOfLines={open ? 0 : 1}>{trick.description}</Text>
        </View>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color="#9CA3AF" />
      </View>
      {open && (
        <View style={tc.body}>
          <View style={tc.trickBox}>
            <Text style={tc.trickLabel}>The Trick</Text>
            <Text style={tc.trickText}>{trick.the_trick}</Text>
          </View>
          {trick.steps.map((s, i) => (
            <View key={i} style={tc.stepRow}>
              <View style={tc.stepDot}><Text style={tc.stepNum}>{i + 1}</Text></View>
              <Text style={tc.stepText}>{s}</Text>
            </View>
          ))}
          <View style={tc.exBox}>
            <Text style={tc.exLabel}>✨ Example</Text>
            <Text style={tc.exText}>{trick.example}</Text>
          </View>
          <Text style={tc.practiceLabel}>🎯 Try these:</Text>
          {trick.practice.map((p, i) => (
            <Text key={i} style={tc.practiceRow}>
              {p.q}{' '}
              <Text style={tc.practiceAns}>→ {p.a}</Text>
            </Text>
          ))}
          <View style={tc.whyBox}>
            <Text style={tc.whyLabel}>🔬 Why it works</Text>
            <Text style={tc.whyText}>{trick.why_it_works}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ── Game Card ─────────────────────────────────────────────────────────────────
function GameCard({ game, charId, charName, onPlay }: {
  game: Game; charId: string; charName: string; onPlay: () => void;
}) {
  const DIFF = ['', '⭐', '⭐⭐', '⭐⭐⭐'];
  return (
    <View style={gc.card}>
      <View style={gc.header}>
        <Text style={gc.emoji}>{game.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={gc.title}>{game.title}</Text>
          <Text style={gc.skill}>Skill: {game.skill}</Text>
        </View>
        <Text style={gc.diff}>{DIFF[game.difficulty]}</Text>
      </View>
      <Text style={gc.desc}>{game.description}</Text>
      <View style={gc.infoRow}>
        <Text style={gc.info}>👥 {game.players}</Text>
        <Text style={gc.info}>⭐ Earn {game.stars} stars</Text>
      </View>
      <TouchableOpacity style={gc.playBtn} onPress={onPlay} activeOpacity={0.85}>
        <Text style={gc.playBtnText}>Play with {charName}! 🎮</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MathPlayScreen() {
  const router   = useRouter();
  const { user } = useAppStore();
  const classId  = user?.current_class || 'class3';
  const charId   = (user?.selected_character as CharacterId) || 'cat';
  const character = CHARACTERS[charId] || CHARACTERS.cat;

  const [tab,       setTab]       = useState<Tab>('activities');
  const [phase,     setPhase]     = useState<Phase | null>(null);
  const [tricks,    setTricks]    = useState<Trick[]>([]);
  const [games,     setGames]     = useState<Game[]>([]);
  const [mindset,   setMindset]   = useState<Mindset | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState<{ visible: boolean; activity?: Activity; game?: Game }>({ visible: false });
  const [expression,setExpression]= useState<Expression>('happy');
  const [affIdx,    setAffIdx]    = useState(0);

  const bounceAnim = useRef(new Animated.Value(1)).current;

  const bounce = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 1.1, duration: 180, useNativeDriver: true }),
      Animated.timing(bounceAnim, { toValue: 1,   duration: 180, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    (async () => {
      try {
        const [phRes, trRes, gmRes, mdRes] = await Promise.all([
          fetch(`${API_URL}/api/math-play/phase/${classId}`),
          fetch(`${API_URL}/api/math-play/tricks-new/${classId}`),
          fetch(`${API_URL}/api/math-play/games/${classId}`),
          fetch(`${API_URL}/api/math-play/mindset`),
        ]);
        const [ph, tr, gm, md] = await Promise.all([phRes.json(), trRes.json(), gmRes.json(), mdRes.json()]);
        if (ph.success) setPhase(ph.phase);
        if (tr.success) setTricks(tr.tricks || []);
        if (gm.success) setGames(gm.games || []);
        if (md.success) setMindset(md.mindset);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();

    // Rotate affirmation
    const timer = setInterval(() => setAffIdx(i => i + 1), 8000);
    return () => clearInterval(timer);
  }, [classId]);

  const markActivityDone = async (activity: Activity) => {
    try {
      await fetch(`${API_URL}/api/math-play/complete-activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.user_id,
          activity_id: activity.id,
          phase_id: phase?.id,
          stars_earned: activity.stars,
        }),
      });
      setExpression('proud');
      bounce();
      setModal({ visible: false });
    } catch (e) { console.error(e); }
  };

  const TABS: { id: Tab; label: string; emoji: string }[] = [
    { id: 'activities', label: 'Activities', emoji: '🎯' },
    { id: 'tricks',     label: 'New Tricks', emoji: '🧠' },
    { id: 'games',      label: 'Games',      emoji: '🎮' },
    { id: 'mindset',    label: 'Mindset',    emoji: '💪' },
  ];

  const phaseColor = phase?.color || '#6366F1';
  const affirmations = mindset?.daily_affirmations || [];
  const currentAff = affirmations.length ? affirmations[affIdx % affirmations.length] : '';

  if (loading) {
    return (
      <View style={ms.loadWrap}>
        <AnimatedCharacter character={charId as any} expression="thinking" size={90} />
        <ActivityIndicator color="#6366F1" size="large" style={{ marginTop: 12 }} />
        <Text style={ms.loadText}>Loading Math Play Zone...</Text>
      </View>
    );
  }

  return (
    <View style={ms.container}>

      {/* Header */}
      <LinearGradient colors={[phaseColor, '#6366F1']} style={ms.header}>
        <TouchableOpacity onPress={() => router.back()} style={ms.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={ms.headerMid}>
          <Text style={ms.headerTitle}>
            {phase?.emoji} {phase?.title || 'Math Play'}
          </Text>
          <Text style={ms.headerSub}>{phase?.subtitle}</Text>
        </View>
        <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
          <AnimatedCharacter character={charId as any} expression={expression} size={48} />
        </Animated.View>
      </LinearGradient>

      {/* Affirmation ticker */}
      {currentAff ? (
        <View style={ms.affWrap}>
          <Text style={ms.affText} numberOfLines={1}>💬 {currentAff}</Text>
        </View>
      ) : null}

      {/* Tabs */}
      <View style={ms.tabRow}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.id}
            style={[ms.tabBtn, tab === t.id && { borderBottomColor: phaseColor, borderBottomWidth: 2 }]}
            onPress={() => setTab(t.id)}
          >
            <Text style={ms.tabEmoji}>{t.emoji}</Text>
            <Text style={[ms.tabLabel, tab === t.id && { color: phaseColor, fontWeight: '600' }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={ms.scroll} contentContainerStyle={{ padding: 14, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}>

        {/* ── ACTIVITIES ── */}
        {tab === 'activities' && (
          <>
            <View style={ms.sectionIntro}>
              <Text style={ms.sectionTitle}>{phase?.description}</Text>
            </View>
            {(phase?.activities || []).map(act => (
              <ActivityCard
                key={act.id}
                activity={act}
                color={phaseColor}
                onStart={() => {
                  setModal({ visible: true, activity: act });
                  setExpression('excited');
                }}
              />
            ))}
          </>
        )}

        {/* ── NEW TRICKS ── */}
        {tab === 'tricks' && (
          <>
            <View style={ms.sectionIntro}>
              <Text style={ms.sectionTitle}>
                6 new mental math tricks — different from your Maths Magic tricks!
              </Text>
            </View>
            {tricks.length === 0 && (
              <Text style={ms.emptyText}>No new tricks for this class yet!</Text>
            )}
            {tricks.map(t => <TrickCard key={t.id} trick={t} />)}
          </>
        )}

        {/* ── GAMES ── */}
        {tab === 'games' && (
          <>
            <View style={ms.sectionIntro}>
              <Text style={ms.sectionTitle}>
                Interactive games to play with {character.name}!
              </Text>
            </View>
            {games.length === 0 && (
              <Text style={ms.emptyText}>No games available for this class!</Text>
            )}
            {games.map(g => (
              <GameCard
                key={g.id}
                game={g}
                charId={charId}
                charName={character.name}
                onPlay={() => {
                  setModal({ visible: true, game: g });
                  setExpression('excited');
                }}
              />
            ))}
          </>
        )}

        {/* ── MINDSET ── */}
        {tab === 'mindset' && mindset && (
          <>
            {/* Anxiety responses */}
            <View style={ms.mindCard}>
              <Text style={ms.mindTitle}>😰 When Maths Feels Hard</Text>
              <Text style={ms.mindSub}>
                Tell {character.name} how you feel — they know exactly what to say!
              </Text>
              {mindset.buddy_anxiety_responses.map((r, i) => (
                <View key={i} style={ms.anxietyRow}>
                  <View style={ms.anxietyTrigger}>
                    <Text style={ms.anxietyTriggerText}>When you say: "{r.trigger}"</Text>
                  </View>
                  <View style={ms.anxietyResp}>
                    <Text style={ms.anxietyRespText}>{r.response}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Confidence boosters */}
            <View style={ms.mindCard}>
              <Text style={ms.mindTitle}>💪 Confidence Boosters</Text>
              {mindset.confidence_boosters.map((b, i) => (
                <View key={i} style={ms.boosterRow}>
                  <Text style={ms.boosterNum}>{i + 1}</Text>
                  <Text style={ms.boosterText}>{b}</Text>
                </View>
              ))}
            </View>

            {/* Daily affirmations */}
            <View style={[ms.mindCard, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }]}>
              <Text style={ms.mindTitle}>🌟 Daily Affirmations</Text>
              <Text style={ms.mindSub}>Say one of these out loud every morning:</Text>
              {mindset.daily_affirmations.map((a, i) => (
                <Text key={i} style={ms.affirmLine}>"{a}"</Text>
              ))}
            </View>
          </>
        )}

      </ScrollView>

      {/* ── MODAL — Activity or Game ── */}
      <Modal
        visible={modal.visible}
        transparent
        animationType="slide"
        onRequestClose={() => setModal({ visible: false })}
      >
        <View style={ms.modalOverlay}>
          <View style={ms.modalBox}>
            <TouchableOpacity style={ms.modalClose} onPress={() => setModal({ visible: false })}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>

            {modal.activity && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={ms.modalEmoji}>{modal.activity.emoji}</Text>
                <Text style={ms.modalTitle}>{modal.activity.title}</Text>
                <View style={ms.modalSection}>
                  <Text style={ms.modalSectionLabel}>📋 What to do</Text>
                  <Text style={ms.modalBody}>{modal.activity.instructions}</Text>
                </View>
                <View style={ms.modalSection}>
                  <Text style={ms.modalSectionLabel}>🤖 {character.name} will help by</Text>
                  <Text style={ms.modalBody}>{modal.activity.buddy_prompt}</Text>
                </View>
                <View style={ms.modalMetaRow}>
                  <Text style={ms.modalMeta}>⏱ {modal.activity.duration_min} minutes</Text>
                  <Text style={ms.modalMeta}>{'⭐'.repeat(modal.activity.stars)} on completion</Text>
                </View>
                <TouchableOpacity
                  style={[ms.modalDoneBtn, { backgroundColor: phaseColor }]}
                  onPress={() => markActivityDone(modal.activity!)}
                >
                  <Text style={ms.modalDoneBtnText}>I Did This! Claim Stars ⭐</Text>
                </TouchableOpacity>
                {modal.activity.interactive && (
                  <TouchableOpacity
                    style={ms.modalChatBtn}
                    onPress={() => {
                      setModal({ visible: false });
                      router.push(`/chat/${charId}` as any);
                    }}
                  >
                    <Text style={ms.modalChatBtnText}>Play with {character.name} in Chat →</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}

            {modal.game && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={ms.modalEmoji}>{modal.game.emoji}</Text>
                <Text style={ms.modalTitle}>{modal.game.title}</Text>
                <View style={ms.modalSection}>
                  <Text style={ms.modalSectionLabel}>🎮 How to play</Text>
                  <Text style={ms.modalBody}>{modal.game.how_to_play_with_buddy}</Text>
                </View>
                <View style={ms.modalMetaRow}>
                  <Text style={ms.modalMeta}>🧠 {modal.game.skill}</Text>
                  <Text style={ms.modalMeta}>⭐ Earn {modal.game.stars} stars</Text>
                </View>
                <TouchableOpacity
                  style={[ms.modalDoneBtn, { backgroundColor: phaseColor }]}
                  onPress={() => {
                    setModal({ visible: false });
                    router.push(`/chat/${charId}` as any);
                  }}
                >
                  <Text style={ms.modalDoneBtnText}>Open Chat to Play! 🎮</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const ms = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  loadWrap:  { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadText:  { fontSize: 14, color: '#6B7280' },
  header:    { flexDirection: 'row', alignItems: 'center', paddingTop: 52, paddingBottom: 12, paddingHorizontal: 14, gap: 10 },
  backBtn:   { padding: 6 },
  headerMid: { flex: 1 },
  headerTitle:{ fontSize: 17, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  affWrap:   { backgroundColor: '#312E81', paddingHorizontal: 14, paddingVertical: 6 },
  affText:   { fontSize: 11, color: '#A5B4FC', fontStyle: 'italic' },
  tabRow:    { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB' },
  tabBtn:    { flex: 1, alignItems: 'center', paddingVertical: 10, gap: 2, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabEmoji:  { fontSize: 16 },
  tabLabel:  { fontSize: 10, color: '#9CA3AF', fontWeight: '500' },
  scroll:    { flex: 1 },
  sectionIntro: { marginBottom: 12 },
  sectionTitle: { fontSize: 13, color: '#6B7280', lineHeight: 20 },
  emptyText: { textAlign: 'center', color: '#9CA3AF', marginTop: 40 },
  // Mindset
  mindCard:  { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 0.5, borderColor: '#E5E7EB' },
  mindTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  mindSub:   { fontSize: 12, color: '#6B7280', marginBottom: 12 },
  anxietyRow:{ marginBottom: 14 },
  anxietyTrigger:{ backgroundColor: '#FEF2F2', borderRadius: 8, padding: 8, marginBottom: 4 },
  anxietyTriggerText:{ fontSize: 12, color: '#DC2626', fontStyle: 'italic' },
  anxietyResp:{ backgroundColor: '#EFF6FF', borderRadius: 8, padding: 10 },
  anxietyRespText:{ fontSize: 13, color: '#1D4ED8', lineHeight: 20 },
  boosterRow:{ flexDirection: 'row', gap: 10, marginBottom: 10, alignItems: 'flex-start' },
  boosterNum:{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#6366F1', color: '#fff', textAlign: 'center', fontSize: 12, fontWeight: '700', lineHeight: 22 },
  boosterText:{ flex: 1, fontSize: 13, color: '#374151', lineHeight: 20 },
  affirmLine:{ fontSize: 13, color: '#3730A3', fontStyle: 'italic', marginBottom: 8, lineHeight: 20 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox:  { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  modalClose:{ alignSelf: 'flex-end', padding: 4, marginBottom: 8 },
  modalEmoji:{ fontSize: 40, textAlign: 'center', marginBottom: 6 },
  modalTitle:{ fontSize: 20, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 14 },
  modalSection:{ backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, marginBottom: 10 },
  modalSectionLabel:{ fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 5 },
  modalBody: { fontSize: 14, color: '#374151', lineHeight: 22 },
  modalMetaRow:{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  modalMeta: { fontSize: 12, color: '#6B7280' },
  modalDoneBtn:{ borderRadius: 14, padding: 15, alignItems: 'center', marginBottom: 8 },
  modalDoneBtnText:{ fontSize: 16, fontWeight: '700', color: '#fff' },
  modalChatBtn:{ borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  modalChatBtnText:{ fontSize: 14, fontWeight: '600', color: '#6366F1' },
});

const ac = StyleSheet.create({
  card:    { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 3 },
  header:  { flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'flex-start' },
  emoji:   { fontSize: 28, width: 36 },
  title:   { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  desc:    { fontSize: 12, color: '#6B7280' },
  meta:    { alignItems: 'flex-end', gap: 2 },
  dur:     { fontSize: 11, color: '#9CA3AF' },
  stars:   { fontSize: 12 },
  instructions:{ fontSize: 13, color: '#374151', lineHeight: 20, marginBottom: 10 },
  startBtn:{ borderRadius: 10, padding: 11, alignItems: 'center' },
  startBtnText:{ fontSize: 13, fontWeight: '700', color: '#fff' },
});

const tc = StyleSheet.create({
  card:    { backgroundColor: '#fff', borderRadius: 14, marginBottom: 10, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 3 },
  header:  { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  emoji:   { fontSize: 26, width: 34 },
  title:   { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 2 },
  desc:    { fontSize: 12, color: '#6B7280' },
  body:    { paddingHorizontal: 14, paddingBottom: 14 },
  trickBox:{ backgroundColor: '#EEF2FF', borderRadius: 10, padding: 10, marginBottom: 10 },
  trickLabel:{ fontSize: 11, fontWeight: '600', color: '#4338CA', marginBottom: 3 },
  trickText:{ fontSize: 13, color: '#3730A3', lineHeight: 19 },
  stepRow: { flexDirection: 'row', gap: 8, marginBottom: 5, alignItems: 'flex-start' },
  stepDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center' },
  stepNum: { fontSize: 11, color: '#fff', fontWeight: '700' },
  stepText:{ flex: 1, fontSize: 13, color: '#374151', lineHeight: 18 },
  exBox:   { backgroundColor: '#ECFDF5', borderRadius: 10, padding: 10, marginTop: 8, marginBottom: 8 },
  exLabel: { fontSize: 11, fontWeight: '600', color: '#065F46', marginBottom: 3 },
  exText:  { fontSize: 13, color: '#047857' },
  practiceLabel:{ fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 4 },
  practiceRow:{ fontSize: 13, color: '#374151', marginBottom: 3 },
  practiceAns:{ color: '#10B981', fontWeight: '700' },
  whyBox:  { backgroundColor: '#FFF7ED', borderRadius: 10, padding: 10, marginTop: 6 },
  whyLabel:{ fontSize: 11, fontWeight: '600', color: '#C2410C', marginBottom: 3 },
  whyText: { fontSize: 12, color: '#92400E', lineHeight: 18 },
});

const gc = StyleSheet.create({
  card:    { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 3 },
  header:  { flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'flex-start' },
  emoji:   { fontSize: 28, width: 36 },
  title:   { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  skill:   { fontSize: 11, color: '#6B7280' },
  diff:    { fontSize: 14 },
  desc:    { fontSize: 13, color: '#374151', lineHeight: 20, marginBottom: 8 },
  infoRow: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  info:    { fontSize: 12, color: '#6B7280' },
  playBtn: { backgroundColor: '#6366F1', borderRadius: 10, padding: 12, alignItems: 'center' },
  playBtnText:{ fontSize: 14, fontWeight: '700', color: '#fff' },
});
