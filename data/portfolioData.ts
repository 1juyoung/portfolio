// ─────────────────────────────────────────────────────────────
// 포트폴리오 데이터 파일
// 여기서 내용을 수정하면 사이트 전체에 자동 반영됩니다.
// ─────────────────────────────────────────────────────────────

// 챕터 키 타입 (About Me / Career / Projects)
export type ChapterKey = "about" | "career" | "projects";

// 네비게이션 메뉴에 표시될 챕터 목록
export const CHAPTERS: { key: ChapterKey; label: string }[] = [
  { key: "about", label: "About Me" },
  { key: "career", label: "Career" },
  { key: "projects", label: "Projects" },
];

// ── About Me ──────────────────────────────────────────────────
export const aboutData = {
  name: "Juyoung",
  role: "Web Developer",
  intro:
    "프론트엔드 개발을 중심으로 시작해, 최근에는 백엔드까지 함께 공부하며 웹 서비스의 전체 흐름을 이해하려고 노력하고 있습니다. \n \n 사용자에게 보이는 화면뿐 아니라 데이터가 오가고 처리되는 과정까지 고려하는 웹 개발을 지향합니다. \n",
  skills: ["React", "TypeScript", "Next.js", "Vue.js"],
  github: "https://github.com/1juyoung",
};

// ── Career ────────────────────────────────────────────────────
export type CareerType = "education" | "internship" | "study";

export interface CareerItem {
  type: CareerType;
  period: string;
  title: string;
  organization: string;
  description: string;
  tech?: string[];
  tools?: string[];
}

export const careerData: CareerItem[] = [
  {
    type: "education",
    period: "2020.03 — 2025.02",
    title: "정보융합학부 \n 부전공 : 미디어커뮤니케이션",
    organization: "광운대학교",
    description:
      "웹 서비스 개발, 데이터 분석, UI/UX 설계를 학습하며 사용자 중심의 디지털 서비스 구현 역량을 쌓았습니다.",
    tools: ["Google Analytics", "Tableau", "D3.js", "Adobe XD"],
  },
  {
    type: "internship",
    period: "2025.06— 2024.07",
    title: "프론트엔드 개발",
    organization: "IT 교육 회사",
    description:
      "실시간 시스템 구현 (SSE 기반), \n 마이페이지 성능 최적화 (3.34s → 2.24s 개선)",
    tech: ["Next.js", "TypeScript", "React"],
  },
  {
    type: "internship",
    period: "2025. 10 — 2026. 01",
    title: "프론트엔드 개발",
    organization: "리서치 회사",
    description:
      "자사 설문조사 서비스 리뉴얼에 참여해 랜딩 페이지 UI/UX를 개선하고, Lighthouse Performance를 68점에서 75점으로 개선했습니다.\n조건 처리 구조와 API 호출 흐름을 정리해 데이터 누락 이슈와 유지보수성을 개선했습니다.",
    tech: ["Vue.js", "Nuxt"],
  },
];

// ── Projects ──────────────────────────────────────────────────
export interface ProjectRole {
  title: string;
  description: string;
}

export interface TroubleshootingItem {
  title: string;
  problem: string;
  solution: string;
  metrics?: string[];
}

export interface ProjectLink {
  label: string;
  url: string;
}

export interface ProjectDetail {
  period: string;
  team: string;
  longDescription: string;
  roles: ProjectRole[];
  images: string[];
  links?: ProjectLink[];
  troubleshooting?: TroubleshootingItem[];
}

export interface ProjectItem {
  id: number;
  title: string;
  description: string;
  tech: string[];
  thumbnail: string;
  link?: string;
  detail?: ProjectDetail;
}

export const projectsData: ProjectItem[] = [
  {
    id: 1,
    title: "Face Meet",
    description: "표정 분석 기반 화상회의 웹 서비스",
    tech: ["React", "node.js", "WebRTC", "Socket.io"],
    thumbnail: "/images/faceMeet/facemeet_home.png",
    detail: {
      period: "2025. 03 - 2025. 10",
      team: "FE(2), BE(1), AI(1)",
      longDescription:
        "FaceMeet은 실시간 화상 회의와 채팅 기능에 표정 기반 감정 분석을 결합한 온라인 커뮤니케이션 웹 서비스입니다. 사용자의 얼굴 표정을 7가지 감정 점수로 분석하고 시각화하여, 회의 중 감정 흐름을 직관적으로 확인할 수 있도록 구현했습니다.",
      roles: [
        {
          title: "WebRTC 기반 화상 연결",
          description: "프론트 UI + 백엔드 signaling 로직 포함",
        },
        {
          title: "Socket.io 기반 채팅 ",
          description: "서버-클라이언트 이벤트 전체 흐름 구현",
        },
      ],
      images: [
        "/images/faceMeet/facemeet_home.png",
        "/images/faceMeet/facemeet_meetingroom.png",
      ],
      links: [
        { label: "GitHub", url: "https://github.com/1juyoung/facemeet" },
        {
          label: "리팩토링 FE",
          url: "https://github.com/1juyoung/facemeet-refactor-frontend",
        },
        {
          label: "리팩토링 BE",
          url: "https://github.com/1juyoung/facemeet-refactor-backend",
        },
      ],
      troubleshooting: [
        {
          title: "WebRTC P2P 구조의 연결 불안정",
          problem:
            "P2P 구조에서 참가자 수만큼 개별 연결을 생성하여, 사용자가 늘어날수록 네트워크 부하와 연결 안정성이 저하됐습니다. signaling 흐름이 구조화되지 않아 디버깅 비용도 높았습니다.",
          solution:
            "SFU 기반으로 전환해 모든 클라이언트가 단일 서버와만 연결하도록 리팩토링하고, 화상·채팅 로직을 컴포넌트와 커스텀 훅 단위로 분리했습니다.",
          metrics: [
            "LCP 0.9s → 0.4s",
            "TBT 160ms → 0ms",
            "Performance 77 → 99점",
          ],
        },
      ],
    },
  },
  {
    id: 2,
    title: "Eat the Weather",
    description:
      "사용자 체질 정보와 실시간 날씨 데이터를 기반으로 지역별 날씨 게시판을 제공하는 웹 서비스",
    tech: ["React", "TypeScript", "Next.js", "Supabase"],
    thumbnail: "/images/eatTheWeather/잇더웨더Home.png",
    detail: {
      period: "2025. 04 (1개월)",
      team: "FULL STACK (3)",
      longDescription:
        "사용자 체질 정보와 실시간 날씨 데이터를 기반으로 지역별 날씨 게시판을 제공하는 웹 서비스입니다. 지역 기반 날씨 데이터를 전역 상태로 관리하고, 사용자 특성을 반영한 UI로 사용자 맞춤형 경험을 제공합니다.",
      roles: [
        {
          title: "날씨 페이지 및 메인 화면 기능, UI",
          description:
            "사용자 체질 정보 및 날씨 데이터와 Recharts를 활용한 화면 설계 및 구현",
        },
        {
          title: "게시물 삭제 및 댓글",
          description:
            "클린 아키텍처(application, domain, infra)를 바탕으로 코드 구현",
        },
      ],
      images: [
        "/images/eatTheWeather/잇더웨더Home.png",
        "/images/eatTheWeather/잇더웨더weather.png",
        "/images/eatTheWeather/잇더웨더weather시간.png",
      ],
      links: [
        { label: "GitHub", url: "https://github.com/1juyoung/Eat-The-Weather" },
      ],
      troubleshooting: [
        {
          title: "API Rate Limit 초과 및 렌더링 성능 저하",
          problem:
            "캐싱 없이 매 요청마다 동일 좌표(lat, lon)의 날씨 API를 호출하여 Rate Limit 초과와 응답 지연이 발생했습니다. 날씨 아이콘도 img 태그로 비동기 호출해 렌더링 순서 통제가 어려웠습니다.",
          solution:
            "TanStack Query로 좌표 기준 데이터를 캐싱하고 useMemo로 반복 연산을 최소화했습니다. 날씨 아이콘은 next/image로 전환해 로딩을 최적화했습니다.",
          metrics: [
            "Performance 78 → 100점",
            "TBT 510ms → 40ms",
            "JS 실행 1.8s → 0.4s",
          ],
        },
      ],
    },
  },
  {
    id: 3,
    title: "리뷰엉",
    description:
      "코드 업로드와 상호 리뷰를 통해 함께 학습하는 코드 리뷰 커뮤니티 웹 서비스입니다.",
    tech: ["React", "TypeScript", "Next.js", "PostgreSQL", "Prisma"],
    thumbnail: "/images/reviewong/리뷰엉-list.png",
    detail: {
      period: "2025. 05 (1개월)",
      team: "FULL STACK (3)",
      longDescription:
        "리뷰엉은 코드를 공유하고 피드백을 주고받으며 함께 성장하는 코드 리뷰 커뮤니티 웹 서비스입니다. 리뷰를 작성한 사용자에게만 다른 리뷰를 열람할 수 있도록 설계해, 능동적인 참여와 학습 몰입을 유도했습니다.",
      roles: [
        {
          title: "코드 목록 페이지 UI 및 기능",
          description: "카테고리 기반 필터링, 코드 카드 UI 구성",
        },
        {
          title: "리뷰 작성 및 조회 기능",
          description:
            "리뷰 작성 여부에 따른 리뷰 열람 권한 제어 및 조건부 렌더링 구현",
        },
        {
          title: "좋아요 기능",
          description:
            "용자가 리뷰에 좋아요를 남기면 실시간 UI 반영 + 서버 상태 동기화",
        },
      ],
      images: [
        "/images/reviewong/reviewong-list.png",
        "/images/reviewong/reviewong-review.png",
      ],
      links: [
        { label: "GitHub", url: "https://github.com/1juyoung/reviewong" },
      ],
      troubleshooting: [
        {
          title: "App Router 환경에서 세션 조회 불가",
          problem:
            "useSession()은 클라이언트 전용 훅으로, 서버 컴포넌트에서 호출 시 세션이 null로 반환되어 \n인증 의존 로직이 동작하지 않았습니다.",
          solution:
            "getServerSession()으로 교체해 App Router 서버 환경에서도 안정적으로\n세션을 조회할 수 있도록 구조를 개선했습니다.",
        },
        {
          title: "좋아요 중복 요청 및 UI 불일치",
          problem:
            "빠르게 클릭 시 API 요청이 중복 발생하고, UI 상태와 서버 상태가 불일치하는 문제가 발생했습니다.",
          solution:
            "낙관적 업데이트를 적용해 즉각적인 UI 반응성을 확보하고, 요청 완료 전 추가 클릭을 차단해\n중복 요청을 방지했습니다.",
        },
      ],
    },
  },
];
