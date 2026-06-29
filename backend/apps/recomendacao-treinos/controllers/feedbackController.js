import { BaseController } from "../../../core/baseController.js";

export class FeedbackController extends BaseController {
  constructor(feedbackService) {
    super(feedbackService, "Historico");
    this.feedbackService = feedbackService;
  }

  async createFeedback(req, res) {
    return await this.create(req, res);
  }

  async getUserFeedbacks(req, res) {
    return await this.getAll(req, res);
  }

  async deleteFeedback(req, res) {
    return await this.delete(req, res);
  }

  async getByType(req, res) {
    return await this.handle(
      res,
      async () => this.ok(res, await this.feedbackService.getByType(req.user.id, req.params.type)),
      "Erro ao buscar historico por tipo",
      500,
    );
  }

  async getSummary(req, res) {
    return await this.handle(
      res,
      async () => this.ok(res, await this.feedbackService.getSummary(req.user.id)),
      "Erro ao gerar resumo do historico",
      500,
    );
  }
}
