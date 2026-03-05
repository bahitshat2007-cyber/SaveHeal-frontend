import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

/* ───────── Пончик (Torus) с физикой наклона ───────── */
function Donut({ tilt }) {
  const ref = useRef();
  const velocity = useRef({ x: 0, y: 0, z: 0 });
  const position = useRef({ x: 0, y: 0, z: 0 });

  // Границы (чтобы пончик не улетел за экран)
  const BOUNDS = { x: 2.5, y: 2, z: 1.5 };
  const DAMPING = 0.96;
  const GRAVITY_SCALE = 0.003;

  useFrame((_, delta) => {
    if (!ref.current) return;
    const dt = Math.min(delta, 0.05);

    // Применяем "гравитацию" от наклона телефона
    velocity.current.x += tilt.current.x * GRAVITY_SCALE;
    velocity.current.y += tilt.current.y * GRAVITY_SCALE;

    // Затухание
    velocity.current.x *= DAMPING;
    velocity.current.y *= DAMPING;

    // Обновляем позицию
    position.current.x += velocity.current.x;
    position.current.y += velocity.current.y;

    // Ограничения — отскок от стенок
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

    // Вращение пончика
    ref.current.rotation.x += dt * 0.8;
    ref.current.rotation.z += dt * 0.5;
  });

  return (
    <group ref={ref}>
      {/* Тело пончика */}
      <mesh>
        <torusGeometry args={[0.7, 0.35, 32, 64]} />
        <meshStandardMaterial color="#f5a623" roughness={0.3} metalness={0.05} />
      </mesh>
      {/* Глазурь (чуть больше тор) */}
      <mesh position={[0, 0.05, 0]} rotation={[0.1, 0, 0]}>
        <torusGeometry args={[0.7, 0.36, 32, 64, Math.PI * 1.2]} />
        <meshStandardMaterial color="#ff69b4" roughness={0.2} metalness={0.1} />
      </mesh>
      {/* Посыпка */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const r = 0.7 + (Math.random() - 0.5) * 0.2;
        return (
          <mesh key={i}
            position={[
              Math.cos(angle) * r,
              0.3 + Math.random() * 0.1,
              Math.sin(angle) * r,
            ]}
            rotation={[Math.random(), Math.random(), Math.random()]}>
            <boxGeometry args={[0.06, 0.02, 0.02]} />
            <meshStandardMaterial color={['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6'][i % 5]} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ───────── Конфетти частицы ───────── */
function Confetti() {
  const count = 40;
  const ref = useRef();
  const particles = useRef(
    Array.from({ length: count }).map(() => ({
      x: (Math.random() - 0.5) * 6,
      y: Math.random() * 4 + 2,
      z: (Math.random() - 0.5) * 3,
      vy: -0.01 - Math.random() * 0.02,
      rx: Math.random() * 0.05,
      ry: Math.random() * 0.05,
      color: ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'][Math.floor(Math.random() * 6)],
    }))
  );

  useFrame(() => {
    if (!ref.current) return;
    ref.current.children.forEach((mesh, i) => {
      const p = particles.current[i];
      p.y += p.vy;
      if (p.y < -3) p.y = 4;
      mesh.position.set(p.x, p.y, p.z);
      mesh.rotation.x += p.rx;
      mesh.rotation.z += p.ry;
    });
  });

  return (
    <group ref={ref}>
      {particles.current.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <planeGeometry args={[0.12, 0.12]} />
          <meshBasicMaterial color={p.color} side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/* ───────── Главный компонент (Канвас + гироскоп) ───────── */
export default function DonutScene({ style }) {
  const tilt = useRef({ x: 0, y: 0 });
  const [hasGyro, setHasGyro] = useState(false);

  useEffect(() => {
    // Гироскоп — наклон телефона
    const handleOrientation = (e) => {
      setHasGyro(true);
      tilt.current.x = (e.gamma || 0) / 10; // лево-право
      tilt.current.y = -(e.beta || 0) / 15; // вперед-назад
    };

    // Мышка — для десктопа
    const handleMouse = (e) => {
      if (hasGyro) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 4;
      const y = -(e.clientY / window.innerHeight - 0.5) * 4;
      tilt.current.x = x;
      tilt.current.y = y;
    };

    window.addEventListener('deviceorientation', handleOrientation);
    window.addEventListener('mousemove', handleMouse);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, [hasGyro]);

  return (
    <div style={{ width: '100%', height: '280px', borderRadius: '20px', overflow: 'hidden', ...style }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }} style={{ background: 'transparent' }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-3, -3, 3]} intensity={0.4} color="#ff69b4" />

        <Donut tilt={tilt} />
        <Confetti />
      </Canvas>
    </div>
  );
}
