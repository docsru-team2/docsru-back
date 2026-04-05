export class SubmissionLikeRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  get #submissionLikeSelect() {
    return { id: true, userId: true, submissionId: true, createdAt: true };
  }

  //추천 여부 조회
  async findIfUserLike(submissionId, userId) {
    return await this.#prisma.submissionLike.findUnique({
      where: {
        submissionId_userId: { submissionId, userId },
      },
    });
  }

  // 작업물 추천
  like(submissionId, userId) {
    return this.#prisma.submissionLike.create({
      data: { submissionId, userId },
      select: this.#submissionLikeSelect,
    });
  }

  //작업물 추천 취소
  cancel(submissionId, userId) {
    return this.#prisma.submissionLike.delete({
      where: {
        submissionId_userId: { submissionId, userId },
      },
      select: {
        id: true,
      },
    });
  }
}
