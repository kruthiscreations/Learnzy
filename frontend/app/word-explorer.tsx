import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, FlatList, Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';
import { getWords } from '../utils/api';
import { useAppStore } from '../store/appStore';
import api from '../utils/api';

const LANG_LABELS: Record<string, string> = {
  telugu: 'తెలుగు',
  hindi: 'हिन्दी',
  tamil: 'தமிழ்',
  kannada: 'ಕನ್ನಡ',
  malayalam: 'മലയാളം',
  bengali: 'বাংলা',
  marathi: 'मराठी',
  gujarati: 'ગુજરાતી',
};

const POS_COLORS: Record<string, string> = {
  noun: '#3B82F6',
  verb: '#10B981',
  adjective: '#F59E0B',
  adverb: '#EC4899',
  default: '#6B7280',
};

export default function WordExplorerScreen() {
  const router = useRouter();
  const { user } = useAppStore();
  const [allWords, setAllWords] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedWord, setSelectedWord] = useState<any | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
    loadWords();
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  const loadWords = async () => {
    try {
      // Load all levels
      const [w1, w2, w3, w4] = await Promise.all([
        getWords('lkg-1st'),
        getWords('2nd-3rd'),
        getWords('4th-5th'),
        getWords('5th-adv'),
      ]);
      const all = [...w1, ...w2, ...w3, ...w4];
      // Deduplicate by word_english
      const seen = new Set<string>();
      const unique = all.filter(w => {
        const key = w.word_english?.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      unique.sort((a, b) => a.word_english?.localeCompare(b.word_english));
      setAllWords(unique);
      setFiltered(unique);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text: string) => {
    setQuery(text);
    applyFilters(text, activeCategory);
  };

  const handleCategory = (cat: string) => {
    setActiveCategory(cat);
    applyFilters(query, cat);
  };

  const applyFilters = (q: string, cat: string) => {
    let result = allWords;
    if (q.trim()) {
      const lower = q.toLowerCase();
      result = result.filter(w =>
        w.word_english?.toLowerCase().includes(lower) ||
        w.meaning?.toLowerCase().includes(lower)
      );
    }
    if (cat !== 'all') {
      result = result.filter(w => w.category === cat || w.level === cat);
    }
    setFiltered(result);
  };

  const speakWord = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      if (soundRef.current) { await soundRef.current.stopAsync(); await soundRef.current.unloadAsync(); }
      const response = await api.post('/tts/speak-base64', { text, voice: 'nova', speed: 0.85 });
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mp3;base64,${response.data.audio_base64}` },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate(s => { if (s.isLoaded && s.didJustFinish) setIsSpeaking(false); });
    } catch { setIsSpeaking(false); }
  };

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(allWords.map(w => w.category).filter(Boolean))).slice(0, 8)];
  const levels = ['lkg-1st', '2nd-3rd', '4th-5th', '5th-adv'];

  // Get translations for selected word
  const getWordTranslations = (word: any) => {
    const result: { lang: string; label: string; value: string }[] = [];
    const langs = ['telugu', 'hindi', 'tamil', 'kannada', 'malayalam', 'bengali', 'marathi', 'gujarati'];
    langs.forEach(lang => {
      const val = word.translations?.[lang] || (lang === 'telugu' ? word.word_telugu : null);
      if (val) result.push({ lang, label: LANG_LABELS[lang] || lang, value: val });
    });
    return result;
  };

  const posColor = (pos: string) => POS_COLORS[pos?.toLowerCase()] || POS_COLORS.default;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667EEA" />
        <Text style={styles.loadingText}>Loading word bank...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔍 Word Explorer</Text>
        <Text style={styles.headerSubtitle}>Discover {allWords.length} words!</Text>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search any word..."
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={handleSearch}
            returnKeyType="search"
            onSubmitEditing={Keyboard.dismiss}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryBar} contentContainerStyle={styles.categoryBarContent}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.catChip, activeCategory === cat && styles.catChipActive]}
            onPress={() => handleCategory(cat)}
          >
            <Text style={[styles.catChipText, activeCategory === cat && styles.catChipTextActive]}>
              {cat === 'all' ? '📚 All' : cat}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={{ width: 8 }} />
        {levels.map(lv => (
          <TouchableOpacity
            key={lv}
            style={[styles.catChip, styles.catChipLevel, activeCategory === lv && styles.catChipActive]}
            onPress={() => handleCategory(lv)}
          >
            <Text style={[styles.catChipText, activeCategory === lv && styles.catChipTextActive]}>
              {lv === 'lkg-1st' ? 'LKG–1st' : lv === '2nd-3rd' ? '2nd–3rd' : lv === '4th-5th' ? '4th–5th' : '5th Adv'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.resultCount}>{filtered.length} words found</Text>

      {/* Word list */}
      {!selectedWord ? (
        <FlatList
          data={filtered}
          keyExtractor={(item, i) => item._id || String(i)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.wordRow} onPress={() => setSelectedWord(item)}>
              <View style={styles.wordRowLeft}>
                <Text style={styles.wordRowText}>{item.word_english}</Text>
                {item.word_telugu && (
                  <Text style={styles.wordRowTelugu}>{item.word_telugu}</Text>
                )}
              </View>
              <View style={styles.wordRowRight}>
                {item.part_of_speech && (
                  <View style={[styles.posBadge, { backgroundColor: posColor(item.part_of_speech) + '22', borderColor: posColor(item.part_of_speech) }]}>
                    <Text style={[styles.posText, { color: posColor(item.part_of_speech) }]}>{item.part_of_speech}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>No words found for "{query}"</Text>
            </View>
          }
        />
      ) : (
        /* Word detail view */
        <ScrollView contentContainerStyle={styles.detailContent}>
          <TouchableOpacity style={styles.backToList} onPress={() => setSelectedWord(null)}>
            <Ionicons name="arrow-back" size={18} color="#667EEA" />
            <Text style={styles.backToListText}>Back to list</Text>
          </TouchableOpacity>

          <Animatable.View animation="fadeInUp" style={styles.detailCard}>
            {/* Word + POS */}
            <View style={styles.detailHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailWord}>{selectedWord.word_english}</Text>
                {selectedWord.part_of_speech && (
                  <View style={[styles.posBadge, { backgroundColor: posColor(selectedWord.part_of_speech) + '22', borderColor: posColor(selectedWord.part_of_speech), alignSelf: 'flex-start', marginTop: 6 }]}>
                    <Text style={[styles.posText, { color: posColor(selectedWord.part_of_speech) }]}>{selectedWord.part_of_speech}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity style={styles.speakBtn} onPress={() => speakWord(selectedWord.word_english)} disabled={isSpeaking}>
                {isSpeaking ? <ActivityIndicator size="small" color="#667EEA" /> : <Ionicons name="volume-high" size={28} color="#667EEA" />}
              </TouchableOpacity>
            </View>

            {/* Level badge */}
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>{selectedWord.level}</Text>
            </View>

            {/* Meaning */}
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>📖 Meaning</Text>
              <Text style={styles.infoValue}>{selectedWord.meaning}</Text>
            </View>

            {/* Example sentence */}
            {selectedWord.example_sentence && (
              <View style={styles.infoSection}>
                <View style={styles.infoLabelRow}>
                  <Text style={styles.infoLabel}>💬 Example</Text>
                  <TouchableOpacity onPress={() => speakWord(selectedWord.example_sentence)} disabled={isSpeaking}>
                    <Ionicons name="volume-medium" size={18} color="#667EEA" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.exampleText}>"{selectedWord.example_sentence}"</Text>
              </View>
            )}

            {/* Synonyms / Antonyms */}
            <View style={styles.synRow}>
              {selectedWord.synonyms?.length > 0 && (
                <View style={styles.synBox}>
                  <Text style={styles.synLabel}>Similar words</Text>
                  <Text style={styles.synValue}>{Array.isArray(selectedWord.synonyms) ? selectedWord.synonyms.join(', ') : selectedWord.synonyms}</Text>
                </View>
              )}
              {selectedWord.antonyms?.length > 0 && (
                <View style={[styles.synBox, styles.antBox]}>
                  <Text style={styles.synLabel}>Opposite words</Text>
                  <Text style={styles.synValue}>{Array.isArray(selectedWord.antonyms) ? selectedWord.antonyms.join(', ') : selectedWord.antonyms}</Text>
                </View>
              )}
            </View>

            {/* Translations */}
            {(() => {
              const translations = getWordTranslations(selectedWord);
              if (translations.length === 0) return null;
              return (
                <View style={styles.infoSection}>
                  <Text style={styles.infoLabel}>🌍 Translations</Text>
                  <View style={styles.translationsGrid}>
                    {translations.map(t => (
                      <View key={t.lang} style={styles.translationChip}>
                        <Text style={styles.translationLang}>{t.label}</Text>
                        <Text style={styles.translationValue}>{t.value}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })()}

            {/* Category */}
            {selectedWord.category && (
              <View style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>Category: {selectedWord.category}</Text>
              </View>
            )}

            {/* Practice button */}
            <TouchableOpacity
              style={styles.practiceBtn}
              onPress={() => router.push(`/practice/${selectedWord._id || selectedWord.word_english}`)}
            >
              <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.practiceBtnGradient}>
                <Ionicons name="mic" size={20} color="#fff" />
                <Text style={styles.practiceBtnText}>Practise Pronunciation</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 16, color: '#6B7280' },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  backButton: { marginBottom: 12 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: 14 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12,
  },
  searchInput: { flex: 1, fontSize: 16, color: '#1F2937' },
  categoryBar: { maxHeight: 52, marginTop: 12 },
  categoryBarContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  catChip: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1.5, borderColor: '#E5E7EB' },
  catChipLevel: { borderColor: '#C7D2FE', backgroundColor: '#EEF2FF' },
  catChipActive: { backgroundColor: '#667EEA', borderColor: '#667EEA' },
  catChipText: { fontSize: 13, fontWeight: '600', color: '#374151', textTransform: 'capitalize' },
  catChipTextActive: { color: '#fff' },
  resultCount: { fontSize: 12, color: '#9CA3AF', paddingHorizontal: 20, paddingVertical: 8 },
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },
  wordRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2,
  },
  wordRowLeft: { gap: 2 },
  wordRowText: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  wordRowTelugu: { fontSize: 14, color: '#9CA3AF' },
  wordRowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  posBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  posText: { fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  emptyBox: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 16, color: '#9CA3AF' },
  detailContent: { padding: 16, paddingBottom: 40 },
  backToList: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  backToListText: { fontSize: 15, fontWeight: '600', color: '#667EEA' },
  detailCard: { backgroundColor: '#fff', borderRadius: 24, padding: 22, gap: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 5 },
  detailHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  detailWord: { fontSize: 36, fontWeight: 'bold', color: '#1F2937' },
  speakBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  levelBadge: { backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5, alignSelf: 'flex-start' },
  levelBadgeText: { fontSize: 12, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' },
  infoSection: { gap: 6 },
  infoLabel: { fontSize: 13, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoValue: { fontSize: 17, color: '#1F2937', lineHeight: 24 },
  exampleText: { fontSize: 16, color: '#4B5563', fontStyle: 'italic', lineHeight: 24 },
  synRow: { flexDirection: 'row', gap: 10 },
  synBox: { flex: 1, backgroundColor: '#F0FDF4', borderRadius: 14, padding: 12, gap: 4 },
  antBox: { backgroundColor: '#FFF7ED' },
  synLabel: { fontSize: 11, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' },
  synValue: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  translationsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  translationChip: { backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#E5E7EB', gap: 2 },
  translationLang: { fontSize: 11, fontWeight: '700', color: '#9CA3AF' },
  translationValue: { fontSize: 16, color: '#1F2937', fontWeight: '600' },
  categoryTag: { backgroundColor: '#EEF2FF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start' },
  categoryTagText: { fontSize: 13, fontWeight: '600', color: '#4F46E5', textTransform: 'capitalize' },
  practiceBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 4 },
  practiceBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14 },
  practiceBtnText: { fontSize: 17, fontWeight: 'bold', color: '#fff' },
});
