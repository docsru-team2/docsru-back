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
const futureDeadline = () => new Date(Date.now() + DAY * (Math.floor(Math.random() * 90) + 1));
const pastDeadline = () => new Date(Date.now() - DAY * (Math.floor(Math.random() * 180) + 1));
const pastCreatedAt = () => new Date(Date.now() - DAY * (Math.floor(Math.random() * 365) + 1));
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('⚠️ 프로덕션 환경에서는 실행하지 않습니다');
  }

  console.log('🌱 tester 데이터 시딩 시작...');

  // ─── 1. 유저 준비 ───
  let tester = await prisma.user.findUnique({ where: { email: TESTER_EMAIL } });
  if (!tester) {
    const hash = await bcrypt.hash(TESTER_PASSWORD, 10);
    tester = await prisma.user.create({
      data: { email: TESTER_EMAIL, nickname: 'tester', passwordHash: hash, provider: 'LOCAL', userType: 'USER', grade: 'NORMAL' },
    });
    console.log('✅ tester 유저 생성');
  } else {
    console.log('✅ tester 유저 기존 계정 사용');
  }

  const admin = await prisma.user.findFirst({ where: { userType: 'ADMIN' } });
  if (!admin) throw new Error('❌ admin 유저가 없습니다. pnpm seed 를 먼저 실행해주세요.');

  const normalUsers = await prisma.user.findMany({
    where: { userType: 'USER', id: { not: tester.id } },
    select: { id: true },
  });
  if (normalUsers.length === 0) throw new Error('❌ 일반 유저가 없습니다. pnpm seed 를 먼저 실행해주세요.');

  const pickUser = () => normalUsers[rand(0, normalUsers.length - 1)].id;

  // ─── 헬퍼: 챌린지 생성 ───
  const makeChallenge = (i, overrides) => {
    const field = FIELDS[i % FIELDS.length];
    return prisma.challenge.create({
      data: {
        title: overrides.title || `챌린지 ${field} ${i + 1}`,
        sourceUrl: SOURCE_URL_MAP[field],
        field,
        documentType: DOCUMENT_TYPES[i % DOCUMENT_TYPES.length],
        description: overrides.description || `테스트용 챌린지입니다. (${i + 1})`,
        deadline: overrides.deadline || futureDeadline(),
        createdAt: pastCreatedAt(),
        maxParticipants: 20,
        ...overrides,
      },
    });
  };

  // ─── 2. tester가 참여한 APPROVED+OPEN 챌린지 (30개) ───
  //     참여자 10~15명 + 작업물 5~8개 + 좋아요 + 피드백
  const openChallenges = [];
  const allSubmissions = [];

  for (let i = 0; i < 30; i++) {
    const creatorId = pickUser();
    const ch = await makeChallenge(i, {
      title: `[OPEN] ${FIELDS[i % FIELDS.length]} 번역 챌린지 ${i + 1}`,
      reviewStatus: 'APPROVED', progressStatus: 'OPEN', creatorId,
    });
    openChallenges.push(ch);

    // tester 참여
    await prisma.challengeParticipant.create({ data: { challengeId: ch.id, userId: tester.id } });

    // 일반 유저 참여 (10~15명)
    const participants = shuffle(normalUsers.filter((u) => u.id !== creatorId)).slice(0, rand(10, 15));
    await prisma.challengeParticipant.createMany({
      data: participants.map((u) => ({ challengeId: ch.id, userId: u.id })),
      skipDuplicates: true,
    });

    // 참여자 중 5~8명 작업물 생성
    const submitters = shuffle(participants).slice(0, rand(5, 8));
    for (const u of submitters) {
      const sub = await prisma.submission.create({
        data: { challengeId: ch.id, userId: u.id, title: `작업물 - ${u.id.slice(-4)}`, content: '번역 작업물 내용입니다.' },
      });
      allSubmissions.push(sub);
    }
  }
  console.log('✅ APPROVED+OPEN 챌린지 30개 (tester 참여 + 참여자 + 작업물)');

  // ─── 3. tester가 참여한 APPROVED+CLOSED 챌린지 (30개) ───
  //     tester 작업물 포함 + 다른 참여자 작업물
  for (let i = 0; i < 30; i++) {
    const creatorId = pickUser();
    const ch = await makeChallenge(i, {
      title: `[CLOSED] ${FIELDS[i % FIELDS.length]} 번역 챌린지 ${i + 1}`,
      reviewStatus: 'APPROVED', progressStatus: 'CLOSED', creatorId, deadline: pastDeadline(),
    });

    await prisma.challengeParticipant.create({ data: { challengeId: ch.id, userId: tester.id } });

    // tester 작업물
    const testerSub = await prisma.submission.create({
      data: { challengeId: ch.id, userId: tester.id, title: `[내 작업물] ${ch.title}`, content: '내가 작성한 번역 작업물입니다.' },
    });
    allSubmissions.push(testerSub);

    // 일반 유저 참여 + 작업물
    const participants = shuffle(normalUsers.filter((u) => u.id !== creatorId)).slice(0, rand(10, 15));
    await prisma.challengeParticipant.createMany({
      data: participants.map((u) => ({ challengeId: ch.id, userId: u.id })),
      skipDuplicates: true,
    });
    const submitters = shuffle(participants).slice(0, rand(5, 8));
    for (const u of submitters) {
      const sub = await prisma.submission.create({
        data: { challengeId: ch.id, userId: u.id, title: `작업물 - ${u.id.slice(-4)}`, content: '번역 작업물 내용입니다.' },
      });
      allSubmissions.push(sub);
    }
  }
  console.log('✅ APPROVED+CLOSED 챌린지 30개 (tester 참여 + 작업물)');

  // ─── 4. 좋아요 (랭킹/베스트 테스트용, 분포 다양하게) ───
  const allLikers = [...normalUsers, { id: tester.id }];
  for (const sub of allSubmissions) {
    const eligible = allLikers.filter((u) => u.id !== sub.userId);
    const count = rand(0, Math.min(15, eligible.length));
    if (count === 0) continue;
    await prisma.submissionLike.createMany({
      data: shuffle(eligible).slice(0, count).map((u) => ({ submissionId: sub.id, userId: u.id })),
      skipDuplicates: true,
    });
  }
  console.log(`✅ 작업물 ${allSubmissions.length}개에 좋아요 추가 (0~15개 분포)`);

  // ─── 5. 피드백 (작업물당 1~3개) ───
  let feedbackCount = 0;
  for (const sub of allSubmissions) {
    const eligible = allLikers.filter((u) => u.id !== sub.userId);
    const commenters = shuffle(eligible).slice(0, rand(1, 3));
    for (const u of commenters) {
      await prisma.feedback.create({
        data: { submissionId: sub.id, userId: u.id, content: `좋은 번역이에요! 피드백 ${++feedbackCount}` },
      });
    }
  }
  console.log(`✅ 피드백 ${feedbackCount}개 생성`);

  // ─── 6. tester가 생성한 챌린지 (me/applied 테스트용) ───
  // APPROVED 25개, PENDING 25개, REJECTED 25개, DELETED 25개 = 100개
  const appliedConfigs = [
    { status: 'APPROVED', progressStatus: 'OPEN', prefix: '승인됨', count: 25 },
    { status: 'PENDING', prefix: '승인대기', count: 25 },
    { status: 'REJECTED', prefix: '거절됨', count: 25, rejectReason: '번역 범위가 명확하지 않습니다.' },
    { status: 'DELETED', prefix: '삭제됨', count: 25, deleteReason: '운영 정책에 위반됩니다.' },
  ];
  for (const cfg of appliedConfigs) {
    for (let i = 0; i < cfg.count; i++) {
      await makeChallenge(i, {
        title: `[내신청-${cfg.prefix}] ${FIELDS[i % FIELDS.length]} 챌린지 ${i + 1}`,
        description: `tester가 신청한 ${cfg.prefix} 챌린지입니다.`,
        reviewStatus: cfg.status,
        progressStatus: cfg.progressStatus || undefined,
        rejectReason: cfg.rejectReason || undefined,
        deleteReason: cfg.deleteReason || undefined,
        creatorId: tester.id,
      });
    }
    console.log(`✅ tester 생성 ${cfg.status} 챌린지 ${cfg.count}개`);
  }

  // ─── 7. tester가 참여한 PENDING/REJECTED/DELETED (joined 테스트용) ───
  const joinedConfigs = [
    { status: 'PENDING', prefix: '참여-승인대기', count: 15 },
    { status: 'REJECTED', prefix: '참여-거절됨', count: 15, rejectReason: '테스트 거절 사유' },
    { status: 'DELETED', prefix: '참여-삭제됨', count: 15, deleteReason: '테스트 삭제 사유' },
  ];
  for (const cfg of joinedConfigs) {
    for (let i = 0; i < cfg.count; i++) {
      const ch = await makeChallenge(i, {
        title: `[${cfg.prefix}] ${FIELDS[i % FIELDS.length]} 챌린지 ${i + 1}`,
        reviewStatus: cfg.status,
        rejectReason: cfg.rejectReason || undefined,
        deleteReason: cfg.deleteReason || undefined,
        creatorId: pickUser(),
      });
      await prisma.challengeParticipant.create({ data: { challengeId: ch.id, userId: tester.id } });
    }
    console.log(`✅ ${cfg.status} 챌린지 ${cfg.count}개 (tester 참여)`);
  }

  // ─── 8. 알림 (tester 대상, 다양한 타입) ───
  const testerSubs = allSubmissions.filter((s) => s.userId === tester.id);
  const notiData = [
    // 챌린지 승인 알림 20개
    ...Array.from({ length: 20 }, (_, i) => ({
      userId: tester.id, actorUserId: admin.id,
      type: 'CHALLENGE_ADMIN_APPROVED', content: `챌린지가 승인되었습니다.`,
      targetId: openChallenges[i % openChallenges.length].id, isRead: Math.random() < 0.3,
    })),
    // 챌린지 거절 알림 10개
    ...Array.from({ length: 10 }, (_, i) => ({
      userId: tester.id, actorUserId: admin.id,
      type: 'CHALLENGE_ADMIN_REJECTED', content: `챌린지가 거절되었습니다.`,
      targetId: openChallenges[i % openChallenges.length].id, isRead: Math.random() < 0.3,
    })),
    // 좋아요 알림 (tester 작업물 대상)
    ...testerSubs.slice(0, 20).map((sub) => ({
      userId: tester.id, actorUserId: pickUser(),
      type: 'SUBMISSION_LIKED', content: '작업물에 좋아요가 달렸습니다.',
      targetId: sub.id, isRead: Math.random() < 0.3,
    })),
    // 피드백 알림 (tester 작업물 대상)
    ...testerSubs.slice(0, 15).map((sub) => ({
      userId: tester.id, actorUserId: pickUser(),
      type: 'FEEDBACK_CREATED', content: '작업물에 피드백이 달렸습니다.',
      targetId: sub.id, isRead: Math.random() < 0.3,
    })),
  ];
  await prisma.notification.createMany({ data: notiData });
  console.log(`✅ 알림 ${notiData.length}개 생성`);

  // ─── 9. 임시저장 (draft) ───
  for (const ch of openChallenges.slice(0, 10)) {
    await prisma.draft.create({
      data: { challengeId: ch.id, userId: tester.id, title: `[임시저장] ${ch.title}`, content: '임시저장 내용입니다.' },
    });
  }
  console.log('✅ 임시저장 10개 생성');

  // ─── 결과 ───
  console.log('────────────────────────────');
  console.log(`🔑 테스트 계정: ${TESTER_EMAIL} / ${TESTER_PASSWORD}`);
  console.log('────────────────────────────');
  console.log('📊 tester 데이터 요약:');
  console.log('  참여 OPEN 챌린지:    30개 (참여자 10~15명, 작업물 5~8개)');
  console.log('  참여 CLOSED 챌린지:  30개 (tester 작업물 포함)');
  console.log('  내신청 APPROVED:     25개');
  console.log('  내신청 PENDING:      25개');
  console.log('  내신청 REJECTED:     25개');
  console.log('  내신청 DELETED:      25개');
  console.log('  참여 PENDING:        15개');
  console.log('  참여 REJECTED:       15개');
  console.log('  참여 DELETED:        15개');
  console.log(`  작업물: ${allSubmissions.length}개 (좋아요 0~15개 분포)`);
  console.log(`  피드백: ${feedbackCount}개`);
  console.log(`  알림: ${notiData.length}개`);
  console.log('  임시저장: 10개');
  console.log('────────────────────────────');
  console.log('✅ tester 시딩 완료');
}

run()
  .catch((e) => { console.error('❌ 시딩 에러:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
