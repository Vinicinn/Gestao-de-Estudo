// Service para lógica de negócio de revisões
export class ReviewService {
  constructor(reviewRepository) {
    this.reviewRepository = reviewRepository;
  }

  async getAllReviews() {
    return await this.reviewRepository.findAll();
  }

  async createReview({ studyId, subject, topic, reviewDate, interval }) {
    // validacao de negocio
    subject = subject?.trim();
    topic = topic?.trim();
    reviewDate = reviewDate?.trim();

    if (!subject) {
      throw new Error("Matéria inválida");
    }
    if (!topic) {
      throw new Error("Assunto inválido");
    }
    if (!reviewDate || Number.isNaN(Date.parse(reviewDate))) {
      throw new Error("Data da revisão inválida");
    }
    if (typeof interval !== "number" || interval <= 0) {
      throw new Error("Intervalo inválido");
    }

    const review = {
      studyId,
      subject,
      topic,
      reviewDate,
      interval,
    };

    await this.reviewRepository.createReview(review);
  }

  async getReviewsByDate(date) {
    // validacao de negocio
    date = date?.trim();
    if (!date || Number.isNaN(Date.parse(date))) {
      throw new Error("Data inválida");
    }

    return await this.reviewRepository.findByDate(date);
  }
}