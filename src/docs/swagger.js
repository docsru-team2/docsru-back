import swaggerUi from 'swagger-ui-express';
import { authPaths } from './paths/auth.paths.js';
import { userPaths } from './paths/user.paths.js';
import { challengePaths } from './paths/challenge.paths.js';
import { adminPaths } from './paths/admin.paths.js';

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
  tags: [
    { name: 'Health', description: '서버 상태 확인' },
    { name: 'Auth', description: '인증 (회원가입, 로그인, 소셜 로그인)' },
    { name: 'User', description: '유저 관리' },
    { name: 'Challenge', description: '챌린지 관리' },
    { name: 'Admin', description: '관리자 기능' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '01HXYZ...' },
          email: { type: 'string', example: 'user@example.com' },
          nickname: { type: 'string', example: '닉네임' },
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
          sourceUrl: { type: 'string', format: 'uri' },
          field: { type: 'string', enum: ['NEXT_JS', 'MODERN_JS', 'WEB', 'ETC'] },
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
          message: { type: 'string', example: '오류 메시지' },
          code: { type: 'string', example: 'ERROR_CODE' },
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
                    message: { type: 'string', example: '현재 시간: 2026-03-26 17:00:00' },
                  },
                },
              },
            },
          },
        },
      },
    },
    ...authPaths,
    ...userPaths,
    ...challengePaths,
    ...adminPaths,
  },
};

export function registerSwagger(app) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  console.log('Swagger UI: http://localhost:5001/api-docs');
}
