import { ERROR_CODE } from '#constants';
import {
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '#exceptions';

export class SubmissionLikeService {
  #submissionLikeRepository;
  #submissionRepository;

  constructor({ submissionLikeRepository, submissionRepository }) {
    this.#submissionLikeRepository = submissionLikeRepository;
    this.#submissionRepository = submissionRepository;
  }

  async #likeValidation(submissionId, userId) {
    const submission = await this.#submissionRepository.findById(submissionId);
    const isLiked = await this.#submissionLikeRepository.findIfUserLike(
      submissionId,
      userId,
    );
    //작업물 존재 여부 확인
    if (!submission) {
      throw new NotFoundException(ERROR_CODE.SUBMISSION_NOT_FOUND);
    }
    //본인 작업물 확인
    if (submission.userId === userId) {
      throw new ForbiddenException(ERROR_CODE.CANNOT_LIKE_MINE);
    }

    return { submission, isLiked };
  }

  //좋아요
  async like(submissionId, userId) {
    const { isLiked } = await this.#likeValidation(submissionId, userId);

    //좋아요 여부 확인
    if (isLiked) {
      throw new ConflictException(ERROR_CODE.SUBMISSION_LIKE_ALREADY_EXISTS);
    }
    return await this.#submissionLikeRepository.like(submissionId, userId);
  }

  //좋아요 취소
  async cancel(submissionId, userId) {
    const { isLiked } = await this.#likeValidation(submissionId, userId);

    //좋아요 여부 확인
    if (!isLiked) {
      throw new NotFoundException(ERROR_CODE.SUBMISSION_LIKE_NOT_FOUND);
    }
    return await this.#submissionLikeRepository.cancel(submissionId, userId);
  }
}
