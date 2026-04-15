/**
 * ChatGPT-Style Conversational Chat Screen
 * Industry-ready with voice input/output, typing indicators, and responsive design
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../utils/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import ChatBubble from '../components/ChatBubble';
import TypingIndicator from '../components/TypingIndicator';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: "Namaste! I'm Margdarshak, your spiritual guide. Ask me anything about life, dharma, or ancient wisdom from Hindu scriptures.",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  useEffect(() => {
    if (messages.length > 1) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const question = inputText.trim();
    setInputText('');
    Keyboard.dismiss();
    setIsLoading(true);

    if (Haptics.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    try {
      const { authenticatedFetch } = await import('../utils/api');
      
      const response = await authenticatedFetch('/api/ask', {
        method: 'POST',
        body: JSON.stringify({ question: question }),
      });

      if (response.ok) {
        const data = await response.json();
        
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          text: data.response,
          isUser: false,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        if (Haptics.notificationAsync) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } else if (response.status === 401) {
        Alert.alert('Sign In Required', 'Please sign in to continue');
        router.replace('/');
      } else {
        Alert.alert('Unable to Process', 'Please try again in a moment.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Connection Error', 'Please check your internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    Alert.alert(
      'Voice Input',
      'Voice input coming soon! Please type your question for now.',
      [{ text: 'OK' }]
    );
  };

  const handlePlayVoice = (messageId: string, text: string) => {
    if (playingMessageId === messageId) {
      Speech.stop();
      setPlayingMessageId(null);
    } else {
      setPlayingMessageId(messageId);
      Speech.speak(text, {
        onDone: () => setPlayingMessageId(null),
        onStopped: () => setPlayingMessageId(null),
        onError: () => setPlayingMessageId(null),
        language: 'en-IN',
        pitch: 1.0,
        rate: 0.9,
      });
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <ChatBubble
      message={item.text}
      isUser={item.isUser}
      timestamp={item.timestamp}
      onPlayVoice={!item.isUser ? () => handlePlayVoice(item.id, item.text) : undefined}
      isPlaying={playingMessageId === item.id}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[colors.saffron, colors.saffronDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerAvatar}>
            <Ionicons name="flower" size={24} color={colors.saffron} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Margdarshak</Text>
            <Text style={styles.headerSubtitle}>Your Spiritual Guide</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={isLoading ? <TypingIndicator /> : null}
        />

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Ask about dharma, life, or wisdom..."
              placeholderTextColor={colors.textLight}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            
            {inputText.trim().length > 0 ? (
              <TouchableOpacity
                style={styles.sendButton}
                onPress={handleSend}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[colors.saffron, colors.saffronDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sendButtonGradient}
                >
                  <Ionicons name="send" size={20} color={colors.white} />
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.voiceButton}
                onPress={handleVoiceInput}
                disabled={isLoading}
                activeOpacity={0.7}
              >
                <Ionicons name="mic" size={24} color={colors.saffron} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.9,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    paddingVertical: 16,
    flexGrow: 1,
  },
  inputContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.cream,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    marginLeft: 8,
    marginBottom: 4,
  },
  sendButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButton: {
    marginLeft: 8,
    marginBottom: 4,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
