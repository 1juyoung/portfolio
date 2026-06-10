"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

const GROUND_Y = -0.6;
const POLE_H = 1.6;
const SHADE_H = 0.38;
const shadeCenterY = GROUND_Y + 0.018 + POLE_H + SHADE_H / 2; // ≈ 1.208

const STAGE = [
  { point: 0, fill: 0, spot: 0, emissive: 0 },
  { point: 1.0, fill: 0.35, spot: 1.2, emissive: 0.14 },
  { point: 2.8, fill: 0.9, spot: 3.0, emissive: 0.45 },
] as const;

// ── 먼지 파티클 ──────────────────────────────────────────────
const N = 22;

// 컴포넌트 외부에서 한 번만 생성 (Math.random은 렌더 중 호출 불가)
const PARTICLE_POSITIONS = (() => {
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 0.28;
    pos[i * 3] = Math.cos(angle) * r;
    pos[i * 3 + 1] = Math.random() * 0.85;
    pos[i * 3 + 2] = Math.sin(angle) * r;
  }
  return pos;
})();

const PARTICLE_SPEEDS = Float32Array.from(
  { length: N },
  () => 0.0008 + Math.random() * 0.0016
);

function LampParticles({ stage }: { stage: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => PARTICLE_POSITIONS.slice(), []);
  const speeds = PARTICLE_SPEEDS;

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const attr = pointsRef.current.geometry.attributes.position;
    const pos = attr.array as Float32Array;
    const t = clock.elapsedTime;

    for (let i = 0; i < N; i++) {
      pos[i * 3 + 1] += speeds[i];
      pos[i * 3] += Math.sin(t * 0.8 + i * 1.3) * 0.0004;
      pos[i * 3 + 2] += Math.cos(t * 0.6 + i * 0.9) * 0.0003;
      if (pos[i * 3 + 1] > 0.9) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * 0.22;
        pos[i * 3] = Math.cos(angle) * r;
        pos[i * 3 + 1] = 0;
        pos[i * 3 + 2] = Math.sin(angle) * r;
      }
    }
    attr.needsUpdate = true;

    const mat = pointsRef.current.material as THREE.PointsMaterial;
    const target = stage === 0 ? 0 : stage === 1 ? 0.45 : 0.72;
    mat.opacity += (target - mat.opacity) * 0.05;
  });

  return (
    <points ref={pointsRef} position={[0, shadeCenterY, 0]}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffe090"
        size={0.018}
        transparent
        opacity={0}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

// ── 클릭 안내 손글씨 ─────────────────────────────────────────
function ClickAnnotation({ visible }: { visible: boolean }) {
  return (
    <Html
      position={[-0.55, shadeCenterY + 0.1, 0]}
      center
      zIndexRange={[80, 0]}
      style={{
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.9s",
      }}
    >
      <div style={{ userSelect: "none" }}>
        <style>{`
          @keyframes float-click {
            0%, 100% { transform: translateY(0)   rotate(-9deg); }
            50%      { transform: translateY(-4px) rotate(-9deg); }
          }
        `}</style>

        <p
          style={{
            margin: "-6px 0 0 10px",
            fontFamily: "var(--font-caveat), cursive",
            fontSize: 20,
            fontWeight: 700,
            color: "#1e293b",
            whiteSpace: "nowrap",
            animation: "float-click 1.5s ease-in-out infinite",
          }}
        >
          Click!
        </p>
      </div>
    </Html>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────
export default function FloorLamp() {
  const lightRef = useRef<THREE.PointLight>(null);
  const fillRef = useRef<THREE.PointLight>(null);
  const spotRef = useRef<THREE.SpotLight>(null);
  const shadeMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const [stage, setStage] = useState(0);
  const [hasClicked, setHasClicked] = useState(false);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    setStage((s) => (s + 1) % 3);
    if (!hasClicked) setHasClicked(true);
  };
  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
  };
  const handlePointerOut = () => {
    document.body.style.cursor = "default";
  };

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const tg = STAGE[stage];
    const k = 0.07;
    const flicker =
      stage > 0 ? 1 + Math.sin(t * 4.1) * 0.04 + Math.sin(t * 11.3) * 0.018 : 1;

    if (lightRef.current)
      lightRef.current.intensity +=
        (tg.point * flicker - lightRef.current.intensity) * k;
    if (fillRef.current)
      fillRef.current.intensity += (tg.fill - fillRef.current.intensity) * k;
    if (spotRef.current)
      spotRef.current.intensity += (tg.spot - spotRef.current.intensity) * k;
    if (shadeMatRef.current)
      shadeMatRef.current.emissiveIntensity +=
        (tg.emissive - shadeMatRef.current.emissiveIntensity) * k;
  });

  const poleY = GROUND_Y + 0.018 + POLE_H / 2;
  const shadeBaseY = GROUND_Y + 0.018 + POLE_H;

  return (
    <group
      position={[-2.2, 0, -1]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {/* 베이스 */}
      <mesh position={[0, GROUND_Y + 0.015, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.22, 0.24, 0.03, 48]} />
        <meshStandardMaterial
          color="#252525"
          roughness={0.22}
          metalness={0.82}
        />
      </mesh>

      {/* 베이스 상단 링 */}
      <mesh position={[0, GROUND_Y + 0.032, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.21, 0.006, 12, 48]} />
        <meshStandardMaterial color="#555" roughness={0.15} metalness={0.9} />
      </mesh>

      {/* 기둥 */}
      <mesh position={[0, poleY, 0]} castShadow>
        <cylinderGeometry args={[0.011, 0.015, POLE_H, 16]} />
        <meshStandardMaterial
          color="#6a6a6a"
          roughness={0.18}
          metalness={0.9}
        />
      </mesh>

      {/* 기둥 상단 넥 */}
      <mesh position={[0, shadeBaseY + 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.028, 0.014, 0.06, 16]} />
        <meshStandardMaterial
          color="#5a5a5a"
          roughness={0.2}
          metalness={0.85}
        />
      </mesh>

      {/* 갓 본체 */}
      <mesh position={[0, shadeCenterY, 0]}>
        <cylinderGeometry args={[0.3, 0.11, SHADE_H, 48, 1, true]} />
        <meshStandardMaterial
          ref={shadeMatRef}
          color="#f0e5cc"
          roughness={0.88}
          transparent
          opacity={0.86}
          side={THREE.DoubleSide}
          emissive="#e8a820"
          emissiveIntensity={0}
        />
      </mesh>

      {/* 갓 상단 링 */}
      <mesh
        position={[0, shadeCenterY + SHADE_H / 2, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.3, 0.007, 12, 48]} />
        <meshStandardMaterial
          color="#b8a888"
          roughness={0.55}
          metalness={0.15}
        />
      </mesh>

      {/* 갓 하단 링 */}
      <mesh
        position={[0, shadeCenterY - SHADE_H / 2, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <torusGeometry args={[0.11, 0.005, 12, 48]} />
        <meshStandardMaterial
          color="#b8a888"
          roughness={0.55}
          metalness={0.15}
        />
      </mesh>

      {/* 갓 내부 포인트 조명 */}
      <pointLight
        ref={lightRef}
        position={[0, shadeCenterY - 0.05, 0]}
        color="#ffd070"
        intensity={0}
        distance={6}
        decay={2}
      />

      {/* 바닥 스팟 조명 — 자연스러운 원형 그라데이션 */}
      <spotLight
        ref={spotRef}
        position={[0, shadeCenterY - 0.1, 0]}
        color="#ffcc55"
        intensity={0}
        distance={5}
        angle={Math.PI / 4}
        penumbra={1}
        decay={1.5}
        castShadow={false}
      />

      {/* 넓은 채우기 조명 */}
      <pointLight
        ref={fillRef}
        position={[0, shadeCenterY, 0]}
        color="#ffbb33"
        intensity={0}
        distance={14}
        decay={1.6}
      />

      {/* 먼지 파티클 */}
      <LampParticles stage={stage} />

      {/* 클릭 안내 — 첫 클릭 후 사라짐 */}
      <ClickAnnotation visible={!hasClicked} />
    </group>
  );
}
