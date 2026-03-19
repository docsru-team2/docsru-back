export class SubmissionRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  findAll() {
    return this.#prisma.submission.findMany({
      select: {
        id: true,

        createdAt: true,
      },
    });
  }

  findById(id) {
    return this.#prisma.submission.findUnique({
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
    return this.#prisma.submission.create({
      data,
      select: {
        id: true,

        createdAt: true,
      },
    });
  }

  update(id, data) {
    return this.#prisma.submission.update({
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
    return this.#prisma.submission.delete({
      where: {
        id: Number(id),
      },
    });
  }
}
