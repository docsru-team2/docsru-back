import { corsOrigins, isProduction, config } from '#config';

export const cors = (req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [...corsOrigins, config.CLIENT_BASE_URL];

  if (isProduction) {
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    }
  } else {
    res.header('Access-Control-Allow-Origin', origin ?? '*');
  } // 개발 환경인데 Origin 헤더가 없는 경우(Postman 등)를 위해 최소한의 허용

  // 공통 헤더 설정
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  );
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Preflight(사전 요청) 처리
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
};
