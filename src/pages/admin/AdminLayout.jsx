import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';

const menuItems = [
  { path: '/admin', label: '📊 Аналитика', exact: true },
  { path: '/admin/products', label: '🍰 Товары' },
  { path: '/admin/orders', label: '📦 Заказы' },
  { path: '/admin/news', label: '📢 Новости' },
  { path: '/admin/chat', label: '💬 Чаты' },
  { path: '/admin/complaints', label: '⚠️ Жалобы' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') navigate('/');
  }, [user]);

  if (!user || user.role !== 'ADMIN') return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Сайдбар */}
      <aside style={{
        width: menuOpen ? '240px' : '0',
        overflow: 'hidden',
        background: 'var(--green-700)',
        color: 'white',
        transition: 'width 0.3s ease',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 200,
      }}>
        <div style={{ width: '240px', padding: '1.5rem 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>🌿 SaveHeal</span>
            <button onClick={() => setMenuOpen(false)} style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
              borderRadius: '8px', padding: '0.3rem 0.5rem', cursor: 'pointer',
            }}>✕</button>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {menuItems.map(item => {
              const active = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);
              return (
                <Link key={item.path} to={item.path}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    textDecoration: 'none', color: 'white', padding: '0.7rem 1rem',
                    borderRadius: '12px', fontSize: '0.9rem', fontWeight: active ? 700 : 400,
                    background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                    transition: 'background 0.2s',
                  }}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '1rem' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>
              ← На сайт
            </Link>
            <button onClick={logout} style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer', fontSize: '0.85rem',
            }}>Выйти</button>
          </div>
        </div>
      </aside>

      {/* Оверлей */}
      {menuOpen && <div onClick={() => setMenuOpen(false)} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 199,
      }} />}

      {/* Контент */}
      <main style={{ flex: 1, padding: '1.5rem', maxWidth: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <button onClick={() => setMenuOpen(true)} style={{
            background: 'var(--green-100)', border: 'none', borderRadius: '12px',
            padding: '0.6rem 0.8rem', cursor: 'pointer', fontSize: '1.2rem',
          }}>☰</button>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-dark)' }}>
            Админ-панель
          </h1>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
