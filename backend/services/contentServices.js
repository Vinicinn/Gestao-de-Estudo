import { ObjectId } from "mongodb";

export class ContentService {
  constructor(contentRepository, getResponse, feedbackRepository = null) {
    this.contentRepository = contentRepository;
    this.getResponse = getResponse;
    this.feedbackRepository = feedbackRepository;
  }

  async getAllContents() {
    return await this.contentRepository.findAll();
  }

  async getAllUserContents(userId) {
    // validacao de negocio
    if (!ObjectId.isValid(userId)) {
      throw new Error("ID de usuário inválido");
    }

    return await this.contentRepository.findByUserId(userId);
  }

  async getContentById(id) {
    // validacao de negocio
    if (!ObjectId.isValid(id)) {
      throw new Error("ID inválido");
    }
    const content = await this.contentRepository.findById(id);
    if (content === null) {
      throw new Error("Conteúdo não encontrado");
    }
    return content;
  }

  async createContent(userId, name, subject, difficulty, goal) {
    const difficultMap = {
      facil: 15, // retém por 15 dias
      medio: 7, // retém por 7 dias
      dificil: 3, // retém por 3 dias
    };

    name = name.trim();
    subject = subject.trim();
    difficulty = difficulty.trim();
    const stability = difficultMap[difficulty];
    const retention = 1.0;
    const createAt = new Date().toISOString().split("T")[0];
    const lastReview = createAt;
    const nextReview = "";

    // validacao de negocio
    if (!name || name.length < 2) {
      throw new Error("Nome do conteúdo inválido");
    }
    if (!difficultMap[difficulty]) {
      throw new Error("Dificuldade inválida");
    }
    if (!ObjectId.isValid(userId)) {
      throw new Error("ID de usuário inválido");
    }
    if (isNaN(goal) || goal < 0) {
      console.log(isNaN(goal));
      console.log(goal);
      
      goal = 10;
    }

    let result;

    try {
      result = await this.contentRepository.create({
        userId,
        name,
        subject,
        difficulty,
        stability,
        retention,
        createAt,
        lastReview,
        nextReview,
        goal,
      });

      await this.setAllContentReviews(userId);

      return result;
    } catch (error) {
      if (result.insertedId) {
        await this.contentRepository.delete(result.insertedId.toString());
        console.log(error);
      }
      throw error;
    }
  }

  async updateContent(id, update) {
    // validacao de negocio
    if (!ObjectId.isValid(id)) {
      throw new Error("ID inválido");
    }
    const content = await this.contentRepository.findById(id);
    if (content === null) {
      throw new Error("Conteúdo não encontrado");
    }

    await this.contentRepository.update(id, update);
  }

  async updateContentNextReview(id, nextReview) {
    if (!ObjectId.isValid(id)) {
      throw new Error("ID inválido");
    }

    const content = await this.contentRepository.findById(id);
    if (content === null) {
      throw new Error("Conteúdo não encontrado");
    }

    await this.contentRepository.updateNextReview(id, nextReview);
  }

  async deleteContent(id) {
    // validacao de negocio
    if (!ObjectId.isValid(id)) {
      throw new Error("ID inválido");
    }
    // busca pelo conteudo para garantir que exista antes de tentar remover
    const content = await this.contentRepository.findById(id);
    if (content === null) {
      throw new Error("Conteúdo não encontrado");
    }

    // Remove feedbacks associados ao conteúdo para manter estatísticas consistentes.
    console.log("🗑️ Deletando feedbacks para conteúdo:", id);
    if (this.feedbackRepository) {
      try {
        const deleteResult = await this.feedbackRepository.deleteReviewFeedbackByContentId(id);
        console.log("✅ Feedbacks deletados:", deleteResult.deletedCount);
      } catch (error) {
        console.error("❌ Erro ao deletar feedbacks:", error.message);
      }
    } else {
      console.warn("⚠️ feedbackRepository não foi injetado!");
    }

    // verificacao se a exclusão ocorreu com sucesso
    const result = await this.contentRepository.delete(id);
    if (result.acknowledged != true) {
      return {
        message: "Falha ao remover o conteudo",
      };
    }
    return { message: "Conteudo removido com sucesso" };
  }

  async deleteAllContents() {
    await this.contentRepository.deleteAll();
  }

  async getUserRecommendations(userId) {
    if (!ObjectId.isValid(userId)) {
      throw new Error("ID de usuário inválido");
    }

    const contents = await this.contentRepository.findByUserId(userId);

    return contents.sort((a, b) => (a.nextReview || "").localeCompare(b.nextReview || ""));
  }

  async updateReviewDates(id, newNextReviews) {
    // validacao de negocio
    if (!ObjectId.isValid(id)) {
      throw new Error("ID inválido");
    }

    const content = await this.contentRepository.findById(id);
    if (content === null) {
      throw new Error("Conteúdo não encontrado");
    }

    // validar que newNextReviews é um array de strings de datas válidas
    if (!Array.isArray(newNextReviews)) {
      throw new Error("Próximas revisões deve ser um array de datas");
    }
    if (newNextReviews.length === 0) {
      throw new Error("Informe ao menos uma data de revisão");
    }

    for (const date of newNextReviews) {
      if (typeof date !== "string") {
        throw new Error("Todas as datas devem ser strings");
      }
      // validar formato ISO (YYYY-MM-DD)
      if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        throw new Error("Datas devem estar no formato YYYY-MM-DD");
      }
      // validar se é uma data válida
      if (Number.isNaN(Date.parse(date))) {
        throw new Error(`Data inválida: ${date}`);
      }
    }

    // ordenar as datas
    const sortedDates = newNextReviews.slice().sort();
    const nextReview = sortedDates[0];

    // atualizar o conteúdo
    await this.contentRepository.update(id, {
      nextReviews: sortedDates,
      nextReview,
    });

    return {
      ...content,
      nextReviews: sortedDates,
      nextReview,
    };
  }

  async setAllContentReviews(userId) {
    const contents = await this.getAllUserContents(userId);
    if (!contents || contents.length === 0) {
      throw new Error("Nenhum conteúdo encontrado para o usuário");
    }
    const today = new Date();
    const todayIso = today.toISOString().slice(0, 10);

    // Busca feedbacks de revisão do usuário e agrupa por contentId
    let feedbackByContent = {};
    let skippedCountByContent = {};
    const reviewedTodayContentIds = new Set();
    const skippedTodayContentIds = new Set();
    if (this.feedbackRepository) {
      try {
        const allFeedbacks = await this.feedbackRepository.findReviewFeedbackByUserId(userId);
        for (const fb of allFeedbacks) {
          const key = fb.contentId?.toString();
          if (!key) continue;
          if (fb.skipped) {
            skippedCountByContent[key] = (skippedCountByContent[key] || 0) + 1;
            if (fb.reviewDate === todayIso) {
              skippedTodayContentIds.add(key);
            }
            continue;
          }
          if (fb.reviewDate === todayIso) {
            reviewedTodayContentIds.add(key);
          }
          if (!feedbackByContent[key]) feedbackByContent[key] = [];
          feedbackByContent[key].push(fb);
        }
        // Mantém os 5 mais recentes por conteúdo
        for (const key of Object.keys(feedbackByContent)) {
          feedbackByContent[key] = feedbackByContent[key]
            .sort((a, b) => (b.reviewDate || "").localeCompare(a.reviewDate || ""))
            .slice(0, 5)
            .map((f) => ({
              reviewDate: f.reviewDate,
              understandingScore: f.understandingScore, // 1=muito difícil, 5=ótimo
              perceivedDifficulty: f.perceivedDifficulty, // facil/medio/dificil
            }));
        }
      } catch (_) {}
    }

    // Enriquece cada conteúdo com feedbacks recentes e contagem de revisões puladas
    const contentsWithFeedback = contents.map((c) => ({
      ...c,
      recentFeedbacks: feedbackByContent[c._id?.toString()] || [],
      skippedCount: skippedCountByContent[c._id?.toString()] || 0,
    }));

    const prompt = `
    Você é um assistente de estudos.

    Sua tarefa é ordenar os conteúdos por prioridade de revisão.

    Critérios:
    - Menor retenção = maior prioridade
    - Maior dificuldade = maior prioridade
    - Mais tempo sem revisar = maior prioridade

    Retorne apenas a lista ordenada do mais prioritário para o menos prioritário.

    Formato:
    [
      { "_id": "..." }
    ]

    Sem explicações. Apenas JSON válido.

    Conteúdos:
    ${JSON.stringify(contentsWithFeedback, null, 2)}
    `;

    const response = await this.getResponse(prompt);
    const match = response.match(/\[[\s\S]*\]/);
    const data = JSON.parse(match[0]);
    let priorityIndex = 0;
    for (let i = 0; i < data.length; i++) {
      const content = data[i];

      if (!content?._id) {
        throw new Error(`Item inválido na posição ${i}: _id ausente`);
      }

      const currentContent = contents.find((c) => c._id?.toString() === content._id?.toString());
      const nextDate = new Date(today);

      if (reviewedTodayContentIds.has(content._id?.toString())) {
        const interval = Math.max(1, Number(currentContent?.stability) || 1);
        nextDate.setDate(nextDate.getDate() + interval);
      } else if (skippedTodayContentIds.has(content._id?.toString())) {
        const interval = Math.max(1, Number(currentContent?.stability) || 1);
        nextDate.setDate(nextDate.getDate() + interval);
      } else {
        nextDate.setDate(nextDate.getDate() + priorityIndex);
        priorityIndex += 1;
      }

      const formatted = nextDate.toISOString().slice(0, 10);

      await this.contentRepository.updateNextReview(content._id, formatted);
    }
  }
}
