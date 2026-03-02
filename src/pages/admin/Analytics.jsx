import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { api } = useAuth();

  useEffect(() => {
    api.get('/api/analytics')
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>;
  if (!data) return <p>Ошибка загрузки</p>;

  const statCards = [
    { label: 'Выручка (всего)', value: `${data.totalRevenue?.toLocaleString()} ₸`, icon: '💰', color: 'var(--green-500)' },
    { label: 'За 7 дней', value: `${data.weekRevenue?.toLocaleString()} ₸`, icon: '📈', color: 'var(--green-400)' },
    { label: 'Заказов', value: data.totalOrders, icon: '📦', color: 'var(--brown-400)' },
    { label: 'Клиентов', value: data.totalUsers, icon: '👥', color: 'var(--green-600)' },
    { label: 'Жалоб', value: data.totalComplaints, icon: '⚠️', color: '#f59e0b' },
  ];

  return (
    <div className="fade-in">
      {/* Карточки статистики */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        {statCards.map((s, i) => (
          <div key={i} className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{s.icon}</span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{s.label}</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Статусы */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Заказы по статусам</h3>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {data.ordersByStatus?.map(s => (
            <span key={s.status} className={`badge badge-${s.status.toLowerCase()}`}>
              {s.status}: {s._count}
            </span>
          ))}
        </div>
      </div>

      {/* Топ товары */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>🏆 Топ продаваемых товаров</h3>
        {data.topProducts?.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Пока нет данных о продажах</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {data.topProducts.map((p, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.75rem', background: i === 0 ? 'var(--green-50)' : 'transparent',
                borderRadius: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--green-600)', fontSize: '0.9rem', width: '24px' }}>#{i + 1}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.totalQty} шт</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                    ({p.totalRevenue?.toLocaleString()} ₸)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
