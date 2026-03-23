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
};

const challengeDetailSelect = {
  id: true,
  title: true,
  description: true,
  sourceUrl: true,
  deadline: true,
  maxParticipants: true,
  reviewStatus: true,
  progressStatus: true,
  createdAt: true,
  updatedAt: true,
  creator: {
    select: {
      id: true,
      nickname: true,
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

  findAll({
    page = 1,
    limit = 10,
    sort = 'CREATED_DESC',
    keyword,
    reviewStatus,
    isAdmin = false,
    creatorId,
  }) {
    const skip = (page - 1) * limit;
    const where = {
      ...(keyword?.trim() && {
        title: {
          contains: keyword.trim(),
          mode: 'insensitive',
        },
      }),
      ...(creatorId && { creatorId }),
      ...(!isAdmin
        ? { reviewStatus: 'APPROVED' }
        : reviewStatus
          ? { reviewStatus }
          : {}),
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

  findById(id) {
    return this.#prisma.challenge.findUnique({
      where: {
        id,
      },
      select: challengeDetailSelect,
    });
  }

  create(data) {
    return this.#prisma.challenge.create({
      data,
      select: {
        id: true,
        title: true,
        field: true,
        documentType: true,
        description: true,
        deadline: true,
        maxParticipants: true,
        reviewStatus: true,
        progressStatus: true,
        creatorId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  update(id, data) {
    return this.#prisma.challenge.update({
      where: {
        id,
      },
      data,
      select: {
        id: true,
        title: true,
        field: true,
        documentType: true,
        description: true,
        deadline: true,
        maxParticipants: true,
        reviewStatus: true,
        progressStatus: true,
        rejectReason: true,
        deleteReason: true,
        creatorId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

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
}
