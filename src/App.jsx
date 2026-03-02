import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';

import Navbar from './components/Navbar';
import SupportChat from './components/SupportChat';

import Home from './pages/Home';
import Login from './pages/Login';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import News from './pages/News';
import MyOrders from './pages/MyOrders';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Favorites from './pages/Favorites';

import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Analytics from './pages/admin/Analytics';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminNews from './pages/admin/AdminNews';
import AdminChat from './pages/admin/AdminChat';
import AdminComplaints from './pages/admin/AdminComplaints';

import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <Routes>
              {/* Админ-панель (без навбара) */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Analytics />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="news" element={<AdminNews />} />
                <Route path="chat" element={<AdminChat />} />
                <Route path="complaints" element={<AdminComplaints />} />
              </Route>

              {/* Пользовательский сайт */}
              <Route path="*" element={
                <>
                  <Navbar />
                  <main style={{ minHeight: 'calc(100vh - 60px)' }}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/news" element={<News />} />
                      <Route path="/orders" element={<MyOrders />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/favorites" element={<Favorites />} />
                    </Routes>
                  </main>
                  <SupportChat />
                  {/* Футер */}
                  <footer style={{
                    background: 'var(--green-700)',
                    color: 'rgba(255,255,255,0.8)',
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    fontSize: '0.85rem',
                  }}>
                    <p style={{ fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
                      🌿 SaveHeal Foods
                    </p>
                    <p>ПП-десерты с доставкой по Казахстану</p>
                    <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.8rem' }}>
                      <a href="/about" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>О нас</a>
                      <a href="/privacy" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Конфиденциальность</a>
                    </div>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.6 }}>
                      © {new Date().getFullYear()} SaveHeal Foods
                    </p>
                  </footer>
                </>
              } />
            </Routes>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
