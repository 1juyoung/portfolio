"use client";

import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import {
  ChapterKey,
  CHAPTERS,
  aboutData,
  careerData,
  projectsData,
  CareerType,
  ProjectItem,
} from "@/data/portfolioData";
import ProjectDetailOverlay from "./ProjectDetailOverlay";

// ─────────────────────────────────────────────────────────────
// 닫힌 책 치수  (세워진 하드커버 책 외관)
// ─────────────────────────────────────────────────────────────
const CB_W = 1.5; // 표지 너비
const CB_H = 2.1; // 표지 높이
const CB_D = 0.42; // 책 두께 (앞표지~뒷표지)
const CB_CT = 0.055; // 표지 두께
const CB_SW = 0.08; // 척추 너비

// ─────────────────────────────────────────────────────────────
// 열린 책 치수  (나비형 플랫 오픈 북)
// ─────────────────────────────────────────────────────────────
const HALF_W = 1.5;
const HALF_H = 0.28;
const PAGE_D = 2.52;
const SPINE_W = 0.13;
const PG_W = HALF_W - 0.12; // 내지 너비 ≈ 1.60
const PG_D = PAGE_D - 0.12; // 내지 깊이 ≈ 2.40

const CARD_PX = 260;

// 색상
const COVER_COLOR = "#2d5be3";
const PAGES_COLOR = "#f9f7f1";
const INNER_COLOR = "#eef2ff";
const SPINE_COLOR = "#1a3db5";

interface Props {
  chapter: ChapterKey;
  isOpen: boolean;
}

// ─────────────────────────────────────────────────────────────
// 1. 닫힌 책 (세워진 외관 전용 메시)
//    - 앞표지 + 뒷표지 + 페이지 블록 + 척추
//    - 내지가 밖으로 보이지 않음
//    - 약간의 Y회전으로 척추와 두께감이 보이는 3/4 뷰
// ─────────────────────────────────────────────────────────────
function ClosedBook() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.elapsedTime;
    // 부유 + 미세한 Y 회전 (살아있는 느낌)
    groupRef.current.position.y = Math.sin(t * 0.6) * 0.05;
    groupRef.current.rotation.y = 0.26 + Math.sin(t * 0.35) * 0.022;
  });

  const pagesD = CB_D - CB_CT * 2;

  return (
    // 초기 rotation.y: 척추(왼쪽)가 살짝 보이도록 오른쪽으로 비틂
    // rotation.x: 위에서 약간 내려보이도록
    <group ref={groupRef} rotation={[0.04, 0.26, 0]}>
      {/* 앞 표지 (카메라 방향) */}
      <mesh position={[0, 0, CB_D / 2 - CB_CT / 2]} castShadow receiveShadow>
        <boxGeometry args={[CB_W, CB_H, CB_CT]} />
        <meshStandardMaterial
          color={COVER_COLOR}
          roughness={0.38}
          metalness={0.12}
        />
      </mesh>

      {/* 뒷 표지 */}
      <mesh position={[0, 0, -(CB_D / 2 - CB_CT / 2)]}>
        <boxGeometry args={[CB_W, CB_H, CB_CT]} />
        <meshStandardMaterial
          color={COVER_COLOR}
          roughness={0.38}
          metalness={0.12}
        />
      </mesh>

      {/*
        페이지 블록 — 두 표지 사이의 흰 종이 덩어리
        측면(오른쪽)과 윗면에서 종이 두께감이 보임
      */}
      <mesh castShadow>
        <boxGeometry args={[CB_W - 0.04, CB_H - 0.04, pagesD]} />
        <meshStandardMaterial color={PAGES_COLOR} roughness={0.95} />
      </mesh>

      {/* 척추 (왼쪽 측면) */}
      <mesh position={[-CB_W / 2, 0, 0]} castShadow>
        <boxGeometry args={[CB_SW, CB_H + 0.01, CB_D + 0.01]} />
        <meshStandardMaterial
          color={SPINE_COLOR}
          roughness={0.35}
          metalness={0.15}
        />
      </mesh>

      {/* 앞표지 상단 장식 줄 */}
      <mesh position={[0, CB_H / 2 - 0.18, CB_D / 2 - CB_CT / 2 + 0.001]}>
        <planeGeometry args={[CB_W * 0.7, 0.025]} />
        <meshStandardMaterial color="#6b8cff" roughness={0.3} />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. 열린 책 (나비형 플랫 오픈 북)
//    - 마운트될 때 rightZ = PI (닫힌 상태) → 0 (열린 상태) 로 자동 애니메이션
//    - 내지/카드는 60% 이상 열렸을 때만 표시 (내부가 보이지 않는 상태 보호)
// ─────────────────────────────────────────────────────────────
function OpenBook({
  chapter,
  isOpen,
}: {
  chapter: ChapterKey;
  isOpen: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const rightHalfRef = useRef<THREE.Group>(null);
  const turningRef = useRef<THREE.Group | null>(null);

  // 마운트 시 닫힌 상태(PI)에서 시작해 자동 오픈
  const rightZ = useRef(Math.PI);
  const groupPosX = useRef(HALF_W / 2); // 닫혔을 때 중앙 보정

  const pageAngle = useRef(0);
  const pageTarget = useRef(0);
  const isFlipping = useRef(false);

  const [showContent, setShowContent] = useState(false);
  const showPrev = useRef(false);

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

    const targetX = isOpen ? 0 : HALF_W / 2;
    groupPosX.current += (targetX - groupPosX.current) * 0.06;
    groupRef.current.position.x = groupPosX.current;

    const targetRZ = isOpen ? 0 : Math.PI;
    rightZ.current += (targetRZ - rightZ.current) * 0.055;
    rightHalfRef.current.rotation.z = rightZ.current;

    const openRatio = 1 - rightZ.current / Math.PI;
    const nextShow = openRatio > 0.6;
    if (nextShow !== showPrev.current) {
      showPrev.current = nextShow;
      setShowContent(nextShow);
    }

    if (isFlipping.current && isOpen && turningRef.current) {
      pageAngle.current += (pageTarget.current - pageAngle.current) * 0.1;
      turningRef.current.rotation.z = pageAngle.current;
      if (Math.abs(pageTarget.current - pageAngle.current) < 0.01) {
        pageAngle.current = pageTarget.current;
        isFlipping.current = false;
      }
    }
  });

  return (
    /*
      rotation.x = +0.75 → 책을 앞으로 기울여 페이지 면이 카메라를 향하게 함
      (완전 눕힘 0 → 완전 세움 PI/2 사이, 약 43도 기울음)
    */
    <group ref={groupRef} rotation={[+0.6, 0, 0]} position={[HALF_W / 2, 0, 0]}>
      {/* 척추 */}
      <mesh castShadow>
        <boxGeometry args={[SPINE_W, HALF_H + 0.06, PAGE_D + 0.14]} />
        <meshStandardMaterial
          color={SPINE_COLOR}
          roughness={0.4}
          metalness={0.15}
        />
      </mesh>

      {/* 왼쪽 반쪽 */}
      <group>
        <mesh
          position={[-HALF_W / 2, -(HALF_H / 2) - 0.01, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[HALF_W + 0.06, 0.065, PAGE_D + 0.12]} />
          <meshStandardMaterial
            color={COVER_COLOR}
            roughness={0.38}
            metalness={0.12}
          />
        </mesh>
        {showContent && (
          <>
            <mesh position={[-HALF_W / 2, 0, 0]} castShadow>
              <boxGeometry args={[HALF_W - 0.07, HALF_H, PAGE_D - 0.06]} />
              <meshStandardMaterial color={PAGES_COLOR} roughness={0.92} />
            </mesh>
            <mesh
              position={[-HALF_W / 2, HALF_H / 2 + 0.002, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[PG_W, PG_D]} />
              <meshStandardMaterial color={INNER_COLOR} roughness={0.8} />
            </mesh>
          </>
        )}
      </group>

      {/* 오른쪽 반쪽 (Math.PI → 0 열림 애니메이션) */}
      <group ref={rightHalfRef} rotation={[0, 0, Math.PI]}>
        <mesh
          position={[HALF_W / 2, -(HALF_H / 2) - 0.01, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[HALF_W + 0.06, 0.065, PAGE_D + 0.12]} />
          <meshStandardMaterial
            color={COVER_COLOR}
            roughness={0.38}
            metalness={0.12}
          />
        </mesh>
        {showContent && (
          <>
            <mesh position={[HALF_W / 2, 0, 0]} castShadow>
              <boxGeometry args={[HALF_W - 0.07, HALF_H, PAGE_D - 0.06]} />
              <meshStandardMaterial color={PAGES_COLOR} roughness={0.92} />
            </mesh>
            <mesh
              position={[HALF_W / 2, HALF_H / 2 + 0.002, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[PG_W, PG_D]} />
              <meshStandardMaterial color={INNER_COLOR} roughness={0.8} />
            </mesh>
          </>
        )}
      </group>

      {/* 페이지 넘기기 메시 */}
      {showContent && (
        <group ref={turningRef} position={[0, HALF_H / 2 + 0.007, 0]}>
          <mesh position={[HALF_W / 2 + SPINE_W / 2, 0, 0]}>
            <boxGeometry args={[HALF_W - 0.04, 0.013, PAGE_D - 0.12]} />
            <meshStandardMaterial
              color="#ffffff"
              roughness={0.72}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}

      {/*
        ── Html 내용 카드 (페이지 표면에 직접 배치) ────────────
        rotation: [-PI/2, 0, 0] → 페이지(XZ 면)에 눕힘, normal이 +Y(위)를 향함
        Projects → 왼쪽 페이지 / 나머지 → 오른쪽 페이지
      */}
      {/*
        Html 카드 — 책 페이지 위에 배치
        rotation.x = -0.95: 책(+0.75) + 카드(-0.95) = 합산 -0.20 → 카드 정면이 카메라를 향함
          계산: Html normal [0,0,1] → book-local [0, sin(0.95), cos(0.95)]
                → world [0, ~0.20, ~0.98] ≈ 카메라 방향 ✓
        텍스트 방향: Html up(+Y) → world [0, ~0.98, -0.20] ≈ 거의 +Y(위) ✓ (가독성 확보)
      */}
      <AnimatedPageCard key={chapter} chapter={chapter} visible={showContent} />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────
// BookModel: 닫힌 책 ↔ 열린 책 전환
//    openProgress 0→1 에서 0.35 를 넘는 순간 OpenBook 으로 교체
//    교체 직전에는 닫힌 외관만 보이므로 "열리는 순간"이 깔끔함
// ─────────────────────────────────────────────────────────────
export default function BookModel({ chapter, isOpen }: Props) {
  const openProgress = useRef(0);
  const [showOpenBook, setShowOpenBook] = useState(false);
  const showOpenPrev = useRef(false);

  useFrame(() => {
    openProgress.current += ((isOpen ? 1 : 0) - openProgress.current) * 0.038;

    const nextShow = openProgress.current > 0.35;
    if (nextShow !== showOpenPrev.current) {
      showOpenPrev.current = nextShow;
      setShowOpenBook(nextShow);
    }
  });

  return (
    <>
      {/* 닫힌 상태: 세워진 책 외관 */}
      {!showOpenBook && <ClosedBook />}

      {/*
        열린 상태: 나비형 플랫 오픈 북
        마운트 직후 rightZ = PI (닫힌 플랫) → 0 으로 자연스럽게 펼쳐짐
      */}
      {showOpenBook && <OpenBook chapter={chapter} isOpen={isOpen} />}
    </>
  );
}
function AnimatedPageCard({
  chapter,
  visible,
}: {
  chapter: ChapterKey;
  visible: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const currentY = useRef(HALF_H / 2 - 0.22);
  const currentZ = useRef(-0.95);
  const currentScale = useRef(0);
  const currentRotX = useRef(-1.05);

  // 카드 위치
  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const bob = Math.sin(clock.elapsedTime * 0.9) * 0.012;

    // 기존 네 카드 위치 유지: projects는 왼쪽, 나머지는 오른쪽
    const targetX = chapter === "projects" ? -HALF_W / 2 : HALF_W / 8;

    // 책 안쪽 아래에서 시작해서 위로 튀어나오는 느낌
    const targetY = visible ? HALF_H / 2 + 0.07 + bob : HALF_H / 2 - 0.22;

    // z도 안쪽에서 앞으로 살짝 나오는 느낌
    // 책에서의 카드 위치
    const targetZ = visible ? -1 : -0.95;

    const targetScale = visible ? 1.1 : 0;

    // 처음엔 더 접혀 있다가 보이면서 정면을 향함
    // 카드 기울어진 정도
    const targetRotX = visible ? -0.7 : -1.05;

    groupRef.current.position.x +=
      (targetX - groupRef.current.position.x) * 0.08;
    currentY.current += (targetY - currentY.current) * 0.08;
    currentZ.current += (targetZ - currentZ.current) * 0.08;
    currentScale.current += (targetScale - currentScale.current) * 0.08;
    currentRotX.current += (targetRotX - currentRotX.current) * 0.08;

    groupRef.current.position.y = currentY.current;
    groupRef.current.position.z = currentZ.current;
    groupRef.current.rotation.x = currentRotX.current;
    groupRef.current.scale.setScalar(currentScale.current);
  });

  return (
    <group
      ref={groupRef}
      position={[
        chapter === "projects" ? -HALF_W / 8 : HALF_W / 8,
        HALF_H / 2 - 0.2,
        -0.95,
      ]}
      rotation={[0, 0, 0]}
      scale={0}
    >
      <Html transform center scale={0.3} occlude={false} zIndexRange={[100, 0]}>
        <PageContent chapter={chapter} />
      </Html>
    </group>
  );
}
// ─────────────────────────────────────────────────────────────
// 페이지 내용 (Html transform 으로 페이지 위에 배치)
// ─────────────────────────────────────────────────────────────
function PageContent({ chapter }: { chapter: ChapterKey }) {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(
    null
  );

  return (
    <>
      <div
        style={{
          width: CARD_PX,
          minHeight: 390,
          padding: "16px 18px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          boxSizing: "border-box" as const,
          background: "rgba(255,255,255,0.97)",
          borderRadius: "14px",
          boxShadow: "0 6px 28px rgba(0,0,0,0.14)",
          border: "1px solid rgba(226,232,240,0.8)",
        }}
      >
        {chapter === "about" && <AboutPage />}
        {chapter === "career" && <CareerPage />}
        {chapter === "projects" && (
          <ProjectsPage onProjectClick={setSelectedProject} />
        )}
      </div>
      {selectedProject &&
        createPortal(
          <ProjectDetailOverlay
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />,
          document.body
        )}
    </>
  );
}

const S = {
  label: {
    fontSize: 9,
    letterSpacing: "3px",
    color: "#94a3b8",
    textTransform: "uppercase" as const,
    margin: "0 0 6px",
  },
  h2: { fontSize: 18, fontWeight: 800, color: "#1e293b", margin: "0 0 2px" },
  sub: { fontSize: 11, color: "#64748b", margin: "0 0 10px" },
  p: { fontSize: 11, color: "#475569", lineHeight: 1.75, margin: "0 0 10px" },
  hr: { border: "none", borderTop: "1px solid #f1f5f9", margin: "10px 0" },
  chip: {
    display: "inline-block",
    padding: "2px 9px",
    borderRadius: 999,
    background: "#f1f5f9",
    color: "#475569",
    fontSize: 10,
    fontWeight: 500,
    margin: "2px 3px 2px 0",
  },
};

const BADGE: Record<CareerType, { dot: string; label: string }> = {
  education: { dot: "#10b981", label: "EDU" },
  internship: { dot: "#f59e0b", label: "WORK" },
  study: { dot: "#60a5fa", label: "DEV" },
};

function AboutPage() {
  return (
    <>
      <p style={S.label}>About Me</p>
      <p style={S.h2}>{aboutData.name}</p>
      <p style={S.sub}>{aboutData.role}</p>
      <hr style={S.hr} />
      <p style={S.p} className="whitespace-pre-line">
        {aboutData.intro}
      </p>
      <p style={{ ...S.label, marginTop: 4 }}>Skills</p>
      <div style={{ marginBottom: 10 }}>
        {aboutData.skills.map((s) => (
          <span key={s} style={S.chip}>
            {s}
          </span>
        ))}
      </div>
      {aboutData.github && (
        <a
          href={aboutData.github}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 12px",
            borderRadius: 999,
            background: "#0f172a",
            color: "#fff",
            fontSize: 10,
            fontWeight: 600,
            textDecoration: "none",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          GitHub
        </a>
      )}
    </>
  );
}

function CareerPage() {
  return (
    <>
      <p style={S.label}>Career</p>
      <hr style={S.hr} />
      {careerData.map((item, i) => {
        const b = BADGE[item.type];
        const isLast = i === careerData.length - 1;
        return (
          <div
            key={i}
            className="whitespace-pre-line"
            style={{ display: "flex", gap: 10, marginBottom: isLast ? 0 : 13 }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flexShrink: 0,
                width: 12,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: b.dot,
                  marginTop: 3,
                  flexShrink: 0,
                }}
              />
              {!isLast && (
                <div
                  style={{
                    width: 1,
                    flex: 1,
                    background: "#e2e8f0",
                    marginTop: 3,
                  }}
                />
              )}
            </div>
            <div style={{ flex: 1, paddingBottom: isLast ? 0 : 4 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  marginBottom: 2,
                }}
              >
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 700,
                    color: b.dot,
                    letterSpacing: 1,
                  }}
                >
                  {b.label}
                </span>
                <span style={{ fontSize: 9, color: "#cbd5e1" }}>·</span>
                <span style={{ fontSize: 9, color: "#94a3b8" }}>
                  {item.period}
                </span>
              </div>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#1e293b",
                  margin: "0 0 1px",
                }}
              >
                {item.title}
              </p>
              <p style={{ fontSize: 10, color: "#64748b", margin: "0 0 2px" }}>
                {item.organization}
              </p>
              <p
                style={{
                  fontSize: 10,
                  color: "#94a3b8",
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                {item.description}
              </p>
            </div>
          </div>
        );
      })}
    </>
  );
}

function ProjectsPage({
  onProjectClick,
}: {
  onProjectClick: (p: ProjectItem) => void;
}) {
  return (
    <>
      <p style={S.label}>Projects</p>
      <hr style={S.hr} />
      {projectsData.map((p) => (
        <div
          key={p.id}
          onClick={() => onProjectClick(p)}
          style={{
            borderRadius: 10,
            padding: "9px 12px",
            marginBottom: 8,
            border: "1px solid #f1f5f9",
            background: "#fafafa",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.background = "#f0f4ff";
            (e.currentTarget as HTMLDivElement).style.borderColor = "#dde8ff";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.background = "#fafafa";
            (e.currentTarget as HTMLDivElement).style.borderColor = "#f1f5f9";
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#1e293b",
                margin: "0 0 3px",
              }}
            >
              {p.title}
            </p>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>›</span>
          </div>
          <p
            style={{
              fontSize: 10,
              color: "#64748b",
              margin: "0 0 6px",
              lineHeight: 1.6,
            }}
          >
            {p.description}
          </p>
          <div>
            {p.tech.map((t) => (
              <span key={t} style={S.chip}>
                {t}
              </span>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
