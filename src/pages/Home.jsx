import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';
import { useScrollReveal } from '../hooks/useScrollReveal';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const scrollRef = useScrollReveal();

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/api/products`),
      axios.get(`${API_URL}/api/news`),
    ]).then(([pRes, nRes]) => {
      setProducts(pRes.data);
      setNews(nRes.data.slice(0, 3));
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  return (
    <div className="fade-in" ref={scrollRef}>
      {/* Hero + Banner */}
      <section style={{
        background: 'linear-gradient(135deg, var(--green-100) 0%, var(--cream) 50%, var(--brown-50) 100%)',
        padding: '3rem 0 2rem',
        textAlign: 'center',
      }}>
        <div className="container">
          <h1 style={{
            fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 800,
            color: 'var(--text-dark)', marginBottom: '0.75rem', lineHeight: 1.2,
          }}>
            ПП-десерты с доставкой 🍰
          </h1>
          <p style={{
            fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', color: 'var(--text-muted)',
            maxWidth: '500px', margin: '0 auto 1.5rem',
          }}>
            Полезные сладости без сахара. Доставляем по крупным городам Казахстана 🇰🇿
          </p>

          {/* Поиск */}
          <div style={{ maxWidth: '400px', margin: '0 auto', position: 'relative' }}>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="🔍 Искать десерты..."
              className="input"
              style={{
                paddingLeft: '1rem', fontSize: '0.95rem',
                background: 'rgba(255,255,255,0.9)', borderColor: 'var(--green-200)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            />
          </div>
        </div>
      </section>

      {/* Промо-баннер */}
      <section className="container" style={{ padding: '1.5rem 1rem 0' }}>
        <div style={{
          background: 'var(--green-50)',
          border: '1.5px solid var(--green-200)',
          borderRadius: '20px', padding: '1.5rem 2rem',
          color: 'var(--text-dark)', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
        }}>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>🎉 Специальное предложение</p>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--green-700)' }}>Бесплатная доставка от 10 000 ₸</h2>
          </div>
          <span style={{
            background: 'var(--green-100)', padding: '0.5rem 1rem',
            borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem',
            color: 'var(--green-700)',
          }}>Действует сейчас ✨</span>
        </div>
      </section>

      {/* Новости */}
      {news.length > 0 && (
        <section className="container" style={{ padding: '2rem 1rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>📢 Новости</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {news.map(n => (
              <div key={n.id} className="card scroll-reveal" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem' }}>{n.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{n.description}</p>
                {n.highlightText && (
                  <div style={{
                    background: 'linear-gradient(135deg, var(--green-100), var(--brown-50))',
                    padding: '0.75rem', borderRadius: '12px', fontWeight: 800,
                    fontSize: '1.1rem', textAlign: 'center', color: 'var(--green-700)',
                  }}>{n.highlightText}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Товары */}
      <section className="container" style={{ padding: '2rem 1rem 3rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>🍪 Наши десерты</h2>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {[1,2,3,4].map(i => <ProductCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <span style={{ fontSize: '3rem' }}>{search ? '🔍' : '🌱'}</span>
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
              {search ? `Ничего не найдено по «${search}»` : 'Скоро здесь появятся вкусные десерты!'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
