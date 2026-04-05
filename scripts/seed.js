import { PrismaClient } from '#generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

const SEED_PASSWORD = 'test1!';
const TESTER_EMAIL = 'tester@docsru.com';

const FIELDS = ['NEXT_JS', 'MODERN_JS', 'API', 'WEB', 'CAREER'];
const SOURCE_URL_MAP = {
  NEXT_JS: 'https://nextjs.org/docs',
  MODERN_JS: 'https://javascript.info',
  API: 'https://developer.mozilla.org/ko/docs/Web/API',
  WEB: 'https://developer.mozilla.org/ko/docs/Web',
  CAREER: 'https://react.dev/reference/react',
};
const DOCUMENT_TYPES = ['OFFICIAL_DOC', 'BLOG', 'BOOK', 'ETC'];

const DAY = 1000 * 60 * 60 * 24;
const futureDeadline = () => new Date(Date.now() + DAY * (Math.floor(Math.random() * 90) + 1));
const pastDeadline = () => new Date(Date.now() - DAY * (Math.floor(Math.random() * 180) + 1));
const pastCreatedAt = () => new Date(Date.now() - DAY * (Math.floor(Math.random() * 365) + 1));
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const COUNT = {
  users: 100,
  openChallenges: 50,
  closedChallenges: 20,
  pendingChallenges: 15,
  rejectedChallenges: 10,
  draftsPerUser: 2,
};

class Seeder {
  #prisma;

  constructor(prisma) {
    this.#prisma = prisma;
  }

  #pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  #range(n) {
    return Array.from({ length: n }, (_, i) => i);
  }

  async #resetDb() {
    await this.#prisma.$transaction([
      this.#prisma.notification.deleteMany(),
      this.#prisma.draft.deleteMany(),
      this.#prisma.feedback.deleteMany(),
      this.#prisma.submissionLike.deleteMany(),
      this.#prisma.submission.deleteMany(),
      this.#prisma.challengeParticipant.deleteMany(),
      this.#prisma.challenge.deleteMany(),
      this.#prisma.user.deleteMany(),
    ]);
  }

  async #seedUsers(hashedPassword) {
    const admin = await this.#prisma.user.create({
      data: {
        email: 'docthru@docthru.com',
        nickname: 'admin',
        passwordHash: hashedPassword,
        provider: 'LOCAL',
        userType: 'ADMIN',
        grade: 'EXPERT',
      },
    });

    const tester = await this.#prisma.user.create({
      data: {
        email: TESTER_EMAIL,
        nickname: 'tester',
        passwordHash: hashedPassword,
        provider: 'LOCAL',
        userType: 'USER',
        grade: 'NORMAL',
      },
    });

    const users = await Promise.all(
      this.#range(COUNT.users).map((i) =>
        this.#prisma.user.create({
          data: {
            email: `user${i + 1}@docsru.com`,
            nickname: `user${i + 1}`,
            passwordHash: hashedPassword,
            provider: 'LOCAL',
            userType: 'USER',
            grade: i < COUNT.users / 2 ? 'EXPERT' : 'NORMAL',
          },
        }),
      ),
    );

    return { admin, tester, users };
  }

  async #seedChallenges(users) {
    const challenges = [];

    // APPROVED + OPEN
    for (let i = 0; i < COUNT.openChallenges; i++) {
      const field = this.#pick(FIELDS);
      challenges.push(
        await this.#prisma.challenge.create({
          data: {
            title: faker.lorem.sentence({ min: 3, max: 8 }),
            sourceUrl: SOURCE_URL_MAP[field],
            field,
            documentType: this.#pick(DOCUMENT_TYPES),
            description: faker.lorem.paragraphs(2),
            deadline: faker.date.future({ years: 1 }),
            maxParticipants: faker.number.int({ min: 5, max: 30 }),
            reviewStatus: 'APPROVED',
            progressStatus: 'OPEN',
            creatorId: users[i % users.length].id,
          },
        }),
      );
    }

    // APPROVED + CLOSED
    for (let i = 0; i < COUNT.closedChallenges; i++) {
      const field = this.#pick(FIELDS);
      challenges.push(
        await this.#prisma.challenge.create({
          data: {
            title: faker.lorem.sentence({ min: 3, max: 8 }),
            sourceUrl: SOURCE_URL_MAP[field],
            field,
            documentType: this.#pick(DOCUMENT_TYPES),
            description: faker.lorem.paragraphs(2),
            deadline: faker.date.past({ years: 1 }),
            maxParticipants: faker.number.int({ min: 5, max: 30 }),
            reviewStatus: 'APPROVED',
            progressStatus: 'CLOSED',
            creatorId: users[(i + COUNT.openChallenges) % users.length].id,
          },
        }),
      );
    }

    // PENDING
    for (let i = 0; i < COUNT.pendingChallenges; i++) {
      const field = this.#pick(FIELDS);
      challenges.push(
        await this.#prisma.challenge.create({
          data: {
            title: faker.lorem.sentence({ min: 3, max: 8 }),
            sourceUrl: SOURCE_URL_MAP[field],
            field,
            documentType: this.#pick(DOCUMENT_TYPES),
            description: faker.lorem.paragraphs(2),
            deadline: faker.date.future({ years: 1 }),
            maxParticipants: faker.number.int({ min: 5, max: 30 }),
            reviewStatus: 'PENDING',
            creatorId: users[(i + COUNT.openChallenges + COUNT.closedChallenges) % users.length].id,
          },
        }),
      );
    }

    // REJECTED
    for (let i = 0; i < COUNT.rejectedChallenges; i++) {
      const field = this.#pick(FIELDS);
      challenges.push(
        await this.#prisma.challenge.create({
          data: {
            title: faker.lorem.sentence({ min: 3, max: 8 }),
            sourceUrl: SOURCE_URL_MAP[field],
            field,
            documentType: this.#pick(DOCUMENT_TYPES),
            description: faker.lorem.paragraphs(2),
            deadline: faker.date.future({ years: 1 }),
            maxParticipants: faker.number.int({ min: 5, max: 30 }),
            reviewStatus: 'REJECTED',
            rejectReason: faker.lorem.sentence(),
            creatorId: users[(i + COUNT.openChallenges + COUNT.closedChallenges + COUNT.pendingChallenges) % users.length].id,
          },
        }),
      );
    }

    return challenges;
  }

  async #seedParticipants(challenges, users) {
    const approvedChallenges = challenges.filter((c) => c.reviewStatus === 'APPROVED');
    const participants = [];

    const shuffledChallenges = [...approvedChallenges].sort(() => Math.random() - 0.5);

    for (const user of users) {
      const eligible = shuffledChallenges.filter((c) => c.creatorId !== user.id);
      if (eligible.length === 0) continue;

      const challenge = eligible[Math.floor(Math.random() * eligible.length)];
      const participant = await this.#prisma.challengeParticipant.create({
        data: { challengeId: challenge.id, userId: user.id },
      });
      participants.push(participant);
    }

    return participants;
  }

  async #seedSubmissions(challenges, users) {
    const approvedChallenges = challenges.filter((c) => c.reviewStatus === 'APPROVED');
    const submissions = [];

    for (const challenge of approvedChallenges) {
      const count = faker.number.int({ min: 1, max: 2 });
      const shuffled = [...users].filter((u) => u.id !== challenge.creatorId).sort(() => Math.random() - 0.5);

      for (const user of shuffled.slice(0, count)) {
        const submission = await this.#prisma.submission.create({
          data: {
            challengeId: challenge.id,
            userId: user.id,
            title: faker.lorem.sentence({ min: 3, max: 7 }),
            content: faker.lorem.paragraphs(faker.number.int({ min: 3, max: 6 })),
            isDeleted: Math.random() < 0.05,
          },
        });
        submissions.push(submission);
      }
    }

    return submissions;
  }

  async #seedLikes(submissions, users) {
    const likes = [];

    for (const submission of submissions) {
      const count = faker.number.int({ min: 1, max: 2 });
      const shuffled = [...users].filter((u) => u.id !== submission.userId).sort(() => Math.random() - 0.5);

      for (const user of shuffled.slice(0, count)) {
        const like = await this.#prisma.submissionLike.create({
          data: { submissionId: submission.id, userId: user.id },
        });
        likes.push(like);
      }
    }

    return likes;
  }

  async #seedFeedbacks(submissions, users) {
    const feedbacks = [];

    for (const submission of submissions) {
      const count = faker.number.int({ min: 1, max: 2 });
      const shuffled = [...users].filter((u) => u.id !== submission.userId).sort(() => Math.random() - 0.5);

      for (const user of shuffled.slice(0, count)) {
        const feedback = await this.#prisma.feedback.create({
          data: {
            submissionId: submission.id,
            userId: user.id,
            content: faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 })),
          },
        });
        feedbacks.push(feedback);
      }
    }

    return feedbacks;
  }

  async #seedDrafts(challenges, users, participants) {
    const drafts = [];

    for (const user of users.slice(0, 10)) {
      const joinedIds = participants.filter((p) => p.userId === user.id).map((p) => p.challengeId);
      const joinedApproved = challenges.filter((c) => joinedIds.includes(c.id) && c.reviewStatus === 'APPROVED');
      if (joinedApproved.length === 0) continue;

      const shuffled = [...joinedApproved].sort(() => Math.random() - 0.5);
      for (const challenge of shuffled.slice(0, COUNT.draftsPerUser)) {
        const draft = await this.#prisma.draft.create({
          data: {
            challengeId: challenge.id,
            userId: user.id,
            title: faker.lorem.sentence({ min: 3, max: 6 }),
            content: faker.lorem.paragraphs(faker.number.int({ min: 2, max: 4 })),
          },
        });
        drafts.push(draft);
      }
    }

    return drafts;
  }

  async #seedNotifications(admin, users, challenges, submissions, feedbacks) {
    const notis = [];

    const approvedChallenges = challenges.filter((c) => c.reviewStatus === 'APPROVED');
    const rejectedChallenges = challenges.filter((c) => c.reviewStatus === 'REJECTED');

    for (const challenge of approvedChallenges) {
      notis.push(
        await this.#prisma.notification.create({
          data: {
            userId: challenge.creatorId,
            actorUserId: admin.id,
            type: 'CHALLENGE_ADMIN_APPROVED',
            content: '신청하신 챌린지가 승인되었습니다.',
            targetId: challenge.id,
          },
        }),
      );
    }

    for (const challenge of rejectedChallenges) {
      notis.push(
        await this.#prisma.notification.create({
          data: {
            userId: challenge.creatorId,
            actorUserId: admin.id,
            type: 'CHALLENGE_ADMIN_REJECTED',
            content: '신청하신 챌린지가 거절되었습니다.',
            targetId: challenge.id,
          },
        }),
      );
    }

    for (const submission of submissions.slice(0, 30)) {
      const liker = users.find((u) => u.id !== submission.userId);
      if (!liker) continue;
      notis.push(
        await this.#prisma.notification.create({
          data: {
            userId: submission.userId,
            actorUserId: liker.id,
            type: 'SUBMISSION_LIKED',
            content: '작업물에 좋아요가 달렸습니다.',
            targetId: submission.id,
            isRead: Math.random() < 0.5,
          },
        }),
      );
    }

    for (const feedback of feedbacks.slice(0, 30)) {
      const submission = submissions.find((s) => s.id === feedback.submissionId);
      if (!submission) continue;
      notis.push(
        await this.#prisma.notification.create({
          data: {
            userId: submission.userId,
            actorUserId: feedback.userId,
            type: 'FEEDBACK_CREATED',
            content: '작업물에 피드백이 달렸습니다.',
            targetId: feedback.id,
            isRead: Math.random() < 0.5,
          },
        }),
      );
    }

    return notis;
  }

  // ─── tester 전용 데이터 ───
  async #seedTesterData(admin, tester, users) {
    const pickUser = () => users[rand(0, users.length - 1)].id;
    const allSubmissions = [];

    const makeChallenge = (i, overrides) => {
      const field = FIELDS[i % FIELDS.length];
      return this.#prisma.challenge.create({
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

    // tester 참여 APPROVED+OPEN (30개)
    const openChallenges = [];
    for (let i = 0; i < 30; i++) {
      const creatorId = pickUser();
      const ch = await makeChallenge(i, {
        title: `[OPEN] ${FIELDS[i % FIELDS.length]} 번역 챌린지 ${i + 1}`,
        reviewStatus: 'APPROVED', progressStatus: 'OPEN', creatorId,
      });
      openChallenges.push(ch);

      await this.#prisma.challengeParticipant.create({ data: { challengeId: ch.id, userId: tester.id } });
      const participants = shuffle(users.filter((u) => u.id !== creatorId)).slice(0, rand(10, 15));
      await this.#prisma.challengeParticipant.createMany({
        data: participants.map((u) => ({ challengeId: ch.id, userId: u.id })),
        skipDuplicates: true,
      });

      const submitters = shuffle(participants).slice(0, rand(5, 8));
      for (const u of submitters) {
        const sub = await this.#prisma.submission.create({
          data: { challengeId: ch.id, userId: u.id, title: `작업물 - ${u.nickname || u.id.slice(-4)}`, content: '번역 작업물 내용입니다.' },
        });
        allSubmissions.push(sub);
      }
    }
    console.log('  ✅ APPROVED+OPEN 30개 (tester 참여 + 참여자 + 작업물)');

    // tester 참여 APPROVED+CLOSED (30개) + tester 작업물
    for (let i = 0; i < 30; i++) {
      const creatorId = pickUser();
      const ch = await makeChallenge(i, {
        title: `[CLOSED] ${FIELDS[i % FIELDS.length]} 번역 챌린지 ${i + 1}`,
        reviewStatus: 'APPROVED', progressStatus: 'CLOSED', creatorId, deadline: pastDeadline(),
      });

      await this.#prisma.challengeParticipant.create({ data: { challengeId: ch.id, userId: tester.id } });
      const testerSub = await this.#prisma.submission.create({
        data: { challengeId: ch.id, userId: tester.id, title: `[내 작업물] ${ch.title}`, content: '내가 작성한 번역 작업물입니다.' },
      });
      allSubmissions.push(testerSub);

      const participants = shuffle(users.filter((u) => u.id !== creatorId)).slice(0, rand(10, 15));
      await this.#prisma.challengeParticipant.createMany({
        data: participants.map((u) => ({ challengeId: ch.id, userId: u.id })),
        skipDuplicates: true,
      });
      const submitters = shuffle(participants).slice(0, rand(5, 8));
      for (const u of submitters) {
        const sub = await this.#prisma.submission.create({
          data: { challengeId: ch.id, userId: u.id, title: `작업물 - ${u.nickname || u.id.slice(-4)}`, content: '번역 작업물 내용입니다.' },
        });
        allSubmissions.push(sub);
      }
    }
    console.log('  ✅ APPROVED+CLOSED 30개 (tester 참여 + 작업물)');

    // 좋아요 (0~15개 분포)
    const allLikers = [...users, tester];
    for (const sub of allSubmissions) {
      const eligible = allLikers.filter((u) => u.id !== sub.userId);
      const count = rand(0, Math.min(15, eligible.length));
      if (count === 0) continue;
      await this.#prisma.submissionLike.createMany({
        data: shuffle(eligible).slice(0, count).map((u) => ({ submissionId: sub.id, userId: u.id })),
        skipDuplicates: true,
      });
    }
    console.log(`  ✅ 작업물 ${allSubmissions.length}개에 좋아요 추가`);

    // 피드백 (1~3개)
    let feedbackCount = 0;
    for (const sub of allSubmissions) {
      const eligible = allLikers.filter((u) => u.id !== sub.userId);
      const commenters = shuffle(eligible).slice(0, rand(1, 3));
      for (const u of commenters) {
        await this.#prisma.feedback.create({
          data: { submissionId: sub.id, userId: u.id, content: `좋은 번역이에요! 피드백 ${++feedbackCount}` },
        });
      }
    }
    console.log(`  ✅ 피드백 ${feedbackCount}개`);

    // tester 생성 챌린지 (me/applied) 4가지 상태 각 25개
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
      console.log(`  ✅ tester 생성 ${cfg.status} 챌린지 ${cfg.count}개`);
    }

    // tester 참여 PENDING/REJECTED/DELETED
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
        await this.#prisma.challengeParticipant.create({ data: { challengeId: ch.id, userId: tester.id } });
      }
      console.log(`  ✅ ${cfg.status} 챌린지 ${cfg.count}개 (tester 참여)`);
    }

    // 알림
    const testerSubs = allSubmissions.filter((s) => s.userId === tester.id);
    const notiData = [
      ...Array.from({ length: 20 }, (_, i) => ({
        userId: tester.id, actorUserId: admin.id,
        type: 'CHALLENGE_ADMIN_APPROVED', content: '챌린지가 승인되었습니다.',
        targetId: openChallenges[i % openChallenges.length].id, isRead: Math.random() < 0.3,
      })),
      ...Array.from({ length: 10 }, (_, i) => ({
        userId: tester.id, actorUserId: admin.id,
        type: 'CHALLENGE_ADMIN_REJECTED', content: '챌린지가 거절되었습니다.',
        targetId: openChallenges[i % openChallenges.length].id, isRead: Math.random() < 0.3,
      })),
      ...testerSubs.slice(0, 20).map((sub) => ({
        userId: tester.id, actorUserId: pickUser(),
        type: 'SUBMISSION_LIKED', content: '작업물에 좋아요가 달렸습니다.',
        targetId: sub.id, isRead: Math.random() < 0.3,
      })),
      ...testerSubs.slice(0, 15).map((sub) => ({
        userId: tester.id, actorUserId: pickUser(),
        type: 'FEEDBACK_CREATED', content: '작업물에 피드백이 달렸습니다.',
        targetId: sub.id, isRead: Math.random() < 0.3,
      })),
    ];
    await this.#prisma.notification.createMany({ data: notiData });
    console.log(`  ✅ 알림 ${notiData.length}개`);

    // 임시저장
    for (const ch of openChallenges.slice(0, 10)) {
      await this.#prisma.draft.create({
        data: { challengeId: ch.id, userId: tester.id, title: `[임시저장] ${ch.title}`, content: '임시저장 내용입니다.' },
      });
    }
    console.log('  ✅ 임시저장 10개');
  }

  async run() {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('⚠️ 프로덕션 환경에서는 시딩을 실행하지 않습니다');
    }

    console.log('🌱 시딩 시작...');

    const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);

    await this.#resetDb();
    console.log('✅ 기존 데이터 삭제 완료');

    const { admin, tester, users } = await this.#seedUsers(hashedPassword);
    console.log(`✅ 유저 ${users.length + 2}명 생성 (admin 1 + tester 1 + user ${users.length})`);

    const challenges = await this.#seedChallenges(users);
    console.log(`✅ 챌린지 ${challenges.length}개 생성 (OPEN ${COUNT.openChallenges} / CLOSED ${COUNT.closedChallenges} / PENDING ${COUNT.pendingChallenges} / REJECTED ${COUNT.rejectedChallenges})`);

    const participants = await this.#seedParticipants(challenges, users);
    console.log(`✅ 챌린지 참여자 ${participants.length}명 생성`);

    const submissions = await this.#seedSubmissions(challenges, users);
    console.log(`✅ 작업물 ${submissions.length}개 생성`);

    const likes = await this.#seedLikes(submissions, users);
    console.log(`✅ 좋아요 ${likes.length}개 생성`);

    const feedbacks = await this.#seedFeedbacks(submissions, users);
    console.log(`✅ 피드백 ${feedbacks.length}개 생성`);

    const drafts = await this.#seedDrafts(challenges, users, participants);
    console.log(`✅ 임시저장 ${drafts.length}개 생성`);

    const notifications = await this.#seedNotifications(admin, users, challenges, submissions, feedbacks);
    console.log(`✅ 알림 ${notifications.length}개 생성`);

    // tester 전용 데이터
    console.log('\n🧪 tester 데이터 시딩...');
    await this.#seedTesterData(admin, tester, users);

    console.log('\n────────────────────────────');
    console.log('🔑 테스트 계정 (공통 비밀번호: ' + SEED_PASSWORD + ')');
    console.log('   docthru@docthru.com    (ADMIN / EXPERT)');
    console.log('   tester@docsru.com      (USER / NORMAL) ← 시연용');
    console.log('   user1~50@docsru.com    (USER / EXPERT)');
    console.log('   user51~100@docsru.com  (USER / NORMAL)');
    console.log('────────────────────────────');
    console.log('✅ 시딩 완료');
  }
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const seeder = new Seeder(prisma);

seeder
  .run()
  .catch((e) => {
    console.error('❌ 시딩 에러:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
