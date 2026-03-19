import { HTTP_STATUS } from '#constants';

const createAuthorizationMiddleware = (predicate) => (req, res, next) =>
  predicate(req) ? next() : res.sendStatus(HTTP_STATUS.UNAUTHORIZED);

const hasLoginUser = (req) => Boolean(req.user);

export const needsLogin = createAuthorizationMiddleware(hasLoginUser);