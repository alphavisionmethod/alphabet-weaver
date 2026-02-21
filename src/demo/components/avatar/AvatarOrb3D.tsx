import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere, Float } from '@react-three/drei';
import * as THREE from 'three';
import type { AvatarSkinState } from '../../types';

const STATE_CONFIG: Record<AvatarSkinState, { color: string; emissive: string; distort: number; speed: number; intensity: number }> = {
  IDLE: { color: '#6366f1', emissive: '#312e81', distort: 0.15, speed: 1.5, intensity: 0.3 },
  LISTENING: { color: '#818cf8', emissive: '#3730a3', distort: 0.25, speed: 2, intensity: 0.5 },
  THINKING: { color: '#a78bfa', emissive: '#5b21b6', distort: 0.45, speed: 4, intensity: 0.7 },
  CONFIRMING: { color: '#34d399', emissive: '#065f46', distort: 0.2, speed: 2.5, intensity: 0.8 },
  WARNING: { color: '#f87171', emissive: '#7f1d1d', distort: 0.35, speed: 3, intensity: 0.6 },
  REFUSAL: { color: '#94a3b8', emissive: '#1e293b', distort: 0.1, speed: 1, intensity: 0.2 },
};

function OrbMesh({ state }: { state: AvatarSkinState }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const config = STATE_CONFIG[state];

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.rotation.x += delta * 0.1;
    }
  });

  return (
    <Float speed={config.speed} rotationIntensity={0.3} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <MeshDistortMaterial
          color={config.color}
          emissive={config.emissive}
          emissiveIntensity={config.intensity}
          roughness={0.15}
          metalness={0.8}
          distort={config.distort}
          speed={config.speed}
          transparent
          opacity={0.9}
        />
      </Sphere>
      {/* Inner glow sphere */}
      <Sphere args={[0.7, 32, 32]}>
        <meshBasicMaterial color={config.emissive} transparent opacity={0.15} />
      </Sphere>
    </Float>
  );
}

function Particles({ state }: { state: AvatarSkinState }) {
  const count = 40;
  const ref = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.3 + Math.random() * 0.5;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.2;
    }
  });

  const showParticles = state === 'CONFIRMING' || state === 'THINKING';

  return showParticles ? (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color={state === 'CONFIRMING' ? '#34d399' : '#a78bfa'}
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  ) : null;
}

interface AvatarOrb3DProps {
  state: AvatarSkinState;
  size?: number;
}

export function AvatarOrb3D({ state, size = 48 }: AvatarOrb3DProps) {
  return (
    <div style={{ width: size, height: size }} className="relative">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#818cf8" />
        <pointLight position={[-5, -3, 2]} intensity={0.4} color="#f0abfc" />
        <OrbMesh state={state} />
        <Particles state={state} />
      </Canvas>
    </div>
  );
}
