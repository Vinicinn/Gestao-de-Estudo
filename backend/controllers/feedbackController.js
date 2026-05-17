export class FeedbackController {
  constructor(feedbackService) {
    this.feedbackService = feedbackService;
  }

  async createReviewFeedback(req, res) {
    try {
      const {
        userId,
        contentId,
        reviewDate,
        understandingScore,
        perceivedDifficulty,
        note,
      } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "ID do usuário é obrigatório" });
      }
      if (!contentId) {
        return res.status(400).json({ message: "ID do conteúdo é obrigatório" });
      }

      const result = await this.feedbackService.createReviewFeedback({
        userId,
        contentId,
        reviewDate,
        understandingScore,
        perceivedDifficulty,
        note,
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        message: "Erro ao registrar feedback de revisão",
        error: error.message,
      });
    }
  }

  async getUserReviewFeedback(req, res) {
    try {
      const { userId } = req.params;
      const { subject, from, to } = req.query;

      if (!userId) {
        return res.status(400).json({ message: "ID do usuário é obrigatório" });
      }

      const result = await this.feedbackService.getUserReviewFeedback(
        userId,
        subject,
        from,
        to,
      );

      res.json(result);
    } catch (error) {
      res.status(500).json({
        message: "Erro ao buscar feedbacks de revisão",
        error: error.message,
      });
    }
  }

  async createScheduleFeedback(req, res) {
    try {
      const { userId, scheduleId, subject, topic, understandingScore, perceivedDifficulty, note } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "ID do usuário é obrigatório" });
      }
      if (!scheduleId) {
        return res.status(400).json({ message: "ID do agendamento é obrigatório" });
      }

      const result = await this.feedbackService.createScheduleFeedback({
        userId, scheduleId, subject, topic,
        understandingScore, perceivedDifficulty, note,
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        message: "Erro ao registrar feedback do agendamento",
        error: error.message,
      });
    }
  }

  async deleteReviewFeedback(req, res) {
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

      const result = await this.feedbackService.deleteReviewFeedback(userId, contentId, reviewDate);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        message: "Erro ao remover feedback de revisão",
        error: error.message,
      });
    }
  }

  async deleteScheduleFeedback(req, res) {
    try {
      const { scheduleId } = req.params;

      if (!scheduleId) {
        return res.status(400).json({ message: "ID do agendamento é obrigatório" });
      }

      const result = await this.feedbackService.deleteScheduleFeedback(scheduleId);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        message: "Erro ao remover feedback do agendamento",
        error: error.message,
      });
    }
  }

  async createSkippedReview(req, res) {
    try {
      const { userId, contentId, reviewDate } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "ID do usuário é obrigatório" });
      }
      if (!contentId) {
        return res.status(400).json({ message: "ID do conteúdo é obrigatório" });
      }

      const result = await this.feedbackService.createSkippedReview({ userId, contentId, reviewDate });
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        message: "Erro ao registrar revisão não realizada",
        error: error.message,
      });
    }
  }

  async getSkippedReviewsByUser(req, res) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ message: "ID do usuário é obrigatório" });
      }

      const result = await this.feedbackService.getSkippedReviewsByUser(userId);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        message: "Erro ao buscar revisões não realizadas",
        error: error.message,
      });
    }
  }
}
