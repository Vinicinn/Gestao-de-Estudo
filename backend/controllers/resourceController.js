export class ResourceController {
  constructor(resourceService) {
    this.resourceService = resourceService;
  }

  async getUserResources(req, res) {
    try {
      res.json(await this.resourceService.getUserResources(req.user.id));
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar recursos", error: error.message });
    }
  }

  async getResourceById(req, res) {
    try {
      res.json(await this.resourceService.getResourceById(req.params.id, req.user.id));
    } catch (error) {
      res.status(404).json({ message: "Erro ao buscar recurso", error: error.message });
    }
  }

  async createResource(req, res) {
    try {
      const result = await this.resourceService.createResource(req.user.id, req.body);
      res.status(201).json({ message: "Recurso criado com sucesso", id: result.insertedId });
    } catch (error) {
      res.status(400).json({ message: "Erro ao criar recurso", error: error.message });
    }
  }

  async updateResource(req, res) {
    try {
      res.json(await this.resourceService.updateResource(req.params.id, req.user.id, req.body));
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar recurso", error: error.message });
    }
  }

  async deleteResource(req, res) {
    try {
      res.json(await this.resourceService.deleteResource(req.params.id, req.user.id));
    } catch (error) {
      res.status(400).json({ message: "Erro ao remover recurso", error: error.message });
    }
  }

  async setManualSchedule(req, res) {
    try {
      const { dates } = req.body;
      res.json(await this.resourceService.setManualSchedule(req.params.id, req.user.id, dates));
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar agendamento", error: error.message });
    }
  }

  async getRecommendations(req, res) {
    try {
      res.json(await this.resourceService.getRecommendations(req.user.id));
    } catch (error) {
      res.status(500).json({ message: "Erro ao gerar recomendacoes", error: error.message });
    }
  }
}
