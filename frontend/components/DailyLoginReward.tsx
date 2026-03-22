import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  Animated, Easing, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppStore } from '../store/appStore';

const { width } = Dimensions.get('window');

const STICKERS = ['⭐', '🌟', '🏆', '🎖️', '💎', '🦁', '🚀', '🎯', '🌈', '🔥'];
const STREAK_MESSAGES: Record<number, { title: string; msg: string; emoji: string }> = {
  1:  { title: 'Welcome Back!',      msg: 'Great to see you today!',              emoji: '👋' },
  2:  { title: '2 Days Strong!',     msg: 'Keep the learning going!',             emoji: '💪' },
  3:  { title: '3-Day Streak! 🔥',   msg: 'You\'re on fire! Amazing work!',       emoji: '🔥' },
  5:  { title: 'High Five! ✋',       msg: '5 days of English practice!',          emoji: '✋' },
  7:  { title: 'One Full Week! 🏆',  msg: 'A whole week — you\'re a champion!',   emoji: '🏆' },
  10: { title: '10-Day Legend! 👑',  msg: 'Double digits — incredible!',          emoji: '👑' },
  14: { title: '2 Weeks! 🌟',        msg: 'Two weeks of daily learning!',         emoji: '🌟' },
  21: { title: '3-Week Master! 💎',  msg: 'Language mastery takes 21 days — done!', emoji: '💎' },
  30: { title: '30-Day Hero! 🚀',    msg: 'One month of daily English practice!', emoji: '🚀' },
};

function getStreakMessage(streak: number) {
  const keys = Object.keys(STREAK_MESSAGES).map(Number).sort((a, b) => b - a);
  for (const k of keys) {
    if (streak >= k) return STREAK_MESSAGES[k];
  }
  return STREAK_MESSAGES[1];
}

// Virtual pet growth based on streak
function getPetStage(streak: number): { emoji: string; label: string } {
  if (streak >= 30) return { emoji: '🦁', label: 'Mighty Lion!' };
  if (streak >= 21) return { emoji: '🐯', label: 'Brave Tiger!' };
  if (streak >= 14) return { emoji: '🐺', label: 'Wild Wolf!' };
  if (streak >= 7)  return { emoji: '🦊', label: 'Clever Fox!' };
  if (streak >= 3)  return { emoji: '🐱', label: 'Happy Cat!' };
  return { emoji: '🐣', label: 'Baby Chick!' };
}

function getTodayKey() {
  const d = new Date();
  return `login_reward_${d.getFullYear()}_${d.getMonth()}_${d.getDate()}`;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function DailyLoginReward({ visible, onClose }: Props) {
  const { user } = useAppStore();
  const streak = user?.daily_streak || 1;
  const streakMsg = getStreakMessage(streak);
  const pet = getPetStage(streak);

  // Confetti particles
  const particles = Array.from({ length: 18 }).map((_, i) => ({
    anim: useRef(new Animated.Value(0)).current,
    x: Math.random() * width,
    sticker: STICKERS[i % STICKERS.length],
    delay: i * 80,
    duration: 1200 + Math.random() * 600,
  }));

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const petBounce = useRef(new Animated.Value(0)).current;
  const starSpin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;

    // Card pop-in
    Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }).start();

    // Pet bounce
    Animated.loop(
      Animated.sequence([
        Animated.timing(petBounce, { toValue: -14, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(petBounce, { toValue: 0, duration: 500, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ])
    ).start();

    // Star spin
    Animated.loop(
      Animated.timing(starSpin, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true })
    ).start();

    // Confetti rain
    particles.forEach(p => {
      Animated.sequence([
        Animated.delay(p.delay),
        Animated.timing(p.anim, { toValue: 1, duration: p.duration, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    });

    return () => {
      scaleAnim.setValue(0);
      petBounce.setValue(0);
      starSpin.setValue(0);
      particles.forEach(p => p.anim.setValue(0));
    };
  }, [visible]);

  const starRotate = starSpin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Confetti */}
        {particles.map((p, i) => (
          <Animated.Text
            key={i}
            style={[
              styles.particle,
              {
                left: p.x,
                transform: [
                  { translateY: p.anim.interpolate({ inputRange: [0, 1], outputRange: [-20, 700] }) },
                  { rotate: p.anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) },
                  { scale: p.anim.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 1, 1, 0] }) },
                ],
              },
            ]}
          >
            {p.sticker}
          </Animated.Text>
        ))}

        {/* Card */}
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient colors={['#667EEA', '#764BA2', '#F093FB']} style={styles.cardGradient}>
            {/* Spinning star background */}
            <Animated.Text style={[styles.bgStar, { transform: [{ rotate: starRotate }] }]}>⭐</Animated.Text>

            {/* Pet */}
            <Animated.Text style={[styles.petEmoji, { transform: [{ translateY: petBounce }] }]}>
              {pet.emoji}
            </Animated.Text>
            <Text style={styles.petLabel}>{pet.label}</Text>

            {/* Streak */}
            <View style={styles.streakBadge}>
              <Text style={styles.streakNumber}>{streak}</Text>
              <Text style={styles.streakLabel}>Day Streak 🔥</Text>
            </View>

            {/* Message */}
            <Text style={styles.rewardEmoji}>{streakMsg.emoji}</Text>
            <Text style={styles.rewardTitle}>{streakMsg.title}</Text>
            <Text style={styles.rewardMsg}>{streakMsg.msg}</Text>

            {/* Reward earned */}
            <View style={styles.rewardRow}>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardItemIcon}>⭐</Text>
                <Text style={styles.rewardItemLabel}>+{Math.min(streak, 5)} Stars</Text>
              </View>
              <View style={styles.rewardItem}>
                <Text style={styles.rewardItemIcon}>🔥</Text>
                <Text style={styles.rewardItemLabel}>Streak Bonus</Text>
              </View>
            </View>

            {/* Sticker row */}
            <View style={styles.stickerRow}>
              {Array.from({ length: Math.min(streak, 7) }).map((_, i) => (
                <Text key={i} style={styles.stickerDot}>⭐</Text>
              ))}
              {streak < 7 && Array.from({ length: 7 - streak }).map((_, i) => (
                <Text key={`empty-${i}`} style={[styles.stickerDot, { opacity: 0.25 }]}>⭐</Text>
              ))}
            </View>
            <Text style={styles.stickerHint}>
              {streak < 7 ? `${7 - streak} more days for a full week!` : 'Full week complete! 🎉'}
            </Text>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={styles.closeBtnText}>Start Learning! 🚀</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

// Hook to manage daily reward display
export function useDailyLoginReward() {
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    checkAndShow();
  }, []);

  const checkAndShow = async () => {
    try {
      const key = getTodayKey();
      const shown = await AsyncStorage.getItem(key);
      if (!shown) {
        // Small delay so home screen loads first
        setTimeout(() => setShowReward(true), 800);
        await AsyncStorage.setItem(key, '1');
      }
    } catch {
      // Fail silently
    }
  };

  return { showReward, closeReward: () => setShowReward(false) };
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  particle: {
    position: 'absolute',
    top: 0,
    fontSize: 22,
    zIndex: 10,
  },
  card: {
    width: '100%',
    borderRadius: 32,
    overflow: 'hidden',
    shadowColor: '#764BA2',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 16,
    zIndex: 20,
  },
  cardGradient: {
    padding: 28,
    alignItems: 'center',
    gap: 10,
  },
  bgStar: {
    position: 'absolute',
    fontSize: 180,
    opacity: 0.06,
    top: -20,
  },
  petEmoji: { fontSize: 72 },
  petLabel: { fontSize: 15, fontWeight: '700', color: 'rgba(255,255,255,0.9)' },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginTop: 4,
  },
  streakNumber: { fontSize: 28, fontWeight: '900', color: '#FFD700' },
  streakLabel: { fontSize: 16, fontWeight: '700', color: '#fff' },
  rewardEmoji: { fontSize: 40, marginTop: 6 },
  rewardTitle: { fontSize: 26, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  rewardMsg: { fontSize: 15, color: 'rgba(255,255,255,0.9)', textAlign: 'center', lineHeight: 22 },
  rewardRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  rewardItem: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 4,
  },
  rewardItemIcon: { fontSize: 24 },
  rewardItemLabel: { fontSize: 13, fontWeight: '700', color: '#fff' },
  stickerRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  stickerDot: { fontSize: 22 },
  stickerHint: { fontSize: 12, color: 'rgba(255,255,255,0.75)', fontStyle: 'italic' },
  closeBtn: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  closeBtnText: { fontSize: 18, fontWeight: 'bold', color: '#667EEA' },
});
