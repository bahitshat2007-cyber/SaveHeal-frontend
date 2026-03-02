import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import ProductCard from '../components/ProductCard';
import { useFavorites } from '../hooks/useFavorites';
import { useNavigate } from 'react-router-dom';

export default function Favorites() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { favorites } = useFavorites();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/api/products`)
      .then(res => setProducts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const favoriteProducts = products.filter(p => favorites.includes(p.id));

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div className="container fade-in" style={{ padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>❤️ Избранное</h1>

      {favoriteProducts.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <span style={{ fontSize: '3rem' }}>💚</span>
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
            Нажмите 🤍 на товаре чтобы добавить в избранное
          </p>
          <button onClick={() => navigate('/')} className="btn-primary" style={{ marginTop: '1rem' }}>
            Смотреть десерты
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem',
        }}>
          {favoriteProducts.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
