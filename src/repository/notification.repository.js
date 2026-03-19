export class NotificationRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  findAll() {
    return this.#prisma.notification.findMany({
      select: {
        id: true,

        createdAt: true,
      },
    });
  }

  findById(id) {
    return this.#prisma.notification.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,

        createdAt: true,
      },
    });
  }

  create(data) {
    return this.#prisma.notification.create({
      data,
      select: {
        id: true,

        createdAt: true,
      },
    });
  }

  update(id, data) {
    return this.#prisma.notification.update({
      where: {
        id: Number(id),
      },
      data,
      select: {
        id: true,

        createdAt: true,
      },
    });
  }

  delete(id) {
    return this.#prisma.notification.delete({
      where: {
        id: Number(id),
      },
    });
  }
}
