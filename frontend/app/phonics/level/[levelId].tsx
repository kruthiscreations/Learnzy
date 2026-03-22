import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Dimensions, ActivityIndicator, Alert
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useAppStore } from '../../../store/appStore';
import { getPhonicsLevel, getPhonicsQuiz, PhonicsLesson, PhonicsLevel } from '../../../constants/PhonicsData';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function PhonicsLevelScreen() {
  const router = useRouter();
  const { levelId } = useLocalSearchParams();
  const { user } = useAppStore();
  const [level, setLevel] = useState<PhonicsLevel | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLevel();
  }, [levelId]);

  const loadLevel = async () => {
    try {
      const id = parseInt(levelId as string);
      const levelData = getPhonicsLevel(id);
      setLevel(levelData || null);

      // Load progress
      const saved = await AsyncStorage.getItem(`phonics_progress_${user?.user_id}`);
      if (saved) {
        const progress = JSON.parse(saved);
        setCompletedLessons(progress.completedLessons || []);
      }
    } catch (error) {
      console.error('Error loading level:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonPress = (lesson: PhonicsLesson) => {
    router.push(`/phonics/lesson/${lesson.id}`);
  };

  const handleQuizPress = () => {
    router.push(`/phonics/quiz/${levelId}`);
  };

  if (loading || !level) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667EEA" />
      </View>
    );
  }

  const completedCount = level.lessons.filter(l => completedLessons.includes(l.id)).length;
  const progress = Math.round((completedCount / level.lessons.length) * 100);

  return (
    <View style={styles.container}>
      <LinearGradient colors={[level.color, adjustColor(level.color, -30)]} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Animatable.View animation="fadeInDown" style={styles.headerContent}>
          <Text style={styles.levelEmoji}>{level.icon}</Text>
          <Text style={styles.headerTitle}>Level {level.id}</Text>
          <Text style={styles.headerSubtitle}>{level.name}</Text>
          <Text style={styles.ageRange}>{level.ageRange}</Text>
        </Animatable.View>

        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <Animatable.View 
              animation="slideInLeft"
              style={[styles.progressFill, { width: `${progress}%` }]} 
            />
          </View>
          <Text style={styles.progressText}>{progress}% Complete</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>📖 Lessons ({completedCount}/{level.lessons.length})</Text>
        
        {level.lessons.map((lesson, index) => {
          const isCompleted = completedLessons.includes(lesson.id);
          const isLocked = index > 0 && !completedLessons.includes(level.lessons[index - 1].id);
          
          return (
            <Animatable.View 
              key={lesson.id} 
              animation="fadeInUp" 
              delay={100 + index * 80}
            >
              <TouchableOpacity
                style={[
                  styles.lessonCard,
                  isCompleted && styles.lessonCompleted,
                  isLocked && styles.lessonLocked
                ]}
                onPress={() => !isLocked && handleLessonPress(lesson)}
                disabled={isLocked}
                data-testid={`phonics-lesson-${lesson.id}`}
              >
                <View style={[
                  styles.lessonNumber,
                  isCompleted && styles.lessonNumberCompleted,
                  isLocked && styles.lessonNumberLocked
                ]}>
                  {isCompleted ? (
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  ) : isLocked ? (
                    <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
                  ) : (
                    <Text style={styles.lessonNumberText}>{index + 1}</Text>
                  )}
                </View>
                
                <View style={styles.lessonInfo}>
                  <Text style={[styles.lessonTitle, isLocked && styles.textLocked]}>
                    {lesson.title}
                  </Text>
                  <Text style={[styles.lessonDesc, isLocked && styles.textLocked]} numberOfLines={1}>
                    {lesson.description}
                  </Text>
                  <View style={styles.lessonMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={14} color={isLocked ? '#9CA3AF' : '#6B7280'} />
                      <Text style={[styles.metaText, isLocked && styles.textLocked]}>{lesson.duration} min</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="game-controller-outline" size={14} color={isLocked ? '#9CA3AF' : '#6B7280'} />
                      <Text style={[styles.metaText, isLocked && styles.textLocked]}>{lesson.activities.length} activities</Text>
                    </View>
                  </View>
                </View>

                <Ionicons 
                  name={isCompleted ? "checkmark-circle" : isLocked ? "lock-closed" : "chevron-forward"} 
                  size={24} 
                  color={isCompleted ? "#10B981" : isLocked ? "#9CA3AF" : level.color} 
                />
              </TouchableOpacity>
            </Animatable.View>
          );
        })}

        {/* Quiz Section */}
        <Text style={styles.sectionTitle}>🎯 Level Quiz</Text>
        <Animatable.View animation="fadeInUp" delay={500}>
          <TouchableOpacity
            style={styles.quizCard}
            onPress={handleQuizPress}
            data-testid="phonics-level-quiz"
          >
            <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.quizGradient}>
              <View style={styles.quizIcon}>
                <Ionicons name="school" size={32} color="#fff" />
              </View>
              <View style={styles.quizContent}>
                <Text style={styles.quizTitle}>Take Level {level.id} Quiz</Text>
                <Text style={styles.quizSubtitle}>10 questions + voice check • 80% to unlock next level</Text>
              </View>
              <Ionicons name="arrow-forward-circle" size={28} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>

        {/* Badge Preview */}
        <View style={styles.badgePreview}>
          <Text style={styles.badgePreviewTitle}>🏆 Complete this level to earn:</Text>
          <View style={styles.badgeCard}>
            <Text style={styles.badgeIcon}>{level.badge.icon}</Text>
            <Text style={styles.badgeName}>{level.badge.name}</Text>
            <Text style={styles.badgeDesc}>{level.badge.description}</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  
  header: { paddingTop: 50, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  backButton: { position: 'absolute', top: 50, left: 16, zIndex: 10, padding: 8 },
  headerContent: { alignItems: 'center', marginTop: 10 },
  levelEmoji: { fontSize: 48 },
  headerTitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginTop: 8 },
  headerSubtitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  ageRange: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  
  progressSection: { marginTop: 20 },
  progressBar: { height: 10, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 5 },
  progressText: { fontSize: 14, color: '#fff', textAlign: 'center', marginTop: 8, fontWeight: '600' },
  
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginTop: 8, marginBottom: 12 },
  
  lessonCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4 },
  lessonCompleted: { borderWidth: 2, borderColor: '#10B981', backgroundColor: '#F0FDF4' },
  lessonLocked: { backgroundColor: '#F3F4F6', opacity: 0.7 },
  
  lessonNumber: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#667EEA', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  lessonNumberCompleted: { backgroundColor: '#10B981' },
  lessonNumberLocked: { backgroundColor: '#E5E7EB' },
  lessonNumberText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  lessonDesc: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  textLocked: { color: '#9CA3AF' },
  
  lessonMeta: { flexDirection: 'row', marginTop: 6 },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  metaText: { fontSize: 12, color: '#6B7280', marginLeft: 4 },
  
  quizCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 20, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8 },
  quizGradient: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  quizIcon: { marginRight: 16 },
  quizContent: { flex: 1 },
  quizTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  quizSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  
  badgePreview: { backgroundColor: '#FEF3C7', borderRadius: 16, padding: 16, marginTop: 8 },
  badgePreviewTitle: { fontSize: 14, fontWeight: '600', color: '#92400E', marginBottom: 12 },
  badgeCard: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  badgeIcon: { fontSize: 40 },
  badgeName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginTop: 8 },
  badgeDesc: { fontSize: 12, color: '#6B7280', marginTop: 4, textAlign: 'center' },
});
