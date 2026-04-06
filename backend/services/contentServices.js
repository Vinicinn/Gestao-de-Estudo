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
    const nextReviews = [];

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
}
