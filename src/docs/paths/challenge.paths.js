const challengeIdParam = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'string' },
  description: '챌린지 ULID',
};

const baseQueryParams = [
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
    name: 'orderBy',
    in: 'query',
    schema: {
      type: 'string',
      enum: ['CREATED_DESC', 'CREATED_ASC', 'DEADLINE_ASC', 'DEADLINE_DESC'],
      default: 'CREATED_DESC',
    },
    description: '정렬 기준',
  },
  {
    name: 'keyword',
    in: 'query',
    schema: { type: 'string' },
    description: '제목 검색 키워드',
  },
  {
    name: 'field',
    in: 'query',
    schema: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['NEXT_JS', 'MODERN_JS', 'API', 'WEB', 'CAREER', 'ETC'],
      },
    },
    style: 'form',
    explode: true,
    description: '기술 분야 필터 (복수 선택 가능)',
  },
  {
    name: 'documentType',
    in: 'query',
    schema: {
      type: 'string',
      enum: ['OFFICIAL_DOC', 'BLOG', 'BOOK', 'ETC'],
    },
    description: '문서 유형 필터',
  },
];

// GET /challenges - reviewStatus, progressStatus 포함
const challengeListQueryParams = [
  ...baseQueryParams,
  {
    name: 'reviewStatus',
    in: 'query',
    schema: {
      type: 'string',
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'DELETED'],
    },
    description: '심사 상태 필터 (일반 유저는 항상 APPROVED 고정)',
  },
  {
    name: 'progressStatus',
    in: 'query',
    schema: {
      type: 'string',
      enum: ['OPEN', 'CLOSED'],
    },
    description: '진행 상태 필터',
  },
];

// GET /challenges/me/applied - 내가 생성한 챌린지 (creatorId 기준)
const myAppliedQueryParams = [
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
    name: 'keyword',
    in: 'query',
    schema: { type: 'string' },
    description: '제목 검색 키워드',
  },
  {
    name: 'reviewStatus',
    in: 'query',
    schema: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'DELETED'] },
    description: '심사 상태 필터',
  },
  {
    name: 'orderBy',
    in: 'query',
    schema: {
      type: 'string',
      enum: ['CREATED_DESC', 'CREATED_ASC', 'DEADLINE_ASC', 'DEADLINE_DESC'],
      default: 'CREATED_DESC',
    },
    description: '정렬 기준',
  },
];

// GET /challenges/joined - 내가 참여한 챌린지 (participant 기준)
const myJoinedQueryParams = [
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
    name: 'keyword',
    in: 'query',
    schema: { type: 'string' },
    description: '제목 검색 키워드',
  },
  {
    name: 'progressStatus',
    in: 'query',
    required: true,
    schema: { type: 'string', enum: ['OPEN', 'CLOSED'] },
    description: 'OPEN: 참여 중인 챌린지 / CLOSED: 서브미션이 있는 완료된 챌린지',
  },
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
              required: [
                'title',
                'sourceUrl',
                'field',
                'documentType',
                'description',
                'deadline',
                'maxParticipants',
              ],
              properties: {
                title: {
                  type: 'string',
                  example: '모던 JavaScript 튜토리얼 완독',
                },
                sourceUrl: {
                  type: 'string',
                  format: 'uri',
                  example: 'https://javascript.info',
                },
                field: {
                  type: 'string',
                  enum: ['NEXT_JS', 'MODERN_JS', 'API', 'WEB', 'CAREER', 'ETC'],
                },
                documentType: {
                  type: 'string',
                  enum: ['OFFICIAL_DOC', 'BLOG', 'BOOK', 'ETC'],
                },
                description: { type: 'string', example: '챌린지 설명입니다.' },
                deadline: {
                  type: 'string',
                  format: 'date-time',
                  example: '2026-06-30T23:59:59Z',
                },
                maxParticipants: { type: 'integer', example: 10 },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: '챌린지 신청 성공',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Challenge' },
            },
          },
        },
        400: {
          description: '유효성 검증 실패',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
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

  '/challenges/{id}': {
    get: {
      tags: ['Challenge'],
      summary: '챌린지 상세 조회',
      security: [{ bearerAuth: [] }],
      parameters: [challengeIdParam],
      responses: {
        200: {
          description: '챌린지 상세',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Challenge' },
            },
          },
        },
        400: {
          description: '잘못된 ID 형식',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
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
                field: {
                  type: 'string',
                  enum: ['NEXT_JS', 'MODERN_JS', 'API', 'WEB', 'CAREER', 'ETC'],
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
        400: {
          description: '유효성 검증 실패',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
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
        403: {
          description: '권한 없음 (생성자만 수정 가능)',
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
    delete: {
      tags: ['Challenge'],
      summary: '챌린지 삭제',
      description: '챌린지 생성자만 삭제 가능합니다.',
      security: [{ bearerAuth: [] }],
      parameters: [challengeIdParam],
      responses: {
        204: { description: '챌린지 삭제 성공' },
        401: {
          description: '인증 필요',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
        403: {
          description: '권한 없음 (생성자만 삭제 가능)',
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
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/User' },
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
    post: {
      tags: ['Challenge'],
      summary: '챌린지 참여',
      security: [{ bearerAuth: [] }],
      parameters: [challengeIdParam],
      responses: {
        201: { description: '참여 성공' },
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
        409: {
          description: '이미 참여 중',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' },
            },
          },
        },
      },
    },
  },

  '/challenges/me/applied': {
    get: {
      tags: ['Challenge'],
      summary: '내가 생성한 챌린지 목록',
      description: '내가 신청(생성)한 챌린지 목록. keyword, reviewStatus, orderBy로 필터링 가능.',
      security: [{ bearerAuth: [] }],
      parameters: myAppliedQueryParams,
      responses: {
        200: {
          description: '내가 생성한 챌린지 목록',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  list: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Challenge' },
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

  '/challenges/joined': {
    get: {
      tags: ['Challenge'],
      summary: '내가 참여한 챌린지 목록',
      description:
        'progressStatus=OPEN: 참여 중인 챌린지 / progressStatus=CLOSED: 서브미션이 있는 완료된 챌린지',
      security: [{ bearerAuth: [] }],
      parameters: myJoinedQueryParams,
      responses: {
        200: {
          description: '참여한 챌린지 목록',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  list: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Challenge' },
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
};
