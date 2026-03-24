import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { validate, needsLogin } from '#middlewares';
import { createUserSchema, idParamSchema } from './dto/user.dto.js';

export class UserController extends BaseController {
  #userService;

  constructor({ userService }) {
    super();
    this.#userService = userService;
  }

  routes() {
    this.router.get('/', (req, res) => this.findAll(req, res));
    this.router.get('/:id', validate('params', idParamSchema), (req, res) =>
      this.findById(req, res),
    );
    this.router.get(
      '/me',
      needsLogin,
      validate('params', idParamSchema),
      (req, res) => this.findById(req, res),
    );
    this.router.post('/', validate('body', createUserSchema), (req, res) =>
      this.create(req, res),
    );
    return this.router;
  }

  async findAll(req, res) {
    const users = await this.#userService.listUsers();
    res.status(HTTP_STATUS.OK).json(users);
  }

  async findById(req, res) {
    const { id } = req.params;
    const user = await this.#userService.getUserDetail(id);
    res.status(HTTP_STATUS.OK).json(user);
  }

  async create(req, res) {
    const { email, password, nickname } = req.body;
    const newUser = await this.#userService.registerUser({
      email,
      password,
      nickname,
    });
    res.status(HTTP_STATUS.CREATED).json(newUser);
  }
}
