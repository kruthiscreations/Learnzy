import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, ActivityIndicator, Alert, Animated
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';
import { useAppStore } from '../../../store/appStore';
import { getPhonicsLevel, getPhonicsQuiz, PhonicsLevel } from '../../../constants/PhonicsData';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function PhonicsQuizScreen() {
  const router = useRouter();
  const { levelId } = useLocalSearchParams();
  const { user } = useAppStore();
  const [level, setLevel] = useState<PhonicsLevel | null>(null);
  const [quiz, setQuiz] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadQuiz();
  }, [levelId]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentQuestion / 10) * 100,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentQuestion]);

  const loadQuiz = async () => {
    try {
      const id = parseInt(levelId as string);
      const levelData = getPhonicsLevel(id);
      const quizData = getPhonicsQuiz(id);
      setLevel(levelData || null);
      setQuiz(quizData);
    } catch (error) {
      console.error('Error loading quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);
    
    const isCorrect = answerIndex === quiz.questions[currentQuestion].correct;
    if (isCorrect) {
      setScore(prev => prev + 10);
    }
    
    setTimeout(() => {
      setShowFeedback(false);
      setSelectedAnswer(null);
      
      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        completeQuiz();
      }
    }, 1500);
  };

  const completeQuiz = async () => {
    setIsComplete(true);
    
    const percentage = (score / (quiz.questions.length * 10)) * 100;
    
    try {
      const saved = await AsyncStorage.getItem(`phonics_progress_${user?.user_id}`);
      if (saved) {
        const progress = JSON.parse(saved);
        const id = parseInt(levelId as string);
        
        // Update level progress
        progress.levelProgress[id] = Math.max(progress.levelProgress[id] || 0, percentage);
        
        // Award badge if 100%
        if (percentage >= 100 && !progress.earnedBadges.includes('perfect_score')) {
          progress.earnedBadges.push('perfect_score');
        }
        
        // Award level badge if mastery achieved
        if (percentage >= 80) {
          const badgeId = ['abc_explorer', 'sound_seeker', 'blend_master', 'vowel_victor', 'word_wizard'][id];
          if (badgeId && !progress.earnedBadges.includes(badgeId)) {
            progress.earnedBadges.push(badgeId);
          }
          
          // Unlock next level
          if (id < 4) {
            progress.currentLevel = Math.max(progress.currentLevel, id + 1);
          }
        }
        
        progress.totalStars += Math.round(score / 10);
        await AsyncStorage.setItem(`phonics_progress_${user?.user_id}`, JSON.stringify(progress));
      }
    } catch (error) {
      console.error('Error saving quiz progress:', error);
    }
  };

  if (loading || !level || !quiz) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667EEA" />
      </View>
    );
  }

  if (isComplete) {
    const percentage = Math.round((score / (quiz.questions.length * 10)) * 100);
    const passed = percentage >= 80;
    
    return (
      <View style={styles.container}>
        <LinearGradient 
          colors={passed ? ['#10B981', '#059669'] : ['#EF4444', '#DC2626']} 
          style={styles.resultContainer}
        >
          <Animatable.View animation="bounceIn" style={styles.resultContent}>
            <Text style={styles.resultEmoji}>{passed ? '🎉' : '💪'}</Text>
            <Text style={styles.resultTitle}>
              {passed ? 'Level Complete!' : 'Keep Practicing!'}
            </Text>
            <Text style={styles.resultScore}>{percentage}%</Text>
            <Text style={styles.resultSubtitle}>
              {score}/{quiz.questions.length * 10} points
            </Text>
            
            {passed ? (
              <View style={styles.resultBadge}>
                <Text style={styles.resultBadgeIcon}>{level.badge.icon}</Text>
                <Text style={styles.resultBadgeText}>You earned: {level.badge.name}</Text>
              </View>
            ) : (
              <Text style={styles.resultHint}>
                Need 80% to unlock Level {parseInt(levelId as string) + 1}
              </Text>
            )}
            
            <View style={styles.resultButtons}>
              {!passed && (
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => {
                    setCurrentQuestion(0);
                    setScore(0);
                    setIsComplete(false);
                  }}
                >
                  <Ionicons name="refresh" size={20} color="#fff" />
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={styles.continueButton}
                onPress={() => router.replace('/phonics')}
              >
                <Text style={styles.continueButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color={passed ? '#10B981' : '#EF4444'} />
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </LinearGradient>
      </View>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[level.color, adjustColor(level.color, -30)]} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.quizTitle}>Level {levelId} Quiz</Text>
          <View style={styles.progressBar}>
            <Animated.View 
              style={[
                styles.progressFill, 
                { width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%']
                })}
              ]} 
            />
          </View>
          <Text style={styles.questionCount}>
            Question {currentQuestion + 1} of {quiz.questions.length}
          </Text>
        </View>

        <View style={styles.scoreContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </LinearGradient>

      {/* Question */}
      <View style={styles.content}>
        <Animatable.View 
          animation="fadeIn" 
          key={currentQuestion}
          style={styles.questionCard}
        >
          <Text style={styles.questionNumber}>Q{currentQuestion + 1}</Text>
          <Text style={styles.questionText}>{question.q}</Text>
        </Animatable.View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {question.options.map((option: string, index: number) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === question.correct;
            const showResult = showFeedback && (isSelected || isCorrect);
            
            return (
              <Animatable.View
                key={index}
                animation="fadeInUp"
                delay={index * 100}
              >
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    isSelected && styles.optionSelected,
                    showResult && isCorrect && styles.optionCorrect,
                    showResult && isSelected && !isCorrect && styles.optionWrong,
                  ]}
                  onPress={() => handleAnswer(index)}
                  disabled={selectedAnswer !== null}
                >
                  <View style={[
                    styles.optionLetter,
                    isSelected && styles.optionLetterSelected,
                    showResult && isCorrect && styles.optionLetterCorrect,
                    showResult && isSelected && !isCorrect && styles.optionLetterWrong,
                  ]}>
                    <Text style={[
                      styles.optionLetterText,
                      (isSelected || (showResult && isCorrect)) && styles.optionLetterTextSelected
                    ]}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={[
                    styles.optionText,
                    (showResult && isCorrect) && styles.optionTextCorrect,
                    (showResult && isSelected && !isCorrect) && styles.optionTextWrong,
                  ]}>
                    {option}
                  </Text>
                  
                  {showResult && isCorrect && (
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                  )}
                </TouchableOpacity>
              </Animatable.View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20 },
  backButton: { position: 'absolute', top: 50, left: 16, zIndex: 10, padding: 8 },
  headerCenter: { alignItems: 'center', marginTop: 10 },
  quizTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  progressBar: { width: width * 0.6, height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, marginTop: 12, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 4 },
  questionCount: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 6 },
  scoreContainer: { position: 'absolute', top: 54, right: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  scoreText: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginLeft: 6 },
  
  content: { flex: 1, padding: 20 },
  
  questionCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24, marginBottom: 24, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  questionNumber: { fontSize: 12, fontWeight: 'bold', color: '#667EEA', marginBottom: 8 },
  questionText: { fontSize: 20, fontWeight: '600', color: '#1F2937', lineHeight: 28 },
  
  optionsContainer: { flex: 1 },
  optionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 2, borderColor: '#E5E7EB' },
  optionSelected: { borderColor: '#667EEA', backgroundColor: '#EEF2FF' },
  optionCorrect: { borderColor: '#10B981', backgroundColor: '#D1FAE5' },
  optionWrong: { borderColor: '#EF4444', backgroundColor: '#FEE2E2' },
  
  optionLetter: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  optionLetterSelected: { backgroundColor: '#667EEA' },
  optionLetterCorrect: { backgroundColor: '#10B981' },
  optionLetterWrong: { backgroundColor: '#EF4444' },
  optionLetterText: { fontSize: 16, fontWeight: 'bold', color: '#6B7280' },
  optionLetterTextSelected: { color: '#fff' },
  
  optionText: { flex: 1, fontSize: 16, color: '#1F2937' },
  optionTextCorrect: { color: '#065F46', fontWeight: '600' },
  optionTextWrong: { color: '#991B1B' },
  
  // Result styles
  resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  resultContent: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 30, padding: 40, width: '100%' },
  resultEmoji: { fontSize: 80, marginBottom: 16 },
  resultTitle: { fontSize: 28, fontWeight: 'bold', color: '#1F2937' },
  resultScore: { fontSize: 64, fontWeight: 'bold', color: '#667EEA', marginVertical: 16 },
  resultSubtitle: { fontSize: 18, color: '#6B7280' },
  resultBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, marginTop: 24 },
  resultBadgeIcon: { fontSize: 28, marginRight: 10 },
  resultBadgeText: { fontSize: 14, fontWeight: '600', color: '#92400E' },
  resultHint: { fontSize: 14, color: '#6B7280', marginTop: 16, textAlign: 'center' },
  resultButtons: { flexDirection: 'row', marginTop: 32 },
  retryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 30, marginRight: 12 },
  retryButtonText: { fontSize: 16, fontWeight: '600', color: '#fff', marginLeft: 8 },
  continueButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 30 },
  continueButtonText: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginRight: 8 },
});
