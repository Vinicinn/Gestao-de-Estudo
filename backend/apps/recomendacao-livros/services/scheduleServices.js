import { BaseService } from "../../../core/baseService.js";

export class ScheduleService extends BaseService {
  constructor(scheduleRepository, feedbackRepository) {
    super(scheduleRepository, "Preferencia de leitura");
    this.scheduleRepository = scheduleRepository;
    this.feedbackRepository = feedbackRepository;
  }

  normalizeList(value) {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  normalizeGoals(value) {
    const goals = typeof value === "object" && value !== null ? value : {};
    return {
      booksPerMonth: Number(goals.booksPerMonth || 0),
      booksPerYear: Number(goals.booksPerYear || 0),
      priorityGenres: this.normalizeList(goals.priorityGenres),
      notes: goals.notes?.trim() || "",
    };
  }

  normalizePayload(payload) {
    return {
      favoriteGenres: this.normalizeList(payload.favoriteGenres),
      favoriteAuthors: this.normalizeList(payload.favoriteAuthors),
      interestThemes: this.normalizeList(payload.interestThemes),
      alreadyReadBooks: this.normalizeList(payload.alreadyReadBooks),
      readingGoals: this.normalizeGoals(payload.readingGoals),
      updatedAt: new Date().toISOString(),
    };
  }

  async registerHistory(userId, payload) {
    await this.feedbackRepository.create({
      userId,
      type: "reading_preferences_updated",
      ...payload,
      createdAt: new Date().toISOString(),
    });
  }

  async getUserSchedules(userId) {
    this.validateUserId(userId);

    const preferences = await this.scheduleRepository.findOneByUserId(userId);
    if (!preferences) {
      return {
        favoriteGenres: [],
        favoriteAuthors: [],
        interestThemes: [],
        alreadyReadBooks: [],
        readingGoals: {
          booksPerMonth: 0,
          booksPerYear: 0,
          priorityGenres: [],
          notes: "",
        },
      };
    }

    return preferences;
  }

  async updateSchedule(userId, payload) {
    this.validateUserId(userId);
    const data = this.normalizePayload(payload || {});

    await this.scheduleRepository.upsertByUserId(userId, {
      userId,
      ...data,
    });

    await this.registerHistory(userId, {
      favoriteGenres: data.favoriteGenres,
      favoriteAuthors: data.favoriteAuthors,
      interestThemes: data.interestThemes,
    });

    return { message: "Preferencias de leitura atualizadas com sucesso" };
  }
}