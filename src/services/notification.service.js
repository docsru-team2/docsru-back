import { NotFoundException } from '#exceptions';
import { ERROR_CODE } from '#constants';
export class NotificationService {
  #clients = new Map();
  #notificationRepository;

  constructor({ notificationRepository }) {
    this.#notificationRepository = notificationRepository;
  }

  // ── SSE 연결 등록/해제
  addClient(userId, res) {
    this.#clients.set(userId, res);
  }

  removeClient(userId) {
    this.#clients.delete(userId);
  }

  // ── DB 저장 + 실시간 push
  async notify(userId, { type, content, targetId, actorUserId }) {
    const notification = await this.#notificationRepository.create({
      userId,
      type,
      content,
      targetId,
      actorUserId,
    });

    // 연결 중이면 바로 push, 오프라인이면 DB에만 저장된 채로 끝
    const res = this.#clients.get(userId);
    if (res) {
      res.write(`data: ${JSON.stringify(notification)}\n\n`);
    }

    return notification;
  }

  async getNotifications(userId, { cursor, limit }) {
    const parsedLimit = Number(limit) || 10;

    const [notifications, totalCount, unreadCount] =
      await this.#notificationRepository.findAllByUserId(userId, {
        cursor: cursor || undefined,
        limit: parsedLimit,
      });

    const hasMore = notifications.length > parsedLimit;
    if (hasMore) notifications.pop();

    const nextCursor =
      notifications.length > 0 ? notifications.at(-1).id : null;

    return { notifications, nextCursor, totalCount, unreadCount, hasMore };
  }

  async getNotification(id) {
    const notification = await this.#notificationRepository.findById(id);

    if (!notification)
      throw new NotFoundException(ERROR_CODE.NOTIFICATION_NOT_FOUND);

    return notification;
  }

  async markAsRead(id) {
    const notification = await this.#notificationRepository.updateToRead(id);

    if (!notification)
      throw new NotFoundException(ERROR_CODE.NOTIFICATION_NOT_FOUND);
  }

  async markAllAsRead(userId) {
    const { count } =
      await this.#notificationRepository.updateAllToRead(userId);

    if (count === 0)
      throw new NotFoundException(ERROR_CODE.NOTIFICATION_ALREADY_ALL_READ);
  }

  async deleteOne(id) {
    const notification = await this.#notificationRepository.findById(id);

    if (!notification)
      throw new NotFoundException(ERROR_CODE.NOTIFICATION_NOT_FOUND);

    return await this.#notificationRepository.deleteOne(id);
  }

  async deleteAll(userId) {
    return await this.#notificationRepository.deleteAll(userId);
  }
}
