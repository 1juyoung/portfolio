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
  const [isOpen, setIsOpen] = useState(false);
  const [is3DMode, setIs3DMode] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

  // 스크롤 진행도 (0.0 → 1.0) — ref로 관리해 React 리렌더 없이 60fps 애니메이션에 전달
  const scrollTargetRef = useRef(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const bookOpenRef = useRef(false);
  const bookOpenedAt = useRef(0);
  const lastChapterAt = useRef(0);

  const openBook = () => {
    if (bookOpenRef.current) return;
    bookOpenRef.current = true;
    setIsOpen(true);
  };

  // isOpen이 true로 전환되는 순간 쿨다운 기준 시각 기록 (useEffect = 렌더 외부)
  useEffect(() => {
    if (isOpen) bookOpenedAt.current = Date.now();
  }, [isOpen]);

  const handleChapterClick = (key: ChapterKey) => {
    if (!introComplete) {
      if (isMobile && is3DMode) {
        // 모바일: 인트로 스킵하고 바로 챕터 진입
        scrollTargetRef.current = 1.0;
        setIntroComplete(true);
        openBook();
      } else {
        return;
      }
    }
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
      if (Math.abs(e.deltaY) < 3) return;

      // 인트로 진행 중: 스크롤 position이 직접 애니메이션 진행도를 결정
      if (!introComplete) {
        const step =
          Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY) / 400, 0.06);
        scrollTargetRef.current = Math.max(
          0,
          Math.min(1, scrollTargetRef.current + step)
        );

        // 1.0 도달 시 인트로 완료
        if (scrollTargetRef.current >= 1.0) {
          openBook();
          setIntroComplete(true);
        }
        return;
      }

      // 챕터 네비게이션 쿨다운
      const now = Date.now();
      if (now - bookOpenedAt.current < 1500) return;
      if (now - lastChapterAt.current < 800) return;

      if (e.deltaY < 0) {
        // 역방향: 이전 챕터가 있으면 챕터 이동, 첫 챕터면 인트로 역재생
        const idx = CHAPTERS.findIndex((c) => c.key === chapter);
        if (idx > 0) {
          lastChapterAt.current = now;
          setChapter(CHAPTERS[idx - 1].key);
        } else {
          // 첫 챕터 → 책장으로 되돌아가기
          const step = Math.min(Math.abs(e.deltaY) / 400, 0.06);
          scrollTargetRef.current = Math.max(0, scrollTargetRef.current - step);
          if (scrollTargetRef.current < 1.0) {
            setIntroComplete(false);
          }
        }
        return;
      }

      // 순방향: 다음 챕터
      lastChapterAt.current = now;
      setChapter((prev) => {
        const idx = CHAPTERS.findIndex((c) => c.key === prev);
        if (idx < CHAPTERS.length - 1) return CHAPTERS[idx + 1].key;
        return prev;
      });
    };
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [is3DMode, introComplete, chapter]);

  // 모바일 터치 스와이프 — wheel 핸들러와 동일한 진행도 제어
  useEffect(() => {
    if (!is3DMode) return;

    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const dy = touchStartY - e.changedTouches[0].clientY;

      if (!introComplete) {
        // 탭(|dy|<20)은 크게 전진, 스와이프는 방향·크기 반영
        const step =
          Math.abs(dy) < 20
            ? 0.3
            : Math.sign(dy) * Math.min(Math.abs(dy) / 200, 0.3);
        scrollTargetRef.current = Math.max(
          0,
          Math.min(1, scrollTargetRef.current + step)
        );
        if (scrollTargetRef.current >= 1.0) {
          openBook();
          setIntroComplete(true);
        }
        return;
      }

      if (Math.abs(dy) < 20) return; // 탭은 챕터 이동 무시

      const now = Date.now();
      if (now - bookOpenedAt.current < 1500) return;
      if (now - lastChapterAt.current < 800) return;

      if (dy < 0) {
        const idx = CHAPTERS.findIndex((c) => c.key === chapter);
        if (idx > 0) {
          lastChapterAt.current = now;
          setChapter(CHAPTERS[idx - 1].key);
        } else {
          scrollTargetRef.current = Math.max(0, scrollTargetRef.current - 0.25);
          if (scrollTargetRef.current < 1.0) {
            setIntroComplete(false);
          }
        }
        return;
      }

      lastChapterAt.current = now;
      setChapter((prev) => {
        const idx = CHAPTERS.findIndex((c) => c.key === prev);
        if (idx < CHAPTERS.length - 1) return CHAPTERS[idx + 1].key;
        return prev;
      });
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [is3DMode, introComplete, chapter]);

  const darkNav = !is3DMode || isMobile;

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{
        background:
          "radial-gradient(120% 120% at 50% 0%, #f4fbf7 0%, #e7f3eb 45%, #dceee4 100%)",
      }}
    >
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
            <PortfolioCanvas
              chapter={chapter}
              isOpen={isOpen}
              scrollTargetRef={scrollTargetRef}
            />
          </div>

          {/* 모바일: 열린 상태일 때 콘텐츠를 큰 카드 오버레이로 표시 (역재생 중에는 숨김) */}
          {isMobile && isOpen && introComplete && (
            <div
              className="absolute left-4 right-4 z-20 overflow-y-auto"
              style={{ top: "96px", maxHeight: "calc(100vh - 112px)" }}
            >
              <PageContent
                chapter={chapter}
                cardStyle={{
                  width: "100%",
                  minHeight: "auto",
                  padding: "24px 20px",
                }}
              />
            </div>
          )}

          {/* 인트로 전: 조작 안내 */}
          {!introComplete && (
            <p className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 text-[11px] tracking-widest text-slate-400 uppercase select-none animate-pulse">
              {isMobile ? "tap or swipe to begin" : "scroll to begin"}
            </p>
          )}

          {/* 인트로 후, 책 닫힌 상태: 챕터 안내 */}
          {introComplete && !isOpen && (
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
