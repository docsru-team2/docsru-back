const submissionLikeSelect = {
  id: true,
  userId: true,
  submissionId: true,
  createdAt: true,
};

export class SubmissionLikeRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  //작업물 추천 +1
  createLike(submissionId, userId) {
    return this.#prisma.submissionLike.create({
      data: { submissionId, userId },
      select: submissionLikeSelect,
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
}
