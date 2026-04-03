const feedbackIdParam = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'string' },
  description: '피드백 ULID',
};

export const feedbackPaths = {
  '/feedbacks/{id}': {
    patch: {
      tags: ['Feedback'],
      summary: '피드백 수정',
      description: '피드백 작성자만 수정 가능합니다.',
      security: [{ bearerAuth: [] }],
      parameters: [feedbackIdParam],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['content'],
              properties: {
                content: { type: 'string', example: '수정된 피드백 내용입니다.' },
              },
            },
          },
        },
      },
      responses: {
        200: { description: '피드백 수정 성공' },
        401: { description: '인증 필요', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        403: { description: '권한 없음', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        404: { description: '피드백 없음', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
    delete: {
      tags: ['Feedback'],
      summary: '피드백 삭제',
      description: '피드백 작성자만 삭제 가능합니다.',
      security: [{ bearerAuth: [] }],
      parameters: [feedbackIdParam],
      responses: {
        200: { description: '피드백 삭제 성공' },
        401: { description: '인증 필요', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        403: { description: '권한 없음', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        404: { description: '피드백 없음', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
};
