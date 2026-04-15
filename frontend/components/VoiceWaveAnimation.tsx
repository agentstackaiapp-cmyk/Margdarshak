import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors } from '../utils/colors';

interface VoiceWaveAnimationProps {
  isActive: boolean;
}

export default function VoiceWaveAnimation({ isActive }: VoiceWaveAnimationProps) {
  const bar1 = useRef(new Animated.Value(0.3)).current;
  const bar2 = useRef(new Animated.Value(0.5)).current;
  const bar3 = useRef(new Animated.Value(0.7)).current;
  const bar4 = useRef(new Animated.Value(0.5)).current;
  const bar5 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (isActive) {
      const animate = (bar: Animated.Value, delay: number) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(bar, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(bar, {
              toValue: 0.3,
              duration: 300,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      animate(bar1, 0);
      animate(bar2, 100);
      animate(bar3, 200);
      animate(bar4, 100);
      animate(bar5, 0);
    }
  }, [isActive]);

  const animateHeight = (bar: Animated.Value) => ({
    transform: [
      {
        scaleY: bar.interpolate({
          inputRange: [0, 1],
          outputRange: [0.3, 1],
        }),
      },
    ],
  });

  if (!isActive) return null;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.bar, animateHeight(bar1)]} />
      <Animated.View style={[styles.bar, animateHeight(bar2)]} />
      <Animated.View style={[styles.bar, animateHeight(bar3)]} />
      <Animated.View style={[styles.bar, animateHeight(bar4)]} />
      <Animated.View style={[styles.bar, animateHeight(bar5)]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    gap: 4,
  },
  bar: {
    width: 3,
    height: 30,
    backgroundColor: colors.saffron,
    borderRadius: 2,
  },
});