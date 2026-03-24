import { NotFoundException } from '#exceptions';
import { ERROR_CODE } from '#constants'; 

export class ChallengeService {
  #challengeRepository;

  constructor({ challengeRepository }) {
    this.#challengeRepository = challengeRepository;
  }

  // 사용자용 목록 조회
  async getPublicChallenges(params) {
    return this.challengeRepository.findAll({
      ...params,
      isAdmin: false,
    });
  }

  // 관리자용 목록 조회
  async getAdminChallenges(params) {
    return this.challengeRepository.findAll({
      ...params,
      isAdmin: true,
    });
  }

  async listChallenges() {
    return await this.#challengeRepository.findAll();
  }

  // 상세 조회
  async getChallengeDetail(id) {
    const challenge = await this.challengeRepository.findById(id);
    if (!challenge) {
      throw new NotFoundException(ERROR_CODE.CHALLENGE_NOT_FOUND);
    }
    return challenge;
  }

  // 생성
  async createChallenge(data) {
    return this.challengeRepository.create(data);
  }

  // 수정
  async updateChallenge(id, data) {
    return this.challengeRepository.update(id, data);
  }

  // 삭제
  async deleteChallenge(id) {
    return this.challengeRepository.delete(id);
  }
}
