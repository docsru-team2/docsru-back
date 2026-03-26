export const authPaths = {
  '/auth/sign-up': {
    post: {
      tags: ['Auth'],
      summary: '일반 회원가입',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password', 'nickname'],
              properties: {
                email: { type: 'string', format: 'email', example: 'user@example.com' },
                password: { type: 'string', example: 'Test1234!', description: '영문, 숫자, 특수문자 포함 8자 이상' },
                nickname: { type: 'string', example: '닉네임', description: '2자 이상' },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: '회원가입 성공 (쿠키에 accessToken, refreshToken 설정)',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  user: { $ref: '#/components/schemas/User' },
                  accessToken: { type: 'string' },
                },
              },
            },
          },
        },
        400: { description: '유효성 검증 실패', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        409: { description: '이메일 중복', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/auth/sign-in': {
    post: {
      tags: ['Auth'],
      summary: '일반 로그인',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', format: 'email', example: 'user@example.com' },
                password: { type: 'string', example: 'Test1234!' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: '로그인 성공 (쿠키에 accessToken, refreshToken 설정)',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  user: { $ref: '#/components/schemas/User' },
                  accessToken: { type: 'string' },
                },
              },
            },
          },
        },
        400: { description: '유효성 검증 실패', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        401: { description: '이메일 또는 비밀번호 불일치', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/auth/logout': {
    post: {
      tags: ['Auth'],
      summary: '로그아웃',
      description: '쿠키의 accessToken, refreshToken을 삭제합니다.',
      responses: {
        204: { description: '로그아웃 성공' },
      },
    },
  },

  '/auth/me': {
    get: {
      tags: ['Auth'],
      summary: '내 정보 조회',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: '내 정보', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
        401: { description: '인증 필요', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/auth/social/{provider}/sign-in': {
    get: {
      tags: ['Auth'],
      summary: '소셜 로그인 페이지 리다이렉트',
      description: '소셜 로그인 제공자(google)의 OAuth 페이지로 리다이렉트합니다.',
      parameters: [
        {
          name: 'provider',
          in: 'path',
          required: true,
          schema: { type: 'string', enum: ['google'] },
          description: '소셜 로그인 제공자',
        },
        {
          name: 'next',
          in: 'query',
          required: false,
          schema: { type: 'string', default: '/', example: '/dashboard' },
          description: '로그인 후 리다이렉트될 경로',
        },
      ],
      responses: {
        302: { description: '소셜 로그인 페이지로 리다이렉트' },
        400: { description: '지원하지 않는 소셜 제공자', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/auth/social/callback/{provider}': {
    get: {
      tags: ['Auth'],
      summary: '소셜 로그인 콜백',
      description: '소셜 로그인 후 인가 코드를 받아 로그인/회원가입 처리 후 클라이언트로 리다이렉트합니다.',
      parameters: [
        {
          name: 'provider',
          in: 'path',
          required: true,
          schema: { type: 'string', enum: ['google'] },
          description: '소셜 로그인 제공자',
        },
        {
          name: 'code',
          in: 'query',
          required: true,
          schema: { type: 'string' },
          description: 'OAuth 인가 코드',
        },
        {
          name: 'state',
          in: 'query',
          required: false,
          schema: { type: 'string' },
          description: 'Base64URL 인코딩된 state (next 경로 포함)',
        },
      ],
      responses: {
        302: { description: '로그인 성공 후 클라이언트로 리다이렉트 (쿠키에 토큰 설정)' },
        400: { description: '인가 코드 없음', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
};
