/**
 * Growth Mindset — Inquisitive Kid
 * Daily mindset challenges · Fixed vs Growth phrases · Affirmations · Parent tips
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

type Tab = 'today' | 'mindset' | 'affirmations' | 'parents';

export default function GrowthMindsetScreen() {
  const router    = useRouter();
  const { user }  = useAppStore();
  const classId   = user?.current_class || 'class3';
  const charId    = (user?.selected_character as CharacterId) || 'cat';
  const character = CHARACTERS[charId] || CHARACTERS.cat;

  const [data,       setData]       = useState<any>(null);
  const [loading,    setLoading]    = useState(true);
  const [tab,        setTab]        = useState<Tab>('today');
  const [completed,  setCompleted]  = useState(false);
  const [expression, setExpression] = useState<Expression>('happy');
  const [affIdx,     setAffIdx]     = useState(0);

  const bounceAnim = useRef(new Animated.Value(1)).current;
  const bounce = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 1.12, duration: 180, useNativeDriver: true }),
      Animated.timing(bounceAnim, { toValue: 1,    duration: 180, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API_URL}/api/growth-mindset/${classId}`);
        const d    = await res.json();
        if (d.success) setData(d);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
    const timer = setInterval(() => setAffIdx(i => i + 1), 6000);
    return () => clearInterval(timer);
  }, [classId]);

  const markDone = async () => {
    if (!data?.today_challenge || completed) return;
    try {
      await fetch(`${API_URL}/api/growth-mindset/complete`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.user_id, activity_id: data.today_challenge.id, phase_id: 'growth', stars_earned: data.today_challenge.stars || 3 }),
      });
      setCompleted(true);
      setExpression('proud');
      bounce();
    } catch (e) { console.error(e); }
  };

  const TABS: { id: Tab; label: string; emoji: string }[] = [
    { id: 'today',       label: "Today's Challenge", emoji: '💪' },
    { id: 'mindset',     label: 'Fixed vs Growth',   emoji: '🧠' },
    { id: 'affirmations',label: 'Affirmations',      emoji: '🌟' },
    { id: 'parents',     label: 'For Parents',       emoji: '👨‍👩‍👧' },
  ];

  if (loading) return (
    <View style={gms.center}>
      <AnimatedCharacter character={charId as any} expression="happy" size={90} />
      <ActivityIndicator color="#6366F1" size="large" style={{ marginTop: 12 }} />
    </View>
  );

  const challenge = data?.today_challenge;
  const affirmations: string[] = data?.affirmations || [];
  const currentAff = affirmations[affIdx % affirmations.length] || '';

  return (
    <View style={gms.container}>
      <LinearGradient colors={['#0F172A','#1E3A5F']} style={gms.header}>
        <TouchableOpacity onPress={() => router.back()} style={gms.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={gms.headerMid}>
          <Text style={gms.headerTitle}>🧠 Growth Mindset</Text>
          <Text style={gms.headerSub}>Your brain grows with every challenge</Text>
        </View>
        <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
          <AnimatedCharacter character={charId as any} expression={expression} size={46} />
        </Animated.View>
      </LinearGradient>

      {/* Rolling affirmation */}
      {currentAff ? (
        <View style={gms.affBanner}>
          <Text style={gms.affBannerTxt} numberOfLines={1}>✨ {currentAff}</Text>
        </View>
      ) : null}

      {/* Tabs */}
      <View style={gms.tabRow}>
        {TABS.map(t => (
          <TouchableOpacity key={t.id} style={[gms.tabBtn, tab === t.id && { borderBottomColor: '#6366F1', borderBottomWidth: 2.5 }]}
            onPress={() => setTab(t.id)}>
            <Text style={gms.tabEmoji}>{t.emoji}</Text>
            <Text style={[gms.tabLabel, tab === t.id && { color: '#6366F1', fontWeight: '600' }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={gms.scroll} contentContainerStyle={{ padding: 14, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* TODAY'S CHALLENGE */}
        {tab === 'today' && challenge && (
          <>
            <View style={gms.dayBadge}>
              <Text style={gms.dayTxt}>{challenge.day_type}'s Challenge</Text>
            </View>
            <View style={gms.challengeCard}>
              <Text style={gms.challengeEmoji}>{challenge.emoji}</Text>
              <Text style={gms.challengeTitle}>{challenge.title}</Text>
              <Text style={gms.challengeBody}>{challenge.challenge}</Text>
              <View style={gms.starsRow}>
                {Array.from({ length: challenge.stars || 3 }).map((_,i) => <Text key={i} style={{ fontSize: 20 }}>⭐</Text>)}
                <Text style={gms.starsLbl}>on completion</Text>
              </View>
            </View>

            <View style={gms.buddyRow}>
              <AnimatedCharacter character={charId as any} expression={expression} size={64} />
              <View style={gms.buddyBubble}>
                <Text style={gms.buddyName}>{character.name} says:</Text>
                <Text style={gms.buddyTxt}>{challenge.buddy_prompt}</Text>
              </View>
            </View>

            {!completed ? (
              <TouchableOpacity style={gms.doneBtn} onPress={markDone}>
                <Text style={gms.doneBtnTxt}>I Did This Challenge! 🎉</Text>
              </TouchableOpacity>
            ) : (
              <View style={gms.completedBanner}>
                <Text style={gms.completedTxt}>Challenge Complete! +{challenge.stars} stars ⭐</Text>
              </View>
            )}
          </>
        )}

        {/* FIXED VS GROWTH */}
        {tab === 'mindset' && (
          <>
            <Text style={gms.sectionIntro}>
              Two ways to think about the same situation. One closes doors. One opens them.
            </Text>
            {(data?.fixed_vs_growth || []).map((item: any, i: number) => (
              <View key={i} style={gms.mindCard}>
                <Text style={gms.situationTxt}>Situation: {item.situation}</Text>
                <View style={gms.mindRow}>
                  <View style={[gms.mindBox, gms.fixedBox]}>
                    <Text style={gms.mindBoxLabel}>❌ Fixed mindset</Text>
                    <Text style={gms.fixedTxt}>"{item.fixed}"</Text>
                  </View>
                  <View style={[gms.mindBox, gms.growthBox]}>
                    <Text style={gms.mindBoxLabel}>✅ Growth mindset</Text>
                    <Text style={gms.growthTxt}>"{item.growth}"</Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {/* AFFIRMATIONS */}
        {tab === 'affirmations' && (
          <>
            <Text style={gms.sectionIntro}>
              Say one of these out loud every morning. Your brain listens to what you tell it!
            </Text>
            {(data?.affirmations || []).map((a: string, i: number) => (
              <View key={i} style={gms.affCard}>
                <Text style={gms.affNum}>{i + 1}</Text>
                <Text style={gms.affTxt}>"{a}"</Text>
              </View>
            ))}
          </>
        )}

        {/* FOR PARENTS */}
        {tab === 'parents' && data?.for_parent && (
          <>
            <View style={gms.parentIntro}>
              <Text style={gms.parentIntroTxt}>{data.for_parent.intro}</Text>
            </View>
            {(data.for_parent.tips || []).map((tip: any, i: number) => (
              <View key={i} style={gms.tipCard}>
                <Text style={gms.tipTitle}>💡 {tip.title}</Text>
                <View style={gms.tipRow}>
                  <View style={gms.tipWrong}>
                    <Text style={gms.tipWrongLbl}>❌ Instead of</Text>
                    <Text style={gms.tipWrongTxt}>"{tip.wrong}"</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={18} color="#9CA3AF" />
                  <View style={gms.tipRight}>
                    <Text style={gms.tipRightLbl}>✅ Try saying</Text>
                    <Text style={gms.tipRightTxt}>"{tip.right}"</Text>
                  </View>
                </View>
                <Text style={gms.tipWhy}>{tip.why}</Text>
              </View>
            ))}
          </>
        )}

      </ScrollView>
    </View>
  );
}

const gms = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  header:    { flexDirection: 'row', alignItems: 'center', paddingTop: 52, paddingBottom: 12, paddingHorizontal: 14, gap: 10 },
  backBtn:   { padding: 6 },
  headerMid: { flex: 1 },
  headerTitle:{ fontSize: 17, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.65)' },
  affBanner: { backgroundColor: '#1E1B4B', paddingHorizontal: 14, paddingVertical: 6 },
  affBannerTxt:{ fontSize: 11, color: '#A5B4FC', fontStyle: 'italic' },
  tabRow:    { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB' },
  tabBtn:    { flex: 1, alignItems: 'center', paddingVertical: 8, gap: 1, borderBottomWidth: 2.5, borderBottomColor: 'transparent' },
  tabEmoji:  { fontSize: 14 },
  tabLabel:  { fontSize: 9.5, color: '#9CA3AF', fontWeight: '500' },
  scroll:    { flex: 1 },
  sectionIntro:{ fontSize: 12, color: '#6B7280', marginBottom: 10, lineHeight: 19 },
  dayBadge:  { backgroundColor: '#1E3A5F', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, alignSelf: 'flex-start', marginBottom: 10 },
  dayTxt:    { fontSize: 12, fontWeight: '600', color: '#93C5FD' },
  challengeCard:{ backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 0.5, borderColor: '#E5E7EB', alignItems: 'center' },
  challengeEmoji:{ fontSize: 40, marginBottom: 6 },
  challengeTitle:{ fontSize: 19, fontWeight: '700', color: '#111827', marginBottom: 8, textAlign: 'center' },
  challengeBody:{ fontSize: 14, color: '#374151', lineHeight: 22, textAlign: 'center', marginBottom: 10 },
  starsRow:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  starsLbl:  { fontSize: 12, color: '#6B7280' },
  buddyRow:  { flexDirection: 'row', gap: 10, marginBottom: 12, alignItems: 'flex-start' },
  buddyBubble:{ flex: 1, backgroundColor: '#EEF2FF', borderRadius: 14, borderBottomLeftRadius: 4, padding: 12 },
  buddyName: { fontSize: 11, fontWeight: '600', color: '#4338CA', marginBottom: 3 },
  buddyTxt:  { fontSize: 12, color: '#3730A3', lineHeight: 19 },
  doneBtn:   { backgroundColor: '#6366F1', borderRadius: 14, padding: 15, alignItems: 'center' },
  doneBtnTxt:{ fontSize: 15, fontWeight: '700', color: '#fff' },
  completedBanner:{ backgroundColor: '#ECFDF5', borderRadius: 14, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: '#6EE7B7' },
  completedTxt:{ fontSize: 15, fontWeight: '700', color: '#065F46' },
  // Fixed vs growth
  mindCard:  { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 0.5, borderColor: '#E5E7EB' },
  situationTxt:{ fontSize: 11, fontWeight: '600', color: '#9CA3AF', marginBottom: 8 },
  mindRow:   { flexDirection: 'row', gap: 8, alignItems: 'stretch' },
  mindBox:   { flex: 1, borderRadius: 10, padding: 10 },
  fixedBox:  { backgroundColor: '#FEF2F2' },
  growthBox: { backgroundColor: '#F0FDF4' },
  mindBoxLabel:{ fontSize: 10, fontWeight: '600', color: '#6B7280', marginBottom: 4 },
  fixedTxt:  { fontSize: 12, color: '#7F1D1D', lineHeight: 18, fontStyle: 'italic' },
  growthTxt: { fontSize: 12, color: '#065F46', lineHeight: 18, fontStyle: 'italic' },
  // Affirmations
  affCard:   { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', gap: 12, alignItems: 'center', borderWidth: 0.5, borderColor: '#E5E7EB' },
  affNum:    { width: 28, height: 28, borderRadius: 14, backgroundColor: '#6366F1', color: '#fff', textAlign: 'center', fontSize: 13, fontWeight: '700', lineHeight: 28 },
  affTxt:    { flex: 1, fontSize: 14, color: '#1F2937', lineHeight: 22, fontStyle: 'italic' },
  // Parent tips
  parentIntro:{ backgroundColor: '#EEF2FF', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 0.5, borderColor: '#C7D2FE' },
  parentIntroTxt:{ fontSize: 13, color: '#3730A3', lineHeight: 21 },
  tipCard:   { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 0.5, borderColor: '#E5E7EB' },
  tipTitle:  { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 10 },
  tipRow:    { flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 8 },
  tipWrong:  { flex: 1, backgroundColor: '#FEF2F2', borderRadius: 8, padding: 8 },
  tipWrongLbl:{ fontSize: 10, color: '#DC2626', fontWeight: '600', marginBottom: 2 },
  tipWrongTxt:{ fontSize: 12, color: '#7F1D1D', fontStyle: 'italic' },
  tipRight:  { flex: 1, backgroundColor: '#F0FDF4', borderRadius: 8, padding: 8 },
  tipRightLbl:{ fontSize: 10, color: '#059669', fontWeight: '600', marginBottom: 2 },
  tipRightTxt:{ fontSize: 12, color: '#065F46', fontStyle: 'italic' },
  tipWhy:    { fontSize: 11, color: '#6B7280', lineHeight: 18, fontStyle: 'italic' },
});
