export class ChallengeService {
  constructor({ challengeRepository, userRepository }) {
    this.challengeRepository = challengeRepository;
    this.userRepository = userRepository;
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

  // 상세 조회
  async getChallengeDetail(id) {
    const challenge = await this.challengeRepository.findById(id);

    if (!challenge) {
      throw new Error('챌린지를 찾을 수 없습니다.');
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
