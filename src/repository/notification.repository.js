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
  findAllByUserId(id, { cursor, limit = 10 }) {
    const where = { userId: id, ...(cursor && { id: { lt: cursor } }) };

    return Promise.all([
      this.#prisma.notification.findMany({
        where,
        take: limit + 1,
        orderBy: { createdAt: 'desc' },
        select: notificationSelect,
      }),
      this.#prisma.notification.count({ where }), // totalCount
      this.#prisma.notification.count({ where: { ...where, isRead: false } }), // unreadCount
    ]);
  }

  // 알림 단건 조회
  findById(id) {
    return this.#prisma.notification.findUnique({
      where: {
        id,
      },
      select: notificationSelect,
    });
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
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  // 알람 삭제 (단건)
  deleteOne(id) {
    return this.#prisma.notification.delete({
      where: { id },
    });
  }

  // 알람 삭제 (전체)
  deleteAll(userId) {
    return this.#prisma.notification.deleteMany({
      where: { userId },
    });
  }
}
