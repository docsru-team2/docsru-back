// import { HTTP_STATUS } from '#constants';
import { ForbiddenException, NotFoundException, UnauthorizedException } from '#exceptions';
import { ERROR_CODE } from '#constants';

// const createAuthorizationMiddleware = (predicate) => (req, res, next) =>
//   predicate(req) ? next() : res.sendStatus(HTTP_STATUS.UNAUTHORIZED);

// const hasLoginUser = (req) => Boolean(req.user);

// export const needsLogin = createAuthorizationMiddleware(hasLoginUser);

// ✅ 에러 객체를 명시적으로 던지는 방식으로 수정!
export const needsLogin = (req, res, next) => {
  if (!req.user || !req.user.id) {
    // 💡 여기서 튕겨야 정상인데 안 튕긴다면 req.user가 엉뚱하게 채워져 있다는 증거!
    throw new UnauthorizedException(ERROR_CODE.AUTH_REQUIRED);
  }
  next();
};

// 관리자 확인: userType을 받아 인가 여부 검증
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user?.userType?.toUpperCase() !== 'ADMIN') {
    throw new ForbiddenException(ERROR_CODE.AUTH_FORBIDDEN);
  }
  next();
};

// 본인확인 공통: 서비스명/userId를 받아 인가 여부 검증
export const checkOwnership =
  (resourceService, fieldName = 'userId') =>
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const currentUserId = req.user.id;
      const resource = await resourceService.findDetail(id, req.user);

      if (!resource) {
        throw new NotFoundException(ERROR_CODE.COMMON_NOT_FOUND);
      }

      if (resource[fieldName] !== currentUserId) {
        throw new ForbiddenException(ERROR_CODE.AUTH_FORBIDDEN);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
