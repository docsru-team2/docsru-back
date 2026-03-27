export class SubmissionRepository {
  #prisma;

  #whereCase(filter, { isAdmin = false } = {}) {
    return {
      ...filter,
      ...(isAdmin ? {} : { isDeleted: false }),
    };
  }
  
  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  get #submissionSelect() {
    return {
      id: true,
      challengeId: true,
      userId: true,
      title: true,
      content: true,
      isDeleted: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          nickname: true,
          grade: true,
        },
      },
      _count: {
        select: { likes: true, feedbacks: true },
      },
    };
  }

  //챌린지별 작업물 목록 조회
  async findAll(id, { page = 1, limit = 10, isAdmin = false } = {}) {
    const skip = (page - 1) * limit;
    const where = this.#whereCase({ challengeId: id }, { isAdmin });

    return await Promise.all([
      this.#prisma.submission.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          likes: {
            _count: 'desc',
          },
        },
        select: this.#submissionSelect,
      }),
      this.#prisma.submission.count({ where }),
    ]);
  }

  //베스트 작업물 목록 조회
  async findBestList(id) {
    const listLikeDesc = await this.#prisma.submissionLike.groupBy({
      by: ['submissionId'],
      where: { challengeId: id, isDeleted: false },
      _count: { _all: true },
      orderBy: { _count: { _all: 'desc' } },
      take: 1,
    });

    if (listLikeDesc.length === 0) return [];

    const maxLikes = listLikeDesc[0]._count._all;

    return await this.#prisma.submission.findMany({
      where: {
        challengeId: id,
        isDeleted: false,
        likes: { _count: maxLikes },
      },
      select: this.#submissionSelect,
    });
  }

  //작업물 상세 조회
  findById(id) {
    return this.#prisma.submission.findFirst({
      where: this.#whereCase({ id }),
      select: {
        ...this.#submissionSelect,
      },
    });
  }

  //기 제출 여부 확인
  async findIfUserSubmit(challengeId, userId) {
    return await this.#prisma.submission.findFirst({
      where: { challengeId, userId, isDeleted: false },
    });
  }

  //작업물 생성
  create(data) {
    return this.#prisma.submission.create({
      data,
      select: this.#submissionSelect,
    });
  }

  //작업물 수정
  update(id, data) {
    return this.#prisma.submission.update({
      where: this.#whereCase({ id }),
      data,
      select: this.#submissionSelect,
    });
  }

  //작업물 삭제 (소프트 삭제)
  updateToDeleted(id) {
    return this.#prisma.submission.update({
      where: this.#whereCase({ id }),
      data: { isDeleted: true },
      select: {
        id: true,
        isDeleted: true,
        updatedAt: true,
      },
    });
  }
}
