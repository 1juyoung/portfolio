"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ChapterKey } from "@/data/portfolioData";
import PortfolioScene from "./PortfolioScene";

interface Props {
  chapter: ChapterKey;
  isOpen: boolean;
}

export default function PortfolioCanvas({ chapter, isOpen }: Props) {
  return (
    /*
      Canvas = Three.js WebGL 렌더러를 감싸는 R3F 컴포넌트
      - shadows: 그림자 활성화
      - gl.alpha: 배경을 투명하게 (CSS 배경색이 비침)
      - camera.fov: 시야각 (작을수록 망원, 클수록 광각)
    */
    <Canvas
      shadows
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [-0.2, 0.4, 3.8], fov: 50 }}
      style={{ width: "100%", height: "100%" }}
    >
      {/*
        Suspense: 3D 에셋이 로딩되는 동안 fallback을 표시합니다.
        모델이나 텍스처를 불러올 때 필수입니다.
      */}
      <Suspense fallback={null}>
        <PortfolioScene chapter={chapter} isOpen={isOpen} />
      </Suspense>
    </Canvas>
  );
}
