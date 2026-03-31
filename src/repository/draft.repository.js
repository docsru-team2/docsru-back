export class DraftRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  get #draftSelect() {
    return {
      id: true,
      challengeId: true,
      userId: true,
      title: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    };
  }

  // 임시저장 목록 조회
  findAll(userId, { page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    const where = { userId };

    return Promise.all([
      this.#prisma.draft.findMany({
        where,
        skip,
        take: limit,
        select: this.#draftSelect,
        orderBy: { updatedAt: 'desc' },
      }),
      this.#prisma.draft.count({ where }),
    ]);
  }

  // 임시저장 상세 조회
  findById(id) {
    return this.#prisma.draft.findUnique({
      where: { id },
      select: this.#draftSelect,
    });
  }

  // 임시저장 생성
  create(userId, challengeId, data) {
    return this.#prisma.draft.create({
      data: { ...data, userId, challengeId },
      select: this.#draftSelect,
    });
  }

  // 임시저장 수정
  update(id, data) {
    return this.#prisma.draft.update({
      where: { id },
      data,
      select: this.#draftSelect,
    });
  }

  // 임시저장 삭제
  delete(id) {
    return this.#prisma.draft.delete({
      where: { id },
      select: { id: true },
    });
  }

  // 특정 유저가 특정 챌린지에 쓴 임시글 조회
  findByUserAndChallenge(challengeId, userId) {
    return this.#prisma.draft.findFirst({
      where: { challengeId, userId },
      select: this.#draftSelect,
    });
  }

  // 없으면 신규생성하고 있으면 덮어쓰기
  async upsert(challengeId, userId, data) {
    const existing = await this.findByUserAndChallenge(challengeId, userId);

    if (existing) {
      return this.update(existing.id, {
        title: data.title,
        content: data.content,
      });
    }

    return this.create(userId, challengeId, data);
  }

  // 유저, 챌린지 기준 삭제(제출완료 시)
  deleteByUserAndChallenge(challengeId, userId) {
    return this.#prisma.draft.deleteMany({
      where: { challengeId, userId },
    });
  }
}