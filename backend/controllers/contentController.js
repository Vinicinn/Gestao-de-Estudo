export class ContentController {
  constructor(contentService) {
    this.contentService = contentService;
  }

  async getAllContents(req, res) {
    res.json(await this.contentService.getAllContents());
  }

  async getAllUserContents(req, res) {
    // validacao de entrada
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          message: "ID do usuário é obrigatório",
        });
      }
      res.json(await this.contentService.getAllUserContents(id));
    } catch (error) {
      res.status(500).json({
        message: "Error ao buscar conteúdos do usuário",
        error: error.message,
      });
    }
  }

  async getContentById(req, res) {
    // validacao de entrada
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "ID é obrigatório" });
      }
      res.json(await this.contentService.getContentById(id));
    } catch (error) {
      res.status(500).json({
        message: "Error ao buscar conteúdo por ID",
        error: error.message,
      });
    }
  }

  async createContent(req, res) {
    // validacao de entrada
    try {
      const { userId, name, difficulty } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "ID do usuário é obrigatório" });
      }
      if (!name) {
        return res.status(400).json({ message: "Nome é obrigatório" });
      }
      if (!difficulty) {
        return res.status(400).json({ message: "Dificuldade é obrigatória" });
      }
      res.json(
        await this.contentService.createContent(userId, name, difficulty),
      );
    } catch (error) {
      res.status(500).json({
        message: "Error ao criar conteúdo",
        error: error.message,
      });
    }
  }

  async updateContent(req, res) {
    // validacao de entrada
    try {
      const { id } = req.params;
      const content = req.body;
      if (!id) {
        return res.status(400).json({ message: "ID é obrigatório" });
      }
      if (!content.name) {
        return res.status(400).json({ message: "Nome é obrigatório" });
      }
      if (!content.difficulty) {
        return res.status(400).json({ message: "Dificuldade é obrigatória" });
      }
      if (!content.userId) {
        return res.status(400).json({ message: "ID do usuário é obrigatório" });
      }
      res.json(await this.contentService.updateContent(id, content));
    } catch (error) {
      res.status(500).json({
        message: "Error ao atualizar conteúdo",
        error: error.message,
      });
    }
  }

  async deleteContent(req, res) {
    // validacao de entrada
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "ID é obrigatório" });
      }
      res.json(await this.contentService.deleteContent(id));
    } catch (error) {
      res.status(500).json({
        message: "Error ao deletar conteúdo",
        error: error.message,
      });
    }
  }
}
