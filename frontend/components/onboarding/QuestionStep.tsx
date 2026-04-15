/**
 * QuestionStep.tsx
 * ─────────────────
 * A single animated question step inside the onboarding wizard.
 * Slides in from the right, shows question header + option chips.
 */

import { useRef, useEffect } from 'react';
import { Animated, ScrollView, Text, View, StyleSheet } from 'react-native';
import OptionChip from './OptionChip';
import type { OnboardingQuestion } from './types';

interface Props {
  question: OnboardingQuestion;
  selected: string[];
  onChange: (keys: string[]) => void;
  /** Direction hint for the slide animation: +1 = entering from right, -1 = entering from left */
  direction?: 1 | -1;
}

const W = 400; // max slide distance

export default function QuestionStep({ question, selected, onChange, direction = 1 }: Props) {
  const slideX = useRef(new Animated.Value(direction * W)).current;
  const fade   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    slideX.setValue(direction * W);
    fade.setValue(0);
    Animated.parallel([
      Animated.spring(slideX, { toValue: 0, tension: 55, friction: 11, useNativeDriver: true }),
      Animated.timing(fade,   { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [question.id]);

  const toggle = (key: string) => {
    if (question.multi_select) {
      onChange(
        selected.includes(key)
          ? selected.filter(k => k !== key)
          : [...selected, key],
      );
    } else {
      onChange([key]);
    }
  };

  return (
    <Animated.View style={[S.root, { opacity: fade, transform: [{ translateX: slideX }] }]}>
      {/* Question header */}
      <View style={S.header}>
        <Text style={S.emoji}>{question.emoji}</Text>
        <Text style={S.title}>{question.title}</Text>
        <Text style={S.subtitle}>{question.subtitle}</Text>
        {question.multi_select && (
          <Text style={S.hint}>Select all that apply</Text>
        )}
      </View>

      {/* Options */}
      <ScrollView
        style={S.scroll}
        contentContainerStyle={S.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {question.options.map(opt => (
          <OptionChip
            key={opt.key}
            option={opt}
            selected={selected.includes(opt.key)}
            onPress={() => toggle(opt.key)}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const S = StyleSheet.create({
  root:        { flex: 1 },
  header:      { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 24, paddingTop: 8 },
  emoji:       { fontSize: 48, marginBottom: 12 },
  title:       { fontSize: 22, fontWeight: '800', color: '#F1F5F9', textAlign: 'center', letterSpacing: -0.3 },
  subtitle:    { fontSize: 14, color: 'rgba(241,245,249,0.45)', textAlign: 'center', marginTop: 6, lineHeight: 20 },
  hint:        { marginTop: 10, fontSize: 11, color: '#F97316', fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },
  scroll:      { flex: 1 },
  scrollContent:{ paddingHorizontal: 24, paddingBottom: 16 },
});
