import { HttpException } from './http.exception.js';
import { ERROR_CODE } from '#constants';

export class BadRequestException extends HttpException {
  constructor(errorConfig = ERROR_CODE.COMMON_BAD_REQUEST, details = null) {
    const { status, code, message } = errorConfig;
    super(status, code, message, details);
  }
}