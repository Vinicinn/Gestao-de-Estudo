import { BaseService } from "../../../core/baseService.js";

export class FeedbackService extends BaseService {
  constructor(feedbackRepository, resourceRepository, scheduleRepository) {
    super(feedbackRepository, "Feedback");
    this.feedbackRepository = feedbackRepository;
    this.resourceRepository = resourceRepository;
    this.scheduleRepository = scheduleRepository;
  }

  getLocalIsoDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  addDays(date, days) {
    const nextDate = new Date(`${date}T00:00:00`);
    nextDate.setDate(nextDate.getDate() + days);
    return this.getLocalIsoDate(nextDate);
  }

  getNextReviewInterval(feedback) {
    if (feedback.metadata?.skipped) {
      return 1;
    }

    const score = feedback.score ?? 3;
    const difficulty = feedback.metadata?.perceivedDifficulty;

    if (difficulty === "hard" || difficulty === "dificil" || score <= 2) {
      return 1;
    }
    if (difficulty === "medium" || difficulty === "medio" || score === 3) {
      return 3;
    }
    if (difficulty === "easy" || difficulty === "facil" || score >= 5) {
      return 14;
    }

    return 7;
  }

  async updateResourceReviewSchedule(userId, feedback) {
    if (!feedback.resourceId) {
      return;
    }

    const resource = await this.resourceRepository.findByIdAndUserId(feedback.resourceId, userId);
    if (!resource) {
      return;
    }

    const reviewDate = feedback.reviewDate || this.getLocalIsoDate();
    const intervalDays = this.getNextReviewInterval(feedback);
    const nextDate = this.addDays(reviewDate, intervalDays);

    await this.resourceRepository.update(feedback.resourceId, {
      schedule: {
        ...(resource.schedule || {}),
        lastReview: reviewDate,
        nextDate,
        intervalDays,
      },
    });
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
    const score = payload.score === undefined || payload.score === null || payload.score === "" ? null : Number(payload.score);
    const reviewDate = payload.reviewDate || this.getLocalIsoDate();

    if (score !== null && (Number.isNaN(score) || score < 1 || score > 5)) {
      throw new Error("Score deve ser um numero entre 1 e 5");
    }
    if (Number.isNaN(Date.parse(reviewDate))) {
      throw new Error("Data da revisao invalida");
    }

    return {
      resourceId: payload.resourceId || null,
      scheduleId: payload.scheduleId || null,
      score,
      note: payload.note?.trim() || "",
      reviewDate,
      metadata: {
        ...(payload.metadata || {}),
        reviewDate,
      },
    };
  }

  async beforeCreate(userId, feedback) {
    await this.validateTarget(userId, feedback.resourceId, feedback.scheduleId);
    await this.updateResourceReviewSchedule(userId, feedback);
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
