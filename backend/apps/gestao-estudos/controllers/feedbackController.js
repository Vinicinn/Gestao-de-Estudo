import { BaseController } from "../../../core/baseController.js";

export class FeedbackController extends BaseController {
  constructor(feedbackService) {
    super(feedbackService, "Feedback");
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
}
