import { ObjectId } from "mongodb";

export class FeedbackService {
  constructor(feedbackRepository, resourceRepository, scheduleRepository) {
    this.feedbackRepository = feedbackRepository;
    this.resourceRepository = resourceRepository;
    this.scheduleRepository = scheduleRepository;
  }

  validateUserId(userId) {
    if (!ObjectId.isValid(userId)) {
      throw new Error("ID de usuario invalido");
    }
  }

  async validateTarget(userId, resourceId, scheduleId) {
    if (!resourceId && !scheduleId) {
      throw new Error("Informe resourceId ou scheduleId");
    }

    if (resourceId) {
      if (!ObjectId.isValid(resourceId)) {
        throw new Error("ID do recurso invalido");
      }
      const resource = await this.resourceRepository.findByIdAndUserId(resourceId, userId);
      if (!resource) {
        throw new Error("Recurso nao encontrado");
      }
    }

    if (scheduleId) {
      if (!ObjectId.isValid(scheduleId)) {
        throw new Error("ID do agendamento invalido");
      }
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

  async createFeedback(userId, payload) {
    this.validateUserId(userId);
    const feedback = this.normalizePayload(payload);
    await this.validateTarget(userId, feedback.resourceId, feedback.scheduleId);

    return await this.feedbackRepository.create({
      userId,
      ...feedback,
    });
  }

  async getUserFeedbacks(userId) {
    this.validateUserId(userId);
    return await this.feedbackRepository.findByUserId(userId);
  }

  async deleteFeedback(id, userId) {
    this.validateUserId(userId);
    const feedback = await this.feedbackRepository.findByIdAndUserId(id, userId);
    if (!feedback) {
      throw new Error("Feedback nao encontrado");
    }

    await this.feedbackRepository.delete(id);
    return { message: "Feedback removido com sucesso" };
  }
}
