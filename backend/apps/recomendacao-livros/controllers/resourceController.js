import { BaseController } from "../../../core/baseController.js";

export class ResourceController extends BaseController {
  constructor(resourceService) {
    super(resourceService, "Livro");
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

  async markAsRead(req, res) {
    return await this.handle(
      res,
      async () => this.ok(res, await this.resourceService.markAsRead(req.params.id, req.user.id, req.body)),
      "Erro ao marcar livro como lido",
    );
  }

  async abandonReading(req, res) {
    return await this.handle(
      res,
      async () => this.ok(res, await this.resourceService.abandonReading(req.params.id, req.user.id, req.body)),
      "Erro ao abandonar leitura",
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

  async getReadingList(req, res) {
    return await this.handle(
      res,
      async () => this.ok(res, await this.resourceService.getReadingList(req.user.id)),
      "Erro ao listar fila de leitura",
      500,
    );
  }

  async getReadBooks(req, res) {
    return await this.handle(
      res,
      async () => this.ok(res, await this.resourceService.getReadBooks(req.user.id)),
      "Erro ao listar livros lidos",
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