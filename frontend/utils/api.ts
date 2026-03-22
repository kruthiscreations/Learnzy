import axios from 'axios';
import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
  console.error('BACKEND_URL is not configured. Please set EXPO_PUBLIC_BACKEND_URL in environment.');
}

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User APIs
export const registerUser = async (name: string, ageGroup: string, selectedCharacter: string, preferredLanguage: string = 'telugu', phoneNumber: string = '') => {
  const response = await api.post('/register', {
    name,
    age_group: ageGroup,
    selected_character: selectedCharacter,
    preferred_language: preferredLanguage,
    phone_number: phoneNumber,
  });
  return response.data;
};

export const getUser = async (userId: string) => {
  const response = await api.get(`/user/${userId}`);
  return response.data;
};

export const updateUserLevel = async (userId: string, level: string) => {
  const response = await api.put(`/user/${userId}/level`, null, {
    params: { level },
  });
  return response.data;
};

// Words APIs
export const getWords = async (level?: string) => {
  const response = await api.get('/words', {
    params: level ? { level } : {},
  });
  return response.data;
};

export const getWord = async (wordId: string) => {
  const response = await api.get(`/words/${wordId}`);
  return response.data;
};

// Pronunciation API
export const analyzePronunciation = async (audioUri: string, targetWord: string, userId: string) => {
  const formData = new FormData();
  
  // @ts-ignore
  formData.append('audio_file', {
    uri: audioUri,
    type: 'audio/wav',
    name: 'recording.wav',
  });
  formData.append('target_word', targetWord);
  formData.append('user_id', userId);

  const response = await api.post('/pronunciation', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Chat APIs
export const sendChatMessage = async (
  userId: string,
  character: string,
  message: string,
  conversationId?: string
) => {
  const response = await api.post('/chat', {
    user_id: userId,
    character,
    message,
    conversation_id: conversationId,
  });
  return response.data;
};

export const getConversations = async (userId: string) => {
  const response = await api.get(`/conversations/${userId}`);
  return response.data;
};

// Progress APIs
export const getUserProgress = async (userId: string) => {
  const response = await api.get(`/progress/${userId}`);
  return response.data;
};

export const updateProgress = async (
  userId: string,
  wordId: string,
  pronunciationScore: number,
  mastered: boolean = false
) => {
  const response = await api.post('/progress', {
    user_id: userId,
    word_id: wordId,
    pronunciation_score: pronunciationScore,
    mastered,
  });
  return response.data;
};

// Characters API
export const getCharacters = async () => {
  const response = await api.get('/characters');
  return response.data;
};

export default api;

// Export raw API_URL for fetch() calls (voice-chat uses FormData)
export const API_URL = (Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL || '').replace(/\/$/, '');
