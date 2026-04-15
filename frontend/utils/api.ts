import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * Authenticated fetch that works on both web and mobile
 * Automatically adds Authorization header for mobile apps
 */
export async function authenticatedFetch(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // For mobile: Add Authorization header with stored token
  if (Platform.OS !== 'web') {
    const sessionToken = await AsyncStorage.getItem('session_token');
    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`;
    }
  }

  // For web: Use credentials to send cookies
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: Platform.OS === 'web' ? 'include' : 'omit',
  };

  const url = endpoint.startsWith('http') ? endpoint : `${BACKEND_URL}${endpoint}`;
  return fetch(url, fetchOptions);
}

/**
 * Public fetch for endpoints that don't require authentication
 */
export async function publicFetch(
  endpoint: string,
  options: FetchOptions = {}
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  const url = endpoint.startsWith('http') ? endpoint : `${BACKEND_URL}${endpoint}`;
  return fetch(url, fetchOptions);
}
