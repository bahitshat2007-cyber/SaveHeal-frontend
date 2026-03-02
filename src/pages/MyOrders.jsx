import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config';

const STATUS_MAP = {
  PENDING: { label: 'Ожидает', color: '#f59e0b', bg: '#fef3c7', icon: '⏳' },
  PAID: { label: 'Оплачен', color: '#3b82f6', bg: '#dbeafe', icon: '💳' },
  DELIVERED: { label: 'Доставлен', color: '#22c55e', bg: '#dcfce7', icon: '✅' },
  CANCELLED: { label: 'Отменён', color: '#ef4444', bg: '#fee2e2', icon: '❌' },
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(null); // { orderId, reason, totalAmount }
  const { user, api } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  // WebSocket — слушаем отмену заказа от админа
  useEffect(() => {
    if (!user) return;
    const socket = io(SOCKET_URL);
    socket.emit('join', user.id);

    socket.on('order_cancelled', (data) => {
      setCancelModal(data);
      // Обновляем статус в списке
      setOrders(prev => prev.map(o =>
        o.id === data.orderId ? { ...o, status: 'CANCELLED', cancelReason: data.reason } : o
      ));
    });

    return () => socket.disconnect();
  }, [user]);

  const loadOrders = async () => {
    try {
      const res = await api.get('/api/orders');
      setOrders(res.data);
    } catch {}
    setLoading(false);
  };

  const cancelOrder = async (orderId) => {
    if (!confirm('Вы уверены что хотите отменить заказ?')) return;
    try {
      await api.put(`/api/orders/${orderId}/cancel`, { cancelReason: 'Отменён клиентом' });
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, status: 'CANCELLED' } : o
      ));
    } catch (err) {
      alert(err.response?.data?.error || 'Ошибка отмены');
    }
  };

  if (loading) return <div className="container fade-in" style={{ padding: '2rem', textAlign: 'center' }}>Загрузка...</div>;

  return (
    <div className="container fade-in" style={{ padding: '2rem 1rem', maxWidth: '700px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>📦 Мои заказы</h1>

      {orders.length === 0 && (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <span style={{ fontSize: '3rem' }}>🛒</span>
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>У вас пока нет заказов</p>
          <button onClick={() => navigate('/')} className="btn-primary" style={{ marginTop: '1rem' }}>За покупками</button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {orders.map(o => {
          const s = STATUS_MAP[o.status] || STATUS_MAP.PENDING;
          return (
            <div key={o.id} className="card" style={{ padding: '1.25rem' }}>
              {/* Шапка */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>Заказ №{o.id}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                    {new Date(o.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <span style={{
                  background: s.bg, color: s.color, padding: '0.3rem 0.75rem',
                  borderRadius: '20px', fontSize: '0.78rem', fontWeight: 700,
                }}>
                  {s.icon} {s.label}
                </span>
              </div>

              {/* Товары */}
              <div style={{ background: 'var(--green-50)', borderRadius: '12px', padding: '0.75rem', marginBottom: '0.75rem' }}>
                {Array.isArray(o.items) && o.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.2rem 0' }}>
                    <span>{item.name} × {item.quantity}</span>
                    <span style={{ fontWeight: 600 }}>{(item.price * item.quantity).toLocaleString()} ₸</span>
                  </div>
                ))}
              </div>

              {/* Доставка */}
              <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                🚚 {o.deliveryCity}, {o.deliveryAddr}
                {o.deliveryDate && (
                  <span style={{
                    background: 'var(--green-50)', color: 'var(--green-700)',
                    padding: '0.2rem 0.5rem', borderRadius: '8px', marginLeft: '0.5rem',
                    fontWeight: 600, fontSize: '0.78rem',
                  }}>
                    📅 {o.deliveryDate}
                  </span>
                )}
              </div>

              {/* Итого и кнопки */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem' }}>
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--green-600)' }}>
                  {o.totalAmount.toLocaleString()} ₸
                </span>
                {o.status === 'PENDING' && (
                  <button onClick={() => cancelOrder(o.id)} style={{
                    background: 'none', border: '1px solid #ef4444', color: '#ef4444',
                    padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.78rem',
                    cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s',
                  }}>
                    Отменить
                  </button>
                )}
              </div>

              {/* Причина отмены */}
              {o.status === 'CANCELLED' && o.cancelReason && (
                <div style={{
                  marginTop: '0.5rem', background: '#fee2e2', padding: '0.5rem 0.75rem',
                  borderRadius: '10px', fontSize: '0.8rem', color: '#dc2626',
                }}>
                  Причина: {o.cancelReason}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Модалка — заказ отменён админом */}
      {cancelModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 9999, padding: '1rem',
        }}>
          <div style={{
            background: 'white', borderRadius: '24px', padding: '2.5rem',
            maxWidth: '420px', width: '100%', textAlign: 'center',
            animation: 'fadeIn 0.3s ease',
          }}>
            <span style={{ fontSize: '3.5rem' }}>😔</span>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '1rem 0 0.5rem' }}>
              Заказ отменён
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
              Приносим искренние извинения! Заказ №{cancelModal.orderId} был отменён.
            </p>
            {cancelModal.reason && (
              <p style={{ fontSize: '0.85rem', color: '#dc2626', marginBottom: '0.75rem' }}>
                Причина: {cancelModal.reason}
              </p>
            )}
            <div style={{
              background: 'var(--green-50)', borderRadius: '14px', padding: '1rem', marginBottom: '1.25rem',
            }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--green-700)' }}>
                💰 Средства в размере {cancelModal.totalAmount?.toLocaleString()} ₸ будут возвращены
              </p>
            </div>
            <button onClick={() => { setCancelModal(null); navigate('/'); }}
              className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}>
              🛒 Посмотреть другие товары
            </button>
            <button onClick={() => setCancelModal(null)} style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', marginTop: '0.75rem', fontSize: '0.83rem',
            }}>
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
