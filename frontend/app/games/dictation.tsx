import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { getWords } from '../../utils/api';
import { useAppStore } from '../../store/appStore';

export default function DictationScreen() {
  const router = useRouter();
  const { user } = useAppStore();
  const [words, setWords] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    try {
      const level = user?.current_level || 'lkg-1st';
      const wordsData = await getWords(level);
      const shuffled = wordsData.sort(() => Math.random() - 0.5).slice(0, 10);
      setWords(shuffled);
    } catch (error) {
      console.error('Error loading words:', error);
    } finally {
      setLoading(false);
    }
  };

  const speakWord = async () => {
    if (!words[currentIndex]) return;
    
    setIsPlaying(true);
    const word = words[currentIndex].word_english;
    
    Speech.speak(word, {
      language: 'en-US',
      rate: 0.7,
      pitch: 1.0,
      onDone: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  const checkAnswer = () => {
    if (!words[currentIndex]) return;
    
    const correctWord = words[currentIndex].word_english.toLowerCase().trim();
    const userAnswer = userInput.toLowerCase().trim();
    setAttempts(prev => prev + 1);
    
    if (userAnswer === correctWord) {
      setScore(prev => prev + 10);
      setFeedback('Correct! Well done! 🎉');
      setShowAnswer(false);
      
      setTimeout(() => {
        nextWord();
      }, 1500);
    } else {
      setFeedback('Try again! Listen carefully 👂');
      shakeAnimation();
      
      if (attempts >= 2) {
        setShowAnswer(true);
      }
    }
  };

  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const nextWord = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserInput('');
      setFeedback('');
      setShowAnswer(false);
      setAttempts(0);
    } else {
      Alert.alert(
        'Game Complete! 🏆',
        `You scored ${score} stars out of ${words.length * 10}!`,
        [
          { text: 'Play Again', onPress: () => {
            setCurrentIndex(0);
            setScore(0);
            setUserInput('');
            setFeedback('');
            setShowAnswer(false);
            setAttempts(0);
            loadWords();
          }},
          { text: 'Back to Games', onPress: () => router.back() }
        ]
      );
    }
  };

  const skipWord = () => {
    nextWord();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading dictation game...</Text>
      </View>
    );
  }

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F59E0B', '#D97706']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dictation</Text>
        <View style={styles.scoreContainer}>
          <Ionicons name="star" size={20} color="#FFD700" />
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Progress */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Word {currentIndex + 1} of {words.length}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Listen Button */}
        <View style={styles.listenSection}>
          <Text style={styles.instructionText}>Listen and type the word</Text>
          
          <TouchableOpacity
            style={[styles.listenButton, isPlaying && styles.listenButtonPlaying]}
            onPress={speakWord}
            disabled={isPlaying}
          >
            <Ionicons 
              name={isPlaying ? "volume-high" : "play"} 
              size={48} 
              color="#fff" 
            />
            <Text style={styles.listenButtonText}>
              {isPlaying ? 'Playing...' : 'Tap to Listen'}
            </Text>
          </TouchableOpacity>

          {/* Hint */}
          {currentWord && (
            <Text style={styles.hintText}>
              Hint: {currentWord.meaning}
            </Text>
          )}
        </View>

        {/* Input */}
        <Animated.View style={[styles.inputSection, { transform: [{ translateX: shakeAnim }] }]}>
          <TextInput
            style={styles.input}
            value={userInput}
            onChangeText={setUserInput}
            placeholder="Type the word here"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          {feedback !== '' && (
            <Text style={[
              styles.feedbackText,
              feedback.includes('Correct') ? styles.correctFeedback : styles.wrongFeedback
            ]}>
              {feedback}
            </Text>
          )}

          {showAnswer && (
            <Text style={styles.answerText}>
              Answer: {currentWord?.word_english}
            </Text>
          )}
        </Animated.View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.skipButton} onPress={skipWord}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.checkButton} 
            onPress={checkAnswer}
            disabled={!userInput.trim()}
          >
            <Text style={styles.checkButtonText}>Check</Text>
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
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
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scoreText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  listenSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  instructionText: {
    fontSize: 18,
    color: '#374151',
    marginBottom: 20,
    fontWeight: '500',
  },
  listenButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  listenButtonPlaying: {
    backgroundColor: '#D97706',
  },
  listenButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  hintText: {
    marginTop: 20,
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 20,
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  feedbackText: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
  correctFeedback: {
    color: '#10B981',
  },
  wrongFeedback: {
    color: '#EF4444',
  },
  answerText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  checkButton: {
    flex: 2,
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  checkButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
