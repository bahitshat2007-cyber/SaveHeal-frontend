import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const STATUS_MAP = {
  PENDING: { label: 'Ожидает', color: '#f59e0b', bg: '#fef3c7', icon: '⏳' },
  PAID: { label: 'Оплачен', color: '#3b82f6', bg: '#dbeafe', icon: '💳' },
  DELIVERED: { label: 'Доставлен', color: '#22c55e', bg: '#dcfce7', icon: '✅' },
  CANCELLED: { label: 'Отменён', color: '#ef4444', bg: '#fee2e2', icon: '❌' },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(null); // orderId
  const [cancelReason, setCancelReason] = useState('');
  const [dateModal, setDateModal] = useState(null); // orderId
  const [deliveryDate, setDeliveryDate] = useState('');
  const { api } = useAuth();

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    try {
      const res = await api.get('/api/orders/all');
      setOrders(res.data);
    } catch {}
    setLoading(false);
  };

  const confirm = async (id) => {
    await api.put(`/api/orders/${id}/confirm`);
    loadOrders();
  };
  const deliver = async (id) => {
    await api.put(`/api/orders/${id}/deliver`);
    loadOrders();
  };

  const handleCancel = async () => {
    if (!cancelModal) return;
    try {
      await api.put(`/api/orders/${cancelModal}/cancel`, {
        cancelReason: cancelReason || 'Отменён администратором',
      });
      setCancelModal(null);
      setCancelReason('');
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Ошибка');
    }
  };

  const handleSetDate = async () => {
    if (!dateModal || !deliveryDate) return;
    try {
      await api.put(`/api/orders/${dateModal}/delivery-date`, { deliveryDate });
      setDateModal(null);
      setDeliveryDate('');
      loadOrders();
    } catch {}
  };

  const filtered = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  if (loading) return <p>Загрузка...</p>;

  return (
    <div>
      <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem' }}>📦 Заказы</h2>

      {/* Фильтры */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {['ALL', 'PENDING', 'PAID', 'DELIVERED', 'CANCELLED'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '0.4rem 0.85rem', borderRadius: '20px', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s',
            background: filter === f ? 'var(--green-500)' : 'var(--green-50)',
            color: filter === f ? 'white' : 'var(--text-muted)',
          }}>
            {f === 'ALL' ? 'Все' : STATUS_MAP[f]?.label}
            {f !== 'ALL' && ` (${orders.filter(o => o.status === f).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Нет заказов</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.map(o => {
          const s = STATUS_MAP[o.status] || STATUS_MAP.PENDING;
          return (
            <div key={o.id} className="card" style={{ padding: '1.25rem' }}>
              {/* Шапка */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div>
                  <span style={{ fontWeight: 700 }}>Заказ №{o.id}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                    {new Date(o.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                  <span style={{
                    background: s.bg, color: s.color, padding: '0.2rem 0.6rem',
                    borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, marginLeft: '0.5rem',
                  }}>
                    {s.icon} {s.label}
                  </span>
                </div>
                <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--green-600)' }}>
                  {o.totalAmount.toLocaleString()} ₸
                </span>
              </div>

              {/* Клиент */}
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                👤 {o.user?.name || o.user?.phone || 'Неизвестно'} · {o.paymentMethod === 'KASPI' ? '💳 Kaspi' : '💵 При получении'}
              </p>

              {/* Доставка */}
              <div style={{ background: 'var(--brown-50)', borderRadius: '12px', padding: '0.75rem', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                <strong>🚚 Доставка:</strong> {o.deliveryName} · {o.deliveryPhone}<br />
                {o.deliveryCity}, {o.deliveryAddr}
                {o.comment && <><br /><span style={{ color: 'var(--text-muted)' }}>💬 {o.comment}</span></>}
                {o.deliveryDate && <><br /><span style={{ color: 'var(--green-700)', fontWeight: 600 }}>📅 {o.deliveryDate}</span></>}
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

              {/* Причина отмены */}
              {o.status === 'CANCELLED' && o.cancelReason && (
                <div style={{ background: '#fee2e2', padding: '0.5rem 0.75rem', borderRadius: '10px', fontSize: '0.8rem', color: '#dc2626', marginBottom: '0.75rem' }}>
                  Причина: {o.cancelReason}
                </div>
              )}

              {/* Кнопки */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {o.status === 'PENDING' && (
                  <button onClick={() => confirm(o.id)} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    ✅ Подтвердить оплату
                  </button>
                )}
                {(o.status === 'PAID') && (
                  <button onClick={() => deliver(o.id)} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    🚚 Доставлен
                  </button>
                )}
                {(o.status === 'PENDING' || o.status === 'PAID') && (
                  <button onClick={() => { setDateModal(o.id); setDeliveryDate(o.deliveryDate || ''); }}
                    className="btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                    📅 Дата доставки
                  </button>
                )}
                {o.status !== 'CANCELLED' && o.status !== 'DELIVERED' && (
                  <button onClick={() => setCancelModal(o.id)} style={{
                    background: 'none', border: '1px solid #ef4444', color: '#ef4444',
                    padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.8rem',
                    cursor: 'pointer', fontWeight: 600,
                  }}>
                    ❌ Отменить
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Модалка: отмена заказа */}
      {cancelModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 9999, padding: '1rem',
        }}>
          <div style={{
            background: 'white', borderRadius: '20px', padding: '2rem',
            maxWidth: '420px', width: '100%',
          }}>
            <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>❌ Отменить заказ №{cancelModal}</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Клиент получит уведомление с извинениями и предложением посмотреть другие товары.
            </p>
            <input className="input" placeholder="Причина отмены (например: товар закончился)"
              value={cancelReason} onChange={e => setCancelReason(e.target.value)}
              style={{ marginBottom: '1rem' }} />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => { setCancelModal(null); setCancelReason(''); }}
                className="btn-outline" style={{ flex: 1 }}>Назад</button>
              <button onClick={handleCancel} style={{
                flex: 2, background: '#ef4444', color: 'white', border: 'none',
                padding: '0.75rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
              }}>Отменить заказ</button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка: дата доставки */}
      {dateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 9999, padding: '1rem',
        }}>
          <div style={{
            background: 'white', borderRadius: '20px', padding: '2rem',
            maxWidth: '360px', width: '100%',
          }}>
            <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>📅 Дата доставки</h3>
            <input className="input" type="text" placeholder="напр: 5 марта, после 14:00"
              value={deliveryDate} onChange={e => setDeliveryDate(e.target.value)}
              style={{ marginBottom: '1rem' }} />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setDateModal(null)} className="btn-outline" style={{ flex: 1 }}>Отмена</button>
              <button onClick={handleSetDate} className="btn-primary" style={{ flex: 2 }}>Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
