export class ChallengeRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  findAll() {
    return this.#prisma.challenge.findMany({
      select: {
        id: true,

        createdAt: true,
      },
    });
  }

  findById(id) {
    return this.#prisma.challenge.findUnique({
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
    return this.#prisma.challenge.create({
      data,
      select: {
        id: true,

        createdAt: true,
      },
    });
  }

  update(id, data) {
    return this.#prisma.challenge.update({
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
    return this.#prisma.challenge.delete({
      where: {
        id: Number(id),
      },
    });
  }
}
