import { z } from 'zod';

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const signUpSchema = z.object({
  email: z.email('유효한 이메일 형식이 아닙니다.'),
  password: z
    .string({ error: '비밀번호는 필수입니다.' })
    .min(8, '비밀번호는 8자 이상이어야 합니다.')
    .regex(
      passwordRegex, '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.'
    ),
  name: z.string().min(2, '이름은 2자 이상이어야 합니다.'),
});

export const loginSchema = z.object({
  email: z.email('유효한 이메일 형식이 아닙니다.'),
  password: z
    .string({ error: '비밀번호는 필수입니다.' })
    .min(1, '비밀번호를 입력해주세요.'),
});