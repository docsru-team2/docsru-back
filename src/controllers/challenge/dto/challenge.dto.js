import { z } from 'zod';

// ID 파라미터 검증 스키마
export const idParamSchema = z.object({
  id: z.ulid({
    message: '데이터 식별 오류',
  }),
});

export const challengeIdParamSchema = z.object({
  challengeId: z.ulid({
    message: '데이터 식별 오류',
  }),
  draftId: z.ulid({ message: '데이터 식별 오류' }).optional(),
});

// 챌린지 생성 스키마
export const createChallengeSchema = z.object({
  title: z.string(),
  sourceUrl: z.url(),
  field: z.enum(['NEXT_JS', 'MODERN_JS', 'WEB', 'ETC']),
  documentType: z.enum(['OFFICIAL_DOC', 'BLOG', 'BOOK', 'ETC']),
  description: z.string(),
  deadline: z.string(),
  maxParticipants: z.number(),
});

export const editChallengeSchema = z.object({
  title: z.string().optional(),
  sourceUrl: z.url().optional(),
  field: z.enum(['NEXT_JS', 'MODERN_JS', 'WEB', 'ETC']),
  documentType: z.enum(['OFFICIAL_DOC', 'BLOG', 'BOOK', 'ETC']),
  description: z.string().optional(),
  deadline: z.date().optional(),
  maxParticipants: z.number().optional(),
});

// 제출물 생성 스키마
export const createSubmissionSchema = z.object({
  title: z.string(),
  content: z.string(),
});
