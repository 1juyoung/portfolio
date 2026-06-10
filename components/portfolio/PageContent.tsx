"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  ChapterKey,
  aboutData,
  careerData,
  projectsData,
  CareerType,
  ProjectItem,
} from "@/data/portfolioData";
import ProjectDetailOverlay from "./ProjectDetailOverlay";

const CARD_PX = 300;

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
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <a
          href="mailto:myjuyoung2@gmail.com"
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
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
          </svg>
          Email
        </a>
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
      </div>
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
                  margin: item.tech?.length ? "0 0 5px" : 0,
                }}
              >
                {item.description}
              </p>
              {item.tech && item.tech.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 3,
                    marginBottom: item.tools?.length ? 3 : 0,
                  }}
                >
                  {item.tech.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: 8,
                        fontWeight: 600,
                        padding: "1px 6px",
                        borderRadius: 999,
                        background: "#eff6ff",
                        color: "#3b82f6",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              {item.tools && item.tools.length > 0 && (
                <div
                  className="mt-1"
                  style={{ display: "flex", flexWrap: "wrap", gap: 3 }}
                >
                  {item.tools.map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: 8,
                        fontWeight: 600,
                        padding: "1px 6px",
                        borderRadius: 999,
                        background: "#f1f5f9",
                        color: "#64748b",
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
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

export function PageContent({
  chapter,
  cardStyle,
}: {
  chapter: ChapterKey;
  cardStyle?: React.CSSProperties;
}) {
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
          ...cardStyle,
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
