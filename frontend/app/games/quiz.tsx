import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { getWords } from '../../utils/api';
import { useAppStore } from '../../store/appStore';

interface QuizQuestion {
  word: any;
  correctAnswer: string;
  options: string[];
}

export default function QuizScreen() {
  const router = useRouter();
  const { user } = useAppStore();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuiz();
  }, []);

  const loadQuiz = async () => {
    try {
      const level = user?.current_level || 'lkg-1st';
      const wordsData = await getWords(level);
      
      if (!wordsData || wordsData.length < 5) {
        setError('Not enough words available for quiz');
        setLoading(false);
        return;
      }
      
      // Create 5 random quiz questions
      const shuffled = [...wordsData].sort(() => 0.5 - Math.random());
      const quizWords = shuffled.slice(0, 5);
      
      const quizQuestions: QuizQuestion[] = quizWords.map(word => {
        const otherWords = wordsData.filter(w => w.word_id !== word.word_id);
        const wrongAnswers = otherWords
          .sort(() => 0.5 - Math.random())
          .slice(0, 3)
          .map(w => w.meaning);
        
        const options = [word.meaning, ...wrongAnswers].sort(() => 0.5 - Math.random());
        
        return {
          word,
          correctAnswer: word.meaning,
          options,
        };
      });
      
      setQuestions(quizQuestions);
    } catch (error) {
      console.error('Error loading quiz:', error);
      setError('Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  // Show error state
  if (error) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Word Quiz</Text>
          <View style={{ width: 28 }} />
        </LinearGradient>
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadQuiz}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return; // Already answered
    
    setSelectedAnswer(answer);
    
    if (answer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }
    
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    loadQuiz();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading quiz...</Text>
      </View>
    );
  }

  if (showResult) {
    const percentage = (score / questions.length) * 100;
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#667EEA', '#764BA2']}
          style={styles.resultContainer}
        >
          <Animatable.View animation="bounceIn" style={styles.resultContent}>
            <Text style={styles.resultEmoji}>
              {percentage >= 80 ? '🎉' : percentage >= 60 ? '😊' : '💪'}
            </Text>
            <Text style={styles.resultTitle}>
              {percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good Job!' : 'Keep Practicing!'}
            </Text>
            <Text style={styles.resultScore}>{score} / {questions.length}</Text>
            <Text style={styles.resultPercentage}>{Math.round(percentage)}% Correct</Text>
            
            <TouchableOpacity style={styles.retryButton} onPress={resetQuiz}>
              <Ionicons name="refresh" size={24} color="#667EEA" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.homeButton} 
              onPress={() => router.back()}
            >
              <Text style={styles.homeButtonText}>Back to Games</Text>
            </TouchableOpacity>
          </Animatable.View>
        </LinearGradient>
      </View>
    );
  }

  const question = questions[currentQuestion];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667EEA', '#764BA2']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Word Quiz</Text>
          <Text style={styles.progress}>Question {currentQuestion + 1} / {questions.length}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Ionicons name="star" size={20} color="#FFD700" />
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <Animatable.View animation="fadeIn" key={currentQuestion} style={styles.questionCard}>
          <Text style={styles.questionLabel}>What does this word mean?</Text>
          <View style={styles.wordContainer}>
            <Text style={styles.questionWord}>{question.word.word_english}</Text>
            <Text style={styles.questionTelugu}>{question.word.word_telugu}</Text>
          </View>
        </Animatable.View>

        <View style={styles.optionsContainer}>
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === option;
            const isCorrect = option === question.correctAnswer;
            const showCorrect = selectedAnswer && isCorrect;
            const showWrong = isSelected && !isCorrect;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  showCorrect && styles.optionCorrect,
                  showWrong && styles.optionWrong,
                ]}
                onPress={() => handleAnswer(option)}
                disabled={selectedAnswer !== null}
                activeOpacity={0.7}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionNumber}>
                    <Text style={styles.optionNumberText}>{String.fromCharCode(65 + index)}</Text>
                  </View>
                  <Text style={[
                    styles.optionText,
                    (showCorrect || showWrong) && styles.optionTextSelected,
                  ]}>
                    {option}
                  </Text>
                  {showCorrect && <Ionicons name="checkmark-circle" size={28} color="#10B981" />}
                  {showWrong && <Ionicons name="close-circle" size={28} color="#EF4444" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  progress: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 20,
    gap: 24,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  questionLabel: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
  },
  wordContainer: {
    alignItems: 'center',
    gap: 8,
  },
  questionWord: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  questionTelugu: {
    fontSize: 28,
    color: '#667EEA',
    fontWeight: '600',
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#D1FAE5',
  },
  optionWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionNumber: {
    width: 32,
    height: 32,
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667EEA',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 22,
  },
  optionTextSelected: {
    fontWeight: '600',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    gap: 16,
    width: '100%',
  },
  resultEmoji: {
    fontSize: 80,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  resultScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#667EEA',
  },
  resultPercentage: {
    fontSize: 20,
    color: '#6B7280',
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667EEA',
  },
  homeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  homeButtonText: {
    fontSize: 16,
    color: '#6B7280',
  },
});