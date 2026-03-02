import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../hooks/useTheme';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <nav style={{
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--green-100)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0.75rem 0',
    }}>
      <div className="container" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '0.5rem',
      }}>
        {/* Лого */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontSize: '1.5rem', fontWeight: 800,
            background: 'linear-gradient(135deg, var(--green-600), var(--green-400))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>🌿 SaveHeal</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--brown-400)', fontWeight: 600 }}>foods</span>
        </Link>

        {/* Навигация */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/" style={{
            textDecoration: 'none', color: 'var(--green-700)', fontWeight: 600, fontSize: '0.85rem',
            background: 'var(--green-50)', border: '1.5px solid var(--green-200)',
            padding: '0.4rem 0.9rem', borderRadius: '10px', transition: 'all 0.2s',
          }}>🏠 Главная</Link>
          <Link to="/news" style={{
            textDecoration: 'none', color: 'var(--green-700)', fontWeight: 600, fontSize: '0.85rem',
            background: 'var(--green-50)', border: '1.5px solid var(--green-200)',
            padding: '0.4rem 0.9rem', borderRadius: '10px', transition: 'all 0.2s',
          }}>📢 Новости</Link>

          {user && (
            <>
              <Link to="/orders" style={{
                textDecoration: 'none', color: 'var(--green-700)', fontWeight: 600, fontSize: '0.85rem',
                background: 'var(--green-50)', border: '1.5px solid var(--green-200)',
                padding: '0.4rem 0.9rem', borderRadius: '10px', transition: 'all 0.2s',
              }}>📦 Заказы</Link>
              <Link to="/favorites" style={{
                textDecoration: 'none', color: 'var(--green-700)', fontWeight: 600, fontSize: '0.85rem',
                background: 'var(--green-50)', border: '1.5px solid var(--green-200)',
                padding: '0.4rem 0.9rem', borderRadius: '10px', transition: 'all 0.2s',
              }}>❤️</Link>
            </>
          )}

          {/* Тёмная тема */}
          <button onClick={toggleTheme} style={{
            background: 'var(--green-50)', border: '1.5px solid var(--green-200)',
            borderRadius: '10px', padding: '0.4rem 0.6rem', cursor: 'pointer',
            fontSize: '1rem', transition: 'transform 0.2s',
          }}
            onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Корзина */}
          <button onClick={() => navigate('/cart')} style={{
            position: 'relative', background: 'var(--green-50)',
            border: '1.5px solid var(--green-200)', borderRadius: '12px',
            padding: '0.5rem 1rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            fontWeight: 600, color: 'var(--green-700)', fontSize: '0.9rem',
          }}>
            🛒
            {totalItems > 0 && (
              <span style={{
                background: 'var(--green-500)', color: 'white', borderRadius: '50%',
                width: '20px', height: '20px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700,
                position: 'absolute', top: '-6px', right: '-6px',
              }}>{totalItems}</span>
            )}
            Корзина
          </button>

          {/* Юзер */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.name || user.phone}</span>
              {user.role === 'ADMIN' && (
                <Link to="/admin" className="btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Админка</Link>
              )}
              <button onClick={logout} style={{
                background: '#fee2e2', border: '1.5px solid #fca5a5',
                color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem',
                fontWeight: 600, padding: '0.4rem 0.8rem', borderRadius: '10px',
              }}>Выйти</button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>Войти</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
