import { ObjectId } from "mongodb";

export class FeedbackService {
  constructor(feedbackRepository, reviewRepository, contentRepository, contentService = null) {
    this.feedbackRepository = feedbackRepository;
    this.reviewRepository = reviewRepository;
    this.contentRepository = contentRepository;
    this.contentService = contentService;
  }

  calculateNewInterval(perceivedDifficulty, understandingScore) {
    const baseIntervalByDifficulty = {
      facil: 15,
      medio: 7,
      dificil: 3,
    };

    const score = Number(understandingScore);
    const scoreMultiplier = {
      1: 0.8,
      2: 0.9,
      3: 1,
      4: 1.15,
      5: 1.3,
    };

    const base = baseIntervalByDifficulty[perceivedDifficulty] || 7;
    const multiplier = scoreMultiplier[score] || 1;
    return Math.max(1, Math.round(base * multiplier));
  }

  calculateRetryInterval(currentStability) {
    const stability = Number(currentStability) || 1;
    return Math.max(1, Math.floor(stability / 2));
  }

  async createReviewFeedback({
    userId,
    contentId,
    reviewDate,
    understandingScore,
    perceivedDifficulty,
    note,
  }) {
    note = note?.trim() || "";
    perceivedDifficulty = perceivedDifficulty?.trim().toLowerCase();

    if (!ObjectId.isValid(userId)) {
      throw new Error("ID do usuário inválido");
    }
    if (!ObjectId.isValid(contentId)) {
      throw new Error("ID do conteúdo inválido");
    }

    if (![1, 2, 3, 4, 5].includes(Number(understandingScore))) {
      throw new Error("Compreensão deve ser um valor entre 1 e 5");
    }

    if (!["facil", "medio", "dificil"].includes(perceivedDifficulty)) {
      throw new Error("Dificuldade percebida inválida");
    }

    const completedReviews = await this.reviewRepository.findByQuery({
      userId,
      contentId: new ObjectId(contentId),
      type: "completed_review",
    });

    if (completedReviews.length === 0) {
      throw new Error("Apenas revisões concluídas podem receber feedback");
    }

    // impedir feedback duplicado na mesma data
    if (reviewDate) {
      const existing = await this.feedbackRepository.findReviewFeedbackByUserContentAndDate(
        userId,
        contentId,
        reviewDate,
      );
      if (existing) {
        throw new Error("Feedback já registrado para esta revisão");
      }
    }

    const content = await this.contentRepository.findById(contentId);
    if (content === null) {
      throw new Error("Conteúdo não encontrado");
    }

    const feedback = {
      userId,
      contentId: new ObjectId(contentId),
      reviewDate: reviewDate || null,
      subject: content.subject,
      understandingScore: Number(understandingScore),
      perceivedDifficulty,
      note,
      createdAt: new Date().toISOString(),
      feedbackType: "review",
    };

    const normalizedReviewDate = reviewDate || new Date().toISOString().slice(0, 10);
    const newInterval = this.calculateNewInterval(perceivedDifficulty, understandingScore);
    const nextReviewDate = new Date(`${normalizedReviewDate}T00:00:00`);
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
    const nextReview = nextReviewDate.toISOString().slice(0, 10);

    await this.contentRepository.update(contentId, {
      difficulty: perceivedDifficulty,
      stability: newInterval,
      lastReview: normalizedReviewDate,
      nextReview,
    });

    await this.feedbackRepository.createReviewFeedback(feedback);

    if (this.contentService) {
      try {
        await this.contentService.setAllContentReviews(userId);
      } catch (_) {}
    }

    return {
      message: "Feedback de revisão registrado com sucesso",
      feedback,
      contentUpdate: {
        contentId,
        difficulty: perceivedDifficulty,
        interval: newInterval,
        lastReview: normalizedReviewDate,
        nextReview,
      },
    };
  }

  async getUserReviewFeedback(userId, subject = null, from = null, to = null) {
    if (!ObjectId.isValid(userId)) {
      throw new Error("ID do usuário inválido");
    }

    let fromIso = null;
    let toIso = null;

    if (from) {
      if (Number.isNaN(Date.parse(from))) {
        throw new Error("Data inicial inválida");
      }
      fromIso = new Date(from).toISOString();
    }

    if (to) {
      if (Number.isNaN(Date.parse(to))) {
        throw new Error("Data final inválida");
      }
      toIso = new Date(to).toISOString();
    }

    const feedbacks = await this.feedbackRepository.findReviewFeedbackByUserId(
      userId,
      {
        subject: subject?.trim() || null,
        from: fromIso,
        to: toIso,
      },
    );

    return {
      userId,
      total: feedbacks.length,
      feedbacks: feedbacks.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      ),
    };
  }

  async deleteReviewFeedback(userId, contentId, reviewDate) {
    if (!ObjectId.isValid(userId)) {
      throw new Error("ID do usuário inválido");
    }
    if (!ObjectId.isValid(contentId)) {
      throw new Error("ID do conteúdo inválido");
    }
    await this.feedbackRepository.deleteReviewFeedbackByUserContentAndDate(
      userId,
      contentId,
      reviewDate,
    );
    return { message: "Feedback removido com sucesso" };
  }

  async createScheduleFeedback({
    userId,
    scheduleId,
    subject,
    topic,
    understandingScore,
    perceivedDifficulty,
    note,
  }) {
    perceivedDifficulty = perceivedDifficulty?.trim().toLowerCase();
    note = note?.trim() || "";

    if (!ObjectId.isValid(userId)) {
      throw new Error("ID do usuário inválido");
    }
    if (!scheduleId) {
      throw new Error("ID do agendamento é obrigatório");
    }
    if (![1, 2, 3, 4, 5].includes(Number(understandingScore))) {
      throw new Error("Compreensão deve ser um valor entre 1 e 5");
    }
    if (!["facil", "medio", "dificil"].includes(perceivedDifficulty)) {
      throw new Error("Dificuldade percebida inválida");
    }

    const existing = await this.feedbackRepository.findScheduleFeedbackByScheduleId(scheduleId);
    if (existing) {
      throw new Error("Feedback já registrado para este agendamento");
    }

    const feedback = {
      userId,
      scheduleId,
      subject,
      topic,
      understandingScore: Number(understandingScore),
      perceivedDifficulty,
      note,
      createdAt: new Date().toISOString(),
      feedbackType: "schedule_review",
    };

    await this.feedbackRepository.createScheduleFeedback(feedback);

    return {
      message: "Feedback do agendamento registrado com sucesso",
      feedback,
    };
  }

  async deleteScheduleFeedback(scheduleId) {
    if (!scheduleId) {
      throw new Error("ID do agendamento é obrigatório");
    }
    await this.feedbackRepository.deleteScheduleFeedbackByScheduleId(scheduleId);
    return { message: "Feedback do agendamento removido com sucesso" };
  }

  async createSkippedReview({ userId, contentId, reviewDate }) {
    if (!ObjectId.isValid(userId)) {
      throw new Error("ID do usuário inválido");
    }
    if (!ObjectId.isValid(contentId)) {
      throw new Error("ID do conteúdo inválido");
    }

    // impede duplicata no mesmo dia
    if (reviewDate) {
      const existing = await this.feedbackRepository.findSkippedReviewByUserContentAndDate(
        userId,
        contentId,
        reviewDate,
      );
      if (existing) {
        return { message: "Revisão já marcada como não realizada nesta data" };
      }
    }

    const content = await this.contentRepository.findById(contentId);
    if (content === null) {
      throw new Error("Conteúdo não encontrado");
    }

    const record = {
      userId,
      contentId: new ObjectId(contentId),
      reviewDate: reviewDate || null,
      subject: content.subject,
      skipped: true,
      completed: false,
      createdAt: new Date().toISOString(),
      feedbackType: "review",
    };

    const normalizedReviewDate = reviewDate || new Date().toISOString().slice(0, 10);
    const retryInterval = this.calculateRetryInterval(content.stability);
    const nextReviewDate = new Date(`${normalizedReviewDate}T00:00:00`);
    nextReviewDate.setDate(nextReviewDate.getDate() + retryInterval);
    const nextReview = nextReviewDate.toISOString().slice(0, 10);

    await this.contentRepository.update(contentId, {
      stability: retryInterval,
      nextReview,
    });

    await this.feedbackRepository.createSkippedReview(record);

    if (this.contentService) {
      try {
        await this.contentService.setAllContentReviews(userId);
      } catch (_) {}
    }

    return {
      message: "Revisão marcada como não realizada",
      record,
      contentUpdate: {
        contentId,
        interval: retryInterval,
        nextReview,
      },
    };
  }

  async getSkippedReviewsByUser(userId) {
    if (!ObjectId.isValid(userId)) {
      throw new Error("ID do usuário inválido");
    }
    const records = await this.feedbackRepository.findSkippedReviewsByUserId(userId);
    return { userId, total: records.length, skipped: records };
  }
}
