import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/appStore';
import { CHARACTERS, MODULES, CLASS_GROUPS, CharacterId } from '../constants/AppData';
import WordOfTheDayWidget from '../components/WordOfTheDayWidget';
import DailyLoginReward, { useDailyLoginReward } from '../components/DailyLoginReward';
import AnimatedCharacter from '../components/AnimatedCharacter';
import { getUserProgress } from '../utils/api';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAppStore();
  const [progress, setProgress] = useState<any>(null);
  const { showReward, closeReward } = useDailyLoginReward();

  useEffect(() => {
    if (!user) { router.replace('/'); return; }
    getUserProgress(user.user_id).then(setProgress).catch(() => {});
  }, [user]);

  if (!user) return null;

  const character = CHARACTERS[user.selected_character as CharacterId] || CHARACTERS.cat;
  const classGroup = CLASS_GROUPS.find(c => c.id === (user.current_class || 'class1')) || CLASS_GROUPS[2];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />
      <DailyLoginReward visible={showReward} onClose={closeReward} />

      {/* ── Header ── */}
      <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Hello, {user.name}! 👋</Text>
            <TouchableOpacity style={styles.classBadge} onPress={() => router.push('/settings')}>
              <Text style={styles.classBadgeText}>{classGroup.emoji} {classGroup.label}</Text>
              <Ionicons name="chevron-down" size={12} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.statChip}>
              <Text style={styles.statEmoji}>⭐</Text>
              <Text style={styles.statNum}>{progress?.total_stars ?? user.total_stars}</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={styles.statNum}>{user.daily_streak}d</Text>
            </View>
          </View>
        </View>

        {/* Character showcase */}
        <View style={styles.charRow}>
          <AnimatedCharacter character={user.selected_character as any} expression="happy" size={110} />
          <View style={styles.charInfo}>
            <Text style={styles.charName}>{character.name}</Text>
            <Text style={styles.charPersonality}>{character.personality}</Text>
            <TouchableOpacity style={styles.chatNowBtn}
              onPress={() => router.push(`/chat/${user.selected_character}`)}>
              <Text style={styles.chatNowText}>💬 Chat Now!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* ── Word of Day ── */}
      <View style={styles.section}>
        <WordOfTheDayWidget />
      </View>

      {/* ── Word Spark Banner ── */}
      <View style={styles.section}>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.push('/word-spark' as any)}
        >
          <LinearGradient colors={['#6366F1', '#8B5CF6']} style={styles.wordSparkBanner}>
            <View style={styles.wordSparkLeft}>
              <Text style={styles.wordSparkLabel}>✨ TODAY'S WORD SPARK</Text>
              <Text style={styles.wordSparkTitle}>Daily Vocabulary</Text>
              <Text style={styles.wordSparkSub}>Learn one word deeply with your buddy • 3 stars</Text>
            </View>
            <View style={styles.wordSparkRight}>
              <Text style={styles.wordSparkEmoji}>💬</Text>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Let's Talk Today */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.push('/daily-talk' as any)}
          style={{ marginTop: 10 }}
        >
          <LinearGradient colors={['#BE185D', '#EC4899']} style={styles.wordSparkBanner}>
            <View style={styles.wordSparkLeft}>
              <Text style={styles.wordSparkLabel}>💬 LET'S TALK TODAY!</Text>
              <Text style={styles.wordSparkTitle}>Daily Conversation</Text>
              <Text style={styles.wordSparkSub}>{character.name} picks a fresh topic every day • Voice + text</Text>
            </View>
            <View style={styles.wordSparkRight}>
              <Text style={styles.wordSparkEmoji}>🗣️</Text>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ── 6 Learning Modules ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📚 Learn & Play</Text>
        <View style={styles.modulesGrid}>
          {MODULES.map((mod) => {
            const route = mod.id === 'conversation'
              ? `/chat/${user.selected_character}`
              : mod.route;
            return (
              <TouchableOpacity key={mod.id} style={styles.moduleCard}
                onPress={() => router.push(route as any)} activeOpacity={0.85}>
                <LinearGradient colors={mod.gradient} style={styles.moduleGrad}>
                  <Text style={styles.moduleEmoji}>{mod.emoji}</Text>
                  <Text style={styles.moduleLabel}>{mod.label}</Text>
                  <Text style={styles.moduleDesc}>{mod.desc}</Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── All 4 Chat Buddies ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🤖 Your Buddies</Text>
        <Text style={styles.sectionSub}>Tap any buddy to start chatting!</Text>
        <View style={styles.buddiesGrid}>
          {Object.values(CHARACTERS).map((char) => {
            const isMine = char.id === user.selected_character;
            return (
              <TouchableOpacity key={char.id} style={[styles.buddyCard, isMine && styles.buddyCardActive]}
                onPress={() => router.push(`/chat/${char.id}` as any)} activeOpacity={0.85}>
                <LinearGradient colors={char.gradientColors} style={styles.buddyGrad}>
                  <AnimatedCharacter character={char.id as any}
                    expression={isMine ? 'happy' : 'idle'} size={70} />
                  <Text style={styles.buddyName}>{char.name}</Text>
                  <Text style={styles.buddyPersonality}>{char.personality}</Text>
                  {isMine && <View style={styles.myBuddyBadge}><Text style={styles.myBuddyText}>My Buddy ⭐</Text></View>}
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── Quick Actions ── */}
      <View style={styles.section}>
        <View style={styles.quickRow}>
          <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/progress')}>
            <Ionicons name="bar-chart" size={22} color="#667EEA" />
            <Text style={styles.quickLabel}>Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/daily-session')}>
            <Ionicons name="today" size={22} color="#10B981" />
            <Text style={styles.quickLabel}>Daily Goal</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/parent-dashboard')}>
            <Ionicons name="people" size={22} color="#F59E0B" />
            <Text style={styles.quickLabel}>Parents</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickBtn} onPress={() => router.push('/settings')}>
            <Ionicons name="settings" size={22} color="#8B5CF6" />
            <Text style={styles.quickLabel}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { paddingTop: 52, paddingBottom: 24, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 6 },
  classBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', gap: 4 },
  classBadgeText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  headerRight: { flexDirection: 'row', gap: 8 },
  statChip: { backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 4 },
  statEmoji: { fontSize: 14 },
  statNum: { color: '#fff', fontWeight: '700', fontSize: 15 },
  charRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  charInfo: { flex: 1 },
  charName: { fontSize: 24, fontWeight: '800', color: '#fff' },
  charPersonality: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 10 },
  chatNowBtn: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, alignSelf: 'flex-start' },
  chatNowText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  wordSparkBanner: { borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center' },
  wordSparkLeft:   { flex: 1 },
  wordSparkLabel:  { fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.8, marginBottom: 2 },
  wordSparkTitle:  { fontSize: 17, fontWeight: '700', color: '#fff', marginBottom: 2 },
  wordSparkSub:    { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  wordSparkRight:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  wordSparkEmoji:  { fontSize: 28 },
  sectionSub: { fontSize: 13, color: '#6B7280', marginBottom: 12 },
  modulesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  moduleCard: { width: CARD_W, borderRadius: 16, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4 },
  moduleGrad: { padding: 16, minHeight: 110, justifyContent: 'space-between' },
  moduleEmoji: { fontSize: 28 },
  moduleLabel: { fontSize: 16, fontWeight: '700', color: '#fff', marginTop: 4 },
  moduleDesc: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  buddiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  buddyCard: { width: (width - 52) / 2, borderRadius: 16, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  buddyCardActive: { elevation: 6, shadowOpacity: 0.2 },
  buddyGrad: { alignItems: 'center', paddingVertical: 14, paddingHorizontal: 8 },
  buddyName: { fontSize: 16, fontWeight: '800', color: '#fff', marginTop: 4 },
  buddyPersonality: { fontSize: 11, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 2 },
  myBuddyBadge: { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6 },
  myBuddyText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 16, padding: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
  quickBtn: { alignItems: 'center', gap: 4, flex: 1 },
  quickLabel: { fontSize: 11, color: '#4B5563', fontWeight: '500' },
});
