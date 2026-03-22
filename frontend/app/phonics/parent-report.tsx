import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Dimensions, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useAppStore } from '../../store/appStore';
import { PHONICS_LEVELS, PHONICS_BADGES } from '../../constants/PhonicsData';
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

export default function PhonicsParentReportScreen() {
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
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalLessonsCompleted = () => {
    return progress?.completedLessons.length || 0;
  };

  const getTotalLessons = () => {
    return PHONICS_LEVELS.reduce((sum, level) => sum + level.lessons.length, 0);
  };

  const getOverallMastery = () => {
    if (!progress) return 0;
    const totalProgress = Object.values(progress.levelProgress).reduce((sum, p) => sum + p, 0);
    return Math.round(totalProgress / PHONICS_LEVELS.length);
  };

  const getWeakAreas = () => {
    if (!progress) return [];
    const weakAreas: string[] = [];
    PHONICS_LEVELS.forEach(level => {
      const levelProg = progress.levelProgress[level.id] || 0;
      if (levelProg < 70 && levelProg > 0) {
        weakAreas.push(`Level ${level.id}: ${level.name}`);
      }
    });
    return weakAreas;
  };

  const getStrengths = () => {
    if (!progress) return [];
    const strengths: string[] = [];
    PHONICS_LEVELS.forEach(level => {
      const levelProg = progress.levelProgress[level.id] || 0;
      if (levelProg >= 80) {
        strengths.push(`Level ${level.id}: ${level.name}`);
      }
    });
    return strengths;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667EEA" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1F2937', '#374151']} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Ionicons name="analytics" size={32} color="#fff" />
          <Text style={styles.headerTitle}>Parent Dashboard</Text>
          <Text style={styles.headerSubtitle}>Phonics Progress Report</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Child Info */}
        <View style={styles.childCard}>
          <View style={styles.childAvatar}>
            <Text style={styles.childInitial}>{user?.name?.charAt(0) || 'K'}</Text>
          </View>
          <View style={styles.childInfo}>
            <Text style={styles.childName}>{user?.name || 'Your Child'}</Text>
            <Text style={styles.childLevel}>Current Level: {progress?.currentLevel || 0}</Text>
          </View>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={16} color="#FF6B6B" />
            <Text style={styles.streakText}>{progress?.streak || 0} day streak</Text>
          </View>
        </View>

        {/* Overview Stats */}
        <Text style={styles.sectionTitle}>📊 Overview</Text>
        <View style={styles.statsGrid}>
          <Animatable.View animation="fadeInUp" delay={100} style={[styles.statCard, { backgroundColor: '#EEF2FF' }]}>
            <Ionicons name="school" size={28} color="#667EEA" />
            <Text style={styles.statValue}>{getOverallMastery()}%</Text>
            <Text style={styles.statLabel}>Overall Mastery</Text>
          </Animatable.View>
          
          <Animatable.View animation="fadeInUp" delay={200} style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="book" size={28} color="#10B981" />
            <Text style={styles.statValue}>{getTotalLessonsCompleted()}/{getTotalLessons()}</Text>
            <Text style={styles.statLabel}>Lessons Done</Text>
          </Animatable.View>
          
          <Animatable.View animation="fadeInUp" delay={300} style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="star" size={28} color="#F59E0B" />
            <Text style={styles.statValue}>{progress?.totalStars || 0}</Text>
            <Text style={styles.statLabel}>Stars Earned</Text>
          </Animatable.View>
          
          <Animatable.View animation="fadeInUp" delay={400} style={[styles.statCard, { backgroundColor: '#FCE7F3' }]}>
            <Ionicons name="trophy" size={28} color="#EC4899" />
            <Text style={styles.statValue}>{progress?.earnedBadges.length || 0}</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </Animatable.View>
        </View>

        {/* Level Progress */}
        <Text style={styles.sectionTitle}>📈 Level Progress</Text>
        {PHONICS_LEVELS.map((level, index) => {
          const levelProg = progress?.levelProgress[level.id] || 0;
          const lessonsInLevel = level.lessons.length;
          const completedInLevel = progress?.completedLessons.filter(id => 
            level.lessons.some(l => l.id === id)
          ).length || 0;
          
          return (
            <Animatable.View 
              key={level.id} 
              animation="fadeInUp" 
              delay={500 + index * 100}
              style={styles.levelProgressCard}
            >
              <View style={styles.levelHeader}>
                <View style={[styles.levelIcon, { backgroundColor: level.color }]}>
                  <Text style={styles.levelEmoji}>{level.icon}</Text>
                </View>
                <View style={styles.levelInfo}>
                  <Text style={styles.levelName}>Level {level.id}: {level.name}</Text>
                  <Text style={styles.levelAge}>{level.ageRange}</Text>
                </View>
                <Text style={[styles.levelPercent, { color: level.color }]}>{levelProg}%</Text>
              </View>
              
              <View style={styles.levelProgressBar}>
                <View style={[styles.levelProgressFill, { width: `${levelProg}%`, backgroundColor: level.color }]} />
              </View>
              
              <View style={styles.levelStats}>
                <Text style={styles.levelStatText}>
                  <Ionicons name="book-outline" size={14} color="#6B7280" /> {completedInLevel}/{lessonsInLevel} lessons
                </Text>
                {levelProg >= 80 && (
                  <View style={styles.masteredBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                    <Text style={styles.masteredText}>Mastered!</Text>
                  </View>
                )}
              </View>
            </Animatable.View>
          );
        })}

        {/* Strengths & Weak Areas */}
        <View style={styles.analysisRow}>
          <View style={[styles.analysisCard, { backgroundColor: '#D1FAE5' }]}>
            <View style={styles.analysisHeader}>
              <Ionicons name="trending-up" size={20} color="#10B981" />
              <Text style={styles.analysisTitle}>Strengths</Text>
            </View>
            {getStrengths().length > 0 ? (
              getStrengths().map((s, i) => (
                <Text key={i} style={styles.analysisItem}>✓ {s}</Text>
              ))
            ) : (
              <Text style={styles.analysisEmpty}>Keep practicing!</Text>
            )}
          </View>
          
          <View style={[styles.analysisCard, { backgroundColor: '#FEE2E2' }]}>
            <View style={styles.analysisHeader}>
              <Ionicons name="fitness" size={20} color="#EF4444" />
              <Text style={styles.analysisTitle}>Needs Practice</Text>
            </View>
            {getWeakAreas().length > 0 ? (
              getWeakAreas().map((w, i) => (
                <Text key={i} style={styles.analysisItem}>• {w}</Text>
              ))
            ) : (
              <Text style={styles.analysisEmpty}>Great progress!</Text>
            )}
          </View>
        </View>

        {/* Badges Earned */}
        <Text style={styles.sectionTitle}>🏆 Badges Earned</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesScroll}>
          {PHONICS_BADGES.map((badge, index) => {
            const isEarned = progress?.earnedBadges.includes(badge.id);
            return (
              <View 
                key={badge.id}
                style={[styles.badgeCard, !isEarned && styles.badgeCardLocked]}
              >
                <Text style={styles.badgeIcon}>{isEarned ? badge.icon : '🔒'}</Text>
                <Text style={[styles.badgeName, !isEarned && styles.textLocked]}>{badge.name}</Text>
                <Text style={[styles.badgeReq, !isEarned && styles.textLocked]}>{badge.requirement}</Text>
              </View>
            );
          })}
        </ScrollView>

        {/* Recommendations */}
        <Text style={styles.sectionTitle}>💡 Recommendations</Text>
        <View style={styles.recommendationCard}>
          <Ionicons name="bulb" size={24} color="#F59E0B" />
          <View style={styles.recommendationContent}>
            <Text style={styles.recommendationTitle}>Daily Practice</Text>
            <Text style={styles.recommendationText}>
              Consistent 15-minute daily practice sessions are most effective for phonics mastery. 
              Try to maintain the streak!
            </Text>
          </View>
        </View>
        
        {progress?.currentLevel !== undefined && progress.currentLevel < 4 && (
          <View style={styles.recommendationCard}>
            <Ionicons name="arrow-up-circle" size={24} color="#10B981" />
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationTitle}>Next Goal</Text>
              <Text style={styles.recommendationText}>
                Work towards 80% mastery in Level {progress.currentLevel} to unlock Level {progress.currentLevel + 1}!
              </Text>
            </View>
          </View>
        )}

        {/* Export Button */}
        <TouchableOpacity style={styles.exportButton}>
          <Ionicons name="download-outline" size={20} color="#667EEA" />
          <Text style={styles.exportButtonText}>Export Progress Report (PDF)</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: { paddingTop: 50, paddingBottom: 24, paddingHorizontal: 20 },
  backButton: { position: 'absolute', top: 50, left: 16, zIndex: 10, padding: 8 },
  headerContent: { alignItems: 'center', marginTop: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginTop: 8 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  
  content: { flex: 1, padding: 16 },
  
  childCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 20, elevation: 2 },
  childAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#667EEA', justifyContent: 'center', alignItems: 'center' },
  childInitial: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  childInfo: { flex: 1, marginLeft: 14 },
  childName: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  childLevel: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  streakText: { fontSize: 12, fontWeight: '600', color: '#92400E', marginLeft: 4 },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginTop: 8, marginBottom: 12 },
  
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 8 },
  statCard: { width: (width - 48) / 2, borderRadius: 16, padding: 16, marginBottom: 12, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  
  levelProgressCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  levelHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  levelIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  levelEmoji: { fontSize: 20 },
  levelInfo: { flex: 1, marginLeft: 12 },
  levelName: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  levelAge: { fontSize: 11, color: '#6B7280' },
  levelPercent: { fontSize: 18, fontWeight: 'bold' },
  levelProgressBar: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
  levelProgressFill: { height: '100%', borderRadius: 4 },
  levelStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  levelStatText: { fontSize: 12, color: '#6B7280' },
  masteredBadge: { flexDirection: 'row', alignItems: 'center' },
  masteredText: { fontSize: 12, fontWeight: '600', color: '#10B981', marginLeft: 4 },
  
  analysisRow: { flexDirection: 'row', marginBottom: 8 },
  analysisCard: { flex: 1, borderRadius: 12, padding: 12, marginHorizontal: 4 },
  analysisHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  analysisTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginLeft: 6 },
  analysisItem: { fontSize: 12, color: '#4B5563', marginTop: 4 },
  analysisEmpty: { fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' },
  
  badgesScroll: { marginBottom: 16 },
  badgeCard: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginRight: 10, minWidth: 100, elevation: 2 },
  badgeCardLocked: { backgroundColor: '#F3F4F6' },
  badgeIcon: { fontSize: 28 },
  badgeName: { fontSize: 11, fontWeight: '600', color: '#1F2937', marginTop: 6, textAlign: 'center' },
  badgeReq: { fontSize: 9, color: '#9CA3AF', marginTop: 2, textAlign: 'center' },
  textLocked: { color: '#9CA3AF' },
  
  recommendationCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, elevation: 2 },
  recommendationContent: { flex: 1, marginLeft: 12 },
  recommendationTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  recommendationText: { fontSize: 12, color: '#6B7280', marginTop: 4, lineHeight: 18 },
  
  exportButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#EEF2FF', borderRadius: 12, padding: 14, marginTop: 8 },
  exportButtonText: { fontSize: 14, fontWeight: '600', color: '#667EEA', marginLeft: 8 },
});
