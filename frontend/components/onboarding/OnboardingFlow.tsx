/**
 * OnboardingFlow.tsx
 * ──────────────────
 * Full-screen wizard shown once after first sign-in.
 * Steps through 4 personalisation questions, then saves to backend
 * and calls onComplete so the parent can switch to ChatApp.
 *
 * Architecture:
 *   OnboardingFlow (orchestrator)
 *     ↳ QuestionStep (animated question renderer)
 *         ↳ OptionChip (individual selectable tile)
 *
 * Data flow:
 *   answers (local state) → preferencesStore.save() → backend POST /api/preferences
 */

import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Animated, Platform, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePreferencesStore } from '../../store/preferencesStore';
import { fetchSchema } from '../../services/preferencesService';
import QuestionStep from './QuestionStep';
import type { OnboardingQuestion } from './types';

interface Props {
  token: string;
  userName: string;
  onComplete: () => void;
}

const T = {
  bg:       '#06060C',
  accent:   '#F97316',
  gold:     '#FBBF24',
  text1:    '#F1F5F9',
  text2:    'rgba(241,245,249,0.55)',
  text3:    'rgba(241,245,249,0.28)',
  border:   'rgba(255,255,255,0.07)',
  surface:  'rgba(255,255,255,0.06)',
  grad:     ['#F97316', '#FBBF24'] as [string, string],
  gradBg:   ['#06060C', '#0E0812'] as [string, string],
};

/** Map question.id → answers state key */
const FIELD_MAP: Record<string, 'deity' | 'scriptures' | 'goals' | 'language'> = {
  deity:     'deity',
  scriptures:'scriptures',
  goals:     'goals',
  language:  'language',
};

export default function OnboardingFlow({ token, userName, onComplete }: Props) {
  const { save } = usePreferencesStore();

  const [questions, setQuestions]   = useState<OnboardingQuestion[]>([]);
  const [loading,   setLoading]     = useState(true);
  const [step,      setStep]        = useState(0);
  const [direction, setDirection]   = useState<1 | -1>(1);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers]       = useState<Record<string, string[]>>({
    deity: [], scriptures: [], goals: [], language: [],
  });

  const progressAnim = useRef(new Animated.Value(0)).current;
  const introFade    = useRef(new Animated.Value(0)).current;
  const introSlide   = useRef(new Animated.Value(30)).current;

  /* ── Load schema from backend ── */
  useEffect(() => {
    fetchSchema(token)
      .then(qs => { setQuestions(qs); setLoading(false); })
      .catch(() => setLoading(false));

    Animated.parallel([
      Animated.timing(introFade,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(introSlide, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  /* ── Animate progress bar ── */
  useEffect(() => {
    if (!questions.length) return;
    Animated.timing(progressAnim, {
      toValue: (step + 1) / questions.length,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [step, questions.length]);

  if (loading) {
    return (
      <LinearGradient colors={T.gradBg} style={S.center}>
        <ActivityIndicator color={T.accent} size="large" />
      </LinearGradient>
    );
  }

  const current   = questions[step];
  const field     = current ? FIELD_MAP[current.id] : null;
  const selected  = field ? answers[field] : [];
  const isLast    = step === questions.length - 1;
  const canProceed = selected.length > 0;

  const handleChange = (keys: string[]) => {
    if (!field) return;
    setAnswers(prev => ({ ...prev, [field]: keys }));
  };

  const goNext = async () => {
    if (!canProceed) return;

    if (isLast) {
      setSubmitting(true);
      try {
        await save(token, {
          deities:       answers.deity,
          scriptures:    answers.scriptures,
          spiritual_goals: answers.goals,
          language_pref: answers.language[0] ?? 'hinglish',
          onboarding_completed: true,
        });
        onComplete();
      } catch {
        setSubmitting(false);
      }
      return;
    }

    setDirection(1);
    setStep(s => s + 1);
  };

  const goBack = () => {
    if (step === 0) return;
    setDirection(-1);
    setStep(s => s - 1);
  };

  return (
    <LinearGradient colors={T.gradBg} style={S.root}>
      {/* Decorative orbs */}
      <View style={[S.orb, S.orb1]} />
      <View style={[S.orb, S.orb2]} />

      {/* ── Top bar ── */}
      <View style={S.topBar}>
        {/* Back */}
        <TouchableOpacity
          style={[S.navBtn, step === 0 && { opacity: 0 }]}
          onPress={goBack}
          disabled={step === 0}
          activeOpacity={0.7}
        >
          <Text style={S.navBtnTxt}>←</Text>
        </TouchableOpacity>

        {/* Progress bar */}
        <View style={S.progressTrack}>
          <Animated.View
            style={[S.progressFill, {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            }]}
          />
        </View>

        {/* Step counter */}
        <Text style={S.stepCount}>{step + 1} / {questions.length}</Text>
      </View>

      {/* ── Greeting (only on first step) ── */}
      {step === 0 && (
        <Animated.View style={[S.greet, { opacity: introFade, transform: [{ translateY: introSlide }] }]}>
          <LinearGradient colors={T.grad} style={S.greetCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={S.greetOm}>ॐ</Text>
          </LinearGradient>
          <Text style={S.greetName}>Namaste, {userName} 🙏</Text>
          <Text style={S.greetSub}>Let me understand your path before we begin</Text>
        </Animated.View>
      )}

      {/* ── Question step ── */}
      {current && (
        <View style={S.questionWrap}>
          <QuestionStep
            question={current}
            selected={selected}
            onChange={handleChange}
            direction={direction}
          />
        </View>
      )}

      {/* ── CTA button ── */}
      <View style={S.footer}>
        <TouchableOpacity
          onPress={goNext}
          disabled={!canProceed || submitting}
          activeOpacity={0.85}
          style={{ width: '100%' }}
        >
          <LinearGradient
            colors={canProceed ? T.grad : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.08)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[S.cta, (!canProceed || submitting) && { opacity: 0.5 }]}
          >
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={S.ctaTxt}>{isLast ? 'Begin My Journey  🙏' : 'Continue  →'}</Text>}
          </LinearGradient>
        </TouchableOpacity>

        {!canProceed && (
          <Text style={S.selectHint}>
            {current?.multi_select ? 'Select at least one option' : 'Please choose an option'}
          </Text>
        )}
      </View>
    </LinearGradient>
  );
}

const S = StyleSheet.create({
  root:   { flex: 1, backgroundColor: T.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  orb:    { position: 'absolute', borderRadius: 9999, opacity: 0.1 },
  orb1:   { width: 360, height: 360, backgroundColor: '#F97316', top: -150, right: -100 },
  orb2:   { width: 280, height: 280, backgroundColor: '#A78BFA', bottom: 40,  left: -110 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 20 : 56,
    paddingBottom: 16,
    gap: 12,
  },
  navBtn:     { width: 36, height: 36, borderRadius: 18, backgroundColor: T.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: T.border },
  navBtnTxt:  { color: T.text1, fontSize: 16, fontWeight: '700' },
  progressTrack:{ flex: 1, height: 4, backgroundColor: T.surface, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: T.accent, borderRadius: 2 },
  stepCount:  { fontSize: 12, color: T.text3, fontWeight: '600', minWidth: 32, textAlign: 'right' },

  greet:       { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 20, paddingTop: 4 },
  greetCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 12, shadowColor: '#F97316', shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
  greetOm:     { fontSize: 28, color: '#fff', fontWeight: '800' },
  greetName:   { fontSize: 20, fontWeight: '700', color: T.text1, textAlign: 'center' },
  greetSub:    { fontSize: 13, color: T.text2, textAlign: 'center', marginTop: 4 },

  questionWrap: { flex: 1 },

  footer:     { paddingHorizontal: 24, paddingBottom: Platform.OS === 'web' ? 24 : 40, paddingTop: 12, gap: 8, alignItems: 'center' },
  cta:        { borderRadius: 16, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', width: '100%' },
  ctaTxt:     { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
  selectHint: { fontSize: 12, color: T.text3, textAlign: 'center' },
});
