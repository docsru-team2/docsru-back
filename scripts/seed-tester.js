import { PrismaClient } from '#generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';

const TESTER_EMAIL = 'tester@docsru.com';
const TESTER_PASSWORD = 'test1!';

const FIELDS = ['NEXT_JS', 'MODERN_JS', 'API', 'WEB', 'CAREER'];
const DOCUMENT_TYPES = ['OFFICIAL_DOC', 'BLOG', 'BOOK', 'ETC'];
const SOURCE_URL_MAP = {
  NEXT_JS: 'https://nextjs.org/docs',
  MODERN_JS: 'https://javascript.info',
  API: 'https://developer.mozilla.org/ko/docs/Web/API',
  WEB: 'https://developer.mozilla.org/ko/docs/Web',
  CAREER: 'https://react.dev/reference/react',
};

const DAY = 1000 * 60 * 60 * 24;
// 미래 마감일: 1~90일 뒤 랜덤
const futureDeadline = () => new Date(Date.now() + DAY * (Math.floor(Math.random() * 90) + 1));
// 과거 마감일: 1~180일 전 랜덤
const pastDeadline = () => new Date(Date.now() - DAY * (Math.floor(Math.random() * 180) + 1));
// 과거 신청일: 1~365일 전 랜덤
const pastCreatedAt = () => new Date(Date.now() - DAY * (Math.floor(Math.random() * 365) + 1));

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('⚠️ 프로덕션 환경에서는 실행하지 않습니다');
  }

  console.log('🌱 tester 데이터 시딩 시작...');

  // 1. tester 유저 찾거나 생성
  let tester = await prisma.user.findUnique({ where: { email: TESTER_EMAIL } });
  if (!tester) {
    const hashedPassword = await bcrypt.hash(TESTER_PASSWORD, 10);
    tester = await prisma.user.create({
      data: {
        email: TESTER_EMAIL,
        nickname: 'tester',
        passwordHash: hashedPassword,
        provider: 'LOCAL',
        userType: 'USER',
        grade: 'NORMAL',
      },
    });
    console.log('✅ tester 유저 생성');
  } else {
    console.log('✅ tester 유저 기존 계정 사용');
  }

  // 2. admin 유저 찾기
  const admin = await prisma.user.findFirst({ where: { userType: 'ADMIN' } });
  if (!admin) throw new Error('❌ admin 유저가 없습니다. seed를 먼저 실행해주세요.');

  // 일반 유저 목록 (챌린지 creator 랜덤 배정용)
  const normalUsers = await prisma.user.findMany({
    where: { userType: 'USER', id: { not: tester.id } },
    select: { id: true },
  });
  if (normalUsers.length === 0) throw new Error('❌ 일반 유저가 없습니다. seed를 먼저 실행해주세요.');
  const randomCreatorId = () => normalUsers[Math.floor(Math.random() * normalUsers.length)].id;
  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
  const randomCount = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  // 챌린지에 랜덤 참여자 추가 (tester 제외, creator 제외)
  const addParticipants = async (challengeId, creatorId, count) => {
    const eligible = normalUsers.filter((u) => u.id !== creatorId);
    const picked = shuffle(eligible).slice(0, count);
    for (const user of picked) {
      await prisma.challengeParticipant.create({
        data: { challengeId, userId: user.id },
      });
    }
    return picked;
  };

  // 참여자들의 작업물 생성
  const addSubmissions = async (challengeId, participants, count) => {
    const picked = shuffle(participants).slice(0, count);
    const submissions = [];
    for (const user of picked) {
      const sub = await prisma.submission.create({
        data: {
          challengeId,
          userId: user.id,
          title: `작업물 - ${user.id.slice(-4)}`,
          content: '테스트 작업물 내용입니다.',
        },
      });
      submissions.push(sub);
    }
    return submissions;
  };

  const allSubmissions = [];

  // 3. APPROVED + OPEN 챌린지 100개 + tester 참여 + 랜덤 참여자 10~15명
  const openChallenges = [];
  for (let i = 0; i < 100; i++) {
    const creatorId = randomCreatorId();
    const challenge = await prisma.challenge.create({
      data: {
        title: `[테스터용] OPEN 챌린지 ${FIELDS[i % FIELDS.length]} ${i + 1}`,
        sourceUrl: SOURCE_URL_MAP[FIELDS[i % FIELDS.length]],
        field: FIELDS[i % FIELDS.length],
        documentType: DOCUMENT_TYPES[i % DOCUMENT_TYPES.length],
        description: `tester 테스트용 OPEN 챌린지입니다. (${i + 1})`,
        deadline: futureDeadline(),
        createdAt: pastCreatedAt(),
        maxParticipants: 20,
        reviewStatus: 'APPROVED',
        progressStatus: 'OPEN',
        creatorId,
      },
    });
    await prisma.challengeParticipant.create({
      data: { challengeId: challenge.id, userId: tester.id },
    });
    const participants = await addParticipants(challenge.id, creatorId, randomCount(10, 15));
    // 참여자 중 5~8명 작업물 생성
    const subs = await addSubmissions(challenge.id, participants, randomCount(5, 8));
    allSubmissions.push(...subs);
    openChallenges.push(challenge);
  }
  console.log('✅ APPROVED+OPEN 챌린지 100개 생성 (참여자 10~15명 + 작업물)');

  // 4. APPROVED + CLOSED 챌린지 100개 + tester 참여 + submission + 랜덤 참여자
  for (let i = 0; i < 100; i++) {
    const creatorId = randomCreatorId();
    const challenge = await prisma.challenge.create({
      data: {
        title: `[테스터용] CLOSED 챌린지 ${FIELDS[i % FIELDS.length]} ${i + 1}`,
        sourceUrl: SOURCE_URL_MAP[FIELDS[i % FIELDS.length]],
        field: FIELDS[i % FIELDS.length],
        documentType: DOCUMENT_TYPES[i % DOCUMENT_TYPES.length],
        description: `tester 테스트용 CLOSED 챌린지입니다. (${i + 1})`,
        deadline: pastDeadline(),
        createdAt: pastCreatedAt(),
        maxParticipants: 20,
        reviewStatus: 'APPROVED',
        progressStatus: 'CLOSED',
        creatorId,
      },
    });
    await prisma.challengeParticipant.create({
      data: { challengeId: challenge.id, userId: tester.id },
    });
    const testerSub = await prisma.submission.create({
      data: {
        challengeId: challenge.id,
        userId: tester.id,
        title: `[테스터용] ${challenge.title} 작업물`,
        content: '테스트 작업물 내용입니다.',
      },
    });
    allSubmissions.push(testerSub);
    const participants = await addParticipants(challenge.id, creatorId, randomCount(10, 15));
    // 참여자 중 5~8명 작업물 생성
    const subs = await addSubmissions(challenge.id, participants, randomCount(5, 8));
    allSubmissions.push(...subs);
  }
  console.log('✅ APPROVED+CLOSED 챌린지 100개 생성 (참여자 10~15명 + 작업물)');

  // 좋아요 랜덤 추가 (전체 작업물 대상, 1~10개로 분포 넓혀서 랭킹 테스트)
  const allLikers = [...normalUsers, { id: tester.id }];
  for (const sub of allSubmissions) {
    const eligible = allLikers.filter((u) => u.id !== sub.userId);
    const picked = shuffle(eligible).slice(0, randomCount(1, 10));
    for (const user of picked) {
      await prisma.submissionLike.create({
        data: { submissionId: sub.id, userId: user.id },
      });
    }
  }
  console.log(`✅ 작업물 ${allSubmissions.length}개에 좋아요 랜덤 추가 (1~10개)`);

  // 피드백 랜덤 추가 (작업물당 1~3개)
  let feedbackCount = 0;
  for (const sub of allSubmissions) {
    const eligible = allLikers.filter((u) => u.id !== sub.userId);
    const picked = shuffle(eligible).slice(0, randomCount(1, 3));
    for (const user of picked) {
      await prisma.feedback.create({
        data: {
          submissionId: sub.id,
          userId: user.id,
          content: `피드백 내용입니다. (${++feedbackCount})`,
        },
      });
    }
  }
  console.log(`✅ 피드백 ${feedbackCount}개 생성`);

  // 알림 생성 (tester 대상, 다양한 타입)
  let notiCount = 0;
  // 챌린지 승인/거절 알림
  for (let i = 0; i < 20; i++) {
    await prisma.notification.create({
      data: {
        userId: tester.id,
        actorUserId: admin.id,
        type: 'CHALLENGE_ADMIN_APPROVED',
        content: `테스트 챌린지 ${i + 1}이(가) 승인되었습니다.`,
        targetId: openChallenges[i % openChallenges.length].id,
        isRead: Math.random() < 0.3,
      },
    });
    notiCount++;
  }
  for (let i = 0; i < 10; i++) {
    await prisma.notification.create({
      data: {
        userId: tester.id,
        actorUserId: admin.id,
        type: 'CHALLENGE_ADMIN_REJECTED',
        content: `테스트 챌린지 ${i + 1}이(가) 거절되었습니다.`,
        targetId: openChallenges[i % openChallenges.length].id,
        isRead: Math.random() < 0.3,
      },
    });
    notiCount++;
  }
  // 좋아요 알림
  for (const sub of allSubmissions.filter((s) => s.userId === tester.id).slice(0, 30)) {
    const actor = normalUsers[Math.floor(Math.random() * normalUsers.length)];
    await prisma.notification.create({
      data: {
        userId: tester.id,
        actorUserId: actor.id,
        type: 'SUBMISSION_LIKED',
        content: '작업물에 좋아요가 달렸습니다.',
        targetId: sub.id,
        isRead: Math.random() < 0.3,
      },
    });
    notiCount++;
  }
  // 피드백 알림
  for (const sub of allSubmissions.filter((s) => s.userId === tester.id).slice(0, 20)) {
    const actor = normalUsers[Math.floor(Math.random() * normalUsers.length)];
    await prisma.notification.create({
      data: {
        userId: tester.id,
        actorUserId: actor.id,
        type: 'FEEDBACK_CREATED',
        content: '작업물에 피드백이 달렸습니다.',
        targetId: sub.id,
        isRead: Math.random() < 0.3,
      },
    });
    notiCount++;
  }
  console.log(`✅ 알림 ${notiCount}개 생성`);

  // 4-1. tester가 생성한 APPROVED + OPEN 챌린지 (me/applied APPROVED 테스트용)
  for (let i = 0; i < 50; i++) {
    await prisma.challenge.create({
      data: {
        title: `[테스터신청] APPROVED 챌린지 ${FIELDS[i % FIELDS.length]} ${i + 1}`,
        sourceUrl: SOURCE_URL_MAP[FIELDS[i % FIELDS.length]],
        field: FIELDS[i % FIELDS.length],
        documentType: DOCUMENT_TYPES[i % DOCUMENT_TYPES.length],
        description: `tester가 신청하고 승인된 챌린지입니다. (${i + 1})`,
        deadline: futureDeadline(),
        createdAt: pastCreatedAt(),
        maxParticipants: 20,
        reviewStatus: 'APPROVED',
        progressStatus: 'OPEN',
        creatorId: tester.id,
      },
    });
  }
  console.log('✅ tester 생성 APPROVED 챌린지 50개 생성');

  // 4-2. tester가 생성한 DELETED 챌린지 (me/applied DELETED 테스트용)
  for (let i = 0; i < 50; i++) {
    await prisma.challenge.create({
      data: {
        title: `[테스터신청] DELETED 챌린지 ${FIELDS[i % FIELDS.length]} ${i + 1}`,
        sourceUrl: SOURCE_URL_MAP[FIELDS[i % FIELDS.length]],
        field: FIELDS[i % FIELDS.length],
        documentType: DOCUMENT_TYPES[i % DOCUMENT_TYPES.length],
        description: `tester가 신청했다가 삭제된 챌린지입니다. (${i + 1})`,
        deadline: futureDeadline(),
        createdAt: pastCreatedAt(),
        maxParticipants: 20,
        reviewStatus: 'DELETED',
        deleteReason: '테스트용 삭제 사유입니다.',
        creatorId: tester.id,
      },
    });
  }
  console.log('✅ tester 생성 DELETED 챌린지 50개 생성');

  // 5. PENDING 챌린지 50개 + tester 참여 (admin 생성, joined 테스트용)
  for (let i = 0; i < 50; i++) {
    const challenge = await prisma.challenge.create({
      data: {
        title: `[테스터용] PENDING 챌린지 ${FIELDS[i % FIELDS.length]} ${i + 1}`,
        sourceUrl: SOURCE_URL_MAP[FIELDS[i % FIELDS.length]],
        field: FIELDS[i % FIELDS.length],
        documentType: DOCUMENT_TYPES[i % DOCUMENT_TYPES.length],
        description: `tester 테스트용 PENDING 챌린지입니다. (${i + 1})`,
        deadline: futureDeadline(),
        createdAt: pastCreatedAt(),
        maxParticipants: 20,
        reviewStatus: 'PENDING',
        creatorId: randomCreatorId(),
      },
    });
    await prisma.challengeParticipant.create({
      data: { challengeId: challenge.id, userId: tester.id },
    });
  }
  console.log('✅ PENDING 챌린지 50개 생성 및 tester 참여');

  // 6. REJECTED 챌린지 50개 + tester 참여 (admin 생성, joined 테스트용)
  for (let i = 0; i < 50; i++) {
    const challenge = await prisma.challenge.create({
      data: {
        title: `[테스터용] REJECTED 챌린지 ${FIELDS[i % FIELDS.length]} ${i + 1}`,
        sourceUrl: SOURCE_URL_MAP[FIELDS[i % FIELDS.length]],
        field: FIELDS[i % FIELDS.length],
        documentType: DOCUMENT_TYPES[i % DOCUMENT_TYPES.length],
        description: `tester 테스트용 REJECTED 챌린지입니다. (${i + 1})`,
        deadline: futureDeadline(),
        createdAt: pastCreatedAt(),
        maxParticipants: 20,
        reviewStatus: 'REJECTED',
        rejectReason: '테스트용 거절 사유입니다.',
        creatorId: randomCreatorId(),
      },
    });
    await prisma.challengeParticipant.create({
      data: { challengeId: challenge.id, userId: tester.id },
    });
  }
  console.log('✅ REJECTED 챌린지 50개 생성 및 tester 참여');

  // 7. admin 생성 DELETED 챌린지 50개 + tester 참여 (joined에서 노출되지 않는 케이스)
  for (let i = 0; i < 50; i++) {
    const challenge = await prisma.challenge.create({
      data: {
        title: `[테스터용] DELETED 챌린지 ${FIELDS[i % FIELDS.length]} ${i + 1}`,
        sourceUrl: SOURCE_URL_MAP[FIELDS[i % FIELDS.length]],
        field: FIELDS[i % FIELDS.length],
        documentType: DOCUMENT_TYPES[i % DOCUMENT_TYPES.length],
        description: `tester 테스트용 DELETED 챌린지입니다. (${i + 1})`,
        deadline: futureDeadline(),
        createdAt: pastCreatedAt(),
        maxParticipants: 20,
        reviewStatus: 'DELETED',
        deleteReason: '테스트용 삭제 사유입니다.',
        creatorId: randomCreatorId(),
      },
    });
    await prisma.challengeParticipant.create({
      data: { challengeId: challenge.id, userId: tester.id },
    });
  }
  console.log('✅ admin 생성 DELETED 챌린지 50개 생성 및 tester 참여');

  // 8. OPEN 챌린지 일부에 임시저장 생성 (draft 테스트용)
  for (const challenge of openChallenges.slice(0, 10)) {
    await prisma.draft.create({
      data: {
        challengeId: challenge.id,
        userId: tester.id,
        title: `[테스터용] ${challenge.title} 임시저장`,
        content: '임시저장 내용입니다.',
      },
    });
  }
  console.log('✅ 임시저장 10개 생성');

  console.log('--------');
  console.log(`🔑 테스트 계정: ${TESTER_EMAIL} / 비밀번호: ${TESTER_PASSWORD}`);
  console.log('--------');
  console.log('✅ tester 시딩 완료');
}

run()
  .catch((e) => {
    console.error('❌ 시딩 에러:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
