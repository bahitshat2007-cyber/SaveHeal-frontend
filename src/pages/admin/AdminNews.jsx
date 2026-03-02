import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AdminNews() {
  const { api } = useAuth();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', highlightText: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get('/api/news').then(r => setNews(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/api/news', form);
      setForm({ title: '', description: '', highlightText: '' });
      setShowForm(false);
      load();
    } catch { alert('Ошибка'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить новость?')) return;
    try { await api.delete(`/api/news/${id}`); load(); } catch {}
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>📢 Новости ({news.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">+ Добавить</button>
      </div>

      {showForm && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <input className="input" placeholder="Заголовок" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
            <textarea className="input" placeholder="Описание" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={3} required style={{ resize: 'vertical' }} />
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                Выделенный текст (промокод, дата, важное) — необязательно
              </label>
              <input className="input" placeholder="Напр: СКИДКА 20% или 25 ФЕВРАЛЯ" value={form.highlightText} onChange={e => setForm({...form, highlightText: e.target.value})} />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Сохранение...' : 'Опубликовать'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Отмена</button>
            </div>
          </form>
        </div>
      )}

      {news.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Нет новостей</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {news.map(n => (
            <div key={n.id} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{n.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{n.description}</p>
                  {n.highlightText && (
                    <div style={{
                      marginTop: '0.5rem', background: 'linear-gradient(135deg, var(--green-100), var(--brown-50))',
                      padding: '0.5rem 1rem', borderRadius: '10px', fontWeight: 800, fontSize: '1rem', color: 'var(--green-700)',
                    }}>{n.highlightText}</div>
                  )}
                </div>
                <button onClick={() => handleDelete(n.id)} className="btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', flexShrink: 0 }}>🗑️</button>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                {new Date(n.createdAt).toLocaleDateString('ru-RU')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
