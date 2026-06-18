export class FeedbackController {
  constructor(feedbackService) {
    this.feedbackService = feedbackService;
  }

  async createFeedback(req, res) {
    try {
      const result = await this.feedbackService.createFeedback(req.user.id, req.body);
      res.status(201).json({ message: "Feedback criado com sucesso", id: result.insertedId });
    } catch (error) {
      res.status(400).json({ message: "Erro ao criar feedback", error: error.message });
    }
  }

  async getUserFeedbacks(req, res) {
    try {
      res.json(await this.feedbackService.getUserFeedbacks(req.user.id));
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar feedbacks", error: error.message });
    }
  }

  async deleteFeedback(req, res) {
    try {
      res.json(await this.feedbackService.deleteFeedback(req.params.id, req.user.id));
    } catch (error) {
      res.status(400).json({ message: "Erro ao remover feedback", error: error.message });
    }
  }
}
