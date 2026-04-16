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
      const { userId, name, subject, difficulty } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "ID do usuário é obrigatório" });
      }
      if (!name) {
        return res.status(400).json({ message: "Nome é obrigatório" });
      }
      if (!subject) {
        return res
          .status(400)
          .json({ message: "Nome da matéria é obrigatório" });
      }
      if (!difficulty) {
        return res.status(400).json({ message: "Dificuldade é obrigatória" });
      }
      return res.json(
        await this.contentService.createContent(
          userId,
          name,
          subject,
          difficulty,
        ),
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
      if (!content.subject) {
        return res
          .status(400)
          .json({ message: "Nome da matéria é obrigatório" });
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

  async getUserRecommendations(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "ID do usuário é obrigatório" });
      }
      res.json(await this.contentService.getUserRecommendations(id));
    } catch (error) {
      res.status(500).json({
        message: "Erro ao buscar recomendações",
        error: error.message,
      });
    }
  }

  async submitContentFeedback(req, res) {
    try {
      const { id } = req.params;
      const { quality } = req.body;

      if (!id) {
        return res.status(400).json({ message: "ID é obrigatório" });
      }
      if (!quality && quality !== 0) {
        return res.status(400).json({ message: "Qualidade é obrigatória" });
      }

      const updatedContent = await this.contentService.submitFeedback(id, quality);
      res.json(updatedContent);
    } catch (error) {
      res.status(500).json({
        message: "Erro ao enviar feedback",
        error: error.message,
      });
    }
  }

  async updateReviewDates(req, res) {
    try {
      const { id } = req.params;
      const { nextReviews } = req.body;

      if (!id) {
        return res.status(400).json({ message: "ID do conteúdo é obrigatório" });
      }
      if (!nextReviews) {
        return res.status(400).json({ message: "Próximas revisões são obrigatórias" });
      }

      const updatedContent = await this.contentService.updateReviewDates(id, nextReviews);
      res.json({
        message: "Datas de revisão atualizadas com sucesso",
        content: updatedContent,
      });
    } catch (error) {
      res.status(500).json({
        message: "Erro ao atualizar datas de revisão",
        error: error.message,
      });
    }
  }

  async getReviewDatesInfo(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "ID do conteúdo é obrigatório" });
      }

      const info = await this.contentService.validateReviewDates(id);
      res.json(info);
    } catch (error) {
      res.status(500).json({
        message: "Erro ao buscar informações de revisão",
        error: error.message,
      });
    }
  }
}

