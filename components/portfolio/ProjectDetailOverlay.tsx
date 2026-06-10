"use client";

import { useState, useEffect, useCallback } from "react";
import type { ProjectItem, TroubleshootingItem, ProjectLink } from "@/data/portfolioData";

interface Props {
  project: ProjectItem;
  onClose: () => void;
}

type Tab = "roles" | "troubleshooting";

export default function ProjectDetailOverlay({ project, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("roles");
  const [tabKey, setTabKey] = useState(0);

  const images = project.detail?.images ?? [];
  const hasRoles = (project.detail?.roles?.length ?? 0) > 0;
  const hasTroubleshooting = (project.detail?.troubleshooting?.length ?? 0) > 0;
  const showTabs = hasRoles && hasTroubleshooting;

  const handleClose = useCallback(() => {
    setMounted(false);
    setTimeout(onClose, 420);
  }, [onClose]);

  const switchTab = (tab: Tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setTabKey((k) => k + 1);
  };

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", handleKey);
    };
  }, [handleClose]);

  return (
    <div
      onClick={handleClose}
      onWheel={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `rgba(15, 23, 42, ${mounted ? 0.78 : 0})`,
        backdropFilter: mounted ? "blur(8px)" : "blur(0px)",
        WebkitBackdropFilter: mounted ? "blur(8px)" : "blur(0px)",
        transition: "background 0.4s ease, backdrop-filter 0.4s ease",
        cursor: "pointer",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "calc(100% - 40px)",
          maxWidth: 760,
          maxHeight: "90vh",
          background: "#ffffff",
          borderRadius: 24,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transform: `translateY(${mounted ? 0 : "100%"})`,
          transition: "transform 0.45s cubic-bezier(0.32, 0.72, 0, 1)",
          cursor: "default",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.2)",
        }}
      >
        {/* 드래그 핸들 */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "14px 0 0",
            flexShrink: 0,
          }}
        >
          <div
            style={{ width: 36, height: 4, borderRadius: 2, background: "#e2e8f0" }}
          />
        </div>

        {/* 스크롤 가능한 본문 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 28px 40px" }}>

          {/* 이름 + X */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 10,
            }}
          >
            <h2
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
                letterSpacing: -0.5,
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
            >
              {project.title}
            </h2>
            <button
              onClick={handleClose}
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "#f1f5f9",
                border: "none",
                color: "#64748b",
                fontSize: 20,
                lineHeight: 1,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontFamily: "sans-serif",
              }}
            >
              ×
            </button>
          </div>

          {/* 기간 + 인원 */}
          <div
            style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}
          >
            {project.detail?.period && <Chip>{project.detail.period}</Chip>}
            {project.detail?.team && <Chip>{project.detail.team}</Chip>}
          </div>

          {/* 설명 */}
          <p
            style={{
              fontSize: 14,
              color: "#475569",
              lineHeight: 1.8,
              margin: "0 0 24px",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            {project.detail?.longDescription ?? project.description}
          </p>

          {/* 이미지 그리드 */}
          {images.length > 0 && (
            <div
              style={{
                background: "#F4F8FF",
                borderRadius: 16,
                padding: "20px 16px",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${images.length}, 1fr)`,
                  gap: 12,
                }}
              >
                {images.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt={`${project.title} screenshot ${i + 1}`}
                    style={{
                      width: "100%",
                      height: "auto",
                      objectFit: "contain",
                      borderRadius: 10,
                      boxShadow: "0 4px 18px rgba(0,0,0,0.13)",
                      display: "block",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 탭 */}
          {showTabs && (
            <div
              style={{
                display: "flex",
                background: "#f1f5f9",
                borderRadius: 10,
                padding: 3,
                marginBottom: 16,
                gap: 2,
              }}
            >
              {(["roles", "troubleshooting"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => switchTab(tab)}
                  style={{
                    flex: 1,
                    padding: "8px 0",
                    borderRadius: 8,
                    border: "none",
                    background: activeTab === tab ? "#fff" : "transparent",
                    boxShadow:
                      activeTab === tab
                        ? "0 1px 3px rgba(0,0,0,0.1)"
                        : "none",
                    color: activeTab === tab ? "#1e293b" : "#94a3b8",
                    fontWeight: activeTab === tab ? 600 : 400,
                    fontSize: 12,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontFamily: "system-ui, -apple-system, sans-serif",
                  }}
                >
                  {tab === "roles" ? "담당 역할" : "트러블슈팅"}
                </button>
              ))}
            </div>
          )}

          {/* 탭 콘텐츠 */}
          <div key={tabKey} className="tab-content-enter" style={{ marginBottom: 20 }}>
            {/* 담당 역할 */}
            {(!showTabs || activeTab === "roles") &&
              hasRoles && (
                <>
                  {!showTabs && <SectionLabel>담당 역할</SectionLabel>}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {project.detail!.roles.map((role, i) => (
                      <div
                        key={i}
                        style={{
                          padding: "11px 14px",
                          borderRadius: 12,
                          background: "#f8fafc",
                          border: "1px solid #f1f5f9",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: "#1e293b",
                            margin: "0 0 4px",
                            fontFamily: "system-ui, -apple-system, sans-serif",
                          }}
                        >
                          {role.title}
                        </p>
                        <p
                          style={{
                            fontSize: 11,
                            color: "#64748b",
                            margin: 0,
                            lineHeight: 1.65,
                            fontFamily: "system-ui, -apple-system, sans-serif",
                          }}
                        >
                          {role.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}

            {/* 트러블슈팅 */}
            {(!showTabs || activeTab === "troubleshooting") &&
              hasTroubleshooting && (
                <>
                  {!showTabs && <SectionLabel>트러블슈팅</SectionLabel>}
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {project.detail!.troubleshooting!.map((item, i) => (
                      <TroubleshootingCard key={i} item={item} index={i} />
                    ))}
                  </div>
                </>
              )}
          </div>

          {/* 기술 스택 */}
          {project.tech.length > 0 && (
            <div style={{ marginBottom: project.detail?.links?.length ? 20 : 0 }}>
              <SectionLabel>Tech Stack</SectionLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {project.tech.map((t) => (
                  <span
                    key={t}
                    style={{
                      padding: "4px 12px",
                      borderRadius: 999,
                      background: "#eff6ff",
                      color: "#3b82f6",
                      fontSize: 11,
                      fontWeight: 600,
                      fontFamily: "system-ui, -apple-system, sans-serif",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 링크 */}
          {project.detail?.links && project.detail.links.length > 0 && (
            <div>
              <SectionLabel>Links</SectionLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {project.detail.links.map((link: ProjectLink) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 14px",
                      borderRadius: 999,
                      background: "#0f172a",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 600,
                      textDecoration: "none",
                      fontFamily: "system-ui, -apple-system, sans-serif",
                      transition: "background 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background = "#1e293b";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.background = "#0f172a";
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TroubleshootingCard({
  item,
  index,
}: {
  item: TroubleshootingItem;
  index: number;
}) {
  return (
    <div
      style={{
        borderRadius: 14,
        border: "1px solid #f1f5f9",
        overflow: "hidden",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          padding: "9px 14px",
          background: "#f8fafc",
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        <span
          style={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#e2e8f0",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 9,
            fontWeight: 700,
            color: "#64748b",
            flexShrink: 0,
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {index + 1}
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "#1e293b",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {item.title}
        </span>
      </div>

      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Problem */}
        <div
          style={{
            padding: "9px 12px",
            borderRadius: 10,
            background: "#fff5f5",
            borderLeft: "3px solid #fca5a5",
          }}
        >
          <p
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "#ef4444",
              margin: "0 0 5px",
              letterSpacing: "1.5px",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            PROBLEM
          </p>
          <p
            style={{
              fontSize: 11,
              color: "#475569",
              margin: 0,
              lineHeight: 1.65,
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            {item.problem}
          </p>
        </div>

        {/* Arrow */}
        <div
          style={{
            textAlign: "center",
            color: "#cbd5e1",
            fontSize: 13,
            lineHeight: 1,
          }}
        >
          ↓
        </div>

        {/* Solution */}
        <div
          style={{
            padding: "9px 12px",
            borderRadius: 10,
            background: "#eff6ff",
            borderLeft: "3px solid #93c5fd",
          }}
        >
          <p
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: "#3b82f6",
              margin: "0 0 5px",
              letterSpacing: "1.5px",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            SOLUTION
          </p>
          <p
            style={{
              fontSize: 11,
              color: "#475569",
              margin: 0,
              lineHeight: 1.65,
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}
          >
            {item.solution}
          </p>
        </div>

        {/* Metrics */}
        {item.metrics && item.metrics.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, paddingTop: 2 }}>
            {item.metrics.map((m, i) => (
              <span
                key={i}
                style={{
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: "#f0fdf4",
                  color: "#16a34a",
                  fontSize: 10,
                  fontWeight: 600,
                  border: "1px solid #bbf7d0",
                  fontFamily: "system-ui, -apple-system, sans-serif",
                }}
              >
                {m}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 11,
        color: "#64748b",
        background: "#f1f5f9",
        padding: "3px 10px",
        borderRadius: 999,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {children}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 10,
        letterSpacing: "2px",
        color: "#94a3b8",
        textTransform: "uppercase",
        margin: "0 0 10px",
        fontWeight: 700,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {children}
    </p>
  );
}
