import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../utils/colors';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import BottomNav from '../components/BottomNav';

export default function AskScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState<string | null>(
    typeof params.category === 'string' ? params.category : null
  );
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  const categories = [
    { id: 'stress', name: 'Stress & Anxiety', icon: 'cloudy-outline' },
    { id: 'relationships', name: 'Relationships', icon: 'people-outline' },
    { id: 'career', name: 'Career', icon: 'briefcase-outline' },
    { id: 'ethics', name: 'Ethics & Values', icon: 'shield-outline' },
    { id: 'spirituality', name: 'Spirituality', icon: 'flower-outline' },
  ];

  useEffect(() => {
    if (params.category && typeof params.category === 'string') {
      setCategory(params.category);
    }
  }, [params.category]);

  const handleVoiceInput = () => {
    // Note: Web browsers and Expo Go have limited speech recognition support
    // This is a placeholder - full implementation requires native build
    Alert.alert(
      'Voice Input',
      'Voice input is available in the native app. For now, please type your question.',
      [{ text: 'OK' }]
    );
  };

  const handleSubmit = async () => {
    if (!question.trim()) {
      Alert.alert('Empty Question', 'Please enter your question');
      return;
    }

    setLoading(true);

    try {
      // Import the authenticated fetch utility
      const { authenticatedFetch } = await import('../utils/api');
      
      const response = await authenticatedFetch('/api/ask', {
        method: 'POST',
        body: JSON.stringify({
          question: question.trim(),
          category: category,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Navigate to conversation view
        router.push(`/conversation/${data.conversation_id}`);
      } else if (response.status === 401) {
        Alert.alert('Sign In Required', 'Please sign in to ask questions');
        router.replace('/');
      } else {
        // User-friendly message - NEVER show technical errors!
        Alert.alert('Unable to Process', 'We\'re having trouble right now. Please try again in a moment.');
      }
    } catch (error) {
      console.error('Error:', error);
      // User-friendly message - NEVER show technical errors!
      Alert.alert('Connection Error', 'Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Ask Your Question</Text>
            <Text style={styles.subtitle}>Share your concerns and receive guidance</Text>
          </View>

          {/* Category Selection */}
          <Text style={styles.label}>Select a Category (Optional)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            <TouchableOpacity
              style={[styles.categoryChip, !category && styles.categoryChipActive]}
              onPress={() => setCategory(null)}
            >
              <Text style={[styles.categoryChipText, !category && styles.categoryChipTextActive]}>
                All Topics
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryChip, category === cat.id && styles.categoryChipActive]}
                onPress={() => setCategory(cat.id)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={16}
                  color={category === cat.id ? colors.white : colors.saffron}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    category === cat.id && styles.categoryChipTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Question Input */}
          <Text style={styles.label}>Your Question</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="What guidance are you seeking today?"
              placeholderTextColor={colors.textLight}
              value={question}
              onChangeText={setQuestion}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              testID="question-input"
            />
            <TouchableOpacity style={styles.voiceButton} onPress={handleVoiceInput} testID="voice-input-button">
              <Ionicons name="mic" size={24} color={colors.saffron} />
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
            testID="get-guidance-button"
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="send" size={20} color={colors.white} />
                <Text style={styles.submitButtonText}>Get Guidance</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomNav activeTab="ask" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  categoriesScroll: {
    marginBottom: 24,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.white,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.saffron,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: colors.saffron,
    borderColor: colors.saffron,
  },
  categoryChipText: {
    fontSize: 14,
    color: colors.saffron,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: colors.white,
  },
  inputContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.lightGray,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
    minHeight: 150,
  },
  voiceButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.saffron,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: colors.mediumGray,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});
