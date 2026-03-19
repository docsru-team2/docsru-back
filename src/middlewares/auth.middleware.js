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
      const { accessToken, refreshToken } = req.cookies;

      if (!accessToken && !refreshToken) {
        return next();
      }

      const accessUserId = accessToken
        ? this.#tokenProvider.verifyAccessToken(accessToken)?.userId
        : null;

      if (accessUserId) {
        req.user = { id: accessUserId };
        return next();
      }

      if (!refreshToken) {
        this.#cookieProvider.clearAuthCookies(res);
        return next();
      }

      const { user, tokens } =
        await this.#authService.refreshTokens(refreshToken);

      this.#cookieProvider.setAuthCookies(res, tokens);
      req.user = { id: user.id };

      return next();
    } catch {
      this.#cookieProvider.clearAuthCookies(res);
      return next();
    }
  }
}