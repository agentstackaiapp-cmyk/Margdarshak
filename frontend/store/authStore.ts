import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

interface User {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthState {
  user: User | null;
  sessionToken: string | null;
  isLoading: boolean;
  login: (sessionId: string) => Promise<void>;
  logout: () => Promise<void>;
  loadSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  sessionToken: null,
  isLoading: true,

  loadSession: async () => {
    try {
      const token = await AsyncStorage.getItem('session_token');
      if (!token) { set({ isLoading: false }); return; }
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const user = await res.json();
        set({ user, sessionToken: token });
      } else {
        await AsyncStorage.removeItem('session_token');
      }
    } catch (_) {}
    set({ isLoading: false });
  },

  login: async (token: string) => {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Login failed');
    const user = await res.json();
    set({ user, sessionToken: token });
  },

  logout: async () => {
    const { sessionToken } = get();
    if (sessionToken) {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${sessionToken}` },
      }).catch(() => {});
    }
    await AsyncStorage.removeItem('session_token');
    set({ user: null, sessionToken: null });
  },
}));
