import { z } from 'zod';

// 임시저장 생성 스키마
export const createDraftSchema = z.object({
  title: z
    .string({
      message: '제목을 입력해주세요.',
    })
    .min(1, '제목은 최소 1자 이상이어야 합니다.'),
  content: z
    .string({
      message: '내용을 입력해주세요.',
    })
    .min(1, '내용은 최소 1자 이상이어야 합니다.'),
});

// 임시저장 수정 스키마
export const editDraftSchema = createDraftSchema.partial();
