import { HTTP_STATUS } from '#constants';
import { BaseController } from '#controllers/base.controller.js';
import { validate } from '#middlewares';
import { idParamSchema } from './dto/submission.dto.js';

export class SubmissionController extends BaseController {
  // #submissionService;
  #submissionLikeService;

  constructor({ /*submissionService,*/ submissionLikeService }) {
    super();
    // this.#submissionService = submissionService;
    this.#submissionLikeService = submissionLikeService;
  }

  routes() {
    //좋아요
    this.router.post(
      '/:id/likes',
      validate('params', idParamSchema),
      (req, res, next) => this.like(req, res, next),
    );

    //좋아요 취소
    this.router.delete(
      '/:id/likes',
      validate('params', idParamSchema),
      (req, res, next) => this.cancel(req, res, next),
    );

    return this.router;
  }

  async like(req, res, next) {
    try {
      const { id: submissionId } = req.params;
      const userId = req.user.id;
      const result = await this.#submissionLikeService.like(
        submissionId,
        userId,
      );

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: '게시물 좋아요!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async cancel(req, res, next) {
    try {
      const { id: submissionId } = req.params;
      const userId = req.user.id;
      const result = await this.#submissionLikeService.cancel(
        submissionId,
        userId,
      );

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: '게시물 좋아요 취소!',
        data: { id: result.id },
      });
    } catch (error) {
      next(error);
    }
  }
}
