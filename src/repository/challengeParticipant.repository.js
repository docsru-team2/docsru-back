const participantsList = {
  id: true,
  challengeId: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
};

const author = {
  id: true,
  nickname: true,
  grade: true,
};

export class ChallengeParticipantRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  //챌린지 참여자 목록 조회
  findParticipantsByChallengeId(id, { page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;
    const where = { challengeId: id };

    return Promise.all([
      this.#prisma.challengeParticipant.findMany({
        where,
        skip,
        take: limit,
        select: {
          participants: {
            select: {
              user: {
                select: author,
              },
            },
          },
          submissions: {
            select: {
              id: true,
            },
          },
          createdAt: true,
        },
      }),
      this.#prisma.challengeParticipant.count({ where }),
    ]);
  }

  //승인된 챌린지 참여
  joinChallenge(challengeId, userId) {
    return this.#prisma.challengeParticipant.create({
      data: { challengeId, userId },
      select: {
        participants: participantsList,
      },
    });
  }
}
