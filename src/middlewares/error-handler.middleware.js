import { Prisma } from '#generated/prisma/client.ts';
import { ERROR_CODE, HTTP_STATUS, PRISMA_ERROR } from '#constants';
import { HttpException } from '#exceptions';

export const errorHandler = (err, req, res, _next) => {
  console.error(err.stack);

  if (err instanceof HttpException) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.errorCode,
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === PRISMA_ERROR.UNIQUE_CONSTRAINT) {
      const field = err.meta?.target?.[0];
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        code: err.errorCode,
        message: `${field}가 이미 사용 중입니다.`,
      });
    }

    // P2025: Record not found
    if (err.code === PRISMA_ERROR.RECORD_NOT_FOUND) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_CODE.COMMON_NOT_FOUND,
      });
    }
  }

  // 처리되지 않은 모든 에러
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    code: err.errorCode,
    message: ERROR_CODE.INTERNAL_SERVER_ERROR,
  });
};
