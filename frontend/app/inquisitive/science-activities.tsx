/**
 * Science Activities — Animal Classification, Nature Senses Detective, Scientific Mind Map
 * Inquisitive Kid · Linked from Science Explorer
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/appStore';
import { CHARACTERS, CharacterId } from '../../constants/AppData';
import AnimatedCharacter from '../../components/AnimatedCharacter';
import { API_URL } from '../../utils/api';

const { width } = Dimensions.get('window');
type Tab = 'classification' | 'senses' | 'mindmap';

export default function ScienceActivitiesScreen() {
  const router    = useRouter();
  const { user }  = useAppStore();
  const classId   = user?.current_class || 'class3';
  const charId    = (user?.selected_character as CharacterId) || 'cat';
  const character = CHARACTERS[charId] || CHARACTERS.cat;

  const [tab,       setTab]       = useState<Tab>('classification');
  const [classData, setClassData] = useState<any>(null);
  const [sensesData,setSensesData]= useState<any>(null);
  const [mmData,    setMmData]    = useState<any>(null);
  const [loading,   setLoading]   = useState(true);
  const [quizAns,   setQuizAns]   = useState<Record<number,string>>({});
  const [quizDone,  setQuizDone]  = useState<Set<number>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        const [cr, sr, mr] = await Promise.all([
          fetch(`${API_URL}/api/science-activities/animal-classification/${classId}`),
          fetch(`${API_URL}/api/science-activities/nature-senses/${classId}`),
          fetch(`${API_URL}/api/science-activities/mind-map/${classId}`),
        ]);
        const [cd, sd, md] = await Promise.all([cr.json(), sr.json(), mr.json()]);
        if (cd.success) setClassData(cd);
        if (sd.success) setSensesData(sd.activity);
        if (md.success) setMmData(md.mind_map);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [classId]);

  const TABS: { id: Tab; label: string; emoji: string }[] = [
    { id: 'classification', label: 'Animal Classifier', emoji: '🦁' },
    { id: 'senses',         label: 'Senses Detective',  emoji: '🔍' },
    { id: 'mindmap',        label: 'Mind Map',           emoji: '🌐' },
  ];

  if (loading) return (
    <View style={sa.center}>
      <AnimatedCharacter character={charId as any} expression="thinking" size={90} />
      <ActivityIndicator color="#10B981" size="large" style={{ marginTop: 12 }} />
    </View>
  );

  return (
    <View style={sa.container}>
      <LinearGradient colors={['#065F46','#10B981']} style={sa.header}>
        <TouchableOpacity onPress={() => router.back()} style={sa.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={sa.headerMid}>
          <Text style={sa.headerTitle}>🔬 Science Activities</Text>
          <Text style={sa.headerSub}>Class {classId.replace('class','')} · Hands-on Science</Text>
        </View>
        <AnimatedCharacter character={charId as any} expression="excited" size={46} />
      </LinearGradient>

      <View style={sa.tabRow}>
        {TABS.map(t => (
          <TouchableOpacity key={t.id} style={[sa.tabBtn, tab === t.id && { borderBottomColor: '#10B981', borderBottomWidth: 2.5 }]}
            onPress={() => setTab(t.id)}>
            <Text style={sa.tabEmoji}>{t.emoji}</Text>
            <Text style={[sa.tabLabel, tab === t.id && { color: '#10B981', fontWeight: '600' }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={sa.scroll} contentContainerStyle={{ padding: 14, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* ── ANIMAL CLASSIFICATION ── */}
        {tab === 'classification' && classData && (
          <>
            {/* Vertebrates */}
            <View style={sa.sectionHd}><Text style={sa.sectionHdTxt}>🦴 Vertebrates (have a backbone)</Text></View>
            {classData.vertebrates.map((g: any, i: number) => (
              <View key={i} style={sa.groupCard}>
                <View style={sa.groupHeader}>
                  <Text style={sa.groupEmoji}>{g.emoji}</Text>
                  <Text style={sa.groupName}>{g.group}</Text>
                </View>
                <View style={sa.featuresRow}>
                  {g.key_features.map((f: string, fi: number) => (
                    <View key={fi} style={sa.featurePill}><Text style={sa.featureTxt}>· {f}</Text></View>
                  ))}
                </View>
                <Text style={sa.examplesRow}>Examples: {g.examples.join(', ')}</Text>
              </View>
            ))}

            {/* Invertebrates */}
            {classData.invertebrates?.length > 0 && (
              <>
                <View style={[sa.sectionHd, { marginTop: 10 }]}><Text style={sa.sectionHdTxt}>🐛 Invertebrates (no backbone)</Text></View>
                {classData.invertebrates.map((g: any, i: number) => (
                  <View key={i} style={sa.groupCard}>
                    <View style={sa.groupHeader}>
                      <Text style={sa.groupEmoji}>{g.emoji}</Text>
                      <Text style={sa.groupName}>{g.group}</Text>
                    </View>
                    <View style={sa.featuresRow}>
                      {g.key_features.slice(0, 3).map((f: string, fi: number) => (
                        <View key={fi} style={sa.featurePill}><Text style={sa.featureTxt}>· {f}</Text></View>
                      ))}
                    </View>
                    <Text style={sa.examplesRow}>Examples: {g.examples.join(', ')}</Text>
                  </View>
                ))}
              </>
            )}

            {/* Classification Quiz */}
            {classData.quiz?.length > 0 && (
              <>
                <View style={[sa.sectionHd, { marginTop: 10 }]}><Text style={sa.sectionHdTxt}>🧩 Classifier Quiz — which group?</Text></View>
                {classData.quiz.map((q: any, i: number) => (
                  <View key={i} style={sa.quizCard}>
                    <Text style={sa.quizQ}>Which group is a <Text style={{ fontWeight: '700', color: '#065F46' }}>{q.animal}</Text>?</Text>
                    {quizDone.has(i) ? (
                      <View style={sa.quizAnswer}>
                        <Text style={sa.quizAnswerTxt}>✅ {q.answer}</Text>
                        <Text style={sa.quizReason}>{q.reason}</Text>
                      </View>
                    ) : (
                      <TouchableOpacity style={sa.revealQuizBtn} onPress={() => setQuizDone(prev => new Set([...prev, i]))}>
                        <Text style={sa.revealQuizTxt}>Reveal Answer</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </>
            )}
          </>
        )}

        {/* ── NATURE SENSES DETECTIVE ── */}
        {tab === 'senses' && (
          sensesData ? (
            <>
              <View style={sa.sensesIntro}>
                <Text style={sa.sensesTitle}>🔍 Nature Senses Detective</Text>
                <Text style={sa.sensesDesc}>{sensesData.description}</Text>
              </View>
              {sensesData.rounds.map((round: any, i: number) => (
                <View key={i} style={sa.senseCard}>
                  <View style={sa.senseHeader}>
                    <Text style={sa.senseTitle}>{round.sense}</Text>
                  </View>
                  <Text style={sa.senseInstruct}>{round.instruction}</Text>
                  <Text style={sa.senseFindLabel}>Find these:</Text>
                  {round.items_to_find.map((item: string, ii: number) => (
                    <Text key={ii} style={sa.senseFindItem}>🔎 {item}</Text>
                  ))}
                  <View style={sa.buddyGuide}>
                    <Text style={sa.buddyGuideLabel}>{character.name} will ask:</Text>
                    <Text style={sa.buddyGuideTxt}>{round.buddy_prompt}</Text>
                  </View>
                </View>
              ))}
            </>
          ) : (
            <View style={sa.noContent}>
              <Text style={sa.noContentEmoji}>🔍</Text>
              <Text style={sa.noContentTxt}>Nature Senses Detective is for Classes LKG to 2!</Text>
              <Text style={sa.noContentSub}>It teaches observation skills through single-sense challenges.</Text>
            </View>
          )
        )}

        {/* ── SCIENTIFIC MIND MAP ── */}
        {tab === 'mindmap' && (
          mmData ? (
            <>
              <Text style={sa.mmIntro}>{mmData.description}</Text>
              {mmData.nodes.map((node: any, i: number) => (
                <View key={i} style={sa.mmCard}>
                  <View style={sa.mmFlow}>
                    <View style={sa.mmSmall}><Text style={sa.mmSmallTxt}>Small idea</Text><Text style={sa.mmSmallVal}>{node.small_idea}</Text></View>
                    <Text style={sa.mmArrow}>→</Text>
                    <View style={sa.mmMedium}><Text style={sa.mmMediumTxt}>Medium idea</Text><Text style={sa.mmMediumVal}>{node.medium_idea}</Text></View>
                    <Text style={sa.mmArrow}>→</Text>
                    <View style={sa.mmBig}><Text style={sa.mmBigTxt}>BIG idea</Text><Text style={sa.mmBigVal}>{node.big_idea}</Text></View>
                  </View>
                  <View style={sa.mmChain}>
                    <Text style={sa.mmChainLabel}>The connection chain:</Text>
                    {node.connection_chain.map((step: string, si: number) => (
                      <View key={si} style={sa.mmStep}>
                        <View style={sa.mmStepDot}><Text style={sa.mmStepNum}>{si+1}</Text></View>
                        <Text style={sa.mmStepTxt}>{step}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={sa.mmWow}>
                    <Text style={sa.mmWowLabel}>🤯 Wow fact</Text>
                    <Text style={sa.mmWowTxt}>{node.wow_fact}</Text>
                  </View>
                </View>
              ))}
            </>
          ) : (
            <View style={sa.noContent}>
              <Text style={sa.noContentEmoji}>🌐</Text>
              <Text style={sa.noContentTxt}>Scientific Mind Map is for Classes 3 to 5!</Text>
              <Text style={sa.noContentSub}>It connects everyday observations to big scientific ideas.</Text>
            </View>
          )
        )}

      </ScrollView>
    </View>
  );
}

const sa = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  header:    { flexDirection: 'row', alignItems: 'center', paddingTop: 52, paddingBottom: 12, paddingHorizontal: 14, gap: 10 },
  backBtn:   { padding: 6 },
  headerMid: { flex: 1 },
  headerTitle:{ fontSize: 17, fontWeight: '700', color: '#fff' },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  tabRow:    { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB' },
  tabBtn:    { flex: 1, alignItems: 'center', paddingVertical: 9, gap: 1, borderBottomWidth: 2.5, borderBottomColor: 'transparent' },
  tabEmoji:  { fontSize: 16 },
  tabLabel:  { fontSize: 10, color: '#9CA3AF', fontWeight: '500' },
  scroll:    { flex: 1 },
  sectionHd: { backgroundColor: '#065F46', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, marginBottom: 8 },
  sectionHdTxt:{ fontSize: 13, fontWeight: '600', color: '#fff' },
  groupCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 0.5, borderColor: '#E5E7EB' },
  groupHeader:{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  groupEmoji:{ fontSize: 22 },
  groupName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  featuresRow:{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 6 },
  featurePill:{ backgroundColor: '#ECFDF5', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  featureTxt:{ fontSize: 11, color: '#065F46' },
  examplesRow:{ fontSize: 12, color: '#6B7280', fontStyle: 'italic' },
  quizCard:  { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 0.5, borderColor: '#E5E7EB' },
  quizQ:     { fontSize: 14, color: '#111827', marginBottom: 8, lineHeight: 21 },
  quizAnswer:{ backgroundColor: '#ECFDF5', borderRadius: 8, padding: 10 },
  quizAnswerTxt:{ fontSize: 13, fontWeight: '700', color: '#065F46', marginBottom: 4 },
  quizReason:{ fontSize: 12, color: '#047857', lineHeight: 18 },
  revealQuizBtn:{ backgroundColor: '#6366F1', borderRadius: 8, padding: 10, alignItems: 'center' },
  revealQuizTxt:{ fontSize: 12, fontWeight: '700', color: '#fff' },
  sensesIntro:{ backgroundColor: '#ECFDF5', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#6EE7B7' },
  sensesTitle:{ fontSize: 16, fontWeight: '700', color: '#065F46', marginBottom: 4 },
  sensesDesc:{ fontSize: 12, color: '#047857', lineHeight: 19 },
  senseCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 0.5, borderColor: '#E5E7EB' },
  senseHeader:{ marginBottom: 6 },
  senseTitle:{ fontSize: 16, fontWeight: '700', color: '#111827' },
  senseInstruct:{ fontSize: 13, color: '#374151', lineHeight: 20, marginBottom: 8, fontStyle: 'italic' },
  senseFindLabel:{ fontSize: 12, fontWeight: '600', color: '#6B7280', marginBottom: 4 },
  senseFindItem:{ fontSize: 13, color: '#374151', marginBottom: 3 },
  buddyGuide:{ backgroundColor: '#EEF2FF', borderRadius: 8, padding: 10, marginTop: 8 },
  buddyGuideLabel:{ fontSize: 11, fontWeight: '600', color: '#4338CA', marginBottom: 3 },
  buddyGuideTxt:{ fontSize: 12, color: '#3730A3', lineHeight: 19 },
  noContent: { alignItems: 'center', paddingTop: 40, gap: 8 },
  noContentEmoji:{ fontSize: 40 },
  noContentTxt:{ fontSize: 16, fontWeight: '600', color: '#374151', textAlign: 'center' },
  noContentSub:{ fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
  mmIntro:   { fontSize: 12, color: '#6B7280', marginBottom: 10, lineHeight: 19 },
  mmCard:    { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 0.5, borderColor: '#E5E7EB' },
  mmFlow:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, flexWrap: 'wrap' },
  mmArrow:   { fontSize: 16, color: '#9CA3AF' },
  mmSmall:   { backgroundColor: '#F3F4F6', borderRadius: 8, padding: 8, flex: 1, minWidth: 70 },
  mmSmallTxt:{ fontSize: 9, color: '#9CA3AF', marginBottom: 2 },
  mmSmallVal:{ fontSize: 11, color: '#374151', fontWeight: '500' },
  mmMedium:  { backgroundColor: '#EEF2FF', borderRadius: 8, padding: 8, flex: 1.2, minWidth: 80 },
  mmMediumTxt:{ fontSize: 9, color: '#4338CA', marginBottom: 2 },
  mmMediumVal:{ fontSize: 11, color: '#3730A3', fontWeight: '500' },
  mmBig:     { backgroundColor: '#FFF7ED', borderRadius: 8, padding: 8, flex: 1.5, minWidth: 90 },
  mmBigTxt:  { fontSize: 9, color: '#C2410C', marginBottom: 2 },
  mmBigVal:  { fontSize: 11, color: '#92400E', fontWeight: '600' },
  mmChain:   { backgroundColor: '#F9FAFB', borderRadius: 8, padding: 10, marginBottom: 8 },
  mmChainLabel:{ fontSize: 11, fontWeight: '600', color: '#6B7280', marginBottom: 6 },
  mmStep:    { flexDirection: 'row', gap: 8, marginBottom: 5, alignItems: 'flex-start' },
  mmStepDot: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#10B981', alignItems: 'center', justifyContent: 'center' },
  mmStepNum: { fontSize: 10, color: '#fff', fontWeight: '700' },
  mmStepTxt: { flex: 1, fontSize: 12, color: '#374151', lineHeight: 18 },
  mmWow:     { backgroundColor: '#ECFDF5', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#6EE7B7' },
  mmWowLabel:{ fontSize: 11, fontWeight: '600', color: '#065F46', marginBottom: 3 },
  mmWowTxt:  { fontSize: 12, color: '#047857', lineHeight: 19, fontStyle: 'italic' },
});
