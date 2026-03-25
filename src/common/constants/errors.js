// Prisma 에러 코드 상수
export const PRISMA_ERROR = {
  UNIQUE_CONSTRAINT: 'P2002',
  RECORD_NOT_FOUND: 'P2025',
};

import { HTTP_STATUS } from './http-status.js';

export const ERROR_CODE = {
  // 400 Bad Request
  COMMON_VALIDATION_FAILED: {
    status: HTTP_STATUS.BAD_REQUEST,
    code: 'COMMON_VALIDATION_FAILED',
    message: '입력값 검증 실패',
  },
  COMMON_BAD_REQUEST: {
    status: HTTP_STATUS.BAD_REQUEST,
    code: 'COMMON_BAD_REQUEST',
    message: 'Bad request',
  },
  INVALID_INPUT: {
    status: HTTP_STATUS.BAD_REQUEST,
    code: 'INVALID_INPUT',
    message: '유효하지 않은 입력값',
  },
  REJECT_REASON_MISSING: {
    status: HTTP_STATUS.BAD_REQUEST,
    code: 'REJECT_REASON_MISSING',
    message: '거절 사유 없음',
  },

  // 401 Unauthorized
  AUTH_UNAUTHORIZED: {
    status: HTTP_STATUS.UNAUTHORIZED,
    code: 'AUTH_UNAUTHORIZED',
    message: '인증 필요',
  },
  AUTH_INVALID_CREDENTIALS: {
    status: HTTP_STATUS.UNAUTHORIZED,
    code: 'AUTH_INVALID_CREDENTIALS',
    message: '이메일 또는 비밀번호 불일치',
  },
  AUTH_INVALID_TOKEN: {
    status: HTTP_STATUS.UNAUTHORIZED,
    code: 'AUTH_INVALID_TOKEN',
    message: '유효하지 않은 토큰',
  },

  // 403 Forbidden
  AUTH_FORBIDDEN: {
    status: HTTP_STATUS.FORBIDDEN,
    code: 'AUTH_FORBIDDEN',
    message: '권한 없음',
  },

  // 404 Not Found
  COMMON_NOT_FOUND: {
    status: HTTP_STATUS.NOT_FOUND,
    code: 'COMMON_NOT_FOUND',
    message: 'Bad request',
  },
  FEEDBACK_NOT_FOUND: {
    status: HTTP_STATUS.NOT_FOUND,
    code: 'FEEDBACK_NOT_FOUND',
    message: '피드백 없음',
  },
  SUBMISSION_NOT_FOUND: {
    status: HTTP_STATUS.NOT_FOUND,
    code: 'SUBMISSION_NOT_FOUND',
    message: '작업물 없음',
  },
  SUBMISSION_LIKE_NOT_FOUND: {
    status: HTTP_STATUS.NOT_FOUND,
    code: 'SUBMISSION_LIKE_NOT_FOUND',
    message: '추천 기록 없음',
  },
  DRAFT_NOT_FOUND: {
    status: HTTP_STATUS.NOT_FOUND,
    code: 'DRAFT_NOT_FOUND',
    message: '임시 저장 없음',
  },
  CHALLENGE_NOT_FOUND: {
    status: HTTP_STATUS.NOT_FOUND,
    code: 'CHALLENGE_NOT_FOUND',
    message: '챌린지 없음',
  },
  NOTIFICATION_NOT_FOUND: {
    status: HTTP_STATUS.NOT_FOUND,
    code: 'NOTIFICATION_NOT_FOUND',
    message: '알림 없음',
  },

  // 409 Conflict
  COMMON_CONFLICT: {
    status: HTTP_STATUS.CONFLICT,
    code: 'COMMON_CONFLICT',
    message: 'Resource already exists',
  },
  USER_EMAIL_ALREADY_EXISTS: {
    status: HTTP_STATUS.CONFLICT,
    code: 'USER_EMAIL_ALREADY_EXISTS',
    message: '이미 사용 중인 이메일입니다.',
  },
  USER_NICKNAME_ALREADY_EXISTS: {
    status: HTTP_STATUS.CONFLICT,
    code: 'USER_NICKNAME_ALREADY_EXISTS',
    message: '이미 사용 중인 닉네임입니다.',
  },
  CHALLENGE_APPLICATION_ALREADY_PROCESSED: {
    status: HTTP_STATUS.CONFLICT,
    code: 'CHALLENGE_APPLICATION_ALREADY_PROCESSED',
    message: '이미 처리된 신청',
  },
  CHALLENGE_ALREADY_JOINED: {
    status: HTTP_STATUS.CONFLICT,
    code: 'CHALLENGE_ALREADY_JOINED',
    message: '이미 참여한 챌린지',
  },
  CHALLENGE_PARTICIPANT_LIMIT_EXCEEDED: {
    status: HTTP_STATUS.CONFLICT,
    code: 'CHALLENGE_PARTICIPANT_LIMIT_EXCEEDED',
    message: '참여 가능 인원 초과',
  },
  SUBMISSION_ALREADY_EXISTS: {
    status: HTTP_STATUS.CONFLICT,
    code: 'SUBMISSION_ALREADY_EXISTS',
    message: '이미 해당 챌린지에 작업물을 등록함',
  },
  SUBMISSION_ALREADY_DELETED: {
    status: HTTP_STATUS.CONFLICT,
    code: 'SUBMISSION_ALREADY_DELETED',
    message: '이미 삭제된 작업물',
  },
  SUBMISSION_LIKE_ALREADY_EXISTS: {
    status: HTTP_STATUS.CONFLICT,
    code: 'SUBMISSION_LIKE_ALREADY_EXISTS',
    message: '이미 추천한 작업물',
  },

  // 500 Internal Server Error
  INTERNAL_SERVER_ERROR: {
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error',
  },
};
