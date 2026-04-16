
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
      if (duration === undefined) {
        return res.status(400).json({ message: "Duração é obrigatória" });
      }

      const parsedDuration = Number(duration);
      if (Number.isNaN(parsedDuration)) {
        return res.status(400).json({
          message: "Duração inválida",
        });
      }

      await this.reviewService.createReviewSchedule({
        userId,
        subject,
        topic,
        date,
        time,
        duration: parsedDuration,
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
}