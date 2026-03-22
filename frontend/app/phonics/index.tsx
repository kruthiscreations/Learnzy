import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Dimensions, ActivityIndicator, Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useAppStore } from '../../store/appStore';
import { PHONICS_LEVELS, PHONICS_BADGES, getPhonicsLevel } from '../../constants/PhonicsData';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface PhonicsProgress {
  currentLevel: number;
  levelProgress: { [key: number]: number };
  completedLessons: string[];
  earnedBadges: string[];
  totalStars: number;
  streak: number;
  lastPracticeDate: string | null;
}

export default function PhonicsHubScreen() {
  const router = useRouter();
  const { user } = useAppStore();
  const [progress, setProgress] = useState<PhonicsProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem(`phonics_progress_${user?.user_id}`);
      if (saved) {
        setProgress(JSON.parse(saved));
      } else {
        // Initialize new progress
        const initial: PhonicsProgress = {
          currentLevel: 0,
          levelProgress: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 },
          completedLessons: [],
          earnedBadges: [],
          totalStars: 0,
          streak: 0,
          lastPracticeDate: null
        };
        setProgress(initial);
        await AsyncStorage.setItem(`phonics_progress_${user?.user_id}`, JSON.stringify(initial));
      }
    } catch (error) {
      console.error('Error loading phonics progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const isLevelUnlocked = (levelId: number): boolean => {
    if (levelId === 0) return true;
    if (!progress) return false;
    const prevLevel = levelId - 1;
    return (progress.levelProgress[prevLevel] || 0) >= 80;
  };

  const getLevelStatus = (levelId: number): 'locked' | 'in-progress' | 'completed' => {
    if (!progress) return 'locked';
    if (!isLevelUnlocked(levelId)) return 'locked';
    const levelProg = progress.levelProgress[levelId] || 0;
    if (levelProg >= 100) return 'completed';
    return 'in-progress';
  };

  const handleLevelPress = (levelId: number) => {
    if (!isLevelUnlocked(levelId)) {
      Alert.alert(
        '🔒 Level Locked',
        `Complete Level ${levelId - 1} with 80% mastery to unlock this level!`,
        [{ text: 'OK' }]
      );
      return;
    }
    router.push(`/phonics/level/${levelId}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667EEA" />
        <Text style={styles.loadingText}>Loading Phonics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Animatable.View animation="fadeInDown" style={styles.headerContent}>
          <Text style={styles.headerTitle}>🎯 Mastering Phonics</Text>
          <Text style={styles.headerSubtitle}>Learn to read the fun way!</Text>
        </Animatable.View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.statValue}>{progress?.totalStars || 0}</Text>
            <Text style={styles.statLabel}>Stars</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="flame" size={20} color="#FF6B6B" />
            <Text style={styles.statValue}>{progress?.streak || 0}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="trophy" size={20} color="#4ECDC4" />
            <Text style={styles.statValue}>{progress?.earnedBadges.length || 0}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Practice Button */}
        <Animatable.View animation="fadeInUp" delay={100}>
          <TouchableOpacity 
            style={styles.quickPracticeCard}
            onPress={() => router.push(`/phonics/level/${progress?.currentLevel || 0}`)}
            data-testid="phonics-quick-practice"
          >
            <LinearGradient colors={['#FF6B9D', '#FF8E53']} style={styles.quickPracticeGradient}>
              <View style={styles.quickPracticeIcon}>
                <Ionicons name="play-circle" size={40} color="#fff" />
              </View>
              <View style={styles.quickPracticeContent}>
                <Text style={styles.quickPracticeTitle}>Continue Learning</Text>
                <Text style={styles.quickPracticeSubtitle}>
                  Level {progress?.currentLevel || 0}: {PHONICS_LEVELS[progress?.currentLevel || 0]?.name}
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>

        {/* Levels Section */}
        <Text style={styles.sectionTitle}>📚 Phonics Levels</Text>
        
        {PHONICS_LEVELS.map((level, index) => {
          const status = getLevelStatus(level.id);
          const levelProgress = progress?.levelProgress[level.id] || 0;
          
          return (
            <Animatable.View 
              key={level.id} 
              animation="fadeInUp" 
              delay={200 + index * 100}
            >
              <TouchableOpacity
                style={[
                  styles.levelCard,
                  status === 'locked' && styles.levelCardLocked,
                  status === 'completed' && styles.levelCardCompleted
                ]}
                onPress={() => handleLevelPress(level.id)}
                data-testid={`phonics-level-${level.id}`}
              >
                <View style={[styles.levelIcon, { backgroundColor: status === 'locked' ? '#9CA3AF' : level.color }]}>
                  {status === 'locked' ? (
                    <Ionicons name="lock-closed" size={28} color="#fff" />
                  ) : status === 'completed' ? (
                    <Ionicons name="checkmark-circle" size={28} color="#fff" />
                  ) : (
                    <Text style={styles.levelEmoji}>{level.icon}</Text>
                  )}
                </View>
                
                <View style={styles.levelInfo}>
                  <Text style={[styles.levelName, status === 'locked' && styles.textLocked]}>
                    Level {level.id}: {level.name}
                  </Text>
                  <Text style={[styles.levelAge, status === 'locked' && styles.textLocked]}>
                    {level.ageRange}
                  </Text>
                  <Text style={[styles.levelDesc, status === 'locked' && styles.textLocked]} numberOfLines={1}>
                    {level.description}
                  </Text>
                  
                  {status !== 'locked' && (
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${levelProgress}%`, backgroundColor: level.color }
                        ]} 
                      />
                    </View>
                  )}
                </View>

                <View style={styles.levelRight}>
                  {status === 'completed' ? (
                    <View style={styles.completedBadge}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text style={styles.completedText}>100%</Text>
                    </View>
                  ) : status !== 'locked' ? (
                    <Text style={styles.progressText}>{levelProgress}%</Text>
                  ) : (
                    <Ionicons name="lock-closed" size={20} color="#9CA3AF" />
                  )}
                </View>
              </TouchableOpacity>
            </Animatable.View>
          );
        })}

        {/* Badges Section */}
        <Text style={styles.sectionTitle}>🏆 Badges</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesScroll}>
          {PHONICS_BADGES.slice(0, 6).map((badge, index) => {
            const isEarned = progress?.earnedBadges.includes(badge.id);
            return (
              <Animatable.View 
                key={badge.id}
                animation="bounceIn"
                delay={500 + index * 100}
                style={[styles.badgeCard, !isEarned && styles.badgeCardLocked]}
              >
                <Text style={styles.badgeIcon}>{isEarned ? badge.icon : '🔒'}</Text>
                <Text style={[styles.badgeName, !isEarned && styles.textLocked]}>{badge.name}</Text>
              </Animatable.View>
            );
          })}
        </ScrollView>

        {/* Parent Dashboard Link */}
        <TouchableOpacity 
          style={styles.parentLink}
          onPress={() => router.push('/phonics/parent-report')}
        >
          <Ionicons name="people" size={20} color="#667EEA" />
          <Text style={styles.parentLinkText}>Parent Dashboard</Text>
          <Ionicons name="arrow-forward" size={16} color="#667EEA" />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#6B7280' },
  
  header: { paddingTop: 50, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backButton: { position: 'absolute', top: 50, left: 16, zIndex: 10, padding: 8 },
  headerContent: { alignItems: 'center', marginTop: 10 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  statItem: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, padding: 12, minWidth: 80 },
  statValue: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginTop: 4 },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  
  content: { flex: 1, padding: 16 },
  
  quickPracticeCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8 },
  quickPracticeGradient: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  quickPracticeIcon: { marginRight: 16 },
  quickPracticeContent: { flex: 1 },
  quickPracticeTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  quickPracticeSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginTop: 8, marginBottom: 12 },
  
  levelCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 },
  levelCardLocked: { backgroundColor: '#F3F4F6', opacity: 0.8 },
  levelCardCompleted: { borderWidth: 2, borderColor: '#10B981' },
  
  levelIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  levelEmoji: { fontSize: 28 },
  
  levelInfo: { flex: 1 },
  levelName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  levelAge: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  levelDesc: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  textLocked: { color: '#9CA3AF' },
  
  progressBar: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, marginTop: 8, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  
  levelRight: { alignItems: 'center', marginLeft: 8 },
  progressText: { fontSize: 14, fontWeight: 'bold', color: '#667EEA' },
  completedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  completedText: { fontSize: 12, fontWeight: 'bold', color: '#10B981', marginLeft: 4 },
  
  badgesScroll: { marginBottom: 16 },
  badgeCard: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginRight: 12, minWidth: 90, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 },
  badgeCardLocked: { backgroundColor: '#F3F4F6' },
  badgeIcon: { fontSize: 32 },
  badgeName: { fontSize: 11, fontWeight: '600', color: '#1F2937', marginTop: 8, textAlign: 'center' },
  
  parentLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEF2FF', borderRadius: 12, padding: 14, marginTop: 8 },
  parentLinkText: { fontSize: 14, fontWeight: '600', color: '#667EEA', marginHorizontal: 8 },
});
