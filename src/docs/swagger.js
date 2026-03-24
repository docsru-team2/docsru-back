import swaggerUi from 'swagger-ui-express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Docsru API',
    version: '1.0.0',
    description: 'Docsru 백엔드 API 문서',
  },
  servers: [
    {
      url: 'http://localhost:5001/api',
      description: 'Local Development',
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'accessToken',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '01HXYZ...' },
          email: { type: 'string', example: 'user@example.com' },
          nickname: { type: 'string', example: 'user1' },
          provider: { type: 'string', enum: ['LOCAL', 'GOOGLE'] },
          userType: { type: 'string', enum: ['USER', 'ADMIN'] },
          grade: { type: 'string', enum: ['NORMAL', 'EXPERT'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Challenge: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          sourceUrl: { type: 'string' },
          field: { type: 'string', enum: ['NEXT_JS', 'MODERN_JS', 'API', 'WEB', 'CAREER', 'ETC'] },
          documentType: { type: 'string', enum: ['OFFICIAL_DOC', 'BLOG', 'BOOK', 'ETC'] },
          description: { type: 'string' },
          deadline: { type: 'string', format: 'date-time' },
          maxParticipants: { type: 'integer' },
          reviewStatus: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'DELETED'] },
          progressStatus: { type: 'string', enum: ['OPEN', 'CLOSED'], nullable: true },
          creatorId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/ping': {
      get: {
        tags: ['Health'],
        summary: '서버 상태 확인',
        responses: {
          200: {
            description: '서버 정상 작동',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string', example: '현재 시간: 2026-03-20 17:00:00' },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ── Auth ──────────────────────────────────────────
    '/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: '회원가입',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                  password: { type: 'string', example: 'Test1234!' },
                  name: { type: 'string', example: 'user1' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: '회원가입 성공', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          400: { description: '유효성 검증 실패', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          409: { description: '이메일 중복', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: '로그인',
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
          200: { description: '로그인 성공', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          400: { description: '유효성 검증 실패' },
          401: { description: '이메일 또는 비밀번호 불일치' },
        },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: '내 정보 조회',
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: '내 정보', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          401: { description: '인증 필요' },
        },
      },
    },

    // ── User ──────────────────────────────────────────
    '/user': {
      get: {
        tags: ['User'],
        summary: '전체 유저 목록 조회',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: '유저 목록',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/User' } },
              },
            },
          },
        },
      },
    },
    '/user/{id}': {
      get: {
        tags: ['User'],
        summary: '유저 상세 조회',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: '유저 정보', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          404: { description: '유저 없음' },
        },
      },
    },

    // ── Challenge ─────────────────────────────────────
    '/challenges': {
      get: {
        tags: ['Challenge'],
        summary: '챌린지 목록 조회',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: '챌린지 목록',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Challenge' } },
              },
            },
          },
        },
      },
      post: {
        tags: ['Challenge'],
        summary: '챌린지 신청',
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title', 'sourceUrl', 'field', 'documentType', 'description', 'deadline', 'maxParticipants'],
                properties: {
                  title: { type: 'string' },
                  sourceUrl: { type: 'string', format: 'uri' },
                  field: { type: 'string', enum: ['NEXT_JS', 'MODERN_JS', 'API', 'WEB', 'CAREER', 'ETC'] },
                  documentType: { type: 'string', enum: ['OFFICIAL_DOC', 'BLOG', 'BOOK', 'ETC'] },
                  description: { type: 'string' },
                  deadline: { type: 'string', format: 'date-time' },
                  maxParticipants: { type: 'integer' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: '챌린지 신청 성공', content: { 'application/json': { schema: { $ref: '#/components/schemas/Challenge' } } } },
          401: { description: '인증 필요' },
        },
      },
    },
    '/challenges/{id}': {
      get: {
        tags: ['Challenge'],
        summary: '챌린지 상세 조회',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: '챌린지 상세', content: { 'application/json': { schema: { $ref: '#/components/schemas/Challenge' } } } },
          404: { description: '챌린지 없음' },
        },
      },
    },
    '/challenges/{id}/participants': {
      post: {
        tags: ['Challenge'],
        summary: '챌린지 참여',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          201: { description: '참여 성공' },
          401: { description: '인증 필요' },
          409: { description: '이미 참여 중' },
        },
      },
    },

    // ── Admin ─────────────────────────────────────────
    '/admin': {
      get: {
        tags: ['Admin'],
        summary: '전체 유저 목록 조회 (관리자)',
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: '유저 목록',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/User' } },
              },
            },
          },
          401: { description: '인증 필요' },
        },
      },
    },
    '/admin/{id}': {
      get: {
        tags: ['Admin'],
        summary: '유저 상세 조회 (관리자)',
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: '유저 정보', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
          404: { description: '유저 없음' },
        },
      },
    },
  },
};

export function registerSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log('Swagger UI: http://localhost:5001/api-docs');
}
