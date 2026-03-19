import { HttpException } from './http.exception.js';
import { ERROR_CODE } from '#constants';

export class NotFoundException extends HttpException {
  constructor(errorConfig = ERROR_CODE.COMMON_NOT_FOUND, details = null) {
    const { status, code, message } = errorConfig;
    super(status, code, message, details);
  }
}