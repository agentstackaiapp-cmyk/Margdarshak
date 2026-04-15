/**
 * OptionChip.tsx
 * ──────────────
 * A single selectable option tile. Supports selected/unselected states
 * with smooth animated feedback.
 */

import { useRef, useEffect } from 'react';
import { Animated, Pressable, Text, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { OnboardingOption } from './types';

interface Props {
  option: OnboardingOption;
  selected: boolean;
  onPress: () => void;
}

export default function OptionChip({ option, selected, onPress }: Props) {
  const scale  = useRef(new Animated.Value(1)).current;
  const glow   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: selected ? 1.03 : 1,
        tension: 120, friction: 8, useNativeDriver: true,
      }),
      Animated.timing(glow, {
        toValue: selected ? 1 : 0,
        duration: 200, useNativeDriver: false,
      }),
    ]).start();
  }, [selected]);

  const borderColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.08)', option.color],
  });
  const bgColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.04)', `${option.color}18`],
  });

  return (
    <Animated.View style={[S.wrap, { transform: [{ scale }], borderColor, backgroundColor: bgColor }]}>
      <Pressable style={S.inner} onPress={onPress} android_ripple={{ color: `${option.color}33` }}>
        {/* Left icon circle */}
        {selected ? (
          <LinearGradient
            colors={[option.color, `${option.color}99`]}
            style={S.iconCircle}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <Text style={S.iconText}>{option.emoji}</Text>
          </LinearGradient>
        ) : (
          <View style={[S.iconCircle, S.iconCircleOff]}>
            <Text style={S.iconText}>{option.emoji}</Text>
          </View>
        )}

        {/* Labels */}
        <View style={S.labels}>
          <Text style={[S.label, selected && { color: '#F1F5F9' }]}>{option.label}</Text>
          <Text style={S.sub}>{option.subtitle}</Text>
        </View>

        {/* Checkmark */}
        {selected && (
          <View style={[S.check, { backgroundColor: option.color }]}>
            <Text style={S.checkTick}>✓</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const S = StyleSheet.create({
  wrap: {
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 10,
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  iconCircleOff: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  iconText: { fontSize: 22 },
  labels: { flex: 1 },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(241,245,249,0.7)',
    marginBottom: 2,
  },
  sub: {
    fontSize: 12,
    color: 'rgba(241,245,249,0.35)',
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  checkTick: { color: '#fff', fontSize: 13, fontWeight: '800' },
});
