"use client";

import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ChapterKey } from "@/data/portfolioData";
import BookModel from "./BookModel";
import FloatingMonitor from "./FloatingMonitor";
import FloorLamp from "./FloorLamp";
import BookshelfIntro, { HERO_BASE_X, HERO_BASE_Y } from "./BookshelfIntro";

// ─── 포트폴리오 카메라 ────────────────────────────────────────
const CLOSED_CAM = new THREE.Vector3(-0.2, 0.6, 6.5);
const OPEN_CAM: Record<ChapterKey, THREE.Vector3> = {
  about: new THREE.Vector3(0, 1.3, 5),
  career: new THREE.Vector3(0.2, 1.1, 4.8),
  projects: new THREE.Vector3(0, 1.3, 5.0),
};
const LOOK_AT = new THREE.Vector3(0, 0.05, 0);

// ─── 책장 슬롯 → 씬 중앙 애니메이션 상수 ─────────────────────
const SHELF_BOOK_SCALE = 0.45;
// ClosedBook 내부 rotation.y ≈ 0.26 을 상쇄해 척추가 카메라를 향하게 함
const SHELF_ROT_Y = Math.PI / 2 - 0.26;

const SHELF_Z = 0.18; // 책 뒷면이 책장 뒷판(z≈-0.175) 앞에 위치 — z-fighting 방지
const PULL_Z = 0.82; // phase 1: Z 앞으로 뽑혀 나온 뒤 위치
const PULL_Y = 0.18; // phase 2: 살짝 떠오르는 거리
const CENTER_Z = 0.4; // fly 종착점 Z — 책장(z≈0.22) 앞에 위치, 포트폴리오 페이즈에서 0으로 lerp

// ─── 스크롤 진행도 구간 ───────────────────────────────────────
// 0.00 → 0.33  pull   책이 앞으로 뽑혀 나옴
// 0.33 → 0.67  zoom   카메라 PULL_CAM → ZOOM_CAM, 책 소폭 상승
// 0.67 → 0.85  fly    책 슬롯 → 씬 중앙 이동, 스케일 ↑, 책장 페이드
// 0.85 → 1.00  open   책 펼쳐짐
const SP_PULL_END = 0.33;
const SP_ZOOM_END = 0.67;
const SP_FLY_END = 0.85;

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

interface Props {
  chapter: ChapterKey;
  isOpen: boolean;
  scrollTargetRef: { current: number };
}

export default function PortfolioScene({
  chapter,
  isOpen,
  scrollTargetRef,
}: Props) {
  // smoothed scroll (ref이므로 매 프레임 갱신되지만 React 리렌더 없음)
  const scrollCurrent = useRef(0);

  // 구간 전환 시에만 React 상태 변경 → 리렌더 최소화
  const shelfVisRef = useRef(true);
  const extrasVisRef = useRef(false);
  const bookOpenVisRef = useRef(false);
  const [shelfVisible, setShelfVisible] = useState(true);
  const [extrasVisible, setExtrasVisible] = useState(false);
  const [effectiveIsOpen, setEffectiveIsOpen] = useState(false);

  const { camera, size } = useThree();
  const bookGroupRef = useRef<THREE.Group>(null);
  const tempCamTarget = useRef(new THREE.Vector3());
  const bookY = useRef(0);
  const bookZ = useRef(CENTER_Z);

  // 포트폴리오 → fly 역재생 시 위치 점프 스무딩
  const REVERSE_BLEND = 18; // 프레임 수 (~0.3s)
  const wasInPortfolio = useRef(false);
  const reverseSnapY = useRef(0);
  const reverseSnapZ = useRef(CENTER_Z);
  const reverseFrames = useRef(REVERSE_BLEND); // REVERSE_BLEND면 blending 비활성

  useFrame(() => {
    // ── 스크롤 스무딩 ──────────────────────────────────────
    const lerpSpeed =
      0.1 + Math.abs(scrollTargetRef.current - scrollCurrent.current) * 0.3;
    scrollCurrent.current +=
      (scrollTargetRef.current - scrollCurrent.current) * lerpSpeed;
    const sp = scrollCurrent.current;

    // ── 구간 전환 (React 상태는 임계값 통과 시에만 변경) ────
    const newShelf = sp < 0.78; // 책장은 fly 전반부(0.78)에서 언마운트 — 책이 커지기 전에 사라지도록
    const newExtras = sp >= SP_FLY_END;
    const newOpen = sp >= SP_FLY_END; // fly 구간 끝나면 책 오픈 시작

    if (newShelf !== shelfVisRef.current) {
      shelfVisRef.current = newShelf;
      setShelfVisible(newShelf);
    }
    if (newExtras !== extrasVisRef.current) {
      extrasVisRef.current = newExtras;
      setExtrasVisible(newExtras);
    }
    if (newOpen !== bookOpenVisRef.current) {
      bookOpenVisRef.current = newOpen;
      setEffectiveIsOpen(newOpen);
    }

    // ── 책 위치 / 스케일 / 회전 ────────────────────────────
    if (!bookGroupRef.current) return;

    if (sp < SP_PULL_END) {
      // ① pull: 앞으로 뽑힘
      const t = sp / SP_PULL_END;
      const et = easeOut(t);
      bookGroupRef.current.position.set(
        HERO_BASE_X,
        HERO_BASE_Y,
        SHELF_Z + et * (PULL_Z - SHELF_Z)
      );
      bookGroupRef.current.scale.setScalar(SHELF_BOOK_SCALE);
      bookGroupRef.current.rotation.y = SHELF_ROT_Y;
    } else if (sp < SP_ZOOM_END) {
      // ② zoom: 카메라 접근 + 책 소폭 상승
      const t = (sp - SP_PULL_END) / (SP_ZOOM_END - SP_PULL_END);
      const et = easeOut(t);
      bookGroupRef.current.position.set(
        HERO_BASE_X,
        HERO_BASE_Y + et * PULL_Y,
        PULL_Z
      );
      bookGroupRef.current.scale.setScalar(SHELF_BOOK_SCALE);
      bookGroupRef.current.rotation.y = SHELF_ROT_Y;
    } else if (sp < SP_FLY_END) {
      // ③ fly: 슬롯 끝 위치 → 씬 중앙, 스케일·회전 보간
      const t = (sp - SP_ZOOM_END) / (SP_FLY_END - SP_ZOOM_END);
      const et = easeOut(t);
      const fromX = HERO_BASE_X;
      const fromY = HERO_BASE_Y + PULL_Y;
      const fromZ = PULL_Z;

      // 포트폴리오에서 역재생으로 진입했을 때: Y/Z 스냅샷에서 수식으로 부드럽게 보간
      if (wasInPortfolio.current) {
        reverseSnapY.current = bookY.current;
        reverseSnapZ.current = bookZ.current;
        reverseFrames.current = 0;
        wasInPortfolio.current = false;
      }
      const blending = reverseFrames.current < REVERSE_BLEND;
      if (blending) reverseFrames.current++;
      const blend = blending ? reverseFrames.current / REVERSE_BLEND : 1;

      const targetY = fromY * (1 - et);
      const targetZ = fromZ + (CENTER_Z - fromZ) * et;
      bookGroupRef.current.position.set(
        fromX * (1 - et),
        reverseSnapY.current + (targetY - reverseSnapY.current) * blend,
        reverseSnapZ.current + (targetZ - reverseSnapZ.current) * blend
      );
      bookGroupRef.current.scale.setScalar(
        SHELF_BOOK_SCALE + (1 - SHELF_BOOK_SCALE) * et
      );
      bookGroupRef.current.rotation.y = SHELF_ROT_Y * (1 - et);
    } else {
      // ④ portfolio: 일반 카메라 제어 + 책 Y 애니메이션
      wasInPortfolio.current = true;
      bookGroupRef.current.rotation.y = 0;
      bookGroupRef.current.scale.setScalar(1);

      const mobileOffset = Math.max(0, (768 - size.width) / 768) * 9;
      const raw = isOpen ? OPEN_CAM[chapter] : CLOSED_CAM;
      tempCamTarget.current.set(raw.x, raw.y, raw.z + mobileOffset);
      camera.position.lerp(tempCamTarget.current, 0.03);
      camera.lookAt(LOOK_AT);

      const targetY = isOpen ? (size.width < 768 ? -1.5 : -0.4) : 0;
      bookY.current += (targetY - bookY.current) * 0.06;
      bookZ.current += (0 - bookZ.current) * 0.06;
      bookGroupRef.current.position.set(0, bookY.current, bookZ.current);
    }
    // ①②③ 구간의 카메라는 BookshelfIntro.useFrame이 제어
  });

  return (
    <>
      <ambientLight intensity={1.2} />
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
      <directionalLight position={[0, 1, 6]} intensity={0.6} />
      <directionalLight position={[4, 2, 2]} intensity={0.35} color="#fff5e8" />

      {/* 책장 프레임 + 파스텔 책들 (fly 구간 끝나면 언마운트) */}
      {shelfVisible && <BookshelfIntro scrollProgressRef={scrollCurrent} />}

      {/* 바닥 그림자 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.6, 0]}
        receiveShadow
      >
        <planeGeometry args={[30, 30]} />
        <shadowMaterial transparent opacity={0.1} />
      </mesh>

      {/* 포트폴리오 책 — 처음부터 책장 슬롯에 위치하는 단 하나의 오브젝트 */}
      <group ref={bookGroupRef}>
        <BookModel chapter={chapter} isOpen={effectiveIsOpen} />
      </group>

      {extrasVisible && (
        <>
          <FloatingMonitor visible={chapter === "projects" && isOpen} />
          <FloorLamp />
        </>
      )}
    </>
  );
}
