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
    this.router.get('/', (req, res, next) => this.getAll(req, res, next));
    this.router.get('/:id', (req, res, next) => this.getOne(req, res, next));

    this.router.post('/', needsLogin, (req, res, next) =>
      this.create(req, res, next),
    );
    this.router.post('/:id/participants', needsLogin, (req, res, next) =>
      this.join(req, res, next),
    );

    return this.router;
  }

  async findAll(req, res) {
    const challenges = await this.#challengeService.listChallenges();
    res.status(HTTP_STATUS.OK).json(challenges);
  }

  async findById(req, res) {
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
