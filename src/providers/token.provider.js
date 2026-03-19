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
        name: user.name,
      },
      this.#accessSecret,
      { expiresIn: '15m' },
    );
  }

  generateRefreshToken(user) {
    return jwt.sign({ userId: user.id }, this.#refreshSecret, {
      expiresIn: '7d',
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