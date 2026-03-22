import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/appStore';
import { getUserProgress } from '../utils/api';
import { CHARACTERS } from '../constants/AppData';

export default function ProgressScreen() {
  const router = useRouter();
  const { user } = useAppStore();
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      if (user) {
        const progressData = await getUserProgress(user.user_id);
        setProgress(progressData);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const character = CHARACTERS[user.selected_character as keyof typeof CHARACTERS];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <LinearGradient
        colors={['#667EEA', '#764BA2']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>{character.emoji}</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userLevel}>{user.current_level.toUpperCase()}</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="star" size={32} color="#FFD700" />
            <Text style={styles.statValue}>{user.total_stars}</Text>
            <Text style={styles.statLabel}>Total Stars</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flame" size={32} color="#FF6B6B" />
            <Text style={styles.statValue}>{user.daily_streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="book" size={32} color="#667EEA" />
            <Text style={styles.statValue}>{progress?.total_words_practiced || 0}</Text>
            <Text style={styles.statLabel}>Words Practiced</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={32} color="#10B981" />
            <Text style={styles.statValue}>{progress?.mastered_words || 0}</Text>
            <Text style={styles.statLabel}>Words Mastered</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Level Progress</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Current Level</Text>
              <Text style={styles.progressValue}>{progress?.level_progress_percent || 0}% Complete</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBarFill,
                  { width: `${progress?.level_progress_percent || 0}%` }
                ]}
              />
            </View>
            {progress?.can_unlock_next_level && (
              <View style={styles.unlockBadge}>
                <Ionicons name="trophy" size={20} color="#FFD700" />
                <Text style={styles.unlockText}>Ready for next level!</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            <View style={[styles.achievementCard, user.total_stars >= 10 && styles.achievementUnlocked]}>
              <Ionicons name="star" size={40} color={user.total_stars >= 10 ? '#FFD700' : '#D1D5DB'} />
              <Text style={styles.achievementTitle}>Star Collector</Text>
              <Text style={styles.achievementDesc}>Earn 10 stars</Text>
            </View>
            <View style={[styles.achievementCard, user.daily_streak >= 3 && styles.achievementUnlocked]}>
              <Ionicons name="flame" size={40} color={user.daily_streak >= 3 ? '#FF6B6B' : '#D1D5DB'} />
              <Text style={styles.achievementTitle}>Streak Master</Text>
              <Text style={styles.achievementDesc}>3 day streak</Text>
            </View>
            <View style={[styles.achievementCard, (progress?.mastered_words || 0) >= 10 && styles.achievementUnlocked]}>
              <Ionicons name="book" size={40} color={(progress?.mastered_words || 0) >= 10 ? '#667EEA' : '#D1D5DB'} />
              <Text style={styles.achievementTitle}>Word Master</Text>
              <Text style={styles.achievementDesc}>Master 10 words</Text>
            </View>
            <View style={[styles.achievementCard, (progress?.level_progress_percent || 0) >= 50 && styles.achievementUnlocked]}>
              <Ionicons name="trophy" size={40} color={(progress?.level_progress_percent || 0) >= 50 ? '#10B981' : '#D1D5DB'} />
              <Text style={styles.achievementTitle}>Half Way There</Text>
              <Text style={styles.achievementDesc}>50% level progress</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  backButton: {
    marginBottom: 24,
  },
  profileSection: {
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarEmoji: {
    fontSize: 56,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  userLevel: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667EEA',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#667EEA',
    borderRadius: 6,
  },
  unlockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
  },
  unlockText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
    opacity: 0.5,
  },
  achievementUnlocked: {
    opacity: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  achievementDesc: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});