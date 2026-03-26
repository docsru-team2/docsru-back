const adminIdParam = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'string' },
  description: '리소스 ULID',
};

export const adminPaths = {
  '/admin/challenges': {
    get: {
      tags: ['Admin'],
      summary: '챌린지 목록 조회 (관리자)',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'page',
          in: 'query',
          schema: { type: 'integer', default: 1 },
          description: '페이지 번호',
        },
        {
          name: 'limit',
          in: 'query',
          schema: { type: 'integer', default: 10 },
          description: '페이지당 항목 수',
        },
        {
          name: 'sort',
          in: 'query',
          schema: { type: 'string' },
          description: '정렬 기준',
        },
        {
          name: 'keyword',
          in: 'query',
          schema: { type: 'string' },
          description: '검색 키워드',
        },
        {
          name: 'reviewStatus',
          in: 'query',
          schema: {
            type: 'string',
            enum: ['PENDING', 'APPROVED', 'REJECTED', 'DELETED'],
          },
          description: '심사 상태 필터',
        },
      ],
      responses: {
        200: {
          description: '챌린지 목록',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Challenge' },
                  },
                  total: { type: 'integer' },
                  page: { type: 'integer' },
                  limit: { type: 'integer' },
                },
              },
            },
          },
        },
        401: {
          description: '인증 필요',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },

  '/admin/challenges/{id}': {
    get: {
      tags: ['Admin'],
      summary: '챌린지 상세 조회 (관리자)',
      security: [{ bearerAuth: [] }],
      parameters: [adminIdParam],
      responses: {
        200: {
          description: '챌린지 상세',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Challenge' },
            },
          },
        },
        401: {
          description: '인증 필요',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        404: {
          description: '챌린지 없음',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
    patch: {
      tags: ['Admin'],
      summary: '챌린지 수정 (관리자)',
      security: [{ bearerAuth: [] }],
      parameters: [adminIdParam],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                sourceUrl: { type: 'string', format: 'uri' },
                field: {
                  type: 'string',
                  enum: ['NEXT_JS', 'MODERN_JS', 'WEB', 'ETC'],
                },
                documentType: {
                  type: 'string',
                  enum: ['OFFICIAL_DOC', 'BLOG', 'BOOK', 'ETC'],
                },
                description: { type: 'string' },
                deadline: { type: 'string', format: 'date-time' },
                maxParticipants: { type: 'integer' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: '챌린지 수정 성공',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Challenge' },
            },
          },
        },
        401: {
          description: '인증 필요',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        404: {
          description: '챌린지 없음',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },

  '/admin/challenges/{id}/approve': {
    patch: {
      tags: ['Admin'],
      summary: '챌린지 승인 (관리자)',
      security: [{ bearerAuth: [] }],
      parameters: [adminIdParam],
      responses: {
        200: {
          description: '챌린지 승인 성공',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Challenge' },
            },
          },
        },
        401: {
          description: '인증 필요',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        404: {
          description: '챌린지 없음',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },

  '/admin/challenges/{id}/reject': {
    patch: {
      tags: ['Admin'],
      summary: '챌린지 거절 (관리자)',
      security: [{ bearerAuth: [] }],
      parameters: [adminIdParam],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                rejectReason: {
                  type: 'string',
                  example: '챌린지 내용이 부적절합니다.',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: '챌린지 거절 성공',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Challenge' },
            },
          },
        },
        401: {
          description: '인증 필요',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        404: {
          description: '챌린지 없음',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },

  '/admin/challenges/{id}/delete': {
    patch: {
      tags: ['Admin'],
      summary: '챌린지 삭제 - Soft Delete (관리자)',
      description: '실제 삭제가 아닌 reviewStatus를 DELETED로 변경합니다.',
      security: [{ bearerAuth: [] }],
      parameters: [adminIdParam],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                deleteReason: { type: 'string', example: '운영 정책 위반' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: '챌린지 삭제 성공',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Challenge' },
            },
          },
        },
        401: {
          description: '인증 필요',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        404: {
          description: '챌린지 없음',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },

  '/admin/submissions/{id}': {
    patch: {
      tags: ['Admin'],
      summary: '작업물 수정 (관리자)',
      security: [{ bearerAuth: [] }],
      parameters: [adminIdParam],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              description: '수정할 작업물 필드',
            },
          },
        },
      },
      responses: {
        200: { description: '작업물 수정 성공' },
        401: {
          description: '인증 필요',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        404: {
          description: '작업물 없음',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },

  '/admin/submissions/{id}/delete': {
    patch: {
      tags: ['Admin'],
      summary: '작업물 삭제 - Soft Delete (관리자)',
      security: [{ bearerAuth: [] }],
      parameters: [adminIdParam],
      responses: {
        204: { description: '작업물 삭제 성공' },
        401: {
          description: '인증 필요',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        404: {
          description: '작업물 없음',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },

  '/admin/feedbacks/{id}': {
    delete: {
      tags: ['Admin'],
      summary: '피드백 삭제 (관리자)',
      security: [{ bearerAuth: [] }],
      parameters: [adminIdParam],
      responses: {
        204: { description: '피드백 삭제 성공' },
        401: {
          description: '인증 필요',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        404: {
          description: '피드백 없음',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },
};
