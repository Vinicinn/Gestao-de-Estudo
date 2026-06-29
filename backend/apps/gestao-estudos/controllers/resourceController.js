import { BaseController } from "../../../core/baseController.js";

export class ResourceController extends BaseController {
  constructor(resourceService) {
    super(resourceService, "Recurso");
    this.resourceService = resourceService;
  }

  async getUserResources(req, res) {
    return await this.handle(
      res,
      async () => this.ok(res, await this.resourceService.getUserResources(req.user.id)),
      "Erro ao buscar recursos",
      500,
    );
  }

  async getResourceById(req, res) {
    return await this.getById(req, res);
  }

  async createResource(req, res) {
    return await this.create(req, res);
  }

  async updateResource(req, res) {
    return await this.update(req, res);
  }

  async deleteResource(req, res) {
    return await this.delete(req, res);
  }

  async setManualSchedule(req, res) {
    return await this.handle(
      res,
      async () => this.ok(res, await this.resourceService.setManualSchedule(req.params.id, req.user.id, req.body.dates)),
      "Erro ao atualizar agendamento",
    );
  }

  async getRecommendations(req, res) {
    return await this.handle(
      res,
      async () => this.ok(res, await this.resourceService.getRecommendations(req.user.id)),
      "Erro ao gerar recomendacoes",
      500,
    );
  }
}
