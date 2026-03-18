import { flattenError, z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().min(1000).max(65535).default(5001),
  DATABASE_URL: z.url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  CORS_ORIGINS: z.string().optional().default(''),
});

const parseEnvironment = () => {
  try {
    return envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      DATABASE_URL: process.env.DATABASE_URL,
      JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
      CORS_ORIGINS: process.env.CORS_ORIGINS,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const { fieldErrors } = flattenError(error);
      console.error('환경 변수 검증 실패:', fieldErrors);
    }
    process.exit(1);
  }
};

export const config = parseEnvironment();

export const isDevelopment = config.NODE_ENV === 'development';
export const isProduction = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test';

export const corsOrigins = config.CORS_ORIGINS.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);