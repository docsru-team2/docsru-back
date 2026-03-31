import { HTTP_STATUS } from '#constants';
import { BaseController } from '#controllers/base.controller.js';
import { needsLogin, validate, checkOwnership } from '#middlewares';
import {
  idParamSchema,
  submissionIdParamSchema,
  editSubmissionSchema,
} from './dto/submission.dto.js';

export class SubmissionController extends BaseController {
  #submissionService;
  #feedbackService;
  #submissionLikeService;

  #reqData(req) {
    return {
      ...{ id: req.params.id },
      ...{ userId: req.user?.id },
      ...{ data: req.body },
    };
  }

  constructor({ submissionService, feedbackService, submissionLikeService }) {
    super();
    this.#submissionService = submissionService;
    this.#feedbackService = feedbackService;
    this.#submissionLikeService = submissionLikeService;
  }

  routes() {
    //작업물 단일 조회
    this.router.get(
      '/:id',
      validate('params', idParamSchema),
      (req, res, next) => this.getDetailSubmission(req, res, next),
    );

    //작업물 수정
    this.router.patch(
      '/:id',
      needsLogin,
      validate('params', idParamSchema, 'body', editSubmissionSchema),
      checkOwnership(this.#submissionService, 'userId'),
      (req, res, next) => this.editSubmission(req, res, next),
    );
    //작업물 삭제
    this.router.delete(
      '/:id',
      needsLogin,
      validate('params', idParamSchema),
      checkOwnership(this.#submissionService, 'userId'),
      (req, res, next) => this.deleteSubmission(req, res, next),
    );

    //피드백
    //피드백 목록 조회
    this.router.get(
      '/:submissionId/feedbacks',
      validate('params', submissionIdParamSchema),
      (req, res, next) => this.getAllFeedback(req, res, next),
    );

    //피드백 생성
    this.router.post(
      '/:submissionId/feedbacks',
      validate('params', submissionIdParamSchema),
      (req, res, next) => this.createFeedback(req, res, next),
    );

    //좋아요
    this.router.post(
      '/:submissionId/likes',
      validate('params', submissionIdParamSchema),
      (req, res, next) => this.like(req, res, next),
    );

    //좋아요 취소
    this.router.delete(
      '/:submissionId/likes',
      validate('params', submissionIdParamSchema),
      (req, res, next) => this.cancel(req, res, next),
    );

    return this.router;
  }

  //메소드들
  //작업물
  //작업물 상세 조회
  async getDetailSubmission(req, res, next) {
    try {
      const id = req.params.id;
      const submission = await this.#submissionService.findDetail(id);
      res
        .status(HTTP_STATUS.OK)
        .json({ ...{ success: true }, data: submission });
    } catch (error) {
      next(error);
    }
  }

  //작업물 수정
  async editSubmission(req, res, next) {
    try {
      const { id, data } = this.#reqData(req);
      const updatedSubmission = await this.#submissionService.update(id, data);
      res.status(HTTP_STATUS.OK).json({
        ...{ success: true, message: '작업물을 수정했습니다.' },
        data: updatedSubmission,
      });
    } catch (error) {
      next(error);
    }
  }
  //작업물 삭제처리(소프트)
  async deleteSubmission(req, res, next) {
    try {
      const { id } = this.#reqData(req);
      const deletedSubmission = await this.#submissionService.delete(id);
      res.status(HTTP_STATUS.OK).json({
        ...{ success: true, message: '작업물을 삭제했습니다.' },
        data: deletedSubmission,
      });
    } catch (error) {
      next(error);
    }
  }

  //피드백
  //피드백 전체 조회
  async getAllFeedback(req, res, next) {
    try {
      const submissionId = req.params.submissionId;
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
  async createFeedback(req, res, next) {
    try {
      const submissionId = req.params.submissionId;
      const { userId, data } = this.#reqData(req);
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
      const { submissionId } = req.params;
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
      const { submissionId } = req.params;
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
