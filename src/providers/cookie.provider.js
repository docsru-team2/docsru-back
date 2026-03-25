import { config } from '#config';
import { DAY_IN_MS } from '#constants';

export class CookieProvider {
  setAuthCookies(res, tokens) {
    const { accessToken, refreshToken } = tokens;

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1 * DAY_IN_MS,
      path: '/',
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 14 * DAY_IN_MS,
      path: '/',
    });
  }

  clearAuthCookies(res) {
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });
  }
}
