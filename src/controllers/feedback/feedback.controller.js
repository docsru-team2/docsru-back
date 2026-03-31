import { HTTP_STATUS } from '#constants';
import { BaseController } from '#controllers/base.controller.js';
import { validate, checkOwnership, needsLogin } from '#middlewares';
import { idParamSchema } from './dto/feedback.dto.js';

export class FeedbackController extends BaseController {
  #feedbackService;
  #reqData(req) {
    return {
      ...{ id: req.params.id },
      ...{ userId: req.user?.id },
      ...{ data: req.body },
    };
  }

  constructor({ feedbackService }) {
    super();
    this.#feedbackService = feedbackService;
  }

  routes() {
    this.router.patch(
      '/:id',
      needsLogin,
      validate('params', idParamSchema),
      checkOwnership(this.#feedbackService, 'userId'),
      (req, res, next) => this.update(req, res, next),
    );
    this.router.delete(
      '/:id',
      needsLogin,
      validate('params', idParamSchema),
      checkOwnership(this.#feedbackService, 'userId'),
      (req, res, next) => this.delete(req, res, next),
    );
    return this.router;
  }

  //   //피드백 단일 조회
  // async getOne(req, res, next) {
  //   try {
  //     const { id } = req.params;
  //     const feedback = await this.#feedbackService.findDetail(id);
  //     res.status(HTTP_STATUS.OK).json(feedback);
  //   } catch (error) {
  //     next(error);
  //   }
  // }

  async update(req, res, next) {
    try {
      const { id, userId, data } = this.#reqData(req);
      const updatedFeedback = await this.#feedbackService.edit(
        id,
        userId,
        data,
      );
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: `피드백이 수정되었습니다.`,
        data: updatedFeedback,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id, userId } = this.#reqData(req);
      const deletedFeedback = await this.#feedbackService.delete(id, userId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: '피드백이 삭제되었습니다.',
        data: deletedFeedback.id,
      });
    } catch (error) {
      next(error);
    }
  }
}
