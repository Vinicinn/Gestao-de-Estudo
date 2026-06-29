import { BaseService } from "../../../core/baseService.js";

export class FeedbackService extends BaseService {
  constructor(feedbackRepository, resourceRepository) {
    super(feedbackRepository, "Historico");
    this.feedbackRepository = feedbackRepository;
    this.resourceRepository = resourceRepository;
  }

  normalizePayload(payload) {
    const type = payload.type?.trim();
    if (!type) {
      throw new Error("Tipo de historico invalido");
    }

    return {
      type,
      workoutId: payload.workoutId || null,
      payload: payload.payload || {},
      createdAt: new Date().toISOString(),
    };
  }

  async beforeCreate(userId, data) {
    if (data.workoutId) {
      const workout = await this.resourceRepository.findByIdAndUserId(data.workoutId, userId);
      if (!workout) {
        throw new Error("Treino nao encontrado para registrar historico");
      }
    }
  }

  async getUserFeedbacks(userId) {
    return await this.getAll(userId);
  }

  async createFeedback(userId, payload) {
    return await this.create(userId, payload);
  }

  async deleteFeedback(id, userId) {
    return await this.delete(id, userId);
  }

  async getByType(userId, type) {
    this.validateUserId(userId);
    return await this.feedbackRepository.findByType(userId, type);
  }

  async getSummary(userId) {
    this.validateUserId(userId);

    const [history, completedWorkouts] = await Promise.all([
      this.feedbackRepository.findByUserId(userId),
      this.resourceRepository.findCompletedByUser(userId),
    ]);

    const totalByType = history.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});

    const ratedWorkouts = completedWorkouts.filter((workout) => workout.rating !== null && workout.rating !== undefined);
    const averageRating =
      ratedWorkouts.length === 0
        ? null
        : ratedWorkouts.reduce((sum, workout) => sum + Number(workout.rating || 0), 0) / ratedWorkouts.length;

    return {
      totalEvents: history.length,
      totalByType,
      totalCompletedWorkouts: completedWorkouts.length,
      averageRating,
    };
  }
}
