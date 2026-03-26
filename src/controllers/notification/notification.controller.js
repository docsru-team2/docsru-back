import { BaseController } from '#controllers/base.controller.js';
import { idParamSchema } from './dto/notification.dto.js';
import { validate } from '#middlewares';
import { HTTP_STATUS } from '#constants';

export class NotificationController extends BaseController {
  #notificationService;

  constructor({ notificationService }) {
    super();
    this.#notificationService = notificationService;
  }

  routes() {
    this.router.get('/stream', (req, res) => this.stream(req, res));
    this.router.get('/', (req, res) => this.getAll(req, res));
    this.router.patch('/read-all', (req, res) => this.markAllAsRead(req, res));
    this.router.delete('/all', (req, res) => this.deleteAll(req, res));
    this.router.get('/:id', validate('params', idParamSchema), (req, res) =>
      this.getOne(req, res),
    );
    this.router.patch('/:id', validate('params', idParamSchema), (req, res) =>
      this.markAsRead(req, res),
    );
    this.router.delete('/:id', validate('params', idParamSchema), (req, res) =>
      this.delete(req, res),
    );
    return this.router;
  }

  // SSE 연결
  stream(req, res) {
    const { id: userId } = req.user;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    this.#notificationService.addClient(userId, res);

    req.on('close', () => {
      this.#notificationService.removeClient(userId);
    });
  }

  async getAll(req, res) {
    const { id: userId } = req.user;
    const result = await this.#notificationService.getNotifications(
      userId,
      req.query,
    );

    res.status(HTTP_STATUS.OK).json(result);
  }

  async getOne(req, res) {
    const { id } = req.params;
    const result = await this.#notificationService.getNotification(id);
    res.status(HTTP_STATUS.OK).json(result);
  }

  async markAsRead(req, res) {
    const { id } = req.params;
    const result = await this.#notificationService.markAsRead(id);
    res.status(HTTP_STATUS.OK).json(result);
  }

  async markAllAsRead(req, res) {
    const { id: userId } = req.user;
    await this.#notificationService.markAllAsRead(userId);
    res.status(HTTP_STATUS.OK).json({ message: '전체 읽음 처리 완료' });
  }

  async delete(req, res) {
    const { id } = req.params;
    await this.#notificationService.deleteOne(id);
    res.status(HTTP_STATUS.NO_CONTENT).send();
  }

  async deleteAll(req, res) {
    const { id: userId } = req.user;
    await this.#notificationService.deleteAll(userId);
    res.status(HTTP_STATUS.NO_CONTENT).send();
  }
}
