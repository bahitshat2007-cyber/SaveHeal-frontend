import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
    warn: (msg) => addToast(msg, 'warn'),
  };

  const COLORS = {
    success: { bg: '#dcfce7', border: '#22c55e', color: '#166534', icon: '✅' },
    error: { bg: '#fee2e2', border: '#ef4444', color: '#991b1b', icon: '❌' },
    info: { bg: '#dbeafe', border: '#3b82f6', color: '#1e40af', icon: 'ℹ️' },
    warn: { bg: '#fef3c7', border: '#f59e0b', color: '#92400e', icon: '⚠️' },
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container */}
      <div style={{
        position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
        zIndex: 99999, display: 'flex', flexDirection: 'column', gap: '0.5rem',
        pointerEvents: 'none', maxWidth: '90vw',
      }}>
        {toasts.map(t => {
          const c = COLORS[t.type];
          return (
            <div key={t.id} style={{
              background: c.bg, border: `1.5px solid ${c.border}`, color: c.color,
              padding: '0.75rem 1.25rem', borderRadius: '14px',
              fontSize: '0.9rem', fontWeight: 600,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              animation: 'slideUp 0.3s ease, fadeOut 0.3s ease 2.7s forwards',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              pointerEvents: 'auto',
            }}>
              <span>{c.icon}</span> {t.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
