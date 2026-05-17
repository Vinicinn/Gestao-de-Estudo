// Controller para endpoints de revisões
export class ReviewController {
  constructor(reviewService) {
    this.reviewService = reviewService;
  }

  async getAllReviews(req, res) {
    res.json(await this.reviewService.getAllReviews());
  }

  async getReviewsByDate(req, res) {
    // validacao de entrada
    try {
      const { date } = req.params;
      if (!date) {
        return res.status(400).json({ message: "Data é obrigatória" });
      }
      res.json(await this.reviewService.getReviewsByDate(date));
    } catch (error) {
      res.status(500).json({
        message: "Error ao buscar revisões por data",
        error: error.message,
      });
    }
  }

  async createReviewSchedule(req, res) {
    // validacao de entrada
    try {
      const { userId, subject, topic, date, time, duration } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "ID do usuário é obrigatório" });
      }
      if (!subject) {
        return res.status(400).json({ message: "Matéria é obrigatória" });
      }
      if (!topic) {
        return res.status(400).json({ message: "Assunto é obrigatório" });
      }
      if (!date) {
        return res.status(400).json({ message: "Data do agendamento é obrigatória" });
      }
      if (!time) {
        return res.status(400).json({ message: "Horário é obrigatório" });
      }

      await this.reviewService.createReviewSchedule({
        userId,
        subject,
        topic,
        date,
        time,
      });

      res.status(201).json({ message: "Agendamento criado como revisão" });
    } catch (error) {
      res.status(500).json({
        message: "Error ao criar agendamento",
        error: error.message,
      });
    }
  }

  async getUserSchedules(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "ID do usuário é obrigatório" });
      }
      res.json(await this.reviewService.getUserSchedules(id));
    } catch (error) {
      res.status(500).json({
        message: "Erro ao buscar agendamentos do usuário",
        error: error.message,
      });
    }
  }

  async completeReview(req, res) {
    try {
      const { userId, contentId, reviewDate } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "ID do usuário é obrigatório" });
      }
      if (!contentId) {
        return res.status(400).json({ message: "ID do conteúdo é obrigatório" });
      }
      if (!reviewDate) {
        return res.status(400).json({ message: "Data da revisão é obrigatória" });
      }

      const result = await this.reviewService.completeReview(userId, contentId, reviewDate);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        message: "Erro ao registrar revisão completa",
        error: error.message,
      });
    }
  }

  async getReviewHistory(req, res) {
    try {
      const { contentId } = req.params;

      if (!contentId) {
        return res.status(400).json({ message: "ID do conteúdo é obrigatório" });
      }

      const history = await this.reviewService.getReviewHistory(contentId);
      res.json(history);
    } catch (error) {
      res.status(500).json({
        message: "Erro ao buscar histórico de revisões",
        error: error.message,
      });
    }
  }

  async getUserReviewHistory(req, res) {
    try {
      const { userId } = req.params;
      const { contentId } = req.query;

      if (!userId) {
        return res.status(400).json({ message: "ID do usuário é obrigatório" });
      }

      const history = await this.reviewService.getUserReviewHistory(userId, contentId);
      res.json(history);
    } catch (error) {
      res.status(500).json({
        message: "Erro ao buscar histórico de revisões do usuário",
        error: error.message,
      });
    }
  }

  async deleteAllReviews(req, res) {
    try {
      await this.reviewService.deleteAllReviews();
      res.status(200).json({ message: "Revisões removidas com sucesso!" });
    } catch (error) {
      res.status(500).json({
        message: "Falha ao remover todos as revisões",
        error: error.message,
      });
    }
  }

  async deleteReviewSchedule(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "ID do agendamento é obrigatório" });
      }
      await this.reviewService.deleteReviewSchedule(id);
      res.status(200).json({ message: "Agendamento removido com sucesso!" });
    } catch (error) {
      res.status(500).json({
        message: "Falha ao remover agendamento",
        error: error.message,
      });
    }
  }

  async uncompleteReview(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "ID da revisão é obrigatório" });
      }
      const result = await this.reviewService.uncompleteReview(id);
      res.json({ message: "Conclusão desfeita com sucesso", review: result });
    } catch (error) {
      res.status(500).json({
        message: "Erro ao desfazer revisão",
        error: error.message,
      });
    }
  }

  async completeSchedule(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "ID do agendamento é obrigatório" });
      }
      const result = await this.reviewService.completeSchedule(id);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        message: "Erro ao concluir agendamento",
        error: error.message,
      });
    }
  }

  async uncompleteSchedule(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "ID do agendamento é obrigatório" });
      }
      const result = await this.reviewService.uncompleteSchedule(id);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        message: "Erro ao desfazer conclusão do agendamento",
        error: error.message,
      });
    }
  }

  async skipSchedule(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: "ID do agendamento é obrigatório" });
      }
      const result = await this.reviewService.skipSchedule(id);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        message: "Erro ao marcar agendamento como não realizado",
        error: error.message,
      });
    }
  }
}
