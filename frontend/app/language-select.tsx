import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGES = [
  { id: 'telugu', name: 'Telugu', native: 'తెలుగు', emoji: '🟡' },
  { id: 'hindi', name: 'Hindi', native: 'हिन्दी', emoji: '🟠' },
  { id: 'tamil', name: 'Tamil', native: 'தமிழ்', emoji: '🔴' },
  { id: 'kannada', name: 'Kannada', native: 'ಕನ್ನಡ', emoji: '🟣' },
  { id: 'malayalam', name: 'Malayalam', native: 'മലയാളം', emoji: '🔵' },
  { id: 'none', name: 'English Only', native: 'English Only', emoji: '⚪' },
];

export default function LanguageSelectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!selectedLanguage) {
      Alert.alert('Required', 'Please select your preferred language');
      return;
    }

    // Try to store language preference, but don't block navigation if it fails
    try {
      await AsyncStorage.setItem('preferred_language', selectedLanguage);
    } catch (error) {
      console.log('Could not save to AsyncStorage, continuing anyway:', error);
    }
    
    // Navigate to character selection regardless of storage result
    router.push({
      pathname: '/character-select',
      params: { ...params, language: selectedLanguage },
    });
  };

  return (
    <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Choose Your Language</Text>
          <Text style={styles.subtitle}>Select your preferred learning language</Text>
        </View>

        <View style={styles.languagesContainer}>
          {LANGUAGES.map((language) => (
            <TouchableOpacity
              key={language.id}
              style={[
                styles.languageCard,
                selectedLanguage === language.id && styles.languageCardSelected,
              ]}
              onPress={() => setSelectedLanguage(language.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.languageEmoji}>{language.emoji}</Text>
              <View style={styles.languageContent}>
                <Text style={styles.languageName}>{language.name}</Text>
                <Text style={styles.languageNative}>{language.native}</Text>
              </View>
              {selectedLanguage === language.id && (
                <Ionicons name="checkmark-circle" size={32} color="#10B981" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.continueButton, !selectedLanguage && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={!selectedLanguage}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
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
  languagesContainer: {
    gap: 12,
    marginBottom: 24,
  },
  languageCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  languageCardSelected: {
    borderColor: '#10B981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  languageEmoji: {
    fontSize: 40,
  },
  languageContent: {
    flex: 1,
    gap: 4,
  },
  languageName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  languageNative: {
    fontSize: 18,
    color: '#6B7280',
  },
  continueButton: {
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
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667EEA',
  },
});