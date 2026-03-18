# 독수르

codeit sprint 중급 프로젝트 part3 - team2

[협업 노션 링크](https://youngbase.notion.site/docthru?source=copy_link)

## 백엔드 레포입니다. 세팅 진행 중...

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
    ├─ common
    │  ├─ constants
    │  ├─ di
    │  ├─ exceptions
    │  └─ lifecycle
    ├─ config
    │  └─ config.js
    ├─ controllers
    ├─ db
    ├─ middlewares
    ├─ providers
    ├─ repository
    └─ services


```

---

### 참고문헌

[1] https://github.com/winverse/codeit-fs-layered-architecture
[2] https://github.com/winverse/codeit-fs-layered-architecture-starter
