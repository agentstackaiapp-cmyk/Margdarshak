import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../utils/colors';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['index', 'auth-callback'];
// Protected routes that require authentication
const PROTECTED_ROUTES = ['home', 'ask', 'history', 'profile', 'conversation'];

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const currentRoute = segments[0] || 'index';
    const isPublicRoute = PUBLIC_ROUTES.includes(currentRoute);
    const isProtectedRoute = PROTECTED_ROUTES.includes(currentRoute);

    if (!isAuthenticated && isProtectedRoute) {
      // Not authenticated but trying to access protected route -> redirect to login
      router.replace('/');
    } else if (isAuthenticated && currentRoute === 'index') {
      // Authenticated but on login page -> redirect to home
      router.replace('/home');
    }
    // All other cases: allow navigation (authenticated users on protected routes, anyone on public routes)
  }, [isAuthenticated, loading, segments]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.saffron} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.cream,
  },
});
