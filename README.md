# 독수르

codeit sprint 중급 프로젝트 part3 - team2

[협업 노션 링크](https://youngbase.notion.site/docthru?source=copy_link)

### 진행상황

- (26.3.19.) 백엔드 레포입니다. 세팅 완료..! 핑이 잘 찍혀요~ (그런데 일부 파일은 껍데기만 있답니다... 열심히 채워야 해요!)
- (26.3.25.) 로그인 기능 구현
- (26.3.26.) ~api 작업 진행중~ (/auth, /user, /Challenges, /admin 완료)

#### [🌟백엔드 서버 구동 에러 발생 시 가이드](#백엔드-서버-구동-에러-시-트러블슈팅-가이드)

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
    │  │  ├─ order.js
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
    ├─ docs                             # swagger 문서 등
    │  └─ swagger.js
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
    │  ├─ challengeParticipant.repository.js
    │  ├─ draft.repository.js
    │  ├─ feedback.repository.js
    │  ├─ index.js
    │  ├─ notification.repository.js
    │  ├─ submission.repository.js
    │  ├─ submissionLike.repository.js
    │  └─ user.repository.js
    └─ services                         # 핵심 로직들
       ├─ admin.service.js
       ├─ auth.service.js
       ├─ challenge.service.js
       ├─ index.js
       ├─ notification.service.js
       ├─ social-auth.service.js
       ├─ submission.service.js
       └─ user.service.js


```

## 백엔드 서버 구동 에러 시 트러블슈팅 가이드

**요약**

1. 라이브러리 확인
2. 환경변수 확인
3. 프리즈마 스키마 동기화 확인
4. pnpm run seed
5. 에러메세지 캡처||복붙해서 공유하기

서버가 정상적으로 실행되지 않거나 뭔가 아무튼 안 될 경우, 아래 단계를 순서대로 진행해 주세요!

**0단계: git pull❗❗❗**

**1단계: 최신 라이브러리 설치**

⚠️` code: 'ERR_MODULE_NOT_FOUND'` 발생 시!!!!!

- `pnpm install`을 실행해 주세요.
  - `jsonwebtoken`, `bcrypt`, `cookie-parser` 외 여러 사람들의 패키지를 한번에 받을 수 있습니다..

**2단계: 환경변수(`.env`) 재확인**

- `.env.development` 파일에 `JWT_SECRET` 값이 설정되어 있는지 확인해 주세요.
- `DATABASE_URL` 연결 정보가 본인의 환경과 맞는지 다시 확인 부탁드립니다.
  - 로컬 DB → DB명, username, password, localhost 포트번호 등 로컬 환경과 맞는지 확인
  - 공유 DB → 팀장님이 공유해주신 공유DB URL 확인

**3단계: 프리즈마 스키마 동기화**

- `pnpm run prisma:generate`를 실행해야 변경된 스키마가 코드에 반영됩니다!
- `pnpm run prisma:migrate`

**4단계: DB 시딩 다시 진행(로컬 DB 이용 시 필수)** 🌱

- `npm run seed`를 실행해 주세요.

**5단계: 에러 공유**

- 위 단계를 모두 진행했는데도 에러가 발생하는 경우
  → 터미널의 **에러 메시지 전체**를 캡처 또는 복붙해서 제보해주시면 얼른 고쳐보겠습니다! ~~400대 에러 안 받아요~~

---

### 참고문헌

[1] https://github.com/winverse/codeit-fs-layered-architecture </br>
[2] https://github.com/winverse/codeit-fs-layered-architecture-starter
