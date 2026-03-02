export default function About() {
  return (
    <div className="container fade-in" style={{ padding: '2rem 1rem', maxWidth: '700px' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center' }}>
        🌿 О SaveHeal Foods
      </h1>

      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>Наша миссия</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '0.95rem' }}>
          SaveHeal Foods — это ПП-десерты нового поколения. Мы доказываем, что вкусное может быть полезным.
          Каждый десерт создаётся из натуральных ингредиентов без сахара, консервантов и искусственных добавок.
        </p>
      </div>

      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>🇰🇿 Где мы</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '0.95rem' }}>
          Мы базируемся в Казахстане и доставляем по всем крупным городам: Алматы, Астана, Шымкент,
          Караганда и ещё 8 городов. Работаем каждый день чтобы вы наслаждались вкусом без вреда для здоровья.
        </p>
      </div>

      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>💚 Наши ценности</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
          {[
            { icon: '🌱', title: 'Натуральность', desc: 'Только настоящие ингредиенты' },
            { icon: '🍯', title: 'Без сахара', desc: 'Природные подсластители' },
            { icon: '💪', title: 'ПП-формула', desc: 'Выверенный баланс БЖУ' },
            { icon: '🚚', title: 'Быстрая доставка', desc: 'По всему Казахстану' },
          ].map(v => (
            <div key={v.title} style={{ textAlign: 'center', padding: '1rem' }}>
              <span style={{ fontSize: '2rem' }}>{v.icon}</span>
              <p style={{ fontWeight: 700, fontSize: '0.85rem', marginTop: '0.5rem' }}>{v.title}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.75rem' }}>📞 Контакты</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Телефон: <strong>+7 705 210 90 90</strong><br />
          Instagram: <strong>@saveheal.foods</strong><br />
          Время работы: <strong>9:00 — 21:00, ежедневно</strong>
        </p>
      </div>
    </div>
  );
}
