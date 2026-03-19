import { HttpException } from './http.exception.js';
import { ERROR_CODE } from '#constants';

export class ConflictException extends HttpException {
  constructor(errorConfig = ERROR_CODE.COMMON_CONFLICT, details = null) {
    const { status, code, message } = errorConfig;
    super(status, code, message, details);
  }
}