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
          <div className="flex flex-wrap gap-2">
            {aboutData.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-white text-slate-600 text-sm rounded-full shadow-sm border border-slate-100"
              >
                {skill}
              </span>
            ))}
          </div>
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
