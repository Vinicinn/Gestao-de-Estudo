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

  async createReviewSchedule({ userId, subject, topic, date, time, duration }) {
    // validacao de negocio
    subject = subject?.trim();
    topic = topic?.trim();
    date = date?.trim();
    time = time?.trim();

    if (!userId) {
      throw new Error("ID do usuário é obrigatório");
    }
    if (!subject) {
      throw new Error("Matéria inválida");
    }
    if (!topic) {
      throw new Error("Assunto inválido");
    }
    if (!date || Number.isNaN(Date.parse(date))) {
      throw new Error("Data do agendamento inválida");
    }
    if (!time) {
      throw new Error("Horário inválido");
    }
    if (typeof duration !== "number" || duration <= 0) {
      throw new Error("Duração inválida");
    }

    const review = {
      userId,
      subject,
      topic,
      reviewDate: date,
      time,
      duration,
      type: "schedule",
    };

    await this.reviewRepository.createReview(review);
  }

  async getUserSchedules(userId) {
    if (!userId) {
      throw new Error("ID do usuário é obrigatório");
    }
    return await this.reviewRepository.findSchedulesByUserId(userId);
  }

  async getSchedulesByDate(date) {
    // validacao de negocio
    date = date?.trim();
    if (!date || Number.isNaN(Date.parse(date))) {
      throw new Error("Data inválida");
    }

    const allReviews = await this.reviewRepository.findByDate(date);
    return allReviews.filter(review => review.type === "schedule");
  }
}