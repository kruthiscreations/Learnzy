import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Switch, TextInput, Alert, ActivityIndicator, Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '../store/appStore';
import { getUserProgress } from '../utils/api';
import { LEVELS, CHARACTERS } from '../constants/AppData';

const { width } = Dimensions.get('window');

// Simulated weekly activity data (in production, this comes from backend)
function generateWeekData(streak: number) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, i) => ({
    day,
    minutes: i < streak ? Math.floor(10 + Math.random() * 20) : 0,
    completed: i < streak,
  }));
}

function getSpeakingConfidence(progress: any, stars: number): number {
  if (!progress) return 0;
  const mastered = progress.mastered_words || 0;
  const practiced = progress.total_words_practiced || 0;
  const base = Math.min(100, Math.round((mastered * 4 + practiced * 1 + stars * 0.5)));
  return Math.max(5, Math.min(base, 98));
}

const SCREEN_TIME_OPTIONS = [15, 20, 30, 45, 60];

interface CustomWord {
  id: string;
  word: string;
  meaning: string;
}

export default function ParentDashboardScreen() {
  const router = useRouter();
  const { user } = useAppStore();
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'settings' | 'vocab'>('overview');

  // Settings state
  const [screenTimeLimit, setScreenTimeLimit] = useState(30);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [dailyReminderOn, setDailyReminderOn] = useState(true);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Custom vocab state
  const [customWords, setCustomWords] = useState<CustomWord[]>([]);
  const [newWord, setNewWord] = useState('');
  const [newMeaning, setNewMeaning] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (user) {
        const prog = await getUserProgress(user.user_id);
        setProgress(prog);
      }
      // Load saved settings
      const savedTime = await AsyncStorage.getItem('parent_screen_time');
      if (savedTime) setScreenTimeLimit(Number(savedTime));
      const savedWords = await AsyncStorage.getItem('parent_custom_words');
      if (savedWords) setCustomWords(JSON.parse(savedWords));
      const notif = await AsyncStorage.getItem('parent_notifications');
      if (notif !== null) setNotificationsOn(notif === '1');
      const reminder = await AsyncStorage.getItem('parent_daily_reminder');
      if (reminder !== null) setDailyReminderOn(reminder === '1');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    await AsyncStorage.setItem('parent_screen_time', String(screenTimeLimit));
    await AsyncStorage.setItem('parent_notifications', notificationsOn ? '1' : '0');
    await AsyncStorage.setItem('parent_daily_reminder', dailyReminderOn ? '1' : '0');
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  const addCustomWord = async () => {
    if (!newWord.trim() || !newMeaning.trim()) return;
    const word: CustomWord = { id: Date.now().toString(), word: newWord.trim(), meaning: newMeaning.trim() };
    const updated = [...customWords, word];
    setCustomWords(updated);
    await AsyncStorage.setItem('parent_custom_words', JSON.stringify(updated));
    setNewWord('');
    setNewMeaning('');
  };

  const removeCustomWord = async (id: string) => {
    const updated = customWords.filter(w => w.id !== id);
    setCustomWords(updated);
    await AsyncStorage.setItem('parent_custom_words', JSON.stringify(updated));
  };

  if (!user || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667EEA" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  const character = CHARACTERS[user.selected_character as keyof typeof CHARACTERS];
  const currentLevel = LEVELS.find(l => l.id === user.current_level) || LEVELS[0];
  const speakingConfidence = getSpeakingConfidence(progress, user.total_stars);
  const weekData = generateWeekData(user.daily_streak);
  const masteredWords = progress?.mastered_words || 0;
  const totalPracticed = progress?.total_words_practiced || 0;
  const levelPercent = progress?.level_progress_percent || 0;
  const maxBarH = 60;

  const tabs: { id: 'overview' | 'activity' | 'settings' | 'vocab'; icon: string; label: string }[] = [
    { id: 'overview', icon: 'bar-chart', label: 'Overview' },
    { id: 'activity', icon: 'calendar', label: 'Activity' },
    { id: 'vocab', icon: 'book', label: 'Vocab' },
    { id: 'settings', icon: 'settings', label: 'Settings' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#1E293B', '#334155']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerLabel}>Parent Dashboard 👨‍👩‍👦</Text>
            <Text style={styles.headerChild}>{character.emoji} {user.name}'s Progress</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>{currentLevel.name}</Text>
          </View>
        </View>

        {/* Quick stats strip */}
        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>{user.daily_streak}</Text>
            <Text style={styles.quickStatLabel}>🔥 Streak</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>{masteredWords}</Text>
            <Text style={styles.quickStatLabel}>📚 Mastered</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>{user.total_stars}</Text>
            <Text style={styles.quickStatLabel}>⭐ Stars</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>{speakingConfidence}%</Text>
            <Text style={styles.quickStatLabel}>🎤 Confidence</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons name={tab.icon as any} size={18} color={activeTab === tab.id ? '#667EEA' : '#9CA3AF'} />
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === 'overview' && (
          <Animatable.View animation="fadeIn" style={styles.tabContent}>

            {/* Speaking Confidence Gauge */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🎤 Speaking Confidence</Text>
              <View style={styles.confidenceRow}>
                <View style={styles.confidenceBarBg}>
                  <View style={[styles.confidenceBarFill, { width: `${speakingConfidence}%` }]} />
                </View>
                <Text style={styles.confidencePercent}>{speakingConfidence}%</Text>
              </View>
              <Text style={styles.confidenceDesc}>
                {speakingConfidence >= 70
                  ? `${user.name} is speaking with good confidence! 🌟`
                  : speakingConfidence >= 40
                  ? `${user.name} is making great progress — keep practising daily! 💪`
                  : `${user.name} is just getting started — daily practice builds confidence! 📚`}
              </Text>
            </View>

            {/* Level progress */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📈 Level Progress</Text>
              <View style={styles.levelRow}>
                <View style={[styles.levelDot, { backgroundColor: currentLevel.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.levelName}>{currentLevel.name}</Text>
                  <Text style={styles.levelDesc}>{currentLevel.description}</Text>
                </View>
                <Text style={[styles.levelPct, { color: currentLevel.color }]}>{levelPercent}%</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${levelPercent}%`, backgroundColor: currentLevel.color }]} />
              </View>
              {progress?.can_unlock_next_level && (
                <View style={styles.unlockHint}>
                  <Ionicons name="trophy" size={16} color="#F59E0B" />
                  <Text style={styles.unlockHintText}>Ready to move to the next level!</Text>
                </View>
              )}
            </View>

            {/* Word stats */}
            <View style={styles.cardRow}>
              <View style={[styles.miniCard, { borderTopColor: '#667EEA' }]}>
                <Text style={styles.miniCardValue}>{totalPracticed}</Text>
                <Text style={styles.miniCardLabel}>Words practiced</Text>
              </View>
              <View style={[styles.miniCard, { borderTopColor: '#10B981' }]}>
                <Text style={styles.miniCardValue}>{masteredWords}</Text>
                <Text style={styles.miniCardLabel}>Words mastered</Text>
              </View>
              <View style={[styles.miniCard, { borderTopColor: '#F59E0B' }]}>
                <Text style={styles.miniCardValue}>{user.daily_streak}</Text>
                <Text style={styles.miniCardLabel}>Day streak</Text>
              </View>
            </View>

            {/* Achievements unlocked */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🏆 Achievements Unlocked</Text>
              <View style={styles.achievementsRow}>
                {[
                  { label: 'Star Collector', icon: '⭐', unlocked: user.total_stars >= 10 },
                  { label: 'Streak Master', icon: '🔥', unlocked: user.daily_streak >= 3 },
                  { label: 'Word Master', icon: '📚', unlocked: masteredWords >= 10 },
                  { label: 'Half Way', icon: '🏅', unlocked: levelPercent >= 50 },
                ].map(a => (
                  <View key={a.label} style={[styles.achievementBadge, !a.unlocked && { opacity: 0.3 }]}>
                    <Text style={styles.achievementIcon}>{a.icon}</Text>
                    <Text style={styles.achievementLabel}>{a.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Tips for parents */}
            <View style={styles.tipsCard}>
              <Text style={styles.tipsTitle}>💡 Tips to Boost {user.name}'s English</Text>
              <Text style={styles.tipItem}>• Ask "{user.name}, what new word did you learn today?"</Text>
              <Text style={styles.tipItem}>• Watch English cartoons together for 15 min daily</Text>
              <Text style={styles.tipItem}>• Praise effort, not just results — "You tried so hard!"</Text>
              <Text style={styles.tipItem}>• Read English picture books at bedtime together</Text>
            </View>

            {/* Growth Mindset — Math coaching for parents */}
            <View style={styles.mindsetCard}>
              <Text style={styles.mindsetTitle}>🧠 Build a Maths Mindset</Text>
              <Text style={styles.mindsetSub}>Research-backed coaching tips for parents</Text>
              {[
                { emoji: '❤️', title: "Say 'I believe you can'", body: "Don't say 'I was never good at maths either' — it gives children a built-in excuse to give up. Instead: 'Maths takes practice and you get better every day.'" },
                { emoji: '🏆', title: 'Praise effort, not grade', body: "Say 'I noticed you tried three different methods' — not 'You are so clever!' Praising intelligence makes children afraid to take on challenges." },
                { emoji: '⏳', title: 'Let them struggle (a little)', body: "When your child is stuck, wait 60 seconds before helping. Ask 'What have you tried so far?' The struggle IS the learning." },
                { emoji: '🌍', title: 'Maths is everywhere', body: "Point it out daily: 'We need ½ kg of tomatoes', 'That building has how many floors?', 'Quick — 8 biscuits, 4 of us, how many each?'" },
              ].map((tip, i) => (
                <View key={i} style={styles.mindsetTip}>
                  <Text style={styles.mindsetTipIcon}>{tip.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.mindsetTipTitle}>{tip.title}</Text>
                    <Text style={styles.mindsetTipBody}>{tip.body}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Animatable.View>
        )}

        {/* ── ACTIVITY TAB ── */}
        {activeTab === 'activity' && (
          <Animatable.View animation="fadeIn" style={styles.tabContent}>

            {/* Weekly bar chart */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📅 This Week's Activity</Text>
              <Text style={styles.cardSubtitle}>Minutes of English practice per day</Text>
              <View style={styles.barChart}>
                {weekData.map((d, i) => (
                  <View key={i} style={styles.barItem}>
                    <Text style={styles.barValue}>{d.minutes > 0 ? d.minutes : ''}</Text>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: d.minutes > 0 ? Math.max(8, (d.minutes / 30) * maxBarH) : 8,
                          backgroundColor: d.completed ? '#667EEA' : '#E5E7EB',
                        },
                      ]}
                    />
                    <Text style={styles.barLabel}>{d.day}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.chartNote}>
                {weekData.filter(d => d.completed).length} of 7 days active this week
              </Text>
            </View>

            {/* Streak calendar */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🔥 Streak Calendar</Text>
              <View style={styles.streakRow}>
                {Array.from({ length: 14 }).map((_, i) => {
                  const active = i >= (14 - user.daily_streak);
                  return (
                    <View
                      key={i}
                      style={[styles.streakDot, { backgroundColor: active ? '#F59E0B' : '#E5E7EB' }]}
                    />
                  );
                })}
              </View>
              <Text style={styles.streakCaption}>
                {user.daily_streak} day streak — {user.daily_streak >= 7 ? '🏆 Amazing!' : `${7 - user.daily_streak} more days for a week badge!`}
              </Text>
            </View>

            {/* Screen time info */}
            <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#10B981' }]}>
              <Text style={styles.cardTitle}>⏱ Screen Time Today</Text>
              <Text style={styles.screenTimeValue}>
                {Math.min(screenTimeLimit, weekData[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1].minutes)} / {screenTimeLimit} min
              </Text>
              <Text style={styles.screenTimeNote}>Limit set to {screenTimeLimit} minutes/day</Text>
              <TouchableOpacity style={styles.changeTimeLinkBtn} onPress={() => setActiveTab('settings')}>
                <Text style={styles.changeTimeLinkText}>Change screen time limit →</Text>
              </TouchableOpacity>
            </View>

          </Animatable.View>
        )}

        {/* ── VOCAB TAB ── */}
        {activeTab === 'vocab' && (
          <Animatable.View animation="fadeIn" style={styles.tabContent}>
            <Text style={styles.vocabIntro}>
              Add custom words you want {user.name} to focus on — these will appear as priority words in practice sessions.
            </Text>

            {/* Add word form */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>➕ Add a Custom Word</Text>
              <TextInput
                style={styles.vocabInput}
                value={newWord}
                onChangeText={setNewWord}
                placeholder="English word (e.g. Umbrella)"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
              />
              <TextInput
                style={styles.vocabInput}
                value={newMeaning}
                onChangeText={setNewMeaning}
                placeholder="Meaning or context (e.g. छाता)"
                placeholderTextColor="#9CA3AF"
              />
              <TouchableOpacity
                style={[styles.addWordBtn, (!newWord.trim() || !newMeaning.trim()) && styles.addWordBtnDisabled]}
                onPress={addCustomWord}
                disabled={!newWord.trim() || !newMeaning.trim()}
              >
                <Text style={styles.addWordBtnText}>Add Word</Text>
              </TouchableOpacity>
            </View>

            {/* Custom word list */}
            {customWords.length === 0 ? (
              <View style={styles.emptyVocab}>
                <Text style={styles.emptyVocabEmoji}>📝</Text>
                <Text style={styles.emptyVocabText}>No custom words yet.</Text>
                <Text style={styles.emptyVocabSub}>Add words from {user.name}'s school curriculum!</Text>
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>📋 Custom Word List ({customWords.length})</Text>
                {customWords.map(w => (
                  <View key={w.id} style={styles.vocabRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.vocabWord}>{w.word}</Text>
                      <Text style={styles.vocabMeaning}>{w.meaning}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeCustomWord(w.id)} style={styles.deleteWordBtn}>
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </Animatable.View>
        )}

        {/* ── SETTINGS TAB ── */}
        {activeTab === 'settings' && (
          <Animatable.View animation="fadeIn" style={styles.tabContent}>

            {/* Screen time */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>⏱ Daily Screen Time Limit</Text>
              <Text style={styles.cardSubtitle}>Set how many minutes {user.name} can use the app per day</Text>
              <View style={styles.timeOptionsRow}>
                {SCREEN_TIME_OPTIONS.map(min => (
                  <TouchableOpacity
                    key={min}
                    style={[styles.timeOption, screenTimeLimit === min && styles.timeOptionActive]}
                    onPress={() => setScreenTimeLimit(min)}
                  >
                    <Text style={[styles.timeOptionText, screenTimeLimit === min && styles.timeOptionTextActive]}>
                      {min}m
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.timeNote}>
                {screenTimeLimit <= 15
                  ? 'Quick daily session — great for very young kids!'
                  : screenTimeLimit <= 30
                  ? 'Recommended for most ages — focused and effective!'
                  : 'Extended session — suitable for older, motivated learners.'}
              </Text>
            </View>

            {/* Notification toggles */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🔔 Notifications</Text>
              <View style={styles.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>Daily Reminder</Text>
                  <Text style={styles.toggleSub}>Remind {user.name} to practise English daily</Text>
                </View>
                <Switch
                  value={dailyReminderOn}
                  onValueChange={setDailyReminderOn}
                  trackColor={{ false: '#E5E7EB', true: '#667EEA' }}
                  thumbColor="#fff"
                />
              </View>
              <View style={[styles.toggleRow, { marginTop: 16 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>Progress Alerts</Text>
                  <Text style={styles.toggleSub}>Get notified when {user.name} earns a new badge</Text>
                </View>
                <Switch
                  value={notificationsOn}
                  onValueChange={setNotificationsOn}
                  trackColor={{ false: '#E5E7EB', true: '#667EEA' }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            {/* Child info */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>👤 Child Profile</Text>
              <View style={styles.profileRow}>
                <Text style={styles.profileEmoji}>{character.emoji}</Text>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.profileName}>{user.name}</Text>
                  <Text style={styles.profileDetail}>Age group: {user.age_group}</Text>
                  <Text style={styles.profileDetail}>Level: {currentLevel.name}</Text>
                  <Text style={styles.profileDetail}>Language: {user.preferred_language}</Text>
                </View>
              </View>
            </View>

            {/* Save button */}
            <TouchableOpacity style={styles.saveBtn} onPress={saveSettings}>
              <Text style={styles.saveBtnText}>
                {settingsSaved ? '✅ Settings Saved!' : 'Save Settings'}
              </Text>
            </TouchableOpacity>

          </Animatable.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 16, color: '#6B7280' },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20 },
  backButton: { marginBottom: 14 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
  headerLabel: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  headerChild: { fontSize: 15, color: 'rgba(255,255,255,0.8)' },
  levelBadge: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  levelBadgeText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  quickStats: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 18, padding: 14, justifyContent: 'space-between' },
  quickStat: { flex: 1, alignItems: 'center', gap: 2 },
  quickStatValue: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  quickStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)', textAlign: 'center' },
  quickStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, gap: 2 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#667EEA' },
  tabText: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
  tabTextActive: { color: '#667EEA' },
  content: { padding: 16, paddingBottom: 40 },
  tabContent: { gap: 14 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 18, gap: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  cardSubtitle: { fontSize: 13, color: '#9CA3AF', marginTop: -6 },
  // Confidence
  confidenceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  confidenceBarBg: { flex: 1, height: 14, backgroundColor: '#E5E7EB', borderRadius: 7, overflow: 'hidden' },
  confidenceBarFill: { height: '100%', backgroundColor: '#667EEA', borderRadius: 7 },
  confidencePercent: { fontSize: 22, fontWeight: 'bold', color: '#667EEA', minWidth: 52, textAlign: 'right' },
  confidenceDesc: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  // Level
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  levelDot: { width: 14, height: 14, borderRadius: 7 },
  levelName: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  levelDesc: { fontSize: 13, color: '#6B7280' },
  levelPct: { fontSize: 20, fontWeight: 'bold' },
  progressBarBg: { height: 10, backgroundColor: '#E5E7EB', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 5 },
  unlockHint: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF3C7', borderRadius: 10, padding: 10 },
  unlockHintText: { fontSize: 13, fontWeight: '600', color: '#92400E' },
  // Mini cards
  cardRow: { flexDirection: 'row', gap: 10 },
  miniCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center', gap: 4, borderTopWidth: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  miniCardValue: { fontSize: 28, fontWeight: 'bold', color: '#1F2937' },
  miniCardLabel: { fontSize: 12, color: '#6B7280', textAlign: 'center' },
  // Achievements
  achievementsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achievementBadge: { backgroundColor: '#F9FAFB', borderRadius: 14, padding: 12, alignItems: 'center', gap: 4, minWidth: (width - 80) / 4 },
  achievementIcon: { fontSize: 28 },
  achievementLabel: { fontSize: 10, color: '#6B7280', textAlign: 'center', fontWeight: '600' },
  // Tips
  tipsCard: { backgroundColor: '#EEF2FF', borderRadius: 18, padding: 16, gap: 8 },
  tipsTitle: { fontSize: 15, fontWeight: '700', color: '#3730A3' },
  tipItem: { fontSize: 14, color: '#4338CA', lineHeight: 22 },
  mindsetCard: { backgroundColor: '#FFF7ED', borderRadius: 18, padding: 16, gap: 10, borderWidth: 1, borderColor: '#FED7AA' },
  mindsetTitle: { fontSize: 15, fontWeight: '700', color: '#92400E' },
  mindsetSub: { fontSize: 12, color: '#B45309', marginTop: -4 },
  mindsetTip: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', paddingTop: 8, borderTopWidth: 0.5, borderTopColor: '#FED7AA' },
  mindsetTipIcon: { fontSize: 20, marginTop: 1 },
  mindsetTipTitle: { fontSize: 13, fontWeight: '700', color: '#78350F', marginBottom: 2 },
  mindsetTipBody: { fontSize: 12, color: '#92400E', lineHeight: 18 },
  // Bar chart
  barChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 90, marginTop: 8 },
  barItem: { flex: 1, alignItems: 'center', gap: 4 },
  barValue: { fontSize: 11, color: '#667EEA', fontWeight: '700', minHeight: 16 },
  bar: { width: '70%', borderRadius: 6, minHeight: 8 },
  barLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
  chartNote: { fontSize: 13, color: '#9CA3AF', textAlign: 'center' },
  // Streak
  streakRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  streakDot: { width: 22, height: 22, borderRadius: 11 },
  streakCaption: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  // Screen time
  screenTimeValue: { fontSize: 32, fontWeight: 'bold', color: '#10B981' },
  screenTimeNote: { fontSize: 13, color: '#9CA3AF' },
  changeTimeLinkBtn: {},
  changeTimeLinkText: { fontSize: 13, color: '#667EEA', fontWeight: '600' },
  // Time options
  timeOptionsRow: { flexDirection: 'row', gap: 10 },
  timeOption: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 14, paddingVertical: 12, alignItems: 'center', borderWidth: 2, borderColor: '#F3F4F6' },
  timeOptionActive: { backgroundColor: '#EEF2FF', borderColor: '#667EEA' },
  timeOptionText: { fontSize: 15, fontWeight: '700', color: '#9CA3AF' },
  timeOptionTextActive: { color: '#667EEA' },
  timeNote: { fontSize: 13, color: '#6B7280', fontStyle: 'italic' },
  // Toggles
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  toggleSub: { fontSize: 13, color: '#9CA3AF' },
  // Profile
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  profileEmoji: { fontSize: 44 },
  profileName: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  profileDetail: { fontSize: 14, color: '#6B7280', textTransform: 'capitalize' },
  // Save
  saveBtn: { backgroundColor: '#667EEA', borderRadius: 18, paddingVertical: 16, alignItems: 'center', marginTop: 6 },
  saveBtnText: { fontSize: 17, fontWeight: 'bold', color: '#fff' },
  // Vocab
  vocabIntro: { fontSize: 14, color: '#6B7280', lineHeight: 22 },
  vocabInput: { backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: '#1F2937' },
  addWordBtn: { backgroundColor: '#667EEA', borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  addWordBtnDisabled: { backgroundColor: '#E5E7EB' },
  addWordBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  emptyVocab: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyVocabEmoji: { fontSize: 48 },
  emptyVocabText: { fontSize: 17, fontWeight: '700', color: '#374151' },
  emptyVocabSub: { fontSize: 14, color: '#9CA3AF', textAlign: 'center' },
  vocabRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', gap: 10 },
  vocabWord: { fontSize: 17, fontWeight: '700', color: '#1F2937' },
  vocabMeaning: { fontSize: 14, color: '#9CA3AF' },
  deleteWordBtn: { padding: 6 },
});
