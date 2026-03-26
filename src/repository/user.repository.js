export class UserRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  get #selectCase() {
    return {
      id: true,
      email: true,
      nickname: true,
      provider: true,
      userType: true,
      grade: true,
      createdAt: true,
      updatedAt: true,
    };
  }

  findAll() {
    return this.#prisma.user.findMany({
      select: this.#selectCase,
    });
  }

  async findBy(where, { includePassword = false } = {}) {
    return await this.#prisma.user.findUnique({
      where,
      select: {
        ...this.#selectCase,
        ...(includePassword ? { passwordHash: true } : {}),
      },
    });
  }

  create(data) {
    return this.#prisma.user.create({
      data,
      select: this.#selectCase,
    });
  }

  update(id, data) {
    return this.#prisma.user.update({
      where: {
        id: id,
      },
      data,
      select: this.#selectCase,
    });
  }

  delete(id) {
    return this.#prisma.user.delete({
      where: {
        id: id,
      },
    });
  }

  findBySocialAccount(provider, providerAccountId) {
    return this.#prisma.user.findFirst({
      where: { provider, providerAccountId },
      select: this.#selectCase,
    });
  }

  createWithSocialAccount(data) {
    return this.#prisma.user.create({
      data,
      select: this.#selectCase,
    });
  }

  connectSocialAccount(email, { provider, providerAccountId }) {
    return this.#prisma.socialAccount.create({
      data: { provider, providerAccountId, email },
    });
  }
}
