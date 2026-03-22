import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, Image, Easing } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../store/appStore';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// New character images with expressions
const CUTY_IMG = 'https://static.prod-images.emergentagent.com/jobs/80d92d7f-316a-41ab-bd79-1d754a01b3fc/images/01bab7c747e7525895ef8ff303c570e69980779922314afd2fee53b1eeb42fb8.png';
const CANDY_IMG = 'https://static.prod-images.emergentagent.com/jobs/80d92d7f-316a-41ab-bd79-1d754a01b3fc/images/516d0419c52d6bf854b399095aae9723ea701e8787e4327fa79f39b20540a98c.png';
const BUNNY_IMG = 'https://static.prod-images.emergentagent.com/jobs/80d92d7f-316a-41ab-bd79-1d754a01b3fc/images/44a53dcf50d95996eeb96c39d23d43f9d3527d82ef7055dd48e80d4ec32945c2.png';
const JUMBO_IMG = 'https://static.prod-images.emergentagent.com/jobs/80d92d7f-316a-41ab-bd79-1d754a01b3fc/images/46865c1069b033ed2afc72a0b52b1db9dc5bbfb76a27f76dd806b84494b21d13.png';

const ANIMALS = [
  { img: CUTY_IMG, name: 'Cuty', color: '#FF6B6B' },
  { img: CANDY_IMG, name: 'Candy', color: '#FFB347' },
  { img: BUNNY_IMG, name: 'Bunny', color: '#4ECDC4' },
  { img: JUMBO_IMG, name: 'Jumbo', color: '#667EEA' },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, isLoading, loadUser } = useAppStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(50)).current;
  const titleScale = useRef(new Animated.Value(0.7)).current;

  // Each animal gets its own bounce animation
  const bounceAnims = ANIMALS.map(() => useRef(new Animated.Value(0)).current);
  const scaleAnims = ANIMALS.map(() => useRef(new Animated.Value(0)).current);

  // Floating decorations
  const floatA = useRef(new Animated.Value(0)).current;
  const floatB = useRef(new Animated.Value(0)).current;
  const floatC = useRef(new Animated.Value(0)).current;
  const floatD = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUser();

    // Staggered entrance for content
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 40, friction: 7, useNativeDriver: true }),
      Animated.spring(titleScale, { toValue: 1, tension: 50, friction: 5, useNativeDriver: true, delay: 200 }),
    ]).start();

    // Staggered animal pop-in
    ANIMALS.forEach((_, i) => {
      setTimeout(() => {
        Animated.spring(scaleAnims[i], { toValue: 1, tension: 60, friction: 5, useNativeDriver: true }).start();
      }, 300 + i * 150);
    });

    // Continuous bounce for each animal (different timing)
    ANIMALS.forEach((_, i) => {
      const dur = 1200 + i * 200;
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnims[i], { toValue: -12, duration: dur / 2, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(bounceAnims[i], { toValue: 0, duration: dur / 2, easing: Easing.in(Easing.quad), useNativeDriver: true }),
        ])
      ).start();
    });

    // Floating icons
    const floatIcon = (anim, dur) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: -10, duration: dur, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 10, duration: dur, useNativeDriver: true }),
        ])
      ).start();
    };
    floatIcon(floatA, 2000);
    floatIcon(floatB, 2500);
    floatIcon(floatC, 1800);
    floatIcon(floatD, 2200);
  }, []);

  useEffect(() => {
    if (!isLoading && user) {
      setTimeout(() => router.replace('/home'), 400);
    }
  }, [isLoading, user]);

  if (isLoading) {
    return (
      <LinearGradient colors={['#FF9A9E', '#FECFEF', '#FDFCFB']} style={styles.container}>
        <View style={styles.loadingWrap}>
          <Image source={{ uri: JUMBO_IMG }} style={{ width: 100, height: 100 }} resizeMode="contain" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (user) return null;

  return (
    <LinearGradient
      colors={['#667EEA', '#764BA2', '#F093FB', '#F5576C', '#FFD86F']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Floating decorations */}
      <Animated.View style={[styles.floatingDeco, { top: '6%', left: '8%', transform: [{ translateY: floatA }] }]}>
        <Ionicons name="star" size={22} color="rgba(255,255,255,0.5)" />
      </Animated.View>
      <Animated.View style={[styles.floatingDeco, { top: '10%', right: '12%', transform: [{ translateY: floatB }] }]}>
        <Ionicons name="heart" size={20} color="rgba(255,255,255,0.4)" />
      </Animated.View>
      <Animated.View style={[styles.floatingDeco, { top: '50%', left: '5%', transform: [{ translateY: floatC }] }]}>
        <Ionicons name="book" size={18} color="rgba(255,255,255,0.35)" />
      </Animated.View>
      <Animated.View style={[styles.floatingDeco, { top: '45%', right: '6%', transform: [{ translateY: floatD }] }]}>
        <Ionicons name="musical-notes" size={20} color="rgba(255,255,255,0.4)" />
      </Animated.View>

      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideUp }] }]}>
        {/* Title */}
        <Animated.View style={[styles.titleWrap, { transform: [{ scale: titleScale }] }]}>
          <Text style={styles.title} data-testid="app-title">Learnzy</Text>
          <Text style={styles.titleAccent}>Kids Pro</Text>
          <Text style={styles.subtitle}>Learn English the Fun Way!</Text>
        </Animated.View>

        {/* Animal Characters Grid */}
        <View style={styles.animalsGrid}>
          {ANIMALS.map((animal, i) => (
            <Animated.View
              key={animal.name}
              style={[
                styles.animalCard,
                {
                  backgroundColor: animal.color + '25',
                  borderColor: animal.color + '60',
                  transform: [
                    { translateY: bounceAnims[i] },
                    { scale: scaleAnims[i] },
                  ],
                },
              ]}
            >
              <Image source={{ uri: animal.img }} style={styles.animalImg} resizeMode="contain" />
              <Text style={[styles.animalName, { color: '#fff' }]}>{animal.name}</Text>
            </Animated.View>
          ))}
        </View>

        {/* Feature Pills */}
        <View style={styles.featuresRow}>
          {[
            { icon: 'mic', label: 'Speak', color: '#FF6B6B' },
            { icon: 'chatbubbles', label: 'Chat', color: '#4ECDC4' },
            { icon: 'game-controller', label: 'Play', color: '#FFB347' },
            { icon: 'book', label: '1550+ Words', color: '#667EEA' },
          ].map((f) => (
            <View key={f.label} style={styles.featurePill}>
              <Ionicons name={f.icon as any} size={16} color={f.color} />
              <Text style={styles.featurePillText}>{f.label}</Text>
            </View>
          ))}
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => router.push('/register')}
          activeOpacity={0.85}
          data-testid="start-learning-btn"
        >
          <LinearGradient
            colors={['#FF6B6B', '#FF8E53', '#FFCF33']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>Start Learning</Text>
            <Ionicons name="arrow-forward-circle" size={26} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.trialText}>7-day free trial  |  Only Rs.100/month</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const CARD_SIZE = (width - 80) / 2;

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 16, color: '#5D4037', fontWeight: '600' },
  floatingDeco: { position: 'absolute', zIndex: 1 },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 44,
    paddingBottom: 32,
    paddingHorizontal: 24,
    zIndex: 10,
  },
  titleWrap: { alignItems: 'center' },
  title: {
    fontSize: 38,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  titleAccent: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFD86F',
    marginTop: -4,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    marginTop: 6,
  },
  animalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 10,
  },
  animalCard: {
    width: CARD_SIZE,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  animalImg: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  animalName: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 5,
  },
  featurePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  ctaBtn: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  ctaText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.3,
  },
  trialText: {
    textAlign: 'center',
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
});
