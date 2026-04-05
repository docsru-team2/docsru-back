const submissionIdParam = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'string' },
  description: '작업물 ULID',
};

const submissionIdInPath = {
  name: 'submissionId',
  in: 'path',
  required: true,
  schema: { type: 'string' },
  description: '작업물 ULID',
};

export const submissionPaths = {
  '/submissions/{id}': {
    get: {
      tags: ['Submission'],
      summary: '작업물 상세 조회',
      security: [{ bearerAuth: [] }],
      parameters: [submissionIdParam],
      responses: {
        200: {
          description: '작업물 상세',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  data: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      title: { type: 'string' },
                      content: { type: 'string' },
                      challengeId: { type: 'string' },
                      userId: { type: 'string' },
                      isDeleted: { type: 'boolean' },
                      createdAt: { type: 'string', format: 'date-time' },
                      updatedAt: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: '인증 필요', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        404: { description: '작업물 없음', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
    patch: {
      tags: ['Submission'],
      summary: '작업물 수정',
      description: '작업물 작성자만 수정 가능합니다.',
      security: [{ bearerAuth: [] }],
      parameters: [submissionIdParam],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                title: { type: 'string', example: '수정된 작업물 제목' },
                content: { type: 'string', example: '수정된 내용입니다.' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: '작업물 수정 성공' },
        401: { description: '인증 필요', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        403: { description: '권한 없음', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        404: { description: '작업물 없음', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
    delete: {
      tags: ['Submission'],
      summary: '작업물 삭제 (소프트)',
      description: '작업물 작성자만 삭제 가능합니다.',
      security: [{ bearerAuth: [] }],
      parameters: [submissionIdParam],
      responses: {
        200: { description: '작업물 삭제 성공' },
        401: { description: '인증 필요', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        403: { description: '권한 없음', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        404: { description: '작업물 없음', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/submissions/{submissionId}/feedbacks': {
    get: {
      tags: ['Submission'],
      summary: '피드백 목록 조회',
      security: [{ bearerAuth: [] }],
      parameters: [
        submissionIdInPath,
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: '페이지 번호' },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 3 }, description: '페이지당 항목 수' },
        { name: 'orderBy', in: 'query', schema: { type: 'string', enum: ['CREATED_DESC', 'CREATED_ASC'] }, description: '정렬 기준' },
      ],
      responses: {
        200: { description: '피드백 목록' },
        401: { description: '인증 필요', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
    post: {
      tags: ['Submission'],
      summary: '피드백 생성',
      security: [{ bearerAuth: [] }],
      parameters: [submissionIdInPath],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['content'],
              properties: {
                content: { type: 'string', example: '좋은 번역이네요!' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: '피드백 생성 성공' },
        401: { description: '인증 필요', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/submissions/{submissionId}/likes': {
    post: {
      tags: ['Submission'],
      summary: '작업물 좋아요',
      security: [{ bearerAuth: [] }],
      parameters: [submissionIdInPath],
      responses: {
        201: { description: '좋아요 성공' },
        401: { description: '인증 필요', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        409: { description: '이미 좋아요한 작업물', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
    delete: {
      tags: ['Submission'],
      summary: '작업물 좋아요 취소',
      security: [{ bearerAuth: [] }],
      parameters: [submissionIdInPath],
      responses: {
        200: { description: '좋아요 취소 성공' },
        401: { description: '인증 필요', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        404: { description: '좋아요 없음', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
};
