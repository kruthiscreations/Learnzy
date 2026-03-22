import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Image, Dimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { CHARACTERS } from '../constants/AppData';
import { 
  SIDEKICK_EXPRESSIONS, 
  SidekickState, 
  getSidekickStateFromMessage 
} from '../constants/CelebrationSystem';

const { width } = Dimensions.get('window');

interface SidekickAnimationProps {
  characterId: string;
  state: SidekickState;
  size?: 'small' | 'medium' | 'large';
  showGesture?: boolean;
  onStateChange?: (state: SidekickState) => void;
}

// Custom Rive-style animations for each state
const stateAnimations: Record<SidekickState, object> = {
  idle: {
    0: { transform: [{ translateY: 0 }] },
    0.5: { transform: [{ translateY: -5 }] },
    1: { transform: [{ translateY: 0 }] },
  },
  thinking: {
    0: { transform: [{ rotate: '0deg' }] },
    0.25: { transform: [{ rotate: '-5deg' }] },
    0.5: { transform: [{ rotate: '5deg' }] },
    0.75: { transform: [{ rotate: '-3deg' }] },
    1: { transform: [{ rotate: '0deg' }] },
  },
  speaking: {
    0: { transform: [{ scale: 1 }] },
    0.1: { transform: [{ scale: 1.05 }] },
    0.2: { transform: [{ scale: 1 }] },
    0.3: { transform: [{ scale: 1.03 }] },
    0.4: { transform: [{ scale: 1 }] },
    0.5: { transform: [{ scale: 1.05 }] },
    0.6: { transform: [{ scale: 1 }] },
    0.7: { transform: [{ scale: 1.03 }] },
    0.8: { transform: [{ scale: 1 }] },
    0.9: { transform: [{ scale: 1.02 }] },
    1: { transform: [{ scale: 1 }] },
  },
  listening: {
    0: { transform: [{ translateY: 0 }, { scale: 1 }] },
    0.5: { transform: [{ translateY: -3 }, { scale: 1.02 }] },
    1: { transform: [{ translateY: 0 }, { scale: 1 }] },
  },
  celebrating: {
    0: { transform: [{ translateY: 0 }, { rotate: '0deg' }] },
    0.2: { transform: [{ translateY: -20 }, { rotate: '-10deg' }] },
    0.4: { transform: [{ translateY: 0 }, { rotate: '10deg' }] },
    0.6: { transform: [{ translateY: -15 }, { rotate: '-5deg' }] },
    0.8: { transform: [{ translateY: 0 }, { rotate: '5deg' }] },
    1: { transform: [{ translateY: 0 }, { rotate: '0deg' }] },
  },
  confused: {
    0: { transform: [{ rotate: '0deg' }] },
    0.3: { transform: [{ rotate: '-15deg' }] },
    0.6: { transform: [{ rotate: '15deg' }] },
    1: { transform: [{ rotate: '0deg' }] },
  },
  surprised: {
    0: { transform: [{ scale: 1 }] },
    0.3: { transform: [{ scale: 1.2 }] },
    0.6: { transform: [{ scale: 0.95 }] },
    1: { transform: [{ scale: 1 }] },
  },
  encouraging: {
    0: { transform: [{ translateY: 0 }] },
    0.3: { transform: [{ translateY: -10 }] },
    0.6: { transform: [{ translateY: 5 }] },
    1: { transform: [{ translateY: 0 }] },
  },
  highfive: {
    0: { transform: [{ rotate: '0deg' }, { scale: 1 }] },
    0.3: { transform: [{ rotate: '-20deg' }, { scale: 1.1 }] },
    0.5: { transform: [{ rotate: '20deg' }, { scale: 1.2 }] },
    0.7: { transform: [{ rotate: '-10deg' }, { scale: 1.1 }] },
    1: { transform: [{ rotate: '0deg' }, { scale: 1 }] },
  },
};

// Register custom animations
Object.entries(stateAnimations).forEach(([name, animation]) => {
  Animatable.initializeRegistryWithDefinitions({ [name]: animation });
});

// Gesture indicators
const GestureIndicator: React.FC<{ gesture?: string }> = ({ gesture }) => {
  if (!gesture) return null;
  
  const gestureEmojis: Record<string, string> = {
    wave: '👋',
    scratch_head: '🤔',
    talk: '💬',
    ear_cup: '👂',
    jump: '🎉',
    shrug: '🤷',
    gasp: '😲',
    thumbs_up: '👍',
    high_five: '🙌',
  };
  
  return (
    <Animatable.View animation="bounceIn" style={styles.gestureContainer}>
      <Animatable.Text animation="pulse" iterationCount="infinite" style={styles.gestureEmoji}>
        {gestureEmojis[gesture] || ''}
      </Animatable.Text>
    </Animatable.View>
  );
};

// Eye animation overlay (simulates eye movement)
const EyeAnimation: React.FC<{ state: SidekickState }> = ({ state }) => {
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (state === 'thinking') {
        // Look up-left when thinking
        setEyePosition({ x: -3, y: -5 });
      } else if (state === 'listening') {
        // Look at user
        setEyePosition({ x: 0, y: 0 });
      } else {
        // Random micro-movements for liveliness
        setEyePosition({
          x: Math.random() * 4 - 2,
          y: Math.random() * 4 - 2,
        });
      }
    }, state === 'speaking' ? 200 : 500);
    
    return () => clearInterval(interval);
  }, [state]);
  
  return null; // Eye animation is simulated through state changes
};

// Lip sync indicator (for when speaking with audio)
const LipSyncIndicator: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  if (!isActive) return null;
  
  return (
    <Animatable.View 
      animation="pulse" 
      iterationCount="infinite" 
      duration={200}
      style={styles.lipSyncIndicator}
    >
      <View style={styles.lipSyncDot} />
    </Animatable.View>
  );
};

export default function SidekickAnimation({
  characterId,
  state,
  size = 'medium',
  showGesture = true,
  onStateChange,
}: SidekickAnimationProps) {
  const character = CHARACTERS[characterId as keyof typeof CHARACTERS];
  const expression = SIDEKICK_EXPRESSIONS[state];
  const animationRef = useRef<Animatable.View>(null);
  
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);
  
  const sizeStyles = {
    small: { width: 80, height: 80 },
    medium: { width: 120, height: 120 },
    large: { width: 180, height: 180 },
  };
  
  // Get the appropriate expression image
  const getExpressionImage = () => {
    const expressionMap: Record<SidekickState, string> = {
      idle: 'speaking',
      thinking: 'thinking',
      speaking: 'speaking',
      listening: 'listening',
      celebrating: 'success',
      confused: 'confused',
      surprised: 'success',
      encouraging: 'speaking',
      highfive: 'success',
    };
    const expressionKey = expressionMap[state] as keyof typeof character.expressions;
    return character?.expressions?.[expressionKey] || character?.expressions?.speaking;
  };
  
  if (!character) return null;
  
  return (
    <View style={[styles.container, sizeStyles[size]]}>
      {/* Main character with state-based animation */}
      <Animatable.View
        ref={animationRef}
        animation={state}
        iterationCount={state === 'idle' || state === 'speaking' ? 'infinite' : 1}
        duration={expression.duration}
        style={styles.characterWrapper}
      >
        <Image
          source={{ uri: getExpressionImage() }}
          style={[styles.characterImage, sizeStyles[size]]}
          resizeMode="contain"
        />
        
        {/* Sparkle overlay for success states */}
        {(state === 'celebrating' || state === 'highfive') && (
          <>
            <Animatable.Text animation="fadeIn" delay={100} style={[styles.sparkle, { top: -10, left: 0 }]}>✨</Animatable.Text>
            <Animatable.Text animation="fadeIn" delay={200} style={[styles.sparkle, { top: 0, right: -10 }]}>⭐</Animatable.Text>
            <Animatable.Text animation="fadeIn" delay={300} style={[styles.sparkle, { bottom: 10, left: -5 }]}>💫</Animatable.Text>
          </>
        )}
        
        {/* Thinking bubbles */}
        {state === 'thinking' && (
          <View style={styles.thinkingBubbles}>
            <Animatable.View animation="fadeIn" delay={0} style={[styles.thinkBubble, styles.thinkBubble1]} />
            <Animatable.View animation="fadeIn" delay={200} style={[styles.thinkBubble, styles.thinkBubble2]} />
            <Animatable.View animation="fadeIn" delay={400} style={[styles.thinkBubble, styles.thinkBubble3]} />
          </View>
        )}
      </Animatable.View>
      
      {/* Gesture indicator */}
      {showGesture && <GestureIndicator gesture={expression.gesture} />}
      
      {/* Lip sync indicator */}
      <LipSyncIndicator isActive={state === 'speaking'} />
      
      {/* Eye animation component */}
      <EyeAnimation state={state} />
    </View>
  );
}

// Helper hook to manage sidekick state based on conversation
export function useSidekickState(initialState: SidekickState = 'idle') {
  const [state, setState] = useState<SidekickState>(initialState);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const setStateWithTimeout = (newState: SidekickState, duration?: number) => {
    setState(newState);
    
    if (duration) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setState('idle');
      }, duration);
    }
  };
  
  const setStateFromMessage = (message: string) => {
    const newState = getSidekickStateFromMessage(message);
    setStateWithTimeout(newState, 3000);
  };
  
  return {
    state,
    setState: setStateWithTimeout,
    setStateFromMessage,
  };
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  characterWrapper: {
    width: '100%',
    height: '100%',
  },
  characterImage: {
    width: '100%',
    height: '100%',
  },
  gestureContainer: {
    position: 'absolute',
    bottom: -20,
    right: -10,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    padding: 8,
  },
  gestureEmoji: {
    fontSize: 20,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 18,
  },
  thinkingBubbles: {
    position: 'absolute',
    top: -20,
    right: -15,
  },
  thinkBubble: {
    backgroundColor: '#E5E7EB',
    borderRadius: 50,
  },
  thinkBubble1: {
    width: 8,
    height: 8,
    marginBottom: 3,
    marginLeft: 10,
  },
  thinkBubble2: {
    width: 12,
    height: 12,
    marginBottom: 3,
    marginLeft: 5,
  },
  thinkBubble3: {
    width: 20,
    height: 20,
  },
  lipSyncIndicator: {
    position: 'absolute',
    bottom: 30,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 10,
    padding: 4,
  },
  lipSyncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
});
