export class FeedbackRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  get #feedbackSelect() {
    return {
      id: true,
      submissionId: true,
      userId: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          nickname: true,
          grade: true,
        },
      },
    };
  }

  //피드백 목록 조회
  findAll(id, { page = 1, limit = 3, orderBy } = {}) {
    const skip = (page - 1) * limit;
    const where = { submissionId: id };

    return Promise.all([
      this.#prisma.feedback.findMany({
        where,
        skip,
        take: limit,
        select: this.#feedbackSelect,
        orderBy: orderBy ? { [orderBy]: 'desc' } : { createdAt: 'desc' },
      }),
      this.#prisma.feedback.count({ where }),
    ]);
  }

  // 피드백 상세 조회
  findById(id) {
    return this.#prisma.feedback.findUnique({
      where: { id },
      select: this.#feedbackSelect,
    });
  }

  // 피드백 생성
  make(submissionId, data) {
    return this.#prisma.feedback.create({
      data: { submissionId, ...data },
      select: this.#feedbackSelect,
    });
  }

  // 피드백 수정
  edit(id, data) {
    return this.#prisma.feedback.update({
      where: { id },
      data,
      select: this.#feedbackSelect,
    });
  }

  // 피드백 삭제
  delete(id) {
    return this.#prisma.feedback.delete({
      where: { id },
      select: { id: true },
    });
  }
}
