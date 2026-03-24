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

const draftSelect = {
  id: true,
  challengeId: true,
  userId: true,
  title: true,
  content: true,
  createdAt: true,
  updatedAt: true,
};

const submissionLikeSelect = {
  id: true,
  userId: true,
  submissionId: true,
  createdAt: true,
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

  //임시 저장 - 조회
  findDraft(id) {
    const where = { challengeId: id };

    return Promise.all([
      this.#prisma.draft.findMany({
        where,
        select: draftSelect,
      }),
      this.#prisma.draft.count({ where }),
    ]);
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

  //작업물 추천 +1
  createLike(submissionId, userId) {
    return this.#prisma.submissionLike.create({
      data: { submissionId, userId },
      select: submissionLikeSelect,
    });
  }

  //임시 저장 - 생성
  createDraft(challengeId, userId, data) {
    return this.#prisma.draft.create({
      data: { ...data, challengeId, userId },
      select: draftSelect,
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
  updateToDelete(id) {
    return this.#prisma.submission.update({
      where: {
        id,
      },
      data: { isDeleted: true },
      select: {
        id: true,
        isDeleted: true,
        updatedAt: true,
      },
    });
  }

  //작업물 추천 취소
  deleteLike(submissionId, userId) {
    return this.#prisma.submissionLike.delete({
      where: {
        submissionId_userId: { submissionId, userId },
      },
      select: {
        id: true,
      },
    });
  }

  //임시 저장 - 삭제
  deleteDraft(id) {
    return this.#prisma.draft.delete({
      where: {
        id,
      },
      select: {
        challengeId: true,
      },
    });
  }
}
