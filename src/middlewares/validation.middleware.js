import { isProduction } from '#config';
import { flattenError } from 'zod';
import { ERROR_CODE } from '#constants';
import { BadRequestException } from '#exceptions';

/**
 * 범용 검증 미들웨어
 * @param {string} target - 검증할 대상 ('body', 'params', 'query')
 * @param {ZodSchema} schema - Zod 스키마
 */
export const validate = (target, schema) => {
  if (!['body', 'query', 'params'].includes(target)) {
    throw new Error(
      `[validate middleware] Invalid target: "${target}". Expected "body", "query", or "params".`,
    );
  }
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req[target]);

      if (!result.success) {
        const { fieldErrors } = flattenError(result.error);

        if (isProduction) {
          throw new BadRequestException(ERROR_CODE.INVALID_INPUT);
        }

        throw new BadRequestException(
          ERROR_CODE.COMMON_VALIDATION_FAILED,
          fieldErrors,
        );
      }

      Object.assign(req[target], result.data);
      next();
    } catch (error) {
      next(error);
    }
  };
};
