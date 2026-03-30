import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS, ERROR_CODE } from '#constants';
import { validate, needsLogin } from '#middlewares';
import {
  signUpSchema,
  loginSchema,
  socialProviderParamSchema,
  socialLoginQuerySchema,
  socialCallbackQuerySchema,
} from './dto/auth.dto.js';
import { BadRequestException } from '#exceptions';
import { config } from '#config';

export class AuthController extends BaseController {
  #authService;
  #socialAuthService;
  #cookieProvider;

  constructor({ authService, socialAuthService, cookieProvider }) {
    super();
    this.#authService = authService;
    this.#socialAuthService = socialAuthService;
    this.#cookieProvider = cookieProvider;
  }

  routes() {
    this.router.post('/sign-up', validate('body', signUpSchema), (req, res) =>
      this.signUp(req, res),
    );
    this.router.post('/sign-in', validate('body', loginSchema), (req, res) =>
      this.login(req, res),
    );
    this.router.post('/logout', (req, res) => this.logout(req, res));
    this.router.post('/refresh', (req, res, next) =>
      this.refresh(req, res, next),
    );

    this.router.get(
      '/social/:provider/sign-in',
      validate('params', socialProviderParamSchema),
      validate('query', socialLoginQuerySchema),
      (req, res) => this.socialRedirect(req, res),
    );

    this.router.get(
      '/social/callback/:provider',
      validate('params', socialProviderParamSchema),
      validate('query', socialCallbackQuerySchema),
      (req, res) => this.socialCallback(req, res),
    );
    this.router.get('/me', needsLogin, (req, res) => this.me(req, res));
    this.router.post('/logout', (req, res) => this.logout(req, res));
    return this.router;
  }

  // 일반 회원가입
  async signUp(req, res) {
    const { email, password, nickname } = req.body;
    const { user } = await this.#authService.signUp({
      email,
      password,
      nickname,
    });

    res
      .status(HTTP_STATUS.CREATED)
      .json({ success: true, data: user, message: '회원가입 성공!' });
  }

  //일반 로그인
  async login(req, res) {
    const { email, password } = req.body;
    const { user, tokens } = await this.#authService.login({
      email,
      password,
    });

    this.#cookieProvider.setAuthCookies(res, tokens);
    res
      .status(HTTP_STATUS.OK)
      .json({ success: true, data: user, message: '로그인 성공!' });
  }

  //일반 로그아웃
  async logout(req, res) {
    this.#cookieProvider.clearAuthCookies(res);
    res
      .status(HTTP_STATUS.NO_CONTENT)
      .json({ success: true, message: '로그아웃에 성공했습니다.' });
  }

  //토큰 리프레시
  async refresh(req, res, next) {
    try {
      const { refreshToken: staleRefreshTokens } = req.cookies;
      const { tokens } =
        await this.#authService.refreshTokens(staleRefreshTokens);

      this.#cookieProvider.setAuthCookies(res, tokens);

      res.status(HTTP_STATUS.OK).json(tokens);
    } catch (error) {
      next(error);
    }
  }

  // 소셜 로그인
  // 로그인 페이지 리다이렉트
  async socialRedirect(req, res) {
    const { provider } = req.params;
    const { next } = req.query;
    const loginUrl = this.generateSocialLoginLink(provider, { next });
    res.redirect(loginUrl);
  }
  // 소셜 로그인 콜백
  async socialCallback(req, res) {
    const { provider } = req.params;
    const { code, state } = req.query;

    if (!code) {
      throw new BadRequestException(ERROR_CODE.SOCIAL_AUTH_CODE_REQUIRED);
    }

    const { tokens, isNewbie } = await this.#socialAuthService.loginOrSignUp({
      provider,
      code,
      state,
    });

    this.#cookieProvider.setAuthCookies(res, tokens);

    const { next } = this.#decodeState(state);
    const safeNext = isNewbie ? '/join/welcome' : this.#normalizeNextPath(next);
    const redirectUrl = new URL(safeNext, config.CLIENT_BASE_URL).toString();

    return res.redirect(redirectUrl);
  }

  //소셜로그인 URL 빌드
  generateSocialLoginLink(provider, { next = '/' }) {
    const generator = this.socialLoginLinkGenerator[provider];
    if (!generator) {
      throw new BadRequestException(ERROR_CODE.UNSUPPORTED_SOCIAL_PROVIDER);
    }

    return generator({ next: this.#normalizeNextPath(next) });
  }

  get socialLoginLinkGenerator() {
    return {
      google: ({ next }) => {
        const callback = `${this.#redirectUri}/google`;
        const params = new URLSearchParams({
          client_id: config.GOOGLE_CLIENT_ID,
          redirect_uri: callback,
          response_type: 'code',
          scope: 'openid email profile',
          state: this.#encodeState({ next }),
          access_type: 'offline',
          prompt: 'consent',
        });

        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      },
    };
  }

  get #redirectUri() {
    return `${config.API_BASE_URL}/api/auth/social/callback`;
  }

  #encodeState(payload) {
    return Buffer.from(JSON.stringify(payload)).toString('base64url');
  }

  #decodeState(rawState) {
    if (!rawState) {
      return { next: '/' };
    }

    try {
      const parsed = JSON.parse(
        Buffer.from(rawState, 'base64url').toString('utf8'),
      );

      return { next: this.#normalizeNextPath(parsed?.next) };
    } catch {
      return { next: '/' };
    }
  }

  #normalizeNextPath(next) {
    if (typeof next !== 'string') {
      return '/';
    }

    const trimmed = next.trim();
    if (!trimmed.startsWith('/')) {
      return '/';
    }

    if (trimmed.startsWith('//')) {
      return '/';
    }

    return trimmed;
  }

  // 내 정보 조회
  async me(req, res) {
    const user = await this.#authService.getMe(req.user.id);
    res.status(HTTP_STATUS.OK).json(user);
  }
}
