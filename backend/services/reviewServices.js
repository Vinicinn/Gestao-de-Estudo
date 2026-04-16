// Service para lógica de negócio de revisões
import { ObjectId } from "mongodb";

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

  async completeReview(userId, contentId, reviewDate) {
    // validacao de negocio
    if (!userId) {
      throw new Error("ID do usuário é obrigatório");
    }
    if (!contentId) {
      throw new Error("ID do conteúdo é obrigatório");
    }
    if (!reviewDate || Number.isNaN(Date.parse(reviewDate))) {
      throw new Error("Data da revisão inválida");
    }

    // validar ObjectId
    if (!ObjectId.isValid(contentId) || !ObjectId.isValid(userId)) {
      throw new Error("IDs inválidos");
    }

    const completedAt = new Date().toISOString();

    const review = {
      userId,
      contentId: new ObjectId(contentId),
      reviewDate,
      completedAt,
      type: "completed_review",
    };

    await this.reviewRepository.createReview(review);

    return {
      message: "Revisão registrada com sucesso",
      review,
    };
  }

  async getReviewHistory(contentId) {
    // validacao de negocio
    if (!contentId) {
      throw new Error("ID do conteúdo é obrigatório");
    }

    if (!ObjectId.isValid(contentId)) {
      throw new Error("ID do conteúdo inválido");
    }

    const history = await this.reviewRepository.findCompletedReviews(new ObjectId(contentId));

    return {
      contentId,
      totalCompleted: history.length,
      reviews: history.sort((a, b) => new Date(a.reviewDate) - new Date(b.reviewDate)),
    };
  }

  async getUserReviewHistory(userId, contentId = null) {
    // validacao de negocio
    if (!userId) {
      throw new Error("ID do usuário é obrigatório");
    }

    if (!ObjectId.isValid(userId)) {
      throw new Error("ID do usuário inválido");
    }

    const query = {
      userId,
      type: "completed_review",
    };

    if (contentId) {
      if (!ObjectId.isValid(contentId)) {
        throw new Error("ID do conteúdo inválido");
      }
      query.contentId = new ObjectId(contentId);
    }

    const history = await this.reviewRepository.findByQuery(query);

    return {
      userId,
      contentId: contentId || null,
      totalReviews: history.length,
      reviews: history.sort((a, b) => new Date(a.reviewDate) - new Date(b.reviewDate)),
    };
  }
}
