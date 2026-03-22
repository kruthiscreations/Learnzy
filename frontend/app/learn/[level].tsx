import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getWords } from '../../utils/api';
import { useAppStore } from '../../store/appStore';

interface Word {
  word_id: string;
  word_english: string;
  word_telugu: string;
  meaning: string;
  level: string;
}

export default function LearnScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAppStore();
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    try {
      const level = params.level as string || user?.current_level || 'lkg-1st';
      const wordsData = await getWords(level);
      setWords(wordsData);
    } catch (error) {
      console.error('Error loading words:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderWordCard = ({ item }: { item: Word }) => (
    <TouchableOpacity
      style={styles.wordCard}
      onPress={() => router.push(`/practice/${item.word_id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.wordContent}>
        <View style={styles.wordMain}>
          <Text style={styles.wordEnglish}>{item.word_english}</Text>
          <Text style={styles.wordTelugu}>{item.word_telugu}</Text>
        </View>
        <Text style={styles.wordMeaning}>{item.meaning}</Text>
      </View>
      <View style={styles.wordAction}>
        <View style={styles.playButton}>
          <Ionicons name="mic" size={24} color="#667EEA" />
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667EEA" />
        <Text style={styles.loadingText}>Loading words...</Text>
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
        <Text style={styles.headerTitle}>Practice Words</Text>
        <Text style={styles.headerSubtitle}>{words.length} words to learn</Text>
      </LinearGradient>

      <FlatList
        data={words}
        keyExtractor={(item) => item.word_id}
        renderItem={renderWordCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
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
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  listContent: {
    padding: 20,
    gap: 12,
  },
  wordCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wordContent: {
    flex: 1,
    gap: 8,
  },
  wordMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  wordEnglish: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  wordTelugu: {
    fontSize: 18,
    color: '#667EEA',
    fontWeight: '600',
  },
  wordMeaning: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  wordAction: {
    alignItems: 'center',
  },
  playButton: {
    width: 56,
    height: 56,
    backgroundColor: '#EEF2FF',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});