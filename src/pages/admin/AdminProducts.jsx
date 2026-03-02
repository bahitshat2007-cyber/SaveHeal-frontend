import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AdminProducts() {
  const { api } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', weight: '', description: '', ingredients: '', proteins: '', fats: '', carbs: '', calories: '' });
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get('/api/products').then(r => setProducts(r.data)).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const resetForm = () => {
    setForm({ name: '', price: '', weight: '', description: '', ingredients: '', proteins: '', fats: '', carbs: '', calories: '' });
    setFiles([]);
    setEditing(null);
    setShowForm(false);
  };

  const startEdit = (p) => {
    setForm({
      name: p.name, price: p.price, weight: p.weight, description: p.description,
      ingredients: p.ingredients, proteins: p.proteins, fats: p.fats, carbs: p.carbs, calories: p.calories,
    });
    setEditing(p);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (editing) fd.append('existingImages', JSON.stringify(editing.images || []));
    files.forEach(f => fd.append('images', f));

    try {
      if (editing) {
        await api.put(`/api/products/${editing.id}`, fd);
      } else {
        await api.post('/api/products', fd);
      }
      resetForm();
      load();
    } catch { alert('Ошибка сохранения'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить товар?')) return;
    try { await api.delete(`/api/products/${id}`); load(); } catch {}
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>🍰 Товары ({products.length})</h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary">+ Добавить товар</button>
      </div>

      {/* Форма */}
      {showForm && (
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>{editing ? 'Редактировать' : 'Новый товар'}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
            <input className="input" placeholder="Название" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            <input className="input" type="number" placeholder="Цена (₸)" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
            <input className="input" placeholder="Вес (напр. 250г)" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} required />
            <input className="input" type="number" step="0.1" placeholder="Белки (г)" value={form.proteins} onChange={e => setForm({...form, proteins: e.target.value})} required />
            <input className="input" type="number" step="0.1" placeholder="Жиры (г)" value={form.fats} onChange={e => setForm({...form, fats: e.target.value})} required />
            <input className="input" type="number" step="0.1" placeholder="Углеводы (г)" value={form.carbs} onChange={e => setForm({...form, carbs: e.target.value})} required />
            <input className="input" type="number" step="0.1" placeholder="Калории" value={form.calories} onChange={e => setForm({...form, calories: e.target.value})} required />
            <div style={{ gridColumn: '1 / -1' }}>
              <textarea className="input" placeholder="Описание" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} required style={{ resize: 'vertical' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <textarea className="input" placeholder="Состав" value={form.ingredients} onChange={e => setForm({...form, ingredients: e.target.value})} rows={2} required style={{ resize: 'vertical' }} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                Фото (до 5 шт.)
              </label>
              <input type="file" multiple accept="image/*" onChange={e => setFiles([...e.target.files].slice(0, 5))}
                style={{ fontSize: '0.85rem' }} />
              {editing && editing.images?.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {editing.images.map((img, i) => (
                    <img key={i} src={img} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                  ))}
                </div>
              )}
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Сохранение...' : editing ? 'Сохранить' : 'Создать'}
              </button>
              <button type="button" onClick={resetForm} className="btn-outline">Отмена</button>
            </div>
          </form>
        </div>
      )}

      {/* Список товаров */}
      {products.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>Нет товаров. Добавьте первый!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {products.map(p => (
            <div key={p.id} className="card" style={{
              display: 'flex', alignItems: 'center', padding: '1rem', gap: '1rem', flexWrap: 'wrap',
            }}>
              <div style={{
                width: '60px', height: '60px', borderRadius: '12px', flexShrink: 0,
                background: p.images?.[0] ? `url(${p.images[0]}) center/cover` : 'var(--green-100)',
              }} />
              <div style={{ flex: 1, minWidth: '150px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{p.name}</h4>
                <span style={{ fontSize: '0.85rem', color: 'var(--green-600)', fontWeight: 700 }}>{p.price.toLocaleString()} ₸</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>{p.weight}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => startEdit(p)} className="btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>✏️</button>
                <button onClick={() => handleDelete(p.id)} className="btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
