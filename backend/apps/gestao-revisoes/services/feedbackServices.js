import { BaseService } from "../../../core/baseService.js";

export class FeedbackService extends BaseService {
  constructor(feedbackRepository, resourceRepository, scheduleRepository) {
    super(feedbackRepository, "Feedback");
    this.feedbackRepository = feedbackRepository;
    this.resourceRepository = resourceRepository;
    this.scheduleRepository = scheduleRepository;
  }

  async validateTarget(userId, resourceId, scheduleId) {
    if (!resourceId && !scheduleId) {
      throw new Error("Informe resourceId ou scheduleId");
    }

    if (resourceId) {
      this.validateObjectId(resourceId, "ID do recurso");
      const resource = await this.resourceRepository.findByIdAndUserId(resourceId, userId);
      if (!resource) {
        throw new Error("Recurso nao encontrado");
      }
    }

    if (scheduleId) {
      this.validateObjectId(scheduleId, "ID do agendamento");
      const schedule = await this.scheduleRepository.findByIdAndUserId(scheduleId, userId);
      if (!schedule) {
        throw new Error("Agendamento nao encontrado");
      }
    }
  }

  normalizePayload(payload) {
    const score = payload.score === undefined ? null : Number(payload.score);

    if (score !== null && (Number.isNaN(score) || score < 1 || score > 5)) {
      throw new Error("Score deve ser um numero entre 1 e 5");
    }

    return {
      resourceId: payload.resourceId || null,
      scheduleId: payload.scheduleId || null,
      score,
      note: payload.note?.trim() || "",
      metadata: payload.metadata || {},
    };
  }

  async beforeCreate(userId, feedback) {
    await this.validateTarget(userId, feedback.resourceId, feedback.scheduleId);
  }

  async createFeedback(userId, payload) {
    return await this.create(userId, payload);
  }

  async getUserFeedbacks(userId) {
    return await this.getAll(userId);
  }

  async deleteFeedback(id, userId) {
    return await this.delete(id, userId);
  }
}
