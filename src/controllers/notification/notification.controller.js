import { BaseController } from '#controllers/base.controller.js';
// import { HTTP_STATUS } from '#constants';
// import { needsLogin } from '#middlewares';
import {  } from './dto/notification.dto.js';

export class NotificationController extends BaseController {
  constructor({ notificationService }) {
    super();
    this.notificationService = notificationService;
  }

  routes() {
    return this.router;
  }
}