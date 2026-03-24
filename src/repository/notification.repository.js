const notificationSelect = {
  id: true,
  type: true,
  content: true,
  isRead: true,
  targetId: true,
  actorUserId: true,
  createdAt: true,
};

const notificationToReadSelect = {
  id: true,
  isRead: true,
};

export class NotificationRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  //내 알림 목록 조회
  findAll(id, { page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;
    const where = { userId: id };

    return Promise.all([
      this.#prisma.notification.findMany({
        where,
        skip,
        take: limit,
        select: notificationSelect,
      }),
      this.#prisma.notification.count({ where }), // totalCount
      this.#prisma.notification.count({ where: { ...where, isRead: false } }), // unreadCount
    ]);
  }

  // 알림 생성 (내부에서만 호출)
  create(data) {
    return this.#prisma.notification.create({
      data,
      select: notificationSelect,
    });
  }

  //읽음 처리 (단건)
  updateToRead(id) {
    return this.#prisma.notification.update({
      where: {
        id,
      },
      data: { isRead: true },
      select: notificationToReadSelect,
    });
  }

  // 읽음 처리 (전체)
  updateAllToRead(userId) {
    return this.#prisma.notification.updateMany({
      where: {
        userId,
      },
      data: { isRead: true },
    });
  }
}
