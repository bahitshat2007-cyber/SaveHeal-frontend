import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AdminComplaints() {
  const { api } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/messages/complaints').then(r => setComplaints(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>;

  return (
    <div className="fade-in">
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>⚠️ Жалобы ({complaints.length})</h2>

      {complaints.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <span style={{ fontSize: '3rem' }}>✅</span>
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Жалоб нет — всё работает отлично!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {complaints.map(c => (
            <div key={c.id} className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                    👤 {c.sender?.name || c.sender?.phone || 'Аноним'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.75rem' }}>
                    {new Date(c.createdAt).toLocaleString('ru-RU')}
                  </span>
                </div>
                <span className="badge badge-pending">Жалоба</span>
              </div>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-dark)' }}>
                {c.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
