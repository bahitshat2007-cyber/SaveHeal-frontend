import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useFavorites } from '../hooks/useFavorites';
import axios from 'axios';
import { API_URL } from '../config';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const { addItem, items } = useCart();
  const { user, api } = useAuth();
  const toast = useToast();
  const { toggleFavorite, isFavorite } = useFavorites();
  const navigate = useNavigate();

  const inCart = items.some(i => i.productId === parseInt(id));

  useEffect(() => {
    axios.get(`${API_URL}/api/products/${id}`)
      .then(res => { setProduct(res.data); setLoading(false); })
      .catch(() => { setLoading(false); });
    // Загрузить отзывы
    axios.get(`${API_URL}/api/reviews/${id}`)
      .then(res => setReviews(res.data))
      .catch(() => {});
  }, [id]);

  const handleAdd = () => {
    if (!user) { navigate('/login'); return; }
    addItem(product);
    setAdded(true);
    toast.success(`${product.name} добавлен в корзину 🛒`);
    setTimeout(() => setAdded(false), 2000);
  };

  const submitReview = async () => {
    if (!reviewText.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/api/reviews/${id}`, { rating: reviewRating, text: reviewText.trim() });
      setReviews(prev => [res.data, ...prev]);
      setReviewText('');
      setReviewRating(5);
      toast.success('Отзыв отправлен! ⭐');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ошибка');
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
      <div className="spinner" style={{ margin: '3rem auto' }} />
    </div>
  );

  if (!product) return (
    <div className="container fade-in" style={{ padding: '3rem', textAlign: 'center' }}>
      <span style={{ fontSize: '3rem' }}>😕</span>
      <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Товар не найден</p>
      <button onClick={() => navigate('/')} className="btn-primary" style={{ marginTop: '1rem' }}>На главную</button>
    </div>
  );

  const nutrients = [
    { label: 'Белки', value: product.proteins, unit: 'г', color: '#ef4444' },
    { label: 'Жиры', value: product.fats, unit: 'г', color: '#f59e0b' },
    { label: 'Углеводы', value: product.carbs, unit: 'г', color: '#3b82f6' },
    { label: 'Калории', value: product.calories, unit: 'ккал', color: '#22c55e' },
  ];

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="container fade-in" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
      <button onClick={() => navigate(-1)} style={{
        background: 'none', border: 'none', color: 'var(--text-muted)',
        cursor: 'pointer', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.3rem',
      }}>← Назад</button>

      <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr', gap: '2rem' }}>
        {/* Галерея */}
        <div>
          <div style={{ borderRadius: '20px', overflow: 'hidden', marginBottom: '0.75rem', aspectRatio: '1', background: 'var(--green-50)' }}>
            {product.images?.length > 0 ? (
              <img src={product.images[activeImg]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>🍰</div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
              {product.images.map((img, i) => (
                <img key={i} src={img} alt="" onClick={() => setActiveImg(i)}
                  style={{
                    width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover',
                    cursor: 'pointer', border: i === activeImg ? '3px solid var(--green-500)' : '3px solid transparent',
                  }} />
              ))}
            </div>
          )}
        </div>

        {/* Информация */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>{product.name}</h1>
            <button onClick={() => { toggleFavorite(product.id); toast.success(isFavorite(product.id) ? 'Убрано' : 'В избранном ❤️'); }}
              style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
              {isFavorite(product.id) ? '❤️' : '🤍'}
            </button>
          </div>

          {avgRating && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <span style={{ color: '#f59e0b', fontSize: '1.1rem' }}>{'⭐'.repeat(Math.round(avgRating))}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{avgRating} ({reviews.length} отзывов)</span>
            </div>
          )}

          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{product.weight}</p>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green-600)', marginBottom: '1.25rem' }}>{product.price?.toLocaleString()} ₸</p>

          {/* Кнопка корзины */}
          <button onClick={handleAdd}
            className={inCart || added ? '' : 'btn-primary'}
            style={{
              width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.05rem', marginBottom: '1.5rem',
              background: inCart || added ? 'var(--green-50)' : undefined,
              border: inCart || added ? '2px solid var(--green-500)' : undefined,
              color: inCart || added ? 'var(--green-600)' : undefined,
              borderRadius: '14px', cursor: 'pointer', fontWeight: 700, transition: 'all 0.3s',
            }}>
            {added ? '✅ Добавлено!' : inCart ? '✅ В корзине — добавить ещё' : '🛒 В корзину'}
          </button>

          {/* БЖУ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {nutrients.map(n => (
              <div key={n.label} style={{ textAlign: 'center', background: 'var(--green-50)', borderRadius: '14px', padding: '0.75rem 0.5rem' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%', margin: '0 auto 0.4rem',
                  background: `${n.color}15`, border: `2px solid ${n.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.85rem', color: n.color,
                }}>{n.value}</div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>{n.label} ({n.unit})</span>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>📝 Описание</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{product.description}</p>
          </div>

          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>🧪 Состав</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{product.ingredients}</p>
          </div>
        </div>
      </div>

      {/* Отзывы */}
      <section style={{ marginTop: '2.5rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1rem' }}>⭐ Отзывы {reviews.length > 0 && `(${reviews.length})`}</h2>

        {/* Форма отзыва */}
        {user && (
          <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.75rem' }}>
              {[1,2,3,4,5].map(star => (
                <button key={star} onClick={() => setReviewRating(star)}
                  style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', opacity: star <= reviewRating ? 1 : 0.3 }}>
                  ⭐
                </button>
              ))}
            </div>
            <textarea value={reviewText} onChange={e => setReviewText(e.target.value)}
              placeholder="Напишите отзыв о товаре..."
              className="input" style={{ width: '100%', minHeight: '80px', resize: 'vertical', fontSize: '0.9rem', marginBottom: '0.75rem' }} />
            <button onClick={submitReview} disabled={submitting} className="btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem' }}>
              {submitting ? '...' : 'Отправить отзыв'}
            </button>
          </div>
        )}

        {reviews.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>Пока нет отзывов — будьте первым! 😊</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {reviews.map(r => (
              <div key={r.id} className="card" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{r.user?.name || 'Пользователь'}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(r.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                <div style={{ color: '#f59e0b', fontSize: '0.85rem', marginBottom: '0.3rem' }}>{'⭐'.repeat(r.rating)}</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{r.text}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
