import { PrismaClient } from '#generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';

const TESTER_EMAIL = 'tester@docsru.com';
const TESTER_PASSWORD = 'test1!';

const FIELDS = ['NEXT_JS', 'MODERN_JS', 'API', 'WEB', 'CAREER'];
const DOCUMENT_TYPES = ['OFFICIAL_DOC', 'BLOG', 'BOOK', 'ETC'];

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

  // 2. admin 유저 찾기 (챌린지 creator로 사용)
  const admin = await prisma.user.findFirst({ where: { userType: 'ADMIN' } });
  if (!admin) throw new Error('❌ admin 유저가 없습니다. seed를 먼저 실행해주세요.');

  // 3. APPROVED + OPEN 챌린지 100개 (admin 생성) + tester 참여 (joined OPEN 테스트용)
  const openChallenges = [];
  for (let i = 0; i < 100; i++) {
    const challenge = await prisma.challenge.create({
      data: {
        title: `[테스터용] OPEN 챌린지 ${FIELDS[i % FIELDS.length]} ${i + 1}`,
        sourceUrl: 'https://example.com',
        field: FIELDS[i % FIELDS.length],
        documentType: DOCUMENT_TYPES[i % DOCUMENT_TYPES.length],
        description: `tester 테스트용 OPEN 챌린지입니다. (${i + 1})`,
        deadline: futureDeadline(),
        createdAt: pastCreatedAt(),
        maxParticipants: 20,
        reviewStatus: 'APPROVED',
        progressStatus: 'OPEN',
        creatorId: admin.id,
      },
    });
    await prisma.challengeParticipant.create({
      data: { challengeId: challenge.id, userId: tester.id },
    });
    openChallenges.push(challenge);
  }
  console.log('✅ APPROVED+OPEN 챌린지 100개 생성 및 tester 참여');

  // 4. APPROVED + CLOSED 챌린지 100개 (admin 생성) + tester 참여 + submission (joined CLOSED 테스트용)
  for (let i = 0; i < 100; i++) {
    const challenge = await prisma.challenge.create({
      data: {
        title: `[테스터용] CLOSED 챌린지 ${FIELDS[i % FIELDS.length]} ${i + 1}`,
        sourceUrl: 'https://example.com',
        field: FIELDS[i % FIELDS.length],
        documentType: DOCUMENT_TYPES[i % DOCUMENT_TYPES.length],
        description: `tester 테스트용 CLOSED 챌린지입니다. (${i + 1})`,
        deadline: pastDeadline(),
        createdAt: pastCreatedAt(),
        maxParticipants: 20,
        reviewStatus: 'APPROVED',
        progressStatus: 'CLOSED',
        creatorId: admin.id,
      },
    });
    await prisma.challengeParticipant.create({
      data: { challengeId: challenge.id, userId: tester.id },
    });
    await prisma.submission.create({
      data: {
        challengeId: challenge.id,
        userId: tester.id,
        title: `[테스터용] ${challenge.title} 작업물`,
        content: '테스트 작업물 내용입니다.',
      },
    });
  }
  console.log('✅ APPROVED+CLOSED 챌린지 100개 생성 및 tester 참여+submission');

  // 4-1. tester가 생성한 APPROVED + OPEN 챌린지 (me/applied APPROVED 테스트용)
  for (let i = 0; i < 50; i++) {
    await prisma.challenge.create({
      data: {
        title: `[테스터신청] APPROVED 챌린지 ${FIELDS[i % FIELDS.length]} ${i + 1}`,
        sourceUrl: 'https://example.com',
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
        sourceUrl: 'https://example.com',
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

  // 5. PENDING 챌린지 50개 + tester 참여 (applied reviewStatus 테스트용)
  for (let i = 0; i < 50; i++) {
    const challenge = await prisma.challenge.create({
      data: {
        title: `[테스터용] PENDING 챌린지 ${FIELDS[i % FIELDS.length]} ${i + 1}`,
        sourceUrl: 'https://example.com',
        field: FIELDS[i % FIELDS.length],
        documentType: DOCUMENT_TYPES[i % DOCUMENT_TYPES.length],
        description: `tester 테스트용 PENDING 챌린지입니다. (${i + 1})`,
        deadline: futureDeadline(),
        createdAt: pastCreatedAt(),
        maxParticipants: 20,
        reviewStatus: 'PENDING',
        creatorId: tester.id,
      },
    });
    await prisma.challengeParticipant.create({
      data: { challengeId: challenge.id, userId: tester.id },
    });
  }
  console.log('✅ PENDING 챌린지 50개 생성 및 tester 참여');

  // 6. REJECTED 챌린지 50개 + tester 참여
  for (let i = 0; i < 50; i++) {
    const challenge = await prisma.challenge.create({
      data: {
        title: `[테스터용] REJECTED 챌린지 ${FIELDS[i % FIELDS.length]} ${i + 1}`,
        sourceUrl: 'https://example.com',
        field: FIELDS[i % FIELDS.length],
        documentType: DOCUMENT_TYPES[i % DOCUMENT_TYPES.length],
        description: `tester 테스트용 REJECTED 챌린지입니다. (${i + 1})`,
        deadline: futureDeadline(),
        createdAt: pastCreatedAt(),
        maxParticipants: 20,
        reviewStatus: 'REJECTED',
        rejectReason: '테스트용 거절 사유입니다.',
        creatorId: tester.id,
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
        sourceUrl: 'https://example.com',
        field: FIELDS[i % FIELDS.length],
        documentType: DOCUMENT_TYPES[i % DOCUMENT_TYPES.length],
        description: `tester 테스트용 DELETED 챌린지입니다. (${i + 1})`,
        deadline: futureDeadline(),
        createdAt: pastCreatedAt(),
        maxParticipants: 20,
        reviewStatus: 'DELETED',
        deleteReason: '테스트용 삭제 사유입니다.',
        creatorId: admin.id,
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
