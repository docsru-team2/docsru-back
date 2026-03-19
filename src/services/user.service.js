import { NotFoundException } from '#exceptions';
import { ERROR_CODE } from '#constants';

export class UserService {
  #userRepository;
  #passwordProvider;

  constructor({ userRepository, passwordProvider }) {
    this.#userRepository = userRepository;
    this.#passwordProvider = passwordProvider;
  }

  async listUsers() {
    return await this.#userRepository.findAll();
  }

  async getUserDetail(id) {
    const user = await this.#userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(ERROR_CODE.USER_NOT_FOUND);
    }

    return user;
  }

  async registerUser({ email, password, name }) {
    const hashedPassword = await this.#passwordProvider.hash(password);

    return await this.#userRepository.create({
      email,
      password: hashedPassword,
      name,
    });
  }
}
