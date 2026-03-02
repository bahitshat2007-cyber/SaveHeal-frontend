import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';

export default function AdminChat() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const { api } = useAuth();
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Подключаемся к WebSocket (защита от двойного подключения в StrictMode)
  useEffect(() => {
    if (socketRef.current?.connected) return;

    const socket = io('http://localhost:5000');
    socketRef.current = socket;

    socket.emit('join_admin');

    // Получаем новые сообщения от клиентов в реальном времени
    socket.on('new_message', ({ message, fromUserId }) => {
      // Обновляем список юзеров
      setUsers(prev => {
        const exists = prev.find(u => u.id === fromUserId);
        if (exists) {
          return prev.map(u => u.id === fromUserId
            ? { ...u, sentMessages: [{ text: message.text, createdAt: message.createdAt, isComplain: message.isComplain }] }
            : u
          );
        }
        // Новый юзер — перезагружаем список
        loadUsers();
        return prev;
      });

      // Если открыт чат с этим юзером — добавляем сообщение (с дедупликацией)
      setSelectedUser(current => {
        if (current?.id === fromUserId) {
          setMessages(prev => {
            if (prev.some(m => m.id === message.id)) return prev;
            return [...prev, message];
          });
        }
        return current;
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // Автоскролл вниз
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadUsers = async () => {
    try {
      const res = await api.get('/api/messages/users');
      setUsers(res.data);
    } catch {}
  };

  useEffect(() => { loadUsers(); }, []);

  const openChat = async (user) => {
    setSelectedUser(user);
    try {
      const res = await api.get(`/api/messages/user/${user.id}`);
      setMessages(res.data);
    } catch {}
  };

  const sendReply = async () => {
    if (!text.trim() || !selectedUser) return;
    setLoading(true);
    try {
      const res = await api.post(`/api/messages/reply/${selectedUser.id}`, { text: text.trim() });
      setMessages(prev => [...prev, res.data]);
      setText('');
    } catch {}
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', height: 'calc(100vh - 100px)' }}>
      {/* Список пользователей */}
      <div style={{
        width: '280px', minWidth: '280px',
        background: 'white', borderRadius: '20px', overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          padding: '1rem', background: 'var(--green-500)', color: 'white',
          fontWeight: 700, fontSize: '0.95rem',
        }}>
          💬 Чаты клиентов
          <span style={{
            background: 'rgba(255,255,255,0.25)', borderRadius: '10px',
            padding: '2px 8px', fontSize: '0.75rem', marginLeft: '0.5rem',
          }}>
            {users.length}
          </span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {users.map(u => (
            <div
              key={u.id}
              onClick={() => openChat(u)}
              style={{
                padding: '0.85rem 1rem',
                cursor: 'pointer',
                borderBottom: '1px solid var(--green-50)',
                background: selectedUser?.id === u.id ? 'var(--green-50)' : 'white',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { if (selectedUser?.id !== u.id) e.target.style.background = 'var(--green-25, #f8fdf8)'; }}
              onMouseLeave={e => { if (selectedUser?.id !== u.id) e.target.style.background = 'white'; }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                {u.name || u.phone || `User #${u.id}`}
              </div>
              {u.sentMessages?.[0] && (
                <p style={{
                  fontSize: '0.78rem', color: 'var(--text-muted)',
                  margin: '0.2rem 0 0', overflow: 'hidden',
                  whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                }}>
                  {u.sentMessages[0].isComplain && '🐛 '}
                  {u.sentMessages[0].text}
                </p>
              )}
            </div>
          ))}
          {users.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '2rem' }}>
              Пока нет чатов
            </p>
          )}
        </div>
      </div>

      {/* Окно чата */}
      <div style={{
        flex: 1, background: 'white', borderRadius: '20px', overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
        display: 'flex', flexDirection: 'column',
      }}>
        {selectedUser ? (
          <>
            {/* Шапка */}
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--green-100)',
              fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <span style={{
                width: '10px', height: '10px', borderRadius: '50%',
                background: 'var(--green-400)', display: 'inline-block',
              }} />
              {selectedUser.name || selectedUser.phone || `User #${selectedUser.id}`}
            </div>

            {/* Сообщения */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '1rem',
              display: 'flex', flexDirection: 'column', gap: '0.5rem',
            }}>
              {messages.map(m => (
                <div key={m.id} style={{
                  alignSelf: m.sender?.role === 'ADMIN' ? 'flex-end' : 'flex-start',
                  background: m.sender?.role === 'ADMIN' ? 'var(--green-500)' : 'var(--green-50)',
                  color: m.sender?.role === 'ADMIN' ? 'white' : 'var(--text-dark)',
                  padding: '0.6rem 1rem',
                  borderRadius: '14px',
                  maxWidth: '70%',
                  fontSize: '0.875rem',
                  lineHeight: 1.4,
                }}>
                  {m.isComplain && <span style={{ fontSize: '0.7rem', display: 'block', marginBottom: '2px' }}>🐛 Жалоба</span>}
                  {m.text}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

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
                onKeyDown={e => e.key === 'Enter' && sendReply()}
                placeholder="Ответить..."
                className="input"
                style={{ fontSize: '0.85rem', padding: '0.6rem 0.75rem' }}
              />
              <button
                onClick={sendReply}
                disabled={loading}
                className="btn-primary"
                style={{ padding: '0.6rem 1rem', fontSize: '0.85rem' }}
              >
                {loading ? '...' : 'Отправить'}
              </button>
            </div>
          </>
        ) : (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', fontSize: '0.95rem',
          }}>
            Выберите чат слева ←
          </div>
        )}
      </div>
    </div>
  );
}
