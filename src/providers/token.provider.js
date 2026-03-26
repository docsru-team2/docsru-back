import jwt from 'jsonwebtoken';
import { config } from '#config';

export class TokenProvider {
  #accessSecret;
  #refreshSecret;

  constructor() {
    this.#accessSecret = config.JWT_ACCESS_SECRET;
    this.#refreshSecret = config.JWT_REFRESH_SECRET;
  }

  generateAccessToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        nickname: user.nickname,
        userType: user.userType,
      },
      this.#accessSecret,
      { expiresIn: '1d' },
    );
  }

  generateRefreshToken(user) {
    return jwt.sign({ userId: user.id }, this.#refreshSecret, {
      expiresIn: '14d',
    });
  }

  generateTokens(user) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    return { accessToken, refreshToken };
  }

  verifyAccessToken(token) {
    return this.#verifyToken(token, this.#accessSecret);
  }

  verifyRefreshToken(token) {
    return this.#verifyToken(token, this.#refreshSecret);
  }

  #verifyToken(token, secret) {
    try {
      return jwt.verify(token, secret);
    } catch {
      return null;
    }
  }
}
