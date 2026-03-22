import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Image } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { CHARACTERS } from '../constants/AppData';

const { width, height } = Dimensions.get('window');

interface CelebrationModalProps {
  visible: boolean;
  type: 'correct' | 'almost' | 'effort';
  message: string;
  emoji: string;
  animation: string;
  characterId?: string;
  onComplete?: () => void;
}

// Custom animations for celebrations
const customAnimations = {
  highFive: {
    0: { scale: 0.5, rotate: '0deg', opacity: 0 },
    0.3: { scale: 1.2, rotate: '-15deg', opacity: 1 },
    0.5: { scale: 1, rotate: '15deg' },
    0.7: { scale: 1.1, rotate: '-10deg' },
    1: { scale: 1, rotate: '0deg', opacity: 1 },
  },
  sparkle: {
    0: { scale: 0, opacity: 0 },
    0.2: { scale: 1.3, opacity: 1 },
    0.4: { scale: 0.9 },
    0.6: { scale: 1.1 },
    0.8: { scale: 1 },
    1: { scale: 1, opacity: 1 },
  },
  confetti: {
    0: { translateY: -50, opacity: 0, rotate: '0deg' },
    0.3: { translateY: 0, opacity: 1, rotate: '180deg' },
    0.6: { translateY: 10, rotate: '360deg' },
    1: { translateY: 0, opacity: 1, rotate: '540deg' },
  },
};

export default function CelebrationModal({
  visible,
  type,
  message,
  emoji,
  animation,
  characterId = 'cat',
  onComplete,
}: CelebrationModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const character = CHARACTERS[characterId as keyof typeof CHARACTERS];

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }).start();

      // Auto-hide after 2.5 seconds
      const timer = setTimeout(() => {
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onComplete?.();
        });
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const getBackgroundColor = () => {
    switch (type) {
      case 'correct':
        return 'rgba(16, 185, 129, 0.95)'; // Green
      case 'almost':
        return 'rgba(245, 158, 11, 0.95)'; // Orange
      case 'effort':
        return 'rgba(139, 92, 246, 0.95)'; // Purple
      default:
        return 'rgba(102, 126, 234, 0.95)';
    }
  };

  return (
    <Animated.View
      style={[
        styles.overlay,
        { backgroundColor: getBackgroundColor(), transform: [{ scale: scaleAnim }] },
      ]}
    >
      {/* Confetti/Stars Background */}
      {type === 'correct' && (
        <>
          <Animatable.Text animation="fadeInDown" delay={100} style={[styles.confetti, { top: '10%', left: '10%' }]}>⭐</Animatable.Text>
          <Animatable.Text animation="fadeInDown" delay={200} style={[styles.confetti, { top: '15%', right: '15%' }]}>🌟</Animatable.Text>
          <Animatable.Text animation="fadeInDown" delay={300} style={[styles.confetti, { top: '20%', left: '20%' }]}>✨</Animatable.Text>
          <Animatable.Text animation="fadeInDown" delay={400} style={[styles.confetti, { top: '12%', right: '25%' }]}>🎊</Animatable.Text>
          <Animatable.Text animation="fadeInDown" delay={500} style={[styles.confetti, { bottom: '25%', left: '15%' }]}>🎉</Animatable.Text>
          <Animatable.Text animation="fadeInDown" delay={600} style={[styles.confetti, { bottom: '20%', right: '10%' }]}>💫</Animatable.Text>
        </>
      )}

      {/* Character with expression */}
      <Animatable.View animation={animation} duration={1000} style={styles.characterContainer}>
        <Image
          source={{ uri: character?.expressions?.success || character?.expressions?.speaking }}
          style={styles.characterImage}
          resizeMode="contain"
        />
      </Animatable.View>

      {/* Main Emoji */}
      <Animatable.Text animation="bounceIn" delay={300} style={styles.mainEmoji}>
        {emoji}
      </Animatable.Text>

      {/* Message */}
      <Animatable.View animation="fadeInUp" delay={500} style={styles.messageContainer}>
        <Text style={styles.message}>{message}</Text>
      </Animatable.View>

      {/* High-Five Animation for effort celebrations */}
      {(type === 'effort' || type === 'almost') && (
        <Animatable.View animation="pulse" iterationCount="infinite" style={styles.highFiveContainer}>
          <Text style={styles.highFiveEmoji}>🙌</Text>
          <Text style={styles.highFiveText}>
            {type === 'effort' ? 'Mistakes help us grow!' : 'So close!'}
          </Text>
        </Animatable.View>
      )}

      {/* Growth Mindset Badge */}
      {type === 'effort' && (
        <Animatable.View animation="zoomIn" delay={800} style={styles.growthBadge}>
          <Text style={styles.growthBadgeText}>🧠 Brain Power +1!</Text>
        </Animatable.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  confetti: {
    position: 'absolute',
    fontSize: 32,
  },
  characterContainer: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  mainEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  messageContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 16,
    maxWidth: width * 0.85,
    marginBottom: 16,
  },
  message: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    lineHeight: 30,
  },
  highFiveContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  highFiveEmoji: {
    fontSize: 48,
  },
  highFiveText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginTop: 8,
  },
  growthBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 16,
  },
  growthBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
