const challengeIdParam = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'string' },
  description: '챌린지 ULID',
};

const challengeListQueryParams = [
  { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: '페이지 번호' },
  { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: '페이지당 항목 수' },
  { name: 'sort', in: 'query', schema: { type: 'string' }, description: '정렬 기준' },
  { name: 'keyword', in: 'query', schema: { type: 'string' }, description: '검색 키워드' },
  { name: 'reviewStatus', in: 'query', schema: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'DELETED'] }, description: '심사 상태 필터' },
];

export const challengePaths = {
  '/challenges': {
    get: {
      tags: ['Challenge'],
      summary: '챌린지 목록 조회',
      security: [{ bearerAuth: [] }],
      parameters: challengeListQueryParams,
      responses: {
        200: {
          description: '챌린지 목록',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: { type: 'array', items: { $ref: '#/components/schemas/Challenge' } },
                  total: { type: 'integer' },
                  page: { type: 'integer' },
                  limit: { type: 'integer' },
                },
              },
            },
          },
        },
        401: { description: '인증 필요', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
    post: {
      tags: ['Challenge'],
      summary: '챌린지 신청',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['title', 'sourceUrl', 'field', 'documentType', 'description', 'deadline', 'maxParticipants'],
              properties: {
                title: { type: 'string', example: '모던 JavaScript 튜토리얼 완독' },
                sourceUrl: { type: 'string', format: 'uri', example: 'https://javascript.info' },
                field: { type: 'string', enum: ['NEXT_JS', 'MODERN_JS', 'WEB', 'ETC'] },
                documentType: { type: 'string', enum: ['OFFICIAL_DOC', 'BLOG', 'BOOK', 'ETC'] },
                description: { type: 'string', example: '챌린지 설명입니다.' },
                deadline: { type: 'string', format: 'date-time', example: '2026-06-30T23:59:59Z' },
                maxParticipants: { type: 'integer', example: 10 },
              },
            },
          },
        },
      },
      responses: {
        201: { description: '챌린지 신청 성공', content: { 'application/json': { schema: { $ref: '#/components/schemas/Challenge' } } } },
        400: { description: '유효성 검증 실패', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        401: { description: '인증 필요', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/challenges/{id}': {
    get: {
      tags: ['Challenge'],
      summary: '챌린지 상세 조회',
      security: [{ bearerAuth: [] }],
      parameters: [challengeIdParam],
      responses: {
        200: { description: '챌린지 상세', content: { 'application/json': { schema: { $ref: '#/components/schemas/Challenge' } } } },
        400: { description: '잘못된 ID 형식', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        401: { description: '인증 필요', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        404: { description: '챌린지 없음', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
    patch: {
      tags: ['Challenge'],
      summary: '챌린지 수정',
      description: '챌린지 생성자만 수정 가능합니다.',
      security: [{ bearerAuth: [] }],
      parameters: [challengeIdParam],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                title: { type: 'string', example: '수정된 챌린지 제목' },
                sourceUrl: { type: 'string', format: 'uri' },
                field: { type: 'string', enum: ['NEXT_JS', 'MODERN_JS', 'WEB', 'ETC'] },
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
        200: { description: '챌린지 수정 성공', content: { 'application/json': { schema: { $ref: '#/components/schemas/Challenge' } } } },
        400: { description: '유효성 검증 실패', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        401: { description: '인증 필요', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        403: { description: '권한 없음 (생성자만 수정 가능)', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        404: { description: '챌린지 없음', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
    delete: {
      tags: ['Challenge'],
      summary: '챌린지 삭제',
      description: '챌린지 생성자만 삭제 가능합니다.',
      security: [{ bearerAuth: [] }],
      parameters: [challengeIdParam],
      responses: {
        204: { description: '챌린지 삭제 성공' },
        401: { description: '인증 필요', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        403: { description: '권한 없음 (생성자만 삭제 가능)', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        404: { description: '챌린지 없음', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/challenges/{id}/participants': {
    get: {
      tags: ['Challenge'],
      summary: '챌린지 참가자 목록 조회',
      security: [{ bearerAuth: [] }],
      parameters: [challengeIdParam],
      responses: {
        200: {
          description: '참가자 목록',
          content: {
            'application/json': {
              schema: { type: 'array', items: { $ref: '#/components/schemas/User' } },
            },
          },
        },
        401: { description: '인증 필요', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        404: { description: '챌린지 없음', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
    post: {
      tags: ['Challenge'],
      summary: '챌린지 참여',
      security: [{ bearerAuth: [] }],
      parameters: [challengeIdParam],
      responses: {
        201: { description: '참여 성공' },
        401: { description: '인증 필요', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        404: { description: '챌린지 없음', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        409: { description: '이미 참여 중', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/challenges/me/applied': {
    get: {
      tags: ['Challenge'],
      summary: '내가 신청한 챌린지 목록',
      security: [{ bearerAuth: [] }],
      parameters: challengeListQueryParams,
      responses: {
        200: {
          description: '내가 신청한 챌린지 목록',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: { type: 'array', items: { $ref: '#/components/schemas/Challenge' } },
                  total: { type: 'integer' },
                  page: { type: 'integer' },
                  limit: { type: 'integer' },
                },
              },
            },
          },
        },
        401: { description: '인증 필요', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/challenges/me/ongoing': {
    get: {
      tags: ['Challenge'],
      summary: '내가 진행 중인 챌린지 목록',
      description: '참여 중이며 progressStatus가 OPEN인 챌린지 목록을 반환합니다.',
      security: [{ bearerAuth: [] }],
      parameters: challengeListQueryParams,
      responses: {
        200: {
          description: '진행 중인 챌린지 목록',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: { type: 'array', items: { $ref: '#/components/schemas/Challenge' } },
                  total: { type: 'integer' },
                  page: { type: 'integer' },
                  limit: { type: 'integer' },
                },
              },
            },
          },
        },
        401: { description: '인증 필요', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/challenges/me/completed': {
    get: {
      tags: ['Challenge'],
      summary: '내가 완료한 챌린지 목록',
      description: '참여 중이며 progressStatus가 CLOSED인 챌린지 목록을 반환합니다.',
      security: [{ bearerAuth: [] }],
      parameters: challengeListQueryParams,
      responses: {
        200: {
          description: '완료한 챌린지 목록',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: { type: 'array', items: { $ref: '#/components/schemas/Challenge' } },
                  total: { type: 'integer' },
                  page: { type: 'integer' },
                  limit: { type: 'integer' },
                },
              },
            },
          },
        },
        401: { description: '인증 필요', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
};
