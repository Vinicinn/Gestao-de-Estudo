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
      bookId: payload.bookId || null,
      payload: payload.payload || {},
      createdAt: new Date().toISOString(),
    };
  }

  async beforeCreate(userId, data) {
    if (data.bookId) {
      const book = await this.resourceRepository.findByIdAndUserId(data.bookId, userId);
      if (!book) {
        throw new Error("Livro nao encontrado para registrar historico");
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

    const [history, ratedBooks] = await Promise.all([
      this.feedbackRepository.findByUserId(userId),
      this.resourceRepository.findRatedByUser(userId),
    ]);

    const totalByType = history.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {});

    const averageRating =
      ratedBooks.length === 0
        ? null
        : ratedBooks.reduce((sum, book) => sum + Number(book.rating || 0), 0) / ratedBooks.length;

    return {
      totalEvents: history.length,
      totalByType,
      totalRatedBooks: ratedBooks.length,
      averageRating,
    };
  }
}