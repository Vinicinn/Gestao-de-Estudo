// Service para lógica de negócio de revisões
import { ObjectId } from "mongodb";

export class ReviewService {
  constructor(reviewRepository) {
    this.reviewRepository = reviewRepository;
  }

  async getAllReviews() {
    return await this.reviewRepository.findAll();
  }

  async getReviewsByDate(date) {
    // validacao de negocio
    date = date?.trim();
    if (!date || Number.isNaN(Date.parse(date))) {
      throw new Error("Data inválida");
    }

    return await this.reviewRepository.findByDate(date);
  }

  async createReviewSchedule({ userId, subject, topic, date, time }) {
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

    const review = {
      userId,
      subject,
      topic,
      reviewDate: date,
      time,
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
    return allReviews.filter((review) => review.type === "schedule");
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

    // impedir duplicata na mesma data
    const existing = await this.reviewRepository.findOneByQuery({
      userId,
      contentId: new ObjectId(contentId),
      reviewDate,
      type: "completed_review",
    });

    if (existing) {
      throw new Error("Revisão já foi concluída nesta data");
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

  async uncompleteReview(reviewId) {
    if (!ObjectId.isValid(reviewId)) {
      throw new Error("ID inválido");
    }

    const review = await this.reviewRepository.findOneByQuery({
      _id: new ObjectId(reviewId),
      type: "completed_review",
    });

    if (!review) {
      throw new Error("Revisão concluída não encontrada");
    }

    await this.reviewRepository.deleteById(reviewId);

    return review;
  }

  async completeSchedule(scheduleId) {
    if (!ObjectId.isValid(scheduleId)) {
      throw new Error("ID inválido");
    }

    const schedule = await this.reviewRepository.findScheduleById(scheduleId);
    if (!schedule) {
      throw new Error("Agendamento não encontrado");
    }
    if (schedule.completed) {
      throw new Error("Agendamento já está concluído");
    }

    await this.reviewRepository.updateSchedule(scheduleId, {
      completed: true,
      completedAt: new Date().toISOString(),
    });

    return { message: "Agendamento marcado como concluído" };
  }

  async uncompleteSchedule(scheduleId) {
    if (!ObjectId.isValid(scheduleId)) {
      throw new Error("ID inválido");
    }

    const schedule = await this.reviewRepository.findScheduleById(scheduleId);
    if (!schedule) {
      throw new Error("Agendamento não encontrado");
    }
    if (!schedule.completed) {
      throw new Error("Agendamento não está concluído");
    }

    await this.reviewRepository.updateSchedule(scheduleId, {
      completed: false,
      completedAt: null,
    });

    return { message: "Conclusão desfeita com sucesso" };
  }

  async skipSchedule(scheduleId) {
    if (!ObjectId.isValid(scheduleId)) {
      throw new Error("ID inválido");
    }

    const schedule = await this.reviewRepository.findScheduleById(scheduleId);
    if (!schedule) {
      throw new Error("Agendamento não encontrado");
    }

    await this.reviewRepository.updateSchedule(scheduleId, {
      skipped: true,
      skippedAt: new Date().toISOString(),
    });

    return { message: "Agendamento marcado como não realizado" };
  }

  async deleteAllReviews() {
    await this.reviewRepository.deleteAll();
  }

  async deleteReviewSchedule(scheduleId) {
    if (!ObjectId.isValid(scheduleId)) {
      throw new Error("ID inválido");
    }

    const result = await this.reviewRepository.deleteSchedule(scheduleId);
    if (result.acknowledged != true) {
      return {
        message: "Falha ao remover o conteudo",
      };
    }
    return { message: "Conteudo removido com sucesso" };
  }
}
