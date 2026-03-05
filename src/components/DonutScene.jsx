import { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ───────── Пончик с надежной геометрией глазури ───────── */
function Donut({ tilt }) {
  const ref = useRef();
  const velocity = useRef({ x: 0, y: 0 });
  const position = useRef({ x: 0, y: 0 });

  const BOUNDS = { x: 2.5, y: 2 };
  const DAMPING = 0.96;
  const GRAVITY = 0.003;

  useFrame((_, delta) => {
    if (!ref.current) return;

    // Физика наклона / мыши
    velocity.current.x += tilt.current.x * GRAVITY;
    velocity.current.y += tilt.current.y * GRAVITY;
    velocity.current.x *= DAMPING;
    velocity.current.y *= DAMPING;

    position.current.x += velocity.current.x;
    position.current.y += velocity.current.y;

    // Отскок от стенок
    if (Math.abs(position.current.x) > BOUNDS.x) {
      position.current.x = Math.sign(position.current.x) * BOUNDS.x;
      velocity.current.x *= -0.5;
    }
    if (Math.abs(position.current.y) > BOUNDS.y) {
      position.current.y = Math.sign(position.current.y) * BOUNDS.y;
      velocity.current.y *= -0.5;
    }

    ref.current.position.x = position.current.x;
    ref.current.position.y = position.current.y;

    // Медленное вращение
    ref.current.rotation.y += delta * 0.6;
    ref.current.rotation.x += delta * 0.2;
  });

  // Посыпка (на поверхности TubeGeometry)
  const sprinkles = useMemo(() => {
    const items = [];
    const colors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ffffff'];
    const R = 0.7; // Радиус основного кольца пончика
    const r = 0.32; // Радиус трубки глазури

    for (let i = 0; i < 40; i++) {
        // u - угол вокруг центра пончика
        const u = (i / 40) * Math.PI * 2;
        // v - угол на поверхности самой трубки глазури.
        // Берем верхнюю часть трубки (-pi/2 до pi/2)
        const v = (Math.random() - 0.5) * Math.PI * 0.8;
        
        // Математика поверхности тора (tube thickness r, main radius R)
        // Но так как у глазури мы используем TubeGeometry вокруг кривой радиуса R,
        // то её сечение - окружность радиуса r.
        const x = (R + r * Math.sin(v)) * Math.cos(u);
        const y = r * Math.cos(v); // Y смотрит вверх (т.к. мы повернем сплайн глазури)
        const z = (R + r * Math.sin(v)) * Math.sin(u);

        items.push({
            pos: [x, y, z],
            rot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
            color: colors[i % colors.length],
        });
    }
    return items;
  }, []);

  // Геометрия глазури: Трубка, пущенная по кругу, но верхняя половина разрезана не будет.
  // Вместо clipping plane, просто используем сплющенную полу-трубку.
  const glazeCurve = useMemo(() => {
    class DonutCurve extends THREE.Curve {
        getPoint(t, optionalTarget = new THREE.Vector3()) {
            const angle = t * Math.PI * 2;
            return optionalTarget.set(0.7 * Math.cos(angle), 0, 0.7 * Math.sin(angle));
        }
    }
    return new DonutCurve();
  }, []);

  return (
    <group ref={ref} rotation={[0.4, 0, 0.2]}>
      {/* Основа пончика */}
      <mesh>
        <torusGeometry args={[0.7, 0.3, 32, 64]} />
        <meshStandardMaterial color="#d89645" roughness={0.6} />
      </mesh>

      {/* Глазурь (Tube вокруг кольца, показываем только верхнюю "половину" трубки с помощью radialSegments/arc)
          torusGeometry имеет arc параметр, но он режет кольцо, а не трубку!
          Поэтому используем сплющенный torus, смещенный вверх. */}
      <mesh position={[0, 0.08, 0]} scale={[1, 0.8, 1]}>
        <torusGeometry args={[0.7, 0.31, 32, 64]} />
        <meshStandardMaterial color="#ff69b4" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Посыпка */}
      <group position={[0, 0.08, 0]} scale={[1, 0.8, 1]}>
        {sprinkles.map((s, i) => (
          <mesh key={i} position={s.pos} rotation={s.rot}>
            <capsuleGeometry args={[0.015, 0.06, 4, 8]} />
            <meshStandardMaterial color={s.color} roughness={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ───────── Конфетти ───────── */
function Confetti() {
  const ref = useRef();

  const particles = useMemo(() =>
    Array.from({ length: 40 }).map(() => ({
      x: (Math.random() - 0.5) * 6,
      y: Math.random() * 5 + 1,
      z: (Math.random() - 0.5) * 3,
      vy: -0.008 - Math.random() * 0.012,
      rx: Math.random() * 0.04,
      ry: Math.random() * 0.04,
      color: ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)],
      size: 0.06 + Math.random() * 0.06,
    })),
  []);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.children.forEach((mesh, i) => {
      const p = particles[i];
      p.y += p.vy;
      if (p.y < -3) p.y = 5;
      mesh.position.set(p.x, p.y, p.z);
      mesh.rotation.x += p.rx;
      mesh.rotation.z += p.ry;
    });
  });

  return (
    <group ref={ref}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <planeGeometry args={[p.size, p.size]} />
          <meshBasicMaterial color={p.color} side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/* ───────── Главная сцена ───────── */
export default function DonutScene({ style }) {
  const tilt = useRef({ x: 0, y: 0 });
  const [hasGyro, setHasGyro] = useState(false);

  useEffect(() => {
    // Гироскоп (телефон)
    const handleOrientation = (e) => {
      // Игнорируем если гироскоп выдает нули (десктопы иногда так делают)
      if (e.gamma === null || e.beta === null) return;
      setHasGyro(true);
      tilt.current.x = e.gamma / 10;
      tilt.current.y = -e.beta / 15;
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  // Мышка (десктоп) - вешаем на сам Canvas-контейнер, чтобы плёнка не блокировала!
  const handleMouseMove = (e) => {
    if (hasGyro) return;
    
    // Получаем координаты относительно окна
    const x = (e.clientX / window.innerWidth - 0.5) * 4;
    const y = -(e.clientY / window.innerHeight - 0.5) * 4;
    
    tilt.current.x = x;
    tilt.current.y = y;
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      style={{
        width: '100%', height: '280px', borderRadius: '20px', overflow: 'hidden',
        position: 'relative',
        border: '2px solid rgba(255,255,255,0.25)',
        boxShadow: 'inset 0 0 30px rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.1)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
        ...style,
      }}
    >
      {/* Плёнка — блик сверху. pointerEvents: none крайне важен! */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(160deg, rgba(255,255,255,0.15) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.08) 100%)',
        borderRadius: '20px',
        pointerEvents: 'none',
        zIndex: 10,
      }} />
      <Canvas
        camera={{ position: [0, 1, 4.5], fov: 45 }}
        style={{ background: 'transparent', pointerEvents: 'none' }} // сам канвас не должен блокировать мышь
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 5, 4]} intensity={1.2} />
        <pointLight position={[-2, -2, 2]} intensity={0.3} color="#ff69b4" />

        <Donut tilt={tilt} />
        <Confetti />
      </Canvas>
    </div>
  );
}
