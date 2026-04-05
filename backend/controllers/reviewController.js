
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
}