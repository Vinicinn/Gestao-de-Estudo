import { ObjectId } from "mongodb";

export class ResourceService {
  constructor(resourceRepository, getResponse) {
    this.resourceRepository = resourceRepository;
    this.getResponse = getResponse;
  }

  validateUserId(userId) {
    if (!ObjectId.isValid(userId)) {
      throw new Error("ID de usuario invalido");
    }
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

  async getUserResources(userId) {
    this.validateUserId(userId);
    return await this.resourceRepository.findByUserId(userId);
  }

  async getResourceById(id, userId) {
    this.validateUserId(userId);
    if (!ObjectId.isValid(id)) {
      throw new Error("ID do recurso invalido");
    }

    const resource = await this.resourceRepository.findByIdAndUserId(id, userId);
    if (!resource) {
      throw new Error("Recurso nao encontrado");
    }

    return resource;
  }

  async createResource(userId, payload) {
    this.validateUserId(userId);
    const resource = this.normalizePayload(payload);

    return await this.resourceRepository.create({
      userId,
      ...resource,
    });
  }

  async updateResource(id, userId, payload) {
    const currentResource = await this.getResourceById(id, userId);
    const resource = this.normalizePayload({
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
    });

    await this.resourceRepository.update(id, resource);
    return { message: "Recurso atualizado com sucesso" };
  }

  async deleteResource(id, userId) {
    await this.getResourceById(id, userId);
    await this.resourceRepository.delete(id);
    return { message: "Recurso removido com sucesso" };
  }

  async setManualSchedule(id, userId, dates) {
    await this.getResourceById(id, userId);

    if (!Array.isArray(dates) || dates.length === 0) {
      throw new Error("Informe ao menos uma data");
    }

    for (const date of dates) {
      if (typeof date !== "string" || Number.isNaN(Date.parse(date))) {
        throw new Error(`Data invalida: ${date}`);
      }
    }

    const sortedDates = dates.slice().sort();
    await this.resourceRepository.update(id, {
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
    const resources = await this.resourceRepository.findByUserId(userId);

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
