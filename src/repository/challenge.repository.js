export class ChallengeRepository {
  #prisma;
  #whereCase({ keyword, reviewStatus, userType, userId, ...rest }) {
    const isAdmin = userType.toUpperCase() === 'ADMIN';
    return {
      ...(keyword?.trim() && {
        title: { contains: keyword.trim(), mode: 'insensitive' },
      }),
      ...(!isAdmin
        ? { reviewStatus: 'APPROVED' }
        : reviewStatus
          ? { reviewStatus }
          : {}),
      ...(userId && { participants: { some: { userId } } }),
      ...rest,
    };
  }

  constructor({ prisma }) {
    this.#prisma = prisma;
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
      creator: {
        select: { id: true, nickname: true },
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
  }) {
    const skip = (page - 1) * limit;
    const where = this.#whereCase({ keyword, reviewStatus, userType });

    return await Promise.all([
      this.#prisma.challenge.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: this.#challengeListSelect,
      }),
      this.#prisma.challenge.count({ where }),
    ]);
  }

  // 내가 참여 중인 챌린지 OR 완료된 챌린지 OR 신청한 챌린지 - 목록 조회
  async findByMyList({
    page = 1,
    limit = 10,
    keyword,
    userId,
    reviewStatus = 'APPROVED',
    progressStatus = 'OPEN',
    orderBy,
  }) {
    const skip = (page - 1) * limit;
    const where = this.#whereCase({
      keyword,
      userId,
      reviewStatus,
      progressStatus,
    });

    return await Promise.all([
      this.#prisma.challenge.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: this.#challengeListSelect,
      }),
      this.#prisma.challenge.count({ where }),
    ]);
  }

  // 챌린지 상세 조회
  async findById(id, { userId, userType }) {
    const isAdmin = userType === 'admin';

    return this.#prisma.challenge.findFirst({
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
      select: this.#challengeDetailSelect,
    });
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
        ...(rejectReason && { rejectReason }),
      },
      select: this.#challengeDetailSelect,
    });
  }

  // 유저 - 챌린지 신청 수정
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
        deleteReason,
      },
      select: this.#challengeDetailSelect,
    });
  }
}
