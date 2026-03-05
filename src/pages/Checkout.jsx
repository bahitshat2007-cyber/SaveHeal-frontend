import { useState, lazy, Suspense } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

const DonutScene = lazy(() => import('../components/DonutScene'));

const CITIES = ['Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актобе', 'Атырау', 'Павлодар', 'Усть-Каменогорск', 'Семей', 'Костанай', 'Тараз', 'Актау'];

export default function Checkout() {
  const { items, totalAmount, clearCart } = useCart();
  const { user, api } = useAuth();
  const navigate = useNavigate();

  // Загружаем сохранённый шаблон доставки
  const savedDelivery = JSON.parse(localStorage.getItem('savedDelivery') || 'null');

  // Форма доставки — автозаполнение с аккаунта
  const [delivery, setDelivery] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: '',
    address: '',
    comment: '',
  });
  const [usedTemplate, setUsedTemplate] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('KASPI');
  const [step, setStep] = useState('delivery');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoApplied, setPromoApplied] = useState('');

  const discountedTotal = Math.round(totalAmount * (1 - promoDiscount / 100));

  const applyPromo = async () => {
    setPromoError('');
    try {
      const res = await axios.post(`${API_URL}/api/promo/validate`, { code: promoCode });
      setPromoDiscount(res.data.discount);
      setPromoApplied(res.data.code);
    } catch (err) {
      setPromoError(err.response?.data?.error || 'Неверный промокод');
      setPromoDiscount(0);
      setPromoApplied('');
    }
  };

  const updateField = (field, value) => setDelivery(prev => ({ ...prev, [field]: value }));

  const goToPayment = () => {
    if (!delivery.name.trim() || !delivery.phone.trim() || !delivery.city || !delivery.address.trim()) {
      alert('Заполните имя, телефон, город и адрес');
      return;
    }
    setStep('choose');
  };

  const placeOrder = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/orders', {
        items,
        totalAmount: discountedTotal,
        paymentMethod,
        deliveryName: delivery.name,
        deliveryPhone: delivery.phone,
        deliveryCity: delivery.city,
        deliveryAddr: delivery.address,
        comment: delivery.comment,
      });
      setOrderId(res.data.id);
      setStep('done');
      // Сохраняем шаблон доставки
      localStorage.setItem('savedDelivery', JSON.stringify(delivery));
      clearCart();
    } catch {
      alert('Ошибка оформления заказа');
    }
    setLoading(false);
  };

  if (items.length === 0 && step !== 'done') {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container fade-in" style={{ padding: '2rem 1rem', maxWidth: '600px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>📦 Оформление заказа</h1>

      {/* Шаг 1: Данные доставки */}
      {step === 'delivery' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>🚚 Доставка</h3>

            {/* Шаблон из прошлого заказа */}
            {savedDelivery && !usedTemplate && (
              <div style={{
                background: 'var(--green-50)', borderRadius: '14px', padding: '1rem',
                marginBottom: '1rem', border: '1.5px solid var(--green-200)',
              }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>📋 Данные из прошлого заказа:</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                  {savedDelivery.name} · {savedDelivery.phone}<br/>
                  {savedDelivery.city}, {savedDelivery.address}
                  {savedDelivery.comment && <><br/>💬 {savedDelivery.comment}</>}
                </p>
                <button onClick={() => {
                  setDelivery(savedDelivery);
                  setUsedTemplate(true);
                }} className="btn-primary" style={{
                  marginTop: '0.75rem', padding: '0.5rem 1.2rem', fontSize: '0.85rem',
                }}>✅ Использовать эти данные</button>
              </div>
            )}
            {usedTemplate && (
              <p style={{ fontSize: '0.8rem', color: 'var(--green-600)', fontWeight: 600, marginBottom: '0.75rem' }}>
                ✅ Данные подставлены — можете изменить если нужно
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Имя получателя</label>
                <input className="input" placeholder="Как к вам обращаться?" value={delivery.name}
                  onChange={e => updateField('name', e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Телефон</label>
                <input className="input" placeholder="+7 7XX XXX XX XX" value={delivery.phone}
                  onChange={e => updateField('phone', e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Город</label>
                <select className="input" value={delivery.city} onChange={e => updateField('city', e.target.value)} required
                  style={{ cursor: 'pointer' }}>
                  <option value="">Выберите город</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>Адрес</label>
                <input className="input" placeholder="Улица, дом, квартира" value={delivery.address}
                  onChange={e => updateField('address', e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.3rem' }}>
                  Комментарий <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(необязательно)</span>
                </label>
                <input className="input" placeholder="Подъезд, этаж, домофон..." value={delivery.comment}
                  onChange={e => updateField('comment', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Промокод */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>🏷️ Промокод</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input className="input" placeholder="Введите промокод" value={promoCode}
                onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); }}
                style={{ flex: 1, textTransform: 'uppercase' }} />
              <button onClick={applyPromo} className="btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>Применить</button>
            </div>
            {promoError && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.4rem' }}>❌ {promoError}</p>}
            {promoApplied && <p style={{ color: 'var(--green-600)', fontSize: '0.8rem', marginTop: '0.4rem', fontWeight: 600 }}>✅ Промокод {promoApplied}: скидка {promoDiscount}%</p>}
          </div>

          {/* Итого */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Товаров: {items.length}</span>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--green-600)' }}>
                {promoDiscount > 0 ? (
                  <><s style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.9rem' }}>{totalAmount.toLocaleString()} ₸</s> {discountedTotal.toLocaleString()} ₸</>
                ) : (
                  <>{totalAmount.toLocaleString()} ₸</>
                )}
              </span>
            </div>
          </div>

          <button onClick={goToPayment} className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '1.05rem' }}>
            Далее → Оплата
          </button>
        </div>
      )}

      {/* Шаг 2: Выбор оплаты */}
      {step === 'choose' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', fontWeight: 700 }}>Способ оплаты</h3>

            <label style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '1rem', borderRadius: '14px', cursor: 'pointer',
              border: paymentMethod === 'KASPI' ? '2px solid var(--green-500)' : '2px solid var(--green-100)',
              background: paymentMethod === 'KASPI' ? 'var(--green-50)' : 'white',
              marginBottom: '0.75rem', transition: 'all 0.2s',
            }}>
              <input type="radio" name="payment" checked={paymentMethod === 'KASPI'}
                onChange={() => setPaymentMethod('KASPI')} style={{ accentColor: 'var(--green-500)' }} />
              <div>
                <strong style={{ fontSize: '0.95rem' }}>💳 Перевод на Kaspi</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Переведите сумму и нажмите «Я оплатил»</p>
              </div>
            </label>

            <label style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '1rem', borderRadius: '14px', cursor: 'pointer',
              border: paymentMethod === 'CASH_ON_DELIVERY' ? '2px solid var(--brown-400)' : '2px solid var(--green-100)',
              background: paymentMethod === 'CASH_ON_DELIVERY' ? 'var(--brown-50)' : 'white',
              transition: 'all 0.2s',
            }}>
              <input type="radio" name="payment" checked={paymentMethod === 'CASH_ON_DELIVERY'}
                onChange={() => setPaymentMethod('CASH_ON_DELIVERY')} style={{ accentColor: 'var(--brown-400)' }} />
              <div>
                <strong style={{ fontSize: '0.95rem' }}>💵 Оплата при получении</strong>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Оплатите курьеру наличными или картой</p>
              </div>
            </label>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setStep('delivery')} className="btn-outline" style={{ flex: 1 }}>← Назад</button>
            <button className="btn-primary" style={{ flex: 2 }}
              onClick={() => {
                if (paymentMethod === 'CASH_ON_DELIVERY') setStep('cod_warning');
                else setStep('kaspi_info');
              }}>Далее</button>
          </div>
        </div>
      )}

      {/* Шаг 3a: Kaspi реквизиты */}
      {step === 'kaspi_info' && (
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <span style={{ fontSize: '3rem' }}>💳</span>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '1rem 0 0.5rem' }}>Переведите на Kaspi</h2>
          <div style={{
            background: 'var(--green-50)', borderRadius: '16px', padding: '1.25rem', margin: '1rem 0',
          }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Номер получателя:</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--green-700)', letterSpacing: '1px' }}>+7 705 210 90 90</p>
            <p style={{
              fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-dark)',
              marginTop: '0.75rem', padding: '0.5rem', background: 'var(--brown-50)', borderRadius: '10px',
            }}>{discountedTotal.toLocaleString()} ₸</p>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            После перевода нажмите кнопку ниже. Мы проверим оплату и подтвердим заказ.
          </p>
          <button onClick={placeOrder} disabled={loading} className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.9rem', fontSize: '1.05rem' }}>
            {loading ? 'Оформляем...' : '✅ Я оплатил'}
          </button>
          <button onClick={() => setStep('choose')} style={{
            background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginTop: '0.75rem', fontSize: '0.85rem',
          }}>← Назад</button>
        </div>
      )}

      {/* Шаг 3b: Предупреждение для оплаты при получении */}
      {step === 'cod_warning' && (
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{
            background: '#fef3c7', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #fcd34d',
          }}>
            <h3 style={{ color: '#92400e', fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem' }}>⚠️ Важное предупреждение</h3>
            <p style={{ color: '#78350f', fontSize: '0.9rem', lineHeight: 1.6 }}>
              После того как курьер <strong>выехал на доставку</strong>, вы <strong>не сможете отменить заказ</strong>.
              Пожалуйста, заблаговременно отмените заказ до того, как курьер выйдет на доставку.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setStep('choose')} className="btn-outline" style={{ flex: 1 }}>← Назад</button>
            <button onClick={placeOrder} disabled={loading} className="btn-primary" style={{ flex: 2 }}>
              {loading ? 'Оформляем...' : 'Понятно, оформить заказ'}
            </button>
          </div>
        </div>
      )}

      {/* Шаг 4: Готово */}
      {step === 'done' && (
        <div className="card" style={{ padding: '2.5rem', textAlign: 'center', overflow: 'hidden' }}>
          <Suspense fallback={<span style={{ fontSize: '4rem' }}>🍩</span>}>
            <DonutScene style={{ marginBottom: '1rem' }} />
          </Suspense>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '1rem 0 0.5rem', color: 'var(--green-700)' }}>Заказ оформлен!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            Заказ №{orderId} принят. Мы свяжемся с вами для подтверждения.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>🍩 Наклоните телефон или двигайте мышкой!</p>
          <button onClick={() => navigate('/')} className="btn-primary">На главную</button>
        </div>
      )}
    </div>
  );
}
