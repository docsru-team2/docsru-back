export class UserRepository {
  #prisma;

  constructor({ prisma }) {
    this.#prisma = prisma;
  }

  get #selectedUserData() {
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
      select: this.#selectedUserData,
    });
  }

  findById(id) {
    return this.#prisma.user.findUnique({
      where: {
        id: id,
      },
      select: this.#selectedUserData,
    });
  }

  findByEmail(email, { includePassword = false } = {}) {
    return this.#prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        ...this.#selectedUserData,
        ...(includePassword ? { passwordHash: true } : {}),
      },
    });
  }

  create(data) {
    return this.#prisma.user.create({
      data,
      select: this.#selectedUserData,
    });
  }

  update(id, data) {
    return this.#prisma.user.update({
      where: {
        id: id,
      },
      data,
      select: this.#selectedUserData,
    });
  }

  delete(id) {
    return this.#prisma.user.delete({
      where: {
        id: id,
      },
    });
  }
}
