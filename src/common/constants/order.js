export const CHALLENGE_ORDER_BY = {
  CREATED_DESC: { createdAt: 'desc' }, //신청일 최신순
  CREATED_ASC: { createdAt: 'asc' }, //신청일 오래된 순
  DEADLINE_ASC: { deadline: 'asc' }, //마감기한 빠른순
  DEADLINE_DESC: { deadline: 'desc' }, //마감기한 느린순
};

export const DEFAULT_ORDER = CHALLENGE_ORDER_BY.CREATED_DESC;
