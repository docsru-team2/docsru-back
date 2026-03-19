import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { validate, needsLogin } from '#middlewares';
import { createUserSchema, idParamSchema } from './dto/addmin.dto.js';

export class UserController extends BaseController {
  #userService;

  constructor({ userService }) {
    super();
    this.#userService = userService;
  }

  routes() {
    this.router.get('/', needsLogin, (req, res) => this.findAll(req, res));
    this.router.get('/:id', validate('params', idParamSchema), (req, res) =>
      this.findById(req, res),
    );
    this.router.get(
      '/me',
      
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

  
}
