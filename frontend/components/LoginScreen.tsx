import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8001';

export default function LoginScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Error', 'Please enter both name and email');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/dev-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });
      if (!res.ok) throw new Error('Login failed');
      const data = await res.json();
      await AsyncStorage.setItem('session_token', data.session_token);
      // Force reload to pick up new session
      if (typeof window !== 'undefined') window.location.reload();
    } catch (e) {
      Alert.alert('Login Failed', 'Could not connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.om}>ॐ</Text>
          <Text style={styles.title}>Margdarshak</Text>
          <Text style={styles.subtitle}>Ancient Wisdom for Modern Life</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Begin Your Journey</Text>
          <Text style={styles.cardDesc}>
            Enter your name and email to receive guidance from Hindu scriptures.
          </Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor="#bbb"
            autoCapitalize="words"
          />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Your email"
            placeholderTextColor="#bbb"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
          <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleLogin} disabled={loading}>
            <Text style={styles.btnText}>{loading ? 'Entering...' : 'Enter'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन"{'\n'}
            <Text style={styles.footerSource}>— Bhagavad Gita 2.47</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FF9933' },
  inner: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  om: { fontSize: 64, color: '#fff', marginBottom: 8 },
  title: { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#333', marginBottom: 10 },
  cardDesc: { fontSize: 14, color: '#666', lineHeight: 22, marginBottom: 20 },
  input: { borderWidth: 1.5, borderColor: '#FFD180', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#333', marginBottom: 14 },
  btn: { backgroundColor: '#FF9933', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { marginTop: 32, alignItems: 'center' },
  footerText: { color: 'rgba(255,255,255,0.9)', fontSize: 13, textAlign: 'center', fontStyle: 'italic', lineHeight: 22 },
  footerSource: { fontSize: 12, fontStyle: 'normal', fontWeight: '600' },
});
