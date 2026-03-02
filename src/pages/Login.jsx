import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Login() {
  const [showPhone, setShowPhone] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register, loginWithGoogle, GOOGLE_CLIENT_ID } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  // Google Sign-In callback
  const handleGoogleCallback = useCallback(async (response) => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle(response.credential);
      navigate(from);
    } catch {
      setError('Ошибка входа через Google. Попробуйте снова.');
    }
    setLoading(false);
  }, [loginWithGoogle, navigate, from]);

  // Загружаем Google Identity Services
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });
      window.google?.accounts.id.renderButton(
        document.getElementById('google-signin-btn'),
        {
          theme: 'outline',
          size: 'large',
          width: 360,
          text: 'signin_with',
          shape: 'pill',
          locale: 'ru',
        }
      );
    };
    document.head.appendChild(script);
    return () => { try { document.head.removeChild(script); } catch {} };
  }, [GOOGLE_CLIENT_ID, handleGoogleCallback]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (showPhone) {
        // Вход/регистрация по телефону
        if (isRegister) {
          await register(phone, null, password, name);
        } else {
          await login(phone, null, password);
        }
      } else {
        // Вход/регистрация по email
        if (isRegister) {
          await register(null, email, password, name);
        } else {
          await login(null, email, password);
        }
      }
      navigate(from);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка. Попробуйте снова.');
    }
    setLoading(false);
  };

  return (
    <div className="fade-in" style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '2.5rem',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        <h1 style={{
          fontSize: '1.6rem', fontWeight: 800, textAlign: 'center',
          marginBottom: '0.5rem', color: 'var(--text-dark)',
        }}>
          Войти в SaveHeal
        </h1>
        <p style={{
          textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem',
        }}>
          Самый быстрый способ — через Google аккаунт
        </p>

        {error && (
          <div style={{
            background: '#fee2e2', color: '#dc2626', padding: '0.75rem',
            borderRadius: '12px', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center',
          }}>{error}</div>
        )}

        {/* ========= GOOGLE — ГЛАВНАЯ КНОПКА ========= */}
        <div style={{
          background: 'var(--green-50)', borderRadius: '16px', padding: '1.25rem',
          marginBottom: '1.5rem', textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--green-700)', marginBottom: '0.75rem', fontWeight: 600 }}>
            🔒 Безопасно — мы не видим ваш пароль от Google
          </p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div id="google-signin-btn"></div>
          </div>
        </div>

        {/* ========= РАЗДЕЛИТЕЛЬ ========= */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--green-100)' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>или вручную</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--green-100)' }} />
        </div>

        {/* ========= ФОРМА EMAIL / ТЕЛЕФОН ========= */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {isRegister && (
            <input className="input" placeholder="Ваше имя" value={name}
              onChange={e => setName(e.target.value)} />
          )}

          {showPhone ? (
            <input className="input" placeholder="+7 7XX XXX XX XX" value={phone}
              onChange={e => setPhone(e.target.value)} required />
          ) : (
            <input className="input" type="email" placeholder="Email" value={email}
              onChange={e => setEmail(e.target.value)} required />
          )}

          <input className="input" type="password" placeholder="Пароль" value={password}
            onChange={e => setPassword(e.target.value)} required />

          <button type="submit" className="btn-primary" disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', fontSize: '0.95rem' }}>
            {loading ? 'Подождите...' : isRegister ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </form>

        {/* Переключатель регистр/вход */}
        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.83rem', color: 'var(--text-muted)' }}>
          {isRegister ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
          <button onClick={() => { setIsRegister(!isRegister); setError(''); }} style={{
            background: 'none', border: 'none', color: 'var(--green-600)',
            cursor: 'pointer', fontWeight: 600, fontSize: '0.83rem',
          }}>
            {isRegister ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </p>

        {/* Скрытая кнопка — через номер */}
        <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <button onClick={() => { setShowPhone(!showPhone); setError(''); }} style={{
            background: 'none', border: 'none', color: 'var(--text-muted)',
            cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline',
            opacity: 0.7,
          }}>
            {showPhone ? 'Войти через email' : 'Войти через номер телефона'}
          </button>
        </div>
      </div>
    </div>
  );
}
