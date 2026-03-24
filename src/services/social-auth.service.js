import { config } from '#config';
import { ERROR_CODE } from '#constants';
import { BadRequestException, UnauthorizedException } from '#exceptions';

export class SocialAuthService {
  #userRepository;
  #tokenProvider;

  constructor({ userRepository, tokenProvider }) {
    this.#userRepository = userRepository;
    this.#tokenProvider = tokenProvider;
  }

  async loginOrSignUp({ provider, code, state }) {
    const profile = await this.#getSocialProfile(provider, code, state);
    const user = await this.#resolveUser({ provider, profile });
    const tokens = this.#tokenProvider.generateTokens(user);
    return { user, tokens };
  }

  async #resolveUser({ provider, profile }) {
    // providerAccountId 조회
    const socialUser = await this.#userRepository.findBySocialAccount(
      provider.toUpperCase(),
      profile.id,
    );

    // 닉네임이 없으면 업데이트
    if (socialUser) {
      return !socialUser.nickname && profile.name
        ? this.#userRepository.update(socialUser.id, { nickname: profile.name })
        : socialUser;
    }

    const email = this.#resolveEmail({ provider, profile });
    const existingUser = await this.#userRepository.findByEmail(email);

    // 새 유저 생성(기본값 일반 유저)
    if (!existingUser) {
      return this.#userRepository.create({
        email,
        nickname: profile.name || `독수르_${profile.id.slice(0, 5)}`, // 닉네임 없으면 임의로 만들어넣기
        provider: provider.toUpperCase(),
        providerAccountId: profile.id,
        userType: 'USER',
        grade: 'NORMAL',
      });
    }

    // 기존 유저에 소셜 계정 연결
    await this.#userRepository.update(existingUser.id, {
      providerAccountId: profile.id,
    });

    return existingUser;
  }

  async #getSocialProfile(provider, code /*state*/) {
    switch (provider) {
      case 'google':
        return this.#getGoogleProfile(code);
      // case 'kakao':
      //   return this.#getKakaoProfile(code);
      // case 'naver':
      //   return this.#getNaverProfile(code, state);
      default:
        throw new BadRequestException(ERROR_CODE.UNSUPPORTED_SOCIAL_PROVIDER);
    }
  }

  async #getGoogleProfile(code) {
    const callbackUri = `${config.API_BASE_URL}/api/auth/social/callback/google`;

    const tokenResponse = await this.#requestSocialJson(
      'https://oauth2.googleapis.com/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: config.GOOGLE_CLIENT_ID,
          client_secret: config.GOOGLE_CLIENT_SECRET,
          redirect_uri: callbackUri,
          grant_type: 'authorization_code',
        }),
      },
      'Google 토큰 요청에 실패했습니다.',
    );

    const profileResponse = await this.#requestSocialJson(
      'https://openidconnect.googleapis.com/v1/userinfo',
      {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      },
      'Google 프로필 조회에 실패했습니다.',
    );

    return {
      id: String(profileResponse.sub),
      email: profileResponse.email ?? null,
      name: profileResponse.name ?? 'Google User',
    };
  }

  #resolveEmail({ provider, profile }) {
    if (profile.email) {
      return profile.email.toLowerCase();
    }

    const safeSocialId = String(profile.id).replace(/[^a-zA-Z0-9_.-]/g, '_');
    return `${provider}_${safeSocialId}@social.local`;
  }

  async #requestSocialJson(url, options, defaultErrorMessage) {
    const response = await fetch(url, options);
    const rawText = await response.text();
    let payload = null;

    if (rawText) {
      try {
        payload = JSON.parse(rawText);
      } catch {
        payload = null;
      }
    }

    if (!response.ok) {
      const message =
        payload?.error_description ??
        payload?.error ??
        payload?.message ??
        payload?.msg ??
        payload?.extras?.detailMsg ??
        rawText ??
        response.statusText ??
        defaultErrorMessage;

      throw new UnauthorizedException(message ?? ERROR_CODE.SOCIAL_AUTH_FAILED);
    }

    return payload;
  }
}
