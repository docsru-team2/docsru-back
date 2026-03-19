import { z } from 'zod';

// ID 파라미터 검증 스키마
export const idParamSchema = z.object({
  id: z.ulid({
    message: '데이터 식별 오류',
  }),
});

// 챌린지 생성 스키마
export const createChallengeSchema = z.object({
  title: z.string(),
  sourceUrl: z.url(),
  field: z.enum(['NEXT_JS', 'MODERN_JS', 'WEB', 'ETC']),
  documentType: z.enum(['OFFICIAL_DOC', 'BLOG', 'BOOK', 'ETC']),
});
