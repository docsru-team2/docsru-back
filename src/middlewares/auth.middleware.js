export class AuthMiddleware {
  #tokenProvider;
  #authService;
  #cookieProvider;

  constructor({ tokenProvider, authService, cookieProvider }) {
    this.#tokenProvider = tokenProvider;
    this.#authService = authService;
    this.#cookieProvider = cookieProvider;
  }

  async authenticate(req, res, next) {
    try {
      const authHeader = req.headers.authorization;
      let accessToken = null;

      if (authHeader?.startsWith('Bearer ')) {
        accessToken = authHeader.split(' ')[1];
      }

      const payload = accessToken
        ? this.#tokenProvider.verifyAccessToken(accessToken)
        : null;

      if (payload) {
        req.user = {
          id: payload.userId,
          userType: payload.userType,
          nickname: payload.nickname,
        };
        return next();
      }

      const { refreshToken } = req.cookies;
      if (!refreshToken) {
        this.#cookieProvider.clearAuthCookies(res);
        return next();
      }

      const { user, tokens } =
        await this.#authService.refreshTokens(refreshToken);

      this.#cookieProvider.setAuthCookies(res, tokens);

      req.user = {
        id: user.id,
        userType: user.userType,
        nickname: user.nickname,
      };

      return next();
    } catch {
      this.#cookieProvider.clearAuthCookies(res);
      return next();
    }
  }
}
