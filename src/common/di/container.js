import {
  createContainer as createAwilixContainer,
  asClass,
  asValue,
  InjectionMode,
  Lifetime,
} from 'awilix';
import { prisma } from '#db/prisma.js';
import {
  UserRepository,
  ChallengeRepository,
  ChallengeParticipantRepository,
  DraftRepository,
  SubmissionRepository,
  SubmissionLikeRepository,
  NotificationRepository,
  FeedbackRepository,
} from '#repository';
import {
  AuthService,
  SocialAuthService,
  UserService,
  ChallengeService,
  SubmissionService,
  SubmissionLikeService,
  DraftService,
  FeedbackService,
  NotificationService,
  AdminService,
} from '#services';
import {
  AuthController,
  UserController,
  ChallengeController,
  SubmissionController,
  FeedbackController,
  NotificationController,
  Controller,
  AdminController,
} from '#controllers';
import { PasswordProvider, TokenProvider, CookieProvider } from '#providers';
import { AuthMiddleware } from '#middlewares';

export const createContainer = () => {
  const container = createAwilixContainer({
    injectionMode: InjectionMode.PROXY,
    strict: true,
  });

  container.register({
    // 1. Providers / Data Access
    prisma: asValue(prisma),
    userRepository: asClass(UserRepository, { lifetime: Lifetime.SINGLETON }),
    challengeRepository: asClass(ChallengeRepository, {
      lifetime: Lifetime.SINGLETON,
    }),
    challengeParticipantRepository: asClass(ChallengeParticipantRepository, {
      lifetime: Lifetime.SINGLETON,
    }),
    draftRepository: asClass(DraftRepository, {
      lifetime: Lifetime.SINGLETON,
    }),
    submissionRepository: asClass(SubmissionRepository, {
      lifetime: Lifetime.SINGLETON,
    }),
    submissionLikeRepository: asClass(SubmissionLikeRepository, {
      lifetime: Lifetime.SINGLETON,
    }),
    notificationRepository: asClass(NotificationRepository, {
      lifetime: Lifetime.SINGLETON,
    }),
    feedbackRepository: asClass(FeedbackRepository, {
      lifetime: Lifetime.SINGLETON,
    }),
    passwordProvider: asClass(PasswordProvider, {
      lifetime: Lifetime.SINGLETON,
    }),
    tokenProvider: asClass(TokenProvider, { lifetime: Lifetime.SINGLETON }),
    cookieProvider: asClass(CookieProvider, { lifetime: Lifetime.SINGLETON }),

    // 2. Services
    authService: asClass(AuthService, { lifetime: Lifetime.SINGLETON }),
    socialAuthService: asClass(SocialAuthService, {
      lifetime: Lifetime.SINGLETON,
    }),
    userService: asClass(UserService, { lifetime: Lifetime.SINGLETON }),
    challengeService: asClass(ChallengeService, {
      lifetime: Lifetime.SINGLETON,
    }),
    submissionService: asClass(SubmissionService, {
      lifetime: Lifetime.SINGLETON,
    }),
    draftService: asClass(DraftService, { lifetime: Lifetime.SINGLETON }),
    submissionLikeService: asClass(SubmissionLikeService, {
      lifetime: Lifetime.SINGLETON,
    }),
    feedbackService: asClass(FeedbackService, {
      lifetime: Lifetime.SINGLETON,
    }),
    notificationService: asClass(NotificationService, {
      lifetime: Lifetime.SINGLETON,
    }),
    adminService: asClass(AdminService, {
      lifetime: Lifetime.SINGLETON,
    }),

    // 3. Middlewares
    authMiddleware: asClass(AuthMiddleware, { lifetime: Lifetime.SINGLETON }),

    // 4. Controllers
    authController: asClass(AuthController, { lifetime: Lifetime.SINGLETON }),
    userController: asClass(UserController, { lifetime: Lifetime.SINGLETON }),
    challengeController: asClass(ChallengeController, {
      lifetime: Lifetime.SINGLETON,
    }),
    submissionController: asClass(SubmissionController, {
      lifetime: Lifetime.SINGLETON,
    }),
    feedbackController: asClass(FeedbackController, {
      lifetime: Lifetime.SINGLETON,
    }),
    notificationController: asClass(NotificationController, {
      lifetime: Lifetime.SINGLETON,
    }),
    adminController: asClass(AdminController, { lifetime: Lifetime.SINGLETON }),
    // 5. Root Controller
    controller: asClass(Controller, { lifetime: Lifetime.SINGLETON }),
  });

  return container.cradle;
};
