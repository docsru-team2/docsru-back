const notificationIdParam = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'string' },
  description: '알림 ULID',
};

export const notificationPaths = {
  '/notifications/stream': {
    get: {
      tags: ['Notification'],
      summary: 'SSE 알림 스트림 연결',
      description: 'Server-Sent Events로 실시간 알림을 수신합니다. credentials 포함 필요.',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'SSE 스트림 연결 성공 (text/event-stream)' },
        401: { description: '인증 필요', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/notifications': {
    get: {
      tags: ['Notification'],
      summary: '알림 목록 조회',
      security: [{ bearerAuth: [] }],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: '페이지 번호' },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 }, description: '페이지당 항목 수' },
      ],
      responses: {
        200: {
          description: '알림 목록',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  list: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        type: { type: 'string', enum: ['CHALLENGE_ADMIN_APPROVED', 'CHALLENGE_ADMIN_REJECTED', 'SUBMISSION_LIKED', 'FEEDBACK_CREATED'] },
                        content: { type: 'string' },
                        isRead: { type: 'boolean' },
                        targetId: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                      },
                    },
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      totalCount: { type: 'integer' },
                      hasNext: { type: 'boolean' },
                    },
                  },
                },
              },
            },
          },
        },
        401: { description: '인증 필요', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/notifications/read-all': {
    patch: {
      tags: ['Notification'],
      summary: '알림 전체 읽음 처리',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: '전체 읽음 처리 완료' },
        401: { description: '인증 필요', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/notifications/all': {
    delete: {
      tags: ['Notification'],
      summary: '알림 전체 삭제',
      security: [{ bearerAuth: [] }],
      responses: {
        204: { description: '전체 삭제 성공' },
        401: { description: '인증 필요', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/notifications/{id}': {
    get: {
      tags: ['Notification'],
      summary: '알림 단일 조회',
      security: [{ bearerAuth: [] }],
      parameters: [notificationIdParam],
      responses: {
        200: { description: '알림 상세' },
        401: { description: '인증 필요', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        404: { description: '알림 없음', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
    patch: {
      tags: ['Notification'],
      summary: '알림 읽음 처리',
      security: [{ bearerAuth: [] }],
      parameters: [notificationIdParam],
      responses: {
        200: { description: '읽음 처리 성공' },
        401: { description: '인증 필요', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        404: { description: '알림 없음', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
    delete: {
      tags: ['Notification'],
      summary: '알림 단일 삭제',
      security: [{ bearerAuth: [] }],
      parameters: [notificationIdParam],
      responses: {
        204: { description: '삭제 성공' },
        401: { description: '인증 필요', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        404: { description: '알림 없음', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
};
