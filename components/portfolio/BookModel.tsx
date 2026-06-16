"use client";

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { ChapterKey, CHAPTERS } from "@/data/portfolioData";
import { PageContent } from "./PageContent";

const CB_W = 1.5;
const CB_H = 2.1;
const CB_D = 0.42;
const CB_CT = 0.055;
const CB_SW = 0.08;

const HALF_W = 2;
const HALF_H = 1;
const PAGE_D = 2.52;
const SPINE_W = 0.13;
const PG_W = HALF_W - 0.12;
const PG_D = PAGE_D + 0.06;

const COVER_COLOR = "#059669";
const PAGES_COLOR = "#ffffff";
const INNER_COLOR = "#ffffff";
const SPINE_COLOR = "#047857";

interface Props {
  chapter: ChapterKey;
  isOpen: boolean;
}

// ── 셰이더 워밍업: 씬 초기화 시 OpenBook 재질 셰이더를 미리 컴파일, 5프레임 후 자동 소멸
function ShaderWarmup() {
  const aliveRef = useRef(true);
  const groupRef = useRef<THREE.Group>(null);
  const frames = useRef(0);

  useFrame(() => {
    if (!aliveRef.current) return;
    if (++frames.current >= 5) {
      aliveRef.current = false;
      if (groupRef.current) groupRef.current.visible = false;
    }
  });

  return (
    <group ref={groupRef} position={[0, -10000, 0]}>
      <mesh frustumCulled={false}>
        <boxGeometry args={[0.01, 0.01, 0.01]} />
        <meshStandardMaterial color={COVER_COLOR} roughness={0.38} metalness={0.12} />
      </mesh>
      <mesh frustumCulled={false}>
        <boxGeometry args={[0.01, 0.01, 0.01]} />
        <meshStandardMaterial color={SPINE_COLOR} roughness={0.4} metalness={0.15} />
      </mesh>
      <mesh frustumCulled={false}>
        <boxGeometry args={[0.01, 0.01, 0.01]} />
        <meshStandardMaterial color={PAGES_COLOR} roughness={0.92} />
      </mesh>
      <mesh frustumCulled={false}>
        <planeGeometry args={[0.01, 0.01]} />
        <meshStandardMaterial color={INNER_COLOR} roughness={0.1} emissive="#ffffff" emissiveIntensity={0.45} />
      </mesh>
      <mesh frustumCulled={false}>
        <boxGeometry args={[0.01, 0.01, 0.01]} />
        <meshStandardMaterial color="#ffffff" roughness={0.72} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ── 닫힌 책
function ClosedBook() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    groupRef.current.position.y = Math.sin(t * 0.6) * 0.05;
    groupRef.current.rotation.y = 0.26 + Math.sin(t * 0.35) * 0.022;
  });

  const pagesD = CB_D - CB_CT * 2;

  return (
    <group ref={groupRef} rotation={[0.04, 0.26, 0]}>
      <mesh position={[0, 0, CB_D / 2 - CB_CT / 2]} castShadow receiveShadow>
        <boxGeometry args={[CB_W, CB_H, CB_CT]} />
        <meshStandardMaterial color={COVER_COLOR} roughness={0.38} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0, -(CB_D / 2 - CB_CT / 2)]}>
        <boxGeometry args={[CB_W, CB_H, CB_CT]} />
        <meshStandardMaterial color={COVER_COLOR} roughness={0.38} metalness={0.12} />
      </mesh>
      <mesh castShadow>
        <boxGeometry args={[CB_W - 0.04, CB_H - 0.04, pagesD]} />
        <meshStandardMaterial color={PAGES_COLOR} roughness={0.95} />
      </mesh>
      <mesh position={[-CB_W / 2, 0, 0]} castShadow>
        <boxGeometry args={[CB_SW, CB_H + 0.01, CB_D + 0.01]} />
        <meshStandardMaterial color={SPINE_COLOR} roughness={0.35} metalness={0.15} />
      </mesh>
      <mesh position={[0, CB_H / 2 - 0.18, CB_D / 2 - CB_CT / 2 + 0.001]}>
        <planeGeometry args={[CB_W * 0.7, 0.025]} />
        <meshStandardMaterial color="#34d399" roughness={0.3} />
      </mesh>
    </group>
  );
}

// ── 열린 책
// allowOpenRef: true가 될 때까지 rightZ=PI 고정 (visible 전환 전에 애니메이션 시작 방지)
function OpenBook({
  chapter,
  isOpen,
  allowOpenRef,
}: {
  chapter: ChapterKey;
  isOpen: boolean;
  allowOpenRef: React.MutableRefObject<boolean>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const rightHalfRef = useRef<THREE.Group>(null);
  const turningRef = useRef<THREE.Group>(null);

  const rightZ = useRef(Math.PI);
  const groupPosX = useRef(HALF_W / 2);
  const pageAngle = useRef(0);
  const pageTarget = useRef(0);
  const isFlipping = useRef(false);

  const prevChapter = useRef<ChapterKey>(chapter);
  useEffect(() => {
    if (prevChapter.current === chapter) return;
    const pi = CHAPTERS.findIndex((c) => c.key === prevChapter.current);
    const ci = CHAPTERS.findIndex((c) => c.key === chapter);
    pageAngle.current = ci > pi ? 0 : Math.PI;
    pageTarget.current = ci > pi ? Math.PI : 0;
    isFlipping.current = true;
    prevChapter.current = chapter;
  }, [chapter]);

  useFrame(({ clock }) => {
    if (!groupRef.current || !rightHalfRef.current) return;

    groupRef.current.position.y = Math.sin(clock.elapsedTime * 0.65) * 0.05;

    const allowed = allowOpenRef.current;
    const targetX = isOpen && allowed ? 0 : HALF_W / 2;
    groupPosX.current += (targetX - groupPosX.current) * 0.06;
    groupRef.current.position.x = groupPosX.current;

    const targetRZ = isOpen && allowed ? 0 : Math.PI;
    rightZ.current += (targetRZ - rightZ.current) * 0.055;
    rightHalfRef.current.rotation.z = rightZ.current;

    const openRatio = 1 - rightZ.current / Math.PI;

    // 페이지 넘김 메시는 60% 이상 열렸을 때만 표시
    if (turningRef.current) turningRef.current.visible = openRatio > 0.6;

    if (isFlipping.current && isOpen && turningRef.current) {
      pageAngle.current += (pageTarget.current - pageAngle.current) * 0.1;
      turningRef.current.rotation.z = pageAngle.current;
      if (Math.abs(pageTarget.current - pageAngle.current) < 0.01) {
        isFlipping.current = false;
      }
    }
  });

  return (
    <group ref={groupRef} rotation={[+0.9, 0, 0]} position={[HALF_W / 2, 0, 0]}>
      {/* 척추 */}
      <mesh castShadow>
        <boxGeometry args={[SPINE_W, HALF_H + 0.06, PAGE_D + 0.14]} />
        <meshStandardMaterial color={SPINE_COLOR} roughness={0.4} metalness={0.15} />
      </mesh>

      {/* 왼쪽 반쪽 */}
      <group>
        <mesh position={[-HALF_W / 2, -(HALF_H / 2) - 0.01, 0]} castShadow receiveShadow>
          <boxGeometry args={[HALF_W + 0.06, 0.065, PAGE_D + 0.12]} />
          <meshStandardMaterial color={COVER_COLOR} roughness={0.38} metalness={0.12} />
        </mesh>
        {/* 내지 — 표지와 함께 표시 */}
        <mesh position={[-HALF_W / 2, 0, 0]} castShadow>
          <boxGeometry args={[HALF_W - 0.07, HALF_H, PG_D]} />
          <meshStandardMaterial color={PAGES_COLOR} roughness={0.92} />
        </mesh>
        <mesh position={[-HALF_W / 2, HALF_H / 2 + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[PG_W, PG_D]} />
          <meshStandardMaterial color={INNER_COLOR} roughness={0.1} emissive="#ffffff" emissiveIntensity={0.45} />
        </mesh>
      </group>

      {/* 오른쪽 반쪽 */}
      <group ref={rightHalfRef} rotation={[0, 0, Math.PI]}>
        <mesh position={[HALF_W / 2, -(HALF_H / 2) - 0.01, 0]} castShadow receiveShadow>
          <boxGeometry args={[HALF_W + 0.06, 0.065, PAGE_D + 0.12]} />
          <meshStandardMaterial color={COVER_COLOR} roughness={0.38} metalness={0.12} />
        </mesh>
        {/* 내지 — 표지와 함께 표시 */}
        <mesh position={[HALF_W / 2, 0, 0]} castShadow>
          <boxGeometry args={[HALF_W - 0.07, HALF_H, PG_D]} />
          <meshStandardMaterial color={PAGES_COLOR} roughness={0.92} />
        </mesh>
        <mesh position={[HALF_W / 2, HALF_H / 2 + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[PG_W, PG_D]} />
          <meshStandardMaterial color={INNER_COLOR} roughness={0.1} emissive="#ffffff" emissiveIntensity={0.45} />
        </mesh>
      </group>

      {/* 페이지 넘기기 — 처음부터 마운트 */}
      <group ref={turningRef} position={[0, HALF_H / 2 + 0.007, 0]} visible={false}>
        <mesh position={[HALF_W / 2, 0, 0]}>
          <boxGeometry args={[PG_W, 0.013, PG_D]} />
          <meshStandardMaterial color="#ffffff" roughness={0.72} side={THREE.DoubleSide} />
        </mesh>
      </group>

      <AnimatedPageCard key={chapter} chapter={chapter} rightZRef={rightZ} />
    </group>
  );
}

// ── BookModel: 두 책 모두 처음부터 마운트, ref visibility로 전환 (setState 없음)
export default function BookModel({ chapter, isOpen }: Props) {
  const openProgress = useRef(0);
  const closedRef = useRef<THREE.Group>(null);
  const openWrapRef = useRef<THREE.Group>(null);
  const allowOpenRef = useRef(false);

  useFrame(() => {
    openProgress.current += ((isOpen ? 1 : 0) - openProgress.current) * 0.07;
    const showOpen = openProgress.current > 0.45;
    allowOpenRef.current = showOpen;
    // Three.js visible 직접 토글 → React re-render 없음
    if (closedRef.current) closedRef.current.visible = !showOpen;
    if (openWrapRef.current) openWrapRef.current.visible = showOpen;
  });

  return (
    <>
      <ShaderWarmup />
      <group ref={closedRef}>
        <ClosedBook />
      </group>
      <group ref={openWrapRef} visible={false}>
        <OpenBook chapter={chapter} isOpen={isOpen} allowOpenRef={allowOpenRef} />
      </group>
    </>
  );
}

function AnimatedPageCard({
  chapter,
  rightZRef,
}: {
  chapter: ChapterKey;
  rightZRef: { current: number };
}) {
  const { size } = useThree();
  const isMobile = size.width < 768;
  const isSpread = chapter !== "about";

  const leftGroupRef = useRef<THREE.Group>(null);
  const rightWrapRef = useRef<THREE.Group>(null);
  const leftDivRef = useRef<HTMLDivElement>(null);
  const rightDivRef = useRef<HTMLDivElement>(null);
  const mountFrames = useRef(0);

  const Y = HALF_H / 2 + 0.02;

  useFrame(() => {
    mountFrames.current = Math.min(mountFrames.current + 1, 20);
    const mountFade = mountFrames.current / 20;

    if (isMobile) {
      if (leftGroupRef.current) leftGroupRef.current.visible = false;
      if (rightWrapRef.current) rightWrapRef.current.visible = false;
      return;
    }

    const rz = rightZRef.current;
    const openRatio = 1 - rz / Math.PI;

    if (leftGroupRef.current) leftGroupRef.current.visible = true;
    if (leftDivRef.current) {
      const o = Math.min(1, Math.max(0, (openRatio - 0.55) / 0.25)) * mountFade;
      leftDivRef.current.style.opacity = String(o);
    }

    if (isSpread && rightWrapRef.current) {
      rightWrapRef.current.rotation.z = rz;
      const faceUp = rz < Math.PI * 0.45;
      rightWrapRef.current.visible = faceUp;
      if (rightDivRef.current) {
        const o = faceUp
          ? Math.min(1, (Math.PI * 0.45 - rz) / (Math.PI * 0.15)) * mountFade
          : 0;
        rightDivRef.current.style.opacity = String(o);
      }
    }
  });

  return (
    <>
      <group
        ref={leftGroupRef}
        position={[-HALF_W / 2, Y, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
      >
        <Html transform center scale={0.3} occlude={false} zIndexRange={[100, 0]}>
          <div ref={leftDivRef} style={{ opacity: 0 }}>
            <PageContent chapter={chapter} bare pageHalf="left" />
          </div>
        </Html>
      </group>

      {isSpread && (
        <group ref={rightWrapRef} rotation={[0, 0, Math.PI]} visible={false}>
          <group position={[HALF_W / 2, Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <Html transform center scale={0.3} occlude={false} zIndexRange={[100, 0]}>
              <div ref={rightDivRef} style={{ opacity: 0 }}>
                <PageContent chapter={chapter} bare pageHalf="right" />
              </div>
            </Html>
          </group>
        </group>
      )}
    </>
  );
}
