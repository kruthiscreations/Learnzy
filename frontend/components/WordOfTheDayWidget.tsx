import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { Audio } from 'expo-av';
import { getTodaysWord } from '../utils/WordOfTheDay';
import { useAppStore } from '../store/appStore';
import api from '../utils/api';

export default function WordOfTheDayWidget() {
  const { user } = useAppStore();
  const level = user?.current_level || 'lkg-1st';
  const word = getTodaysWord(level);
  const [expanded, setExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const speakWord = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      }
      const response = await api.post('/tts/speak-base64', { text, voice: 'nova', speed: 0.85 });
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/mp3;base64,${response.data.audio_base64}` },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate(s => {
        if (s.isLoaded && s.didJustFinish) setIsSpeaking(false);
      });
    } catch {
      setIsSpeaking(false);
    }
  };

  return (
    <TouchableOpacity onPress={() => setExpanded(e => !e)} activeOpacity={0.92}>
      <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.container}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={styles.badge}>
            <Ionicons name="calendar" size={13} color="#92400E" />
            <Text style={styles.badgeText}>Word of the Day</Text>
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="rgba(255,255,255,0.8)"
          />
        </View>

        {/* Main word row */}
        <View style={styles.wordRow}>
          <Text style={styles.emoji}>{word.emoji}</Text>
          <View style={styles.wordMain}>
            <Text style={styles.wordText}>{word.word}</Text>
            <Text style={styles.teluguText}>{word.telugu}</Text>
          </View>
          <TouchableOpacity
            onPress={() => speakWord(word.word)}
            style={styles.speakBtn}
            disabled={isSpeaking}
          >
            {isSpeaking
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="volume-high" size={22} color="#fff" />}
          </TouchableOpacity>
        </View>

        <Text style={styles.meaning}>{word.meaning}</Text>

        {/* Expanded section */}
        {expanded && (
          <Animatable.View animation="fadeIn" duration={300} style={styles.expandedSection}>
            {/* Sentence of the Day */}
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>📝 Sentence of the Day</Text>
              <Text style={styles.infoText}>"{word.sentenceOfDay}"</Text>
              <TouchableOpacity onPress={() => speakWord(word.sentenceOfDay)} style={styles.listenRow}>
                <Ionicons name="volume-medium" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.listenText}>Listen</Text>
              </TouchableOpacity>
            </View>

            {/* Synonym / Antonym */}
            {(word.synonym || word.antonym) && (
              <View style={styles.pillsRow}>
                {word.synonym && (
                  <View style={styles.pill}>
                    <Text style={styles.pillLabel}>Similar: </Text>
                    <Text style={styles.pillValue}>{word.synonym}</Text>
                  </View>
                )}
                {word.antonym && (
                  <View style={[styles.pill, styles.pillOpposite]}>
                    <Text style={styles.pillLabel}>Opposite: </Text>
                    <Text style={styles.pillValue}>{word.antonym}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Use it challenge */}
            <View style={styles.challengeBox}>
              <Text style={styles.challengeText}>
                🎯 Challenge: Use "{word.word}" in a sentence today!
              </Text>
            </View>
          </Animatable.View>
        )}

        {!expanded && (
          <Text style={styles.tapHint}>Tap to see sentence, synonyms & challenge ↓</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 18,
    gap: 10,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 5,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emoji: { fontSize: 40 },
  wordMain: { flex: 1 },
  wordText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  teluguText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
    marginTop: 2,
  },
  speakBtn: {
    width: 42,
    height: 42,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  meaning: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.92)',
    lineHeight: 20,
  },
  tapHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  expandedSection: { gap: 12, marginTop: 4 },
  infoBlock: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
  },
  infoText: {
    fontSize: 16,
    color: '#fff',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  listenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  listenText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  pill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillOpposite: {
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  pillLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  pillValue: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '700',
  },
  challengeBox: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 12,
    padding: 12,
  },
  challengeText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    lineHeight: 20,
  },
});
