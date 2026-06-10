"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { aboutData, careerData, projectsData, ProjectItem } from "@/data/portfolioData";
import ProjectDetailOverlay from "./ProjectDetailOverlay";

export default function FallbackPortfolio() {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  return (
    <div className="w-full h-full overflow-y-auto pt-20 px-6 pb-16">
      <div className="max-w-2xl mx-auto space-y-20">
        {/* ── About Me ── */}
        <section id="about">
          <SectionLabel>About Me</SectionLabel>
          <h2 className="text-3xl font-bold text-slate-800 mt-1 mb-0.5">
            {aboutData.name}
          </h2>
          <p className="text-slate-500 mb-4">{aboutData.role}</p>
          <p className="text-slate-600 leading-relaxed mb-5">
            {aboutData.intro}
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {aboutData.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-white text-slate-600 text-sm rounded-full shadow-sm border border-slate-100"
              >
                {skill}
              </span>
            ))}
          </div>
          {aboutData.github && (
            <a
              href={aboutData.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-full hover:bg-slate-700 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </a>
          )}
        </section>

        {/* ── Career ── */}
        <section id="career">
          <SectionLabel>Career</SectionLabel>
          <div className="mt-4 space-y-4">
            {careerData.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-5 shadow-sm border border-slate-100"
              >
                <p className="text-xs text-slate-400 tracking-wider mb-1">
                  {item.period}
                </p>
                <h3 className="font-bold text-slate-700">{item.title}</h3>
                <p className="text-sm text-slate-500 mb-2">
                  {item.organization}
                </p>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Projects ── */}
        <section id="projects">
          <SectionLabel>Projects</SectionLabel>
          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            {projectsData.map((project) => (
              <div
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 cursor-pointer hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-700">{project.title}</h3>
                  <span className="text-slate-300 text-sm">›</span>
                </div>
                <p className="text-sm text-slate-500 mb-3 leading-relaxed">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {selectedProject &&
        createPortal(
          <ProjectDetailOverlay
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />,
          document.body
        )}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs tracking-widest text-slate-400 uppercase font-medium">
      {children}
    </p>
  );
}
