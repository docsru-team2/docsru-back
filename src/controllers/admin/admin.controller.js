import { BaseController } from '#controllers/base.controller.js';
import { HTTP_STATUS } from '#constants';
import { validate } from '#middlewares';
import { idParamSchema } from './dto/admin.dto.js';

export class AdminController extends BaseController {
  #adminService;

  constructor({ adminService }) {
    super();
    this.#adminService = adminService;
  }

  routes() {
    this.router.get(
      '/challenges',
      // needsLogin,
      (req, res) => this.getList(req, res),
    );

    this.router.get(
      '/challenges/:id',
      validate('params', idParamSchema),
      (req, res) => this.getDetail(req, res),
    );

    this.router.patch(
      '/challenges/:id/approve',
      validate('params', idParamSchema),
      (req, res) => this.approveChallenge(req, res),
    );

    this.router.patch(
      '/challenges/:id/reject',
      validate('params', idParamSchema),
      (req, res) => this.rejectChallenge(req, res),
    );

    this.router.patch(
      '/challenges/:id/delete',
      validate('params', idParamSchema),
      (req, res) => this.deleteChallenge(req, res),
    );

    this.router.patch(
      '/challenges/:id',
      validate('params', idParamSchema),
      (req, res) => this.editChallenge(req, res),
    );

    this.router.patch(
      '/submissions/:id/delete',
      validate('params', idParamSchema),
      (req, res) => this.deleteSubmission(req, res),
    );

    this.router.patch(
      '/submissions/:id',
      validate('params', idParamSchema),
      (req, res) => this.editSubmission(req, res),
    );

    this.router.delete(
      '/feedbacks/:id',
      validate('params', idParamSchema),
      (req, res) => this.deleteFeedback(req, res),
    );

    return this.router;
  }

  //챌린지 목록 조회 - /admin/challenges
  async getList(req, res) {
    const { page, pageSize, sort, keyword, reviewStatus } = req.query;
    const result = await this.#adminService.getChallengeList({
      page: Number(page), // 문자열 → 숫자 변환
      limit: Number(pageSize),
      sort,
      keyword,
      reviewStatus,
    });
    res.status(HTTP_STATUS.OK).json(result);
  }

  //첼린지 상세 조회 - /challenges/:id
  async getDetail(req, res) {
    const { id } = req.params;
    const result = await this.#adminService.getChallengeDetail(id);
    res.status(HTTP_STATUS.OK).json(result);
  }

  //챌린지 신청 승인 - /challenges/:id/approve
  async approveChallenge(req, res) {
    const { id } = req.params;
    // const { id: adminId } = req.user;
    const adminId = '01KMGWE23AVPE8W0VGM5MR03E9'; //어드민 계정 테스트용

    const result = await this.#adminService.approveChallenge(id, adminId);
    res.status(HTTP_STATUS.OK).json(result);
  }

  //챌린지 신청 거절 - /challenges/:id/reject
  async rejectChallenge(req, res) {
    const { id } = req.params;
    const { rejectReason } = req.body;
    // const { id: adminId } = req.user;
    const adminId = '01KMGWE23AVPE8W0VGM5MR03E9'; //어드민 계정 테스트용

    const result = await this.#adminService.rejectChallenge(id, adminId, {
      rejectReason,
    });
    res.status(HTTP_STATUS.OK).json(result);
  }

  //챌린지 신청 수정 - /challenges/:id
  async editChallenge(req, res) {
    const { id } = req.params;
    // const { id: adminId } = req.user;
    const adminId = '01KMGWE23AVPE8W0VGM5MR03E9'; //어드민 계정 테스트용

    const result = await this.#adminService.editChallenge(
      id,
      adminId,
      req.body,
    );
    res.status(HTTP_STATUS.OK).json(result);
  }

  //챌린지 삭제(soft delete) - /challenges/:id/delete
  async deleteChallenge(req, res) {
    const { id } = req.params;
    const { deleteReason } = req.body;
    // const { id: adminId } = req.user;
    const adminId = '01KMGWE23AVPE8W0VGM5MR03E9'; //어드민 계정 테스트용

    const result = await this.#adminService.deleteChallenge(id, adminId, {
      deleteReason,
    });

    res.status(HTTP_STATUS.OK).json(result);
  }

  //작업물 수정
  async editSubmission(req, res) {
    const { id } = req.params;
    // const { id: adminId } = req.user;
    const adminId = '01KMGWE23AVPE8W0VGM5MR03E9'; //어드민 계정 테스트용

    const result = await this.#adminService.editSubmission(
      id,
      adminId,
      req.body,
    );

    res.status(HTTP_STATUS.OK).json(result);
  }

  //작업물 삭제
  async deleteSubmission(req, res) {
    const { id } = req.params;
    // const { id: adminId } = req.user;
    const adminId = '01KMGWE23AVPE8W0VGM5MR03E9'; //어드민 계정 테스트용

    const result = await this.#adminService.deleteSubmission(id, adminId);

    res.status(HTTP_STATUS.OK).json(result);
  }

  //피드백 삭제
  async deleteFeedback(req, res) {
    const { id } = req.params;
    // const { id: adminId } = req.user;
    const adminId = '01KMGWE23AVPE8W0VGM5MR03E9'; //어드민 계정 테스트용

    const result = await this.#adminService.deleteFeedback(id, adminId);

    res.status(HTTP_STATUS.NO_CONTENT).json(result);
  }
}
