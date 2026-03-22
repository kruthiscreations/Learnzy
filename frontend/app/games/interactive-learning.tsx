import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, Animated, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Animatable from 'react-native-animatable';
import { useAppStore } from '../../store/appStore';
import { LKG_LEARNING_CATEGORIES, COLOR_CARDS, FAMILY_CARDS, BODY_PARTS_CARDS, SHAPES_CARDS } from '../../constants/InteractiveContent';
import api from '../../utils/api';

const { width, height } = Dimensions.get('window');

export default function InteractiveLearningScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAppStore();
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  
  // Animation refs
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const flipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Setup audio
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    // Start bounce animation
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
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const bounceTranslate = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const getCurrentCards = () => {
    switch (currentCategory) {
      case 'colors': return COLOR_CARDS;
      case 'family': return FAMILY_CARDS;
      case 'body': return BODY_PARTS_CARDS;
      case 'shapes': return SHAPES_CARDS;
      default: return [];
    }
  };

  const currentCards = getCurrentCards();
  const currentCard = currentCards[currentCardIndex];

  // Speak the word using TTS
  const speakWord = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);

    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      }

      const response = await api.post('/tts/speak-base64', {
        text: text,
        voice: 'nova',
        speed: 0.85,
      });

      const audioBase64 = response.data.audio_base64;
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mp3;base64,${audioBase64}` },
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

  const handleCardTap = () => {
    // Animate scale
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setShowAnswer(!showAnswer);
    if (!showAnswer && currentCard) {
      speakWord(currentCard.name);
    }
  };

  const handleNext = () => {
    if (currentCardIndex < currentCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setShowAnswer(false);
    } else {
      // Completed all cards in category
      setScore(score + 10);
      setCurrentCategory(null);
      setCurrentCardIndex(0);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleSelectCategory = (categoryId: string) => {
    setCurrentCategory(categoryId);
    setCurrentCardIndex(0);
    setShowAnswer(false);
  };

  // Category Selection Screen
  if (!currentCategory) {
    return (
      <LinearGradient
        colors={['#667EEA', '#764BA2', '#F093FB']}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Learn & Play! 🎨</Text>
          <View style={styles.scoreContainer}>
            <Ionicons name="star" size={20} color="#FFD700" />
            <Text style={styles.scoreText}>{score}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>What do you want to learn today?</Text>
          
          <View style={styles.categoriesGrid}>
            {LKG_LEARNING_CATEGORIES.map((category, index) => (
              <Animatable.View
                key={category.id}
                animation="fadeInUp"
                delay={index * 100}
              >
                <TouchableOpacity
                  style={[styles.categoryCard, { backgroundColor: category.color }]}
                  onPress={() => handleSelectCategory(category.id)}
                  data-testid={`category-${category.id}`}
                >
                  <Animated.View style={{ transform: [{ translateY: bounceTranslate }] }}>
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                  </Animated.View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryDesc}>{category.description}</Text>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{category.cards.length} cards</Text>
                  </View>
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  // Interactive Card View
  const categoryInfo = LKG_LEARNING_CATEGORIES.find(c => c.id === currentCategory);

  return (
    <LinearGradient
      colors={[categoryInfo?.color || '#667EEA', '#764BA2']}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCurrentCategory(null)} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryInfo?.name} {categoryInfo?.icon}</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentCardIndex + 1} / {currentCards.length}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${((currentCardIndex + 1) / currentCards.length) * 100}%` }
          ]} 
        />
      </View>

      {/* Interactive Card */}
      <View style={styles.cardContainer}>
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={handleCardTap}
        >
          <Animated.View 
            style={[
              styles.card,
              { transform: [{ scale: scaleAnim }] }
            ]}
          >
            {/* Card Image */}
            {currentCard?.image && (
              <Animatable.View animation="pulse" iterationCount="infinite" duration={2000}>
                <Image
                  source={{ uri: currentCard.image }}
                  style={styles.cardImage}
                  resizeMode="contain"
                />
              </Animatable.View>
            )}

            {/* Color Display for Colors Category */}
            {currentCategory === 'colors' && currentCard && (
              <View 
                style={[
                  styles.colorCircle, 
                  { backgroundColor: currentCard.color }
                ]} 
              />
            )}

            {/* Shape Display */}
            {currentCategory === 'shapes' && currentCard && !currentCard.image && (
              <View style={styles.shapeContainer}>
                {currentCard.id === 'circle' && (
                  <View style={[styles.shapeCircle, { backgroundColor: currentCard.color }]} />
                )}
                {currentCard.id === 'square' && (
                  <View style={[styles.shapeSquare, { backgroundColor: currentCard.color }]} />
                )}
                {currentCard.id === 'triangle' && (
                  <View style={[styles.shapeTriangle, { borderBottomColor: currentCard.color }]} />
                )}
                {currentCard.id === 'rectangle' && (
                  <View style={[styles.shapeRectangle, { backgroundColor: currentCard.color }]} />
                )}
                {currentCard.id === 'star' && (
                  <Text style={[styles.shapeEmoji, { color: currentCard.color }]}>⭐</Text>
                )}
                {currentCard.id === 'heart' && (
                  <Text style={[styles.shapeEmoji, { color: currentCard.color }]}>❤️</Text>
                )}
              </View>
            )}

            {/* Question */}
            <Text style={styles.questionText}>
              {currentCard?.question || 'Tap to see!'}
            </Text>

            {/* Answer (shown on tap) */}
            {showAnswer && currentCard && (
              <Animatable.View animation="fadeInUp" duration={300}>
                <Text style={styles.answerText}>{currentCard.name}</Text>
                {currentCard.telugu && (
                  <Text style={styles.translationText}>
                    {currentCard.telugu} • {currentCard.hindi}
                  </Text>
                )}
                {currentCard.description && (
                  <Text style={styles.descriptionText}>{currentCard.description}</Text>
                )}
                {currentCard.examples && (
                  <Text style={styles.examplesText}>
                    Examples: {currentCard.examples.slice(0, 3).join(', ')}
                  </Text>
                )}
                {currentCard.action && (
                  <Text style={styles.actionText}>{currentCard.action}</Text>
                )}
                {currentCard.song && (
                  <View style={styles.songContainer}>
                    <Text style={styles.songText}>{currentCard.song}</Text>
                  </View>
                )}
              </Animatable.View>
            )}

            {/* Tap hint */}
            {!showAnswer && (
              <Text style={styles.tapHint}>👆 Tap to see the answer!</Text>
            )}
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Speaker Button */}
      <TouchableOpacity
        style={[styles.speakerButton, isSpeaking && styles.speakerButtonActive]}
        onPress={() => currentCard && speakWord(currentCard.name)}
        disabled={isSpeaking}
        data-testid="speaker-button"
      >
        {isSpeaking ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="volume-high" size={24} color="#fff" />
            <Text style={styles.speakerText}>Listen</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentCardIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={currentCardIndex === 0}
        >
          <Ionicons name="chevron-back" size={32} color={currentCardIndex === 0 ? '#999' : '#fff'} />
          <Text style={[styles.navText, currentCardIndex === 0 && styles.navTextDisabled]}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButtonPrimary}
          onPress={handleNext}
        >
          <Text style={styles.navTextPrimary}>
            {currentCardIndex === currentCards.length - 1 ? 'Finish! 🎉' : 'Next'}
          </Text>
          <Ionicons name="chevron-forward" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  scoreText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  progressContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  progressText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 20,
    borderRadius: 4,
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  categoriesContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  categoryCard: {
    width: (width - 56) / 2,
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  categoryDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: width - 40,
    minHeight: 400,
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardImage: {
    width: 200,
    height: 200,
    marginBottom: 16,
  },
  colorCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  shapeContainer: {
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shapeCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  shapeSquare: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  shapeTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 50,
    borderRightWidth: 50,
    borderBottomWidth: 100,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  shapeRectangle: {
    width: 140,
    height: 80,
    borderRadius: 8,
  },
  shapeEmoji: {
    fontSize: 80,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '600',
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 16,
  },
  answerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  translationText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  examplesText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 16,
    color: '#10B981',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 8,
  },
  songContainer: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  songText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
  },
  tapHint: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
  speakerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 80,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    marginBottom: 16,
  },
  speakerButtonActive: {
    backgroundColor: '#10B981',
  },
  speakerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  navTextDisabled: {
    color: '#999',
  },
  navButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    borderRadius: 30,
    gap: 4,
  },
  navTextPrimary: {
    color: '#1F2937',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
