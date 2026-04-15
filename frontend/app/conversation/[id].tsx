import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../utils/colors';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';

interface Message {
  message_id: string;
  role: string;
  content: string;
  timestamp: string;
}

interface Conversation {
  conversation_id: string;
  title: string;
  category: string | null;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

export default function ConversationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const conversationId = params.id as string;
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  useEffect(() => {
    loadConversation();
  }, [conversationId]);

  const loadConversation = async () => {
    try {
      // Import the authenticated fetch utility
      const { authenticatedFetch } = await import('../../utils/api');
      
      const response = await authenticatedFetch(`/api/conversations/${conversationId}`);

      if (response.ok) {
        const data = await response.json();
        setConversation(data);
      } else {
        Alert.alert('Error', 'Failed to load conversation');
        router.back();
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      Alert.alert('Error', 'Failed to load conversation');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (text: string) => {
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
    } else {
      setSpeaking(true);
      Speech.speak(text, {
        onDone: () => setSpeaking(false),
        onStopped: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to delete this conversation? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Import the authenticated fetch utility
              const { authenticatedFetch } = await import('../../utils/api');
              
              const response = await authenticatedFetch(`/api/conversations/${conversationId}`, {
                method: 'DELETE',
              });

              if (response.ok) {
                router.replace('/history');
              } else {
                Alert.alert('Error', 'Failed to delete conversation');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete conversation');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.saffron} />
          <Text style={styles.loadingText}>Loading conversation...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!conversation) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {conversation.title}
          </Text>
          {conversation.category && (
            <Text style={styles.headerCategory}>{conversation.category}</Text>
          )}
        </View>
        <Pressable
          testID="delete-conversation-button"
          onPress={handleDelete}
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && { opacity: 0.5 },
          ]}
        >
          <Ionicons name="trash-outline" size={22} color={colors.error} />
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>

      {/* Messages */}
      <ScrollView contentContainerStyle={styles.messagesContainer}>
        {conversation.messages.map((message) => (
          <View
            key={message.message_id}
            style={[
              styles.messageCard,
              message.role === 'user' ? styles.userMessage : styles.assistantMessage,
            ]}
          >
            <View style={styles.messageHeader}>
              <View style={styles.messageIconContainer}>
                <Ionicons
                  name={message.role === 'user' ? 'person' : 'flower'}
                  size={20}
                  color={message.role === 'user' ? colors.deepOrange : colors.saffron}
                />
              </View>
              <Text style={styles.messageRole}>
                {message.role === 'user' ? 'You' : 'Margdarshak'}
              </Text>
              {message.role === 'assistant' && (
                <TouchableOpacity
                  style={styles.speakButton}
                  onPress={() => handleSpeak(message.content)}
                  testID="text-to-speech-button"
                >
                  <Ionicons
                    name={speaking ? 'stop-circle' : 'volume-high'}
                    size={20}
                    color={colors.saffron}
                  />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.messageContent}>{message.content}</Text>
            <Text style={styles.messageTime}>
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.newQuestionButton}
          onPress={() => router.push('/ask')}
        >
          <Ionicons name="add-circle" size={20} color={colors.white} />
          <Text style={styles.newQuestionText}>Ask Another Question</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  headerCategory: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    marginLeft: 8,
    gap: 4,
    borderRadius: 8,
    backgroundColor: '#FFF0F0',
  },
  deleteText: {
    fontSize: 13,
    color: colors.error,
    fontWeight: '500',
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  messageCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userMessage: {
    borderLeftWidth: 4,
    borderLeftColor: colors.deepOrange,
  },
  assistantMessage: {
    borderLeftWidth: 4,
    borderLeftColor: colors.saffron,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  messageIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  messageRole: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  speakButton: {
    padding: 4,
  },
  messageContent: {
    fontSize: 16,
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: 8,
  },
  messageTime: {
    fontSize: 12,
    color: colors.textLight,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  newQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.saffron,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  newQuestionText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
