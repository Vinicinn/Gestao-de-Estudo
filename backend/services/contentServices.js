import { ObjectId } from "mongodb";

export class ContentService {
  constructor(contentRepository) {
    this.contentRepository = contentRepository;
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
      facil: 20, // retém por ~20 dias
      medio: 10, // retém por ~10 dias
      dificil: 4, // retém por ~4 dias
    };

    name = name.trim();
    subject = subject.trim();
    difficulty = difficulty.trim();
    const stability = difficultMap[difficulty];
    const lastReviews = [];

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

    // gera datas de revisão pela curva do esquecimento: stability * multiplicador
    const today = new Date();
    const nextReviews = [1, 2, 4, 8].map((mult) => {
      const d = new Date(today);
      d.setDate(d.getDate() + stability * mult);
      return d.toISOString().split("T")[0];
    });

    return await this.contentRepository.create({
      userId,
      name,
      subject,
      difficulty,
      stability,
      lastReviews,
      nextReviews,
    });
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

  async getUserRecommendations(userId) {
    if (!ObjectId.isValid(userId)) {
      throw new Error("ID de usuário inválido");
    }

    const contents = await this.contentRepository.findByUserId(userId);
    const today = new Date().toISOString().split("T")[0];

    return contents
      .map((c) => {
        // para conteúdos antigos sem nextReviews, calcula usando stability
        const dates =
          c.nextReviews && c.nextReviews.length > 0
            ? c.nextReviews
            : [1, 2, 4, 8].map((mult) => {
                const d = new Date();
                d.setDate(d.getDate() + (c.stability || 10) * mult);
                return d.toISOString().split("T")[0];
              });

        const sorted = dates.slice().sort();
        const nextDate = sorted.find((d) => d >= today) ?? sorted.at(-1);
        return { ...c, nextReviewDate: nextDate };
      })
      .sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate));
  }
}
