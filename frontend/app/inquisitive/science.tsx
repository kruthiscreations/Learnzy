/**
 * Science Explorer — Inquisitive Kid
 * Classes 1–5 · Biology · Chemistry · Physics · Space
 * Three modules: Junior Explorers, Curious Investigators, Master Innovators
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
interface QuizQ { q: string; opts: string[]; ans: number; }
interface Topic {
  id: string; name: string; explanation: string;
  buddy_activity: string; real_world: string; quiz: QuizQ[];
}
interface Subject {
  id: string; subject: string; emoji: string; title: string;
  big_idea: string; topics: Topic[];
}
interface Experiment {
  id: string; title: string; emoji: string; subject: string; difficulty: number;
  what_you_need: string[]; instructions: string[]; what_to_observe: string;
  science_explanation: string; buddy_prompt: string; stars: number;
}
interface VocabCard { word: string; emoji: string; definition: string; example: string; }
interface PathMilestone { class: string; milestone: string; topics: string[]; emoji: string; }

type Tab = 'topics' | 'experiments' | 'vocab' | 'pathway';

const SUBJECT_COLORS: Record<string, string> = {
  Biology: '#10B981', Chemistry: '#8B5CF6',
  Physics: '#3B82F6', Space: '#1E293B',
};

// ── Quiz Component ─────────────────────────────────────────────────────────────
function QuizCard({ topic, classId, userId, charId, charName, onDone }: {
  topic: Topic; classId: string; userId: string;
  charId: string; charName: string; onDone: (stars: number) => void;
}) {
  const [answers,    setAnswers]    = useState<number[]>([]);
  const [submitted,  setSubmitted]  = useState(false);
  const [result,     setResult]     = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (answers.length < topic.quiz.length || submitting) return;
    setSubmitting(true);
    try {
      const res  = await fetch(`${API_URL}/api/science/quiz/submit`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, topic_id: topic.id, class_id: classId, answers, subject: '' }),
      });
      const data = await res.json();
      setResult(data);
      setSubmitted(true);
      onDone(data.stars_earned || 0);
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  return (
    <View style={qc.wrap}>
      <Text style={qc.heading}>🧪 Quick Quiz — {topic.name}</Text>
      {topic.quiz.map((q, qi) => (
        <View key={qi} style={qc.qBlock}>
          <Text style={qc.qText}>{qi + 1}. {q.q}</Text>
          {q.opts.map((opt, oi) => {
            const isSelected = answers[qi] === oi;
            const correct    = result?.correct_answers?.[qi] === oi;
            const wrong      = submitted && isSelected && !correct;
            let bg = '#F9FAFB', border = '#E5E7EB', color = '#374151';
            if (submitted) {
              if (correct)  { bg = '#ECFDF5'; border = '#6EE7B7'; color = '#065F46'; }
              if (wrong)    { bg = '#FEF2F2'; border = '#FCA5A5'; color = '#7F1D1D'; }
            } else if (isSelected) {
              bg = '#EEF2FF'; border = '#6366F1'; color = '#3730A3';
            }
            return (
              <TouchableOpacity key={oi}
                style={[qc.opt, { backgroundColor: bg, borderColor: border }]}
                onPress={() => { if (!submitted) { const a=[...answers]; a[qi]=oi; setAnswers(a); } }}
                disabled={submitted} activeOpacity={0.8}>
                <Text style={[qc.optTxt, { color }]}>{['A','B','C','D'][oi]}. {opt}</Text>
                {submitted && correct && <Text style={{ color:'#10B981', fontWeight:'700' }}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
      {!submitted && (
        <TouchableOpacity
          style={[qc.subBtn, answers.length < topic.quiz.length && { opacity: 0.4 }]}
          onPress={submit} disabled={answers.length < topic.quiz.length || submitting}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={qc.subTxt}>Submit Answers ✓</Text>}
        </TouchableOpacity>
      )}
      {submitted && result && (
        <View style={qc.result}>
          <Text style={qc.resultTxt}>{result.message}</Text>
          <Text style={qc.resultStars}>{'⭐'.repeat(result.stars_earned)}</Text>
        </View>
      )}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ScienceExplorerScreen() {
  const router    = useRouter();
  const { user }  = useAppStore();
  const classId   = user?.current_class || 'class3';
  const charId    = (user?.selected_character as CharacterId) || 'cat';
  const character = CHARACTERS[charId] || CHARACTERS.cat;

  const [tab,         setTab]         = useState<Tab>('topics');
  const [moduleData,  setModuleData]  = useState<any>(null);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [vocab,       setVocab]       = useState<VocabCard[]>([]);
  const [pathway,     setPathway]     = useState<PathMilestone[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [modal,       setModal]       = useState<{ visible:boolean; topic?:Topic; exp?:Experiment; vc?:VocabCard }>({ visible:false });
  const [quizTopic,   setQuizTopic]   = useState<Topic|null>(null);
  const [expression,  setExpression]  = useState<Expression>('happy');
  const [earnedStars, setEarnedStars] = useState(0);

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
        const [mRes, eRes, vRes, pRes] = await Promise.all([
          fetch(`${API_URL}/api/science/module/${classId}`),
          fetch(`${API_URL}/api/science/experiments/${classId}`),
          fetch(`${API_URL}/api/science/vocabulary/${classId}`),
          fetch(`${API_URL}/api/science/pathway`),
        ]);
        const [md, ed, vd, pd] = await Promise.all([mRes.json(), eRes.json(), vRes.json(), pRes.json()]);
        if (md.success) setModuleData(md);
        if (ed.success) setExperiments(ed.experiments || []);
        if (vd.success) setVocab(vd.vocabulary || []);
        if (pd.success) setPathway(pd.pathway || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [classId]);

  const completeExp = async (exp: Experiment) => {
    try {
      const res  = await fetch(`${API_URL}/api/science/experiment/complete`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.user_id, experiment_id: exp.id, class_id: classId, stars_earned: exp.stars }),
      });
      const data = await res.json();
      if (!data.already_done) { setEarnedStars(s => s + data.stars_earned); bounce(); setExpression('proud'); }
      setModal({ visible: false });
    } catch (e) { console.error(e); }
  };

  const mColor = moduleData?.module_color || '#6366F1';
  const TABS: { id: Tab; label: string; emoji: string }[] = [
    { id: 'topics',      label: 'Topics',      emoji: '📚' },
    { id: 'experiments', label: 'Labs',         emoji: '🧪' },
    { id: 'vocab',       label: 'Vocab',        emoji: '📖' },
    { id: 'pathway',     label: 'Roadmap',      emoji: '🗺️' },
  ];

  if (loading) return (
    <View style={ms.center}>
      <AnimatedCharacter character={charId as any} expression="thinking" size={90} />
      <ActivityIndicator color="#6366F1" size="large" style={{ marginTop: 12 }} />
      <Text style={ms.loadTxt}>Loading Science Explorer...</Text>
    </View>
  );

  return (
    <View style={ms.container}>

      {/* Header */}
      <LinearGradient colors={[mColor, '#4F46E5']} style={ms.header}>
        <TouchableOpacity onPress={() => { if (quizTopic) setQuizTopic(null); else router.back(); }} style={ms.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={ms.headerMid}>
          <Text style={ms.headerTitle}>{moduleData?.module_emoji} Science Explorer</Text>
          <Text style={ms.headerSub}>{moduleData?.module_title} · {classId.toUpperCase()}</Text>
        </View>
        <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
          <AnimatedCharacter character={charId as any} expression={expression} size={46} />
        </Animated.View>
      </LinearGradient>

      {/* Tagline */}
      {moduleData?.module_tagline && (
        <View style={ms.taglineWrap}>
          <Text style={ms.tagline}>💡 {moduleData.module_tagline}</Text>
        </View>
      )}

      {/* Tabs */}
      <View style={ms.tabRow}>
        {TABS.map(t => (
          <TouchableOpacity key={t.id} style={[ms.tabBtn, tab === t.id && { borderBottomColor: mColor, borderBottomWidth: 2.5 }]} onPress={() => { setTab(t.id); setQuizTopic(null); }}>
            <Text style={ms.tabEmoji}>{t.emoji}</Text>
            <Text style={[ms.tabLabel, tab === t.id && { color: mColor, fontWeight: '600' }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* If in quiz mode */}
      {quizTopic ? (
        <ScrollView style={ms.scroll} contentContainerStyle={{ padding: 14, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <QuizCard topic={quizTopic} classId={classId} userId={user?.user_id || ''} charId={charId} charName={character.name}
            onDone={(s) => { setEarnedStars(p => p + s); bounce(); setExpression(s >= 2 ? 'proud' : 'happy'); }} />
          <TouchableOpacity style={ms.backToTopicBtn} onPress={() => setQuizTopic(null)}>
            <Text style={ms.backToTopicTxt}>← Back to topic</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView style={ms.scroll} contentContainerStyle={{ padding: 14, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

          {/* ── TOPICS ── */}
          {tab === 'topics' && (moduleData?.subjects || []).map((subj: Subject) => (
            <View key={subj.id} style={ms.subjBlock}>
              <View style={[ms.subjHeader, { backgroundColor: SUBJECT_COLORS[subj.subject] || mColor }]}>
                <Text style={ms.subjEmoji}>{subj.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={ms.subjName}>{subj.subject}</Text>
                  <Text style={ms.subjTitle}>{subj.title}</Text>
                </View>
              </View>
              <View style={ms.bigIdeaRow}>
                <Text style={ms.bigIdeaLabel}>Big idea:</Text>
                <Text style={ms.bigIdeaText}>{subj.big_idea}</Text>
              </View>
              {subj.topics.map((topic: Topic) => (
                <TouchableOpacity key={topic.id} style={ms.topicCard} activeOpacity={0.88}
                  onPress={() => { setModal({ visible: true, topic }); setExpression('excited'); }}>
                  <View style={ms.topicCardInner}>
                    <Text style={ms.topicName}>{topic.name}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {/* ── EXPERIMENTS ── */}
          {tab === 'experiments' && (
            <>
              {experiments.length === 0 && <Text style={ms.emptyTxt}>No experiments for this class — check back soon!</Text>}
              {experiments.map(exp => (
                <View key={exp.id} style={ms.expCard}>
                  <View style={ms.expHeader}>
                    <Text style={ms.expEmoji}>{exp.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={ms.expTitle}>{exp.title}</Text>
                      <Text style={ms.expSubj}>{exp.subject} · {'⭐'.repeat(exp.difficulty)}</Text>
                    </View>
                    <Text style={ms.expStars}>+{exp.stars}⭐</Text>
                  </View>
                  <Text style={ms.expObserve}>{exp.what_to_observe}</Text>
                  <View style={ms.expNeeds}>
                    <Text style={ms.expNeedsLabel}>You need:</Text>
                    {exp.what_you_need.map((n, i) => <Text key={i} style={ms.expNeedsItem}>· {n}</Text>)}
                  </View>
                  <TouchableOpacity style={[ms.expBtn, { backgroundColor: mColor }]}
                    onPress={() => { setModal({ visible: true, exp }); setExpression('excited'); }}>
                    <Text style={ms.expBtnTxt}>Full Instructions + Science 🔬</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}

          {/* ── VOCAB ── */}
          {tab === 'vocab' && (
            <>
              <Text style={ms.sectionIntro}>Essential science vocabulary for Class {classId.replace('class','')} — tap any card to flip it!</Text>
              <View style={ms.vocabGrid}>
                {vocab.map((v, i) => (
                  <TouchableOpacity key={i} style={ms.vcCard} activeOpacity={0.85}
                    onPress={() => setModal({ visible: true, vc: v })}>
                    <Text style={ms.vcEmoji}>{v.emoji}</Text>
                    <Text style={ms.vcWord}>{v.word}</Text>
                    <Text style={ms.vcTap}>tap to learn</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* ── PATHWAY ── */}
          {tab === 'pathway' && (
            <>
              <Text style={ms.sectionIntro}>Your science journey from Class 1 to Class 5 — where are you now?</Text>
              {pathway.map((p, i) => {
                const isCurrent = p.class === classId;
                return (
                  <View key={i} style={[ms.pathCard, isCurrent && { borderColor: mColor, borderWidth: 2 }]}>
                    <View style={ms.pathLeft}>
                      <Text style={ms.pathEmoji}>{p.emoji}</Text>
                      {i < pathway.length - 1 && <View style={ms.pathLine} />}
                    </View>
                    <View style={ms.pathRight}>
                      <View style={ms.pathClassRow}>
                        <Text style={ms.pathClass}>{p.class.replace('class','Class ')}</Text>
                        {isCurrent && <View style={[ms.youBadge, { backgroundColor: mColor }]}><Text style={ms.youBadgeTxt}>YOU ARE HERE</Text></View>}
                      </View>
                      <Text style={ms.pathMilestone}>{p.milestone}</Text>
                      {p.topics.map((t, ti) => <Text key={ti} style={ms.pathTopic}>· {t}</Text>)}
                    </View>
                  </View>
                );
              })}
            </>
          )}

        </ScrollView>
      )}

      {/* ── MODAL ── */}
      <Modal visible={modal.visible} transparent animationType="slide" onRequestClose={() => setModal({ visible:false })}>
        <View style={ms.overlay}>
          <View style={ms.modalBox}>
            <TouchableOpacity style={ms.modalClose} onPress={() => setModal({ visible:false })}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>

            {/* Topic modal */}
            {modal.topic && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={ms.modalTitle}>{modal.topic.name}</Text>
                <View style={ms.modalSection}>
                  <Text style={ms.modalSLbl}>📚 Explanation</Text>
                  <Text style={ms.modalSBody}>{modal.topic.explanation}</Text>
                </View>
                <View style={[ms.modalSection, { backgroundColor: '#EEF2FF' }]}>
                  <Text style={ms.modalSLbl}>🤖 {character.name} says — try this!</Text>
                  <Text style={[ms.modalSBody, { color: '#3730A3' }]}>{modal.topic.buddy_activity}</Text>
                </View>
                <View style={[ms.modalSection, { backgroundColor: '#FFF7ED' }]}>
                  <Text style={ms.modalSLbl}>🌍 In the real world</Text>
                  <Text style={[ms.modalSBody, { color: '#92400E' }]}>{modal.topic.real_world}</Text>
                </View>
                <TouchableOpacity style={[ms.modalPrimaryBtn, { backgroundColor: mColor }]}
                  onPress={() => { setModal({ visible:false }); setQuizTopic(modal.topic!); }}>
                  <Text style={ms.modalPrimaryBtnTxt}>Take the Quiz! 🧠</Text>
                </TouchableOpacity>
                <TouchableOpacity style={ms.modalSecBtn}
                  onPress={() => { setModal({ visible:false }); router.push(`/chat/${charId}` as any); }}>
                  <Text style={ms.modalSecBtnTxt}>Ask {character.name} more questions →</Text>
                </TouchableOpacity>
              </ScrollView>
            )}

            {/* Experiment modal */}
            {modal.exp && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={ms.modalEmoji}>{modal.exp.emoji}</Text>
                <Text style={ms.modalTitle}>{modal.exp.title}</Text>
                <View style={ms.modalSection}>
                  <Text style={ms.modalSLbl}>📋 Steps</Text>
                  {modal.exp.instructions.map((inst, i) => (
                    <View key={i} style={ms.instrRow}>
                      <View style={[ms.instrNum, { backgroundColor: mColor }]}><Text style={ms.instrNumTxt}>{i+1}</Text></View>
                      <Text style={ms.instrTxt}>{inst}</Text>
                    </View>
                  ))}
                </View>
                <View style={[ms.modalSection, { backgroundColor: '#F0FDF4' }]}>
                  <Text style={ms.modalSLbl}>👁️ Watch for this</Text>
                  <Text style={[ms.modalSBody, { color: '#065F46' }]}>{modal.exp.what_to_observe}</Text>
                </View>
                <View style={[ms.modalSection, { backgroundColor: '#EEF2FF' }]}>
                  <Text style={ms.modalSLbl}>🔬 The science behind it</Text>
                  <Text style={[ms.modalSBody, { color: '#3730A3' }]}>{modal.exp.science_explanation}</Text>
                </View>
                <View style={[ms.modalSection, { backgroundColor: '#FFF7ED' }]}>
                  <Text style={ms.modalSLbl}>🤖 {character.name}'s questions to ask you</Text>
                  <Text style={[ms.modalSBody, { color: '#92400E' }]}>{modal.exp.buddy_prompt}</Text>
                </View>
                <TouchableOpacity style={[ms.modalPrimaryBtn, { backgroundColor: mColor }]}
                  onPress={() => completeExp(modal.exp!)}>
                  <Text style={ms.modalPrimaryBtnTxt}>I Did This! Claim {modal.exp.stars} Stars ⭐</Text>
                </TouchableOpacity>
              </ScrollView>
            )}

            {/* Vocab modal */}
            {modal.vc && (
              <View style={ms.vcModal}>
                <Text style={ms.vcModalEmoji}>{modal.vc.emoji}</Text>
                <Text style={ms.vcModalWord}>{modal.vc.word}</Text>
                <View style={ms.vcDefBox}>
                  <Text style={ms.vcDefLabel}>Definition</Text>
                  <Text style={ms.vcDefTxt}>{modal.vc.definition}</Text>
                </View>
                <View style={ms.vcExBox}>
                  <Text style={ms.vcExLabel}>Example</Text>
                  <Text style={ms.vcExTxt}>{modal.vc.example}</Text>
                </View>
                <TouchableOpacity style={[ms.modalPrimaryBtn, { backgroundColor: mColor }]}
                  onPress={() => { setModal({ visible:false }); router.push(`/chat/${charId}` as any); }}>
                  <Text style={ms.modalPrimaryBtnTxt}>Ask {character.name} more about this →</Text>
                </TouchableOpacity>
              </View>
            )}

          </View>
        </View>
      </Modal>

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const ms = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#F3F4F6' },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadTxt:        { fontSize: 14, color: '#6B7280' },
  header:         { flexDirection: 'row', alignItems: 'center', paddingTop: 52, paddingBottom: 12, paddingHorizontal: 14, gap: 10 },
  backBtn:        { padding: 6 },
  headerMid:      { flex: 1 },
  headerTitle:    { fontSize: 17, fontWeight: '700', color: '#fff' },
  headerSub:      { fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  taglineWrap:    { backgroundColor: '#1E1B4B', paddingHorizontal: 14, paddingVertical: 6 },
  tagline:        { fontSize: 11, color: '#A5B4FC', fontStyle: 'italic' },
  tabRow:         { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB' },
  tabBtn:         { flex: 1, alignItems: 'center', paddingVertical: 9, gap: 1, borderBottomWidth: 2.5, borderBottomColor: 'transparent' },
  tabEmoji:       { fontSize: 15 },
  tabLabel:       { fontSize: 10, color: '#9CA3AF', fontWeight: '500' },
  scroll:         { flex: 1 },
  sectionIntro:   { fontSize: 12, color: '#6B7280', marginBottom: 10, lineHeight: 19 },
  emptyTxt:       { textAlign: 'center', color: '#9CA3AF', marginTop: 40 },
  backToTopicBtn: { marginTop: 14, alignItems: 'center', padding: 10 },
  backToTopicTxt: { fontSize: 14, color: '#6366F1', fontWeight: '500' },
  // Subjects
  subjBlock:      { marginBottom: 14 },
  subjHeader:     { borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 2 },
  subjEmoji:      { fontSize: 22 },
  subjName:       { fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  subjTitle:      { fontSize: 15, color: '#fff', fontWeight: '700' },
  bigIdeaRow:     { backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 6, borderWidth: 0.5, borderColor: '#E5E7EB' },
  bigIdeaLabel:   { fontSize: 10, fontWeight: '600', color: '#9CA3AF', marginBottom: 2 },
  bigIdeaText:    { fontSize: 12, color: '#374151', fontStyle: 'italic', lineHeight: 18 },
  topicCard:      { backgroundColor: '#fff', borderRadius: 10, marginBottom: 4, borderWidth: 0.5, borderColor: '#E5E7EB' },
  topicCardInner: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  topicName:      { flex: 1, fontSize: 14, fontWeight: '500', color: '#111827' },
  // Experiments
  expCard:        { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 0.5, borderColor: '#E5E7EB' },
  expHeader:      { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  expEmoji:       { fontSize: 28 },
  expTitle:       { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  expSubj:        { fontSize: 11, color: '#6B7280' },
  expStars:       { fontSize: 13 },
  expObserve:     { fontSize: 13, color: '#374151', lineHeight: 20, marginBottom: 8, fontStyle: 'italic' },
  expNeeds:       { backgroundColor: '#F9FAFB', borderRadius: 8, padding: 10, marginBottom: 10 },
  expNeedsLabel:  { fontSize: 11, fontWeight: '600', color: '#6B7280', marginBottom: 4 },
  expNeedsItem:   { fontSize: 12, color: '#374151', marginBottom: 2 },
  expBtn:         { borderRadius: 10, padding: 12, alignItems: 'center' },
  expBtnTxt:      { fontSize: 13, fontWeight: '700', color: '#fff' },
  // Vocab
  vocabGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  vcCard:         { backgroundColor: '#fff', borderRadius: 12, padding: 12, width: (width - 44) / 2, alignItems: 'center', borderWidth: 0.5, borderColor: '#E5E7EB' },
  vcEmoji:        { fontSize: 26, marginBottom: 4 },
  vcWord:         { fontSize: 13, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 2 },
  vcTap:          { fontSize: 10, color: '#9CA3AF' },
  // Pathway
  pathCard:       { flexDirection: 'row', gap: 12, backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 0, borderWidth: 0.5, borderColor: '#E5E7EB' },
  pathLeft:       { alignItems: 'center', width: 36 },
  pathEmoji:      { fontSize: 22, marginBottom: 4 },
  pathLine:       { width: 2, flex: 1, backgroundColor: '#E5E7EB', minHeight: 20 },
  pathRight:      { flex: 1, paddingBottom: 8 },
  pathClassRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  pathClass:      { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  youBadge:       { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  youBadgeTxt:    { fontSize: 9, fontWeight: '700', color: '#fff' },
  pathMilestone:  { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  pathTopic:      { fontSize: 11, color: '#6B7280', marginBottom: 1 },
  // Modal
  overlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalBox:       { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' },
  modalClose:     { alignSelf: 'flex-end', padding: 4, marginBottom: 4 },
  modalEmoji:     { fontSize: 36, textAlign: 'center', marginBottom: 4 },
  modalTitle:     { fontSize: 19, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 12 },
  modalSection:   { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, marginBottom: 10 },
  modalSLbl:      { fontSize: 11, fontWeight: '600', color: '#6B7280', marginBottom: 5 },
  modalSBody:     { fontSize: 13, color: '#374151', lineHeight: 21 },
  modalPrimaryBtn:{ borderRadius: 14, padding: 15, alignItems: 'center', marginBottom: 8, marginTop: 4 },
  modalPrimaryBtnTxt:{ fontSize: 15, fontWeight: '700', color: '#fff' },
  modalSecBtn:    { borderRadius: 14, padding: 13, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  modalSecBtnTxt: { fontSize: 13, fontWeight: '600', color: '#6366F1' },
  instrRow:       { flexDirection: 'row', gap: 8, marginBottom: 7, alignItems: 'flex-start' },
  instrNum:       { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  instrNumTxt:    { fontSize: 11, color: '#fff', fontWeight: '700' },
  instrTxt:       { flex: 1, fontSize: 13, color: '#374151', lineHeight: 19 },
  vcModal:        { alignItems: 'center', gap: 10, paddingTop: 4 },
  vcModalEmoji:   { fontSize: 48 },
  vcModalWord:    { fontSize: 26, fontWeight: '700', color: '#111827' },
  vcDefBox:       { backgroundColor: '#EEF2FF', borderRadius: 12, padding: 14, width: '100%' },
  vcDefLabel:     { fontSize: 11, fontWeight: '600', color: '#4338CA', marginBottom: 4 },
  vcDefTxt:       { fontSize: 14, color: '#3730A3', lineHeight: 22 },
  vcExBox:        { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 14, width: '100%' },
  vcExLabel:      { fontSize: 11, fontWeight: '600', color: '#166534', marginBottom: 4 },
  vcExTxt:        { fontSize: 13, color: '#14532D', lineHeight: 20, fontStyle: 'italic' },
});

const qc = StyleSheet.create({
  wrap:     { backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: '#E5E7EB' },
  heading:  { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  qBlock:   { marginBottom: 14 },
  qText:    { fontSize: 14, fontWeight: '500', color: '#1F2937', marginBottom: 8, lineHeight: 21 },
  opt:      { borderRadius: 10, borderWidth: 1.5, padding: 11, marginBottom: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optTxt:   { fontSize: 13, flex: 1 },
  subBtn:   { backgroundColor: '#6366F1', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 4 },
  subTxt:   { fontSize: 14, fontWeight: '700', color: '#fff' },
  result:   { backgroundColor: '#ECFDF5', borderRadius: 12, padding: 12, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: '#6EE7B7' },
  resultTxt:{ fontSize: 14, fontWeight: '600', color: '#065F46', marginBottom: 4 },
  resultStars:{ fontSize: 22 },
});
