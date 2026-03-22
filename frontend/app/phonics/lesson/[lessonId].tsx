import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Dimensions, ActivityIndicator, Alert, Animated, PanResponder
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';
import { useAppStore } from '../../../store/appStore';
import { PHONICS_LEVELS, PhonicsLesson, PhonicsActivity } from '../../../constants/PhonicsData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../../utils/api';

const { width, height } = Dimensions.get('window');

export default function PhonicsLessonScreen() {
  const router = useRouter();
  const { lessonId } = useLocalSearchParams();
  const { user } = useAppStore();
  const [lesson, setLesson] = useState<PhonicsLesson | null>(null);
  const [levelColor, setLevelColor] = useState('#667EEA');
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activityState, setActivityState] = useState<any>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recording = useRef<Audio.Recording | null>(null);

  useEffect(() => {
    loadLesson();
  }, [lessonId]);

  const loadLesson = async () => {
    try {
      // Find the lesson across all levels
      for (const level of PHONICS_LEVELS) {
        const found = level.lessons.find(l => l.id === lessonId);
        if (found) {
          setLesson(found);
          setLevelColor(level.color);
          const total = found.activities.reduce((sum, a) => sum + a.points, 0);
          setTotalPoints(total);
          initializeActivity(found.activities[0]);
          break;
        }
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeActivity = (activity: PhonicsActivity) => {
    setActivityState({
      answers: [],
      currentIndex: 0,
      isCorrect: null,
      selectedItems: []
    });
  };

  const handleAnswer = (answer: any, isCorrect: boolean) => {
    if (isCorrect) {
      setScore(prev => prev + (lesson?.activities[currentActivityIndex]?.points || 0));
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1500);
    }
    
    setActivityState((prev: any) => ({
      ...prev,
      isCorrect,
      currentIndex: prev.currentIndex + 1
    }));
  };

  const handleNextActivity = () => {
    if (currentActivityIndex < (lesson?.activities.length || 0) - 1) {
      const nextIndex = currentActivityIndex + 1;
      setCurrentActivityIndex(nextIndex);
      initializeActivity(lesson!.activities[nextIndex]);
    } else {
      completeLesson();
    }
  };

  const completeLesson = async () => {
    try {
      const saved = await AsyncStorage.getItem(`phonics_progress_${user?.user_id}`);
      if (saved) {
        const progress = JSON.parse(saved);
        if (!progress.completedLessons.includes(lessonId)) {
          progress.completedLessons.push(lessonId);
          progress.totalStars += Math.round(score / 10);
          await AsyncStorage.setItem(`phonics_progress_${user?.user_id}`, JSON.stringify(progress));
        }
      }
      
      Alert.alert(
        '🎉 Lesson Complete!',
        `You earned ${Math.round(score / 10)} stars!\nScore: ${score}/${totalPoints} points`,
        [{ text: 'Continue', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error saving progress:', error);
      router.back();
    }
  };

  const startVoiceRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recording.current = newRecording;
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopVoiceRecording = async () => {
    try {
      setIsRecording(false);
      if (recording.current) {
        await recording.current.stopAndUnloadAsync();
        const uri = recording.current.getURI();
        recording.current = null;
        
        // Here you would send to API for pronunciation check
        // For now, we'll simulate a successful check
        handleAnswer(null, true);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const speakWord = async (word: string) => {
    try {
      const response = await api.get(`/tts/word/${encodeURIComponent(word)}`, {
        responseType: 'blob'
      });
      // Play audio response
    } catch (error) {
      console.error('TTS error:', error);
    }
  };

  if (loading || !lesson) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667EEA" />
      </View>
    );
  }

  const currentActivity = lesson.activities[currentActivityIndex];
  const progressPercent = ((currentActivityIndex + 1) / lesson.activities.length) * 100;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[levelColor, adjustColor(levelColor, -30)]} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <Text style={styles.activityCount}>
            Activity {currentActivityIndex + 1} of {lesson.activities.length}
          </Text>
        </View>

        <View style={styles.scoreContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </LinearGradient>

      {/* Activity Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Animatable.View animation="fadeIn" key={currentActivity.id}>
          <Text style={styles.activityTitle}>{currentActivity.title}</Text>
          <Text style={styles.instructions}>{currentActivity.instructions}</Text>

          {/* Render activity based on type */}
          {currentActivity.type === 'matching' && (
            <MatchingActivity 
              activity={currentActivity}
              state={activityState}
              onAnswer={handleAnswer}
              levelColor={levelColor}
            />
          )}

          {currentActivity.type === 'blending' && (
            <BlendingActivity 
              activity={currentActivity}
              state={activityState}
              onAnswer={handleAnswer}
              levelColor={levelColor}
              onSpeak={speakWord}
            />
          )}

          {currentActivity.type === 'sorting' && (
            <SortingActivity 
              activity={currentActivity}
              state={activityState}
              onAnswer={handleAnswer}
              levelColor={levelColor}
            />
          )}

          {currentActivity.type === 'voice' && (
            <VoiceActivity 
              activity={currentActivity}
              state={activityState}
              onAnswer={handleAnswer}
              isRecording={isRecording}
              onStartRecording={startVoiceRecording}
              onStopRecording={stopVoiceRecording}
              levelColor={levelColor}
            />
          )}

          {currentActivity.type === 'drag-drop' && (
            <DragDropActivity 
              activity={currentActivity}
              state={activityState}
              onAnswer={handleAnswer}
              levelColor={levelColor}
            />
          )}

          {currentActivity.type === 'tracing' && (
            <TracingActivity 
              activity={currentActivity}
              state={activityState}
              onAnswer={handleAnswer}
              levelColor={levelColor}
            />
          )}

          {currentActivity.type === 'song' && (
            <SongActivity 
              activity={currentActivity}
              onComplete={() => handleAnswer(null, true)}
              levelColor={levelColor}
            />
          )}
        </Animatable.View>
      </ScrollView>

      {/* Next Button */}
      {activityState?.isCorrect !== null && (
        <Animatable.View animation="slideInUp" style={styles.nextButtonContainer}>
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: levelColor }]}
            onPress={handleNextActivity}
          >
            <Text style={styles.nextButtonText}>
              {currentActivityIndex < lesson.activities.length - 1 ? 'Next Activity' : 'Complete Lesson'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </Animatable.View>
      )}

      {/* Celebration Overlay */}
      {showCelebration && (
        <Animatable.View animation="bounceIn" style={styles.celebration}>
          <Text style={styles.celebrationText}>🎉 Correct! 🎉</Text>
        </Animatable.View>
      )}
    </View>
  );
}

// ==================== ACTIVITY COMPONENTS ====================

const MatchingActivity = ({ activity, state, onAnswer, levelColor }: any) => {
  const [selected, setSelected] = useState<any[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const data = activity.data;

  const handleSelect = (item: any, type: string) => {
    const newSelected = [...selected, { item, type }];
    setSelected(newSelected);
    
    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      let isMatch = false;
      
      if (data.pairs) {
        isMatch = data.pairs.some((p: any) => 
          (first.item === p.upper && second.item === p.lower) ||
          (first.item === p.lower && second.item === p.upper) ||
          (first.item === p.word1 && second.item === p.word2) ||
          (first.item === p.word2 && second.item === p.word1)
        );
      }
      
      if (isMatch) {
        setMatched([...matched, first.item, second.item]);
        if (matched.length + 2 >= (data.pairs?.length || 0) * 2) {
          onAnswer(null, true);
        }
      }
      
      setTimeout(() => setSelected([]), 500);
    }
  };

  const renderPairs = () => {
    if (!data.pairs) return null;
    
    return (
      <View style={activityStyles.matchingContainer}>
        <View style={activityStyles.matchColumn}>
          {data.pairs.map((pair: any, idx: number) => (
            <TouchableOpacity
              key={`left-${idx}`}
              style={[
                activityStyles.matchItem,
                selected.some(s => s.item === (pair.upper || pair.word1)) && activityStyles.matchItemSelected,
                matched.includes(pair.upper || pair.word1) && activityStyles.matchItemMatched
              ]}
              onPress={() => handleSelect(pair.upper || pair.word1, 'left')}
              disabled={matched.includes(pair.upper || pair.word1)}
            >
              <Text style={activityStyles.matchText}>{pair.upper || pair.word1}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={activityStyles.matchColumn}>
          {data.pairs.map((pair: any, idx: number) => (
            <TouchableOpacity
              key={`right-${idx}`}
              style={[
                activityStyles.matchItem,
                selected.some(s => s.item === (pair.lower || pair.word2)) && activityStyles.matchItemSelected,
                matched.includes(pair.lower || pair.word2) && activityStyles.matchItemMatched
              ]}
              onPress={() => handleSelect(pair.lower || pair.word2, 'right')}
              disabled={matched.includes(pair.lower || pair.word2)}
            >
              <Text style={activityStyles.matchText}>{pair.lower || pair.word2}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return <View>{renderPairs()}</View>;
};

const BlendingActivity = ({ activity, state, onAnswer, levelColor, onSpeak }: any) => {
  const [currentWord, setCurrentWord] = useState(0);
  const [showWord, setShowWord] = useState(false);
  const data = activity.data;
  const words = data.words || [];

  const handleBlend = () => {
    setShowWord(true);
    setTimeout(() => {
      if (currentWord < words.length - 1) {
        setCurrentWord(currentWord + 1);
        setShowWord(false);
      } else {
        onAnswer(null, true);
      }
    }, 2000);
  };

  if (words.length === 0) return null;
  const word = words[currentWord];

  return (
    <View style={activityStyles.blendingContainer}>
      <Text style={activityStyles.blendingInstruction}>Blend these sounds:</Text>
      <View style={activityStyles.segmentsRow}>
        {word.segments.map((seg: string, idx: number) => (
          <Animatable.View 
            key={idx} 
            animation="bounceIn" 
            delay={idx * 300}
            style={[activityStyles.segmentBox, { backgroundColor: levelColor }]}
          >
            <Text style={activityStyles.segmentText}>{seg}</Text>
          </Animatable.View>
        ))}
      </View>
      
      {showWord ? (
        <Animatable.Text animation="zoomIn" style={activityStyles.blendedWord}>
          {word.word}
        </Animatable.Text>
      ) : (
        <TouchableOpacity 
          style={[activityStyles.blendButton, { backgroundColor: levelColor }]}
          onPress={handleBlend}
        >
          <Ionicons name="volume-high" size={24} color="#fff" />
          <Text style={activityStyles.blendButtonText}>Blend!</Text>
        </TouchableOpacity>
      )}
      
      <Text style={activityStyles.wordCounter}>{currentWord + 1} / {words.length}</Text>
    </View>
  );
};

const SortingActivity = ({ activity, state, onAnswer, levelColor }: any) => {
  const [sorted, setSorted] = useState<{ [key: string]: string[] }>({});
  const [remaining, setRemaining] = useState<string[]>([]);
  const data = activity.data;

  useEffect(() => {
    // Initialize with shuffled words
    const allWords: string[] = [];
    const categories = data.categories || data.sounds || data.patterns || [];
    categories.forEach((cat: any) => {
      allWords.push(...(cat.words || []).slice(0, 3));
    });
    setRemaining(shuffleArray(allWords));
    
    const initialSorted: { [key: string]: string[] } = {};
    categories.forEach((cat: any) => {
      initialSorted[cat.vowel || cat.sound || cat.digraph || cat.pattern || cat.type] = [];
    });
    setSorted(initialSorted);
  }, []);

  const handleDrop = (word: string, category: string) => {
    const categories = data.categories || data.sounds || data.patterns || [];
    const correctCategory = categories.find((c: any) => 
      (c.words || []).includes(word)
    );
    
    const catKey = correctCategory?.vowel || correctCategory?.sound || correctCategory?.digraph || correctCategory?.pattern || correctCategory?.type;
    
    if (catKey === category) {
      setSorted(prev => ({
        ...prev,
        [category]: [...(prev[category] || []), word]
      }));
      setRemaining(prev => prev.filter(w => w !== word));
      
      if (remaining.length <= 1) {
        onAnswer(null, true);
      }
    }
  };

  const categories = data.categories || data.sounds || data.patterns || [];

  return (
    <View style={activityStyles.sortingContainer}>
      <View style={activityStyles.categoryRow}>
        {categories.slice(0, 3).map((cat: any, idx: number) => {
          const key = cat.vowel || cat.sound || cat.digraph || cat.pattern || cat.type;
          return (
            <TouchableOpacity
              key={idx}
              style={[activityStyles.categoryBox, { borderColor: levelColor }]}
              onPress={() => remaining.length > 0 && handleDrop(remaining[0], key)}
            >
              <Text style={[activityStyles.categoryTitle, { color: levelColor }]}>{key}</Text>
              <View style={activityStyles.categoryWords}>
                {(sorted[key] || []).map((w: string, i: number) => (
                  <Text key={i} style={activityStyles.sortedWord}>{w}</Text>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      
      <Text style={activityStyles.sortingInstruction}>Tap a category to sort:</Text>
      <View style={activityStyles.wordsToSort}>
        {remaining.slice(0, 1).map((word, idx) => (
          <Animatable.View 
            key={word} 
            animation="pulse" 
            iterationCount="infinite"
            style={[activityStyles.wordToSort, { backgroundColor: levelColor }]}
          >
            <Text style={activityStyles.wordToSortText}>{word}</Text>
          </Animatable.View>
        ))}
      </View>
    </View>
  );
};

const VoiceActivity = ({ activity, state, onAnswer, isRecording, onStartRecording, onStopRecording, levelColor }: any) => {
  const [currentPrompt, setCurrentPrompt] = useState(0);
  const data = activity.data;
  const prompts = data.letters || data.vowels || data.prompts || data.words || [];

  const handleVoiceCheck = () => {
    if (isRecording) {
      onStopRecording();
      if (currentPrompt < prompts.length - 1) {
        setCurrentPrompt(currentPrompt + 1);
      } else {
        onAnswer(null, true);
      }
    } else {
      onStartRecording();
    }
  };

  if (prompts.length === 0) return null;
  const prompt = prompts[currentPrompt];

  return (
    <View style={activityStyles.voiceContainer}>
      <Animatable.View animation="bounceIn" style={activityStyles.voicePromptCard}>
        <Text style={activityStyles.voicePromptLetter}>
          {prompt.letter || prompt.digraph || prompt.word || prompt.given || '?'}
        </Text>
        {prompt.sound && (
          <Text style={activityStyles.voicePromptSound}>Sound: {prompt.sound}</Text>
        )}
        {prompt.example && (
          <Text style={activityStyles.voicePromptExample}>Like in: {prompt.example}</Text>
        )}
      </Animatable.View>

      <TouchableOpacity
        style={[
          activityStyles.recordButton,
          isRecording && activityStyles.recordButtonActive,
          { backgroundColor: isRecording ? '#EF4444' : levelColor }
        ]}
        onPress={handleVoiceCheck}
      >
        <Ionicons name={isRecording ? 'stop' : 'mic'} size={40} color="#fff" />
        <Text style={activityStyles.recordButtonText}>
          {isRecording ? 'Stop' : 'Say the Sound'}
        </Text>
      </TouchableOpacity>

      <Text style={activityStyles.voiceCounter}>{currentPrompt + 1} / {prompts.length}</Text>
    </View>
  );
};

const DragDropActivity = ({ activity, state, onAnswer, levelColor }: any) => {
  const [currentWord, setCurrentWord] = useState(0);
  const [placedLetters, setPlacedLetters] = useState<string[]>([]);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const data = activity.data;
  const words = data.words || [];

  useEffect(() => {
    if (words.length > 0) {
      setAvailableLetters(shuffleArray([...words[currentWord].letters]));
      setPlacedLetters([]);
    }
  }, [currentWord]);

  const handleLetterPress = (letter: string, index: number) => {
    const newPlaced = [...placedLetters, letter];
    setPlacedLetters(newPlaced);
    setAvailableLetters(prev => prev.filter((_, i) => i !== index));
    
    if (newPlaced.length === words[currentWord].letters.length) {
      const isCorrect = newPlaced.join('') === words[currentWord].word;
      if (isCorrect) {
        if (currentWord < words.length - 1) {
          setTimeout(() => {
            setCurrentWord(currentWord + 1);
          }, 1000);
        } else {
          onAnswer(null, true);
        }
      } else {
        // Reset
        setAvailableLetters(shuffleArray([...words[currentWord].letters]));
        setPlacedLetters([]);
      }
    }
  };

  if (words.length === 0) return null;
  const word = words[currentWord];

  return (
    <View style={activityStyles.dragDropContainer}>
      <Text style={activityStyles.dragDropInstruction}>Build the word:</Text>
      
      {/* Drop Zone */}
      <View style={activityStyles.dropZone}>
        {word.letters.map((_: string, idx: number) => (
          <View 
            key={idx} 
            style={[
              activityStyles.dropSlot,
              placedLetters[idx] && { backgroundColor: levelColor }
            ]}
          >
            <Text style={activityStyles.dropSlotText}>
              {placedLetters[idx] || '_'}
            </Text>
          </View>
        ))}
      </View>

      {/* Available Letters */}
      <View style={activityStyles.lettersRow}>
        {availableLetters.map((letter, idx) => (
          <TouchableOpacity
            key={idx}
            style={[activityStyles.letterButton, { borderColor: levelColor }]}
            onPress={() => handleLetterPress(letter, idx)}
          >
            <Text style={[activityStyles.letterButtonText, { color: levelColor }]}>{letter}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={activityStyles.wordCounter}>{currentWord + 1} / {words.length}</Text>
    </View>
  );
};

const TracingActivity = ({ activity, onAnswer, levelColor }: any) => {
  const [currentLetter, setCurrentLetter] = useState(0);
  const data = activity.data;
  const letters = data.letters || [];

  const handleTrace = () => {
    if (currentLetter < letters.length - 1) {
      setCurrentLetter(currentLetter + 1);
    } else {
      onAnswer(null, true);
    }
  };

  return (
    <View style={activityStyles.tracingContainer}>
      <Text style={activityStyles.tracingInstruction}>Trace the letter with your finger:</Text>
      
      <Animatable.View animation="pulse" iterationCount="infinite" style={activityStyles.tracingArea}>
        <Text style={[activityStyles.tracingLetter, { color: levelColor }]}>
          {letters[currentLetter]}
        </Text>
        <View style={activityStyles.tracingGuide}>
          <Text style={activityStyles.tracingGuideText}>Trace Here</Text>
        </View>
      </Animatable.View>

      <TouchableOpacity
        style={[activityStyles.tracingDoneButton, { backgroundColor: levelColor }]}
        onPress={handleTrace}
      >
        <Ionicons name="checkmark" size={24} color="#fff" />
        <Text style={activityStyles.tracingDoneText}>Done!</Text>
      </TouchableOpacity>

      <Text style={activityStyles.letterCounter}>{currentLetter + 1} / {letters.length}</Text>
    </View>
  );
};

const SongActivity = ({ activity, onComplete, levelColor }: any) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const data = activity.data;

  return (
    <View style={activityStyles.songContainer}>
      <Animatable.Text animation="swing" iterationCount="infinite" style={activityStyles.songEmoji}>
        🎵
      </Animatable.Text>
      
      <Text style={activityStyles.songTitle}>{data.title || 'Song Time!'}</Text>
      
      <View style={activityStyles.lyricsCard}>
        <Text style={activityStyles.lyricsText}>{data.lyrics}</Text>
      </View>

      <TouchableOpacity
        style={[activityStyles.singButton, { backgroundColor: levelColor }]}
        onPress={() => {
          setIsPlaying(true);
          setTimeout(() => {
            setIsPlaying(false);
            onComplete();
          }, 3000);
        }}
      >
        <Ionicons name={isPlaying ? 'pause' : 'play'} size={28} color="#fff" />
        <Text style={activityStyles.singButtonText}>
          {isPlaying ? 'Singing...' : 'Sing Along!'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Helper functions
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

// Main styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: { paddingTop: 50, paddingBottom: 16, paddingHorizontal: 20 },
  backButton: { position: 'absolute', top: 50, left: 16, zIndex: 10, padding: 8 },
  headerCenter: { alignItems: 'center', marginTop: 10 },
  lessonTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  progressBar: { width: width * 0.6, height: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 4, marginTop: 12, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 4 },
  activityCount: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 6 },
  scoreContainer: { position: 'absolute', top: 54, right: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  scoreText: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginLeft: 6 },
  
  content: { flex: 1 },
  contentContainer: { padding: 20 },
  activityTitle: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', textAlign: 'center' },
  instructions: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8, marginBottom: 24 },
  
  nextButtonContainer: { padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  nextButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 16, borderRadius: 12 },
  nextButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginRight: 8 },
  
  celebration: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  celebrationText: { fontSize: 40, fontWeight: 'bold', color: '#fff' },
});

// Activity-specific styles
const activityStyles = StyleSheet.create({
  // Matching
  matchingContainer: { flexDirection: 'row', justifyContent: 'space-around' },
  matchColumn: { flex: 1, padding: 8 },
  matchItem: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 10, alignItems: 'center', borderWidth: 2, borderColor: '#E5E7EB', elevation: 2 },
  matchItemSelected: { borderColor: '#667EEA', backgroundColor: '#EEF2FF' },
  matchItemMatched: { borderColor: '#10B981', backgroundColor: '#D1FAE5' },
  matchText: { fontSize: 20, fontWeight: 'bold', color: '#1F2937' },
  
  // Blending
  blendingContainer: { alignItems: 'center', padding: 20 },
  blendingInstruction: { fontSize: 16, color: '#6B7280', marginBottom: 20 },
  segmentsRow: { flexDirection: 'row', marginBottom: 30 },
  segmentBox: { width: 60, height: 60, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginHorizontal: 8 },
  segmentText: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  blendedWord: { fontSize: 48, fontWeight: 'bold', color: '#1F2937' },
  blendButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30 },
  blendButtonText: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginLeft: 10 },
  wordCounter: { fontSize: 14, color: '#9CA3AF', marginTop: 20 },
  
  // Sorting
  sortingContainer: { padding: 10 },
  categoryRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  categoryBox: { flex: 1, marginHorizontal: 4, padding: 12, borderRadius: 12, borderWidth: 2, minHeight: 120, backgroundColor: '#fff' },
  categoryTitle: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  categoryWords: { alignItems: 'center' },
  sortedWord: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  sortingInstruction: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 16 },
  wordsToSort: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  wordToSort: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 20, margin: 4 },
  wordToSortText: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  
  // Voice
  voiceContainer: { alignItems: 'center', padding: 20 },
  voicePromptCard: { backgroundColor: '#fff', padding: 30, borderRadius: 20, alignItems: 'center', marginBottom: 30, elevation: 4, width: '100%' },
  voicePromptLetter: { fontSize: 72, fontWeight: 'bold', color: '#1F2937' },
  voicePromptSound: { fontSize: 18, color: '#6B7280', marginTop: 10 },
  voicePromptExample: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },
  recordButton: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center' },
  recordButtonActive: { transform: [{ scale: 1.1 }] },
  recordButtonText: { fontSize: 12, color: '#fff', marginTop: 8, fontWeight: '600' },
  voiceCounter: { fontSize: 14, color: '#9CA3AF', marginTop: 20 },
  
  // Drag Drop
  dragDropContainer: { alignItems: 'center', padding: 20 },
  dragDropInstruction: { fontSize: 16, color: '#6B7280', marginBottom: 20 },
  dropZone: { flexDirection: 'row', marginBottom: 30 },
  dropSlot: { width: 50, height: 60, borderRadius: 8, borderWidth: 2, borderColor: '#E5E7EB', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginHorizontal: 4, backgroundColor: '#F9FAFB' },
  dropSlotText: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  lettersRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  letterButton: { width: 50, height: 50, borderRadius: 8, borderWidth: 2, justifyContent: 'center', alignItems: 'center', margin: 6, backgroundColor: '#fff' },
  letterButtonText: { fontSize: 24, fontWeight: 'bold' },
  
  // Tracing
  tracingContainer: { alignItems: 'center', padding: 20 },
  tracingInstruction: { fontSize: 16, color: '#6B7280', marginBottom: 20 },
  tracingArea: { width: 200, height: 200, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 4, marginBottom: 30 },
  tracingLetter: { fontSize: 120, fontWeight: 'bold', opacity: 0.3 },
  tracingGuide: { position: 'absolute', bottom: 10 },
  tracingGuideText: { fontSize: 12, color: '#9CA3AF' },
  tracingDoneButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30 },
  tracingDoneText: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginLeft: 8 },
  letterCounter: { fontSize: 14, color: '#9CA3AF', marginTop: 20 },
  
  // Song
  songContainer: { alignItems: 'center', padding: 20 },
  songEmoji: { fontSize: 60, marginBottom: 16 },
  songTitle: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 20 },
  lyricsCard: { backgroundColor: '#fff', padding: 20, borderRadius: 16, width: '100%', marginBottom: 30 },
  lyricsText: { fontSize: 16, color: '#4B5563', lineHeight: 24, textAlign: 'center' },
  singButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30 },
  singButtonText: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginLeft: 10 },
});
