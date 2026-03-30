import { HTTP_STATUS } from '#constants';
import { BaseController } from '#controllers/base.controller.js';

export class SubmissionController extends BaseController {
  // #submissionService
  #feedbackService;

  #reqData(req) {
    return {
      ...{ id: req.params.id },
      ...{ submissionId: req.submission.id },
      ...{ userId: req.user?.id },
      ...{ data: req.body },
    };
  }

  constructor({ submissionService, feedbackService }) {
    super();
    this.submissionService = submissionService;
    this.#feedbackService = feedbackService;
  }

  routes() {
    return this.router;
  }

  async make(req, res, next) {
    try {
      const { submissionId, userId, data } = this.#reqData(req);
      const feedback = await this.#feedbackService.make(
        submissionId,
        userId,
        data,
      );
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: `피드백을 생성했습니다.`,
        data: feedback,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { submissionId } = this.#reqData(req);
      const { page, limit, orderBy } = req.query;

      const result = await this.#feedbackService.findAll({
        submissionId,
        page: Number(page) || 1,
        limit: Number(limit) || 3,
        orderBy,
      });

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getOne(req, res, next) {
    try {
      const { id } = req.params;
      const feedback = await this.#feedbackService.findDetail(id);
      res.status(HTTP_STATUS.OK).json(feedback);
    } catch (error) {
      next(error);
    }
  }
}
