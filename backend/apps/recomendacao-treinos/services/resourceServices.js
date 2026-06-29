import { BaseService } from "../../../core/baseService.js";
import { getAiRecommendations, registerRecommendationEvent } from "../../../core/recommendation/recommendationUtils.js";

export class ResourceService extends BaseService {
  constructor(resourceRepository, scheduleRepository, feedbackRepository, getResponse) {
    super(resourceRepository, "Treino");
    this.resourceRepository = resourceRepository;
    this.scheduleRepository = scheduleRepository;
    this.feedbackRepository = feedbackRepository;
    this.getResponse = getResponse;
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

  validateRating(rating) {
    if (rating === null || rating === undefined || rating === "") {
      return null;
    }

    const parsed = Number(rating);
    if (Number.isNaN(parsed) || parsed < 1 || parsed > 5) {
      throw new Error("Nota deve ser um numero entre 1 e 5");
    }

    return parsed;
  }

  normalizeExercises(value) {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((exercise) => ({
        name: exercise.name?.trim() || "",
        sets: this.normalizeNumber(exercise.sets),
        reps: exercise.reps?.toString().trim() || "",
        restSeconds: this.normalizeNumber(exercise.restSeconds),
        notes: exercise.notes?.trim() || "",
      }))
      .filter((exercise) => exercise.name);
  }

  normalizePayload(payload) {
    const name = payload.name?.trim();
    const goal = payload.goal?.trim();
    const muscleGroups = this.normalizeList(payload.muscleGroups);
    const equipment = this.normalizeList(payload.equipment);
    const exercises = this.normalizeExercises(payload.exercises);

    if (!name || name.length < 2) {
      throw new Error("Nome do treino invalido");
    }
    if (!goal || goal.length < 2) {
      throw new Error("Objetivo do treino invalido");
    }
    if (muscleGroups.length === 0) {
      throw new Error("Informe ao menos um grupo muscular");
    }

    return {
      name,
      goal,
      muscleGroups,
      equipment,
      exercises,
      durationMinutes: this.normalizeNumber(payload.durationMinutes),
      intensity: payload.intensity || "moderate",
      difficulty: payload.difficulty || "intermediate",
      source: payload.source || "manual",
      status: payload.status || "planned",
      favorite: Boolean(payload.favorite),
      rating: this.validateRating(payload.rating),
      comment: payload.comment?.trim() || "",
      metadata: payload.metadata || {},
    };
  }

  prepareUpdate(currentWorkout, payload) {
    return {
      ...currentWorkout,
      ...payload,
      name: payload.name?.trim() || currentWorkout.name,
      goal: payload.goal?.trim() || currentWorkout.goal,
      muscleGroups: payload.muscleGroups ? this.normalizeList(payload.muscleGroups) : currentWorkout.muscleGroups,
      equipment: payload.equipment ? this.normalizeList(payload.equipment) : currentWorkout.equipment,
      exercises: payload.exercises ? this.normalizeExercises(payload.exercises) : currentWorkout.exercises,
      durationMinutes: payload.durationMinutes !== undefined
        ? this.normalizeNumber(payload.durationMinutes)
        : currentWorkout.durationMinutes,
      rating: payload.rating !== undefined ? this.validateRating(payload.rating) : currentWorkout.rating,
      comment: payload.comment?.trim() ?? currentWorkout.comment,
      metadata: {
        ...(currentWorkout.metadata || {}),
        ...(payload.metadata || {}),
      },
    };
  }

  async registerHistory(userId, type, payload = {}) {
    await this.feedbackRepository.create({
      userId,
      type,
      ...payload,
      createdAt: new Date().toISOString(),
    });
  }

  async beforeCreate(userId, data) {
    data.createdAt = new Date().toISOString();
    data.updatedAt = new Date().toISOString();

    await this.registerHistory(userId, "workout_added", {
      name: data.name,
      goal: data.goal,
      source: data.source,
    });
  }

  async beforeUpdate(id, userId, data) {
    data.updatedAt = new Date().toISOString();

    await this.registerHistory(userId, "workout_updated", {
      workoutId: id,
      name: data.name,
    });
  }

  async beforeDelete(id, userId, item) {
    await this.registerHistory(userId, "workout_deleted", {
      workoutId: id,
      name: item.name,
    });
  }

  async getUserResources(userId) {
    return await this.getAll(userId);
  }

  async getResourceById(id, userId) {
    return await this.getById(id, userId);
  }

  async createResource(userId, payload) {
    return await this.create(userId, payload);
  }

  async updateResource(id, userId, payload) {
    return await this.update(id, userId, payload);
  }

  async deleteResource(id, userId) {
    return await this.delete(id, userId);
  }

  async completeWorkout(id, userId, payload = {}) {
    const workout = await this.getOwnedById(id, userId);
    const rating = this.validateRating(payload.rating);
    const comment = payload.comment?.trim() || "";

    await this.repository.update(id, {
      ...workout,
      status: "completed",
      rating,
      comment,
      perceivedEffort: payload.perceivedEffort || null,
      completedAt: payload.completedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await this.registerHistory(userId, "workout_completed", {
      workoutId: id,
      name: workout.name,
      rating,
      perceivedEffort: payload.perceivedEffort || null,
      comment,
    });

    return { message: "Treino marcado como realizado com sucesso" };
  }

  async skipWorkout(id, userId, payload = {}) {
    const workout = await this.getOwnedById(id, userId);
    const reason = payload.reason?.trim() || "";

    await this.repository.update(id, {
      ...workout,
      status: "skipped",
      skipReason: reason,
      skippedAt: payload.skippedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await this.registerHistory(userId, "workout_skipped", {
      workoutId: id,
      name: workout.name,
      reason,
    });

    return { message: "Treino marcado como nao realizado" };
  }

  async setFavorite(id, userId, favorite) {
    const workout = await this.getOwnedById(id, userId);
    const isFavorite = Boolean(favorite);

    await this.repository.update(id, {
      ...workout,
      favorite: isFavorite,
      updatedAt: new Date().toISOString(),
    });

    await this.registerHistory(userId, isFavorite ? "workout_favorited" : "workout_unfavorited", {
      workoutId: id,
      name: workout.name,
    });

    return { message: isFavorite ? "Treino favoritado com sucesso" : "Treino removido dos favoritos" };
  }

  async addReview(id, userId, payload = {}) {
    const workout = await this.getOwnedById(id, userId);
    const rating = this.validateRating(payload.rating);
    const comment = payload.comment?.trim() || "";

    await this.repository.update(id, {
      ...workout,
      rating,
      comment,
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await this.registerHistory(userId, "workout_reviewed", {
      workoutId: id,
      name: workout.name,
      rating,
      comment,
    });

    return { message: "Avaliacao do treino registrada com sucesso" };
  }

  async getPlannedWorkouts(userId) {
    this.validateUserId(userId);
    return await this.resourceRepository.findByUserAndStatus(userId, "planned");
  }

  async getCompletedWorkouts(userId) {
    this.validateUserId(userId);
    return await this.resourceRepository.findCompletedByUser(userId);
  }

  async getFavorites(userId) {
    this.validateUserId(userId);
    return await this.resourceRepository.findFavoritesByUser(userId);
  }

  buildFallbackRecommendations(workouts, profile) {
    const goals = new Set(profile.goals || []);
    const preferredMuscleGroups = new Set(profile.preferredMuscleGroups || []);
    const availableEquipment = new Set(profile.availableEquipment || []);

    return workouts
      .filter((workout) => workout.status !== "completed" && workout.status !== "skipped")
      .map((workout) => {
        let score = 0;
        if (goals.has(workout.goal)) score += 4;
        score += (workout.muscleGroups || []).filter((group) => preferredMuscleGroups.has(group)).length * 3;
        score += (workout.equipment || []).filter((item) => availableEquipment.has(item)).length * 2;
        if (workout.favorite) score += 1;
        if ((workout.rating || 0) >= 4) score += 1;
        return { ...workout, _score: score, reason: "recomendacao por afinidade com perfil de treino" };
      })
      .sort((a, b) => b._score - a._score)
      .map(({ _score, ...workout }) => workout);
  }

  async upsertAiRecommendation(userId, recommendation) {
    const name = recommendation.name?.trim();

    if (!name) {
      return null;
    }

    const existing = await this.resourceRepository.findByUserAndName(userId, name);
    const normalizedMuscleGroups = this.normalizeList(recommendation.muscleGroups);
    const normalizedEquipment = this.normalizeList(recommendation.equipment);
    const normalizedExercises = this.normalizeExercises(recommendation.exercises);

    if (existing) {
      await this.repository.update(existing._id.toString(), {
        ...existing,
        muscleGroups: normalizedMuscleGroups.length > 0 ? normalizedMuscleGroups : existing.muscleGroups || [],
        equipment: normalizedEquipment.length > 0 ? normalizedEquipment : existing.equipment || [],
        exercises: normalizedExercises.length > 0 ? normalizedExercises : existing.exercises || [],
        source: existing.source || "ai",
        metadata: {
          ...(existing.metadata || {}),
          aiReason: recommendation.reason || "recomendado por IA",
        },
        updatedAt: new Date().toISOString(),
      });

      return {
        ...existing,
        reason: recommendation.reason || "recomendado por IA",
      };
    }

    const created = {
      name,
      goal: recommendation.goal?.trim() || "condicionamento",
      muscleGroups: normalizedMuscleGroups.length > 0 ? normalizedMuscleGroups : ["geral"],
      equipment: normalizedEquipment,
      exercises: normalizedExercises,
      durationMinutes: this.normalizeNumber(recommendation.durationMinutes, 30),
      intensity: recommendation.intensity || "moderate",
      difficulty: recommendation.difficulty || "intermediate",
      source: "ai",
      status: "planned",
      favorite: false,
      rating: null,
      comment: "",
      metadata: {
        aiReason: recommendation.reason || "recomendado por IA",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await this.repository.create({ userId, ...created });
    return {
      _id: result.insertedId,
      ...created,
      reason: recommendation.reason || "recomendado por IA",
    };
  }

  async getRecommendations(userId) {
    this.validateUserId(userId);

    const [workouts, profile] = await Promise.all([
      this.repository.findByUserId(userId),
      this.scheduleRepository.findOneByUserId(userId),
    ]);

    const positiveWorkouts = workouts.filter((workout) => workout.status === "completed" && (workout.rating || 0) >= 4);
    const negativeWorkouts = workouts.filter((workout) => workout.status === "skipped" || (workout.rating || 0) <= 2);

    const prompt = `
    Voce e um motor de recomendacao inteligente de treinos.
    Gere treinos personalizados considerando objetivos, disponibilidade, equipamentos e historico.
    Evite treinos parecidos com experiencias negativas ou ignoradas.
    Retorne apenas JSON valido com uma lista no formato:
    [
      {
        "name": "...",
        "goal": "...",
        "muscleGroups": ["..."],
        "equipment": ["..."],
        "exercises": [
          { "name": "...", "sets": 3, "reps": "10", "restSeconds": 60, "notes": "..." }
        ],
        "durationMinutes": 45,
        "intensity": "light|moderate|high",
        "difficulty": "beginner|intermediate|advanced",
        "reason": "..."
      }
    ]

    Perfil e preferencias do usuario:
    ${JSON.stringify(profile || {}, null, 2)}

    Historico positivo:
    ${JSON.stringify(positiveWorkouts, null, 2)}

    Historico negativo:
    ${JSON.stringify(negativeWorkouts, null, 2)}

    Treinos atuais:
    ${JSON.stringify(workouts, null, 2)}
    `;

    const result = await getAiRecommendations({
      getResponse: this.getResponse,
      prompt,
      fallback: () => this.buildFallbackRecommendations(workouts, profile || {}),
      mapItem: (recommendation) => this.upsertAiRecommendation(userId, recommendation),
    });

    const recommendations = result.recommendations;

    await registerRecommendationEvent({
      registerHistory: this.registerHistory.bind(this),
      userId,
      type: "ai_workout_recommendation_generated",
      recommendations,
      payload: { source: result.source },
    });

    return recommendations;
  }
}
