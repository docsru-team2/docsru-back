import { HTTP_STATUS } from '#constants';
import { BaseController } from '#controllers/base.controller.js';
import { validate, checkOwnership } from '#middlewares';
import { idParamSchema } from './dto/submission.dto.js';

export class SubmissionController extends BaseController {
  // #submissionService
  #feedbackService;
  #submissionLikeService;

  #reqData(req) {
    return {
      ...{ id: req.params.id },
      ...{ submissionId: req.submission.id },
      ...{ userId: req.user?.id },
      ...{ data: req.body },
    };
  }

  constructor({ submissionService, feedbackService, submissionLikeService }) {
    super();
    this.submissionService = submissionService;
    this.#feedbackService = feedbackService;
    this.#submissionLikeService = submissionLikeService;
  }

  routes() {
    //제출물
    //제출물 전체 조회
    //제출물 단일 조회
    //제출물 생성
    //제출물 수정
    //제출물 삭제

    //피드백
    //피드백 목록 조회
    this.router.get(
      '/:submissionId',
      validate('params', idParamSchema),
      (req, res, next) => this.getAll(req, res, next),
    );

    //피드백 생성
    this.router.post(
      '/:submissionId',
      validate('params', idParamSchema),
      (req, res, next) => this.make(req, res, next),
    );

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

  //메소드들

  //제출물
  //제출물 전체 조회
  //제출물 단일 조회
  //제출물 생성
  //제출물 수정
  //제출물 삭제

  //피드백
  //피드백 전체 조회
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

  //피드백 생성
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

  //좋아요
  //작업물 좋아요
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
        message: '번역 좋아요!',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
  //작업물 좋아요 취소
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
        message: '번역 좋아요 취소!',
        data: { id: result.id },
      });
    } catch (error) {
      next(error);
    }
  }
}
