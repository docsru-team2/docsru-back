import { PrismaClient } from '#generated/prisma/client.ts';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

const SEED_PASSWORD = 'test1!';

const FIELDS = ['NEXT_JS', 'MODERN_JS', 'API', 'WEB', 'CAREER'];
const DOCUMENT_TYPES = ['OFFICIAL_DOC', 'BLOG', 'BOOK', 'ETC'];

// ──────────────────────── 수량 설정 ────────────────────────
const COUNT = {
  users: 100, // 일반 유저 수
  openChallenges: 50, // APPROVED + OPEN
  closedChallenges: 20, // APPROVED + CLOSED
  pendingChallenges: 15, // PENDING
  rejectedChallenges: 10, // REJECTED
  draftsPerUser: 2, // 유저당 임시저장 수
};
// ───────────────────────────────────────────────────────────

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

    return { admin, users };
  }

  async #seedChallenges(users) {
    const challenges = [];

    // APPROVED + OPEN
    for (let i = 0; i < COUNT.openChallenges; i++) {
      challenges.push(
        await this.#prisma.challenge.create({
          data: {
            title: faker.lorem.sentence({ min: 3, max: 8 }),
            sourceUrl: faker.internet.url(),
            field: this.#pick(FIELDS),
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
      challenges.push(
        await this.#prisma.challenge.create({
          data: {
            title: faker.lorem.sentence({ min: 3, max: 8 }),
            sourceUrl: faker.internet.url(),
            field: this.#pick(FIELDS),
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
      challenges.push(
        await this.#prisma.challenge.create({
          data: {
            title: faker.lorem.sentence({ min: 3, max: 8 }),
            sourceUrl: faker.internet.url(),
            field: this.#pick(FIELDS),
            documentType: this.#pick(DOCUMENT_TYPES),
            description: faker.lorem.paragraphs(2),
            deadline: faker.date.future({ years: 1 }),
            maxParticipants: faker.number.int({ min: 5, max: 30 }),
            reviewStatus: 'PENDING',
            creatorId:
              users[
                (i + COUNT.openChallenges + COUNT.closedChallenges) %
                  users.length
              ].id,
          },
        }),
      );
    }

    // REJECTED
    for (let i = 0; i < COUNT.rejectedChallenges; i++) {
      challenges.push(
        await this.#prisma.challenge.create({
          data: {
            title: faker.lorem.sentence({ min: 3, max: 8 }),
            sourceUrl: faker.internet.url(),
            field: this.#pick(FIELDS),
            documentType: this.#pick(DOCUMENT_TYPES),
            description: faker.lorem.paragraphs(2),
            deadline: faker.date.future({ years: 1 }),
            maxParticipants: faker.number.int({ min: 5, max: 30 }),
            reviewStatus: 'REJECTED',
            rejectReason: faker.lorem.sentence(),
            creatorId:
              users[
                (i +
                  COUNT.openChallenges +
                  COUNT.closedChallenges +
                  COUNT.pendingChallenges) %
                  users.length
              ].id,
          },
        }),
      );
    }

    return challenges;
  }

  async #seedParticipants(challenges, users) {
    const approvedChallenges = challenges.filter(
      (c) => c.reviewStatus === 'APPROVED',
    );
    const participants = [];

    // 유저 한 명당 챌린지 1개만 참여
    const shuffledChallenges = [...approvedChallenges].sort(
      () => Math.random() - 0.5,
    );

    for (const user of users) {
      // 참여할 챌린지를 랜덤으로 1개 선택 (본인이 만든 챌린지 제외)
      const eligible = shuffledChallenges.filter(
        (c) => c.creatorId !== user.id,
      );
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
    const approvedChallenges = challenges.filter(
      (c) => c.reviewStatus === 'APPROVED',
    );
    const submissions = [];

    // 챌린지당 1~2개 작업물 → 총 ~100개
    for (const challenge of approvedChallenges) {
      const count = faker.number.int({ min: 1, max: 2 });
      const shuffled = [...users]
        .filter((u) => u.id !== challenge.creatorId)
        .sort(() => Math.random() - 0.5);

      for (const user of shuffled.slice(0, count)) {
        const submission = await this.#prisma.submission.create({
          data: {
            challengeId: challenge.id,
            userId: user.id,
            title: faker.lorem.sentence({ min: 3, max: 7 }),
            content: faker.lorem.paragraphs(
              faker.number.int({ min: 3, max: 6 }),
            ),
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

    // 작업물당 1~2개 좋아요 → 총 ~100~200개
    for (const submission of submissions) {
      const count = faker.number.int({ min: 1, max: 2 });
      const shuffled = [...users]
        .filter((u) => u.id !== submission.userId)
        .sort(() => Math.random() - 0.5);

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

    // 작업물당 1~2개 피드백 → 총 ~100~200개
    for (const submission of submissions) {
      const count = faker.number.int({ min: 1, max: 2 });
      const shuffled = [...users]
        .filter((u) => u.id !== submission.userId)
        .sort(() => Math.random() - 0.5);

      for (const user of shuffled.slice(0, count)) {
        const feedback = await this.#prisma.feedback.create({
          data: {
            submissionId: submission.id,
            userId: user.id,
            content: faker.lorem.paragraphs(
              faker.number.int({ min: 1, max: 3 }),
            ),
          },
        });
        feedbacks.push(feedback);
      }
    }

    return feedbacks;
  }

  async #seedDrafts(challenges, users) {
    const drafts = [];
    const approvedOrPendingChallenges = challenges.filter(
      (c) => c.reviewStatus === 'APPROVED' || c.reviewStatus === 'PENDING',
    );

    for (const user of users.slice(0, 10)) {
      const shuffled = [...approvedOrPendingChallenges].sort(
        () => Math.random() - 0.5,
      );
      for (const challenge of shuffled.slice(0, COUNT.draftsPerUser)) {
        const draft = await this.#prisma.draft.create({
          data: {
            challengeId: challenge.id,
            userId: user.id,
            title: faker.lorem.sentence({ min: 3, max: 6 }),
            content: faker.lorem.paragraphs(
              faker.number.int({ min: 2, max: 4 }),
            ),
          },
        });
        drafts.push(draft);
      }
    }

    return drafts;
  }

  async #seedNotifications(admin, users, challenges, submissions, feedbacks) {
    const notis = [];

    const approvedChallenges = challenges.filter(
      (c) => c.reviewStatus === 'APPROVED',
    );
    const rejectedChallenges = challenges.filter(
      (c) => c.reviewStatus === 'REJECTED',
    );

    // 챌린지 승인 알림
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

    // 챌린지 거절 알림
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

    // 작업물 좋아요 알림 (작업물마다 랜덤 1명)
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

    // 피드백 생성 알림
    for (const feedback of feedbacks.slice(0, 30)) {
      const submission = submissions.find(
        (s) => s.id === feedback.submissionId,
      );
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

  async run() {
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('⚠️ 프로덕션 환경에서는 시딩을 실행하지 않습니다');
    }

    console.log('🌱 시딩 시작...');

    const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);

    await this.#resetDb();
    console.log('✅ 기존 데이터 삭제 완료');

    const { admin, users } = await this.#seedUsers(hashedPassword);
    console.log(
      `✅ 유저 ${users.length + 1}명 생성 (admin 1 + user ${users.length})`,
    );

    const challenges = await this.#seedChallenges(users);
    console.log(
      `✅ 챌린지 ${challenges.length}개 생성 (OPEN ${COUNT.openChallenges} / CLOSED ${COUNT.closedChallenges} / PENDING ${COUNT.pendingChallenges} / REJECTED ${COUNT.rejectedChallenges})`,
    );

    const participants = await this.#seedParticipants(challenges, users);
    console.log(`✅ 챌린지 참여자 ${participants.length}명 생성`);

    const submissions = await this.#seedSubmissions(challenges, users);
    console.log(`✅ 작업물 ${submissions.length}개 생성`);

    const likes = await this.#seedLikes(submissions, users);
    console.log(`✅ 좋아요 ${likes.length}개 생성`);

    const feedbacks = await this.#seedFeedbacks(submissions, users);
    console.log(`✅ 피드백 ${feedbacks.length}개 생성`);

    const drafts = await this.#seedDrafts(challenges, users);
    console.log(`✅ 임시저장 ${drafts.length}개 생성`);

    const notifications = await this.#seedNotifications(
      admin,
      users,
      challenges,
      submissions,
      feedbacks,
    );
    console.log(`✅ 알림 ${notifications.length}개 생성`);

    console.log('--------');
    console.log('🔑 테스트 계정 (공통 비밀번호: ' + SEED_PASSWORD + ')');
    console.log('   docthru@docthru.com   (ADMIN / EXPERT)');
    console.log('   user1~50@docsru.com   (USER / EXPERT)');
    console.log('   user51~100@docsru.com (USER / NORMAL)');
    console.log('--------');
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
