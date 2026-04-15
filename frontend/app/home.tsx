import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../utils/colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNav from '../components/BottomNav';

interface DailyTip {
  quote: string;
  translation: string;
  source: string;
  message: string;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [dailyTip, setDailyTip] = useState<DailyTip | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

  const loadDailyTip = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/daily-tip`);
      if (response.ok) {
        const data = await response.json();
        setDailyTip(data);
      }
    } catch (error) {
      console.error('Failed to load daily tip:', error);
    }
  };

  useEffect(() => {
    loadDailyTip();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDailyTip();
    setRefreshing(false);
  };

  const handleStartChat = () => {
    router.push('/chat');
  };

  const categories = [
    { id: 'stress', name: 'Stress & Anxiety', icon: 'cloudy-outline', color: '#FF6B35' },
    { id: 'relationships', name: 'Relationships', icon: 'people-outline', color: '#4CAF50' },
    { id: 'career', name: 'Career', icon: 'briefcase-outline', color: '#2196F3' },
    { id: 'ethics', name: 'Ethics & Values', icon: 'shield-outline', color: '#9C27B0' },
    { id: 'spirituality', name: 'Spirituality', icon: 'flower-outline', color: '#FF9933' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.saffron} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Namaste,</Text>
            <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'User'}</Text>
          </View>
          <Ionicons name="flower" size={40} color={colors.saffron} />
        </View>

        {/* Main CTA - Start Conversation */}
        <TouchableOpacity 
          style={styles.mainCTA}
          onPress={handleStartChat}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[colors.saffron, colors.saffronDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaGradient}
          >
            <View style={styles.ctaIcon}>
              <Ionicons name="chatbubbles" size={32} color={colors.white} />
            </View>
            <View style={styles.ctaContent}>
              <Text style={styles.ctaTitle}>Start a Conversation</Text>
              <Text style={styles.ctaSubtitle}>Ask anything about life, dharma, or wisdom</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.white} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Daily Tip Card */}
        {dailyTip && (
          <View style={styles.dailyTipCard}>
            <LinearGradient
              colors={[colors.saffron, colors.saffronDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.tipGradient}
            >
              <View style={styles.tipHeader}>
                <Ionicons name="sunny-outline" size={24} color={colors.white} />
                <Text style={styles.tipTitle}>Daily Dharma Tip</Text>
              </View>
              <Text style={styles.tipQuote}>{dailyTip.quote}</Text>
              <Text style={styles.tipTranslation}>{dailyTip.translation}</Text>
              <Text style={styles.tipSource}>— {dailyTip.source}</Text>
              <View style={styles.tipDivider} />
              <Text style={styles.tipMessage}>{dailyTip.message}</Text>
            </LinearGradient>
          </View>
        )}

        {/* Ask a Question Button */}
        <TouchableOpacity
          style={styles.askButton}
          onPress={() => router.push('/ask')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.deepOrange, colors.saffron]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.askGradient}
          >
            <Ionicons name="help-circle-outline" size={28} color={colors.white} />
            <Text style={styles.askButtonText}>Ask Your Question</Text>
            <Ionicons name="arrow-forward" size={24} color={colors.white} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Browse by Category</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => router.push(`/ask?category=${category.id}`)}
              activeOpacity={0.7}
            >
              <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                <Ionicons name={category.icon as any} size={32} color={category.color} />
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <BottomNav activeTab="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  mainCTA: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  ctaIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  ctaContent: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
  },
  dailyTipCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  tipGradient: {
    padding: 20,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
  tipQuote: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 8,
    lineHeight: 28,
  },
  tipTranslation: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 8,
    lineHeight: 20,
  },
  tipSource: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.8,
    fontStyle: 'italic',
  },
  tipDivider: {
    height: 1,
    backgroundColor: colors.white,
    opacity: 0.3,
    marginVertical: 12,
  },
  tipMessage: {
    fontSize: 14,
    color: colors.white,
    lineHeight: 20,
  },
  askButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  askGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  askButtonText: {
    flex: 1,
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    textAlign: 'center',
  },
});
