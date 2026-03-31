import { ERROR_CODE } from '#constants';
import { ForbiddenException, NotFoundException } from '#exceptions';

export class DraftService {
  #draftRepository;

  constructor({ draftRepository }) {
    this.#draftRepository = draftRepository;
  }

  // 임시저장 목록 조회
  async findAll(params) {
    const { userId, page = 1, limit = 10 } = params || {};
    const [list, totalCount] = await this.#draftRepository.findAll(userId, {
      page: Number(page),
      limit: Number(limit),
    });

    return {
      list,
      pagination: {
        totalCount,
        hasNext: page * limit < totalCount,
      },
    };
  }

  // 임시저장 상세 조회
  async findDetail(id) {
    const draft = await this.#draftRepository.findById(id);
    if (!draft) throw new NotFoundException(ERROR_CODE.DRAFT_NOT_FOUND);
    return draft;
  }

  // 임시저장 생성
  async create(challengeId, userId, data) {
    return await this.#draftRepository.create(userId, challengeId, data);
  }

  // 임시저장 수정
  async update(draftId, userId, data) {
    const draft = await this.findDetail(draftId);
    if (draft.userId !== userId)
      throw new ForbiddenException(ERROR_CODE.AUTH_FORBIDDEN);
    return await this.#draftRepository.update(draftId, data);
  }

  // 임시저장 삭제
  async delete(draftId, userId) {
    const draft = await this.findDetail(draftId);
    if (draft.userId !== userId)
      throw new ForbiddenException(ERROR_CODE.AUTH_FORBIDDEN);
    return await this.#draftRepository.delete(draftId);
  }

  // 있으면 수정, 없으면 생성
  async upsert(challengeId, userId, data) {
    return await this.#draftRepository.upsert(challengeId, userId, data);
  }
}
