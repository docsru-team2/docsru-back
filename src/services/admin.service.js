import { NotFoundException } from '#exceptions';
import { ERROR_CODE } from '#constants';

export class AdminService {
  #challengeRepository;
  #submissionRepository;
  #feedbackRepository;
  #notificationRepository;

  constructor({
    challengeRepository,
    submissionRepository,
    feedbackRepository,
    notificationRepository,
  }) {
    this.#challengeRepository = challengeRepository;
    this.#submissionRepository = submissionRepository;
    this.#feedbackRepository = feedbackRepository;
    this.#notificationRepository = notificationRepository;
  }

  //챌린지 목록 조회
  async getChallengeList({
    page,
    limit,
    orderBy,
    keyword,
    reviewStatus,
    viewType,
  }) {
    const [list, totalCount] = await this.#challengeRepository.findAll({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      orderBy: orderBy || { createdAt: 'desc' },
      keyword,
      viewType,
      reviewStatus,
      userType: 'ADMIN',
    });
    return { list, totalCount, hasNext: page * limit < totalCount };
  }

  //챌린지 상세 조회
  async getChallengeDetail(id) {
    const challenge = await this.#challengeRepository.findById(id, {
      userType: 'ADMIN',
    });

    if (!challenge) throw new NotFoundException(ERROR_CODE.CHALLENGE_NOT_FOUND);

    return challenge;
  }

  // 챌린지 승인
  async approveChallenge(id, adminId) {
    const challenge = await this.#challengeRepository.findById(id, {
      userType: 'ADMIN',
    });

    if (!challenge) throw new NotFoundException(ERROR_CODE.CHALLENGE_NOT_FOUND);

    if (challenge.reviewStatus === 'APPROVED') {
      throw new NotFoundException(
        ERROR_CODE.CHALLENGE_APPLICATION_ALREADY_PROCESSED,
      );
    }

    const updated = await this.#challengeRepository.updateReviewStatus(id, {
      reviewStatus: 'APPROVED',
      progressStatus: 'OPEN',
    });

    // await this.#notificationRepository.create({
    //   userId: challenge.creator.id,
    //   actorUserId: adminId,
    //   type: 'CHALLENGE_ADMIN_APPROVED',
    //   content: '챌린지 신청이 승인되었습니다.',
    //   targetId: id,
    // });

    return updated;
  }

  // 챌린지 거절
  async rejectChallenge(id, adminId, { rejectReason }) {
    const challenge = await this.#challengeRepository.findById(id, {
      userType: 'ADMIN',
    });
    if (!challenge) throw new NotFoundException(ERROR_CODE.CHALLENGE_NOT_FOUND);
    if (!rejectReason)
      throw new NotFoundException(ERROR_CODE.REJECT_REASON_MISSING);

    if (challenge.reviewStatus === 'REJECTED') {
      throw new NotFoundException(
        ERROR_CODE.CHALLENGE_APPLICATION_ALREADY_PROCESSED,
      );
    }

    const updated = await this.#challengeRepository.updateReviewStatus(id, {
      reviewStatus: 'REJECTED',
      progressStatus: null,
      rejectReason,
    });

    // await this.#notificationRepository.create({
    //   userId: challenge.creator.id,
    //   actorUserId: adminId,
    //   type: 'CHALLENGE_ADMIN_REJECTED',
    //   content: '챌린지 신청이 거절되었습니다.',
    //   targetId: id,
    // });

    return updated;
  }

  // 챌린지 삭제 (soft delete)
  async deleteChallenge(id, adminId, { deleteReason }) {
    const challenge = await this.#challengeRepository.findById(id, {
      userType: 'ADMIN',
    });

    if (!challenge) throw new NotFoundException(ERROR_CODE.CHALLENGE_NOT_FOUND);
    if (!deleteReason)
      throw new NotFoundException(ERROR_CODE.REJECT_REASON_MISSING);

    if (challenge.reviewStatus === 'DELETED') {
      throw new NotFoundException(
        ERROR_CODE.CHALLENGE_APPLICATION_ALREADY_PROCESSED,
      );
    }

    const updated = await this.#challengeRepository.updateToDeleted(id, {
      deleteReason,
    });

    // await this.#notificationRepository.create({
    //   userId: challenge.creator.id,
    //   actorUserId: adminId,
    //   type: 'CHALLENGE_ADMIN_REJECTED',
    //   content: '챌린지가 삭제되었습니다.',
    //   targetId: id,
    // });

    return updated;
  }

  // 챌린지 수정
  async editChallenge(id, adminId, data) {
    const challenge = await this.#challengeRepository.findById(id, {
      userType: 'ADMIN',
    });

    if (!challenge) throw new NotFoundException(ERROR_CODE.CHALLENGE_NOT_FOUND);

    const updated = await this.#challengeRepository.update(id, data);

    // await this.#notificationRepository.create({
    //   userId: challenge.creator.id,
    //   actorUserId: adminId,
    //   type: 'CHALLENGE_ADMIN_UPDATED',
    //   content: '챌린지 신청을 수정하였습니다.',
    //   targetId: id,
    // });

    return updated;
  }

  // 작업물 수정
  async editSubmission(id, adminId, data) {
    const submisson = await this.#submissionRepository.findById(id, {});

    if (!submisson)
      throw new NotFoundException(ERROR_CODE.SUBMISSION_NOT_FOUND);

    const updated = await this.#submissionRepository.update(id, data);

    // await this.#notificationRepository.create({
    //   userId: submisson.user.id,
    //   actorUserId: adminId,
    //   type: 'SUBMISSION_UPDATED',
    //   content: '작업물이 수정되었습니다.',
    //   targetId: id,
    // });

    return updated;
  }

  // 작업물 삭제(soft delete)
  async deleteSubmission(id, adminId) {
    const submisson = await this.#submissionRepository.findById(id, {});

    if (!submisson)
      throw new NotFoundException(ERROR_CODE.SUBMISSION_NOT_FOUND);

    if (submisson.isDeleted === true)
      throw new NotFoundException(ERROR_CODE.SUBMISSION_ALREADY_DELETED);

    const updated = await this.#submissionRepository.updateToDeleted(id, {
      isDeleted: true,
    });

    // await this.#notificationRepository.create({
    //   userId: submisson.user.id,
    //   actorUserId: adminId,
    //   type: 'SUBMISSION_DELETED',
    //   content: '작업물이 삭제되었습니다.',
    //   targetId: id,
    // });

    return updated;
  }

  async deleteFeedback(id, adminId) {
    const feeback = await this.#feedbackRepository.findById(id, {});

    if (!feeback) throw new NotFoundException(ERROR_CODE.FEEDBACK_NOT_FOUND);

    const updated = await this.#feedbackRepository.delete(id);

    // await this.#notificationRepository.create({
    //   userId: feeback.user.id,
    //   actorUserId: adminId,
    //   type: 'SUBMISSION_DELETED',
    //   content: '작업물이 삭제되었습니다.',
    //   targetId: id,
    // });

    return updated;
  }
}
