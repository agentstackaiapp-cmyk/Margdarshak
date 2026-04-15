import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, FlatList, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8001';

const CATEGORIES = [
  { key: 'stress', label: 'Stress & Anxiety', icon: '🧘' },
  { key: 'relationships', label: 'Relationships', icon: '❤️' },
  { key: 'career', label: 'Career & Duty', icon: '💼' },
  { key: 'ethics', label: 'Ethics & Dharma', icon: '⚖️' },
  { key: 'spirituality', label: 'Spirituality', icon: '🕉️' },
];

interface DailyTip { quote: string; translation: string; source: string; message: string; }
interface Conversation { conversation_id: string; title: string; category: string | null; updated_at: string; }

export default function HomeScreen() {
  const { user, sessionToken, logout } = useAuthStore();
  const router = useRouter();
  const [tip, setTip] = useState<DailyTip | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTip();
    fetchConversations();
  }, []);

  const fetchTip = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/daily-tip`);
      if (res.ok) setTip(await res.json());
    } catch (_) {}
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/conversations`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (res.ok) setConversations(await res.json());
    } catch (_) {}
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  }, [sessionToken]);

  const startChat = (category?: string) => {
    router.push({ pathname: '/chat/[id]', params: { id: 'new', category: category || '' } });
  };

  const openConversation = (id: string) => {
    router.push({ pathname: '/chat/[id]', params: { id } });
  };

  const confirmLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF9933" />}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>ॐ Margdarshak</Text>
          <Text style={styles.headerSub}>Namaste, {user?.name?.split(' ')[0] || 'Seeker'}</Text>
        </View>
        <TouchableOpacity onPress={confirmLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Daily Tip */}
      {tip && (
        <View style={styles.tipCard}>
          <Text style={styles.tipLabel}>Today's Wisdom</Text>
          <Text style={styles.tipQuote}>{tip.quote}</Text>
          <Text style={styles.tipTranslation}>"{tip.translation}"</Text>
          <Text style={styles.tipSource}>— {tip.source}</Text>
          <Text style={styles.tipMessage}>{tip.message}</Text>
        </View>
      )}

      {/* Ask Now */}
      <TouchableOpacity style={styles.askBtn} onPress={() => startChat()}>
        <Text style={styles.askBtnText}>Ask a Question</Text>
        <Text style={styles.askBtnSub}>Get guidance from the scriptures</Text>
      </TouchableOpacity>

      {/* Categories */}
      <Text style={styles.sectionTitle}>Explore by Topic</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity key={cat.key} style={styles.catCard} onPress={() => startChat(cat.key)}>
            <Text style={styles.catIcon}>{cat.icon}</Text>
            <Text style={styles.catLabel}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Conversation History */}
      {conversations.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Previous Conversations</Text>
          {conversations.map((conv) => (
            <TouchableOpacity key={conv.conversation_id} style={styles.convCard} onPress={() => openConversation(conv.conversation_id)}>
              <Text style={styles.convTitle} numberOfLines={1}>{conv.title}</Text>
              {conv.category && <Text style={styles.convCategory}>{conv.category}</Text>}
              <Text style={styles.convDate}>{new Date(conv.updated_at).toLocaleDateString()}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FF9933', padding: 20, paddingTop: 60 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  logoutBtn: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  logoutText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  tipCard: { margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 18, borderLeftWidth: 4, borderLeftColor: '#FF9933', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  tipLabel: { fontSize: 11, fontWeight: '700', color: '#FF9933', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  tipQuote: { fontSize: 17, color: '#333', fontStyle: 'italic', lineHeight: 26, marginBottom: 6 },
  tipTranslation: { fontSize: 14, color: '#555', lineHeight: 22, marginBottom: 4 },
  tipSource: { fontSize: 12, color: '#FF9933', fontWeight: '600', marginBottom: 8 },
  tipMessage: { fontSize: 13, color: '#666', lineHeight: 20 },
  askBtn: { marginHorizontal: 16, marginBottom: 8, backgroundColor: '#FF9933', borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#FF9933', shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  askBtnText: { fontSize: 18, fontWeight: '800', color: '#fff' },
  askBtnSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginHorizontal: 16, marginTop: 20, marginBottom: 10 },
  categoriesRow: { paddingLeft: 16 },
  catCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginRight: 10, alignItems: 'center', width: 110, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: '#FFE0B2' },
  catIcon: { fontSize: 28, marginBottom: 6 },
  catLabel: { fontSize: 12, color: '#555', fontWeight: '600', textAlign: 'center' },
  convCard: { marginHorizontal: 16, marginBottom: 8, backgroundColor: '#fff', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: '#FFE0B2' },
  convTitle: { flex: 1, fontSize: 14, color: '#333', fontWeight: '500' },
  convCategory: { fontSize: 11, color: '#FF9933', fontWeight: '600', marginHorizontal: 8, backgroundColor: '#FFF3E0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  convDate: { fontSize: 11, color: '#999' },
});
