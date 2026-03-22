import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Animatable from 'react-native-animatable';
import { useAppStore } from '../store/appStore';
import { 
  DAILY_SESSION_STRUCTURE, 
  PHONICS_CONTENT, 
  STORIES, 
  FINE_MOTOR_ACTIVITIES,
  PARENT_TIPS 
} from '../constants/DailySessionContent';
import api from '../utils/api';

const { width } = Dimensions.get('window');

type SessionSection = 'menu' | 'phonics' | 'story' | 'fine_motor' | 'parent_tips';

export default function DailySessionScreen() {
  const router = useRouter();
  const { user } = useAppStore();
  const [currentSection, setCurrentSection] = useState<SessionSection>('menu');
  const [phonicsMode, setPhonicsMode] = useState<'song' | 'sounds' | 'rhymes'>('song');
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sessionProgress, setSessionProgress] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
    startBounceAnimation();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const startBounceAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  };

  const bounceTranslate = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  // TTS speak function
  const speak = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);

    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      }

      const response = await api.post('/tts/speak-base64', {
        text,
        voice: 'nova',
        speed: 0.9,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mp3;base64,${response.data.audio_base64}` },
        { shouldPlay: true }
      );

      soundRef.current = sound;
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

  // Main Menu
  const renderMenu = () => (
    <ScrollView contentContainerStyle={styles.menuContainer}>
      <Text style={styles.menuTitle}>Daily Learning Session</Text>
      <Text style={styles.menuSubtitle}>15 minutes of fun learning!</Text>

      <View style={styles.sessionsGrid}>
        {DAILY_SESSION_STRUCTURE.sections.map((section, index) => (
          <Animatable.View key={section.id} animation="fadeInUp" delay={index * 100}>
            <TouchableOpacity
              style={[styles.sessionCard, { backgroundColor: section.color }]}
              onPress={() => {
                if (section.id === 'phonics') setCurrentSection('phonics');
                else if (section.id === 'story_time') setCurrentSection('story');
                else if (section.id === 'fine_motor') setCurrentSection('fine_motor');
                else if (section.id === 'core_skills') router.push('/games/interactive-learning');
              }}
              data-testid={`session-${section.id}`}
            >
              <Animated.Text style={[styles.sessionIcon, { transform: [{ translateY: bounceTranslate }] }]}>
                {section.icon}
              </Animated.Text>
              <Text style={styles.sessionName}>{section.name}</Text>
              <Text style={styles.sessionDesc}>{section.description}</Text>
              <View style={styles.durationBadge}>
                <Ionicons name="time-outline" size={14} color="#fff" />
                <Text style={styles.durationText}>{section.duration} min</Text>
              </View>
            </TouchableOpacity>
          </Animatable.View>
        ))}
      </View>

      {/* Parent Tips Button */}
      <TouchableOpacity
        style={styles.parentTipsButton}
        onPress={() => setCurrentSection('parent_tips')}
        data-testid="parent-tips-btn"
      >
        <Ionicons name="information-circle" size={24} color="#8B5CF6" />
        <Text style={styles.parentTipsText}>Tips for Parents</Text>
        <Ionicons name="chevron-forward" size={24} color="#8B5CF6" />
      </TouchableOpacity>
    </ScrollView>
  );

  // Phonics Section
  const renderPhonics = () => {
    const currentLetter = PHONICS_CONTENT.letterSounds[currentLetterIndex];
    const currentRhyme = PHONICS_CONTENT.rhymingPairs[Math.floor(currentLetterIndex / 3) % PHONICS_CONTENT.rhymingPairs.length];

    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <TouchableOpacity onPress={() => setCurrentSection('menu')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>Phonics Corner 🎵</Text>
        </View>

        {/* Mode Tabs */}
        <View style={styles.tabContainer}>
          {[
            { id: 'song', label: 'ABC Song' },
            { id: 'sounds', label: 'Letter Sounds' },
            { id: 'rhymes', label: 'Rhymes' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, phonicsMode === tab.id && styles.tabActive]}
              onPress={() => setPhonicsMode(tab.id as typeof phonicsMode)}
            >
              <Text style={[styles.tabText, phonicsMode === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.phonicsContent}>
          {phonicsMode === 'song' && (
            <Animatable.View animation="fadeIn" style={styles.songContainer}>
              <Text style={styles.songTitle}>🎶 ABC Song</Text>
              <View style={styles.lyricsBox}>
                <Text style={styles.lyricsText}>{PHONICS_CONTENT.alphabetSong.lyrics}</Text>
              </View>
              <TouchableOpacity
                style={[styles.singButton, isSpeaking && styles.singButtonActive]}
                onPress={() => speak(PHONICS_CONTENT.alphabetSong.audioPrompt)}
                disabled={isSpeaking}
              >
                {isSpeaking ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="musical-notes" size={24} color="#fff" />
                    <Text style={styles.singButtonText}>Sing Along!</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animatable.View>
          )}

          {phonicsMode === 'sounds' && (
            <Animatable.View animation="fadeIn" style={styles.soundsContainer}>
              <View style={styles.letterCard}>
                <Animated.Text style={[styles.bigLetter, { transform: [{ translateY: bounceTranslate }] }]}>
                  {currentLetter.letter}
                </Animated.Text>
                <Text style={styles.letterEmoji}>{currentLetter.emoji}</Text>
                <Text style={styles.soundText}>Sound: "{currentLetter.sound}"</Text>
                <Text style={styles.wordText}>{currentLetter.letter} is for {currentLetter.word}</Text>
              </View>
              
              <TouchableOpacity
                style={[styles.hearButton, isSpeaking && styles.hearButtonActive]}
                onPress={() => speak(`${currentLetter.letter}. ${currentLetter.sound}. ${currentLetter.letter} is for ${currentLetter.word}`)}
                disabled={isSpeaking}
              >
                {isSpeaking ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <Ionicons name="volume-high" size={24} color="#fff" />
                    <Text style={styles.hearButtonText}>Hear It!</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.letterNav}>
                <TouchableOpacity
                  style={[styles.navBtn, currentLetterIndex === 0 && styles.navBtnDisabled]}
                  onPress={() => setCurrentLetterIndex(Math.max(0, currentLetterIndex - 1))}
                  disabled={currentLetterIndex === 0}
                >
                  <Ionicons name="chevron-back" size={32} color={currentLetterIndex === 0 ? '#ccc' : '#667EEA'} />
                </TouchableOpacity>
                <Text style={styles.letterProgress}>
                  {currentLetterIndex + 1} / {PHONICS_CONTENT.letterSounds.length}
                </Text>
                <TouchableOpacity
                  style={[styles.navBtn, currentLetterIndex === PHONICS_CONTENT.letterSounds.length - 1 && styles.navBtnDisabled]}
                  onPress={() => setCurrentLetterIndex(Math.min(PHONICS_CONTENT.letterSounds.length - 1, currentLetterIndex + 1))}
                  disabled={currentLetterIndex === PHONICS_CONTENT.letterSounds.length - 1}
                >
                  <Ionicons name="chevron-forward" size={32} color={currentLetterIndex === PHONICS_CONTENT.letterSounds.length - 1 ? '#ccc' : '#667EEA'} />
                </TouchableOpacity>
              </View>
            </Animatable.View>
          )}

          {phonicsMode === 'rhymes' && (
            <Animatable.View animation="fadeIn" style={styles.rhymesContainer}>
              <Text style={styles.rhymeTitle}>Find the Rhyme! 🎯</Text>
              <View style={styles.rhymeCard}>
                <View style={styles.rhymeWord}>
                  <Text style={styles.rhymeEmoji}>{currentRhyme.emoji1}</Text>
                  <Text style={styles.rhymeText}>{currentRhyme.word1}</Text>
                </View>
                <Text style={styles.rhymesWith}>rhymes with</Text>
                <View style={styles.rhymeWord}>
                  <Text style={styles.rhymeEmoji}>{currentRhyme.emoji2}</Text>
                  <Text style={styles.rhymeText}>{currentRhyme.word2}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.hearButton, isSpeaking && styles.hearButtonActive]}
                onPress={() => speak(`${currentRhyme.word1} rhymes with ${currentRhyme.word2}. ${currentRhyme.word1}, ${currentRhyme.word2}!`)}
                disabled={isSpeaking}
              >
                {isSpeaking ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <Ionicons name="volume-high" size={24} color="#fff" />
                    <Text style={styles.hearButtonText}>Hear the Rhyme!</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animatable.View>
          )}
        </ScrollView>
      </View>
    );
  };

  // Story Time Section
  const renderStory = () => {
    const story = STORIES[currentStoryIndex];
    const page = story.pages[currentPageIndex];

    const handleAnswerSelect = (answer: string) => {
      setSelectedAnswer(answer);
      if (page.blank) {
        const correct = answer === page.blank;
        setIsCorrect(correct);
        if (correct) {
          speak(`Yes! ${answer}! Great job!`);
        } else {
          speak(`Try again!`);
        }
      }
    };

    const handleNextPage = () => {
      if (currentPageIndex < story.pages.length - 1) {
        setCurrentPageIndex(currentPageIndex + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
      } else {
        // Story complete
        if (currentStoryIndex < STORIES.length - 1) {
          setCurrentStoryIndex(currentStoryIndex + 1);
          setCurrentPageIndex(0);
        } else {
          setCurrentSection('menu');
        }
        setSelectedAnswer(null);
        setIsCorrect(null);
      }
    };

    return (
      <View style={styles.sectionContainer}>
        <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.storyHeader}>
          <TouchableOpacity onPress={() => setCurrentSection('menu')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.sectionTitle}>📖 {story.title}</Text>
          <Text style={styles.pageIndicator}>{currentPageIndex + 1}/{story.pages.length}</Text>
        </LinearGradient>

        <View style={styles.storyContent}>
          <Animatable.Text animation="fadeIn" style={styles.storyEmoji}>{page.image}</Animatable.Text>
          
          <View style={styles.storyTextContainer}>
            <Text style={styles.storyText}>
              {page.blank 
                ? page.text.replace('___', selectedAnswer && isCorrect ? selectedAnswer : '____')
                : page.text
              }
            </Text>
          </View>

          {page.options.length > 0 && (
            <View style={styles.optionsContainer}>
              {page.options.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    selectedAnswer === option && (isCorrect ? styles.optionCorrect : styles.optionWrong),
                  ]}
                  onPress={() => handleAnswerSelect(option)}
                  disabled={isCorrect === true}
                >
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {(isCorrect || !page.blank) && (
            <TouchableOpacity style={styles.nextPageButton} onPress={handleNextPage}>
              <Text style={styles.nextPageText}>
                {currentPageIndex === story.pages.length - 1 ? 'Finish Story! 🎉' : 'Next Page'}
              </Text>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Fine Motor Activities Section
  const renderFineMotor = () => (
    <View style={styles.sectionContainer}>
      <LinearGradient colors={['#10B981', '#059669']} style={styles.sectionHeader}>
        <TouchableOpacity onPress={() => setCurrentSection('menu')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>Fun Activities ✏️</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.activitiesContainer}>
        <Text style={styles.activitiesIntro}>Choose an activity to practice!</Text>
        
        {FINE_MOTOR_ACTIVITIES.map((activity, index) => (
          <Animatable.View key={activity.id} animation="fadeInUp" delay={index * 100}>
            <TouchableOpacity
              style={[styles.activityCard, { borderLeftColor: activity.color }]}
              onPress={() => speak(`Let's play ${activity.name}! ${activity.description}`)}
            >
              <Text style={styles.activityIcon}>{activity.icon}</Text>
              <View style={styles.activityInfo}>
                <Text style={styles.activityName}>{activity.name}</Text>
                <Text style={styles.activityDesc}>{activity.description}</Text>
              </View>
              <TouchableOpacity
                style={[styles.playBtn, { backgroundColor: activity.color }]}
                onPress={() => speak(`${activity.name}. ${activity.description}`)}
              >
                <Ionicons name="play" size={20} color="#fff" />
              </TouchableOpacity>
            </TouchableOpacity>
          </Animatable.View>
        ))}

        <Text style={styles.comingSoon}>More activities coming soon!</Text>
      </ScrollView>
    </View>
  );

  // Parent Tips Section
  const renderParentTips = () => (
    <View style={styles.sectionContainer}>
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.sectionHeader}>
        <TouchableOpacity onPress={() => setCurrentSection('menu')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>Tips for Parents 💡</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.tipsContainer}>
        {PARENT_TIPS.map((tip, index) => (
          <Animatable.View key={tip.id} animation="fadeInUp" delay={index * 100}>
            <View style={[styles.tipCard, tip.importance === 'high' && styles.tipCardImportant]}>
              <View style={styles.tipHeader}>
                <Text style={styles.tipIcon}>{tip.icon}</Text>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                {tip.importance === 'high' && (
                  <View style={styles.importantBadge}>
                    <Text style={styles.importantText}>Important</Text>
                  </View>
                )}
              </View>
              <Text style={styles.tipText}>{tip.tip}</Text>
            </View>
          </Animatable.View>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.container}>
      {currentSection === 'menu' && (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Daily Session</Text>
            <View style={styles.timerBadge}>
              <Ionicons name="time" size={18} color="#FFD700" />
              <Text style={styles.timerText}>15 min</Text>
            </View>
          </View>
          {renderMenu()}
        </>
      )}
      {currentSection === 'phonics' && renderPhonics()}
      {currentSection === 'story' && renderStory()}
      {currentSection === 'fine_motor' && renderFineMotor()}
      {currentSection === 'parent_tips' && renderParentTips()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  timerText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  menuContainer: { padding: 20, paddingBottom: 40 },
  menuTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  menuSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 24 },
  sessionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 16 },
  sessionCard: {
    width: (width - 56) / 2,
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
  },
  sessionIcon: { fontSize: 40, marginBottom: 8 },
  sessionName: { fontSize: 16, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  sessionDesc: { fontSize: 12, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: 4 },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
    gap: 4,
  },
  durationText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  parentTipsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginTop: 24,
    gap: 12,
  },
  parentTipsText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#8B5CF6' },
  sectionContainer: { flex: 1 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  sectionTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: '#fff' },
  pageIndicator: { color: '#fff', fontSize: 14, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  tabContainer: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 20, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: '#fff' },
  tabText: { color: 'rgba(255,255,255,0.7)', fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: '#667EEA' },
  phonicsContent: { padding: 20 },
  songContainer: { alignItems: 'center' },
  songTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  lyricsBox: { backgroundColor: '#fff', padding: 20, borderRadius: 20, width: '100%', marginBottom: 20 },
  lyricsText: { fontSize: 18, color: '#1F2937', lineHeight: 28, textAlign: 'center' },
  singButton: {
    flexDirection: 'row',
    backgroundColor: '#EC4899',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    gap: 8,
  },
  singButtonActive: { backgroundColor: '#10B981' },
  singButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  soundsContainer: { alignItems: 'center' },
  letterCard: { backgroundColor: '#fff', padding: 32, borderRadius: 24, alignItems: 'center', width: '100%', marginBottom: 20 },
  bigLetter: { fontSize: 100, fontWeight: 'bold', color: '#667EEA' },
  letterEmoji: { fontSize: 60, marginVertical: 8 },
  soundText: { fontSize: 24, color: '#6B7280', marginTop: 8 },
  wordText: { fontSize: 20, color: '#1F2937', fontWeight: '600', marginTop: 8 },
  hearButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  hearButtonActive: { backgroundColor: '#10B981' },
  hearButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  letterNav: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  navBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  navBtnDisabled: { opacity: 0.5 },
  letterProgress: { color: '#fff', fontSize: 16, fontWeight: '600' },
  rhymesContainer: { alignItems: 'center' },
  rhymeTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  rhymeCard: { backgroundColor: '#fff', padding: 24, borderRadius: 24, alignItems: 'center', width: '100%', marginBottom: 20 },
  rhymeWord: { alignItems: 'center', marginVertical: 8 },
  rhymeEmoji: { fontSize: 50 },
  rhymeText: { fontSize: 28, fontWeight: 'bold', color: '#1F2937' },
  rhymesWith: { fontSize: 18, color: '#9CA3AF', fontStyle: 'italic', marginVertical: 8 },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  storyContent: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, alignItems: 'center' },
  storyEmoji: { fontSize: 80, marginBottom: 20 },
  storyTextContainer: { backgroundColor: '#F3F4F6', padding: 20, borderRadius: 16, width: '100%', marginBottom: 20 },
  storyText: { fontSize: 22, color: '#1F2937', lineHeight: 32, textAlign: 'center' },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginBottom: 20 },
  optionButton: { backgroundColor: '#EEF2FF', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 20, borderWidth: 2, borderColor: '#667EEA' },
  optionCorrect: { backgroundColor: '#D1FAE5', borderColor: '#10B981' },
  optionWrong: { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
  optionText: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
  nextPageButton: {
    flexDirection: 'row',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    gap: 8,
  },
  nextPageText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  activitiesContainer: { padding: 20 },
  activitiesIntro: { fontSize: 18, color: '#fff', textAlign: 'center', marginBottom: 20 },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  activityIcon: { fontSize: 36, marginRight: 12 },
  activityInfo: { flex: 1 },
  activityName: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  activityDesc: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  playBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  comingSoon: { textAlign: 'center', color: 'rgba(255,255,255,0.7)', marginTop: 20, fontSize: 14 },
  tipsContainer: { padding: 20 },
  tipCard: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12 },
  tipCardImportant: { borderWidth: 2, borderColor: '#F59E0B' },
  tipHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  tipIcon: { fontSize: 24 },
  tipTitle: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  importantBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  importantText: { fontSize: 10, fontWeight: '600', color: '#D97706' },
  tipText: { fontSize: 14, color: '#4B5563', lineHeight: 22 },
});
