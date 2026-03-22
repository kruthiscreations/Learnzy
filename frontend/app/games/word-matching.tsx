import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { getWords } from '../../utils/api';
import { useAppStore } from '../../store/appStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 56) / 2;

interface Card {
  id: string;
  wordId: string;
  type: 'english' | 'meaning';
  text: string;
  matched: boolean;
  selected: boolean;
}

export default function WordMatchingScreen() {
  const router = useRouter();
  const { user } = useAppStore();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [matchedCount, setMatchedCount] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [wrongPair, setWrongPair] = useState<string[]>([]);
  const lockRef = useRef(false);

  useEffect(() => {
    loadGame();
  }, []);

  const loadGame = async () => {
    setLoading(true);
    try {
      const level = user?.current_level || 'lkg-1st';
      const wordsData = await getWords(level);
      const shuffled = wordsData.sort(() => Math.random() - 0.5).slice(0, 6);
      const newCards: Card[] = [];
      shuffled.forEach((word: any, idx: number) => {
        const lang = user?.preferred_language;
        const translationText =
          lang && lang !== 'none' && word.translations?.[lang]
            ? word.translations[lang]
            : word.word_telugu || word.meaning;

        newCards.push({
          id: `eng-${idx}`,
          wordId: word._id || String(idx),
          type: 'english',
          text: word.word_english,
          matched: false,
          selected: false,
        });
        newCards.push({
          id: `mean-${idx}`,
          wordId: word._id || String(idx),
          type: 'meaning',
          text: translationText || word.meaning,
          matched: false,
          selected: false,
        });
      });
      // Shuffle cards
      setCards(newCards.sort(() => Math.random() - 0.5));
      setMatchedCount(0);
      setScore(0);
      setAttempts(0);
      setGameComplete(false);
      setSelectedCard(null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCardPress = (card: Card) => {
    if (lockRef.current || card.matched || card.selected) return;

    if (!selectedCard) {
      setSelectedCard(card);
      setCards(prev => prev.map(c => c.id === card.id ? { ...c, selected: true } : c));
      return;
    }

    // Second card selected
    setAttempts(a => a + 1);
    lockRef.current = true;

    const isMatch = selectedCard.wordId === card.wordId && selectedCard.type !== card.type;

    if (isMatch) {
      const newMatched = matchedCount + 1;
      setMatchedCount(newMatched);
      setScore(s => s + 10);
      setCards(prev =>
        prev.map(c =>
          c.id === card.id || c.id === selectedCard.id
            ? { ...c, matched: true, selected: false }
            : c
        )
      );
      setSelectedCard(null);
      lockRef.current = false;
      if (newMatched === 6) setGameComplete(true);
    } else {
      setWrongPair([selectedCard.id, card.id]);
      setCards(prev =>
        prev.map(c =>
          c.id === card.id || c.id === selectedCard.id
            ? { ...c, selected: true }
            : c
        )
      );
      setTimeout(() => {
        setCards(prev =>
          prev.map(c =>
            c.id === card.id || c.id === selectedCard.id
              ? { ...c, selected: false }
              : c
          )
        );
        setSelectedCard(null);
        setWrongPair([]);
        lockRef.current = false;
      }, 800);
    }
  };

  const getCardStyle = (card: Card) => {
    if (card.matched) return [styles.card, styles.cardMatched];
    if (wrongPair.includes(card.id)) return [styles.card, styles.cardWrong];
    if (card.selected) return [styles.card, styles.cardSelected];
    return [styles.card];
  };

  const getCardTextStyle = (card: Card) => {
    if (card.matched) return [styles.cardText, styles.cardTextMatched];
    if (card.selected || wrongPair.includes(card.id)) return [styles.cardText, styles.cardTextSelected];
    return [styles.cardText];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (gameComplete) {
    const accuracy = Math.round((6 / attempts) * 100);
    return (
      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.completeContainer}>
        <Animatable.View animation="bounceIn" style={styles.completeCard}>
          <Text style={styles.completeEmoji}>🎉</Text>
          <Text style={styles.completeTitle}>All Matched!</Text>
          <Text style={styles.completeScore}>Score: {score} ⭐</Text>
          <Text style={styles.completeAccuracy}>Accuracy: {accuracy}%</Text>
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

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Word Matching</Text>
        <Text style={styles.headerSubtitle}>Match the word to its meaning!</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBadge}>
            <Text style={styles.statText}>⭐ {score}</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statText}>✅ {matchedCount}/6</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statText}>🎯 {attempts}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.instruction}>Tap a word card, then tap its matching meaning!</Text>
        <View style={styles.grid}>
          {cards.map((card) => (
            <TouchableOpacity
              key={card.id}
              onPress={() => handleCardPress(card)}
              disabled={card.matched}
              activeOpacity={0.8}
            >
              <Animatable.View
                animation={card.matched ? 'bounceIn' : undefined}
                style={getCardStyle(card)}
              >
                <Text style={[styles.cardLabel, card.type === 'english' ? styles.labelEng : styles.labelMean]}>
                  {card.type === 'english' ? '🔤 English' : '💡 Meaning'}
                </Text>
                <Text style={getCardTextStyle(card)} numberOfLines={3}>
                  {card.text}
                </Text>
                {card.matched && (
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" style={styles.checkIcon} />
                )}
              </Animatable.View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: { marginBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  headerSubtitle: { fontSize: 15, color: '#fff', opacity: 0.9, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 8 },
  statBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  content: { padding: 16 },
  instruction: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  card: {
    width: CARD_WIDTH,
    minHeight: 100,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    justifyContent: 'center',
  },
  cardSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
    shadowColor: '#4F46E5',
    shadowOpacity: 0.2,
  },
  cardMatched: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  cardWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  labelEng: { color: '#4F46E5' },
  labelMean: { color: '#7C3AED' },
  cardText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  cardTextSelected: { color: '#4F46E5' },
  cardTextMatched: { color: '#10B981' },
  checkIcon: { position: 'absolute', top: 8, right: 8 },
  completeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  completeCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  completeEmoji: { fontSize: 64 },
  completeTitle: { fontSize: 32, fontWeight: 'bold', color: '#1F2937' },
  completeScore: { fontSize: 24, fontWeight: '700', color: '#F59E0B' },
  completeAccuracy: { fontSize: 18, color: '#6B7280' },
  playAgainButton: {
    marginTop: 16,
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
  },
  playAgainText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  homeButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
  },
  homeButtonText: { color: '#374151', fontWeight: '600', fontSize: 16 },
});
