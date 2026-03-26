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
          _count: { /* prisma aggregate method: 관계 필드 count용임 */
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
  async findAllByChallengeId(
    id,
    { page = 1, limit = 10 },
    orderBy = { createdAt: 'desc' }, /* 혹시몰라서 넣었음 */
  ) {
    const skip = (page - 1) * limit;
    const where = { challengeId: id };

    const [list, totalCount] = await Promise.all([
      this.#prisma.challengeParticipant.findMany({
        where,
        skip,
        take: limit,
        select: this.#participantSelect,
        orderBy,
      }),
      this.#prisma.challengeParticipant.count({ where }),
    ]);
    return { list, totalCount };
  }

  //승인된 챌린지 참여
  joinChallenge(challengeId, userId) {
    return this.#prisma.challengeParticipant.create({
      data: { challengeId, userId },
      select: this.#participantSelect,
    });
  }

  //챌린지 참여 여부 확인
  findIfUserInChallenge(challengeId, userId) {
    return this.#prisma.challengeParticipant.findUnique({
      where: {
        challengeId_userId: { challengeId, userId },
      },
    });
  }
}
