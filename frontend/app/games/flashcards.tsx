import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';
import { getWords } from '../../utils/api';
import { useAppStore } from '../../store/appStore';
import api from '../../utils/api';

const { width } = Dimensions.get('window');

export default function FlashcardsScreen() {
  const router = useRouter();
  const { user } = useAppStore();
  const [words, setWords] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    // Setup audio mode
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
    
    loadWords();
    
    // Cleanup on unmount
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const loadWords = async () => {
    try {
      const level = user?.current_level || 'lkg-1st';
      const wordsData = await getWords(level);
      // Shuffle and take 10 words
      const shuffled = wordsData.sort(() => Math.random() - 0.5);
      setWords(shuffled.slice(0, 10));
    } catch (error) {
      console.error('Error loading words:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(currentIndex - 1), 300);
    }
  };

  // Speak word using OpenAI TTS for high-quality pronunciation
  const speakWord = async () => {
    if (!words[currentIndex] || isSpeaking) return;
    
    const word = words[currentIndex].word_english;
    setIsSpeaking(true);
    
    try {
      // Stop any currently playing audio
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      }
      
      // Get audio from TTS API
      const response = await api.post('/tts/speak-base64', {
        text: word,
        voice: 'nova',
        speed: 0.9  // Slightly slower for kids to hear clearly
      });
      
      const audioBase64 = response.data.audio_base64;
      
      // Create and play sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mp3;base64,${audioBase64}` },
        { shouldPlay: true }
      );
      
      soundRef.current = sound;
      
      // Handle playback finish
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsSpeaking(false);
        }
      });
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667EEA" />
      </View>
    );
  }

  if (words.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No words available</Text>
      </View>
    );
  }

  const currentWord = words[currentIndex];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B9D', '#FF8E53']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Flashcards</Text>
        <Text style={styles.progress}>{currentIndex + 1} / {words.length}</Text>
      </LinearGradient>

      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.cardContainer} 
          onPress={handleFlip}
          activeOpacity={0.9}
        >
          <Animatable.View
            animation={isFlipped ? 'flipInY' : 'flipInX'}
            duration={600}
            style={[
              styles.card,
              isFlipped && styles.cardFlipped,
            ]}
          >
            {!isFlipped ? (
              <View style={styles.cardFront}>
                <Text style={styles.cardWord}>{currentWord.word_english}</Text>
                <Text style={styles.cardTelugu}>{currentWord.word_telugu}</Text>
                <TouchableOpacity 
                  style={[styles.speakButton, isSpeaking && styles.speakButtonActive]} 
                  onPress={speakWord}
                  disabled={isSpeaking}
                  data-testid="speak-word-button"
                >
                  {isSpeaking ? (
                    <ActivityIndicator size="small" color="#FF6B9D" />
                  ) : (
                    <Ionicons name="volume-high" size={32} color="#FF6B9D" />
                  )}
                </TouchableOpacity>
                <Text style={styles.tapHint}>Tap to see meaning</Text>
              </View>
            ) : (
              <View style={styles.cardBack}>
                <Text style={styles.meaningLabel}>Meaning:</Text>
                <Text style={styles.meaning}>{currentWord.meaning}</Text>
                <Text style={styles.exampleLabel}>Example:</Text>
                <Text style={styles.example}>"{currentWord.example_sentence}"</Text>
                <Text style={styles.tapHint}>Tap to see word again</Text>
              </View>
            )}
          </Animatable.View>
        </TouchableOpacity>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, currentIndex === 0 && styles.controlButtonDisabled]}
            onPress={handlePrevious}
            disabled={currentIndex === 0}
          >
            <Ionicons name="chevron-back" size={32} color={currentIndex === 0 ? '#D1D5DB' : '#667EEA'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shuffleButton}
            onPress={() => {
              setIsFlipped(false);
              setCurrentIndex(Math.floor(Math.random() * words.length));
            }}
          >
            <Ionicons name="shuffle" size={24} color="#667EEA" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, currentIndex === words.length - 1 && styles.controlButtonDisabled]}
            onPress={handleNext}
            disabled={currentIndex === words.length - 1}
          >
            <Ionicons name="chevron-forward" size={32} color={currentIndex === words.length - 1 ? '#D1D5DB' : '#667EEA'} />
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
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  progress: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: width - 40,
    height: 400,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  cardFlipped: {
    backgroundColor: '#EEF2FF',
  },
  cardFront: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  cardWord: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  cardTelugu: {
    fontSize: 36,
    color: '#FF6B9D',
    fontWeight: '600',
    textAlign: 'center',
  },
  speakButton: {
    marginTop: 16,
    padding: 12,
  },
  speakButtonActive: {
    opacity: 0.7,
  },
  cardBack: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  meaningLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667EEA',
  },
  meaning: {
    fontSize: 20,
    color: '#1F2937',
    lineHeight: 28,
  },
  exampleLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667EEA',
    marginTop: 16,
  },
  example: {
    fontSize: 18,
    color: '#6B7280',
    fontStyle: 'italic',
    lineHeight: 26,
  },
  tapHint: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 'auto',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlButtonDisabled: {
    opacity: 0.3,
  },
  shuffleButton: {
    width: 56,
    height: 56,
    backgroundColor: '#EEF2FF',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});