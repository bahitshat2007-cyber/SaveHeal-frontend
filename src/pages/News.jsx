import { useState, useEffect } from 'react';
import axios from 'axios';

export default function News() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/news')
      .then(res => setNews(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div className="container fade-in" style={{ padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>📢 Новости и акции</h1>

      {news.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
          Пока нет новостей. Следите за обновлениями! 🌿
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {news.map(n => (
            <div key={n.id} className="card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-dark)' }}>{n.title}</h2>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(n.createdAt).toLocaleDateString('ru-RU')}
                </span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.6 }}>
                {n.description}
              </p>
              {n.highlightText && (
                <div style={{
                  marginTop: '1rem',
                  background: 'linear-gradient(135deg, var(--green-100), var(--brown-50))',
                  padding: '1rem',
                  borderRadius: '14px',
                  textAlign: 'center',
                  fontWeight: 800,
                  fontSize: '1.3rem',
                  color: 'var(--green-700)',
                  letterSpacing: '0.5px',
                }}>
                  {n.highlightText}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
