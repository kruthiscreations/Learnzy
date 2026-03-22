import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { registerUser } from '../utils/api';
import { useAppStore } from '../store/appStore';
import { CLASS_GROUPS } from '../constants/AppData';

const AGE_GROUPS = CLASS_GROUPS.map(c => ({
  id: c.id,
  label: c.fullName,
  age: c.ageRange,
  words: c.emoji,
}));

export default function RegisterScreen() {
  const router = useRouter();
  const { setUser } = useAppStore();
  const [childName, setChildName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validatePhone = (phone: string) => {
    // Indian phone number validation (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleContinue = async () => {
    if (!childName.trim()) {
      Alert.alert('Required', 'Please enter child\'s name');
      return;
    }
    if (!parentPhone.trim()) {
      Alert.alert('Required', 'Please enter parent\'s phone number');
      return;
    }
    if (!validatePhone(parentPhone)) {
      Alert.alert('Invalid', 'Please enter a valid 10-digit Indian phone number');
      return;
    }
    if (!selectedAge) {
      Alert.alert('Required', 'Please select your class/age group');
      return;
    }

    setLoading(true);
    try {
      // Navigate to language selection
      router.push({
        pathname: '/language-select',
        params: { name: childName, phone: parentPhone, ageGroup: selectedAge },
      });
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#667EEA', '#764BA2']}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.title}>Let's Get Started!</Text>
            <Text style={styles.subtitle}>Register to begin learning</Text>
          </View>

          <View style={styles.card}>
            {/* Child's Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Child's Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={childName}
                  onChangeText={setChildName}
                  placeholder="Enter child's name"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Parent's Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Parent's Phone Number</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.phonePrefix}>+91</Text>
                <TextInput
                  style={[styles.input, styles.phoneInput]}
                  value={parentPhone}
                  onChangeText={setParentPhone}
                  placeholder="Enter 10-digit number"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              <Text style={styles.helperText}>We'll send updates to this number</Text>
            </View>

            {/* Age/Class Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select Class / Age Group</Text>
              {AGE_GROUPS.map((group) => (
                <TouchableOpacity
                  key={group.id}
                  style={[
                    styles.ageOption,
                    selectedAge === group.id && styles.ageOptionSelected,
                  ]}
                  onPress={() => setSelectedAge(group.id)}
                >
                  <View style={styles.ageOptionContent}>
                    <Text
                      style={[
                        styles.ageLabel,
                        selectedAge === group.id && styles.ageLabelSelected,
                      ]}
                    >
                      {group.label}
                    </Text>
                    <Text
                      style={[
                        styles.ageSubLabel,
                        selectedAge === group.id && styles.ageSubLabelSelected,
                      ]}
                    >
                      {group.age} • {group.words}
                    </Text>
                  </View>
                  {selectedAge === group.id && (
                    <Ionicons name="checkmark-circle" size={28} color="#667EEA" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.continueButton, loading && styles.continueButtonDisabled]}
              onPress={handleContinue}
              disabled={loading}
            >
              <Text style={styles.continueButtonText}>
                {loading ? 'Please wait...' : 'Continue'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    gap: 24,
  },
  inputGroup: {
    gap: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ageOptionSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#667EEA',
  },
  ageOptionContent: {
    gap: 4,
  },
  ageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  ageLabelSelected: {
    color: '#667EEA',
  },
  ageSubLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  ageSubLabelSelected: {
    color: '#667EEA',
  },
  continueButton: {
    backgroundColor: '#667EEA',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});