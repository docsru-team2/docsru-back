import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import {
  createChallengeSchema,
  editChallengeSchema,
  idParamSchema,
} from './dto/challenge.dto.js';
import { needsLogin, validate, checkOwnership } from '#middlewares';

export class ChallengeController extends BaseController {
  #challengeService;

  constructor({ challengeService }) {
    super();
    this.#challengeService = challengeService;
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
}
