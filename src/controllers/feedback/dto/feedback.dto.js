import { z } from 'zod';

// ID 파라미터 검증 스키마
export const idParamSchema = z.object({
  id: z.ulid({
    message: '데이터 식별 오류',
  }),
});