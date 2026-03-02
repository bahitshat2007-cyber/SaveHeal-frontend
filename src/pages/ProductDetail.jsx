import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useFavorites } from '../hooks/useFavorites';
import axios from 'axios';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const { addToCart } = useCart();
  const toast = useToast();
  const { toggleFavorite, isFavorite } = useFavorites();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/api/products/${id}`)
      .then(res => { setProduct(res.data); setLoading(false); })
      .catch(() => { setLoading(false); });
  }, [id]);

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

  return (
    <div className="container fade-in" style={{ padding: '2rem 1rem', maxWidth: '900px' }}>
      <button onClick={() => navigate(-1)} style={{
        background: 'none', border: 'none', color: 'var(--text-muted)',
        cursor: 'pointer', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.3rem',
      }}>
        ← Назад
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr', gap: '2rem' }}>
        {/* Галерея фото */}
        <div>
          <div style={{
            borderRadius: '20px', overflow: 'hidden', marginBottom: '0.75rem',
            aspectRatio: '1', background: 'var(--green-50)',
          }}>
            {product.images?.length > 0 ? (
              <img src={product.images[activeImg]} alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                    transition: 'border 0.2s',
                  }} />
              ))}
            </div>
          )}
        </div>

        {/* Информация */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem' }}>{product.name}</h1>
            <button onClick={() => { toggleFavorite(product.id); toast.success(isFavorite(product.id) ? 'Убрано из избранного' : 'Добавлено в избранное ❤️'); }}
              style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.2)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            >
              {isFavorite(product.id) ? '❤️' : '🤍'}
            </button>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{product.weight}</p>

          <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--green-600)', marginBottom: '1.25rem' }}>
            {product.price?.toLocaleString()} ₸
          </p>

          <button onClick={() => { addToCart(product); toast.success(`${product.name} добавлен в корзину 🛒`); }}
            className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
            🛒 В корзину
          </button>

          {/* БЖУ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {nutrients.map(n => (
              <div key={n.label} style={{
                textAlign: 'center', background: 'var(--green-50)', borderRadius: '14px', padding: '0.75rem 0.5rem',
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%', margin: '0 auto 0.4rem',
                  background: `${n.color}15`, border: `2px solid ${n.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.85rem', color: n.color,
                }}>
                  {n.value}
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {n.label} ({n.unit})
                </span>
              </div>
            ))}
          </div>

          {/* Описание */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>📝 Описание</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{product.description}</p>
          </div>

          {/* Состав */}
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>🧪 Состав</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{product.ingredients}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
