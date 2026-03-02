import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useFavorites } from '../hooks/useFavorites';
import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const { toggleFavorite, isFavorite } = useFavorites();
  const navigate = useNavigate();

  const handleAdd = (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login', { state: { from: '/' } });
      return;
    }
    addItem(product);
    toast.success(`${product.name} добавлен в корзину 🛒`);
  };

  const handleFav = (e) => {
    e.stopPropagation();
    toggleFavorite(product.id);
    toast.success(isFavorite(product.id) ? 'Убрано из избранного' : 'В избранном ❤️');
  };

  const img = product.images?.[0];
  const fav = isFavorite(product.id);

  return (
    <div className="card scroll-reveal" style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
      onClick={() => navigate(`/product/${product.id}`)}>
      {/* Картинка */}
      <div style={{
        height: '200px', position: 'relative',
        background: img ? `url(${img}) center/cover` : 'linear-gradient(135deg, var(--green-100), var(--green-200))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--green-400)', fontSize: '3rem',
      }}>
        {!img && '🍰'}
        {/* Избранное */}
        <button onClick={handleFav} style={{
          position: 'absolute', top: '0.5rem', right: '0.5rem',
          background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
          width: '34px', height: '34px', fontSize: '1rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.15)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        >
          {fav ? '❤️' : '🤍'}
        </button>
        {/* Бейдж хит */}
        {product.id % 3 === 1 && (
          <div style={{
            position: 'absolute', top: '0.5rem', left: '0.5rem',
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white',
            padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.7rem',
            fontWeight: 800, letterSpacing: '0.03em',
          }}>
            🔥 ХИТ
          </div>
        )}
      </div>

      {/* Инфо */}
      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-dark)' }}>{product.name}</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
          {product.description?.slice(0, 80)}{product.description?.length > 80 ? '...' : ''}
        </p>

        {/* БЖУ */}
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <span style={{ background: 'var(--green-50)', padding: '2px 6px', borderRadius: '6px' }}>Б: {product.proteins}г</span>
          <span style={{ background: 'var(--green-50)', padding: '2px 6px', borderRadius: '6px' }}>Ж: {product.fats}г</span>
          <span style={{ background: 'var(--green-50)', padding: '2px 6px', borderRadius: '6px' }}>У: {product.carbs}г</span>
          <span style={{ background: 'var(--brown-50)', padding: '2px 6px', borderRadius: '6px' }}>{product.calories} ккал</span>
        </div>

        <span style={{ fontSize: '0.75rem', color: 'var(--brown-400)' }}>{product.weight}</span>

        {/* Цена и кнопка */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--green-600)' }}>
            {product.price?.toLocaleString()} ₸
          </span>
          <button onClick={handleAdd} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            В корзину
          </button>
        </div>
      </div>
    </div>
  );
}
