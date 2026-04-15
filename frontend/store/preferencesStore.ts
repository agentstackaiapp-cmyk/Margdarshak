/**
 * store/preferencesStore.ts
 * ──────────────────────────
 * Zustand store for user onboarding preferences.
 * Mirrors the backend UserPreferences model.
 */

import { create } from 'zustand';
import {
  fetchPreferences,
  savePreferences,
  type UserPreferences,
  type PreferencesUpdate,
} from '../services/preferencesService';

interface PreferencesState {
  prefs: UserPreferences | null;
  isLoading: boolean;

  /** Load from backend — call once after auth */
  load: (token: string) => Promise<void>;

  /** Persist a partial update and reflect locally */
  save: (token: string, update: PreferencesUpdate) => Promise<void>;

  /** Optimistic local reset (e.g. on logout) */
  clear: () => void;
}

const DEFAULT_PREFS: UserPreferences = {
  deities: [],
  scriptures: [],
  spiritual_goals: [],
  language_pref: 'hinglish',
  onboarding_completed: false,
};

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  prefs: null,
  isLoading: false,

  load: async (token: string) => {
    set({ isLoading: true });
    try {
      const prefs = await fetchPreferences(token);
      set({ prefs });
    } catch {
      set({ prefs: DEFAULT_PREFS });
    } finally {
      set({ isLoading: false });
    }
  },

  save: async (token: string, update: PreferencesUpdate) => {
    // Optimistic local update first
    const current = get().prefs ?? DEFAULT_PREFS;
    set({ prefs: { ...current, ...update } });
    try {
      const saved = await savePreferences(token, update);
      set({ prefs: saved });
    } catch {
      // revert on failure
      set({ prefs: current });
      throw new Error('Failed to save preferences');
    }
  },

  clear: () => set({ prefs: null }),
}));
