import { ObjectId } from "mongodb";

export class ContentService {
  constructor(contentRepository, getResponse) {
    this.contentRepository = contentRepository;
    this.getResponse = getResponse;
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

  async createContent(userId, name, subject, difficulty) {
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
    const content = await this.contentRepository.findById(id);
    if (content === null) {
      throw new Error("Conteúdo não encontrado");
    }

    await this.contentRepository.delete(id);
  }

  calculateNextReviews(startDate, interval) {
    return [interval, interval * 2, interval * 4].map((days) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + days);
      return date.toISOString().split("T")[0];
    });
  }

  async submitFeedback(id, quality) {
    if (!ObjectId.isValid(id)) {
      throw new Error("ID inválido");
    }

    const content = await this.contentRepository.findById(id);
    if (content === null) {
      throw new Error("Conteúdo não encontrado");
    }

    const qualityMap = {
      facil: 5,
      normal: 3,
      dificil: 2,
      esqueci: 0,
    };

    const normalized =
      typeof quality === "string" ? quality.trim().toLowerCase() : quality;
    const qualityValue =
      typeof normalized === "number" ? normalized : qualityMap[normalized];

    if (qualityValue === undefined || qualityValue < 0 || qualityValue > 5) {
      throw new Error("Qualidade inválida");
    }

    const feedbackType =
      typeof normalized === "string"
        ? normalized
        : normalized === 5
          ? "facil"
          : normalized >= 3
            ? "normal"
            : normalized === 2
              ? "dificil"
              : "esqueci";

    const today = new Date().toISOString().split("T")[0];

    const lastReviews = [
      ...(content.lastReviews || []),
      { date: today, quality: feedbackType },
    ];

    await this.contentRepository.update(id, {
      lastReviews,
    });

    return {
      ...content,
      lastReviews,
    };
  }

  async getUserRecommendations(userId) {
    if (!ObjectId.isValid(userId)) {
      throw new Error("ID de usuário inválido");
    }

    const contents = await this.contentRepository.findByUserId(userId);
    const today = new Date().toISOString().split("T")[0];

    return contents.sort((a, b) => a.nextReview.localeCompare(b.nextReview));
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

    // atualizar o conteúdo
    await this.contentRepository.update(id, {
      nextReviews: sortedDates,
    });

    return {
      ...content,
      nextReviews: sortedDates,
    };
  }

  async validateReviewDates(id) {
    // validacao de negocio
    if (!ObjectId.isValid(id)) {
      throw new Error("ID inválido");
    }

    const content = await this.contentRepository.findById(id);
    if (content === null) {
      throw new Error("Conteúdo não encontrado");
    }

    return {
      id: content._id,
      name: content.name,
      subject: content.subject,
      currentNextReviews: content.nextReviews || [],
      stability: content.stability,
    };
  }

  async setAllContentReviews(userId) {
    const contents = await this.getAllUserContents(userId);
    if (!contents || contents.length === 0) {
      throw new Error("Nenhum conteúdo encontrado para o usuário");
    }
    const today = new Date();
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
    ${JSON.stringify(contents, null, 2)}
    `;

    const response = await this.getResponse(prompt);
    const data = JSON.parse(response);
    for (let i = 0; i < data.length; i++) {
      const content = data[i];

      if (!content?._id) {
        throw new Error(`Item inválido na posição ${i}: _id ausente`);
      }

      const nextDate = new Date(today);
      nextDate.setDate(nextDate.getDate() + i);
      const formatted = nextDate.toISOString().slice(0, 10);

      await this.contentRepository.updateNextReview(content._id, formatted);
    }
  }
}
