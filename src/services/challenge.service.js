import { ConflictException, NotFoundException } from '#exceptions';
import { ERROR_CODE } from '#constants';

import { CHALLENGE_ORDER_BY, DEFAULT_ORDER } from '#constants';

export class ChallengeService {
  #challengeRepository;
  #participantRepository;

  constructor({ challengeRepository, challengeParticipantRepository }) {
    this.#challengeRepository = challengeRepository;
    this.#participantRepository = challengeParticipantRepository;
  }

  // 챌린지 목록 조회 (통합)
  async findAll(params, isAdmin = false) {
    const { page = 1, limit = 10, sort, ...rest } = params;
    const orderBy = CHALLENGE_ORDER_BY[sort] || DEFAULT_ORDER;

    const [list, totalCount] = await this.#challengeRepository.findAll({
      page: Number(page),
      limit: Number(limit),
      orderBy,
      userType: isAdmin ? 'ADMIN' : 'USER',
      viewType: 'LIST',
      ...rest,
    });

    return {
      list,
      pagination: {
        totalCount,
        hasNext: page * limit < totalCount /* Boolean */,
      },
    };
  }

  // 챌린지 상세 조회
  async findDetail(id, user = {}) {
    const challenge = await this.#challengeRepository.findById(id, {
      userId: user.id,
      userType: user.userType,
    });

    if (!challenge) {
      throw new NotFoundException(ERROR_CODE.CHALLENGE_NOT_FOUND);
    }
    return challenge;
  }

  // 챌린지 생성
  async make(data) {
    return this.#challengeRepository.create({
      ...data,
      reviewStatus: 'PENDING',
    });
  }

  // 챌린지 수정
  async edit(id, userId, data) {
    return this.#challengeRepository.update(id, data);
  }

  // 챌린지 삭제
  async delete(id, userId) {
    return this.#challengeRepository.delete(id);
  }

  // 챌린지 참여 신청
  async joinChallenge(challengeId, userId) {
    const isJoined = await this.#participantRepository.findIfUserInChallenge(
      challengeId,
      userId,
    );

    if (isJoined) {
      throw new ConflictException(ERROR_CODE.CHALLENGE_ALREADY_JOINED);
    }
    const challenge = await this.findDetail(challengeId);
    const participantsCount = await this.#participantRepository.findAll({
      id: challengeId,
    });

    if (participantsCount.totalCount >= challenge.maxParticipants) {
      throw new ConflictException(
        ERROR_CODE.CHALLENGE_PARTICIPANT_LIMIT_EXCEEDED,
      );
    }

    return await this.#participantRepository.joinChallenge(challengeId, userId);
  }

  // 참여자 목록 조회 (페이지네이션 포함)
  async getParticipants(challengeId, query) {
    const { list, totalCount } = await this.#participantRepository.findAll({
      id: challengeId,
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
    });

    return {
      list: list.map((item) => ({
        id: item.id,
        author: {
          ...item.user,
          likeCount: item.user._count.submissionLike,
        },
        createdAt: item.createdAt,
      })),
      pagination: {
        totalCount,
        hasNext: query.page * query.limit < totalCount,
      },
    };
  }
  // 내가 생성한 챌린지 목록 조회 (/challenges/me/applied)
  async findAppliedChallenges(params) {
    const { page = 1, limit = 10, orderBy: sort, creatorId, keyword, reviewStatus } = params;
    const orderBy = CHALLENGE_ORDER_BY[sort] || DEFAULT_ORDER;

    const [list, totalCount] = await this.#challengeRepository.findCreatedChallenges({
      page: Number(page),
      limit: Number(limit),
      orderBy,
      creatorId,
      keyword,
      reviewStatus,
    });

    return {
      list,
      pagination: {
        totalCount,
        hasNext: Number(page) * Number(limit) < totalCount,
      },
    };
  }

  // 내가 참여한 챌린지 목록 조회 (/challenges/joined)
  async findJoinedChallenges(params) {
    const { page = 1, limit = 10, userId, keyword, progressStatus } = params;

    const [list, totalCount] = await this.#challengeRepository.findByMyList({
      page: Number(page),
      limit: Number(limit),
      userId,
      keyword,
      progressStatus,
      orderBy: DEFAULT_ORDER,
    });

    return {
      list,
      pagination: {
        totalCount,
        hasNext: Number(page) * Number(limit) < totalCount,
      },
    };
  }
}
