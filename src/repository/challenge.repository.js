import { CHALLENGE_ORDER_BY, DEFAULT_ORDER } from '#constants';

export class ChallengeRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  #whereCase({
    keyword,
    reviewStatus,
    userType = 'USER',
    userId,
    viewType,
    field,
    documentType,
    progressStatus,
    ...rest
  } = {}) {
    const { userId: _, ...pureRest } = rest;
    const isAdmin = userType.toUpperCase() === 'ADMIN';

    const reviewStatusFilter =
      !isAdmin || viewType === 'LIST'
        ? { reviewStatus: 'APPROVED' }
        : reviewStatus
          ? { reviewStatus }
          : {};

    return {
      ...(keyword?.trim() && {
        title: { contains: keyword.trim(), mode: 'insensitive' },
      }),
      ...reviewStatusFilter,
      ...(userId && {
        participants: {
          some: { userId: userId },
        },
      }),
      ...(field && {
        field: Array.isArray(field) ? { in: field } : field,
      }),
      ...(documentType && { documentType }),
      ...(progressStatus && { progressStatus }),
      ...pureRest,
    };
  }

  #orderByCase(orderBy = DEFAULT_ORDER) {
    if (orderBy && typeof orderBy === 'object') return orderBy;
    
    return CHALLENGE_ORDER_BY[orderBy];
  }

  get #challengeListSelect() {
    return {
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
      _count: {
        select: { participants: true },
      },
    };
  }

  get #challengeDetailSelect() {
    return {
      ...this.#challengeListSelect,
      sourceUrl: true,
      description: true,
      rejectReason: true,
      deleteReason: true,
      creatorId: true,
      creator: {
        select: { id: true, nickname: true },
      },
      submissions: {
        select: {
          id: true,
        },
      },
      _count: {
        select: { submissions: true },
      },
    };
  }

  // 전체 챌린지 목록 조회 (관리자 or 로그인 한 유저)
  async findAll({
    page = 1,
    limit = 10,
    orderBy,
    keyword,
    reviewStatus,
    userType,
    field,
    documentType,
    progressStatus,
  }) {
    const skip = (page - 1) * limit;
    const where = this.#whereCase({
      keyword,
      reviewStatus,
      userType,
      field,
      documentType,
      progressStatus,
    });

    return await Promise.all([
      this.#prisma.challenge.findMany({
        where,
        skip,
        take: limit,
        orderBy: this.#orderByCase(orderBy),
        select: this.#challengeListSelect,
      }),
      this.#prisma.challenge.count({ where }),
    ]);
  }

  // 내가 참여 중인 챌린지 OR 완료된 챌린지 - 목록 조회 (/challenges/joined)
  async findByMyList({
    page = 1,
    limit = 10,
    keyword,
    userId,
    progressStatus,
    orderBy,
  }) {
    const skip = (page - 1) * limit;
    const reviewStatusFilter =
      progressStatus === 'CLOSED'
        ? { in: ['APPROVED', 'DELETED'] }
        : 'APPROVED';
    const where = {
      reviewStatus: reviewStatusFilter,
      participants: { some: { userId } },
      ...(progressStatus === 'CLOSED' && {
        submissions: { some: { userId } },
      }),
      ...(keyword?.trim() && {
        title: { contains: keyword.trim(), mode: 'insensitive' },
      }),
      ...(progressStatus && { progressStatus }),
    };

    return await Promise.all([
      this.#prisma.challenge.findMany({
        where,
        skip,
        take: limit,
        orderBy: this.#orderByCase(orderBy),
        select: this.#challengeListSelect,
      }),
      this.#prisma.challenge.count({ where }),
    ]);
  }

  // 내가 생성한 챌린지 목록 조회 (/challenges/me/applied)
  async findCreatedChallenges({
    page = 1,
    limit = 10,
    keyword,
    creatorId,
    reviewStatus,
    orderBy,
  }) {
    const skip = (page - 1) * limit;
    const where = {
      creatorId,
      ...(keyword?.trim() && {
        title: { contains: keyword.trim(), mode: 'insensitive' },
      }),
      ...(reviewStatus ? { reviewStatus } : {}),
    };

    return await Promise.all([
      this.#prisma.challenge.findMany({
        where,
        skip,
        take: limit,
        orderBy: this.#orderByCase(orderBy),
        select: this.#challengeListSelect,
      }),
      this.#prisma.challenge.count({ where }),
    ]);
  }

  // 챌린지 상세 조회
  async findById(id, { userId, userType } = {}) {
    const isAdmin = userType === 'ADMIN';

    const challenge = await this.#prisma.challenge.findFirst({
      where: {
        id,
        ...(isAdmin
          ? {}
          : {
              OR: [
                { reviewStatus: 'APPROVED' },
                ...(userId ? [{ creatorId: userId }] : []),
                ...(userId
                  ? [
                      {
                        reviewStatus: 'DELETED',
                        submissions: { some: { userId } },
                      },
                    ]
                  : []),
              ],
            }),
      },
      select: this.#challengeDetailSelect,
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
      select: this.#challengeDetailSelect,
    });
  }

  // 관리자 - 검토 상태 변경 (승인/거절)
  updateReviewStatus(id, { reviewStatus, rejectReason }) {
    return this.#prisma.challenge.update({
      where: { id },
      data: {
        reviewStatus,
        progressStatus: reviewStatus === 'APPROVED' ? 'OPEN' : null,
        rejectReason: reviewStatus === 'APPROVED' ? null : rejectReason,
        deleteReason: null,
      },
      select: this.#challengeDetailSelect,
    });
  }

  // 유저, 어드민 - 챌린지 신청 수정
  update(id, data) {
    return this.#prisma.challenge.update({
      where: { id },
      data,
      select: this.#challengeDetailSelect,
    });
  }

  // 유저 - 챌린지 신청 취소(삭제)
  delete(id) {
    return this.#prisma.challenge.delete({
      where: { id },
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
        progressStatus: 'CLOSED',
        rejectReason: null,
        deleteReason,
      },
      select: this.#challengeDetailSelect,
    });
  }
}
