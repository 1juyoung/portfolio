"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const SW = 1;
const SH = 0.7;
const SD = 0.1;
const NECK_H = 0.2;
const BASE_W = 0.5;

interface Props {
  visible: boolean; // isOpen && chapter === 'projects' 일 때만 true
}

export default function FloatingMonitor({ visible }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  // 책 페이지가 열릴 때의 월드 Y ≈ -0.1 ~ 0  → 거기서 시작해 위로 떠오름
  const currentY = useRef(-0.1);
  const currentSc = useRef(0.001);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const bob = Math.sin(clock.elapsedTime * 0.85) * 0.04;
    // hidden 상태: 책 페이지 위치(-0.1)에서 scale=0으로 대기
    const targetY = visible ? 0.7 + bob : -0.1;
    const targetSc = visible ? 1.0 : 0.001;

    currentY.current += (targetY - currentY.current) * 0.055;
    currentSc.current += (targetSc - currentSc.current) * 0.055;

    groupRef.current.position.y = currentY.current;
    groupRef.current.scale.setScalar(currentSc.current);
    // scale이 충분히 작으면 렌더링 스킵
    groupRef.current.visible = visible || currentSc.current > 0.01;
  });

  return (
    /*
      배치:
      · X = +0.8: 오른쪽 페이지 위 (Projects에서 왼쪽=내용, 오른쪽=모니터)
      · rotation.x = -0.65: 스크린이 카메라(위쪽 앞)를 향하도록 뒤로 기울임
        book.rotation.x(-0.20) + monitor.rotation.x(-0.65) ≈ -0.85 합산
        → 스크린 normal ≈ [0, 0.75, 0.66] ≈ 카메라 방향 ✓
    */
    <group ref={groupRef} position={[0.7, 0, 0.8]} rotation={[0, -0.4, 0]}>
      {/* 모니터 하우징 */}
      <mesh castShadow>
        <boxGeometry args={[SW, SH, SD]} />
        <meshStandardMaterial
          color="#1e293b"
          roughness={0.35}
          metalness={0.4}
        />
      </mesh>

      {/* 스크린 (앞면 +Z 방향 = 카메라 방향) */}
      <mesh position={[0, 0, SD / 2 + 0.001]}>
        <planeGeometry args={[SW - 0.14, SH - 0.1]} />
        <meshStandardMaterial
          color="#060e1f"
          emissive="#1a4a8a"
          emissiveIntensity={1.0}
          roughness={0.04}
        />
      </mesh>

      {/* 받침대 기둥 */}
      <mesh position={[0, -(SH / 2 + NECK_H / 2), 0]} castShadow>
        <boxGeometry args={[0.08, NECK_H, 0.07]} />
        <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* 받침대 베이스 */}
      <mesh position={[0, -(SH / 2 + NECK_H + 0.035), 0]} castShadow>
        <boxGeometry args={[BASE_W, 0.055, 0.38]} />
        <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.3} />
      </mesh>
    </group>
  );
}
