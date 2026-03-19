export class AdminService {
  constructor({ userRepository, challengeRepository, submissionRepository, notificationService }) {
    this.userRepository = userRepository;
    this.challengeRepository = challengeRepository;
    this.submissionRepository = submissionRepository;
    this.notificationService = notificationService;
  }
}