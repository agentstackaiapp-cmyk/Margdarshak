import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../utils/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AuthCallback() {
  const router = useRouter();
  const { setUser, checkAuth } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        let sessionId = null;

        // Get session_id based on platform
        if (Platform.OS === 'web') {
          // Web: Get from URL hash
          if (typeof window === 'undefined') return;
          const hash = window.location.hash;
          const params = new URLSearchParams(hash.substring(1));
          sessionId = params.get('session_id');
        } else {
          // Mobile: Auth is handled in AuthContext via expo-web-browser
          // This callback is only for web, so redirect to home
          router.replace('/home');
          return;
        }

        if (!sessionId) {
          console.error('No session_id found');
          router.replace('/');
          return;
        }

        // Exchange session_id for user data
        const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;
        const response = await fetch(`${BACKEND_URL}/api/auth/session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ session_id: sessionId }),
        });

        if (!response.ok) {
          throw new Error('Failed to create session');
        }

        const userData = await response.json();
        setUser(userData);

        // Clear the hash and redirect to home
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          window.location.hash = '';
        }
        
        await checkAuth();
        router.replace('/home');
      } catch (error) {
        console.error('Auth callback error:', error);
        router.replace('/');
      }
    };

    processAuth();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.saffron} />
      <Text style={styles.text}>Completing sign in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.cream,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
});
