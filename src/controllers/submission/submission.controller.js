import { BaseController } from '#controllers/base.controller.js';

export class SubmissionController extends BaseController {
  constructor({ submissionService }) {
    super();
    this.submissionService = submissionService;
  }

  routes() {
    return this.router;
  }
}