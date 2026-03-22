import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';
import api from '../../utils/api';
import { useAppStore } from '../../store/appStore';

// CVC words with phonics breakdown
const CVC_WORDS = [
  { word: 'cat', sounds: ['c', 'a', 't'], emoji: '🐱', telugu: 'పిల్లి' },
  { word: 'dog', sounds: ['d', 'o', 'g'], emoji: '🐶', telugu: 'కుక్క' },
  { word: 'hat', sounds: ['h', 'a', 't'], emoji: '🎩', telugu: 'టోపీ' },
  { word: 'bat', sounds: ['b', 'a', 't'], emoji: '🦇', telugu: 'గబ్బిలం' },
  { word: 'sun', sounds: ['s', 'u', 'n'], emoji: '☀️', telugu: 'సూర్యుడు' },
  { word: 'cup', sounds: ['c', 'u', 'p'], emoji: '☕', telugu: 'కప్పు' },
  { word: 'pig', sounds: ['p', 'i', 'g'], emoji: '🐷', telugu: 'పంది' },
  { word: 'bin', sounds: ['b', 'i', 'n'], emoji: '🗑️', telugu: 'చెత్తబుట్ట' },
  { word: 'hen', sounds: ['h', 'e', 'n'], emoji: '🐔', telugu: 'కోడి' },
  { word: 'fox', sounds: ['f', 'o', 'x'], emoji: '🦊', telugu: 'నక్క' },
  { word: 'map', sounds: ['m', 'a', 'p'], emoji: '🗺️', telugu: 'పటం' },
  { word: 'jam', sounds: ['j', 'a', 'm'], emoji: '🍓', telugu: 'జామ్' },
];

// Sound families for Sound Hunt
const SOUND_FAMILIES = [
  { sound: '/a/', label: 'Short A', example: 'apple, cat, hat, mat', words: ['apple', 'cat', 'hat', 'mat', 'bat', 'van', 'ant'], nonWords: ['dog', 'sun', 'cup', 'big', 'hop'], emoji: '🍎' },
  { sound: '/b/', label: 'B Sound', example: 'ball, bat, bag, bug', words: ['ball', 'bat', 'bag', 'bug', 'bus', 'bed', 'bin'], nonWords: ['cat', 'dog', 'hen', 'sun', 'map'], emoji: '⚽' },
  { sound: '/s/', label: 'S Sound', example: 'sun, sit, sad, six', words: ['sun', 'sit', 'sad', 'six', 'sea', 'sip', 'sob'], nonWords: ['bat', 'dog', 'hen', 'pig', 'fox'], emoji: '☀️' },
  { sound: '/m/', label: 'M Sound', example: 'mango, map, mud, mix', words: ['mango', 'map', 'mud', 'mix', 'mom', 'mat', 'mop'], nonWords: ['cat', 'dog', 'pet', 'cup', 'box'], emoji: '🥭' },
];

const MODES = [
  { key: 'blend', label: 'Sound Blending', icon: '🔤', desc: 'Put sounds together to make a word!', colors: ['#F59E0B', '#D97706'] as [string, string] },
  { key: 'hunt', label: 'Sound Hunt', icon: '🔍', desc: 'Find words with the target sound!', colors: ['#10B981', '#059669'] as [string, string] },
  { key: 'match', label: 'Letter & Sound', icon: '🎯', desc: 'Match each letter to its sound!', colors: ['#3B82F6', '#2563EB'] as [string, string] },
];

const LETTER_SOUNDS = [
  { letter: 'A', sound: '/a/ like Apple 🍎', emoji: '🍎', telugu: 'ఆపిల్' },
  { letter: 'B', sound: '/b/ like Ball ⚽', emoji: '⚽', telugu: 'బంతి' },
  { letter: 'C', sound: '/k/ like Cat 🐱', emoji: '🐱', telugu: 'పిల్లి' },
  { letter: 'D', sound: '/d/ like Dog 🐶', emoji: '🐶', telugu: 'కుక్క' },
  { letter: 'M', sound: '/m/ like Mango 🥭', emoji: '🥭', telugu: 'మామిడి' },
  { letter: 'S', sound: '/s/ like Sun ☀️', emoji: '☀️', telugu: 'సూర్యుడు' },
  { letter: 'T', sound: '/t/ like Tiger 🐯', emoji: '🐯', telugu: 'పులి' },
  { letter: 'P', sound: '/p/ like Parrot 🦜', emoji: '🦜', telugu: 'చిలుక' },
];

export default function PhonicsScreen() {
  const router = useRouter();
  const { user } = useAppStore();
  const [mode, setMode] = useState<string | null>(null);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [blendStep, setBlendStep] = useState(0); // which sound we've tapped
  const [blendComplete, setBlendComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [huntFamily, setHuntFamily] = useState(0);
  const [huntAnswers, setHuntAnswers] = useState<Record<string, boolean | null>>({});
  const [huntChecked, setHuntChecked] = useState(false);
  const [currentLetterIdx, setCurrentLetterIdx] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const words = CVC_WORDS.sort(() => Math.random() - 0.5);

  const speakText = async (text: string, slow = false) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      if (soundRef.current) { await soundRef.current.stopAsync(); await soundRef.current.unloadAsync(); }
      const response = await api.post('/tts/speak-base64', { text, voice: 'nova', speed: slow ? 0.6 : 0.85 });
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mp3;base64,${response.data.audio_base64}` },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate(s => { if (s.isLoaded && s.didJustFinish) setIsSpeaking(false); });
    } catch { setIsSpeaking(false); }
  };

  const handleBlendTap = (soundIdx: number) => {
    if (soundIdx !== blendStep) return;
    const word = CVC_WORDS[currentWordIdx];
    speakText(word.sounds[soundIdx], true);
    const newStep = blendStep + 1;
    setBlendStep(newStep);
    if (newStep === word.sounds.length) {
      setTimeout(() => {
        speakText(word.word);
        setBlendComplete(true);
        setScore(s => s + 5);
      }, 500);
    }
  };

  const nextBlendWord = () => {
    const nextIdx = (currentWordIdx + 1) % CVC_WORDS.length;
    setCurrentWordIdx(nextIdx);
    setBlendStep(0);
    setBlendComplete(false);
  };

  const huntWord = (word: string) => {
    if (huntChecked) return;
    const correct = SOUND_FAMILIES[huntFamily].words.includes(word);
    setHuntAnswers(prev => ({ ...prev, [word]: correct }));
  };

  const checkHunt = () => setHuntChecked(true);
  const nextHunt = () => {
    setHuntFamily(f => (f + 1) % SOUND_FAMILIES.length);
    setHuntAnswers({});
    setHuntChecked(false);
  };

  if (!mode) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#EF4444', '#F97316']} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Phonics Fun! 🔤</Text>
          <Text style={styles.headerSubtitle}>Learn letter sounds the fun way!</Text>
        </LinearGradient>
        <ScrollView contentContainerStyle={styles.modeContent}>
          {MODES.map(m => (
            <TouchableOpacity key={m.key} onPress={() => setMode(m.key)} style={styles.modeCard}>
              <LinearGradient colors={m.colors} style={styles.modeGradient}>
                <Text style={styles.modeIcon}>{m.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modeLabel}>{m.label}</Text>
                  <Text style={styles.modeDesc}>{m.desc}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.8)" />
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  // BLEND MODE
  if (mode === 'blend') {
    const word = CVC_WORDS[currentWordIdx];
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.header}>
          <TouchableOpacity onPress={() => setMode(null)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🔤 Sound Blending</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBadge}><Text style={styles.statText}>⭐ {score}</Text></View>
          </View>
        </LinearGradient>
        <ScrollView contentContainerStyle={styles.blendContent}>
          <Text style={styles.blendInstruction}>Tap each sound in order to blend the word!</Text>

          <View style={styles.wordEmojiBox}>
            <Text style={styles.wordEmoji}>{word.emoji}</Text>
            {blendComplete && (
              <Animatable.Text animation="bounceIn" style={styles.blendedWord}>{word.word.toUpperCase()}</Animatable.Text>
            )}
            {blendComplete && (
              <Text style={styles.teluguLabel}>{word.telugu}</Text>
            )}
          </View>

          <View style={styles.soundsRow}>
            {word.sounds.map((s, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.soundChip,
                  blendStep > i && styles.soundChipDone,
                  blendStep === i && styles.soundChipActive,
                  blendStep < i && styles.soundChipLocked,
                ]}
                onPress={() => handleBlendTap(i)}
                disabled={blendStep !== i || blendComplete}
              >
                <Text style={[styles.soundText, blendStep > i && styles.soundTextDone]}>/{s}/</Text>
                {blendStep > i && <Ionicons name="checkmark" size={16} color="#10B981" style={{ marginTop: 2 }} />}
              </TouchableOpacity>
            ))}
          </View>

          {blendStep > 0 && !blendComplete && (
            <Animatable.Text animation="fadeIn" style={styles.soFar}>
              So far: /{word.sounds.slice(0, blendStep).join('-')}/
            </Animatable.Text>
          )}

          <TouchableOpacity style={styles.speakFullButton} onPress={() => speakText(word.word)} disabled={isSpeaking}>
            <Ionicons name="volume-high" size={24} color="#F59E0B" />
            <Text style={styles.speakFullText}>Hear the word</Text>
          </TouchableOpacity>

          {blendComplete && (
            <Animatable.View animation="bounceIn" style={styles.successBox}>
              <Text style={styles.successText}>🎉 Great blending! You made "{word.word}"!</Text>
              <TouchableOpacity style={styles.nextWordButton} onPress={nextBlendWord}>
                <Text style={styles.nextWordText}>Next Word →</Text>
              </TouchableOpacity>
            </Animatable.View>
          )}
        </ScrollView>
      </View>
    );
  }

  // HUNT MODE
  if (mode === 'hunt') {
    const family = SOUND_FAMILIES[huntFamily];
    const allWords = [...family.words, ...family.nonWords].sort(() => Math.random() - 0.5);
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
          <TouchableOpacity onPress={() => setMode(null)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🔍 Sound Hunt</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBadge}><Text style={styles.statText}>{huntFamily + 1}/4 sets</Text></View>
          </View>
        </LinearGradient>
        <ScrollView contentContainerStyle={styles.huntContent}>
          <View style={styles.targetSoundBox}>
            <Text style={styles.targetEmoji}>{family.emoji}</Text>
            <Text style={styles.targetSound}>{family.sound}</Text>
            <Text style={styles.targetLabel}>{family.label}</Text>
            <Text style={styles.targetExample}>e.g. {family.example}</Text>
          </View>
          <Text style={styles.huntInstruction}>Tap all words with the {family.sound} sound:</Text>
          <View style={styles.huntGrid}>
            {allWords.map(w => {
              const selected = w in huntAnswers;
              const isCorrect = family.words.includes(w);
              let chipStyle = styles.huntChip;
              if (huntChecked) {
                if (selected && isCorrect) chipStyle = { ...styles.huntChip, ...styles.huntCorrect };
                else if (selected && !isCorrect) chipStyle = { ...styles.huntChip, ...styles.huntWrong };
                else if (!selected && isCorrect) chipStyle = { ...styles.huntChip, ...styles.huntMissed };
              } else if (selected) {
                chipStyle = { ...styles.huntChip, ...styles.huntSelected };
              }
              return (
                <TouchableOpacity key={w} style={chipStyle} onPress={() => huntWord(w)} disabled={huntChecked}>
                  <Text style={styles.huntChipText}>{w}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {!huntChecked ? (
            <TouchableOpacity style={styles.checkButton} onPress={checkHunt}>
              <Text style={styles.checkButtonText}>Check My Answers ✓</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.huntResult}>
              <Text style={styles.huntResultText}>
                ✅ Correct words: {family.words.join(', ')}
              </Text>
              <TouchableOpacity style={styles.nextHuntButton} onPress={nextHunt}>
                <Text style={styles.nextHuntText}>Next Sound Family →</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    );
  }

  // LETTER & SOUND MODE
  if (mode === 'match') {
    const item = LETTER_SOUNDS[currentLetterIdx];
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.header}>
          <TouchableOpacity onPress={() => setMode(null)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🎯 Letter & Sound</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBadge}><Text style={styles.statText}>{currentLetterIdx + 1}/{LETTER_SOUNDS.length}</Text></View>
          </View>
        </LinearGradient>
        <ScrollView contentContainerStyle={styles.matchContent}>
          <Animatable.View animation="bounceIn" key={currentLetterIdx} style={styles.letterCard}>
            <Text style={styles.bigLetter}>{item.letter}</Text>
            <Text style={styles.letterEmoji}>{item.emoji}</Text>
            <Text style={styles.letterSound}>{item.sound}</Text>
            <Text style={styles.letterTelugu}>{item.telugu}</Text>
          </Animatable.View>

          <TouchableOpacity style={styles.speakLetterButton} onPress={() => speakText(item.sound.split(' ')[0].replace(/[/]/g, ''), true)} disabled={isSpeaking}>
            {isSpeaking ? <ActivityIndicator size="small" color="#3B82F6" /> : <Ionicons name="volume-high" size={28} color="#3B82F6" />}
            <Text style={styles.speakLetterText}>Hear the sound</Text>
          </TouchableOpacity>

          <View style={styles.practiceBox}>
            <Text style={styles.practiceTitle}>Say it out loud! 🗣️</Text>
            <Text style={styles.practiceInst}>
              Make the sound "{item.sound.split(' ')[0]}" with your mouth.{'\n'}
              Look in a mirror and watch your lips!
            </Text>
          </View>

          <View style={styles.matchNav}>
            <TouchableOpacity
              style={[styles.navButton, currentLetterIdx === 0 && styles.navButtonDisabled]}
              onPress={() => setCurrentLetterIdx(i => i - 1)}
              disabled={currentLetterIdx === 0}
            >
              <Ionicons name="chevron-back" size={28} color={currentLetterIdx === 0 ? '#D1D5DB' : '#3B82F6'} />
            </TouchableOpacity>
            <View style={styles.navDots}>
              {LETTER_SOUNDS.map((_, i) => (
                <View key={i} style={[styles.dot, i === currentLetterIdx && styles.dotActive]} />
              ))}
            </View>
            <TouchableOpacity
              style={[styles.navButton, currentLetterIdx === LETTER_SOUNDS.length - 1 && styles.navButtonDisabled]}
              onPress={() => setCurrentLetterIdx(i => i + 1)}
              disabled={currentLetterIdx === LETTER_SOUNDS.length - 1}
            >
              <Ionicons name="chevron-forward" size={28} color={currentLetterIdx === LETTER_SOUNDS.length - 1 ? '#D1D5DB' : '#3B82F6'} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  backButton: { marginBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: '#fff', opacity: 0.9 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  statBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5 },
  statText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  modeContent: { padding: 20, gap: 14 },
  modeCard: { borderRadius: 20, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  modeGradient: { flexDirection: 'row', alignItems: 'center', padding: 22, gap: 16 },
  modeIcon: { fontSize: 36 },
  modeLabel: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  modeDesc: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },
  blendContent: { padding: 20, gap: 20, alignItems: 'center' },
  blendInstruction: { fontSize: 16, color: '#6B7280', textAlign: 'center', fontStyle: 'italic' },
  wordEmojiBox: { alignItems: 'center', gap: 8 },
  wordEmoji: { fontSize: 80 },
  blendedWord: { fontSize: 48, fontWeight: 'bold', color: '#F59E0B' },
  teluguLabel: { fontSize: 22, color: '#F59E0B', fontWeight: '600' },
  soundsRow: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  soundChip: {
    width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#FEF3C7', borderWidth: 2, borderColor: '#FCD34D',
  },
  soundChipActive: { backgroundColor: '#F59E0B', borderColor: '#D97706', transform: [{ scale: 1.1 }] },
  soundChipDone: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  soundChipLocked: { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB', opacity: 0.5 },
  soundText: { fontSize: 20, fontWeight: 'bold', color: '#92400E' },
  soundTextDone: { color: '#10B981' },
  soFar: { fontSize: 18, color: '#6B7280', fontStyle: 'italic' },
  speakFullButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF3C7', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12 },
  speakFullText: { fontSize: 16, fontWeight: '600', color: '#92400E' },
  successBox: { backgroundColor: '#ECFDF5', borderRadius: 18, padding: 20, alignItems: 'center', gap: 12, width: '100%' },
  successText: { fontSize: 18, fontWeight: '700', color: '#065F46', textAlign: 'center' },
  nextWordButton: { backgroundColor: '#10B981', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 32 },
  nextWordText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  huntContent: { padding: 20, gap: 16 },
  targetSoundBox: { backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center', gap: 4, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  targetEmoji: { fontSize: 48 },
  targetSound: { fontSize: 40, fontWeight: 'bold', color: '#10B981' },
  targetLabel: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  targetExample: { fontSize: 14, color: '#6B7280', fontStyle: 'italic' },
  huntInstruction: { fontSize: 15, fontWeight: '600', color: '#374151' },
  huntGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  huntChip: { backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 18, paddingVertical: 10, borderWidth: 2, borderColor: '#E5E7EB' },
  huntSelected: { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
  huntCorrect: { backgroundColor: '#10B981', borderColor: '#10B981' },
  huntWrong: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
  huntMissed: { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' },
  huntChipText: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  checkButton: { backgroundColor: '#10B981', borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  checkButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 17 },
  huntResult: { backgroundColor: '#ECFDF5', borderRadius: 16, padding: 16, gap: 12 },
  huntResultText: { fontSize: 15, color: '#065F46', lineHeight: 22 },
  nextHuntButton: { backgroundColor: '#10B981', borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  nextHuntText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  matchContent: { padding: 20, gap: 20, alignItems: 'center' },
  letterCard: { backgroundColor: '#fff', borderRadius: 24, padding: 36, alignItems: 'center', gap: 8, width: '100%', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 5 },
  bigLetter: { fontSize: 96, fontWeight: 'bold', color: '#3B82F6' },
  letterEmoji: { fontSize: 48 },
  letterSound: { fontSize: 22, fontWeight: '700', color: '#1F2937' },
  letterTelugu: { fontSize: 20, color: '#3B82F6', fontWeight: '600' },
  speakLetterButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EFF6FF', borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12 },
  speakLetterText: { fontSize: 16, fontWeight: '600', color: '#1D4ED8' },
  practiceBox: { backgroundColor: '#EFF6FF', borderRadius: 16, padding: 20, width: '100%', gap: 8 },
  practiceTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E40AF' },
  practiceInst: { fontSize: 15, color: '#1D4ED8', lineHeight: 22 },
  matchNav: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  navButton: { width: 48, height: 48, backgroundColor: '#EFF6FF', borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  navButtonDisabled: { opacity: 0.4 },
  navDots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D1D5DB' },
  dotActive: { backgroundColor: '#3B82F6', width: 20 },
});
