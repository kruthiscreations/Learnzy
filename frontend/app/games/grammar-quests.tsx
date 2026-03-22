import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useAppStore } from '../../store/appStore';

interface GrammarQuestion {
  id: string;
  sentence: string;
  blank: string;
  options: string[];
  answer: string;
  rule: string;
  category: string;
}

// Grammar questions bank — age-appropriate for 8-12 year olds
const GRAMMAR_BANK: Record<string, GrammarQuestion[]> = {
  tenses: [
    { id: 't1', sentence: 'I ___ to school every day.', blank: '___', options: ['go', 'went', 'going', 'gone'], answer: 'go', rule: 'Present simple for routines', category: 'tenses' },
    { id: 't2', sentence: 'She ___ a beautiful song yesterday.', blank: '___', options: ['sing', 'sang', 'sung', 'sings'], answer: 'sang', rule: 'Past simple for finished actions', category: 'tenses' },
    { id: 't3', sentence: 'They ___ playing cricket right now.', blank: '___', options: ['are', 'is', 'was', 'were'], answer: 'are', rule: 'Present continuous for actions happening now', category: 'tenses' },
    { id: 't4', sentence: 'He ___ his homework before dinner.', blank: '___', options: ['finish', 'finished', 'finishing', 'finishes'], answer: 'finished', rule: 'Past simple — completed action', category: 'tenses' },
    { id: 't5', sentence: 'We ___ go to the market tomorrow.', blank: '___', options: ['will', 'would', 'shall', 'should'], answer: 'will', rule: 'Future simple with will', category: 'tenses' },
    { id: 't6', sentence: 'The bird ___ singing in the tree.', blank: '___', options: ['is', 'are', 'am', 'were'], answer: 'is', rule: 'is/are — singular subject uses "is"', category: 'tenses' },
    { id: 't7', sentence: 'I ___ never eaten mangoes before.', blank: '___', options: ['have', 'had', 'has', 'having'], answer: 'have', rule: 'Present perfect with have', category: 'tenses' },
    { id: 't8', sentence: 'My mother ___ tea every morning.', blank: '___', options: ['makes', 'make', 'made', 'making'], answer: 'makes', rule: 'Third person singular — add s', category: 'tenses' },
  ],
  adjectives: [
    { id: 'a1', sentence: 'The elephant is a ___ animal.', blank: '___', options: ['big', 'bigger', 'biggest', 'bigly'], answer: 'big', rule: 'Simple adjective describing a noun', category: 'adjectives' },
    { id: 'a2', sentence: 'This mango is ___ than that one.', blank: '___', options: ['sweet', 'sweeter', 'sweetest', 'more sweet'], answer: 'sweeter', rule: 'Comparative adjective for comparing two things', category: 'adjectives' },
    { id: 'a3', sentence: 'The Ganga is the ___ river in India.', blank: '___', options: ['long', 'longer', 'longest', 'most long'], answer: 'longest', rule: 'Superlative adjective — comparing all', category: 'adjectives' },
    { id: 'a4', sentence: 'She is a ___ girl — always helping others.', blank: '___', options: ['kind', 'kindly', 'kinder', 'kindness'], answer: 'kind', rule: 'Adjective before a noun', category: 'adjectives' },
    { id: 'a5', sentence: 'The soup was very ___. I loved it!', blank: '___', options: ['delicious', 'deliciously', 'more delicious', 'most delicious'], answer: 'delicious', rule: 'Adjective after linking verb "was"', category: 'adjectives' },
  ],
  plurals: [
    { id: 'p1', sentence: 'One cat, two ___.', blank: '___', options: ['cats', 'cat', 'cates', 'caties'], answer: 'cats', rule: 'Add -s to most nouns', category: 'plurals' },
    { id: 'p2', sentence: 'One bus, two ___.', blank: '___', options: ['buses', 'bus', 'buss', 'busi'], answer: 'buses', rule: 'Add -es after s/sh/ch/x', category: 'plurals' },
    { id: 'p3', sentence: 'One leaf, many ___.', blank: '___', options: ['leaves', 'leafs', 'leaf', 'leaes'], answer: 'leaves', rule: 'f → ves for some nouns', category: 'plurals' },
    { id: 'p4', sentence: 'One child, many ___.', blank: '___', options: ['children', 'childs', 'childes', 'child'], answer: 'children', rule: 'Irregular plural', category: 'plurals' },
    { id: 'p5', sentence: 'One mango, five ___.', blank: '___', options: ['mangoes', 'mango', 'mangos', 'mangies'], answer: 'mangoes', rule: 'Add -es to nouns ending in o', category: 'plurals' },
  ],
  questions: [
    { id: 'q1', sentence: '___ is your name?', blank: '___', options: ['What', 'Where', 'How', 'Who'], answer: 'What', rule: '"What" asks about things/names', category: 'questions' },
    { id: 'q2', sentence: '___ do you live?', blank: '___', options: ['Where', 'What', 'Why', 'When'], answer: 'Where', rule: '"Where" asks about places', category: 'questions' },
    { id: 'q3', sentence: '___ old are you?', blank: '___', options: ['How', 'What', 'Who', 'Where'], answer: 'How', rule: '"How old" asks about age', category: 'questions' },
    { id: 'q4', sentence: '___ is your favourite subject?', blank: '___', options: ['What', 'Who', 'When', 'Which'], answer: 'What', rule: '"What" for things', category: 'questions' },
    { id: 'q5', sentence: '___ did you eat for breakfast?', blank: '___', options: ['What', 'Where', 'How', 'Who'], answer: 'What', rule: '"What" for things eaten/done', category: 'questions' },
  ],
};

const CATEGORIES = [
  { key: 'tenses', label: 'Tenses', icon: '⏰', colors: ['#F59E0B', '#D97706'] as [string, string] },
  { key: 'adjectives', label: 'Adjectives', icon: '✨', colors: ['#8B5CF6', '#7C3AED'] as [string, string] },
  { key: 'plurals', label: 'Plurals', icon: '📦', colors: ['#10B981', '#059669'] as [string, string] },
  { key: 'questions', label: 'Question Words', icon: '❓', colors: ['#3B82F6', '#2563EB'] as [string, string] },
];

export default function GrammarQuestsScreen() {
  const router = useRouter();
  const { user } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [questions, setQuestions] = useState<GrammarQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [stars, setStars] = useState(0);

  const startCategory = (categoryKey: string) => {
    const qs = GRAMMAR_BANK[categoryKey] || [];
    const shuffled = qs.sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
    setSelectedCategory(categoryKey);
    setCurrentIndex(0);
    setScore(0);
    setStars(0);
    setSelectedAnswer(null);
    setFeedback(null);
    setGameComplete(false);
  };

  const handleAnswer = (option: string) => {
    if (feedback) return;
    setSelectedAnswer(option);
    const correct = option === questions[currentIndex].answer;
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
      setScore(s => s + 10);
      setStars(s => s + 1);
    }
  };

  const nextQuestion = () => {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= questions.length) {
      setGameComplete(true);
    } else {
      setCurrentIndex(nextIdx);
      setSelectedAnswer(null);
      setFeedback(null);
    }
  };

  const categoryInfo = CATEGORIES.find(c => c.key === selectedCategory);

  // Category select screen
  if (!selectedCategory) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Grammar Quests</Text>
          <Text style={styles.headerSubtitle}>Choose a grammar topic to master!</Text>
        </LinearGradient>
        <ScrollView contentContainerStyle={styles.categoryContent}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat.key} onPress={() => startCategory(cat.key)} style={styles.categoryCard}>
              <LinearGradient colors={cat.colors} style={styles.categoryGradient}>
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.categoryLabel}>{cat.label}</Text>
                  <Text style={styles.categoryCount}>{GRAMMAR_BANK[cat.key]?.length || 0} questions</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // Complete screen
  if (gameComplete) {
    const percent = Math.round((score / (questions.length * 10)) * 100);
    return (
      <LinearGradient colors={categoryInfo?.colors || ['#F59E0B', '#D97706']} style={styles.completeContainer}>
        <Animatable.View animation="bounceIn" style={styles.completeCard}>
          <Text style={styles.completeEmoji}>{percent >= 80 ? '🏆' : percent >= 50 ? '⭐' : '📚'}</Text>
          <Text style={styles.completeTitle}>Quest Complete!</Text>
          <Text style={styles.completeScore}>{score}/{questions.length * 10} points</Text>
          <Text style={styles.completePercent}>{percent}% correct</Text>
          <View style={styles.starsRow}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Ionicons key={i} name="star" size={32} color={stars > i * (questions.length / 3) ? '#F59E0B' : '#D1D5DB'} />
            ))}
          </View>
          <TouchableOpacity style={[styles.playAgainButton, { backgroundColor: categoryInfo?.colors[0] }]} onPress={() => startCategory(selectedCategory)}>
            <Text style={styles.playAgainText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.changeTopicButton} onPress={() => setSelectedCategory(null)}>
            <Text style={styles.changeTopicText}>Change Topic</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeButton} onPress={() => router.back()}>
            <Text style={styles.homeButtonText}>Back to Games</Text>
          </TouchableOpacity>
        </Animatable.View>
      </LinearGradient>
    );
  }

  const q = questions[currentIndex];

  return (
    <View style={styles.container}>
      <LinearGradient colors={categoryInfo?.colors || ['#F59E0B', '#D97706']} style={styles.header}>
        <TouchableOpacity onPress={() => setSelectedCategory(null)} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryInfo?.icon} {categoryInfo?.label}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBadge}><Text style={styles.statText}>⭐ {score}</Text></View>
          <View style={styles.statBadge}><Text style={styles.statText}>{currentIndex + 1}/{questions.length}</Text></View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Progress bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((currentIndex) / questions.length) * 100}%`, backgroundColor: categoryInfo?.colors[0] }]} />
        </View>

        {/* Question card */}
        <Animatable.View animation="fadeInDown" key={q.id} style={styles.questionCard}>
          <Text style={styles.questionLabel}>Fill in the blank:</Text>
          <Text style={styles.questionSentence}>{q.sentence}</Text>
        </Animatable.View>

        {/* Options */}
        <View style={styles.optionsGrid}>
          {q.options.map((option, i) => {
            let optionStyle = styles.optionButton;
            let textStyle = styles.optionText;
            if (feedback) {
              if (option === q.answer) {
                optionStyle = { ...styles.optionButton, ...styles.optionCorrect };
                textStyle = { ...styles.optionText, color: '#fff' };
              } else if (option === selectedAnswer && option !== q.answer) {
                optionStyle = { ...styles.optionButton, ...styles.optionWrong };
                textStyle = { ...styles.optionText, color: '#fff' };
              }
            } else if (option === selectedAnswer) {
              optionStyle = { ...styles.optionButton, ...styles.optionSelected };
            }
            return (
              <TouchableOpacity
                key={i}
                style={optionStyle}
                onPress={() => handleAnswer(option)}
                disabled={!!feedback}
              >
                <Text style={[textStyle, { fontWeight: '700' }]}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Feedback */}
        {feedback && (
          <Animatable.View animation="fadeIn" style={[styles.ruleBox, feedback === 'correct' ? styles.ruleCorrect : styles.ruleWrong]}>
            <Text style={styles.ruleText}>
              {feedback === 'correct' ? '✅ Correct! ' : `❌ The answer is "${q.answer}". `}
            </Text>
            <Text style={styles.ruleExplanation}>💡 Rule: {q.rule}</Text>
          </Animatable.View>
        )}

        {feedback && (
          <TouchableOpacity style={[styles.nextButton, { backgroundColor: categoryInfo?.colors[0] }]} onPress={nextQuestion}>
            <Text style={styles.nextButtonText}>
              {currentIndex + 1 >= questions.length ? 'See Results 🏆' : 'Next Question →'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  backButton: { marginBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  headerSubtitle: { fontSize: 15, color: '#fff', opacity: 0.9 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  statBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6 },
  statText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  categoryContent: { padding: 20, gap: 14 },
  categoryCard: { borderRadius: 20, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  categoryGradient: { flexDirection: 'row', alignItems: 'center', padding: 22, gap: 16 },
  categoryIcon: { fontSize: 36 },
  categoryLabel: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  categoryCount: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  content: { padding: 20, gap: 16 },
  progressBar: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: 4 },
  questionCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  questionLabel: { fontSize: 14, fontWeight: '600', color: '#6B7280', marginBottom: 12, textTransform: 'uppercase' },
  questionSentence: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', lineHeight: 36, textAlign: 'center' },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  optionButton: {
    width: '45%', backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16,
    alignItems: 'center', borderWidth: 2, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  optionSelected: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  optionCorrect: { backgroundColor: '#10B981', borderColor: '#10B981' },
  optionWrong: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
  optionText: { fontSize: 18, color: '#374151' },
  ruleBox: { borderRadius: 14, padding: 16, gap: 4 },
  ruleCorrect: { backgroundColor: '#ECFDF5' },
  ruleWrong: { backgroundColor: '#FEF2F2' },
  ruleText: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  ruleExplanation: { fontSize: 14, color: '#6B7280' },
  nextButton: { borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  nextButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  completeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  completeCard: { backgroundColor: '#fff', borderRadius: 28, padding: 40, alignItems: 'center', width: '100%', gap: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  completeEmoji: { fontSize: 64 },
  completeTitle: { fontSize: 30, fontWeight: 'bold', color: '#1F2937' },
  completeScore: { fontSize: 22, fontWeight: '700', color: '#F59E0B' },
  completePercent: { fontSize: 16, color: '#6B7280' },
  starsRow: { flexDirection: 'row', gap: 8, marginVertical: 8 },
  playAgainButton: { marginTop: 8, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 40, width: '100%', alignItems: 'center' },
  playAgainText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  changeTopicButton: { backgroundColor: '#EEF2FF', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 40, width: '100%', alignItems: 'center' },
  changeTopicText: { color: '#4F46E5', fontWeight: '600', fontSize: 16 },
  homeButton: { backgroundColor: '#F3F4F6', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 40, width: '100%', alignItems: 'center' },
  homeButtonText: { color: '#374151', fontWeight: '600', fontSize: 16 },
});
