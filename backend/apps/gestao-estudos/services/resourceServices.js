import { BaseService } from "../../../core/baseService.js";
import { getAiRecommendations, sortByRecommendationOrder } from "../../../core/recommendation/recommendationUtils.js";

export class ResourceService extends BaseService {
  constructor(resourceRepository, getResponse, feedbackRepository = null) {
    super(resourceRepository, "Recurso");
    this.resourceRepository = resourceRepository;
    this.getResponse = getResponse;
    this.feedbackRepository = feedbackRepository;
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

  getInitialReviewResources(resources) {
    return resources
      .filter((resource) => !resource.schedule?.lastReview && !resource.schedule?.manualDates?.length)
      .sort((a, b) => a._id.toString().localeCompare(b._id.toString()));
  }

  getOccupiedReviewDates(resources, initialResources) {
    const initialIds = new Set(initialResources.map((resource) => resource._id.toString()));

    return new Set(
      resources
        .filter((resource) => !initialIds.has(resource._id.toString()))
        .map((resource) => resource.schedule?.nextDate)
        .filter(Boolean),
    );
  }

  findNextFreeReviewDate(startDate, occupiedDates, startOffset = 0) {
    let offset = startOffset;

    while (true) {
      const date = this.addDays(startDate, offset);
      if (!occupiedDates.has(date)) {
        occupiedDates.add(date);
        return date;
      }
      offset += 1;
    }
  }

  async hasFeedbackToday(userId, today) {
    if (!this.feedbackRepository) {
      return false;
    }

    const feedbacks = await this.feedbackRepository.findByUserId(userId);
    return feedbacks.some((feedback) => {
      const feedbackDate = feedback.reviewDate || feedback.metadata?.reviewDate;
      return feedback.resourceId && feedbackDate === today;
    });
  }

  async getInitialReviewStartOffset(userId, resources, today) {
    const reviewedToday = resources.some((resource) => resource.schedule?.lastReview === today);
    const feedbackToday = await this.hasFeedbackToday(userId, today);
    return reviewedToday || feedbackToday ? 1 : 0;
  }

  async getNextInitialReviewDate(userId) {
    const resources = await this.repository.findByUserId(userId);
    const initialResources = this.getInitialReviewResources(resources);
    const occupiedDates = this.getOccupiedReviewDates(resources, initialResources);
    const today = this.getLocalIsoDate();
    const startOffset = await this.getInitialReviewStartOffset(userId, resources, today);

    if (startOffset > 0) {
      occupiedDates.add(today);
    }

    for (const resource of initialResources) {
      this.findNextFreeReviewDate(today, occupiedDates, startOffset);
    }

    return this.findNextFreeReviewDate(today, occupiedDates, startOffset);
  }

  async rebalanceInitialReviewDates(userId, resources = null) {
    const userResources = resources || await this.repository.findByUserId(userId);
    const initialResources = this.getInitialReviewResources(userResources);
    const occupiedDates = this.getOccupiedReviewDates(userResources, initialResources);
    const today = this.getLocalIsoDate();
    const startOffset = await this.getInitialReviewStartOffset(userId, userResources, today);

    if (startOffset > 0) {
      occupiedDates.add(today);
    }

    for (const resource of initialResources) {
      const nextDate = this.findNextFreeReviewDate(today, occupiedDates, startOffset);

      if (resource.schedule?.nextDate === nextDate && resource.schedule?.initialReviewDate === nextDate) {
        continue;
      }

      await this.repository.update(resource._id.toString(), {
        schedule: {
          ...(resource.schedule || {}),
          nextDate,
          initialReviewDate: nextDate,
        },
      });

      resource.schedule = {
        ...(resource.schedule || {}),
        nextDate,
        initialReviewDate: nextDate,
      };
    }

    return userResources;
  }

  normalizePayload(payload) {
    const name = payload.name?.trim();
    const type = payload.type?.trim();

    if (!name || name.length < 2) {
      throw new Error("Nome do recurso invalido");
    }
    if (!type || type.length < 2) {
      throw new Error("Tipo do recurso invalido");
    }

    return {
      name,
      type,
      description: payload.description?.trim() || "",
      attributes: payload.attributes || {},
      recommendationCriteria: payload.recommendationCriteria || {},
      schedule: payload.schedule || {},
    };
  }

  prepareUpdate(currentResource, payload) {
    return {
      ...currentResource,
      ...payload,
      attributes: {
        ...(currentResource.attributes || {}),
        ...(payload.attributes || {}),
      },
      recommendationCriteria: {
        ...(currentResource.recommendationCriteria || {}),
        ...(payload.recommendationCriteria || {}),
      },
      schedule: {
        ...(currentResource.schedule || {}),
        ...(payload.schedule || {}),
      },
    };
  }

  async beforeCreate(userId, resource) {
    if (resource.schedule?.nextDate) {
      return;
    }

    const nextDate = await this.getNextInitialReviewDate(userId);
    resource.schedule = {
      ...(resource.schedule || {}),
      nextDate,
      initialReviewDate: nextDate,
    };
  }

  async getUserResources(userId) {
    const resources = await this.getAll(userId);
    return await this.rebalanceInitialReviewDates(userId, resources);
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

  async setManualSchedule(id, userId, dates) {
    await this.getOwnedById(id, userId);

    if (!Array.isArray(dates) || dates.length === 0) {
      throw new Error("Informe ao menos uma data");
    }

    for (const date of dates) {
      if (typeof date !== "string" || Number.isNaN(Date.parse(date))) {
        throw new Error(`Data invalida: ${date}`);
      }
    }

    const sortedDates = dates.slice().sort();
    await this.repository.update(id, {
      schedule: {
        manualDates: sortedDates,
        nextDate: sortedDates[0],
      },
    });

    return {
      message: "Agendamento manual atualizado com sucesso",
      dates: sortedDates,
      nextDate: sortedDates[0],
    };
  }

  async getRecommendations(userId) {
    this.validateUserId(userId);
    const resources = await this.rebalanceInitialReviewDates(userId);

    if (resources.length === 0) {
      return [];
    }

    const prompt = `
    Voce e um motor generico de recomendacao de atividades.

    Ordene os recursos por prioridade para a proxima atividade.
    Use type, attributes, recommendationCriteria e schedule.
    Nao assuma dominio especifico de aplicacao.

    Retorne apenas JSON valido neste formato:
    [
      { "_id": "..." }
    ]

    Recursos:
    ${JSON.stringify(resources, null, 2)}
    `;

    const { recommendations: ordered } = await getAiRecommendations({
      getResponse: this.getResponse,
      prompt,
      fallback: () => [],
    });

    if (ordered.length === 0) {
      return resources;
    }

    return sortByRecommendationOrder(resources, ordered);
  }
}
