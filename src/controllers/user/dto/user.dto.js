import { z } from 'zod';

const passwordRegex =
  /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// ID 파라미터 검증 스키마
export const idParamSchema = z.object({
  id: z.ulid({
    message: '데이터 식별 오류',
  }),
});

// 사용자 생성 스키마
export const createUserSchema = z.object({
  email: z.email('유효한 이메일 형식이 아닙니다.'),
  password: z
    .string({ error: '비밀번호는 필수입니다.' })
    .min(8, '비밀번호는 8자 이상이어야 합니다.')
    .regex(passwordRegex, '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.'),
  nickname: z.string().min(2, '이름은 2자 이상이어야 합니다.').optional(),
});
