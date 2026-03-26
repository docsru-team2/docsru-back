const feedbackSelect = {
  id: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      nickname: true,
    },
  },
};

const feedbackCreateSelect = {
  id: true,
  submissionId: true,
  content: true,
  createdAt: true,
};

export class FeedbackRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  // 피드백 조회
  findAll(id, { page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;
    const where = { submissionId: id };

    return Promise.all([
      this.#prisma.feedback.findMany({
        where,
        skip,
        take: limit,
        select: feedbackSelect,
      }),
      this.#prisma.feedback.count({ where }),
    ]);
  }

  // 피드백 조회
  findById(id) {
    return this.#prisma.feedback.findUnique({
      where: {
        id: id,
      },
      select: feedbackSelect,
    });
  }

  // 피드백 생성
  create(submissionId, data) {
    return this.#prisma.feedback.create({
      data: { ...data, submissionId },
      select: feedbackCreateSelect,
    });
  }

  // 피드백 수정
  update(id, data) {
    return this.#prisma.feedback.update({
      where: {
        id,
      },
      data,
      select: {
        ...feedbackCreateSelect,
        updatedAt: true,
      },
    });
  }

  // 피드백 삭제
  delete(id) {
    return this.#prisma.feedback.delete({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });
  }
}
