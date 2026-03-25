const submissionSelect = {
  id: true,
  userId: true,
  title: true,
  content: true,
  createdAt: true,
  updatedAt: true,
};

const submissionDetailSelect = {
  id: true,
  title: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  isDeleted: true,
  user: {
    select: {
      id: true,
      nickname: true,
      grade: true,
    },
  },
};

export class SubmissionRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  //챌린지의 작업물 전체 조회
  findAll(id, { page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;
    const where = { challengeId: id };

    return Promise.all([
      this.#prisma.submission.findMany({
        where,
        skip,
        take: limit,
        select: submissionSelect,
      }),
      this.#prisma.submission.count({ where }),
    ]);
  }

  //베스트 작업물 후보 조회
  async findTopLiked(id) {
    const all = await this.#prisma.submission.findMany({
      where: {
        challengeId: id,
        isDeleted: false,
      },
      orderBy: {
        likes: {
          _count: 'desc',
        },
      },
      select: {
        ...submissionDetailSelect,
        _count: { select: { likes: true } },
      },
    });

    if (all.length === 0) return [];

    const top1 = all[0]._count.likes;

    return all.filter((x) => x._count.likes === top1);
  }

  //작업물 상세 조회
  findById(id) {
    return this.#prisma.submission.findUnique({
      where: {
        id,
      },
      select: submissionDetailSelect,
    });
  }

  //작업물 생성
  create(id, data) {
    return this.#prisma.submission.create({
      data: {
        ...data,
        challengeId: id,
      },
      select: {
        ...submissionSelect,
        challengeId: true,
        isDeleted: true,
      },
    });
  }

  //작업물 수정
  update(id, data) {
    return this.#prisma.submission.update({
      where: {
        id,
      },
      data,
      select: {
        ...submissionSelect,
        challengeId: true,
      },
    });
  }

  //작업물 삭제 (소프트 삭제)
  updateToDeleted(id, { isDeleted }) {
    return this.#prisma.submission.update({
      where: {
        id,
      },
      data: { isDeleted },
      select: {
        id: true,
        isDeleted: true,
        updatedAt: true,
      },
    });
  }
}
