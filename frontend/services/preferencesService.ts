/**
 * services/preferencesService.ts
 * ─────────────────────────────────
 * Thin API client for the /api/preferences endpoints.
 * No business logic here — just fetch wrappers.
 */

const API = process.env.EXPO_PUBLIC_BACKEND_URL;

export interface OnboardingOption {
  key: string;
  label: string;
  subtitle: string;
  emoji: string;
  color: string;
}

export interface OnboardingQuestion {
  id: string;
  step: number;
  emoji: string;
  title: string;
  subtitle: string;
  multi_select: boolean;
  options: OnboardingOption[];
}

export interface UserPreferences {
  user_id?: string;
  deities: string[];
  scriptures: string[];
  spiritual_goals: string[];
  language_pref: string;
  onboarding_completed: boolean;
}

export interface PreferencesUpdate {
  deities?: string[];
  scriptures?: string[];
  spiritual_goals?: string[];
  language_pref?: string;
  onboarding_completed?: boolean;
}

function headers(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchSchema(token: string): Promise<OnboardingQuestion[]> {
  const r = await fetch(`${API}/api/preferences/schema`, {
    headers: headers(token),
  });
  if (!r.ok) throw new Error('Failed to load schema');
  const d = await r.json();
  return d.questions as OnboardingQuestion[];
}

export async function fetchPreferences(token: string): Promise<UserPreferences> {
  const r = await fetch(`${API}/api/preferences`, {
    headers: headers(token),
  });
  if (!r.ok) throw new Error('Failed to load preferences');
  return r.json();
}

export async function savePreferences(
  token: string,
  update: PreferencesUpdate,
): Promise<UserPreferences> {
  const r = await fetch(`${API}/api/preferences`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify(update),
  });
  if (!r.ok) throw new Error('Failed to save preferences');
  return r.json();
}
