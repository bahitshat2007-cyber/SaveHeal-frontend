import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const { items, updateQty, removeItem, totalAmount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="container fade-in" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <span style={{ fontSize: '4rem' }}>🛒</span>
        <h2 style={{ fontSize: '1.4rem', marginTop: '1rem', color: 'var(--text-dark)' }}>Корзина пуста</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Добавьте вкусные десерты!</p>
        <button onClick={() => navigate('/')} className="btn-primary">К десертам</button>
      </div>
    );
  }

  return (
    <div className="container fade-in" style={{ padding: '2rem 1rem', maxWidth: '700px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>🛒 Корзина</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {items.map(item => (
          <div key={item.productId} className="card" style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem',
            gap: '1rem',
            flexWrap: 'wrap',
          }}>
            {/* Картинка */}
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '12px',
              background: item.image
                ? `url(${item.image}) center/cover`
                : 'linear-gradient(135deg, var(--green-100), var(--green-200))',
              flexShrink: 0,
            }} />

            {/* Инфо */}
            <div style={{ flex: 1, minWidth: '120px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{item.name}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--green-600)', fontWeight: 700 }}>
                {item.price.toLocaleString()} ₸
              </p>
            </div>

            {/* Кол-во */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button onClick={() => updateQty(item.productId, item.quantity - 1)}
                style={{
                  width: '32px', height: '32px', borderRadius: '10px',
                  border: '1.5px solid var(--green-200)', background: 'white',
                  cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700,
                }}>−</button>
              <span style={{ fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
              <button onClick={() => updateQty(item.productId, item.quantity + 1)}
                style={{
                  width: '32px', height: '32px', borderRadius: '10px',
                  border: '1.5px solid var(--green-200)', background: 'white',
                  cursor: 'pointer', fontSize: '1.1rem', fontWeight: 700,
                }}>+</button>
            </div>

            {/* Сумма */}
            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-dark)', minWidth: '80px', textAlign: 'right' }}>
              {(item.price * item.quantity).toLocaleString()} ₸
            </span>

            <button onClick={() => removeItem(item.productId)} style={{
              background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem',
            }}>✕</button>
          </div>
        ))}
      </div>

      {/* Итого */}
      <div style={{
        marginTop: '1.5rem',
        background: 'white',
        borderRadius: '20px',
        padding: '1.5rem',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Итого:</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--green-600)' }}>
            {totalAmount.toLocaleString()} ₸
          </span>
        </div>
        <button onClick={handleCheckout} className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '1.05rem' }}>
          Оформить заказ
        </button>
      </div>
    </div>
  );
}
