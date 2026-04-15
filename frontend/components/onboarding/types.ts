/** Shared TypeScript types for the onboarding flow. */

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

/** Answers collected across all steps before final submit */
export interface OnboardingAnswers {
  deity: string[];
  scriptures: string[];
  goals: string[];
  language: string;
}
