import {
  /*UnauthorizedException, ForbiddenException,*/ NotFoundException,
} from '#exceptions';
import { ERROR_CODE } from '#constants';

export class UserService {
  #userRepository;
  // #passwordProvider;

  constructor({ userRepository /*passwordProvider*/ }) {
    this.#userRepository = userRepository;
    // this.#passwordProvider = passwordProvider;
  }

  async listUsers() {
    return await this.#userRepository.findAll();
  }

  async getUserDetail(id) {
    const user = await this.#userRepository.findBy(id);
    if (!user) {
      throw new NotFoundException(ERROR_CODE.USER_NOT_FOUND);
    }

    return user;
  }

  // 혹시나 나중에 만들게 될까봐......히히 재밌겠ㄷ
  // async changeProfile(id, reqUserId, { email, nickname }) {
  //   if (reqUserId !== id) {
  //     throw new ForbiddenException(ERROR_CODE.FORBIDDEN);
  //   }

  //   const existingUser = await this.#userRepository.findById(id);
  //   if (!existingUser) {
  //     throw new NotFoundException(ERROR_CODE.USER_NOT_FOUND);
  //   }

  //   return await this.#userRepository.update(id, { email, nickname });
  // }

  // async deleteAccount(id, reqUserId, password) {
  //   if (reqUserId !== id) {
  //     throw new ForbiddenException(ERROR_CODE.FORBIDDEN);
  //   }

  //   const existingUser = await this.#userRepository.findById(id);
  //   if (!existingUser) {
  //     throw new NotFoundException(ERROR_CODE.USER_NOT_FOUND);
  //   }
  //   const isMatch = await this.#passwordProvider.compare(
  //     password,
  //     existingUser.passwordHash,
  //   );
  //   if (!isMatch) {
  //     throw new UnauthorizedException(ERROR_CODE.AUTH_INVALID_CREDENTIALS);
  //   }

  //   await this.#userRepository.delete(id);
  // }
}
