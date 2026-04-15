import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Warm up the browser for faster OAuth on mobile
WebBrowser.maybeCompleteAuthSession();

interface User {
  user_id: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  setUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  const checkAuth = async () => {
    // CRITICAL: Skip auth check if returning from OAuth callback
    // AuthCallback will handle authentication in that case
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location.hash?.includes('session_id=')) {
      setLoading(false);
      return;
    }

    try {
      // Try to get stored session token (for mobile)
      let sessionToken = null;
      if (Platform.OS !== 'web') {
        sessionToken = await AsyncStorage.getItem('session_token');
      }

      const headers: any = {
        'Content-Type': 'application/json',
      };

      // Add Authorization header for mobile
      if (sessionToken && Platform.OS !== 'web') {
        headers['Authorization'] = `Bearer ${sessionToken}`;
      }

      const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
        credentials: Platform.OS === 'web' ? 'include' : 'omit',
        headers,
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        // Clear stored token if invalid
        if (Platform.OS !== 'web') {
          await AsyncStorage.removeItem('session_token');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web: Use window redirect
        if (typeof window !== 'undefined') {
          const redirectUrl = window.location.origin + '/auth-callback';
          window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
        }
      } else {
        // Native: Use expo-web-browser for OAuth
        const redirectUrl = Linking.createURL('auth-callback');
        const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
        
        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
        
        if (result.type === 'success' && result.url) {
          // Extract session_id from the returned URL
          const url = result.url;
          const sessionId = url.split('session_id=')[1]?.split('&')[0] || url.split('session_id=')[1];
          
          if (sessionId) {
            // Exchange session_id for user data
            const response = await fetch(`${BACKEND_URL}/api/auth/session`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ session_id: sessionId }),
            });

            if (response.ok) {
              const userData = await response.json();
              
              // CRITICAL: Store session token returned from backend
              if (userData.session_token) {
                await AsyncStorage.setItem('session_token', userData.session_token);
                console.log('✅ Mobile: Session token stored successfully');
              }
              
              setUser(userData);
              setIsAuthenticated(true);
            } else {
              console.error('Failed to create session');
            }
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    try {
      // Get session token for mobile
      let sessionToken = null;
      if (Platform.OS !== 'web') {
        sessionToken = await AsyncStorage.getItem('session_token');
      }

      const headers: any = {};
      if (sessionToken && Platform.OS !== 'web') {
        headers['Authorization'] = `Bearer ${sessionToken}`;
      }

      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: Platform.OS === 'web' ? 'include' : 'omit',
        headers,
      });

      // Clear stored token
      if (Platform.OS !== 'web') {
        await AsyncStorage.removeItem('session_token');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        setUser,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
