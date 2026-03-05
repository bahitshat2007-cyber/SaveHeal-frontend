import { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useFBX } from '@react-three/drei';
import * as THREE from 'three';

/* ───────── Загружаем FBX модель пончика ───────── */
function DonutModel({ tilt }) {
  const ref = useRef();
  const fbx = useFBX('/models/Donut_with_chocolate.fbx');
  const velocity = useRef({ x: 0, y: 0 });
  const position = useRef({ x: 0, y: 0 });

  const BOUNDS = { x: 2.5, y: 2 };
  const DAMPING = 0.96;
  const GRAVITY = 0.003;

  // Нормализуем размер модели
  useEffect(() => {
    if (!fbx) return;
    const box = new THREE.Box3().setFromObject(fbx);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2 / maxDim; // подгоняем под размер ~2 единицы
    fbx.scale.setScalar(scale);

    // Центрируем
    const center = box.getCenter(new THREE.Vector3());
    fbx.position.sub(center.multiplyScalar(scale));
  }, [fbx]);

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
    ref.current.rotation.y += delta * 0.5;
  });

  return (
    <group ref={ref}>
      <primitive object={fbx} />
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
  const hasGyro = useRef(false);

  useEffect(() => {
    const handleOrientation = (e) => {
      if (e.gamma === null || e.beta === null) return;
      hasGyro.current = true;
      tilt.current.x = e.gamma / 10;
      tilt.current.y = -e.beta / 15;
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  const handleMouseMove = (e) => {
    if (hasGyro.current) return;
    tilt.current.x = (e.clientX / window.innerWidth - 0.5) * 4;
    tilt.current.y = -(e.clientY / window.innerHeight - 0.5) * 4;
  };

  return (
    <div className="donut-box" onMouseMove={handleMouseMove} style={style}>
      <div className="donut-film" />
      <Canvas
        camera={{ position: [0, 1, 5], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 5, 4]} intensity={1.5} />
        <pointLight position={[-3, -2, 3]} intensity={0.4} color="#ff69b4" />

        <DonutModel tilt={tilt} />
        <Confetti />
      </Canvas>
    </div>
  );
}
