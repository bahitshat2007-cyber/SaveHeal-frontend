export function Skeleton({ width = '100%', height = '20px', radius = '8px', style = {} }) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: 'linear-gradient(90deg, var(--green-50) 25%, var(--green-100) 50%, var(--green-50) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite ease-in-out',
      ...style,
    }} />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
      <Skeleton height="200px" radius="0" />
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Skeleton height="18px" width="70%" />
        <Skeleton height="14px" width="90%" />
        <Skeleton height="14px" width="50%" />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          <Skeleton height="24px" width="80px" />
          <Skeleton height="36px" width="100px" radius="10px" />
        </div>
      </div>
    </div>
  );
}

export function OrderSkeleton() {
  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Skeleton height="20px" width="120px" />
        <Skeleton height="24px" width="90px" radius="20px" />
      </div>
      <Skeleton height="60px" radius="12px" />
      <Skeleton height="16px" width="60%" />
    </div>
  );
}
