import { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ───────── Пончик с правильной глазурью ───────── */
function Donut({ tilt }) {
  const ref = useRef();
  const velocity = useRef({ x: 0, y: 0 });
  const position = useRef({ x: 0, y: 0 });

  const BOUNDS = { x: 2.5, y: 2 };
  const DAMPING = 0.96;
  const GRAVITY = 0.003;

  useFrame((_, delta) => {
    if (!ref.current) return;

    // Физика наклона
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
  });

  // Посыпка - точно на поверхности верхней части тора
  const sprinkles = useMemo(() => {
    const items = [];
    const colors = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899', '#ffffff'];
    const R = 0.7;
    const r = 0.3;

    for (let i = 0; i < 35; i++) {
      const u = (i / 35) * Math.PI * 2; // вокруг кольца
      const v = (Math.random() * 0.8 - 0.1) * Math.PI * 0.5; // только верх трубки

      const surfaceR = r + 0.03;
      const x = (R + surfaceR * Math.cos(v)) * Math.cos(u);
      const y = surfaceR * Math.sin(v) + 0.05;
      const z = (R + surfaceR * Math.cos(v)) * Math.sin(u);

      items.push({
        pos: [x, y, z],
        rot: [Math.random() * 3, Math.random() * 3, Math.random() * 3],
        color: colors[i % colors.length],
      });
    }
    return items;
  }, []);

  return (
    <group ref={ref} rotation={[0.5, 0, 0]}>
      {/* Основа пончика — тёплый цвет теста */}
      <mesh>
        <torusGeometry args={[0.7, 0.3, 28, 48]} />
        <meshStandardMaterial color="#d4943a" roughness={0.7} />
      </mesh>

      {/* Глазурь — полный тор чуть больше, сдвинут вверх.
          clippingPlanes обрезает нижнюю часть, оставляя только верх */}
      <mesh position={[0, 0.02, 0]}>
        <torusGeometry args={[0.7, 0.32, 28, 48]} />
        <meshStandardMaterial
          color="#ff6eb4"
          roughness={0.2}
          metalness={0.05}
          clippingPlanes={[new THREE.Plane(new THREE.Vector3(0, -1, 0), 0.02)]}
          clipShadows
        />
      </mesh>

      {/* Посыпка — маленькие палочки */}
      {sprinkles.map((s, i) => (
        <mesh key={i} position={s.pos} rotation={s.rot}>
          <capsuleGeometry args={[0.015, 0.06, 4, 6]} />
          <meshStandardMaterial color={s.color} roughness={0.4} />
        </mesh>
      ))}
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
      setHasGyro(true);
      tilt.current.x = (e.gamma || 0) / 10;
      tilt.current.y = -(e.beta || 0) / 15;
    };

    // Мышка (десктоп) — двигаем пончик куда ведёт курсор
    const handleMouse = (e) => {
      if (hasGyro) return;
      tilt.current.x = (e.clientX / window.innerWidth - 0.5) * 5;
      tilt.current.y = -(e.clientY / window.innerHeight - 0.5) * 5;
    };

    window.addEventListener('deviceorientation', handleOrientation);
    window.addEventListener('mousemove', handleMouse);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, [hasGyro]);

  return (
    <div style={{
      width: '100%', height: '280px', borderRadius: '20px', overflow: 'hidden',
      position: 'relative',
      border: '2px solid rgba(255,255,255,0.25)',
      boxShadow: 'inset 0 0 30px rgba(255,255,255,0.1), 0 4px 20px rgba(0,0,0,0.1)',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
      ...style,
    }}>
      {/* Плёнка — блик сверху */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(160deg, rgba(255,255,255,0.15) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.08) 100%)',
        borderRadius: '20px',
        pointerEvents: 'none',
        zIndex: 10,
      }} />
      <Canvas
        camera={{ position: [0, 1, 4], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ localClippingEnabled: true }}
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
