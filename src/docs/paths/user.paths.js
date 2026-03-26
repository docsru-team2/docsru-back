export const userPaths = {
  '/users': {
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
        401: { description: '인증 필요', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
    post: {
      tags: ['User'],
      summary: '유저 생성',
      security: [{ cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', format: 'email', example: 'user@example.com' },
                password: { type: 'string', example: 'Test1234!', description: '영문, 숫자, 특수문자 포함 8자 이상' },
                nickname: { type: 'string', example: '닉네임', description: '2자 이상 (선택)' },
              },
            },
          },
        },
      },
      responses: {
        201: { description: '유저 생성 성공', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
        400: { description: '유효성 검증 실패', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        401: { description: '인증 필요', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },

  '/users/{id}': {
    get: {
      tags: ['User'],
      summary: '유저 상세 조회',
      security: [{ cookieAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'string' },
          description: '유저 ULID',
        },
      ],
      responses: {
        200: { description: '유저 정보', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
        400: { description: '잘못된 ID 형식', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        401: { description: '인증 필요', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        404: { description: '유저 없음', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
      },
    },
  },
};
