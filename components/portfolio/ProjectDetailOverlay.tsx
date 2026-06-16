"use client";

import { useEffect, useCallback } from "react";
import type {
  ProjectItem,
  TroubleshootingItem,
  ProjectLink,
} from "@/data/portfolioData";

interface Props {
  project: ProjectItem;
  onClose: () => void;
}

export default function ProjectDetailOverlay({ project, onClose }: Props) {
  const images = project.detail?.images ?? [];
  const hasRoles = (project.detail?.roles?.length ?? 0) > 0;
  const hasTroubleshooting = (project.detail?.troubleshooting?.length ?? 0) > 0;

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", handleKey);
    };
  }, [handleClose]);

  return (
    <div
      onClick={handleClose}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        background: "rgba(15,23,42,0.6)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 720,
          maxHeight: "88vh",
          background: "#ffffff",
          borderRadius: "20px 20px 0 0",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          cursor: "default",
        }}
      >
        {/* 드래그 핸들 */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "12px 0 0",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 32,
              height: 4,
              borderRadius: 2,
              background: "#e2e8f0",
            }}
          />
        </div>

        {/* 스크롤 영역 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px 48px" }}>
          {/* 헤더 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 8,
            }}
          >
            <h2
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
                letterSpacing: -0.5,
                fontFamily: "system-ui,-apple-system,sans-serif",
              }}
            >
              {project.title}
            </h2>
            <button
              onClick={handleClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "#f1f5f9",
                border: "none",
                color: "#64748b",
                fontSize: 18,
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

          {/* 기간 · 인원 */}
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              marginBottom: 14,
            }}
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
              margin: "0 0 22px",
              fontFamily: "system-ui,-apple-system,sans-serif",
            }}
          >
            {project.detail?.longDescription ?? project.description}
          </p>

          {/* 이미지 */}
          {images.length > 0 && (
            <div
              style={{
                background: "#f8fafc",
                borderRadius: 14,
                padding: "16px 12px",
                marginBottom: 22,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${images.length}, 1fr)`,
                  gap: 10,
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
                      borderRadius: 8,
                      boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                      display: "block",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 담당 역할 */}
          {hasRoles && (
            <div style={{ marginBottom: hasTroubleshooting ? 24 : 20 }}>
              <SectionLabel>담당 역할</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {project.detail!.roles.map((role, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      style={{
                        marginTop: 5,
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: "#059669",
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#1e293b",
                          margin: "0 0 2px",
                          fontFamily: "system-ui,-apple-system,sans-serif",
                        }}
                      >
                        {role.title}
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          color: "#64748b",
                          margin: 0,
                          lineHeight: 1.65,
                          fontFamily: "system-ui,-apple-system,sans-serif",
                        }}
                      >
                        {role.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 트러블슈팅 — 담당 역할 아래 직접 배치 */}
          {hasTroubleshooting && (
            <div style={{ marginBottom: 22 }}>
              <SectionLabel>문제 해결</SectionLabel>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 20 }}
              >
                {project.detail!.troubleshooting!.map((item, i) => (
                  <TroubleshootingEntry
                    key={i}
                    item={item}
                    index={i}
                    isLast={i === project.detail!.troubleshooting!.length - 1}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 기술 스택 */}
          {project.tech.length > 0 && (
            <div
              style={{ marginBottom: project.detail?.links?.length ? 20 : 0 }}
            >
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
                      fontFamily: "system-ui,-apple-system,sans-serif",
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
                      fontFamily: "system-ui,-apple-system,sans-serif",
                    }}
                  >
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

function TroubleshootingEntry({
  item,
  index,
  isLast,
}: {
  item: TroubleshootingItem;
  index: number;
  isLast: boolean;
}) {
  return (
    <div
      style={{
        paddingBottom: isLast ? 0 : 26,
        borderBottom: isLast ? "none" : "1px solid #f1f5f9",
      }}
    >
      {/* 번호 + 제목 */}
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            minWidth: 22,
            height: 22,
            borderRadius: 6,
            background: "#059669",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 800,
            color: "#fff",
            flexShrink: 0,
            marginTop: 1,
            fontFamily: "system-ui,-apple-system,sans-serif",
          }}
        >
          {index + 1}
        </div>
        <p
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#0f172a",
            margin: 0,
            lineHeight: 1.4,
            fontFamily: "system-ui,-apple-system,sans-serif",
          }}
        >
          {item.title}
        </p>
      </div>

      <div style={{ paddingLeft: 32 }}>
        {/* 문제 상황 — 흐릿하게 */}
        <p
          className="whitespace-pre-line"
          style={{
            fontSize: 12,
            color: "#94a3b8",
            margin: "0 0 10px",
            lineHeight: 1.75,
            fontFamily: "system-ui,-apple-system,sans-serif",
          }}
        >
          {item.problem}
        </p>

        {/* 해결 — 초록 블록으로 강조 */}
        <div
          className="whitespace-pre-line"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "#f0fdf4",
            marginBottom: item.metrics?.length ? 10 : 0,
          }}
        >
          <p
            className="whitespace-pre-line"
            style={{
              fontSize: 13,
              color: "#15803d",
              margin: 0,
              lineHeight: 1.75,
              fontFamily: "system-ui,-apple-system,sans-serif",
            }}
          >
            {item.solution}
          </p>
        </div>

        {/* 성과 */}
        {item.metrics && item.metrics.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {item.metrics.map((m, i) => (
              <span
                key={i}
                style={{
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: "#fff",
                  color: "#059669",
                  fontSize: 11,
                  fontWeight: 600,
                  border: "1px solid #bbf7d0",
                  fontFamily: "system-ui,-apple-system,sans-serif",
                }}
              >
                ✓ {m}
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
        fontFamily: "system-ui,-apple-system,sans-serif",
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
        margin: "0 0 12px",
        fontWeight: 700,
        fontFamily: "system-ui,-apple-system,sans-serif",
      }}
    >
      {children}
    </p>
  );
}
