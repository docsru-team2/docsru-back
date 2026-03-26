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

  //회원가입(기본값 일반 유저)
  async signUp({
    email,
    password,
    nickname,
    userType = 'USER',
    provider = 'LOCAL',
    grade = 'NORMAL',
  }) {
    const existingUser = await this.#userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException(ERROR_CODE.USER_EMAIL_ALREADY_EXISTS);
    }

    const hashedPassword = await this.#passwordProvider.hash(password);

    const user = await this.#userRepository.create({
      email,
      nickname,
      passwordHash: hashedPassword,
      provider,
      userType,
      grade,
    });

    const tokens = this.#tokenProvider.generateTokens(user);
    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  //로그인
  async login({ email, password }) {
    const authUser = await this.#userRepository.findByEmail(email, {
      includePassword: true,
    });

    if (!authUser) {
      throw new UnauthorizedException(ERROR_CODE.AUTH_INVALID_CREDENTIALS);
    }

    const isPasswordValid = await this.#passwordProvider.compare(
      password,
      authUser.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(ERROR_CODE.AUTH_INVALID_CREDENTIALS);
    }

    const user = await this.#userRepository.findById(authUser.id);
    if (!user) {
      throw new UnauthorizedException(ERROR_CODE.AUTH_UNAUTHORIZED);
    }

    const tokens = this.#tokenProvider.generateTokens(user);

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  //내 정보 조회
  async getMe(userId) {
    const user = await this.#userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(ERROR_CODE.COMMON_NOT_FOUND);
    }
    return user;
  }

  //토큰 유효성 검사 및 재발급
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

    return {
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }
}
