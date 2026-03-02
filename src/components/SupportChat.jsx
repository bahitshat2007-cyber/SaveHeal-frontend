import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config';

export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBugForm, setShowBugForm] = useState(false);
  const { user, api } = useAuth();
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Подключаемся к WebSocket при открытии чата
  useEffect(() => {
    if (!user || !open) return;
    if (socketRef.current?.connected) return;

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.emit('join', user.id);

    // Получаем ответ от админа в реальном времени
    socket.on('new_reply', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, open]);

  // Автоскролл вниз
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    if (!user) return;
    try {
      const res = await api.get('/api/messages/my');
      setMessages(res.data);
    } catch {}
  };

  const handleOpen = () => {
    setOpen(true);
    loadMessages();
  };

  const send = async (isComplain = false) => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/api/messages', { text: text.trim(), isComplain });
      setMessages(prev => [...prev, res.data]);
      setText('');
      setShowBugForm(false);
    } catch {}
    setLoading(false);
  };

  if (!user) return null;

  return (
    <>
      {/* Кнопка чата */}
      <button
        onClick={handleOpen}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--green-500), var(--green-600))',
          color: 'white',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(34,197,94,0.4)',
          zIndex: 999,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
      >
        💬
      </button>

      {/* Окно чата */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: '5.5rem',
          right: '1.5rem',
          width: '350px',
          maxWidth: 'calc(100vw - 2rem)',
          height: '450px',
          maxHeight: 'calc(100vh - 8rem)',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 999,
          overflow: 'hidden',
          animation: 'fadeIn 0.3s ease',
        }}>
          {/* Шапка */}
          <div style={{
            background: 'linear-gradient(135deg, var(--green-500), var(--green-600))',
            color: 'white',
            padding: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <strong>Поддержка</strong>
              <p style={{ fontSize: '0.75rem', opacity: 0.85, margin: 0 }}>SaveHeal Foods · онлайн</p>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}>✕</button>
          </div>

          {/* Сообщения */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}>
            {messages.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2rem' }}>
                Напишите нам — мы поможем! 😊
              </p>
            )}
            {messages.map(m => (
              <div key={m.id} style={{
                alignSelf: m.sender?.role === 'ADMIN' ? 'flex-start' : 'flex-end',
                background: m.sender?.role === 'ADMIN' ? 'var(--green-50)' : 'var(--green-500)',
                color: m.sender?.role === 'ADMIN' ? 'var(--text-dark)' : 'white',
                padding: '0.6rem 1rem',
                borderRadius: '14px',
                maxWidth: '80%',
                fontSize: '0.875rem',
                lineHeight: 1.4,
              }}>
                {m.isComplain && <span style={{ fontSize: '0.7rem', display: 'block', marginBottom: '2px' }}>🐛 Жалоба</span>}
                {m.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Кнопка жалобы */}
          {!showBugForm && (
            <button
              onClick={() => setShowBugForm(true)}
              style={{
                margin: '0 1rem',
                padding: '0.4rem',
                background: '#fef3c7',
                border: '1px solid #fcd34d',
                borderRadius: '10px',
                fontSize: '0.75rem',
                color: '#92400e',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              ⚠️Если возникла системная ошибка, нажмите сюда
            </button>
          )}

          {showBugForm && (
            <div style={{ padding: '0.5rem 1rem', background: '#fef3c7', fontSize: '0.8rem', color: '#92400e' }}>
              Опишите проблему ниже — мы исправим как можно скорее!
              <button onClick={() => setShowBugForm(false)} style={{
                background: 'none', border: 'none', color: '#92400e', cursor: 'pointer', marginLeft: '0.5rem',
              }}>✕</button>
            </div>
          )}

          {/* Ввод */}
          <div style={{
            padding: '0.75rem 1rem',
            borderTop: '1px solid var(--green-100)',
            display: 'flex',
            gap: '0.5rem',
          }}>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send(showBugForm)}
              placeholder={showBugForm ? 'Опишите ошибку...' : 'Сообщение...'}
              className="input"
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.75rem' }}
            />
            <button
              onClick={() => send(showBugForm)}
              disabled={loading}
              className="btn-primary"
              style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}
            >
              {loading ? '...' : '→'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
