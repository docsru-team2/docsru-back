export const setupGracefulShutdown = (server, prisma) => {
  const shutdown = async (signal) => {
    console.log(`\n${signal} 신호를 받았습니다. 서버를 종료합니다...`);

    try {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });
      console.log('서버가 종료되었습니다.');

      await prisma.$disconnect();
      console.log('데이터베이스 연결이 종료되었습니다.');
      process.exit(0);
    } catch (error) {
      console.error('데이터베이스 종료 중 에러:', error);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};