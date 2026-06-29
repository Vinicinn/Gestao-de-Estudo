import { BaseController } from "../../../core/baseController.js";

export class ResourceController extends BaseController {
  constructor(resourceService) {
    super(resourceService, "Treino");
    this.resourceService = resourceService;
  }

  async getUserResources(req, res) {
    return await this.getAll(req, res);
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

  async completeWorkout(req, res) {
    return await this.handle(
      res,
      async () => this.ok(res, await this.resourceService.completeWorkout(req.params.id, req.user.id, req.body)),
      "Erro ao marcar treino como realizado",
    );
  }

  async skipWorkout(req, res) {
    return await this.handle(
      res,
      async () => this.ok(res, await this.resourceService.skipWorkout(req.params.id, req.user.id, req.body)),
      "Erro ao marcar treino como nao realizado",
    );
  }

  async setFavorite(req, res) {
    return await this.handle(
      res,
      async () => this.ok(res, await this.resourceService.setFavorite(req.params.id, req.user.id, req.body.favorite)),
      "Erro ao atualizar favorito",
    );
  }

  async addReview(req, res) {
    return await this.handle(
      res,
      async () => this.ok(res, await this.resourceService.addReview(req.params.id, req.user.id, req.body)),
      "Erro ao registrar avaliacao",
    );
  }

  async getRecommendations(req, res) {
    return await this.handle(
      res,
      async () => this.ok(res, await this.resourceService.getRecommendations(req.user.id)),
      "Erro ao gerar recomendacoes inteligentes",
      500,
    );
  }

  async getPlannedWorkouts(req, res) {
    return await this.handle(
      res,
      async () => this.ok(res, await this.resourceService.getPlannedWorkouts(req.user.id)),
      "Erro ao listar treinos planejados",
      500,
    );
  }

  async getCompletedWorkouts(req, res) {
    return await this.handle(
      res,
      async () => this.ok(res, await this.resourceService.getCompletedWorkouts(req.user.id)),
      "Erro ao listar treinos realizados",
      500,
    );
  }

  async getFavorites(req, res) {
    return await this.handle(
      res,
      async () => this.ok(res, await this.resourceService.getFavorites(req.user.id)),
      "Erro ao listar favoritos",
      500,
    );
  }
}
