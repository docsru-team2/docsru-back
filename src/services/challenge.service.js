export class ChallengeService {
  constructor({ challengeRepository, userRepository }) {
    this.challengeRepository = challengeRepository;
    this.userRepository = userRepository;
  }
}