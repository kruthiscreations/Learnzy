/**
 * Learnzy Missions — Real-world math challenges
 * Based on PlayMath.org + document methodology:
 * Kitchen Counting, Number Hunt, Grocery Run, Salute, etc.
 * Completely new — no duplication of Tricks/Quest/Exercise
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Animated, useRef,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/appStore';
import { CHARACTERS, CharacterId } from '../../constants/AppData';
import AnimatedCharacter from '../../components/AnimatedCharacter';
import { API_URL } from '../../utils/api';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Mission {
  id: string; phase: number; emoji: string; title: string;
  class_groups: string[]; where: string; time_minutes: number;
  what_you_need: string[]; description: string; steps: string[];
  buddy_prompt: string; concept: string; parent_tip: string;
}

const PHASE_LABELS: Record<number, { label: string; colors: [string,string]; desc: string }> = {
  1: { label: 'Foundational', colors: ['#10B981','#34D399'], desc: 'Counting, basic operations, shapes' },
  2: { label: 'Building Mastery', colors: ['#6366F1','#818CF8'], desc: 'Place value, multiplication, measurement' },
  3: { label: 'Advanced', colors: ['#D97706','#F59E0B'], desc: 'Fractions, ratios, geometry, data' },
};

function MissionCard({ mission, onComplete, completed }: {
  mission: Mission; onComplete: (id: string) => void; completed: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const phase = PHASE_LABELS[mission.phase];

  return (
    <View style={[mc.card, completed && mc.cardDone]}>
      {/* Header */}
      <TouchableOpacity onPress={() => setExpanded(e => !e)} style={mc.header} activeOpacity={0.85}>
        <LinearGradient colors={phase.colors} style={mc.iconBg}>
          <Text style={mc.icon}>{mission.emoji}</Text>
        </LinearGradient>
        <View style={{ flex: 1 }}>
          <Text style={mc.title}>{mission.title}</Text>
          <View style={mc.metaRow}>
            <Text style={mc.meta}>📍 {mission.where}</Text>
            <Text style={mc.meta}>⏱ {mission.time_minutes} min</Text>
          </View>
        </View>
        {completed
          ? <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          : <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} color="#9CA3AF" />
        }
      </TouchableOpacity>

      {/* Concept badge */}
      <View style={mc.conceptRow}>
        <Text style={mc.conceptText}>📚 {mission.concept}</Text>
      </View>

      {/* Expanded detail */}
      {expanded && !completed && (
        <View style={mc.body}>
          {/* Description */}
          <Text style={mc.desc}>{mission.description}</Text>

          {/* What you need */}
          <View style={mc.sectionBox}>
            <Text style={mc.sectionTitle}>🛍️ What you need</Text>
            {mission.what_you_need.map((item, i) => (
              <Text key={i} style={mc.listItem}>• {item}</Text>
            ))}
          </View>

          {/* Steps */}
          <View style={mc.sectionBox}>
            <Text style={mc.sectionTitle}>📋 How to do it</Text>
            {mission.steps.map((step, i) => (
              <View key={i} style={mc.stepRow}>
                <View style={mc.stepNum}><Text style={mc.stepNumText}>{i+1}</Text></View>
                <Text style={mc.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          {/* Buddy prompt */}
          <View style={mc.buddyBox}>
            <Text style={mc.buddyLabel}>💬 Ask your child:</Text>
            <Text style={mc.buddyText}>"{mission.buddy_prompt}"</Text>
          </View>

          {/* Parent tip */}
          <View style={mc.tipBox}>
            <Text style={mc.tipLabel}>👨‍👩‍👧 Parent tip</Text>
            <Text style={mc.tipText}>{mission.parent_tip}</Text>
          </View>

          {/* Complete button */}
          <TouchableOpacity style={mc.completeBtn} onPress={() => onComplete(mission.id)}>
            <Text style={mc.completeBtnText}>✅ We did this mission! (+5 stars)</Text>
          </TouchableOpacity>
        </View>
      )}

      {completed && (
        <View style={mc.doneTag}>
          <Text style={mc.doneTagText}>✓ Mission complete! +5 stars earned</Text>
        </View>
      )}
    </View>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MissionsScreen() {
  const router   = useRouter();
  const { user } = useAppStore();
  const classId  = user?.current_class || 'class3';
  const charId   = (user?.selected_character as CharacterId) || 'cat';

  const [missions,   setMissions]   = useState<Mission[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [completed,  setCompleted]  = useState<Set<string>>(new Set());
  const [filter,     setFilter]     = useState<number | null>(null);
  const [totalStars, setTotalStars] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const [mRes, pRes] = await Promise.all([
          fetch(`${API_URL}/api/missions/${classId}`),
          fetch(`${API_URL}/api/missions/progress/${user?.user_id}`),
        ]);
        const mData = await mRes.json();
        const pData = await pRes.json();
        setMissions(mData.missions || []);
        const doneIds = new Set<string>((pData.history || []).map((h: any) => h.mission_id));
        setCompleted(doneIds);
        setTotalStars(pData.total_stars || 0);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [classId]);

  const handleComplete = async (id: string) => {
    try {
      const res  = await fetch(
        `${API_URL}/api/missions/${id}/complete?user_id=${user?.user_id}`,
        { method: 'POST' }
      );
      const data = await res.json();
      if (data.success) {
        setCompleted(prev => new Set([...prev, id]));
        setTotalStars(prev => prev + (data.stars_earned || 5));
      }
    } catch (e) { console.error(e); }
  };

  const displayed = filter
    ? missions.filter(m => m.phase === filter)
    : missions;

  return (
    <View style={ms.container}>
      {/* Header */}
      <LinearGradient colors={['#1E3A5F','#2563EB']} style={ms.header}>
        <TouchableOpacity onPress={() => router.back()} style={ms.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={ms.headerMid}>
          <Text style={ms.headerTitle}>🚀 Learnzy Missions</Text>
          <Text style={ms.headerSub}>Real-world maths adventures</Text>
        </View>
        <View style={ms.starBadge}>
          <Text style={ms.starCount}>⭐ {totalStars}</Text>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={ms.loadWrap}>
          <AnimatedCharacter character={charId as any} expression="excited" size={100} />
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 12 }} />
          <Text style={ms.loadText}>Loading your missions...</Text>
        </View>
      ) : (
        <ScrollView style={ms.scroll} contentContainerStyle={ms.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Intro card */}
          <View style={ms.introCard}>
            <AnimatedCharacter character={charId as any} expression="excited" size={80} />
            <View style={{ flex: 1 }}>
              <Text style={ms.introTitle}>Maths in the real world! 🌍</Text>
              <Text style={ms.introSub}>
                These missions happen at home, in the kitchen, at the market — not on a screen.
                Complete a mission with your family and earn 5 stars!
              </Text>
            </View>
          </View>

          {/* Phase filter */}
          <View style={ms.filterRow}>
            <TouchableOpacity
              style={[ms.filterBtn, filter === null && ms.filterBtnOn]}
              onPress={() => setFilter(null)}
            >
              <Text style={[ms.filterText, filter === null && ms.filterTextOn]}>All</Text>
            </TouchableOpacity>
            {[1, 2, 3].map(p => (
              <TouchableOpacity
                key={p}
                style={[ms.filterBtn, filter === p && ms.filterBtnOn]}
                onPress={() => setFilter(p === filter ? null : p)}
              >
                <Text style={[ms.filterText, filter === p && ms.filterTextOn]}>
                  Phase {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Phase descriptions */}
          {filter && (
            <View style={[ms.phaseDesc, { borderLeftColor: PHASE_LABELS[filter].colors[0] }]}>
              <Text style={ms.phaseDescTitle}>{PHASE_LABELS[filter].label}</Text>
              <Text style={ms.phaseDescSub}>{PHASE_LABELS[filter].desc}</Text>
            </View>
          )}

          {/* Progress bar */}
          <View style={ms.progressCard}>
            <Text style={ms.progressLabel}>
              {completed.size} of {missions.length} missions complete
            </Text>
            <View style={ms.progressBarBg}>
              <View
                style={[ms.progressBarFill, {
                  width: `${missions.length ? (completed.size / missions.length) * 100 : 0}%`
                }]}
              />
            </View>
          </View>

          {/* Mission list */}
          {displayed.map(m => (
            <MissionCard
              key={m.id}
              mission={m}
              onComplete={handleComplete}
              completed={completed.has(m.id)}
            />
          ))}

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const ms = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#F3F4F6' },
  header:         { flexDirection: 'row', alignItems: 'center', paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16 },
  backBtn:        { padding: 6 },
  headerMid:      { flex: 1, alignItems: 'center' },
  headerTitle:    { fontSize: 18, fontWeight: '700', color: '#fff' },
  headerSub:      { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  starBadge:      { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  starCount:      { fontSize: 13, fontWeight: '700', color: '#fff' },
  loadWrap:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  loadText:       { fontSize: 14, color: '#6B7280' },
  scroll:         { flex: 1 },
  scrollContent:  { padding: 16 },
  introCard:      { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#EFF6FF', borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#BFDBFE' },
  introTitle:     { fontSize: 15, fontWeight: '700', color: '#1E40AF', marginBottom: 4 },
  introSub:       { fontSize: 12, color: '#3B82F6', lineHeight: 18 },
  filterRow:      { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  filterBtn:      { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' },
  filterBtnOn:    { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  filterText:     { fontSize: 12, fontWeight: '500', color: '#6B7280' },
  filterTextOn:   { color: '#fff' },
  phaseDesc:      { borderLeftWidth: 3, paddingLeft: 10, marginBottom: 12 },
  phaseDescTitle: { fontSize: 13, fontWeight: '600', color: '#1F2937' },
  phaseDescSub:   { fontSize: 12, color: '#6B7280' },
  progressCard:   { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 14, borderWidth: 0.5, borderColor: '#E5E7EB' },
  progressLabel:  { fontSize: 12, color: '#6B7280', marginBottom: 6 },
  progressBarBg:  { backgroundColor: '#F3F4F6', borderRadius: 10, height: 6, overflow: 'hidden' },
  progressBarFill:{ backgroundColor: '#10B981', height: 6, borderRadius: 10 },
});

const mc = StyleSheet.create({
  card:          { backgroundColor: '#fff', borderRadius: 16, marginBottom: 10, overflow: 'hidden', borderWidth: 0.5, borderColor: '#E5E7EB', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
  cardDone:      { borderColor: '#6EE7B7', backgroundColor: '#F0FDF4' },
  header:        { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  iconBg:        { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  icon:          { fontSize: 22 },
  title:         { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 3 },
  metaRow:       { flexDirection: 'row', gap: 10 },
  meta:          { fontSize: 11, color: '#6B7280' },
  conceptRow:    { paddingHorizontal: 14, paddingBottom: 10 },
  conceptText:   { fontSize: 11, color: '#6366F1', fontWeight: '500' },
  body:          { padding: 14, paddingTop: 0, gap: 10 },
  desc:          { fontSize: 13, color: '#374151', lineHeight: 20 },
  sectionBox:    { backgroundColor: '#F9FAFB', borderRadius: 10, padding: 12 },
  sectionTitle:  { fontSize: 12, fontWeight: '700', color: '#374151', marginBottom: 8 },
  listItem:      { fontSize: 12, color: '#4B5563', marginBottom: 3 },
  stepRow:       { flexDirection: 'row', gap: 8, marginBottom: 6, alignItems: 'flex-start' },
  stepNum:       { width: 20, height: 20, borderRadius: 10, backgroundColor: '#6366F1', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepNumText:   { fontSize: 10, color: '#fff', fontWeight: '700' },
  stepText:      { flex: 1, fontSize: 12, color: '#374151', lineHeight: 18 },
  buddyBox:      { backgroundColor: '#EEF2FF', borderRadius: 10, padding: 12 },
  buddyLabel:    { fontSize: 11, fontWeight: '600', color: '#4338CA', marginBottom: 4 },
  buddyText:     { fontSize: 12, color: '#3730A3', fontStyle: 'italic', lineHeight: 18 },
  tipBox:        { backgroundColor: '#FFF7ED', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#FED7AA' },
  tipLabel:      { fontSize: 11, fontWeight: '600', color: '#C2410C', marginBottom: 4 },
  tipText:       { fontSize: 12, color: '#92400E', lineHeight: 18 },
  completeBtn:   { backgroundColor: '#10B981', borderRadius: 12, padding: 14, alignItems: 'center' },
  completeBtnText:{ fontSize: 14, fontWeight: '700', color: '#fff' },
  doneTag:       { backgroundColor: '#D1FAE5', padding: 10, alignItems: 'center' },
  doneTagText:   { fontSize: 12, color: '#065F46', fontWeight: '600' },
});
