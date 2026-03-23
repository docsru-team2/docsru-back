import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { needsLogin } from '#middlewares';
import {} from './dto/challenge.dto.js';

export class ChallengeController extends BaseController {
  #challengeService;

  constructor({ challengeService }) {
    super();
    this.#challengeService = challengeService;
  }

  routes() {
    this.router.get(
      '/',
      // needsLogin, 로그인 여부 체크
      (req, res, next) => this.getAll(req, res, next),
    );
    this.router.get('/:id', (req, res, next) => this.getOne(req, res, next));

    this.router.post('/', needsLogin, (req, res, next) =>
      this.create(req, res, next),
    );
    this.router.post('/:id/participants', needsLogin, (req, res, next) =>
      this.join(req, res, next),
    );

    return this.router;
  }

  async getAll(req, res, next) {
    try {
      const { page, limit, sort, keyword, reviewStatus } = req.query;

      const result = await this.#challengeService.getPublicChallenges({
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        sort,
        keyword,
        reviewStatus,
      });

      res.status(HTTP_STATUS.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getOne(req, res) {
    const { id } = req.params;
    const challenge = await this.#challengeService.getChallengeDetail(id);
    res.status(HTTP_STATUS.OK).json(challenge);
  }

  async create(req, res) {
    const {
      title,
      sourceUrl,
      field,
      documentType,
      description,
      deadline,
      maxParticipants,
    } = req.body;
    const newChallenge = await this.#challengeService.registerChallenge({
      title,
      sourceUrl,
      field,
      documentType,
      description,
      deadline,
      maxParticipants,
    });
    res.status(HTTP_STATUS.CREATED).json(newChallenge);
  }

  async update(req, res) {
    const { id } = req.params;
    const {
      title,
      sourceUrl,
      field,
      documentType,
      description,
      deadline,
      maxParticipants,
    } = req.body;
    const updatedChallenge = await this.#challengeService.changeChallenge(
      id,
      req.user.id,
      {
        title,
        sourceUrl,
        field,
        documentType,
        description,
        deadline,
        maxParticipants,
      },
    );
    res.status(HTTP_STATUS.OK).json(updatedChallenge);
  }

  async delete(req, res) {
    const { id } = req.params;
    await this.#challengeService.deleteAccount(id, req.user.id);
    res.sendStatus(HTTP_STATUS.NO_CONTENT);
  }
}
