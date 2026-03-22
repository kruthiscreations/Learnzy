import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';
import { getWords } from '../../utils/api';
import { useAppStore } from '../../store/appStore';
import api from '../../utils/api';

interface SentenceQuestion {
  sentence: string;
  words: string[];
  scrambled: string[];
  translation: string;
}

export default function SentenceBuilderScreen() {
  const router = useRouter();
  const { user } = useAppStore();
  const [questions, setQuestions] = useState<SentenceQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<{ word: string; id: string; used: boolean }[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
    loadGame();
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  const loadGame = async () => {
    setLoading(true);
    try {
      const level = user?.current_level || 'lkg-1st';
      const wordsData = await getWords(level);
      const shuffled = wordsData.sort(() => Math.random() - 0.5).slice(0, 8);

      const qs: SentenceQuestion[] = shuffled
        .filter((w: any) => w.example_sentence && w.example_sentence.split(' ').length >= 3)
        .slice(0, 6)
        .map((w: any) => {
          const sentence = w.example_sentence;
          const words = sentence.replace(/[.!?]/g, '').split(' ');
          const scrambled = [...words].sort(() => Math.random() - 0.5);
          return {
            sentence,
            words,
            scrambled,
            translation: w.word_telugu || '',
          };
        });

      setQuestions(qs);
      setCurrentIndex(0);
      setScore(0);
      setGameComplete(false);
      if (qs.length > 0) initQuestion(qs[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const initQuestion = (q: SentenceQuestion) => {
    setSelectedWords([]);
    setFeedback(null);
    setAvailableWords(
      q.scrambled.map((word, i) => ({ word, id: `${word}-${i}`, used: false }))
    );
  };

  const addWord = (item: { word: string; id: string; used: boolean }) => {
    if (item.used || feedback) return;
    setAvailableWords(prev => prev.map(w => w.id === item.id ? { ...w, used: true } : w));
    setSelectedWords(prev => [...prev, item.id]);
  };

  const removeWord = (id: string) => {
    if (feedback) return;
    setAvailableWords(prev => prev.map(w => w.id === id ? { ...w, used: false } : w));
    setSelectedWords(prev => prev.filter(wid => wid !== id));
  };

  const checkAnswer = () => {
    if (feedback) return;
    const q = questions[currentIndex];
    const builtSentence = selectedWords
      .map(id => availableWords.find(w => w.id === id)?.word || '')
      .join(' ');
    const correctSentence = q.words.join(' ');
    const isCorrect = builtSentence.toLowerCase() === correctSentence.toLowerCase();
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setScore(s => s + 10);
      speakSentence(q.sentence);
    }
  };

  const speakSentence = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      }
      const response = await api.post('/tts/speak-base64', { text, voice: 'nova', speed: 0.9 });
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mp3;base64,${response.data.audio_base64}` },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate(s => { if (s.isLoaded && s.didJustFinish) setIsSpeaking(false); });
    } catch {
      setIsSpeaking(false);
    }
  };

  const nextQuestion = () => {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= questions.length) {
      setGameComplete(true);
    } else {
      setCurrentIndex(nextIdx);
      initQuestion(questions[nextIdx]);
    }
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#10B981" /></View>;
  }

  if (gameComplete) {
    return (
      <LinearGradient colors={['#10B981', '#059669']} style={styles.completeContainer}>
        <Animatable.View animation="bounceIn" style={styles.completeCard}>
          <Text style={styles.completeEmoji}>🏆</Text>
          <Text style={styles.completeTitle}>Well Done!</Text>
          <Text style={styles.completeScore}>Score: {score}/{questions.length * 10} ⭐</Text>
          <TouchableOpacity style={styles.playAgainButton} onPress={loadGame}>
            <Text style={styles.playAgainText}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeButton} onPress={() => router.back()}>
            <Text style={styles.homeButtonText}>Back to Games</Text>
          </TouchableOpacity>
        </Animatable.View>
      </LinearGradient>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text>No sentences available for this level.</Text>
      </View>
    );
  }

  const q = questions[currentIndex];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sentence Builder</Text>
        <Text style={styles.headerSubtitle}>Arrange words to make a sentence!</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBadge}><Text style={styles.statText}>⭐ {score}</Text></View>
          <View style={styles.statBadge}><Text style={styles.statText}>{currentIndex + 1}/{questions.length}</Text></View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Answer area */}
        <View style={styles.answerSection}>
          <Text style={styles.sectionLabel}>Your sentence:</Text>
          <View style={styles.answerBox}>
            {selectedWords.length === 0 ? (
              <Text style={styles.placeholder}>Tap words below to build the sentence</Text>
            ) : (
              <View style={styles.wordRow}>
                {selectedWords.map(id => {
                  const wordItem = availableWords.find(w => w.id === id);
                  return (
                    <TouchableOpacity key={id} onPress={() => removeWord(id)} style={styles.selectedWordChip}>
                      <Text style={styles.selectedWordText}>{wordItem?.word}</Text>
                      <Ionicons name="close-circle" size={16} color="#fff" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {feedback && (
            <Animatable.View animation="bounceIn" style={[styles.feedbackBanner, feedback === 'correct' ? styles.feedbackCorrect : styles.feedbackWrong]}>
              {feedback === 'correct' ? (
                <Text style={styles.feedbackText}>✅ Correct! Great sentence!</Text>
              ) : (
                <View>
                  <Text style={styles.feedbackText}>❌ Not quite! Correct order:</Text>
                  <Text style={styles.feedbackCorrectSentence}>"{q.sentence}"</Text>
                </View>
              )}
            </Animatable.View>
          )}
        </View>

        {/* Word bank */}
        <View style={styles.wordBankSection}>
          <Text style={styles.sectionLabel}>Word bank:</Text>
          <View style={styles.wordBank}>
            {availableWords.map(item => (
              <TouchableOpacity
                key={item.id}
                onPress={() => addWord(item)}
                disabled={item.used || !!feedback}
                style={[styles.wordChip, item.used && styles.wordChipUsed]}
              >
                <Text style={[styles.wordChipText, item.used && styles.wordChipTextUsed]}>
                  {item.word}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {!feedback ? (
            <TouchableOpacity
              style={[styles.checkButton, selectedWords.length === 0 && styles.checkButtonDisabled]}
              onPress={checkAnswer}
              disabled={selectedWords.length === 0}
            >
              <Text style={styles.checkButtonText}>Check Answer ✓</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.nextButton} onPress={nextQuestion}>
              <Text style={styles.nextButtonText}>
                {currentIndex + 1 >= questions.length ? 'See Results 🏆' : 'Next Sentence →'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              if (!feedback) {
                setSelectedWords([]);
                setAvailableWords(prev => prev.map(w => ({ ...w, used: false })));
              }
            }}
            disabled={!!feedback}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  backButton: { marginBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  headerSubtitle: { fontSize: 15, color: '#fff', opacity: 0.9, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  statText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  content: { padding: 20, gap: 20 },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: '#374151', marginBottom: 8 },
  answerSection: { gap: 8 },
  answerBox: {
    minHeight: 80, backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 2, borderColor: '#D1FAE5', borderStyle: 'dashed',
    justifyContent: 'center',
  },
  placeholder: { color: '#9CA3AF', fontSize: 15, textAlign: 'center', fontStyle: 'italic' },
  wordRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  selectedWordChip: {
    backgroundColor: '#10B981', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
    flexDirection: 'row', alignItems: 'center',
  },
  selectedWordText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  feedbackBanner: { borderRadius: 12, padding: 14, marginTop: 8 },
  feedbackCorrect: { backgroundColor: '#ECFDF5' },
  feedbackWrong: { backgroundColor: '#FEF2F2' },
  feedbackText: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  feedbackCorrectSentence: { fontSize: 15, color: '#10B981', marginTop: 4, fontStyle: 'italic' },
  wordBankSection: { gap: 8 },
  wordBank: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  wordChip: {
    backgroundColor: '#EEF2FF', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 2, borderColor: '#C7D2FE',
  },
  wordChipUsed: { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB', opacity: 0.4 },
  wordChipText: { color: '#4F46E5', fontWeight: '700', fontSize: 15 },
  wordChipTextUsed: { color: '#9CA3AF' },
  actions: { gap: 12 },
  checkButton: { backgroundColor: '#10B981', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  checkButtonDisabled: { backgroundColor: '#D1D5DB' },
  checkButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  nextButton: { backgroundColor: '#4F46E5', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  nextButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  clearButton: { borderRadius: 16, paddingVertical: 12, alignItems: 'center', backgroundColor: '#F3F4F6' },
  clearButtonText: { color: '#6B7280', fontWeight: '600', fontSize: 16 },
  completeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  completeCard: {
    backgroundColor: '#fff', borderRadius: 28, padding: 40, alignItems: 'center',
    width: '100%', gap: 12, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, elevation: 10,
  },
  completeEmoji: { fontSize: 64 },
  completeTitle: { fontSize: 32, fontWeight: 'bold', color: '#1F2937' },
  completeScore: { fontSize: 22, fontWeight: '700', color: '#F59E0B' },
  playAgainButton: { marginTop: 16, backgroundColor: '#10B981', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 40, width: '100%', alignItems: 'center' },
  playAgainText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  homeButton: { backgroundColor: '#F3F4F6', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 40, width: '100%', alignItems: 'center' },
  homeButtonText: { color: '#374151', fontWeight: '600', fontSize: 16 },
});
