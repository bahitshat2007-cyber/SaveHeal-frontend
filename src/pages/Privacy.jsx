export default function Privacy() {
  return (
    <div className="container fade-in" style={{ padding: '2rem 1rem', maxWidth: '700px' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>
        🔒 Политика конфиденциальности
      </h1>

      <div className="card" style={{ padding: '2rem', lineHeight: 1.8, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        <p style={{ marginBottom: '1rem' }}>
          <strong style={{ color: 'var(--text-dark)' }}>1. Сбор данных</strong><br />
          Мы собираем минимум данных: имя, номер телефона, email (при Google-авторизации) и адрес доставки.
          Эти данные используются исключительно для обработки и доставки заказов.
        </p>

        <p style={{ marginBottom: '1rem' }}>
          <strong style={{ color: 'var(--text-dark)' }}>2. Хранение данных</strong><br />
          Все данные хранятся в защищённой базе данных. Пароли шифруются с использованием bcrypt.
          Мы не храним данные банковских карт.
        </p>

        <p style={{ marginBottom: '1rem' }}>
          <strong style={{ color: 'var(--text-dark)' }}>3. Передача третьим лицам</strong><br />
          Мы не передаём ваши данные третьим лицам, за исключением служб доставки
          (только имя, телефон и адрес для доставки заказа).
        </p>

        <p style={{ marginBottom: '1rem' }}>
          <strong style={{ color: 'var(--text-dark)' }}>4. Google авторизация</strong><br />
          При входе через Google мы получаем доступ только к вашему имени и email.
          Мы не получаем доступ к вашим контактам, файлам или другим данным Google-аккаунта.
        </p>

        <p style={{ marginBottom: '1rem' }}>
          <strong style={{ color: 'var(--text-dark)' }}>5. Cookies</strong><br />
          Мы используем localStorage для хранения токена авторизации и настроек интерфейса (тема, избранное).
        </p>

        <p>
          <strong style={{ color: 'var(--text-dark)' }}>6. Контакты</strong><br />
          По вопросам конфиденциальности: +7 705 210 90 90
        </p>
      </div>
    </div>
  );
}
