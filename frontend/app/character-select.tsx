import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CHARACTERS } from '../constants/AppData';
import AnimatedCharacter from '../components/AnimatedCharacter';
import { registerUser } from '../utils/api';
import { useAppStore } from '../store/appStore';

export default function CharacterSelectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { setUser } = useAppStore();
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectCharacter = async () => {
    if (!selectedCharacter) {
      Alert.alert('Required', 'Please choose your learning buddy!');
      return;
    }

    setLoading(true);
    try {
      // Log parameters for debugging
      console.log('Registration params:', {
        name: params.name,
        ageGroup: params.ageGroup,
        character: selectedCharacter,
        language: params.language
      });

      const userData = await registerUser(
        params.name as string,
        params.ageGroup as string,
        selectedCharacter,
        params.language as string || 'telugu',
        params.phone as string || ''
      );
      
      console.log('Registration successful:', userData);
      await setUser(userData);
      router.replace('/home');
    } catch (error: any) {
      console.error('Registration error details:', error?.response?.data || error?.message || error);
      
      // More specific error message
      let errorMessage = 'Failed to register. Please try again.';
      if (error?.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error?.response?.status === 400) {
        errorMessage = 'Invalid data. Please go back and fill all fields.';
      } else if (error?.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#667EEA', '#764BA2']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Choose Your Buddy!</Text>
          <Text style={styles.subtitle}>Pick an AI friend to learn with</Text>
        </View>

        <View style={styles.charactersContainer}>
          {Object.values(CHARACTERS).map((character) => (
            <TouchableOpacity
              key={character.id}
              style={[
                styles.characterCard,
                selectedCharacter === character.id && styles.characterCardSelected,
              ]}
              onPress={() => setSelectedCharacter(character.id)}
              activeOpacity={0.8}
            >
              <View style={styles.characterContent}>
                <AnimatedCharacter character={character.id as any} expression={selectedCharacter === character.id ? 'happy' : 'idle'} size={80} />
                <Text style={styles.characterName}>{character.name}</Text>
                <Text style={styles.characterPersonality}>{character.personality}</Text>
                <Text style={styles.characterDescription}>{character.description}</Text>
              </View>
              {selectedCharacter === character.id && (
                <View style={[styles.checkmark, { backgroundColor: character.color }]}>
                  <Ionicons name="checkmark" size={24} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.startButton, loading && styles.startButtonDisabled]}
          onPress={handleSelectCharacter}
          disabled={loading}
        >
          <Text style={styles.startButtonText}>
            {loading ? 'Creating your account...' : 'Start Learning!'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  charactersContainer: {
    gap: 16,
    marginBottom: 24,
  },
  characterCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 3,
    borderColor: 'transparent',
    position: 'relative',
  },
  characterCardSelected: {
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  characterContent: {
    alignItems: 'center',
    gap: 8,
  },
  characterEmoji: {
    fontSize: 64,
  },
  characterName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  characterPersonality: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667EEA',
  },
  characterDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  checkmark: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonDisabled: {
    opacity: 0.6,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667EEA',
  },
});