import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { getWord, analyzePronunciation } from '../../utils/api';
import { useAppStore } from '../../store/appStore';
import * as Animatable from 'react-native-animatable';

interface WordData {
  word_id: string;
  word_english: string;
  word_telugu: string;
  meaning: string;
  example_sentence: string;
  synonyms: string[];
  antonyms: string[];
  part_of_speech: string;
}

export default function PracticeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAppStore();
  const [word, setWord] = useState<WordData | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWord();
    setupAudio();
  }, []);

  const setupAudio = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.error('Error setting up audio:', error);
    }
  };

  const loadWord = async () => {
    try {
      const wordId = params.wordId as string;
      const wordData = await getWord(wordId);
      setWord(wordData);
    } catch (error) {
      console.error('Error loading word:', error);
      Alert.alert('Error', 'Failed to load word');
    } finally {
      setLoading(false);
    }
  };

  const speakWord = () => {
    if (word) {
      Speech.speak(word.word_english, {
        language: 'en-IN',
        pitch: 1.0,
        rate: 0.8,
      });
    }
  };

  const startRecording = async () => {
    try {
      setResult(null);
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;
      
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri && word && user) {
        setAnalyzing(true);
        try {
          const analysisResult = await analyzePronunciation(
            uri,
            word.word_english,
            user.user_id
          );
          setResult(analysisResult);
        } catch (error) {
          console.error('Error analyzing:', error);
          Alert.alert('Error', 'Failed to analyze pronunciation');
        } finally {
          setAnalyzing(false);
        }
      }
      
      setRecording(null);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  if (loading || !word) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667EEA" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667EEA', '#764BA2']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pronunciation Practice</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.wordCard}>
          <Text style={styles.wordEnglish}>{word.word_english}</Text>
          <Text style={styles.wordTelugu}>{word.word_telugu}</Text>
          
          <TouchableOpacity style={styles.speakButton} onPress={speakWord}>
            <Ionicons name="volume-high" size={28} color="#667EEA" />
            <Text style={styles.speakButtonText}>Listen</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.detailLabel}>Meaning:</Text>
          <Text style={styles.detailText}>{word.meaning}</Text>
          
          <Text style={styles.detailLabel}>Example:</Text>
          <Text style={styles.detailText}>"{word.example_sentence}"</Text>
          
          {word.synonyms && word.synonyms.length > 0 && (
            <>
              <Text style={styles.detailLabel}>Synonyms:</Text>
              <Text style={styles.detailText}>{word.synonyms.join(', ')}</Text>
            </>
          )}
          
          {word.antonyms && word.antonyms.length > 0 && (
            <>
              <Text style={styles.detailLabel}>Antonyms:</Text>
              <Text style={styles.detailText}>{word.antonyms.join(', ')}</Text>
            </>
          )}
        </View>

        <View style={styles.recordSection}>
          <Text style={styles.recordTitle}>Now you try!</Text>
          
          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.recordButtonActive,
            ]}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={analyzing}
          >
            <LinearGradient
              colors={isRecording ? ['#EF4444', '#DC2626'] : ['#667EEA', '#4F46E5']}
              style={styles.recordButtonGradient}
            >
              <Ionicons 
                name={isRecording ? 'stop-circle' : 'mic'} 
                size={48} 
                color="#fff" 
              />
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.recordHint}>
            {isRecording ? 'Tap to stop recording' : 'Tap and say the word'}
          </Text>
        </View>

        {analyzing && (
          <View style={styles.analyzingContainer}>
            <ActivityIndicator size="large" color="#667EEA" />
            <Text style={styles.analyzingText}>Analyzing your pronunciation...</Text>
          </View>
        )}

        {result && (
          <Animatable.View animation="bounceIn" style={styles.resultCard}>
            <View style={[
              styles.resultHeader,
              { backgroundColor: result.is_correct ? '#10B981' : '#F59E0B' }
            ]}>
              <Ionicons 
                name={result.is_correct ? 'checkmark-circle' : 'alert-circle'} 
                size={48} 
                color="#fff" 
              />
              <Text style={styles.resultScore}>{Math.round(result.score)}%</Text>
            </View>
            <Text style={styles.resultFeedback}>{result.feedback}</Text>
            {!result.is_correct && (
              <Text style={styles.resultHeard}>You said: "{result.transcribed_text}"</Text>
            )}
          </Animatable.View>
        )}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 20,
    gap: 20,
  },
  wordCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  wordEnglish: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  wordTelugu: {
    fontSize: 28,
    color: '#667EEA',
    fontWeight: '600',
  },
  speakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    gap: 8,
    marginTop: 12,
  },
  speakButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#667EEA',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  detailText: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  recordSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 20,
  },
  recordTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  recordButton: {
    borderRadius: 80,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordButtonActive: {
    transform: [{ scale: 1.1 }],
  },
  recordButtonGradient: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordHint: {
    fontSize: 16,
    color: '#6B7280',
  },
  analyzingContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  analyzingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  resultHeader: {
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  resultScore: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  resultFeedback: {
    fontSize: 18,
    color: '#1F2937',
    textAlign: 'center',
    padding: 20,
    lineHeight: 26,
  },
  resultHeard: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingBottom: 20,
    fontStyle: 'italic',
  },
});