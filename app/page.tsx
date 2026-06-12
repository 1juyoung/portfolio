"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { CHAPTERS, ChapterKey } from "@/data/portfolioData";
import FallbackPortfolio from "@/components/portfolio/FallbackPortfolio";
import { PageContent } from "@/components/portfolio/PageContent";

const PortfolioCanvas = dynamic(
  () => import("@/components/portfolio/PortfolioCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-slate-300 text-sm tracking-widest animate-pulse">
          Loading...
        </span>
      </div>
    ),
  }
);

export default function Home() {
  const [chapter, setChapter] = useState<ChapterKey>("about");
  const [isOpen, setIsOpen] = useState(false); // 책 열림/닫힘
  const [is3DMode, setIs3DMode] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const bookOpenRef = useRef(false);
  const bookOpenedAt = useRef(0); // 책이 열린 시각 (ms)
  const lastChapterAt = useRef(0); // 마지막 챕터 이동 시각 (ms)

  const openBook = () => {
    if (bookOpenRef.current) return;
    bookOpenRef.current = true;
    bookOpenedAt.current = Date.now();
    setIsOpen(true);
  };

  // 챕터 클릭 → 3D: 책 열기 / 2D: 해당 섹션으로 스크롤
  const handleChapterClick = (key: ChapterKey) => {
    setChapter(key);
    if (!is3DMode) {
      document.getElementById(key)?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    openBook();
  };

  useEffect(() => {
    if (!is3DMode) return;
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 3) return; // 미세 잔여 이벤트 무시

      if (!bookOpenRef.current) {
        openBook();
        return;
      }

      const now = Date.now();
      // 책이 열린 후 1500ms 동안은 챕터 이동 차단 (애니메이션 + 관성 스크롤 대기)
      if (now - bookOpenedAt.current < 1500) return;
      // 챕터 이동 최소 간격 800ms
      if (now - lastChapterAt.current < 800) return;

      lastChapterAt.current = now;
      setChapter((prev) => {
        const idx = CHAPTERS.findIndex((c) => c.key === prev);
        if (e.deltaY > 0 && idx < CHAPTERS.length - 1)
          return CHAPTERS[idx + 1].key;
        if (e.deltaY < 0 && idx > 0) return CHAPTERS[idx - 1].key;
        return prev;
      });
    };
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [is3DMode]);

  // 모바일 3D 모드: 배경이 밝은 카드 오버레이이므로 2D 모드와 동일한 어두운 색상 사용
  const darkNav = !is3DMode || isMobile;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* ── 네비게이션 ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4">
        <span
          className={`font-bold text-base tracking-tight ${darkNav ? "text-slate-700" : "text-slate-100"}`}
        >
          JUYOUNG
        </span>
        <ul className="flex gap-7">
          {CHAPTERS.map((c) => (
            <li key={c.key}>
              <button
                onClick={() => handleChapterClick(c.key)}
                className={`text-sm tracking-wide pb-1 border-b-2 transition-all duration-300 ${
                  (!is3DMode || isOpen) && chapter === c.key
                    ? darkNav
                      ? "border-slate-700 font-semibold text-slate-800"
                      : "border-white font-semibold text-white"
                    : darkNav
                      ? "border-transparent text-slate-600 hover:text-slate-800"
                      : "border-transparent text-slate-300/70 hover:text-white"
                }`}
              >
                {c.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── 3D 모드 ── */}
      {is3DMode && (
        <>
          <div className="absolute inset-0">
            <PortfolioCanvas chapter={chapter} isOpen={isOpen} />
          </div>

          {/* 비네트 오버레이 — 가장자리를 부드럽게 어둡게 해 중앙 책에 시선 집중 */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background:
                "radial-gradient(ellipse 65% 65% at 50% 55%, transparent 0%, rgba(148,163,184,0.18) 55%, rgba(100,116,139,0.42) 85%, rgba(71,85,105,0.62) 100%)",
            }}
          />

          {/* 모바일: 열린 상태일 때 콘텐츠를 큰 카드 오버레이로 표시 */}
          {isMobile && isOpen && (
            <div
              className="absolute left-4 right-4 z-20 overflow-y-auto"
              style={{ top: "96px", maxHeight: "calc(100vh - 112px)" }}
            >
              <PageContent
                chapter={chapter}
                cardStyle={{ width: "100%", minHeight: "auto", padding: "24px 20px" }}
              />
            </div>
          )}

          {/* 닫힌 상태일 때 힌트 */}
          {!isOpen && (
            <p className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 text-[11px] tracking-widest text-slate-400 uppercase select-none animate-pulse">
              click a chapter or scroll to open
            </p>
          )}
        </>
      )}

      {/* ── 2D 모드 ── */}
      {!is3DMode && (
        <div className="absolute inset-0 pt-16">
          <FallbackPortfolio />
        </div>
      )}

      {/* ── 3D / 2D 전환 ── */}
      <button
        onClick={() => setIs3DMode((v) => !v)}
        className="fixed bottom-8 right-8 z-50 px-4 py-2 rounded-full bg-slate-800/80 text-white text-[11px] font-medium tracking-widest hover:bg-slate-900 transition-colors backdrop-blur-sm shadow-lg"
      >
        {is3DMode ? "2D 모드" : "3D 모드"}
      </button>
    </div>
  );
}
