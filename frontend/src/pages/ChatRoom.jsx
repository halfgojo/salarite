import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Users, Zap } from 'lucide-react';

export default function ChatRoom({ userId, userName, userRole }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Fetch existing messages
    fetch('http://127.0.0.1:8000/chat/messages')
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(console.error);

    // Connect via WebSocket
    const ws = new WebSocket(`ws://127.0.0.1:8000/chat/ws/${userId}`);
    
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages(prev => [...prev, msg]);
    };

    wsRef.current = ws;
    return () => ws.close();
  }, [userId]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() || !wsRef.current) return;
    
    wsRef.current.send(JSON.stringify({ text: text.trim() }));
    setText('');
  };

  const getInitials = (name) => {
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (role) => {
    if (role === 'employer') return 'linear-gradient(135deg, #F59E0B, #D97706)';
    return 'linear-gradient(135deg, var(--primary-light), var(--secondary))';
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4rem)' }}>
      
      <div className="page-header" style={{ flexShrink: 0 }}>
        <h1>Team Chat</h1>
        <p>Real-time communication between Employer and Virtual HR team.</p>
      </div>

      {/* Chat Container */}
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        
        {/* Chat Header */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div className="flex items-center gap-3">
            <div className="card-title-icon" style={{ background: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)', color: '#7C3AED', width: 36, height: 36, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageCircle size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>Salarite Team Channel</div>
              <div className="text-xs text-muted">Employer & Virtual HR Communication</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="live-pulse">
              <span className="live-pulse-dot" style={{ background: connected ? 'var(--secondary)' : 'var(--danger)', boxShadow: connected ? '0 0 6px rgba(16, 185, 129, 0.5)' : '0 0 6px rgba(239, 68, 68, 0.5)' }}></span>
              {connected ? 'Connected' : 'Reconnecting...'}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted">
              <Users size={14} /> Team
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#FAFBFC' }}>
          {messages.length === 0 && (
            <div className="empty-state" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div className="empty-state-icon"><Zap size={24} /></div>
              <p className="text-sm text-muted">No messages yet. Start a conversation!</p>
              <p className="text-xs text-muted mt-1">Messages between Employer and HR appear here in real-time.</p>
            </div>
          )}
          
          {messages.map((msg, idx) => {
            const isMe = msg.user_id === userId;
            return (
              <div key={msg.id || idx} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', gap: '0.5rem', animation: 'slideInUp 0.2s ease' }}>
                {!isMe && (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: getAvatarColor(msg.user_role), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.625rem', fontWeight: 700, flexShrink: 0, marginTop: '0.125rem' }}>
                    {getInitials(msg.user_name)}
                  </div>
                )}
                <div style={{ maxWidth: '65%' }}>
                  {!isMe && (
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>{msg.user_name}</span>
                      <span className="badge" style={{ padding: '0.125rem 0.5rem', fontSize: '0.5625rem', background: msg.user_role === 'employer' ? '#FEF3C7' : '#E0E7FF', color: msg.user_role === 'employer' ? '#92400E' : '#3730A3' }}>
                        {msg.user_role === 'employer' ? 'EMPLOYER' : 'HR'}
                      </span>
                    </div>
                  )}
                  <div style={{
                    padding: '0.625rem 1rem',
                    borderRadius: isMe ? '1rem 1rem 0.25rem 1rem' : '0.25rem 1rem 1rem 1rem',
                    background: isMe ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : 'white',
                    color: isMe ? 'white' : 'var(--text-main)',
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                    boxShadow: isMe ? '0 2px 8px rgba(99, 102, 241, 0.2)' : 'var(--shadow-sm)',
                    border: isMe ? 'none' : '1px solid var(--border-color)',
                    wordBreak: 'break-word'
                  }}>
                    {msg.text}
                  </div>
                  <div className="text-xs text-muted mt-1" style={{ textAlign: isMe ? 'right' : 'left' }}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={sendMessage} style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem', flexShrink: 0, background: 'white' }}>
          <input
            className="form-control"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type a message..."
            style={{ flex: 1, margin: 0 }}
          />
          <button type="submit" className="btn btn-primary" disabled={!text.trim()} style={{ opacity: text.trim() ? 1 : 0.5 }}>
            <Send size={16} /> Send
          </button>
        </form>
      </div>
    </div>
  );
}
