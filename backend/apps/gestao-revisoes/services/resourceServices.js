import { BaseService } from "../../../core/baseService.js";

export class ResourceService extends BaseService {
  constructor(resourceRepository, getResponse) {
    super(resourceRepository, "Recurso");
    this.resourceRepository = resourceRepository;
    this.getResponse = getResponse;
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
    const resources = await this.repository.findByUserId(userId);

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

    try {
      const response = await this.getResponse(prompt);
      const match = response.match(/\[[\s\S]*\]/);
      const ordered = JSON.parse(match[0]);
      const order = new Map(ordered.map((item, index) => [item._id?.toString(), index]));

      return resources
        .slice()
        .sort((a, b) => (order.get(a._id.toString()) ?? 9999) - (order.get(b._id.toString()) ?? 9999));
    } catch (_) {
      return resources;
    }
  }
}
