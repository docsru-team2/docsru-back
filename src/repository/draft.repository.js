const draftSelect = {
  id: true,
  challengeId: true,
  userId: true,
  title: true,
  content: true,
  createdAt: true,
  updatedAt: true,
};

export class DraftRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  //임시 저장 - 조회
  find(id) {
    const where = { challengeId: id };

    return Promise.all([
      this.#prisma.draft.findMany({
        where,
        select: draftSelect,
      }),
      this.#prisma.draft.count({ where }),
    ]);
  }

  //임시 저장 - 생성
  create(challengeId, userId, data) {
    return this.#prisma.draft.create({
      data: { ...data, challengeId, userId },
      select: draftSelect,
    });
  }

  //임시 저장 - 삭제
  delete(id) {
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
