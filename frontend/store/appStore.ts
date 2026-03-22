import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  user_id: string;
  name: string;
  age_group: string;        // legacy, maps to current_class
  current_class: string;    // lkg | ukg | class1 | class2 | class3 | class4 | class5
  selected_character: string; // cat | dog | rabbit | elephant
  preferred_language: string;
  phone_number: string;
  current_level: string;
  total_stars: number;
  daily_streak: number;
  subscription_active: boolean;
}

interface AppState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  updateStars: (stars: number) => void;
  updateClass: (classId: string) => void;
  updateCharacter: (characterId: string) => void;
  updateLanguage: (lang: string) => void;
  loadUser: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isLoading: true,

  setUser: async (user) => {
    // Ensure current_class is set (migrate from legacy age_group)
    if (!user.current_class) {
      const ageToClass: Record<string, string> = {
        'lkg-1st': 'class1', '2nd-3rd': 'class3', '4th-5th': 'class5', '5th-adv': 'class5',
      };
      user.current_class = ageToClass[user.age_group] || 'class1';
    }
    set({ user });
    try { await AsyncStorage.setItem('user', JSON.stringify(user)); } catch {}
  },

  clearUser: async () => {
    set({ user: null });
    try { await AsyncStorage.removeItem('user'); } catch {}
  },

  updateStars: (stars) => {
    set((state) => ({ user: state.user ? { ...state.user, total_stars: stars } : null }));
  },

  updateClass: async (classId) => {
    const user = get().user;
    if (!user) return;
    const updated = { ...user, current_class: classId };
    set({ user: updated });
    try { await AsyncStorage.setItem('user', JSON.stringify(updated)); } catch {}
  },

  updateCharacter: async (characterId) => {
    const user = get().user;
    if (!user) return;
    const updated = { ...user, selected_character: characterId };
    set({ user: updated });
    try { await AsyncStorage.setItem('user', JSON.stringify(updated)); } catch {}
  },

  updateLanguage: async (lang) => {
    const user = get().user;
    if (!user) return;
    const updated = { ...user, preferred_language: lang };
    set({ user: updated });
    try { await AsyncStorage.setItem('user', JSON.stringify(updated)); } catch {}
  },

  loadUser: async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsed = JSON.parse(userData);
        if (!parsed.current_class) {
          const ageToClass: Record<string, string> = {
            'lkg-1st': 'class1', '2nd-3rd': 'class3', '4th-5th': 'class5',
          };
          parsed.current_class = ageToClass[parsed.age_group] || 'class1';
        }
        set({ user: parsed, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
