/**
 * Maths Magic Screen — Step-by-step tricks with practice problems
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../../store/appStore';
import { API_URL } from '../../utils/api';

export default function MathsMagic() {
  const router   = useRouter();
  const { user } = useAppStore();
  const [tricks,   setTricks]   = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({});
  const [checked,  setChecked]  = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch(`${API_URL}/api/inquisitive/maths-tricks/${user?.current_class || 'class3'}`)
      .then(r => r.json())
      .then(d => { setTricks(d.tricks || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <View style={s.center}>
      <ActivityIndicator size="large" color="#F59E0B" />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF9F0' }}>
      <LinearGradient colors={['#92400E','#D97706']} style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>🔢 Maths Magic</Text>
        <Text style={s.headerSub}>{tricks.length} tricks for your class — tap any to learn!</Text>
      </LinearGradient>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {tricks.map(trick => {
          const isOpen = expanded === trick.id;
          return (
            <View key={trick.id} style={s.trickCard}>
              <TouchableOpacity style={s.trickHeader} onPress={() => setExpanded(isOpen ? null : trick.id)}>
                <Text style={s.trickEmoji}>{trick.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.trickTitle}>{trick.title}</Text>
                  <Text style={s.trickTagline}>{trick.tagline}</Text>
                </View>
                <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#92400E" />
              </TouchableOpacity>

              {isOpen && (
                <View style={s.trickBody}>
                  {/* Steps */}
                  <Text style={s.subHead}>📋 How it works</Text>
                  {trick.steps.map((step: string, i: number) => (
                    <View key={i} style={s.stepRow}>
                      <View style={s.stepNum}><Text style={s.stepNumTxt}>{i+1}</Text></View>
                      <Text style={s.stepTxt}>{step}</Text>
                    </View>
                  ))}

                  {/* Example */}
                  <View style={s.exampleBox}>
                    <Text style={s.exampleLabel}>✨ Example</Text>
                    <Text style={s.exampleText}>{trick.example}</Text>
                  </View>

                  {/* Practice */}
                  <Text style={s.subHead}>💪 Try it yourself</Text>
                  {trick.practice.map((p: any, i: number) => {
                    const key = `${trick.id}_${i}`;
                    const isChecked = checked[key];
                    return (
                      <View key={i} style={s.practiceRow}>
                        <Text style={s.practiceQ}>{p.q}</Text>
                        {isChecked ? (
                          <View style={s.answerReveal}>
                            <Text style={s.answerText}>✅ {p.answer}</Text>
                          </View>
                        ) : (
                          <TouchableOpacity style={s.checkBtn}
                            onPress={() => setChecked(prev => ({ ...prev, [key]: true }))}>
                            <Text style={s.checkBtnText}>Show Answer</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
        {tricks.length === 0 && (
          <Text style={{ textAlign: 'center', color: '#9CA3AF', marginTop: 40 }}>
            No tricks available for your class yet. More coming soon!
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header:      { paddingTop: 52, paddingBottom: 20, paddingHorizontal: 16 },
  back:        { marginBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  trickCard:   { backgroundColor: '#fff', borderRadius: 16, marginBottom: 10, overflow: 'hidden', elevation: 2, shadowColor:'#000',shadowOffset:{width:0,height:1},shadowOpacity:0.08,shadowRadius:3 },
  trickHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  trickEmoji:  { fontSize: 28 },
  trickTitle:  { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  trickTagline:{ fontSize: 12, color: '#6B7280', marginTop: 1 },
  trickBody:   { padding: 14, paddingTop: 0, borderTopWidth: .5, borderTopColor: '#F3F4F6' },
  subHead:     { fontSize: 13, fontWeight: '600', color: '#92400E', marginBottom: 8, marginTop: 12 },
  stepRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  stepNum:     { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  stepNumTxt:  { fontSize: 12, fontWeight: '700', color: '#92400E' },
  stepTxt:     { flex: 1, fontSize: 13, color: '#374151', lineHeight: 18 },
  exampleBox:  { backgroundColor: '#FFFBEB', borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: '#F59E0B', marginTop: 8 },
  exampleLabel:{ fontSize: 11, fontWeight: '600', color: '#92400E', marginBottom: 4 },
  exampleText: { fontSize: 13, color: '#78350F', lineHeight: 18, fontFamily: 'monospace' },
  practiceRow: { backgroundColor: '#F9FAFB', borderRadius: 10, padding: 12, marginBottom: 8 },
  practiceQ:   { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  checkBtn:    { backgroundColor: '#F59E0B', borderRadius: 8, paddingVertical: 6, alignItems: 'center' },
  checkBtnText:{ color: '#fff', fontSize: 13, fontWeight: '600' },
  answerReveal:{ backgroundColor: '#ECFDF5', borderRadius: 8, padding: 8 },
  answerText:  { color: '#065F46', fontSize: 13, fontWeight: '500' },
});
