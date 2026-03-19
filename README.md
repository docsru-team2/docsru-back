# 독수르

codeit sprint 중급 프로젝트 part3 - team2

[협업 노션 링크](https://youngbase.notion.site/docthru?source=copy_link)

### 백엔드 레포입니다. 세팅 완료..! 핑이 잘 찍혀요~ (그런데 일부 파일은 껍데기만 있답니다... 열심히 채워야 해요!)

### 디렉토리 구조 [1](https://github.com/winverse/codeit-fs-layered-architecture) [2](https://github.com/winverse/codeit-fs-layered-architecture-starter)

```
├── README.md                 # 프로젝트 개요 및 구조 설명 파일
├── env/                      # 환경 변수 파일 (.env) 디렉토리
├── .gitignore                # gitignore 설정 파일
├── .prettierrc               # prettier 설정 파일
├── eslint.config.js          # ESLint 설정 파일
├── jsconfig.json             # JavaScript 설정 (절대 경로 alias 등)
├── package.json              # 패키지 정보 및 스크립트
├── prisma/                   # Prisma 관련 설정 및 스키마
│   └── schema.prisma         # 데이터베이스 모델 정의
├── prisma.config.js          # Prisma 추가 설정
├── scripts/                  # 유틸리티 스크립트 (시드 데이터 등)
└── src/                      # 애플리케이션 메인 소스코드
    ├─ app.js                 # Express 설정 및 미들웨어/라우터 조립
    ├─ main.js                # 서버 진입
    ├─ common                 # 공통 모듈
    │  ├─ constants           # 상수 관리
    │  │  ├─ errors.js
    │  │  ├─ http-status.js
    │  │  ├─ index.js
    │  │  └─ time.js
    │  ├─ di                            # 의존성 주입 컨테이너 설정
    │  │  └─ container.js
    │  ├─ exceptions                    # 커스텀 에러 예외처리
    │  │  ├─ bad-request.exception.js
    │  │  ├─ conflict.exception.js
    │  │  ├─ forbidden.exception.js
    │  │  ├─ http.exception.js
    │  │  ├─ index.js    
    │  │  ├─ not-found.exception.js
    │  │  └─ unauthorized.exception.js
    │  └─ lifecycle                     # 서버 종료 관리
    │     └─ graceful-shutdown.js
    ├─ config                           # 환경 변수 및 설정값 관리
    │  └─ config.js
    ├─ controllers                      # API req 수신, res 반환 (라우팅)
    │  ├─ admin
    │  ├─ auth
    │  ├─ challenge
    │  ├─ notification
    │  ├─ submission
    │  ├─ user
    │  ├─ base.controller.js
    │  └─ index.js
    ├─ db                               # 데이터베이스 연결 관리
    │  └─ prisma.js
    ├─ middlewares                      # 미들웨어
    │  ├─ auth.middleware.js
    │  ├─ authorization.middleware.js
    │  ├─ cors.middleware.js
    │  ├─ error-handler.middleware.js
    │  ├─ index.js
    │  └─ validation.middleware.js
    ├─ providers                        # 유틸리티
    │  ├─ cookie.provider.js
    │  ├─ index.js
    │  ├─ password.provider.js
    │  └─ token.provider.js
    ├─ repository                       # 레포지토리(DB 접근)
    │  ├─ challenge.repository.js
    │  ├─ index.js
    │  ├─ notification.repository.js
    │  ├─ submission.repository.js
    │  └─ user.repository.js
    └─ services                         # 핵심 로직들
       ├─ admin.service.js
       ├─ auth.service.js
       ├─ challenge.service.js
       ├─ index.js
       ├─ notification.service.js
       ├─ submission.service.js
       └─ user.service.js


```

---

### 참고문헌

[1] https://github.com/winverse/codeit-fs-layered-architecture </br>
[2] https://github.com/winverse/codeit-fs-layered-architecture-starter
