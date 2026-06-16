"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ChapterKey } from "@/data/portfolioData";
import PortfolioScene from "./PortfolioScene";

interface Props {
  chapter: ChapterKey;
  isOpen: boolean;
  scrollTargetRef: { current: number };
}

export default function PortfolioCanvas({ chapter, isOpen, scrollTargetRef }: Props) {
  return (
    <Canvas
      shadows
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [-0.2, 0.4, 3.8], fov: 50 }}
      style={{ width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>
        <PortfolioScene
          chapter={chapter}
          isOpen={isOpen}
          scrollTargetRef={scrollTargetRef}
        />
      </Suspense>
    </Canvas>
  );
}
