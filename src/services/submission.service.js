import { ERROR_CODE, SUBMISSION_ORDER_BY } from '#constants';
import { ConflictException, NotFoundException } from '#exceptions';

export class SubmissionService {
  #submissionRepository;
  #challengeRepository;
  #challengeParticipantRepository;
  // #notificationService;

  constructor({
    submissionRepository,
    challengeRepository,
    challengeParticipantRepository,
    // notificationService,
  }) {
    this.#submissionRepository = submissionRepository;
    this.#challengeRepository = challengeRepository;
    this.#challengeParticipantRepository = challengeParticipantRepository;
    // this.#notificationService = notificationService;
  }
  //챌린지별 작업물 전체 목록
  async findAll(params) {
    const { challengeId, page = 1, limit = 10, orderBy } = params || {};
    const [list, totalCount] = await this.#submissionRepository.findAll(
      challengeId,
      { page: Number(page), limit: Number(limit), orderBy },
    );

   let currentRank = 1;
   let nextRankCounter = 0;
   
   const rankList = list.map((submission, index) => {
     if (index > 0) {
       const prevSubmission = list[index - 1];
       
       if (submission._count.likes < prevSubmission._count.likes) {
         currentRank += nextRankCounter + 1;
         nextRankCounter = 0;
        } else {
          nextRankCounter++;
        }
      }
      return {
        ...submission,
        rank: currentRank,
        likes: submission._count.likes,
        feedbacks: submission._count.feedbacks,
      };
    });  

    return {
      rankList,
      pagination: {
        totalCount,
        hasNext: page * limit < totalCount /* Boolean */,
      },
    };
  }

  //베스트 작업물 목록 조회
  async findBestList(challengeId) {
    return await this.#submissionRepository.findBestList(challengeId);
  }

  //작업물 상세
  async findDetail(id) {
    const submission = await this.#submissionRepository.findById(id);
    if (!submission)
      throw new NotFoundException(ERROR_CODE.SUBMISSION_NOT_FOUND);
    return submission;
  }

  //작업물 생성
  async create(challengeId, userId, data) {
    const itExists = await this.#submissionRepository.findIfUserSubmit(
      challengeId,
      userId,
    );
    if (itExists) {
      throw new ConflictException(ERROR_CODE.SUBMISSION_ALREADY_EXISTS);
    }
    const challenge = await this.#challengeRepository.findById(challengeId);
    if (!challenge) {
      throw new NotFoundException(ERROR_CODE.CHALLENGE_NOT_FOUND);
    }
    if (challenge.progressStatus !== 'OPEN') {
      throw new ConflictException(ERROR_CODE.CHALLENGE_NOT_OPEN);
    }

    const isParticipant =
      await this.#challengeParticipantRepository.findIfUserInChallenge(
        challengeId,
        userId,
      );

    if (!isParticipant) {
      const { totalCount } = await this.#challengeParticipantRepository.findAll(
        {
          id: challengeId,
        },
      );
      if (totalCount >= challenge.maxParticipants) {
        throw new ConflictException(
          ERROR_CODE.CHALLENGE_PARTICIPANT_LIMIT_EXCEEDED,
        );
      }
      await this.#challengeParticipantRepository.joinChallenge(
        challengeId,
        userId,
      );
    }
    return await this.#submissionRepository.create({
      ...data,
      challengeId,
      userId,
    });
  }

  //작업물 수정
  async update(submissionId, updateData) {
    return await this.#submissionRepository.update(submissionId, updateData);
  }

  //작업물 삭제처리(소프트)
  async delete(submissionId) {
    return await this.#submissionRepository.updateToDeleted(submissionId);
  }
}
