import { format } from 'date-fns';
import { BaseController } from './base.controller.js';
import { needsLogin } from '#middlewares';

export * from './auth/index.js';
export * from './user/index.js';
export * from './challenge/index.js';
export * from './submission/index.js';
export * from './notification/index.js';
export * from './admin/index.js';

export class Controller extends BaseController {
  #authController;
  #adminController;
  #userController;
  #challengeController;
  #submissionController;
  #notificationController;

  constructor({
    authController,
    userController,
    challengeController,
    adminController,
    submissionController,
    notificationController,
  }) {
    super();
    this.#authController = authController;
    this.#userController = userController;
    this.#challengeController = challengeController;
    this.#submissionController = submissionController;
    this.#notificationController = notificationController;
    this.#adminController = adminController;
  }

  routes() {
    this.router.use('/auth', this.#authController.routes());
    this.router.use('/users', needsLogin, this.#userController.routes());
    this.router.use('/admin', needsLogin, this.#adminController.routes());
    this.router.use('/challenges', this.#challengeController.routes());
    this.router.use(
      '/submissions',
      needsLogin,
      this.#submissionController.routes(),
    );
    this.router.use(
      '/feedbacks',
      needsLogin,
      this.#submissionController.routes(),
    );
    this.router.use(
      '/notifications',
      needsLogin,
      this.#notificationController.routes(),
    );
    this.router.get('/ping', (req, res) => this.ping(req, res));

    return this.router;
  }

  ping(req, res) {
    const time = new Date();
    const formattedTime = format(time, 'yyyy-MM-dd HH:mm:ss');
    const message = `현재 시간: ${formattedTime}`;
    res.status(200).json({ message });
  }
}
