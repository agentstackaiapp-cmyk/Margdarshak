import { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
  Animated, Pressable, Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import { useAuthStore } from '../store/authStore';
import { usePreferencesStore } from '../store/preferencesStore';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  bg:           '#06060C',
  bgSurface:    'rgba(255,255,255,0.035)',
  bgSurface2:   'rgba(255,255,255,0.065)',
  bgSurface3:   'rgba(255,255,255,0.09)',
  border:       'rgba(255,255,255,0.07)',
  borderAccent: 'rgba(249,115,22,0.28)',
  text1:        '#F1F5F9',
  text2:        'rgba(241,245,249,0.6)',
  text3:        'rgba(241,245,249,0.32)',
  accent:       '#F97316',
  accentLight:  '#FB923C',
  accentGlow:   'rgba(249,115,22,0.18)',
  accentMuted:  'rgba(249,115,22,0.09)',
  gold:         '#FBBF24',
  goldMuted:    'rgba(251,191,36,0.08)',
  purple:       '#A78BFA',
  green:        '#34D399',
  red:          '#F87171',
  gradAccent:   ['#F97316', '#FBBF24'] as [string, string],
  gradBg:       ['#06060C', '#0E0812'] as [string, string],
  gradHeader:   ['rgba(6,6,12,0.98)', 'rgba(14,8,18,0.98)'] as [string, string],
  r4: 4, r8: 8, r12: 12, r16: 16, r20: 20, r24: 24, rFull: 9999,
};

const API = process.env.EXPO_PUBLIC_BACKEND_URL;

const CATS = [
  { key: 'stress',        icon: '🧘', label: 'Stress',        color: '#A78BFA', bg: 'rgba(167,139,250,0.1)'  },
  { key: 'relationships', icon: '❤️', label: 'Relationships', color: '#F472B6', bg: 'rgba(244,114,182,0.1)'  },
  { key: 'career',        icon: '💼', label: 'Career',        color: '#38BDF8', bg: 'rgba(56,189,248,0.1)'   },
  { key: 'ethics',        icon: '⚖️', label: 'Dharma',        color: '#34D399', bg: 'rgba(52,211,153,0.1)'  },
  { key: 'spirituality',  icon: '🕉️', label: 'Spirituality', color: '#F97316', bg: 'rgba(249,115,22,0.1)'  },
];

const STARTERS = [
  { hi: 'मुझे मन की शांति कैसे मिलेगी?',      en: 'Finding inner peace' },
  { hi: 'How do I deal with failure?',          en: 'Dealing with failure' },
  { hi: 'मन को एकाग्र कैसे करें?',              en: 'Concentration & focus' },
  { hi: 'What is the meaning of karma?',        en: 'Understanding karma' },
];

/* ─────────────────────────────────────────────
   YOUTUBE VIDEO DATABASE
───────────────────────────────────────────── */
interface Video {
  id: string; title: string; channel: string;
  query: string; color: string; icon: string;
}

const VDB: Record<string, Video[]> = {
  mahabharata: [
    { id: 'm1', title: 'Saurabh Jain as Lord Krishna', channel: 'Mahabharat · Star Plus', query: 'Saurabh Jain Krishna Mahabharat Star Plus shorts', color: '#F59E0B', icon: '👑' },
    { id: 'm2', title: 'Krishna Arjuna on Kurukshetra', channel: 'BR Chopra Mahabharat', query: 'Krishna Arjuna Kurukshetra dialogue Mahabharat BR Chopra', color: '#8B5CF6', icon: '⚔️' },
    { id: 'm3', title: 'Draupadi Cheerharan Scene', channel: 'Mahabharat', query: 'Mahabharat Draupadi Krishna protect dharma scene', color: '#EF4444', icon: '🔱' },
  ],
  gita: [
    { id: 'g1', title: 'Saurabh Jain – Gita Updesh', channel: 'Mahabharat · Star Plus', query: 'Saurabh Jain Gita updesh Krishna shorts Hindi', color: '#F97316', icon: '📖' },
    { id: 'g2', title: 'Bhagavad Gita Saar', channel: 'Spiritual Hindi', query: 'Bhagavad Gita saar in Hindi spiritual shorts', color: '#10B981', icon: '🕉️' },
    { id: 'g3', title: 'Karma Yoga Explained', channel: 'ISKCON', query: 'karma yoga Bhagavad Gita ISKCON lecture shorts', color: '#6366F1', icon: '⚖️' },
  ],
  upanishad: [
    { id: 'u1', title: 'Ashtavakra Gita – Self Realization', channel: 'Acharya Prashant', query: 'Ashtavakra Gita Acharya Prashant self realization shorts', color: '#7C3AED', icon: '🌸' },
    { id: 'u2', title: 'Mandukya Upanishad', channel: 'Swami Sarvapriyananda', query: 'Swami Sarvapriyananda Mandukya Upanishad lecture', color: '#0EA5E9', icon: '🔆' },
    { id: 'u3', title: 'Kena Upanishad – Who is Brahman?', channel: 'Vedanta Society', query: 'Kena Upanishad Brahman consciousness Vedanta shorts', color: '#D946EF', icon: '✨' },
  ],
  ramayana: [
    { id: 'r1', title: 'Ram Katha – Morari Bapu', channel: 'Morari Bapu', query: 'Morari Bapu Ram Katha motivational shorts Hindi', color: '#EF4444', icon: '🏹' },
    { id: 'r2', title: 'Hanuman Bhakti Scenes', channel: 'Ramanand Sagar Ramayan', query: 'Ramanand Sagar Ramayan Hanuman bhakti shorts', color: '#F97316', icon: '🙏' },
  ],
  stress: [
    { id: 's1', title: 'How to Calm the Mind', channel: 'BK Shivani', query: 'BK Shivani calm mind stress peace shorts Hindi', color: '#06B6D4', icon: '🧘' },
    { id: 's2', title: 'Inner Peace – Sadhguru', channel: 'Sadhguru · Isha Foundation', query: 'Sadhguru inner peace anxiety relief shorts', color: '#8B5CF6', icon: '☮️' },
  ],
  relationships: [
    { id: 'rel1', title: 'Relationships & Dharma', channel: 'Acharya Prashant', query: 'Acharya Prashant relationships dharma love shorts', color: '#F472B6', icon: '❤️' },
    { id: 'rel2', title: 'Krishna on True Love', channel: 'Mahabharat · Star Plus', query: 'Saurabh Jain Krishna love true relationship shorts', color: '#F97316', icon: '🌹' },
  ],
  karma: [
    { id: 'k1', title: 'Law of Karma – Saurabh Jain', channel: 'Mahabharat · Star Plus', query: 'Saurabh Jain Krishna karma law Mahabharat shorts', color: '#F97316', icon: '♾️' },
    { id: 'k2', title: 'Understanding Karma Yoga', channel: 'Swami Vivekananda Teachings', query: 'karma yoga Swami Vivekananda Hindi shorts', color: '#10B981', icon: '🔄' },
  ],
  spirituality: [
    { id: 'sp1', title: 'What is Moksha?', channel: 'Sadhguru', query: 'Sadhguru what is moksha liberation shorts', color: '#F97316', icon: '🕉️' },
    { id: 'sp2', title: 'Meditation from Upanishads', channel: 'Swami Sarvapriyananda', query: 'Swami Sarvapriyananda meditation Upanishad shorts', color: '#6366F1', icon: '🪷' },
  ],
};

function detectVideos(content: string): Video[] {
  const t = content.toLowerCase();
  const hits = new Map<string, Video>();
  const add = (arr: Video[]) => arr.forEach(v => { if (!hits.has(v.id)) hits.set(v.id, v); });

  if (/mahabharata|महाभारत|arjuna|अर्जुन|kurukshetra|pandava|draupadi/.test(t)) add(VDB.mahabharata);
  if (/bhagavad\s*gita|gita|गीता|shloka|karma yoga/.test(t)) add(VDB.gita);
  if (/upanishad|उपनिषद|ashtavakra|अष्टावक्र|brahman|atman|vedanta/.test(t)) add(VDB.upanishad);
  if (/ramayana|रामायण|rama\b|hanuman|sita|रामायण/.test(t)) add(VDB.ramayana);
  if (/stress|anxiety|तनाव|चिंता|overwhelm|mind|मन/.test(t)) add(VDB.stress);
  if (/relation|love|प्रेम|marriage|family|partner/.test(t)) add(VDB.relationships);
  if (/karma|कर्म/.test(t)) add(VDB.karma);
  if (/moksha|moksh|liberation|spirit|atma|आत्मा|yoga/.test(t)) add(VDB.spirituality);

  const result = Array.from(hits.values()).slice(0, 3);
  // Always show at least Saurabh Jain if Mahabharat/Gita is touched
  if (result.length === 0 && /gita|mahabharata|krishna|कृष्ण/.test(t)) add(VDB.gita);
  return result.length ? result : Array.from(hits.values()).slice(0, 3);
}

interface Msg {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  chips?: typeof CATS;
  starters?: typeof STARTERS;
  videos?: Video[];
}
interface Conv { conversation_id: string; title: string; updated_at: string }

/* ═══════════════════════════════════════════════
   SHLOKA CARD — renders Sanskrit scripture blocks
═══════════════════════════════════════════════ */
function ShlokaCard({ block }: { block: string }) {
  const lines = block.split('\n').filter(l => l.trim());
  return (
    <View style={SK.wrap}>
      <LinearGradient colors={['#F97316', '#FBBF24']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={SK.bar} />
      <View style={SK.body}>
        {lines.map((line, i) => {
          const clean = line.replace(/^>\s*/, '').replace(/\*\*/g, '').trim();
          if (!clean) return null;
          const isHeader  = line.includes('📖') || (line.startsWith('**') && (line.includes('Gita') || line.includes('Veda') || line.includes('Upanishad') || line.includes('Purana') || line.includes('Sutra') || line.includes('Ramayana') || line.includes('Mahabharata')));
          const isDevnag  = line.startsWith('>') && /[\u0900-\u097F]/.test(line);
          const isRoman   = line.startsWith('>') && !isDevnag;
          const isMeaning = /^meaning/i.test(clean) || /^\*\*meaning/i.test(line);
          return (
            <Text key={i} style={[
              SK.line,
              isHeader  && SK.header,
              isDevnag  && SK.devnag,
              isRoman   && SK.roman,
              isMeaning && SK.meaning,
            ]}>{isMeaning ? clean.replace(/^meaning\s*[:\-]?\s*/i, '') : clean}</Text>
          );
        })}
      </View>
    </View>
  );
}
const SK = StyleSheet.create({
  wrap:    { marginVertical: 10, borderRadius: T.r16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(251,191,36,0.15)', backgroundColor: T.goldMuted },
  bar:     { height: 3 },
  body:    { padding: 16 },
  line:    { fontSize: 14, color: T.text2, lineHeight: 22, marginBottom: 3 },
  header:  { fontSize: 12, fontWeight: '700', color: T.gold, letterSpacing: 0.5, marginBottom: 8 },
  devnag:  { fontSize: 18, color: '#C4B5FD', lineHeight: 30, fontStyle: 'italic', marginVertical: 4 },
  roman:   { fontSize: 13, color: T.text2, fontStyle: 'italic', lineHeight: 20 },
  meaning: { fontSize: 14, color: T.text1, lineHeight: 22, borderTopWidth: 1, borderColor: 'rgba(251,191,36,0.12)', paddingTop: 10, marginTop: 6 },
});

/* ═══════════════════════════════════════════════
   RICH TEXT — renders **bold** and *italic*
═══════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════
   VIDEO PLAYER — fetches a real video ID from backend,
   then embeds via iframe (web) or WebView (native).
═══════════════════════════════════════════════ */
function VideoPlayer({ v, onClose }: { v: Video; onClose: () => void }) {
  const { sessionToken } = useAuthStore();
  const { width } = Dimensions.get('window');
  const playerH = Math.round(width * 9 / 16);

  const [embedUri, setEmbedUri]   = useState<string | null>(null);
  const [loading,  setLoading]    = useState(true);
  const [errored,  setErrored]    = useState(false);

  useEffect(() => {
    setLoading(true); setErrored(false); setEmbedUri(null);
    fetch(`${API}/api/youtube/video?q=${encodeURIComponent(v.query)}`, {
      headers: { Authorization: `Bearer ${sessionToken}` },
    })
      .then(r => { if (!r.ok) throw new Error('not found'); return r.json(); })
      .then(d => setEmbedUri(d.embed_url))
      .catch(() => setErrored(true))
      .finally(() => setLoading(false));
  }, [v.query]);

  return (
    <View style={VC.player}>
      {/* Mini header */}
      <View style={VC.playerHead}>
        <Text style={VC.playerIcon}>{v.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={VC.playerTitle} numberOfLines={1}>{v.title}</Text>
          <Text style={VC.playerChan}>{v.channel}</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={VC.playerCloseBtn} activeOpacity={0.7}>
          <Text style={VC.playerCloseTxt}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Player body */}
      {loading ? (
        <View style={[VC.playerBody, { height: playerH }]}>
          <ActivityIndicator color={T.accent} />
          <Text style={VC.playerBodyTxt}>Finding video…</Text>
        </View>
      ) : errored || !embedUri ? (
        <View style={[VC.playerBody, { height: playerH }]}>
          <Text style={{ fontSize: 28 }}>🎬</Text>
          <Text style={VC.playerBodyTxt}>Video not available</Text>
        </View>
      ) : Platform.OS === 'web' ? (
        // @ts-ignore — iframe is valid DOM on React Native Web
        <iframe
          src={embedUri}
          style={{ width: '100%', height: playerH, border: 'none', display: 'block' }}
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      ) : (
        <WebView
          source={{ uri: embedUri }}
          style={{ width: '100%', height: playerH }}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          scrollEnabled={false}
          bounces={false}
        />
      )}
    </View>
  );
}

/* ═══════════════════════════════════════════════
   VIDEO CARD
═══════════════════════════════════════════════ */
const YT_COLORS = ['#F97316','#8B5CF6','#10B981','#0EA5E9','#F472B6','#FBBF24'];

function VideoCard({ v, idx, active, onPlay }: { v: Video; idx: number; active: boolean; onPlay: () => void }) {
  const gradColors: [string, string] = [v.color, YT_COLORS[(idx + 2) % YT_COLORS.length]];

  return (
    <TouchableOpacity style={[VC.card, active && VC.cardActive]} onPress={onPlay} activeOpacity={0.8}>
      {/* Thumbnail */}
      <LinearGradient colors={gradColors} style={VC.thumb} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Text style={VC.thumbIcon}>{v.icon}</Text>
        <View style={VC.playCircle}>
          <Text style={VC.playArrow}>{active ? '■' : '▶'}</Text>
        </View>
        {/* YouTube badge */}
        <View style={VC.ytBadge}>
          <View style={VC.ytDot} />
          <Text style={VC.ytTxt}>YouTube</Text>
        </View>
        {active && (
          <View style={VC.nowPlaying}>
            <Text style={VC.nowPlayingTxt}>▶ NOW PLAYING</Text>
          </View>
        )}
      </LinearGradient>

      {/* Info */}
      <View style={VC.info}>
        <Text style={VC.title} numberOfLines={2}>{v.title}</Text>
        <Text style={VC.channel} numberOfLines={1}>{v.channel}</Text>
        {!active && (
          <View style={VC.watchRow}>
            <Text style={[VC.watchTxt, { color: v.color }]}>Play →</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function VideosRow({ videos }: { videos: Video[] }) {
  // Auto-play the first video as soon as this row mounts (i.e. when AI responds)
  const [playingId, setPlayingId] = useState<string | null>(videos[0]?.id ?? null);
  const playing = videos.find(v => v.id === playingId) ?? null;

  return (
    <View style={VC.section}>
      <View style={VC.sectionHeader}>
        <View style={VC.sectionDot} />
        <Text style={VC.sectionLabel}>Related on YouTube</Text>
      </View>

      {/* Inline player */}
      {playing && <VideoPlayer v={playing} onClose={() => setPlayingId(null)} />}

      {/* Horizontal card strip to switch videos */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={VC.scroll} contentContainerStyle={VC.scrollContent}>
        {videos.map((v, i) => (
          <VideoCard
            key={v.id}
            v={v}
            idx={i}
            active={v.id === playingId}
            onPlay={() => setPlayingId(v.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const VC = StyleSheet.create({
  section:       { marginTop: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  sectionDot:    { width: 3, height: 14, borderRadius: 2, backgroundColor: '#FF0000' },
  sectionLabel:  { fontSize: 11, fontWeight: '700', color: 'rgba(241,245,249,0.5)', letterSpacing: 1, textTransform: 'uppercase' },

  // Inline player
  player:        { borderRadius: T.r16, overflow: 'hidden', marginBottom: 10, borderWidth: 1, borderColor: T.border, backgroundColor: '#000' },
  playerHead:    { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, backgroundColor: T.bgSurface2 },
  playerIcon:    { fontSize: 20 },
  playerTitle:   { fontSize: 12, fontWeight: '600', color: T.text1 },
  playerChan:    { fontSize: 10, color: T.text3, marginTop: 1 },
  playerCloseBtn:{ padding: 4 },
  playerCloseTxt:{ color: T.text3, fontSize: 15, fontWeight: '600' },
  playerBody:    { justifyContent: 'center', alignItems: 'center', gap: 8, backgroundColor: '#000' },
  playerBodyTxt: { fontSize: 13, color: T.text3, marginTop: 6 },

  // Cards
  scroll:        { marginLeft: -2 },
  scrollContent: { paddingRight: 16, gap: 10 },
  card:          { width: 150, borderRadius: 14, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cardActive:    { borderColor: 'rgba(249,115,22,0.55)', borderWidth: 1.5 },
  thumb:         { height: 110, justifyContent: 'space-between', padding: 10 },
  thumbIcon:     { fontSize: 28 },
  playCircle:    { position: 'absolute', bottom: 10, right: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' },
  playArrow:     { color: '#fff', fontSize: 12, marginLeft: 2 },
  ytBadge:       { position: 'absolute', top: 8, right: 8, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  ytDot:         { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF0000' },
  ytTxt:         { fontSize: 9, color: '#fff', fontWeight: '700', letterSpacing: 0.3 },
  nowPlaying:    { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(249,115,22,0.9)', paddingVertical: 3, alignItems: 'center' },
  nowPlayingTxt: { fontSize: 8, color: '#fff', fontWeight: '800', letterSpacing: 0.6 },
  info:          { padding: 10 },
  title:         { fontSize: 12, fontWeight: '600', color: 'rgba(241,245,249,0.9)', lineHeight: 17, marginBottom: 4 },
  channel:       { fontSize: 10, color: 'rgba(241,245,249,0.4)', lineHeight: 14 },
  watchRow:      { marginTop: 7 },
  watchTxt:      { fontSize: 11, fontWeight: '700' },
});

function RichText({ text, isUser }: { text: string; isUser: boolean }) {
  const base = { color: isUser ? '#fff' : T.text1, fontSize: 15, lineHeight: 26 };
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return (
    <Text style={base}>
      {parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**'))
          return <Text key={i} style={{ fontWeight: '700', color: isUser ? '#fff' : T.text1 }}>{p.slice(2, -2)}</Text>;
        if (p.startsWith('*') && p.endsWith('*'))
          return <Text key={i} style={{ fontStyle: 'italic', color: isUser ? 'rgba(255,255,255,0.9)' : T.text2 }}>{p.slice(1, -1)}</Text>;
        return <Text key={i}>{p}</Text>;
      })}
    </Text>
  );
}

/* ═══════════════════════════════════════════════
   PARSE — split message into text/shloka parts
═══════════════════════════════════════════════ */
function parse(content: string): { type: 'text' | 'shloka'; text: string }[] {
  const out: { type: 'text' | 'shloka'; text: string }[] = [];
  const lines = content.split('\n');
  let buf: string[] = [], inBlock = false;

  const isScriptureHeader = (l: string) =>
    l.includes('📖') ||
    (l.startsWith('**') && /Gita|Veda|Upanishad|Purana|Sutra|Ramayana|Mahabharata/.test(l));

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (isScriptureHeader(l) && !inBlock) {
      if (buf.length) { out.push({ type: 'text', text: buf.join('\n') }); buf = []; }
      inBlock = true;
    }
    buf.push(l);
    if (inBlock && l.trim() === '' && buf.length > 3) {
      out.push({ type: 'shloka', text: buf.join('\n') }); buf = []; inBlock = false;
    }
  }
  if (buf.length) out.push({ type: inBlock ? 'shloka' : 'text', text: buf.join('\n') });
  return out;
}

/* ═══════════════════════════════════════════════
   LOGIN SCREEN
═══════════════════════════════════════════════ */
function LoginScreen() {
  const [busy, setBusy]   = useState(false);
  const [err, setErr]     = useState('');
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, tension: 50, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleGoogleSignIn = () => {
    setBusy(true);
    setErr('');
    try {
      // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const redirectUrl = window.location.origin + '/auth-callback';
        const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
        window.location.href = authUrl;
      } else {
        // For mobile, we'll handle OAuth in the future
        setErr('Google Sign-In is currently available on web only.');
        setBusy(false);
      }
    } catch (error) {
      setErr('Failed to initiate Google Sign-In.');
      setBusy(false);
    }
  };

  return (
    <LinearGradient colors={T.gradBg} style={LG.root}>
      {/* Glow orbs */}
      <View style={[LG.orb, LG.orb1]} />
      <View style={[LG.orb, LG.orb2]} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={LG.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <Animated.View style={[LG.logoWrap, { opacity: fade, transform: [{ translateY: slide }] }]}>
            <LinearGradient colors={T.gradAccent} style={LG.logoCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={LG.om}>ॐ</Text>
            </LinearGradient>
            <Text style={LG.appName}>Margdarshak</Text>
            <Text style={LG.tagline1}>आपका आध्यात्मिक मित्र</Text>
            <Text style={LG.tagline2}>Your Spiritual Companion</Text>
          </Animated.View>

          {/* Card */}
          <Animated.View style={[LG.card, { opacity: fade, transform: [{ translateY: slide }] }]}>
            <Text style={LG.cardTitle}>Welcome</Text>
            <Text style={LG.cardSub}>
              Ask in Hindi, English, or Hinglish — get wisdom straight from the scriptures.
            </Text>

            {!!err && <View style={LG.errRow}><Text style={LG.errTxt}>⚠ {err}</Text></View>}

            <TouchableOpacity onPress={handleGoogleSignIn} disabled={busy} activeOpacity={0.85} style={{ marginTop: 24 }}>
              <LinearGradient colors={['#4285F4', '#34A853']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[LG.btn, busy && { opacity: 0.6 }]}>
                {busy
                  ? <ActivityIndicator color="#fff" size="small" />
                  : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Text style={{ fontSize: 20 }}>🔐</Text>
                      <Text style={LG.btnTxt}>Continue with Google</Text>
                    </View>
                  )}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={{ fontSize: 11, color: T.text3, textAlign: 'center', marginTop: 16, lineHeight: 16 }}>
              By continuing, you agree to receive spiritual guidance based on Hindu scriptures.
            </Text>
          </Animated.View>

          {/* Verse */}
          <Animated.View style={[LG.verse, { opacity: fade }]}>
            <Text style={LG.verseD}>कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।</Text>
            <Text style={LG.verseR}>karmaṇy evādhikāras te mā phaleṣu kadācana</Text>
            <View style={LG.verseSrcRow}>
              <View style={LG.verseDot} />
              <Text style={LG.verseS}>Bhagavad Gita · 2.47</Text>
            </View>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const LG = StyleSheet.create({
  root:       { flex: 1, backgroundColor: T.bg },
  orb:        { position: 'absolute', borderRadius: T.rFull, opacity: 0.12 },
  orb1:       { width: 420, height: 420, backgroundColor: '#F97316', top: -180, right: -120 },
  orb2:       { width: 300, height: 300, backgroundColor: '#A78BFA', bottom: 0, left: -120 },
  scroll:     { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 60 },
  logoWrap:   { alignItems: 'center', marginBottom: 36 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: '#F97316', shadowOpacity: 0.5, shadowRadius: 24, elevation: 12 },
  om:         { fontSize: 36, color: '#fff', fontWeight: '800' },
  appName:    { fontSize: 36, fontWeight: '800', color: T.text1, letterSpacing: -0.5 },
  tagline1:   { fontSize: 15, color: T.gold, marginTop: 6, fontStyle: 'italic' },
  tagline2:   { fontSize: 12, color: T.text3, marginTop: 2 },
  card:       { backgroundColor: T.bgSurface2, borderRadius: T.r24, padding: 24, borderWidth: 1, borderColor: T.border, marginBottom: 32 },
  cardTitle:  { fontSize: 22, fontWeight: '700', color: T.text1, marginBottom: 6 },
  cardSub:    { fontSize: 13, color: T.text2, lineHeight: 20, marginBottom: 24 },
  field:      { marginBottom: 16 },
  label:      { fontSize: 10, fontWeight: '700', color: T.text3, letterSpacing: 1.2, marginBottom: 7 },
  input:      { backgroundColor: T.bgSurface, borderWidth: 1, borderColor: T.border, borderRadius: T.r12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: T.text1 },
  errRow:     { backgroundColor: 'rgba(248,113,113,0.08)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.2)', borderRadius: T.r8, padding: 10, marginBottom: 16 },
  errTxt:     { color: T.red, fontSize: 13 },
  btn:        { borderRadius: T.r12, paddingVertical: 15, alignItems: 'center', justifyContent: 'center', minHeight: 50 },
  btnTxt:     { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },
  verse:      { alignItems: 'center', paddingHorizontal: 8 },
  verseD:     { fontSize: 14, color: T.gold, fontStyle: 'italic', textAlign: 'center', lineHeight: 24 },
  verseR:     { fontSize: 12, color: T.text3, textAlign: 'center', marginTop: 4, fontStyle: 'italic' },
  verseSrcRow:{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  verseDot:   { width: 4, height: 4, borderRadius: 2, backgroundColor: T.accent },
  verseS:     { fontSize: 11, color: T.accent, fontWeight: '600', letterSpacing: 0.5 },
});

/* ═══════════════════════════════════════════════
   CHAT APP
═══════════════════════════════════════════════ */
function ChatApp() {
  const { user, sessionToken, logout } = useAuthStore();
  const name = user?.name?.split(' ')[0] || 'Seeker';
  const [msgs, setMsgs]           = useState<Msg[]>([]);
  const [input, setInput]         = useState('');
  const [busy, setBusy]           = useState(false);
  const [convId, setConvId]       = useState<string | null>(null);
  const [convTitle, setConvTitle] = useState<string | null>(null);
  const [cat, setCat]             = useState<string | null>(null);
  const [history, setHistory]     = useState<Conv[]>([]);
  const [drawer, setDrawer]       = useState(false);
  const listRef   = useRef<FlatList>(null);
  const drawerX   = useRef(new Animated.Value(-320)).current;
  const dotAnim   = useRef(new Animated.Value(0)).current;


  useEffect(() => { greet(); fetchHist(); }, []);

  useEffect(() => {
    if (!busy) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(dotAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(dotAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [busy]);

  const greet = () => setMsgs([{
    id: 'g0',
    role: 'assistant',
    content: `Namaste, **${name}** 🙏\n\nमैं Margdarshak हूँ — आपका आध्यात्मिक मित्र।\n\nAsk me anything in *Hindi, English, or Hinglish* — I'll reply in the same language and always bring you direct wisdom from the scriptures.\n\nWhat's on your mind?`,
    chips: CATS,
    starters: STARTERS,
  }]);

  const fetchHist = async () => {
    try {
      const r = await fetch(`${API}/api/conversations`, { headers: { Authorization: `Bearer ${sessionToken}` } });
      if (r.ok) setHistory(await r.json());
    } catch (_) {}
  };

  const openDrawer = () => {
    fetchHist(); setDrawer(true);
    Animated.spring(drawerX, { toValue: 0, tension: 70, friction: 12, useNativeDriver: true }).start();
  };
  const closeDrawer = () => {
    Animated.timing(drawerX, { toValue: -320, duration: 220, useNativeDriver: true }).start(() => setDrawer(false));
  };
  const newChat = () => {
    closeDrawer();
    setConvId(null);
    setConvTitle(null);
    setCat(null);
    greet();
  };

  const loadConv = async (c: Conv) => {
    closeDrawer();
    try {
      const r = await fetch(`${API}/api/conversations/${c.conversation_id}`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (r.ok) {
        const d = await r.json();
        setConvId(c.conversation_id);
        setConvTitle(d.title ?? null);
        setCat(d.category);
        // Restore messages — detect videos for assistant messages
        setMsgs(d.messages.map((m: any) => ({
          id: m.message_id,
          role: m.role,
          content: m.content,
          ...(m.role === 'assistant' ? { videos: detectVideos(m.content) } : {}),
        })));
        setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 100);
      }
    } catch (_) {}
  };

  const send = async (text?: string, c?: string) => {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    setInput('');
    setBusy(true);
    // Optimistically add the user bubble
    setMsgs(p => [...p, { id: `u${Date.now()}`, role: 'user', content: q }]);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    try {
      const r = await fetch(`${API}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}` },
        // Always pass the current convId so the backend uses the right conversation thread
        body: JSON.stringify({ question: q, category: c ?? cat, conversation_id: convId }),
      });
      if (r.ok) {
        const d = await r.json();
        // Lock in the conversation ID from first reply onwards
        setConvId(d.conversation_id);
        if (d.title && !convTitle) setConvTitle(d.title);
        setMsgs(p => [
          ...p,
          { id: `a${Date.now()}`, role: 'assistant', content: d.response, videos: detectVideos(d.response) },
        ]);
        fetchHist();
      } else {
        const err = await r.json().catch(() => ({}));
        setMsgs(p => [...p, { id: `e${Date.now()}`, role: 'system', content: err.detail || 'Something went wrong. Please try again.' }]);
      }
    } catch (_) {
      setMsgs(p => [...p, { id: `e${Date.now()}`, role: 'system', content: 'Connection error. Is the backend running?' }]);
    } finally {
      setBusy(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }
  };

  const activeCat = CATS.find(c => c.key === cat);

  /* ── message renderer ── */
  const renderMsg = ({ item }: { item: Msg }) => {
    if (item.role === 'system') return (
      <View style={CH.sysRow}><Text style={CH.sysTxt}>{item.content}</Text></View>
    );
    const isUser = item.role === 'user';
    const parts  = parse(item.content);

    return (
      <View style={[CH.msgRow, isUser && CH.msgRowUser]}>
        {/* AI avatar */}
        {!isUser && (
          <LinearGradient colors={T.gradAccent} style={CH.avatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={CH.avatarTxt}>ॐ</Text>
          </LinearGradient>
        )}

        <View style={[CH.msgCol, isUser && CH.msgColUser]}>
          {/* Sender label */}
          {!isUser && <Text style={CH.senderName}>Margdarshak</Text>}

          {/* Bubble */}
          {isUser ? (
            <LinearGradient colors={['#F97316', '#FB923C']} style={CH.userBubble} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={CH.userTxt}>{item.content}</Text>
            </LinearGradient>
          ) : (
            <View style={CH.aiBubble}>
              {parts.map((pt, i) =>
                pt.type === 'shloka'
                  ? <ShlokaCard key={i} block={pt.text} />
                  : <RichText key={i} text={pt.text.trim()} isUser={false} />
              )}
            </View>
          )}

          {/* YouTube videos */}
          {!isUser && item.videos && item.videos.length > 0 && (
            <VideosRow videos={item.videos} />
          )}

          {/* Category chips */}
          {item.chips && (
            <View style={CH.chipsGrid}>
              {item.chips.map(ch => (
                <TouchableOpacity
                  key={ch.key}
                  style={[CH.chip, { backgroundColor: ch.bg, borderColor: ch.color + '44' }]}
                  onPress={() => { setCat(ch.key); send(`Tell me about ${ch.label}`, ch.key); }}
                  activeOpacity={0.7}
                >
                  <Text style={CH.chipIcon}>{ch.icon}</Text>
                  <Text style={[CH.chipTxt, { color: ch.color }]}>{ch.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Suggested starters */}
          {item.starters && (
            <View style={CH.starters}>
              <Text style={CH.startLabel}>— or try asking</Text>
              {item.starters.map((s, i) => (
                <TouchableOpacity key={i} style={CH.startBtn} onPress={() => send(s.hi)} activeOpacity={0.7}>
                  <Text style={CH.startArrow}>→</Text>
                  <Text style={CH.startTxt}>{s.hi}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={CH.root}>
      {/* ── Header ── */}
      <LinearGradient colors={T.gradHeader} style={CH.header}>
        <TouchableOpacity style={CH.headerIcon} onPress={openDrawer} activeOpacity={0.7}>
          <View style={CH.iconBtn}>
            <View style={CH.bar} /><View style={[CH.bar, CH.barMid]} /><View style={[CH.bar, CH.barShort]} />
          </View>
        </TouchableOpacity>

        <View style={CH.headerCenter}>
          <LinearGradient colors={T.gradAccent} style={CH.headerDot} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={CH.headerDotTxt}>ॐ</Text>
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={CH.headerTitle} numberOfLines={1}>
              {convTitle
                ? convTitle.length > 28 ? convTitle.slice(0, 28) + '…' : convTitle
                : 'Margdarshak'}
            </Text>
            <View style={CH.statusRow}>
              <View style={[CH.onlineGreen, convId && { backgroundColor: T.gold }]} />
              <Text style={CH.statusTxt}>
                {convId
                  ? `${msgs.filter(m => m.role !== 'system').length} messages · continuing`
                  : activeCat
                    ? `${activeCat.icon} ${activeCat.label}`
                    : 'New conversation'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={CH.headerIcon} onPress={newChat} activeOpacity={0.7}>
          <View style={CH.iconBtn}>
            <Text style={CH.newIcon}>✎</Text>
          </View>
        </TouchableOpacity>
      </LinearGradient>

      {/* ── Messages ── */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <FlatList
          ref={listRef}
          data={msgs}
          keyExtractor={m => m.id}
          renderItem={renderMsg}
          contentContainerStyle={CH.list}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Typing indicator */}
        {busy && (
          <View style={CH.typingRow}>
            <LinearGradient colors={T.gradAccent} style={CH.avatar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <Text style={CH.avatarTxt}>ॐ</Text>
            </LinearGradient>
            <View style={CH.typingBubble}>
              {[0, 1, 2].map(i => (
                <Animated.View key={i} style={[CH.typingDot, {
                  opacity: dotAnim.interpolate({ inputRange: [0, 1], outputRange: i === 1 ? [1, 0.3] : [0.3, 1] })
                }]} />
              ))}
            </View>
            <Text style={CH.typingLabel}>Seeking wisdom…</Text>
          </View>
        )}

        {/* ── Input ── */}
        <View style={CH.inputWrap}>
          <View style={CH.inputRow}>
            <TextInput
              style={CH.input}
              value={input}
              onChangeText={setInput}
              placeholder="पूछिए… Ask anything…"
              placeholderTextColor={T.text3}
              multiline
              maxLength={1200}
            />
            <TouchableOpacity
              style={[CH.sendWrap, (!input.trim() || busy) && CH.sendWrapOff]}
              onPress={() => send()}
              disabled={!input.trim() || busy}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={input.trim() && !busy ? T.gradAccent : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.08)']}
                style={CH.sendBtn}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              >
                <Text style={[CH.sendTxt, !input.trim() && { opacity: 0.4 }]}>↑</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <Text style={CH.inputHint}>Ask in any language · Powered by Margdarshak AI</Text>
        </View>
      </KeyboardAvoidingView>

      {/* ── Drawer overlay ── */}
      {drawer && (
        <Pressable style={CH.overlay} onPress={closeDrawer}>
          <Animated.View style={[CH.drawer, { transform: [{ translateX: drawerX }] }]}>
            <Pressable>
              {/* Drawer header */}
              <LinearGradient colors={['rgba(249,115,22,0.1)', 'rgba(6,6,12,0)']} style={CH.drawerHead}>
                <LinearGradient colors={T.gradAccent} style={CH.drawerLogo} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={CH.drawerLogoTxt}>ॐ</Text>
                </LinearGradient>
                <Text style={CH.drawerApp}>Margdarshak</Text>
                <View style={CH.drawerDivider} />
                <Text style={CH.drawerUser}>{user?.name}</Text>
                <Text style={CH.drawerEmail}>{user?.email}</Text>
              </LinearGradient>

              {/* New chat */}
              <View style={CH.drawerSection}>
                <TouchableOpacity style={CH.newChatBtn} onPress={newChat} activeOpacity={0.8}>
                  <Text style={CH.newChatTxt}>✎  New conversation</Text>
                </TouchableOpacity>
              </View>

              {/* History */}
              <Text style={CH.drawerSec}>RECENT</Text>
              <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
                {history.length === 0
                  ? <Text style={CH.emptyHist}>No conversations yet</Text>
                  : history.map(cv => (
                    <TouchableOpacity key={cv.conversation_id} style={CH.histItem} onPress={() => loadConv(cv)} activeOpacity={0.7}>
                      <View style={CH.histAccent} />
                      <View style={{ flex: 1 }}>
                        <Text style={CH.histTitle} numberOfLines={2}>{cv.title}</Text>
                        <Text style={CH.histDate}>{new Date(cv.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                }
              </ScrollView>

              {/* Logout */}
              <TouchableOpacity style={CH.logoutBtn} onPress={logout} activeOpacity={0.8}>
                <Text style={CH.logoutTxt}>Sign out</Text>
              </TouchableOpacity>
            </Pressable>
          </Animated.View>
        </Pressable>
      )}
    </View>
  );
}

const CH = StyleSheet.create({
  root:       { flex: 1, backgroundColor: T.bg },

  // Header
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'web' ? 16 : 54, paddingBottom: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderColor: T.border },
  headerIcon: { padding: 4 },
  iconBtn:    { width: 36, height: 36, borderRadius: T.r8, backgroundColor: T.bgSurface2, justifyContent: 'center', alignItems: 'center', gap: 4, paddingVertical: 8 },
  bar:        { width: 18, height: 1.5, backgroundColor: T.text2, borderRadius: 2 },
  barMid:     { width: 14 },
  barShort:   { width: 10 },
  newIcon:    { fontSize: 17, color: T.text2 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerDot:  { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', shadowColor: T.accent, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  headerDotTxt:{ fontSize: 16, color: '#fff', fontWeight: '800' },
  headerTitle:{ fontSize: 16, fontWeight: '700', color: T.text1, letterSpacing: -0.2 },
  statusRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 1 },
  onlineGreen:{ width: 6, height: 6, borderRadius: 3, backgroundColor: T.green },
  statusTxt:  { fontSize: 11, color: T.text3 },

  // Messages
  list:       { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
  sysRow:     { alignItems: 'center', marginVertical: 8 },
  sysTxt:     { color: T.red, fontSize: 13 },
  msgRow:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, gap: 10 },
  msgRowUser: { justifyContent: 'flex-end' },
  avatar:     { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', flexShrink: 0, shadowColor: T.accent, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
  avatarTxt:  { fontSize: 14, color: '#fff', fontWeight: '800' },
  msgCol:     { flex: 1, maxWidth: '88%' },
  msgColUser: { alignItems: 'flex-end', flex: 0 },
  senderName: { fontSize: 11, fontWeight: '700', color: T.accent, letterSpacing: 0.4, marginBottom: 5 },
  userBubble: { borderRadius: T.r20, borderBottomRightRadius: T.r4, paddingHorizontal: 16, paddingVertical: 12, maxWidth: Dimensions.get('window').width * 0.72 },
  userTxt:    { fontSize: 15, color: '#fff', lineHeight: 24 },
  aiBubble:   { paddingBottom: 4 },

  // Chips
  chipsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  chip:       { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 13, paddingVertical: 8, borderRadius: T.rFull, borderWidth: 1 },
  chipIcon:   { fontSize: 14 },
  chipTxt:    { fontSize: 13, fontWeight: '600' },

  // Suggested starters
  starters:   { marginTop: 14, gap: 8 },
  startLabel: { fontSize: 11, color: T.text3, letterSpacing: 0.5, marginBottom: 2 },
  startBtn:   { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: T.bgSurface2, borderRadius: T.r12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: T.border },
  startArrow: { color: T.accent, fontSize: 14, fontWeight: '700', marginTop: 1 },
  startTxt:   { color: T.text2, fontSize: 13, lineHeight: 20, flex: 1 },

  // Typing
  typingRow:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10, gap: 10 },
  typingBubble:{ flexDirection: 'row', alignItems: 'center', backgroundColor: T.bgSurface2, borderRadius: T.r16, paddingHorizontal: 14, paddingVertical: 10, gap: 5, borderWidth: 1, borderColor: T.border },
  typingDot:  { width: 7, height: 7, borderRadius: 3.5, backgroundColor: T.accent },
  typingLabel:{ fontSize: 12, color: T.text3, fontStyle: 'italic' },

  // Input
  inputWrap:  { borderTopWidth: 1, borderColor: T.border, backgroundColor: T.bg, paddingHorizontal: 16, paddingTop: 12, paddingBottom: Platform.OS === 'web' ? 12 : 28 },
  inputRow:   { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  input:      { flex: 1, minHeight: 48, maxHeight: 130, backgroundColor: T.bgSurface2, borderWidth: 1, borderColor: T.border, borderRadius: T.r16, paddingHorizontal: 18, paddingVertical: 13, fontSize: 15, color: T.text1, lineHeight: 22 },
  sendWrap:   { flexShrink: 0 },
  sendWrapOff:{},
  sendBtn:    { width: 48, height: 48, borderRadius: T.r16, justifyContent: 'center', alignItems: 'center' },
  sendTxt:    { color: '#fff', fontSize: 22, fontWeight: '700', marginTop: -2 },
  inputHint:  { fontSize: 11, color: T.text3, textAlign: 'center', marginTop: 8 },

  // Drawer
  overlay:    { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 30 },
  drawer:     { position: 'absolute', left: 0, top: 0, bottom: 0, width: 300, backgroundColor: '#0A0A14', borderRightWidth: 1, borderColor: T.border, zIndex: 31 },
  drawerHead: { padding: 24, paddingTop: Platform.OS === 'web' ? 28 : 60 },
  drawerLogo: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 12, shadowColor: T.accent, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  drawerLogoTxt:{ fontSize: 20, color: '#fff', fontWeight: '800' },
  drawerApp:  { fontSize: 20, fontWeight: '800', color: T.text1, letterSpacing: -0.3 },
  drawerDivider:{ height: 1, backgroundColor: T.border, marginVertical: 14 },
  drawerUser: { fontSize: 15, fontWeight: '600', color: T.text1 },
  drawerEmail:{ fontSize: 12, color: T.text3, marginTop: 2 },
  drawerSection:{ paddingHorizontal: 16, paddingBottom: 12 },
  newChatBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: T.borderAccent, borderRadius: T.r12, paddingVertical: 12, paddingHorizontal: 16, backgroundColor: T.accentMuted },
  newChatTxt: { color: T.accent, fontWeight: '600', fontSize: 14 },
  drawerSec:  { paddingHorizontal: 16, paddingVertical: 8, fontSize: 10, color: T.text3, fontWeight: '700', letterSpacing: 1.5 },
  emptyHist:  { paddingHorizontal: 16, color: T.text3, fontSize: 13, fontStyle: 'italic' },
  histItem:   { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderColor: T.border, gap: 12 },
  histAccent: { width: 2, height: '100%', minHeight: 16, backgroundColor: T.accentGlow, borderRadius: 2, marginTop: 3 },
  histTitle:  { fontSize: 13, color: T.text2, lineHeight: 20 },
  histDate:   { fontSize: 11, color: T.text3, marginTop: 3 },
  logoutBtn:  { margin: 16, padding: 13, borderRadius: T.r12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(248,113,113,0.2)', backgroundColor: 'rgba(248,113,113,0.05)' },
  logoutTxt:  { color: T.red, fontWeight: '600', fontSize: 13 },
});

/* ═══════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════ */
export default function App() {
  const { user, sessionToken, isLoading } = useAuthStore();
  const { prefs, isLoading: prefsLoading, load } = usePreferencesStore();

  // Load preferences whenever a user session appears
  useEffect(() => {
    if (user && sessionToken) load(sessionToken);
  }, [user?.user_id]);

  // ── Splash / loading ──────────────────���───────────────────────────────
  if (isLoading || (user && prefsLoading)) return (
    <LinearGradient colors={T.gradBg} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <LinearGradient
        colors={T.gradAccent}
        style={{ width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', shadowColor: T.accent, shadowOpacity: 0.5, shadowRadius: 24, elevation: 12 }}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <Text style={{ fontSize: 32, color: '#fff' }}>ॐ</Text>
      </LinearGradient>
      <ActivityIndicator color={T.accent} style={{ marginTop: 24 }} />
    </LinearGradient>
  );

  // ── Not logged in ──────────��───────────────────────────────────���──────
  if (!user || !sessionToken) return <LoginScreen />;

  // ── Onboarding not yet completed ───────��──────────────────────────────
  if (!prefs?.onboarding_completed) {
    return (
      <OnboardingFlow
        token={sessionToken}
        userName={user.name?.split(' ')[0] ?? 'Seeker'}
        onComplete={() => load(sessionToken)}
      />
    );
  }

  // ── Main chat ───────────��─────────────────────────────────────────────
  return <ChatApp />;
}
