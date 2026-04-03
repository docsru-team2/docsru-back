export class ChallengeParticipantRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  get #participantSelect() {
    return {
      id: true,
      challengeId: true,
      userId: true,
      user: {
        select: {
          id: true,
          nickname: true,
          grade: true,
          /* prisma aggregate method: 관계 필드 count용임 */
          _count: {
            select: {
              submissionLike: true,
            },
          },
        },
      },
      createdAt: true,
      updatedAt: true,
    };
  }

  //챌린지 참여자 목록 조회
  async findAll({ id, page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;
    const where = { challengeId: id };

    const [list, totalCount] = await Promise.all([
      this.#prisma.challengeParticipant.findMany({
        where,
        skip,
        take: limit,
        select: {
          ...this.#participantSelect,
          user: {
            select: {
              ...this.#participantSelect.user.select,
              submission: {
                where: { challengeId: id },
                select: { id: true },
                take: 1,
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.#prisma.challengeParticipant.count({ where }),
    ]);
    return { list, totalCount };
  }

  //승인된 챌린지 참여
  async joinChallenge(challengeId, userId) {
    return await this.#prisma.challengeParticipant.create({
      data: { challengeId, userId },
      select: this.#participantSelect,
    });
  }

  //챌린지 참여 여부 확인
  async findIfUserInChallenge(challengeId, userId) {
    return await this.#prisma.challengeParticipant.findUnique({
      where: {
        challengeId_userId: { challengeId, userId },
      },
    });
  }
}
