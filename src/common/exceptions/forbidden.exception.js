import { HttpException } from './http.exception.js';
import { ERROR_CODE } from '#constants';

export class ForbiddenException extends HttpException {
  constructor(errorConfig = ERROR_CODE.AUTH_FORBIDDEN, details = null) {
    const { status, code, message } = errorConfig;
    super(status, code, message, details);
  }
}