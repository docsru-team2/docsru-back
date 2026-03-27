import { ERROR_CODE } from '#constants';
import { ForbiddenException, NotFoundException } from '#exceptions';

export class feedbackService {
  #feedbackRepository;
  #submissionRepository;

  constructor({ feedbackRepository, submissionRepository }) {
    this.#feedbackRepository = feedbackRepository;
    this.#submissionRepository = submissionRepository;
  }

  //피드백 목록 조회
  async findAll(params) {
    const { submissionId, page = 1, limit = 10, ...rest } = params;
    const [list, totalCount] = await this.#feedbackRepository.findAll(
      submissionId,
      { page: Number(page), limit: Number(limit) },
      ...rest,
    );

    return {
      list,
      pagination: {
        totalCount,
        hasNext: page * limit < totalCount /* Boolean */,
      },
    };
  }

  //피드백 생성
  async make(submissionId, userId, data) {
    const submission = await this.#submissionRepository.findById(submissionId);

    if (!submission)
      throw new NotFoundException(ERROR_CODE.SUBMISSION_NOT_FOUND);

    return await this.#feedbackRepository.make(submissionId, {
      userId,
      ...data,
    });
  }

  //피드백 수정
  async edit(feedbackId, userId, data) {
    const feedback = await this.#feedbackRepository.findById(feedbackId);

    if (!feedback) throw new NotFoundException(ERROR_CODE.FEEDBACK_NOT_FOUND);

    if (feedback.userId !== userId)
      throw new ForbiddenException(ERROR_CODE.FORBIDDEN);

    return await this.#feedbackRepository.edit(feedbackId, data);
  }

  //피드백 삭제
  async delete(feedbackId, userId) {
    const feedback = await this.#feedbackRepository.findById(feedbackId);

    if (!feedback) throw new NotFoundException(ERROR_CODE.FEEDBACK_NOT_FOUND);

    if (feedback.userId !== userId)
      throw new ForbiddenException(ERROR_CODE.FORBIDDEN);

    return await this.#feedbackRepository.delete(feedbackId);
  }
}
