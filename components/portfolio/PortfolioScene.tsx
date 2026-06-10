"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ChapterKey } from "@/data/portfolioData";
import BookModel from "./BookModel";
import FloatingMonitor from "./FloatingMonitor";
import FloorLamp from "./FloorLamp";

// 닫힌 상태: 세워진 책을 3/4 앵글로 보는 눈높이 카메라
// 앞표지 + 왼쪽 척추 + 상단 두께감이 보이는 위치
const CLOSED_CAM = new THREE.Vector3(-0.2, 0.4, 3.8);

// 열린 상태: 책이 +0.75 로 세워져 있으므로 정면-약간위에서 봐야 카드가 보임
const OPEN_CAM: Record<ChapterKey, THREE.Vector3> = {
  about: new THREE.Vector3(0, 1.0, 5.2),
  career: new THREE.Vector3(0.3, 0.8, 5.0),
  projects: new THREE.Vector3(0, 1.2, 5.2),
};

const LOOK_AT = new THREE.Vector3(0, 0.1, 0);

interface Props {
  chapter: ChapterKey;
  isOpen: boolean;
}

export default function PortfolioScene({ chapter, isOpen }: Props) {
  const { camera, size } = useThree();
  const bookGroupRef = useRef<THREE.Group>(null);
  const bookY = useRef(0);
  const tempCamTarget = useRef(new THREE.Vector3());

  useFrame(() => {
    // 좁은 화면(모바일)일수록 카메라를 뒤로 당겨 책 전체가 viewport에 들어오도록 조정
    const mobileOffset = Math.max(0, (768 - size.width) / 768) * 9;

    const raw = isOpen ? OPEN_CAM[chapter] : CLOSED_CAM;
    tempCamTarget.current.set(raw.x, raw.y, raw.z + mobileOffset);

    camera.position.lerp(tempCamTarget.current, 0.04);
    camera.lookAt(LOOK_AT);

    // 모바일에서 책을 화면 하단으로 내려 오버레이 카드와 겹치지 않게
    const targetY = isOpen ? (size.width < 768 ? -1.5 : -0.4) : 0;
    bookY.current += (targetY - bookY.current) * 0.06;
    if (bookGroupRef.current) bookGroupRef.current.position.y = bookY.current;
  });

  return (
    <>
      <ambientLight intensity={0.65} />

      {/* 위쪽 메인 조명 */}
      <directionalLight
        position={[3, 8, 4]}
        intensity={1.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />

      {/* 정면 보조 조명 — 닫힌 책 앞면이 너무 어둡지 않게 */}
      <directionalLight position={[0, 1, 6]} intensity={0.55} color="#d8e8ff" />

      {/* 오른쪽 보조 조명 (닫힌 책 오른쪽 측면 조명) */}
      <directionalLight position={[4, 2, 2]} intensity={0.35} color="#fff5e8" />

      {/* 그림자 바닥 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.6, 0]}
        receiveShadow
      >
        <planeGeometry args={[30, 30]} />
        <shadowMaterial transparent opacity={0.1} />
      </mesh>

      {/* 책 */}
      <group ref={bookGroupRef}>
        <BookModel chapter={chapter} isOpen={isOpen} />
      </group>

      {/* 모니터: 항상 마운트, visible prop으로 애니메이션 제어 */}
      <FloatingMonitor visible={chapter === "projects" && isOpen} />

      {/* 스탠드 조명 */}
      <FloorLamp />
    </>
  );
}
