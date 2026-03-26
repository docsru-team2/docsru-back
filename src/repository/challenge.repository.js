const challengeListSelect = {
  id: true,
  title: true,
  field: true,
  documentType: true,
  maxParticipants: true,
  reviewStatus: true,
  progressStatus: true,
  deadline: true,
  createdAt: true,
  updatedAt: true,
  submissions: {
    select: {
      id: true,
      title: true,
      isDeleted: true,
    },
  },
};

const challengeDetailSelect = {
  id: true,
  title: true,
  sourceUrl: true,
  field: true,
  documentType: true,
  description: true,
  deadline: true,
  maxParticipants: true,
  reviewStatus: true,
  progressStatus: true,
  rejectReason: true,
  deleteReason: true,
  createdAt: true,
  updatedAt: true,
  creator: {
    select: {
      id: true,
      nickname: true,
    },
  },
  submissions: {
    select: {
      id: true,
      title: true,
      isDeleted: true,
    },
  },
};

const ORDER_BY_MAP = {
  CREATED_DESC: { createdAt: 'desc' }, //신청일 최신순
  CREATED_ASC: { createdAt: 'asc' }, //신청일 오래된 순
  DEADLINE_ASC: { deadline: 'asc' }, //마감기한 빠른순
  DEADLINE_DESC: { deadline: 'desc' }, //마감기한 느린순
};

const orderByCheck = (sort) => {
  return ORDER_BY_MAP[sort] || ORDER_BY_MAP.CREATED_DESC;
};

export class ChallengeRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  // 전체 챌린지 목록 조회 (관리자 or 로그인 한 유저)
  findAll({
    page = 1,
    limit = 10,
    sort = 'CREATED_DESC',
    keyword,
    reviewStatus,
    viewType,
    isAdmin = false,
  }) {
    const skip = (page - 1) * limit;

    const reviewStatusFilter =
      !isAdmin || viewType === 'LIST'
        ? { reviewStatus: 'APPROVED' }
        : reviewStatus
          ? { reviewStatus }
          : {};

    const where = {
      ...(keyword?.trim() && {
        title: {
          contains: keyword.trim(),
          mode: 'insensitive',
        },
      }),
      ...reviewStatusFilter,
    };

    return Promise.all([
      this.#prisma.challenge.findMany({
        where,
        skip,
        take: limit,
        orderBy: orderByCheck(sort),
        select: challengeListSelect,
      }),
      this.#prisma.challenge.count({ where }),
    ]);
  }

  // 내가 참여 중인 챌린지 OR 완료된 챌린지 OR 신청한 챌린지 - 목록 조회
  findByMyList({
    page = 1,
    limit = 10,
    keyword,
    userId,
    reviewStatus = 'APPROVED',
    progressStatus = 'OPEN',
  }) {
    const skip = (page - 1) * limit;
    const where = {
      ...(keyword?.trim() && {
        title: {
          contains: keyword.trim(),
          mode: 'insensitive',
        },
      }),
      reviewStatus,
      ...(progressStatus && { progressStatus }),
      participants: {
        some: { userId },
      },
    };

    return Promise.all([
      this.#prisma.challenge.findMany({
        where,
        skip,
        take: limit,
        select: challengeListSelect,
      }),
      this.#prisma.challenge.count({ where }),
    ]);
  }

  // 챌린지 상세 조회
  async findById(id, { userId, role }) {
    const isAdmin = role === 'ADMIN';

    const challenge = await this.#prisma.challenge.findFirst({
      where: {
        id,
        ...(isAdmin
          ? {}
          : {
              OR: [
                ...(userId ? [{ creatorId: userId }] : []),
                { reviewStatus: 'APPROVED' },
              ],
            }),
      },
      select: challengeDetailSelect,
    });

    if (!challenge) return null;

    if (!isAdmin) return challenge;

    const [prev, next] = await Promise.all([
      this.#prisma.challenge.findFirst({
        where: { createdAt: { lt: challenge.createdAt } },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      }),
      this.#prisma.challenge.findFirst({
        where: { createdAt: { gt: challenge.createdAt } },
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      }),
    ]);

    return {
      ...challenge,
      navigation: {
        prevId: prev?.id ?? null,
        nextId: next?.id ?? null,
      },
    };
  }

  // 챌린지 신청 생성
  create(data) {
    return this.#prisma.challenge.create({
      data,
      select: challengeDetailSelect,
    });
  }

  // 관리자 - 검토 상태 변경 (승인/거절)
  updateReviewStatus(id, { reviewStatus, progressStatus, rejectReason }) {
    return this.#prisma.challenge.update({
      where: { id },
      data: {
        reviewStatus,
        progressStatus,
        rejectReason: reviewStatus === 'APPROVED' ? null : rejectReason,
        deleteReason: null,
      },
      select: challengeDetailSelect,
    });
  }

  // 유저, 어드민 - 챌린지 신청 수정
  update(id, data) {
    return this.#prisma.challenge.update({
      where: {
        id,
      },
      data,
      select: challengeDetailSelect,
    });
  }

  // 유저 - 챌린지 신청 취소(삭제)
  delete(id) {
    return this.#prisma.challenge.delete({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });
  }

  // 관리자 - 삭제 (soft delete)
  updateToDeleted(id, { deleteReason }) {
    return this.#prisma.challenge.update({
      where: { id },
      data: {
        reviewStatus: 'DELETED',
        progressStatus: null,
        rejectReason: null,
        deleteReason,
      },
      select: challengeDetailSelect,
    });
  }
}
