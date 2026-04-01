import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import {
  createChallengeSchema,
  editChallengeSchema,
  idParamSchema,
  createSubmissionSchema,
  challengeIdParamSchema,
} from './dto/challenge.dto.js';
import { createDraftSchema, editDraftSchema } from './dto/draft.dto.js';
import { needsLogin, validate, checkOwnership } from '#middlewares';

export class ChallengeController extends BaseController {
  #challengeService;
  #submissionService;
  #draftService;

  #reqData(req) {
    return {
      ...{ id: req.params.id },
      ...{ challengeId: req.params.challengeId },
      ...{ userId: req.user?.id },
      ...{ data: req.body },
    };
  }

  constructor({ challengeService, submissionService, draftService }) {
    super();
    this.#challengeService = challengeService;
    this.#submissionService = submissionService;
    this.#draftService = draftService;
  }

  routes() {
    this.router.get('/me/applied', needsLogin, (req, res, next) =>
      this.getApplied(req, res, next),
    );
    this.router.get('/joined', needsLogin, (req, res, next) =>
      this.getJoined(req, res, next),
    );

    this.router.get('/', (req, res, next) => this.getAll(req, res, next));
    this.router.get(
      '/:id',
      validate('params', idParamSchema),
      (req, res, next) => this.getOne(req, res, next),
    );
    this.router.post(
      '/',
      needsLogin,
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
      needsLogin,
      validate('params', idParamSchema),
      (req, res, next) => this.join(req, res, next),
    );

    // 임시저장
    this.router.get('/:challengeId/drafts', needsLogin, (req, res, next) =>
      this.getAllDraft(req, res, next),
    );
    this.router.get(
      '/:challengeId/draft/:draftId',
      needsLogin,
      validate('params', challengeIdParamSchema),
      (req, res, next) => this.getOneDraft(req, res, next),
    );
    this.router.post(
      '/:challengeId/draft',
      needsLogin,
      validate('body', createDraftSchema),
      (req, res, next) => this.createDraft(req, res, next),
    );

    this.router.patch(
      '/:challengeId/draft/:draftId',
      needsLogin,
      validate('body', editDraftSchema),
      (req, res, next) => this.updateDraft(req, res, next),
    );

    this.router.delete(
      '/:challengeId/draft/:draftId',
      needsLogin,
      (req, res, next) => this.deleteDraft(req, res, next),
    );

    //작업물
    //베스트 작업물 목록 조회
    this.router.get(
      '/:challengeId/submissions/best',
      needsLogin,
      validate('params', challengeIdParamSchema),
      (req, res, next) => this.getBestList(req, res, next),
    );
    //작업물 목록 조회
    this.router.get(
      '/:challengeId/submissions',
      needsLogin,
      validate('params', challengeIdParamSchema),
      (req, res, next) => this.getAllSubmissions(req, res, next),
    );
    //작업물 생성
    this.router.post(
      '/:challengeId/submissions',
      needsLogin,
      validate('body', createSubmissionSchema),
      (req, res, next) => this.createSubmission(req, res, next),
    );
    return this.router;
  }

  async getAll(req, res, next) {
    try {
      const {
        page,
        limit,
        orderBy,
        keyword,
        reviewStatus,
        field,
        documentType,
        progressStatus,
      } = req.query;

      const result = await this.#challengeService.findAll({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        orderBy,
        keyword,
        reviewStatus,
        field,
        documentType,
        progressStatus,
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

  async getApplied(req, res, next) {
    try {
      const { page, limit, orderBy, keyword, reviewStatus } = req.query;
      const result = await this.#challengeService.findAppliedChallenges({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        orderBy,
        keyword,
        reviewStatus,
        creatorId: req.user.id,
      });
      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getJoined(req, res, next) {
    try {
      const { page, limit, keyword, progressStatus } = req.query;
      const result = await this.#challengeService.findJoinedChallenges({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        keyword,
        progressStatus,
        userId: req.user.id,
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

  // 임시저장 목록 조회
  async getAllDraft(req, res, next) {
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
  async getOneDraft(req, res, next) {
    try {
      const { id } = req.params;
      const draft = await this.#draftService.findDetail(id);
      res.status(HTTP_STATUS.OK).json({ success: true, data: draft });
    } catch (error) {
      next(error);
    }
  }

  // 임시저장 생성
  async createDraft(req, res, next) {
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
  async updateDraft(req, res, next) {
    try {
      const draftId = req.params.draftId;
      const { userId, data } = this.#reqData(req);
      const updatedDraft = await this.#draftService.update(
        draftId,
        userId,
        data,
      );
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
  async deleteDraft(req, res, next) {
    try {
      const draftId = req.params.draftId;
      const { userId } = this.#reqData(req);
      const deletedDraft = await this.#draftService.delete(draftId, userId);
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
