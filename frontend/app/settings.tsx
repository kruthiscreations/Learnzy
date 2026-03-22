import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/appStore';
import { CHARACTERS, CLASS_GROUPS, CharacterId } from '../constants/AppData';
import AnimatedCharacter from '../components/AnimatedCharacter';
import api from '../utils/api';

const LANGUAGES = [
  { id: 'telugu',    name: 'Telugu',    native: 'తెలుగు',    emoji: '🟡' },
  { id: 'hindi',     name: 'Hindi',     native: 'हिन्दी',    emoji: '🟠' },
  { id: 'tamil',     name: 'Tamil',     native: 'தமிழ்',     emoji: '🔴' },
  { id: 'kannada',   name: 'Kannada',   native: 'ಕನ್ನಡ',    emoji: '🟣' },
  { id: 'malayalam', name: 'Malayalam', native: 'മലയാളം',   emoji: '🔵' },
  { id: 'marathi',   name: 'Marathi',   native: 'मराठी',     emoji: '🟤' },
  { id: 'bengali',   name: 'Bengali',   native: 'বাংলা',    emoji: '🟢' },
  { id: 'none',      name: 'English Only', native: 'English Only', emoji: '⚪' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { user, setUser, updateClass, updateCharacter, updateLanguage, clearUser } = useAppStore();

  const [selectedClass,  setSelectedClass]  = useState(user?.current_class || 'class1');
  const [selectedLang,   setSelectedLang]   = useState(user?.preferred_language || 'telugu');
  const [selectedChar,   setSelectedChar]   = useState(user?.selected_character || 'cat');
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user) {
      setHasChanges(
        selectedClass !== (user.current_class || 'class1') ||
        selectedLang  !== user.preferred_language ||
        selectedChar  !== user.selected_character
      );
    }
  }, [selectedClass, selectedLang, selectedChar, user]);

  const handleSave = async () => {
    if (!user || !hasChanges) return;
    setSaving(true);
    try {
      const updated = {
        ...user,
        current_class: selectedClass,
        age_group: selectedClass,  // keep backend compat
        preferred_language: selectedLang,
        selected_character: selectedChar,
      };
      await api.put(`/user/${user.user_id}/preferences`, {
        age_group: selectedClass,
        preferred_language: selectedLang,
        selected_character: selectedChar,
        current_class: selectedClass,
      });
      await setUser(updated);
      Alert.alert('Saved! ✅', 'Your settings have been updated.');
      setHasChanges(false);
    } catch (e) {
      // Save locally even if API fails
      const updated = {
        ...user,
        current_class: selectedClass,
        age_group: selectedClass,
        preferred_language: selectedLang,
        selected_character: selectedChar,
      };
      await setUser(updated);
      Alert.alert('Saved! ✅', 'Settings saved on device.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: async () => { await clearUser(); router.replace('/'); } },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSub}>Personalise your learning journey</Text>
      </LinearGradient>

      {/* ── Class Selector (changeable anytime) ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📚 Your Class</Text>
        <Text style={styles.sectionSub}>You can change this anytime as you grow!</Text>
        <View style={styles.classGrid}>
          {CLASS_GROUPS.map((cls) => (
            <TouchableOpacity key={cls.id} style={[styles.classChip, selectedClass === cls.id && { backgroundColor: cls.color, borderColor: cls.color }]}
              onPress={() => setSelectedClass(cls.id)}>
              <Text style={styles.classChipEmoji}>{cls.emoji}</Text>
              <Text style={[styles.classChipLabel, selectedClass === cls.id && { color: '#fff' }]}>{cls.label}</Text>
              <Text style={[styles.classChipAge, selectedClass === cls.id && { color: 'rgba(255,255,255,0.85)' }]}>{cls.ageRange}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Character Selector ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🤖 Your Buddy</Text>
        <Text style={styles.sectionSub}>Pick the friend you want to learn with</Text>
        <View style={styles.charGrid}>
          {Object.values(CHARACTERS).map((char) => (
            <TouchableOpacity key={char.id} style={[styles.charCard, selectedChar === char.id && { borderColor: char.color, borderWidth: 3 }]}
              onPress={() => setSelectedChar(char.id)} activeOpacity={0.85}>
              <LinearGradient colors={char.gradientColors} style={styles.charCardGrad}>
                <AnimatedCharacter character={char.id as any}
                  expression={selectedChar === char.id ? 'happy' : 'idle'} size={72} />
                <Text style={styles.charCardName}>{char.name}</Text>
                <Text style={styles.charCardPersonality}>{char.personality}</Text>
                {selectedChar === char.id && (
                  <View style={styles.selectedBadge}><Text style={styles.selectedBadgeText}>✓ Selected</Text></View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Language Selector ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌐 Help Language</Text>
        <Text style={styles.sectionSub}>Your buddy will explain in this language</Text>
        <View style={styles.langGrid}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity key={lang.id}
              style={[styles.langChip, selectedLang === lang.id && styles.langChipActive]}
              onPress={() => setSelectedLang(lang.id)}>
              <Text style={styles.langEmoji}>{lang.emoji}</Text>
              <Text style={[styles.langName, selectedLang === lang.id && { color: '#fff' }]}>{lang.name}</Text>
              <Text style={[styles.langNative, selectedLang === lang.id && { color: 'rgba(255,255,255,0.85)' }]}>{lang.native}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Save Button ── */}
      {hasChanges && (
        <View style={styles.section}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
            <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.saveBtnGrad}>
              <Text style={styles.saveBtnText}>{saving ? 'Saving...' : '💾 Save Changes'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Other Actions ── */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/parent-dashboard')}>
          <Ionicons name="people-outline" size={22} color="#6366F1" />
          <Text style={styles.actionText}>Parent Dashboard</Text>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionRow} onPress={() => router.push('/subscription')}>
          <Ionicons name="star-outline" size={22} color="#F59E0B" />
          <Text style={styles.actionText}>Subscription</Text>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionRow, styles.logoutRow]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={[styles.actionText, { color: '#EF4444' }]}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { paddingTop: 52, paddingBottom: 28, paddingHorizontal: 20 },
  backBtn: { marginBottom: 12 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  sectionSub: { fontSize: 13, color: '#6B7280', marginBottom: 12 },
  classGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  classChip: { width: 86, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 6, borderRadius: 12, borderWidth: 2, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  classChipEmoji: { fontSize: 20, marginBottom: 2 },
  classChipLabel: { fontSize: 13, fontWeight: '700', color: '#374151' },
  classChipAge: { fontSize: 10, color: '#9CA3AF', marginTop: 1 },
  charGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  charCard: { width: '47%', borderRadius: 16, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  charCardGrad: { alignItems: 'center', paddingVertical: 14, paddingHorizontal: 8 },
  charCardName: { fontSize: 16, fontWeight: '800', color: '#fff', marginTop: 4 },
  charCardPersonality: { fontSize: 11, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 2 },
  selectedBadge: { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3, marginTop: 6 },
  selectedBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff', gap: 6 },
  langChipActive: { backgroundColor: '#667EEA', borderColor: '#667EEA' },
  langEmoji: { fontSize: 14 },
  langName: { fontSize: 13, fontWeight: '600', color: '#374151' },
  langNative: { fontSize: 11, color: '#9CA3AF' },
  saveBtn: { borderRadius: 14, overflow: 'hidden' },
  saveBtnGrad: { paddingVertical: 16, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  actionRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, gap: 12 },
  actionText: { flex: 1, fontSize: 15, fontWeight: '500', color: '#374151' },
  logoutRow: { borderWidth: 1, borderColor: '#FEE2E2', backgroundColor: '#FFF5F5' },
});
