import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { validate, needsLogin } from '#middlewares';
import { signUpSchema, loginSchema } from './dto/auth.dto.js';

export class AuthController extends BaseController {
  #authService;
  #cookieProvider;

  constructor({ authService, cookieProvider }) {
    super();
    this.#authService = authService;
    this.#cookieProvider = cookieProvider;
  }

  routes() {
    this.router.post('/signup', validate('body', signUpSchema), (req, res) =>
      this.signUp(req, res),
    );
    this.router.post('/login', validate('body', loginSchema), (req, res) =>
      this.login(req, res),
    );
    this.router.get('/me', needsLogin, (req, res) => this.me(req, res));
    return this.router;
  }

  async signUp(req, res) {
    const { email, password, name } = req.body;
    const { user, tokens } = await this.#authService.signUp({
      email,
      password,
      name,
    });

    this.#cookieProvider.setAuthCookies(res, tokens);
    res.status(HTTP_STATUS.CREATED).json(user);
  }

  async login(req, res) {
    const { email, password } = req.body;
    const { user, tokens } = await this.#authService.login({
      email,
      password,
    });

    this.#cookieProvider.setAuthCookies(res, tokens);
    res.status(HTTP_STATUS.OK).json(user);
  }

  async logout(req, res) {
    this.#cookieProvider.clearAuthCookies(res);
    res.sendStatus(HTTP_STATUS.NO_CONTENT);
  }

  async me(req, res) {
    const user = await this.#authService.getMe(req.user.id);
    res.status(HTTP_STATUS.OK).json(user);
  }
}
