import { useEffect, useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

const API_BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

interface Message {
  message_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  streaming?: boolean;  // true while tokens are still arriving
}

export default function ChatScreen() {
  const { id, category } = useLocalSearchParams<{ id: string; category?: string }>();
  const { sessionToken } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const conversationId = useRef<string | null>(id !== 'new' ? id : null);

  useEffect(() => {
    if (id !== 'new') loadConversation();
  }, [id]);

  const loadConversation = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/conversations/${id}`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (res.ok) {
        const conv = await res.json();
        setMessages(conv.messages);
      }
    } catch (_) {}
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);

    // Add user bubble immediately
    const userMsgId = `user_${Date.now()}`;
    const userMsg: Message = {
      message_id: userMsgId,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Add empty assistant bubble that we'll fill token-by-token
    const streamMsgId = `stream_${Date.now()}`;
    const streamingMsg: Message = {
      message_id: streamMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      streaming: true,
    };
    setMessages((prev) => [...prev, streamingMsg]);

    try {
      const res = await fetch(`${API_BASE}/api/ask/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          question: text,
          category: category || null,
          conversation_id: conversationId.current,
        }),
      });

      if (!res.ok || !res.body) throw new Error('Stream failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';   // keep incomplete last line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const evt = JSON.parse(line.slice(6));

            if (!evt.done) {
              // Append token to streaming bubble
              setMessages((prev) =>
                prev.map((m) =>
                  m.message_id === streamMsgId
                    ? { ...m, content: m.content + evt.token }
                    : m
                )
              );
            } else {
              // Stream finished — mark bubble as complete
              if (evt.conversation_id) {
                conversationId.current = evt.conversation_id;
              }
              setMessages((prev) =>
                prev.map((m) =>
                  m.message_id === streamMsgId
                    ? { ...m, streaming: false }
                    : m
                )
              );
            }
          } catch (_) {}
        }
      }
    } catch (_) {
      // On error remove the empty streaming bubble
      setMessages((prev) => prev.filter((m) => m.message_id !== streamMsgId));
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
      {item.role === 'assistant' && (
        <Text style={styles.aiLabel}>
          Margdarshak{item.streaming ? ' ✦' : ''}
        </Text>
      )}
      <Text style={[styles.bubbleText, item.role === 'user' ? styles.userText : styles.aiText]}>
        {item.content}
        {item.streaming && item.content === '' ? '...' : ''}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.message_id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask your question..."
          placeholderTextColor="#999"
          multiline
          onSubmitEditing={sendMessage}
          editable={!sending}
        />
        <TouchableOpacity style={[styles.sendBtn, sending && styles.sendBtnDisabled]} onPress={sendMessage} disabled={sending}>
          {sending
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.sendText}>Send</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  messageList: { padding: 16, paddingBottom: 8 },
  bubble: { maxWidth: '85%', borderRadius: 16, padding: 12, marginVertical: 4 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#FF9933' },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: '#fff', borderWidth: 1, borderColor: '#FFE0B2' },
  aiLabel: { fontSize: 11, color: '#FF9933', fontWeight: '600', marginBottom: 4 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  userText: { color: '#fff' },
  aiText: { color: '#333' },
  inputRow: {
    flexDirection: 'row', padding: 12,
    borderTopWidth: 1, borderColor: '#FFE0B2',
    backgroundColor: '#fff', alignItems: 'flex-end',
  },
  input: {
    flex: 1, minHeight: 40, maxHeight: 120,
    borderWidth: 1, borderColor: '#FFD180', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, color: '#333', backgroundColor: '#FFF8F0',
  },
  sendBtn: {
    marginLeft: 10, backgroundColor: '#FF9933',
    borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10,
    minWidth: 60, alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#FFCC99' },
  sendText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
