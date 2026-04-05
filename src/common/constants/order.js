export const ORDER_BY_CREATED = {
  CREATED_DESC: { createdAt: 'desc' }, //신청일 최신순
  CREATED_ASC: { createdAt: 'asc' }, //신청일 오래된 순
};
export const CHALLENGE_ORDER_BY = {
  ...ORDER_BY_CREATED,
  DEADLINE_ASC: { deadline: 'asc' }, //마감기한 빠른순
  DEADLINE_DESC: { deadline: 'desc' }, //마감기한 느린순
};

export const SUBMISSION_ORDER_BY = {
  ...ORDER_BY_CREATED,
  LIKES_DESC: { likes: { _count: 'desc' } },
};

export const DEFAULT_ORDER = ORDER_BY_CREATED.CREATED_DESC;
