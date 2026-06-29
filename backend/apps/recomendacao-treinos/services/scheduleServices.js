import { BaseService } from "../../../core/baseService.js";

export class ScheduleService extends BaseService {
  constructor(scheduleRepository, feedbackRepository) {
    super(scheduleRepository, "Perfil de treino");
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

  normalizeNumber(value, defaultValue = 0) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? defaultValue : parsed;
  }

  normalizeAvailability(value) {
    const availability = typeof value === "object" && value !== null ? value : {};
    return {
      daysPerWeek: this.normalizeNumber(availability.daysPerWeek),
      minutesPerSession: this.normalizeNumber(availability.minutesPerSession),
      preferredDays: this.normalizeList(availability.preferredDays),
      notes: availability.notes?.trim() || "",
    };
  }

  normalizePayload(payload) {
    return {
      goals: this.normalizeList(payload.goals),
      preferredMuscleGroups: this.normalizeList(payload.preferredMuscleGroups),
      availableEquipment: this.normalizeList(payload.availableEquipment),
      limitations: this.normalizeList(payload.limitations),
      fitnessLevel: payload.fitnessLevel || "beginner",
      availability: this.normalizeAvailability(payload.availability),
      notes: payload.notes?.trim() || "",
      updatedAt: new Date().toISOString(),
    };
  }

  async registerHistory(userId, payload) {
    await this.feedbackRepository.create({
      userId,
      type: "workout_profile_updated",
      ...payload,
      createdAt: new Date().toISOString(),
    });
  }

  async getUserSchedules(userId) {
    this.validateUserId(userId);

    const profile = await this.scheduleRepository.findOneByUserId(userId);
    if (!profile) {
      return {
        goals: [],
        preferredMuscleGroups: [],
        availableEquipment: [],
        limitations: [],
        fitnessLevel: "beginner",
        availability: {
          daysPerWeek: 0,
          minutesPerSession: 0,
          preferredDays: [],
          notes: "",
        },
        notes: "",
      };
    }

    return profile;
  }

  async updateSchedule(userId, payload) {
    this.validateUserId(userId);
    const data = this.normalizePayload(payload || {});

    await this.scheduleRepository.upsertByUserId(userId, {
      userId,
      ...data,
    });

    await this.registerHistory(userId, {
      goals: data.goals,
      fitnessLevel: data.fitnessLevel,
      availableEquipment: data.availableEquipment,
    });

    return { message: "Perfil de treino atualizado com sucesso" };
  }
}
