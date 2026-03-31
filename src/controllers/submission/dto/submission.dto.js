import { z } from 'zod';

// ID 파라미터 검증 스키마
export const idParamSchema = z.object({
  id: z.ulid({
    message: '데이터 식별 오류',
  }),
});



//임시저장 생성 스키마
export const createDraftSchema = z.object({
  title: z.string(),
  content: z.string().optional(),
});

//수정 스키마
export const editSubmissionSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
});
