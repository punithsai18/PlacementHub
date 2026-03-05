import React, { useState, useEffect, useRef } from 'react';
import { initChatConnection, disconnectChat } from '../services/chatService';
import { chatApi } from '../services/api';

const styles = {
  container: { maxWidth: '800px', margin: '0 auto' },
  title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '16px', color: '#0078d4' },
  chatBox: { background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', height: '500px' },
  messages: { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' },
  messageSelf: { alignSelf: 'flex-end', background: '#0078d4', color: '#fff', padding: '10px 16px', borderRadius: '18px 18px 4px 18px', maxWidth: '70%', fontSize: '14px', wordBreak: 'break-word' },
  messageOther: { alignSelf: 'flex-start', background: '#f0f0f0', color: '#333', padding: '10px 16px', borderRadius: '18px 18px 18px 4px', maxWidth: '70%', fontSize: '14px', wordBreak: 'break-word' },
  inputArea: { display: 'flex', gap: '8px', padding: '12px 16px', borderTop: '1px solid #f0f0f0' },
  input: { flex: 1, padding: '10px 14px', border: '1px solid #ddd', borderRadius: '24px', fontSize: '14px', outline: 'none' },
  btn: { padding: '10px 20px', background: '#0078d4', color: '#fff', border: 'none', borderRadius: '24px', cursor: 'pointer', fontWeight: '600' },
  statusBar: { padding: '8px 16px', background: '#f5f5f5', borderBottom: '1px solid #e0e0e0', fontSize: '13px', color: '#666', borderRadius: '8px 8px 0 0' },
  connected: { color: '#107c10' },
  disconnected: { color: '#d13438' }
};

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [toUserId, setToUserId] = useState('');
  const chatRef = useRef(null);
  const messagesEndRef = useRef(null);
  const myUserId = localStorage.getItem('userId');

  useEffect(() => {
    // Load chat history
    async function loadHistory() {
      try {
        const { data } = await chatApi.getHistory(myUserId);
        setMessages(data.map(m => ({
          id: m.id,
          text: m.message,
          fromSelf: m.fromUserId === myUserId,
          fromUserId: m.fromUserId,
          timestamp: m.timestamp
        })));
      } catch {
        // Chat history unavailable (Cosmos DB may not be configured)
      }
    }
    loadHistory();

    // Initialize WebSocket connection
    async function connect() {
      chatRef.current = await initChatConnection(
        (payload) => {
          // Skip echo of our own messages (identified by localId we set when sending)
          if (payload.localId) return;
          setMessages(prev => [...prev, {
            id: Date.now(),
            text: payload.message || payload.text || JSON.stringify(payload),
            fromSelf: payload.fromUserId === myUserId,
            fromUserId: payload.fromUserId || 'other',
            timestamp: new Date().toISOString()
          }]);
        },
        () => setConnected(true),
        () => setConnected(false)
      );
    }
    connect();

    return () => disconnectChat();
  }, [myUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim()) return;
    const messageText = input.trim();
    setInput('');

    const newMsg = {
      id: Date.now(),
      text: messageText,
      fromSelf: true,
      fromUserId: myUserId,
      timestamp: new Date().toISOString()
    };

    // Add optimistically; if WebSocket echo is received, de-duplicate by timestamp+text
    setMessages(prev => [...prev, newMsg]);

    // Send via WebSocket if connected (server will broadcast to others; we already added locally)
    if (chatRef.current?.send) {
      chatRef.current.send({ fromUserId: myUserId, toUserId, message: messageText, localId: newMsg.id });
    }

    // Persist to Cosmos DB
    try {
      await chatApi.sendMessage({ toUserId: toUserId || null, message: messageText });
    } catch {
      // Graceful degradation if persistence fails
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>💬 Real-Time Chat</h2>
      <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          style={{ ...styles.input, borderRadius: '4px', flex: '0 0 250px' }}
          placeholder="Recipient User ID (optional)"
          value={toUserId}
          onChange={e => setToUserId(e.target.value)}
        />
        <span style={{ fontSize: '13px', color: '#666' }}>Leave blank for broadcast</span>
      </div>
      <div style={styles.chatBox}>
        <div style={styles.statusBar}>
          Status: <span style={connected ? styles.connected : styles.disconnected}>
            {connected ? '● Connected' : '○ Disconnected (real-time unavailable)'}
          </span>
          {' — Powered by Azure Web PubSub'}
        </div>
        <div style={styles.messages}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: '#aaa', marginTop: '40px' }}>
              No messages yet. Start a conversation!
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} style={msg.fromSelf ? styles.messageSelf : styles.messageOther}>
              {msg.text}
              <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '4px' }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div style={styles.inputArea}>
          <input
            style={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
          />
          <button style={styles.btn} onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}
