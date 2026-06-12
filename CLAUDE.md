# Project: Web Developer Portfolio

3D 인터랙티브 포트폴리오 사이트. 기본은 Three.js 3D 책 모델로 동작하며, 폴백으로 2D 모드 제공.
배포 URL: jy-portfolio.site

> ⚠️ **Next.js 16 주의**: 이 버전은 breaking changes가 있어 학습 데이터와 다를 수 있다.
> 코드 작성 전 `node_modules/next/dist/docs/`의 관련 가이드를 읽고, deprecation notice를 반드시 확인할 것.

---

## Tech Stack

| 분류 | 라이브러리 | 버전 |
|------|-----------|------|
| Framework | Next.js (App Router) | 16.2.7 |
| UI | React | 19.2.4 |
| Language | TypeScript | ^5 |
| 3D | Three.js + @react-three/fiber + @react-three/drei | three ^0.184 / fiber ^9 / drei ^10 |
| Styling | Tailwind CSS | v4 |
| Animation | Motion (Framer Motion fork) | ^12 |
| Font | Geist Sans, Geist Mono, Caveat (Google Fonts) | — |

---

## Architecture

```
app/
  layout.tsx          # 루트 레이아웃, 폰트·메타데이터 설정
  page.tsx            # 메인 페이지: 3D/2D 모드 전환, 모바일 감지, 챕터 상태 관리
  globals.css

components/portfolio/
  PortfolioCanvas.tsx # R3F Canvas 래퍼 (ssr: false dynamic import 대상)
  PortfolioScene.tsx  # 카메라 제어, 조명, 씬 구성. 모바일 여부로 카메라 거리 보정
  BookModel.tsx       # 3D 책 모델 (닫힌 책 ↔ 열린 책 전환 + 페이지 애니메이션)
  PageContent.tsx     # 포트폴리오 콘텐츠 컴포넌트 (About/Career/Projects). 3D Html과 모바일 오버레이 양쪽에서 공유
  ProjectDetailOverlay.tsx  # 프로젝트 상세 모달 (createPortal → document.body)
  FloatingMonitor.tsx # Projects 챕터에 나타나는 3D 모니터 오브젝트
  FloorLamp.tsx       # 씬 내 바닥 조명 오브젝트
  FallbackPortfolio.tsx     # 2D 모드 전용 레이아웃

data/
  portfolioData.ts    # ★ 유일한 콘텐츠 소스. 이 파일만 수정하면 전체 반영
```

### 핵심 흐름

- **3D 모드 (기본)**: `page.tsx` → dynamic import(`ssr:false`) → `PortfolioCanvas` → R3F `Canvas` → `PortfolioScene` + `BookModel`
- **모바일 3D 모드**: 책은 장식용으로 하단에, 콘텐츠는 `PageContent`를 HTML 오버레이로 상단에 표시
- **2D 모드**: `FallbackPortfolio` 직접 렌더링 (Three.js 없음)
- **챕터 이동**: 스크롤 휠 이벤트 또는 네비게이션 클릭 → `chapter` state 변경

---

## Commands

```bash
npm run dev      # 개발 서버 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 검사
```

---

## Conventions

- Three.js 관련 컴포넌트는 **반드시 `"use client"`** 선언
- Three.js를 포함하는 컴포넌트는 `dynamic(() => import(...), { ssr: false })`로 임포트
- `next.config.ts`에 `transpilePackages: ["three"]` 설정 필수
- 모바일 감지: `page.tsx`에서 `window.innerWidth < 768` 체크 → `isMobile` state
- 3D씬 내 모바일 감지: `useThree().size.width < 768` (Canvas 컨텍스트 내부에서만 사용)
- 3D HTML 카드(`<Html transform>`) 내부 스타일은 Tailwind 대신 **인라인 스타일** 사용
- 모든 포트폴리오 텍스트 데이터는 `data/portfolioData.ts`에서만 관리

---

## Do

- 콘텐츠(이름·경력·프로젝트 등) 수정 시 **`data/portfolioData.ts`만 편집**
- 새 챕터 추가 시 `PageContent.tsx`에 페이지 컴포넌트 추가 + `CHAPTERS` 배열에 키 등록
- 모바일 레이아웃 변경 시 `page.tsx`의 `isMobile && isOpen` 오버레이 블록과 `PortfolioScene.tsx`의 `mobileOffset` 함께 확인
- `useFrame` 내에서 Vector3 생성이 필요하면 `useRef(new THREE.Vector3())`로 캐시해서 재사용
- 카메라 위치 조정 시 데스크탑(768px+)과 모바일(768px 미만) 두 경우 모두 테스트

## Don't

- `PortfolioCanvas.tsx`를 SSR 컨텍스트에서 직접 import 금지 (반드시 dynamic + ssr:false)
- `useFrame`·`useThree` 등 R3F 훅을 Canvas 외부에서 사용 금지
- `BookModel.tsx`에 콘텐츠 데이터 직접 하드코딩 금지 — `portfolioData.ts` 경유
- 모바일 오버레이 카드(`PageContent`) 없이 `AnimatedPageCard`(3D Html 카드)만 수정하지 말 것 — 두 렌더링 경로가 같은 컴포넌트를 공유함
- `three` 패키지를 `transpilePackages`에서 제거 금지 (빌드 오류 발생)
