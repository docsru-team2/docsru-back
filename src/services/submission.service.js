export class SubmissionService {
  constructor({ submissionRepository, challengeRepository, notificationService }) {
    this.submissionRepository = submissionRepository;
    this.challengeRepository = challengeRepository;
    this.notificationService = notificationService;
  }
}