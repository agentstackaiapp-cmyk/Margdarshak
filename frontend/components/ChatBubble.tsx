import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp?: Date;
  onPlayVoice?: () => void;
  isPlaying?: boolean;
}

export default function ChatBubble({ 
  message, 
  isUser, 
  timestamp, 
  onPlayVoice, 
  isPlaying 
}: ChatBubbleProps) {
  const maxWidth = width * 0.75; // 75% of screen width

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      {!isUser && (
        <View style={styles.aiAvatar}>
          <Ionicons name="flower" size={20} color={colors.saffron} />
        </View>
      )}
      
      <View style={[styles.bubbleWrapper, { maxWidth }]}>
        {isUser ? (
          <LinearGradient
            colors={[colors.saffron, colors.saffronDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.userBubble}
          >
            <Text style={styles.userText}>{message}</Text>
          </LinearGradient>
        ) : (
          <View style={styles.aiBubble}>
            <Text style={styles.aiText}>{message}</Text>
            {onPlayVoice && (
              <TouchableOpacity 
                style={styles.voiceButton}
                onPress={onPlayVoice}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={isPlaying ? 'stop-circle' : 'volume-high'} 
                  size={24} 
                  color={colors.saffron} 
                />
              </TouchableOpacity>
            )}
          </View>
        )}
        
        {timestamp && (
          <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.aiTimestamp]}>
            {formatTime(timestamp)}
          </Text>
        )}
      </View>
    </View>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  aiContainer: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  bubbleWrapper: {
    flexDirection: 'column',
  },
  userBubble: {
    borderRadius: 20,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  aiBubble: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userText: {
    color: colors.white,
    fontSize: 16,
    lineHeight: 22,
  },
  aiText: {
    color: colors.textPrimary,
    fontSize: 16,
    lineHeight: 24,
  },
  timestamp: {
    fontSize: 11,
    color: colors.textLight,
    marginTop: 4,
  },
  userTimestamp: {
    textAlign: 'right',
  },
  aiTimestamp: {
    textAlign: 'left',
    marginLeft: 16,
  },
  voiceButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    padding: 4,
  },
});