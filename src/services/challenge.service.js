import { ConflictException, NotFoundException } from '#exceptions';
import { ERROR_CODE } from '#constants';

import { CHALLENGE_ORDER_BY, DEFAULT_ORDER } from '#constants';

export class ChallengeService {
  #challengeRepository;
  #challengeParticipantRepository;
  #submissionRepository;

  constructor({
    challengeRepository,
    challengeParticipantRepository,
    submissionRepository,
  }) {
    this.#challengeRepository = challengeRepository;
    this.#challengeParticipantRepository = challengeParticipantRepository;
    this.#submissionRepository = submissionRepository;
  }

  // 챌린지 목록 조회 (통합)
  async findAll(params, isAdmin = false) {
    const { page = 1, limit = 10, orderBy, ...rest } = params;

    const [list, totalCount] = await this.#challengeRepository.findAll({
      page: Number(page),
      limit: Number(limit),
      orderBy,
      userType: isAdmin ? 'ADMIN' : 'USER',
      ...rest,
    });
    const now = new Date();

    const currentList = list.map((challenge) => {
      const isExpired = new Date(challenge.deadline) < now;
      return {
        ...challenge,
        progressStatus: isExpired ? 'CLOSED' : challenge.progressStatus,
      };
    });

    return {
      list: currentList,
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
  async delete(id, _userId) {
    return this.#challengeRepository.delete(id);
  }

  // 챌린지 참여 신청
  async joinChallenge(challengeId, userId) {
    const isJoined =
      await this.#challengeParticipantRepository.findIfUserInChallenge(
        challengeId,
        userId,
      );

    if (isJoined) {
      throw new ConflictException(ERROR_CODE.CHALLENGE_ALREADY_JOINED);
    }
    const challenge = await this.#challengeRepository.findById(challengeId);
    const participantsCount =
      await this.#challengeParticipantRepository.findAll({
        id: challengeId,
      });

    if (participantsCount.totalCount >= challenge.maxParticipants) {
      throw new ConflictException(
        ERROR_CODE.CHALLENGE_PARTICIPANT_LIMIT_EXCEEDED,
      );
    }

    return await this.#challengeParticipantRepository.joinChallenge(
      challengeId,
      userId,
    );
  }
  // 챌린지 참가 포기
  async withdrawChallenge(challengeId, userId) {
    const isJoined =
      await this.#challengeParticipantRepository.findIfUserInChallenge(
        challengeId,
        userId,
      );

    if (!isJoined) {
      throw new NotFoundException(ERROR_CODE.CHALLENGE_NOT_JOINED)
    }
    return await this.#challengeParticipantRepository.withdrawChallenge(
      challengeId,
      userId,
    );
  }

  // 참여자 목록 조회 (페이지네이션 포함)
  async getParticipants(challengeId, userId, query = {}) {
    const { list, totalCount } =
      await this.#challengeParticipantRepository.findAll({
        id: challengeId,
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 10,
      });
    const submission = await this.#submissionRepository.findIfUserSubmit({
      challengeId,
      userId,
    });
    const submissionId = submission.id;
    return {
      list: list.map((item) => {
        const { submission, _count, ...user } = item.user;
        return {
          id: item.id,
          author: {
            ...user,
            submissionId: submission?.[0]?.id || '',
            likeCount: _count.submissionLike,
          },
          createdAt: item.createdAt,
        };
      }),
      pagination: {
        totalCount,
        hasNext: Number(query.page) * Number(query.limit) < totalCount,
      },
    };
  }
  // 내가 생성한 챌린지 목록 조회 (/challenges/me/applied)
  async findAppliedChallenges(params) {
    const {
      page = 1,
      limit = 10,
      orderBy: sort,
      creatorId,
      keyword,
      reviewStatus,
    } = params;
    const orderBy = CHALLENGE_ORDER_BY[sort] || DEFAULT_ORDER;

    const [list, totalCount] =
      await this.#challengeRepository.findCreatedChallenges({
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
