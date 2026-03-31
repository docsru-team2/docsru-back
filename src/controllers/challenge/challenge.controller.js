import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import {
  createChallengeSchema,
  editChallengeSchema,
  idParamSchema,
  createSubmissionSchema,
  createDraftSchema,
  editDraftSchema,
} from './dto/challenge.dto.js';
import { needsLogin, validate, checkOwnership } from '#middlewares';

export class ChallengeController extends BaseController {
  #challengeService;
  #submissionService;

  #reqData(req) {
    return {
      ...{ id: req.params.id },
      ...{ submissionId: req.submission.id },
      ...{ userId: req.user?.id },
      ...{ data: req.body },
    };
  }

  constructor({ challengeService, submissionService }) {
    super();
    this.#challengeService = challengeService;
    this.#submissionService = submissionService;
  }

  routes() {
    this.router.get('/', (req, res, next) => this.getAll(req, res, next));
    this.router.get(
      '/:id',
      validate('params', idParamSchema),
      (req, res, next) => this.getOne(req, res, next),
    );
    this.router.post(
      '/',
      validate('body', createChallengeSchema),
      (req, res, next) => this.create(req, res, next),
    );
    this.router.patch(
      '/:id',
      needsLogin,
      validate('params', idParamSchema, 'body', editChallengeSchema),
      checkOwnership(this.#challengeService, 'creatorId'),
      (req, res, next) => this.update(req, res, next),
    );
    this.router.delete(
      '/:id',
      needsLogin,
      validate('params', idParamSchema),
      checkOwnership(this.#challengeService, 'creatorId'),
      (req, res, next) => this.delete(req, res, next),
    );

    this.router.get(
      '/:id/participants',
      validate('params', idParamSchema),
      (req, res, next) => this.getParticipants(req, res, next),
    );
    this.router.post(
      '/:id/participants',
      validate('params', idParamSchema),
      (req, res, next) => this.join(req, res, next),
    );

    this.router.get('/me/applied', needsLogin, (req, res, next) => {
      req.query.userId = req.user.id;
      return this.getMyList(req, res, next);
    });
    this.router.get('/me/ongoing', needsLogin, (req, res, next) => {
      req.query.userId = req.user.id;
      req.query.progressStatus = 'OPEN';
      return this.getMyList(req, res, next);
    });
    this.router.get('/me/completed', needsLogin, (req, res, next) => {
      req.query.userId = req.user.id;
      req.query.progressStatus = 'CLOSED';
      return this.getMyList(req, res, next);
    });

    //작업물
    //작업물 목록 조회
    this.router.get(
      '/:challengeId/submissions',
      validate('params', idParamSchema),
      (req, res, next) => this.getAllSubmissions(req, res, next),
    );
    //베스트 작업물 목록 조회
    this.router.get(
      '/:challengeId/submissions/best',
      validate('params', idParamSchema),
      (req, res, next) => this.getBestList(req, res, next),
    );
    //작업물 생성
    this.router.post(
      '/:challengeId/submissions',
      validate('body', createSubmissionSchema),
      (req, res, next) => this.create(req, res, next),
    );
    return this.router;
  }

  async getAll(req, res, next) {
    try {
      const { page, limit, orderBy, keyword, reviewStatus } = req.query;

      const result = await this.#challengeService.findAll({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        orderBy,
        keyword,
        reviewStatus,
      });

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getOne(req, res, next) {
    try {
      const { id } = req.params;
      const challenge = await this.#challengeService.findDetail(id);
      res.status(HTTP_STATUS.OK).json(challenge);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const data = req.body;
      const newChallenge = await this.#challengeService.make({
        ...data,
        creatorId: req.user.id,
      });
      res.status(HTTP_STATUS.CREATED).json(newChallenge);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;
      const updatedChallenge = await this.#challengeService.edit(
        id,
        req.user.id,
        data,
      );
      res.status(HTTP_STATUS.OK).json(updatedChallenge);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await this.#challengeService.delete(id, req.user.id);
      res.status(HTTP_STATUS.NO_CONTENT).json({
        success: true,
        message: '챌린지 신청이 취소되었습니다.',
      });
    } catch (error) {
      next(error);
    }
  }

  async join(req, res, next) {
    try {
      const { id } = req.params;
      const result = await this.#challengeService.joinChallenge(
        id,
        req.user.id,
      );
      res.status(HTTP_STATUS.CREATED).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getParticipants(req, res, next) {
    try {
      const { id } = req.params;
      const result = await this.#challengeService.getParticipants(
        id,
        req.query,
      );
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMyList(req, res, next) {
    try {
      const { page, limit, orderBy, ...rest } = req.query;

      const result = await this.#challengeService.findMyChallenges({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        sort: orderBy,
        userId: req.user.id,
        ...rest,
      });

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  }
  //작업물 전체 조회
  async getAllSubmissions(req, res, next) {
    try {
      const { challengeId } = this.#reqData(req);
      const { page, limit, orderBy } = req.query;

      const result = await this.#submissionService.findAll({
        challengeId,
        page: Number(page) || 1,
        limit: Number(limit) || 5,
        orderBy,
      });

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  //베스트 작업물 목록 조회
  async getBestList(req, res, next) {
    try {
      const { challengeId } = this.#reqData(req);
      const result = await this.#submissionService.findBestList(challengeId);
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  //작업물 생성
  async createSubmission(req, res, next) {
    try {
      const { challengeId, userId, data } = this.#reqData(req);
      const newSubmission = await this.#submissionService.create(
        challengeId,
        userId,
        data,
      );
      res.status(HTTP_STATUS.OK).json({
        ...{ success: true, message: '작업물이 생성되었습니다.' },
        data: newSubmission,
      });
    } catch (error) {
      next(error);
    }
  }
}
export class DraftController extends BaseController {
  #draftService;

  #reqData(req) {
    return {
      id: req.params.id,
      userId: req.user?.id,
      data: req.body,
    };
  }

  constructor({ draftService }) {
    super();
    this.#draftService = draftService;
  }

  routes() {
    // 임시저장 목록 조회
    this.router.get('/', needsLogin, (req, res, next) =>
      this.getAll(req, res, next),
    );
    // 임시저장 상세 조회
    this.router.get(
      '/:id',
      needsLogin,
      validate('params', idParamSchema),
      (req, res, next) => this.getOne(req, res, next),
    );
    // 임시저장 생성
    this.router.post(
      '/',
      needsLogin,
      validate('body', createDraftSchema),
      (req, res, next) => this.create(req, res, next),
    );
    // 임시저장 수정
    this.router.patch(
      '/:id',
      needsLogin,
      validate('params', idParamSchema, 'body', editDraftSchema),
      (req, res, next) => this.update(req, res, next),
    );
    // 임시저장 삭제
    this.router.delete(
      '/:id',
      needsLogin,
      validate('params', idParamSchema),
      (req, res, next) => this.delete(req, res, next),
    );

    return this.router;
  }

  // 임시저장 목록 조회
  async getAll(req, res, next) {
    try {
      const { page, limit } = req.query;
      const userId = req.user.id;

      const result = await this.#draftService.findAll({
        userId,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
      });

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  // 임시저장 상세 조회
  async getOne(req, res, next) {
    try {
      const { id } = req.params;
      const draft = await this.#draftService.findDetail(id);
      res.status(HTTP_STATUS.OK).json({ success: true, data: draft });
    } catch (error) {
      next(error);
    }
  }

  // 임시저장 생성
  async create(req, res, next) {
    try {
      const { userId, data } = this.#reqData(req);
      const challengeId = req.params.challengeId;
      const newDraft = await this.#draftService.create(
        challengeId,
        userId,
        data,
      );
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: '임시저장이 생성되었습니다.',
        data: newDraft,
      });
    } catch (error) {
      next(error);
    }
  }

  // 임시저장 수정
  async update(req, res, next) {
    try {
      const { id, userId, data } = this.#reqData(req);
      const updatedDraft = await this.#draftService.update(id, userId, data);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: '임시저장이 수정되었습니다.',
        data: updatedDraft,
      });
    } catch (error) {
      next(error);
    }
  }

  // 임시저장 삭제
  async delete(req, res, next) {
    try {
      const { id, userId } = this.#reqData(req);
      const deletedDraft = await this.#draftService.delete(id, userId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: '임시저장이 삭제되었습니다.',
        data: deletedDraft,
      });
    } catch (error) {
      next(error);
    }
  }
}
