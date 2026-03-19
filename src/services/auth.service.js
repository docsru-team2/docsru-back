import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '#exceptions';
import { ERROR_CODE } from '#constants';

export class AuthService {
  #userRepository;
  #passwordProvider;
  #tokenProvider;

  constructor({ userRepository, passwordProvider, tokenProvider }) {
    this.#userRepository = userRepository;
    this.#passwordProvider = passwordProvider;
    this.#tokenProvider = tokenProvider;
  }

  async signUp({ email, password, name }) {
    const existingUser = await this.#userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException(ERROR_CODE.USER_EMAIL_ALREADY_EXISTS);
    }

    const hashedPassword = await this.#passwordProvider.hash(password);

    const user = await this.#userRepository.create({
      email,
      password: hashedPassword,
      name,
    });

    const tokens = this.#tokenProvider.generateTokens(user);

    return { user, tokens };
  }

  async login({ email, password }) {
    const authUser = await this.#userRepository.findByEmail(email, {
      includePassword: true,
    });

    if (!authUser) {
      throw new UnauthorizedException(ERROR_CODE.AUTH_INVALID_CREDENTIALS);
    }

    const isPasswordValid = await this.#passwordProvider.compare(
      password,
      authUser.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(ERROR_CODE.AUTH_INVALID_CREDENTIALS);
    }

    const user = await this.#userRepository.findById(authUser.id);
    if (!user) {
      throw new UnauthorizedException(ERROR_CODE.AUTH_UNAUTHORIZED);
    }

    const tokens = this.#tokenProvider.generateTokens(user);

    return { user, tokens };
  }

  async getMe(userId) {
    const user = await this.#userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(ERROR_CODE.COMMON_NOT_FOUND);
    }
    return user;
  }

  async refreshTokens(refreshToken) {
    const payload = this.#tokenProvider.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedException(ERROR_CODE.INVALID_TOKEN);
    }

    const user = await this.#userRepository.findById(payload.userId);
    if (!user) {
      throw new UnauthorizedException(ERROR_CODE.AUTH_UNAUTHORIZED);
    }

    const tokens = this.#tokenProvider.generateTokens(user);

    return { user, tokens };
  }
}
