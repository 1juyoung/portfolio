"use client";

import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// ─── 파스텔 팔레트 ────────────────────────────────────────────
const PALETTE = [
  "#f7c5c5",
  "#fcd9a8",
  "#fef0b8",
  "#c8efd8",
  "#c5ddf7",
  "#dfc5f7",
  "#f7c5e8",
  "#d9cbbf",
  "#c0d4e8",
  "#f7d9c5",
  "#c5eef7",
  "#c5d0f7",
  "#e8c5f7",
  "#facbcb",
  "#f7e0c5",
  "#c5efd0",
  "#d8c5f7",
  "#f9d0d0",
  "#c5d8f7",
  "#f7d4c5",
];

// ─── 책장 치수 ───────────────────────────────────────────────
const SHELF_HALF_W = 1.3;
const SHELF_H = 4.2;
const PANEL_T = 0.1;
const SHELF_D = 0.44;

const ROW_BASE = [-2.0, -0.633, 0.734] as const;
const MID_SHELF_Y = [-0.683, 0.684] as const;

// ─── 책 데이터 (hero 슬롯 비워둠 — BookModel이 해당 위치 점유) ──
interface BookDef {
  x: number;
  row: 0 | 1 | 2;
  w: number;
  h: number;
  color: string;
}

const BOOKS: BookDef[] = [
  { row: 0, x: -1.13, w: 0.22, h: 1.02, color: PALETTE[0] },
  { row: 0, x: -0.87, w: 0.24, h: 1.1, color: PALETTE[1] },
  { row: 0, x: -0.59, w: 0.22, h: 0.92, color: PALETTE[2] },
  { row: 0, x: -0.33, w: 0.22, h: 1.06, color: PALETTE[3] },
  { row: 0, x: -0.07, w: 0.22, h: 0.96, color: PALETTE[4] },
  { row: 0, x: 0.19, w: 0.22, h: 1.08, color: PALETTE[5] },
  { row: 0, x: 0.45, w: 0.22, h: 0.94, color: PALETTE[6] },
  { row: 0, x: 0.71, w: 0.24, h: 1.02, color: PALETTE[7] },
  { row: 0, x: 0.97, w: 0.22, h: 0.88, color: PALETTE[8] },
  // row 1 — x=-0.05 슬롯 비워둠 (BookModel이 위치)
  { row: 1, x: -1.13, w: 0.22, h: 1.0, color: PALETTE[9] },
  { row: 1, x: -0.87, w: 0.24, h: 1.08, color: PALETTE[10] },
  { row: 1, x: -0.59, w: 0.22, h: 0.96, color: PALETTE[11] },
  { row: 1, x: -0.33, w: 0.22, h: 1.04, color: PALETTE[12] },
  { row: 1, x: 0.23, w: 0.22, h: 0.92, color: PALETTE[13] },
  { row: 1, x: 0.49, w: 0.22, h: 1.06, color: PALETTE[14] },
  { row: 1, x: 0.75, w: 0.24, h: 0.98, color: PALETTE[15] },
  { row: 1, x: 1.01, w: 0.18, h: 0.88, color: PALETTE[16] },
  { row: 2, x: -1.13, w: 0.22, h: 0.72, color: PALETTE[17] },
  { row: 2, x: -0.87, w: 0.24, h: 0.82, color: PALETTE[18] },
  { row: 2, x: -0.59, w: 0.22, h: 0.74, color: PALETTE[19] },
  { row: 2, x: -0.33, w: 0.24, h: 0.78, color: PALETTE[0] },
  { row: 2, x: -0.05, w: 0.22, h: 0.76, color: PALETTE[1] },
  { row: 2, x: 0.21, w: 0.22, h: 0.80, color: PALETTE[2] },
  { row: 2, x: 0.47, w: 0.24, h: 0.74, color: PALETTE[3] },
  { row: 2, x: 0.75, w: 0.22, h: 0.82, color: PALETTE[4] },
  { row: 2, x: 1.01, w: 0.18, h: 0.72, color: PALETTE[5] },
];

// hero 슬롯 월드 좌표 — PortfolioScene과 공유
export const HERO_BASE_X = -0.05;
export const HERO_BASE_Y = ROW_BASE[1] + 1.0 / 2; // -0.133

// ─── 카메라 키포인트 ─────────────────────────────────────────
const IDLE_CAM = new THREE.Vector3(0, 0.2, 8.5);
const PULL_CAM = new THREE.Vector3(0, 0.5, 6.5);
const ZOOM_CAM = new THREE.Vector3(0, 1.3, 5.0); // OPEN_CAM.about 와 동일
const LOOK_VEC = new THREE.Vector3(0, 0, 0);

// ─── 스크롤 구간 (PortfolioScene 과 일치) ──────────────────
const SP_PULL_END = 0.33;
const SP_ZOOM_END = 0.67;

// ─── 반짝임 ──────────────────────────────────────────────────
const SPARKLE_POS: [number, number, number][] = [
  [0.28, 0.44, 0.22],
  [-0.3, 0.38, 0.22],
  [0.22, -0.08, 0.22],
  [-0.24, -0.06, 0.22],
  [0.04, 0.6, 0.22],
  [-0.06, 0.22, 0.28],
];

function Sparkles({ visible }: { visible: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const phase = t.current * 2.6 + i * 1.05;
      const pulse = 0.5 + 0.5 * Math.sin(phase);
      const sc = visible ? (0.25 + 0.35 * pulse) * 0.06 : 0;
      mesh.scale.setScalar(Math.max(0, sc));
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.opacity = visible ? 0.45 + 0.55 * pulse : 0;
    });
  });

  return (
    <group ref={groupRef} position={[HERO_BASE_X, HERO_BASE_Y, 0]}>
      {SPARKLE_POS.map(([dx, dy, dz], i) => (
        <mesh key={i} position={[dx, dy, dz]}>
          <octahedronGeometry args={[1]} />
          <meshStandardMaterial
            color="#fde68a"
            emissive="#fde68a"
            emissiveIntensity={2}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── 책장 프레임 ─────────────────────────────────────────────
function ShelfFrame() {
  const wood = "#9b7a50";
  const dark = "#6b4d2c";
  const mid = "#b08a62";
  const W = SHELF_HALF_W;
  return (
    <group>
      <mesh position={[0, 0, -SHELF_D / 2 + 0.02]}>
        <boxGeometry args={[W * 2 + PANEL_T * 2, SHELF_H, 0.05]} />
        <meshStandardMaterial color={dark} roughness={0.92} />
      </mesh>
      {/* isSidePanel: 투명 패스에서 depth sort 충돌 방지 — sp=0.75까지 opaque로 유지 */}
      <mesh userData={{ isSidePanel: true }} position={[-(W + PANEL_T / 2), 0, 0]}>
        <boxGeometry args={[PANEL_T, SHELF_H, SHELF_D]} />
        <meshStandardMaterial color={wood} roughness={0.8} />
      </mesh>
      <mesh userData={{ isSidePanel: true }} position={[W + PANEL_T / 2, 0, 0]}>
        <boxGeometry args={[PANEL_T, SHELF_H, SHELF_D]} />
        <meshStandardMaterial color={wood} roughness={0.8} />
      </mesh>
      <mesh position={[0, SHELF_H / 2 - PANEL_T / 2, 0]}>
        <boxGeometry args={[W * 2 + PANEL_T * 2, PANEL_T, SHELF_D]} />
        <meshStandardMaterial color={wood} roughness={0.78} />
      </mesh>
      <mesh position={[0, -SHELF_H / 2 + PANEL_T / 2, 0]}>
        <boxGeometry args={[W * 2 + PANEL_T * 2, PANEL_T, SHELF_D]} />
        <meshStandardMaterial color={wood} roughness={0.78} />
      </mesh>
      {MID_SHELF_Y.map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <boxGeometry args={[W * 2, PANEL_T, SHELF_D]} />
          <meshStandardMaterial color={mid} roughness={0.82} />
        </mesh>
      ))}
    </group>
  );
}

// ─── 메인 ────────────────────────────────────────────────────
export default function BookshelfIntro({
  scrollProgressRef,
}: {
  scrollProgressRef: { current: number };
}) {
  const rootRef = useRef<THREE.Group>(null);
  const prevOpacity = useRef(1);
  const tempCam = useRef(new THREE.Vector3());
  // 역재생 마운트 시: sp가 높은 상태에서 시작하면 opacity≈0 → 칸막이 사라짐 현상 방지
  const mountRef = useRef(true);
  const { camera } = useThree();

  const sparkVisRef = useRef(true);
  const [sparkVisible, setSparkVisible] = useState(true);

  useFrame(() => {
    const sp = scrollProgressRef.current;

    // ── 카메라: 스크롤에 비례해 IDLE→PULL→ZOOM ──────────────
    if (sp < SP_PULL_END) {
      tempCam.current.lerpVectors(IDLE_CAM, PULL_CAM, sp / SP_PULL_END);
    } else if (sp < SP_ZOOM_END) {
      tempCam.current.lerpVectors(
        PULL_CAM,
        ZOOM_CAM,
        (sp - SP_PULL_END) / (SP_ZOOM_END - SP_PULL_END)
      );
    } else {
      tempCam.current.copy(ZOOM_CAM);
    }
    camera.position.lerp(tempCam.current, 0.08);
    camera.lookAt(LOOK_VEC);

    // ── 반짝임: 아직 pull 이전에만 표시 ─────────────────────
    const newSpark = sp < 0.12;
    if (newSpark !== sparkVisRef.current) {
      sparkVisRef.current = newSpark;
      setSparkVisible(newSpark);
    }

    // ── 책장 페이드아웃: fly 구간에서 사라짐 ─────────────────
    if (rootRef.current) {
      // 책장 페이드: sp 0.67→0.78 (fly 전반부에서 완료) — 책이 커지기 전에 사라지도록
      const SP_SHELF_END = 0.78;
      const rawOpacity =
        sp < SP_ZOOM_END
          ? 1
          : Math.max(0, 1 - (sp - SP_ZOOM_END) / (SP_SHELF_END - SP_ZOOM_END));
      // sp가 zoom 구간 아래로 내려오면 mount 플래그 해제
      if (mountRef.current && sp <= SP_ZOOM_END) mountRef.current = false;
      // 역재생 마운트 직후에는 최소 0.5 보장 (sp 높은 상태에서 거의 투명하게 나타나는 것 방지)
      const opacity = mountRef.current ? Math.max(rawOpacity, 0.5) : rawOpacity;

      if (Math.abs(opacity - prevOpacity.current) > 0.001) {
        prevOpacity.current = opacity;
        rootRef.current.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          const mats = Array.isArray(child.material)
            ? child.material
            : [child.material];
          for (const mat of mats) {
            if (mat instanceof THREE.MeshStandardMaterial) {
              let o = opacity;
              if (child.userData.isSidePanel) {
                // 사이드 패널은 sp=0.75까지 opaque 유지: opaque 패스에서 depth 선점 →
                // 투명 정렬 충돌 없이 아래 칸까지 항상 표시됨
                const SP_SIDE_FADE = 0.75;
                const rawSide =
                  sp < SP_SIDE_FADE
                    ? 1
                    : Math.max(0, 1 - (sp - SP_SIDE_FADE) / (SP_SHELF_END - SP_SIDE_FADE));
                o = mountRef.current ? Math.max(rawSide, 0.5) : rawSide;
              }
              mat.transparent = o < 0.999;
              mat.depthWrite = true;
              mat.opacity = o;
            }
          }
        });
      }
    }
  });

  return (
    <group ref={rootRef}>
      <ShelfFrame />
      {BOOKS.map((b, i) => (
        <mesh key={i} position={[b.x, ROW_BASE[b.row] + b.h / 2, 0]}>
          <boxGeometry args={[b.w, b.h, 0.36]} />
          <meshStandardMaterial
            color={b.color}
            roughness={0.72}
            metalness={0.02}
          />
        </mesh>
      ))}
      <Sparkles visible={sparkVisible} />
    </group>
  );
}
