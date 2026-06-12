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
  > Three.js는 브라우저 API(WebGL, window)에 의존하므로 서버에서 실행하면 즉시 크래시난다.

- Three.js를 포함하는 컴포넌트는 `dynamic(() => import(...), { ssr: false })`로 임포트
  > `"use client"`만으로는 부족하다. Next.js는 클라이언트 컴포넌트도 서버에서 한 번 pre-render하기 때문에 `ssr: false`로 완전히 차단해야 한다.

- `next.config.ts`에 `transpilePackages: ["three"]` 설정 필수
  > Three.js는 ESM 전용 패키지라 Next.js가 그대로 번들하면 빌드 오류가 난다. transpile 설정으로 CJS 호환 변환을 거쳐야 한다.

- 모바일 감지: `page.tsx`에서 `window.innerWidth < 768` 체크 → `isMobile` state
  > Canvas 외부(일반 React 레이어)에서 모바일 여부를 판단해 오버레이 렌더링을 제어하기 위함. Canvas 안팎이 같은 기준(768px)을 공유해야 UI가 일관된다.

- 3D씬 내 모바일 감지: `useThree().size.width < 768` (Canvas 컨텍스트 내부에서만 사용)
  > R3F 훅은 Canvas 컨텍스트 안에서만 호출 가능하다. Canvas 내부 컴포넌트(BookModel, PortfolioScene 등)에서 `window`를 직접 읽는 대신 R3F가 관리하는 viewport 크기를 사용한다.

- 3D HTML 카드(`<Html transform>`) 내부 스타일은 Tailwind 대신 **인라인 스타일** 사용
  > drei의 `<Html transform>`은 Three.js 씬 안에 DOM을 삽입하는 방식이라 Tailwind의 PostCSS 처리 범위 밖에서 렌더링될 수 있다. 인라인 스타일만이 확실하게 적용된다.

- 모든 포트폴리오 텍스트 데이터는 `data/portfolioData.ts`에서만 관리
  > 콘텐츠가 BookModel(3D), PageContent(오버레이), FallbackPortfolio(2D) 세 곳에 분산되어 있다. 단일 소스를 두지 않으면 어느 한 곳에서만 수정하고 나머지를 놓치는 버그가 생긴다.

---

## Do

- 콘텐츠(이름·경력·프로젝트 등) 수정 시 **`data/portfolioData.ts`만 편집**
  > 세 개의 렌더링 경로(3D / 모바일 오버레이 / 2D)가 모두 이 파일을 참조한다. 다른 컴포넌트를 직접 수정하면 일부 뷰에만 반영된다.

- 새 챕터 추가 시 `PageContent.tsx`에 페이지 컴포넌트 추가 + `CHAPTERS` 배열에 키 등록
  > `CHAPTERS` 배열이 네비게이션·챕터 전환·카메라 이동의 기준이 된다. 여기서 빠진 키는 네비에 표시되지 않고 카메라도 대응하지 못한다.

- 모바일 레이아웃 변경 시 `page.tsx`의 `isMobile && isOpen` 오버레이 블록과 `PortfolioScene.tsx`의 `mobileOffset` 함께 확인
  > 오버레이 높이와 3D 책 위치는 같은 공간을 나눠 쓴다. 한쪽만 바꾸면 카드와 책이 겹치거나 빈 공간이 생긴다.

- `useFrame` 내에서 Vector3 생성이 필요하면 `useRef(new THREE.Vector3())`로 캐시해서 재사용
  > `useFrame`은 매 프레임(60fps)마다 실행된다. 내부에서 `new THREE.Vector3()`를 호출하면 초당 60개의 객체가 생성되어 GC 압력이 높아지고 프레임 드랍이 생긴다.

- 카메라 위치 조정 시 데스크탑(768px+)과 모바일(768px 미만) 두 경우 모두 테스트
  > 모바일은 `mobileOffset`으로 카메라를 추가로 뒤로 당기는 별도 로직이 있다. 데스크탑에서만 맞춰두면 모바일에서 책이 잘리거나 너무 작아진다.

---

## Don't

- `PortfolioCanvas.tsx`를 SSR 컨텍스트에서 직접 import 금지 (반드시 `dynamic + ssr:false`)
  > Three.js가 `window`, `document`, WebGL context를 즉시 참조하기 때문에 서버에서 import만 해도 빌드·런타임 오류가 발생한다.

- `useFrame`·`useThree` 등 R3F 훅을 Canvas 외부에서 사용 금지
  > R3F 훅은 내부적으로 React Context를 통해 렌더러 인스턴스를 가져온다. Canvas 밖에서 호출하면 context가 없어 즉시 오류가 난다.

- `BookModel.tsx`에 콘텐츠 데이터 직접 하드코딩 금지 — `portfolioData.ts` 경유
  > BookModel은 3D 렌더링 로직에 집중해야 한다. 데이터가 섞이면 내용 수정 시 3D 코드까지 건드려야 하고, 2D 모드와 내용이 달라지는 버그가 생긴다.

- 모바일 오버레이(`PageContent`)를 수정할 때 데스크탑 3D 카드(`AnimatedPageCard` 안의 `<Html>`)도 함께 확인
  > 두 경로가 `PageContent` 컴포넌트를 공유하므로 한쪽 수정이 양쪽에 영향을 준다. 단, 스타일(`cardStyle` prop)은 각자 다르게 주입되므로 레이아웃 변경 시 양쪽을 모두 눈으로 확인해야 한다.

- `three` 패키지를 `transpilePackages`에서 제거 금지
  > 제거하는 순간 `next build`가 ESM 파싱 오류로 실패한다. Three.js ESM 번들을 Next.js가 직접 처리하지 못하기 때문이다.

- **`data/portfolioData.ts` 절대 수정 금지** — `.claude/settings.json`에서 Edit/Write가 차단되어 있음
  > 이 파일에는 실제 경력·프로젝트 내용이 담겨 있다. AI가 임의로 내용을 바꾸면 사실과 다른 정보가 배포될 수 있다. 내용 수정은 반드시 본인이 직접 한다.
