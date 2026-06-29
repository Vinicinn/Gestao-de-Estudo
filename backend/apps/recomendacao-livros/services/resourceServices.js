import { BaseService } from "../../../core/baseService.js";
import { getAiRecommendations, registerRecommendationEvent } from "../../../core/recommendation/recommendationUtils.js";

export class ResourceService extends BaseService {
  constructor(resourceRepository, scheduleRepository, feedbackRepository, getResponse) {
    super(resourceRepository, "Livro");
    this.resourceRepository = resourceRepository;
    this.scheduleRepository = scheduleRepository;
    this.feedbackRepository = feedbackRepository;
    this.getResponse = getResponse;
  }

  normalizeList(value) {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  validateRating(rating) {
    if (rating === null || rating === undefined || rating === "") {
      return null;
    }

    const parsed = Number(rating);
    if (Number.isNaN(parsed) || parsed < 1 || parsed > 5) {
      throw new Error("Nota deve ser um numero entre 1 e 5");
    }

    return parsed;
  }

  normalizePayload(payload) {
    const title = payload.title?.trim();
    const author = payload.author?.trim();
    const genres = this.normalizeList(payload.genres);
    const themes = this.normalizeList(payload.themes);

    if (!title || title.length < 2) {
      throw new Error("Titulo do livro invalido");
    }
    if (!author || author.length < 2) {
      throw new Error("Autor do livro invalido");
    }
    if (genres.length === 0) {
      throw new Error("Informe ao menos um genero");
    }

    return {
      title,
      author,
      genres,
      themes,
      synopsis: payload.synopsis?.trim() || "",
      source: payload.source || "manual",
      status: payload.status || "to_read",
      favorite: Boolean(payload.favorite),
      rating: this.validateRating(payload.rating),
      comment: payload.comment?.trim() || "",
      readingGoal: payload.readingGoal || {},
      metadata: payload.metadata || {},
    };
  }

  prepareUpdate(currentBook, payload) {
    return {
      ...currentBook,
      ...payload,
      title: payload.title?.trim() || currentBook.title,
      author: payload.author?.trim() || currentBook.author,
      genres: payload.genres ? this.normalizeList(payload.genres) : currentBook.genres,
      themes: payload.themes ? this.normalizeList(payload.themes) : currentBook.themes,
      synopsis: payload.synopsis?.trim() ?? currentBook.synopsis,
      rating: payload.rating !== undefined ? this.validateRating(payload.rating) : currentBook.rating,
      comment: payload.comment?.trim() ?? currentBook.comment,
      readingGoal: {
        ...(currentBook.readingGoal || {}),
        ...(payload.readingGoal || {}),
      },
      metadata: {
        ...(currentBook.metadata || {}),
        ...(payload.metadata || {}),
      },
    };
  }

  async registerHistory(userId, type, payload = {}) {
    await this.feedbackRepository.create({
      userId,
      type,
      ...payload,
      createdAt: new Date().toISOString(),
    });
  }

  async beforeCreate(userId, data) {
    data.createdAt = new Date().toISOString();
    data.updatedAt = new Date().toISOString();

    await this.registerHistory(userId, "book_added", {
      title: data.title,
      author: data.author,
      source: data.source,
    });
  }

  async beforeUpdate(id, userId, data) {
    data.updatedAt = new Date().toISOString();

    await this.registerHistory(userId, "book_updated", {
      bookId: id,
      title: data.title,
    });
  }

  async beforeDelete(id, userId, item) {
    await this.registerHistory(userId, "book_deleted", {
      bookId: id,
      title: item.title,
    });
  }

  async getUserResources(userId) {
    return await this.getAll(userId);
  }

  async getResourceById(id, userId) {
    return await this.getById(id, userId);
  }

  async createResource(userId, payload) {
    return await this.create(userId, payload);
  }

  async updateResource(id, userId, payload) {
    return await this.update(id, userId, payload);
  }

  async deleteResource(id, userId) {
    return await this.delete(id, userId);
  }

  async markAsRead(id, userId, payload = {}) {
    const book = await this.getOwnedById(id, userId);
    const rating = this.validateRating(payload.rating);
    const comment = payload.comment?.trim() || "";

    await this.repository.update(id, {
      ...book,
      status: "read",
      rating,
      comment,
      finishedAt: payload.finishedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await this.registerHistory(userId, "book_read", {
      bookId: id,
      title: book.title,
      rating,
      comment,
    });

    return { message: "Livro marcado como lido com sucesso" };
  }

  async abandonReading(id, userId, payload = {}) {
    const book = await this.getOwnedById(id, userId);
    const reason = payload.reason?.trim() || "";

    await this.repository.update(id, {
      ...book,
      status: "abandoned",
      abandonReason: reason,
      abandonedAt: payload.abandonedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await this.registerHistory(userId, "book_abandoned", {
      bookId: id,
      title: book.title,
      reason,
    });

    return { message: "Leitura abandonada com sucesso" };
  }

  async setFavorite(id, userId, favorite) {
    const book = await this.getOwnedById(id, userId);
    const isFavorite = Boolean(favorite);

    await this.repository.update(id, {
      ...book,
      favorite: isFavorite,
      updatedAt: new Date().toISOString(),
    });

    await this.registerHistory(userId, isFavorite ? "book_favorited" : "book_unfavorited", {
      bookId: id,
      title: book.title,
    });

    return { message: isFavorite ? "Livro favoritado com sucesso" : "Livro removido dos favoritos" };
  }

  async addReview(id, userId, payload = {}) {
    const book = await this.getOwnedById(id, userId);
    const rating = this.validateRating(payload.rating);
    const comment = payload.comment?.trim() || "";

    await this.repository.update(id, {
      ...book,
      rating,
      comment,
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await this.registerHistory(userId, "book_reviewed", {
      bookId: id,
      title: book.title,
      rating,
      comment,
    });

    return { message: "Avaliacao registrada com sucesso" };
  }

  async getReadingList(userId) {
    this.validateUserId(userId);
    return await this.resourceRepository.findByUserAndStatus(userId, "to_read");
  }

  async getReadBooks(userId) {
    this.validateUserId(userId);
    return await this.resourceRepository.findByUserAndStatus(userId, "read");
  }

  async getFavorites(userId) {
    this.validateUserId(userId);
    return await this.resourceRepository.findFavoritesByUser(userId);
  }

  buildFallbackRecommendations(books, preferences) {
    const favoriteGenres = new Set(preferences.favoriteGenres || []);
    const favoriteAuthors = new Set(preferences.favoriteAuthors || []);
    const interestThemes = new Set(preferences.interestThemes || []);

    return books
      .filter((book) => book.status !== "read" && book.status !== "abandoned")
      .map((book) => {
        let score = 0;
        score += (book.genres || []).filter((genre) => favoriteGenres.has(genre)).length * 3;
        if (favoriteAuthors.has(book.author)) score += 3;
        score += (book.themes || []).filter((theme) => interestThemes.has(theme)).length * 2;
        if (book.favorite) score += 1;
        if ((book.rating || 0) >= 4) score += 1;
        return { ...book, _score: score, reason: "recomendacao por afinidade de perfil" };
      })
      .sort((a, b) => b._score - a._score)
      .map(({ _score, ...book }) => book);
  }

  async upsertAiRecommendation(userId, recommendation) {
    const title = recommendation.title?.trim();
    const author = recommendation.author?.trim();

    if (!title || !author) {
      return null;
    }

    const existing = await this.resourceRepository.findByUserAndTitleAuthor(userId, title, author);
    const normalizedGenres = this.normalizeList(recommendation.genres);
    const normalizedThemes = this.normalizeList(recommendation.themes);

    if (existing) {
      await this.repository.update(existing._id.toString(), {
        ...existing,
        genres: normalizedGenres.length > 0 ? normalizedGenres : existing.genres || [],
        themes: normalizedThemes.length > 0 ? normalizedThemes : existing.themes || [],
        source: existing.source || "ai",
        metadata: {
          ...(existing.metadata || {}),
          aiReason: recommendation.reason || "recomendado por IA",
        },
        updatedAt: new Date().toISOString(),
      });

      return {
        ...existing,
        reason: recommendation.reason || "recomendado por IA",
      };
    }

    const created = {
      title,
      author,
      genres: normalizedGenres.length > 0 ? normalizedGenres : ["geral"],
      themes: normalizedThemes,
      synopsis: recommendation.synopsis?.trim() || "",
      source: "ai",
      status: "to_read",
      favorite: false,
      rating: null,
      comment: "",
      readingGoal: {},
      metadata: {
        aiReason: recommendation.reason || "recomendado por IA",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await this.repository.create({ userId, ...created });
    return {
      _id: result.insertedId,
      ...created,
      reason: recommendation.reason || "recomendado por IA",
    };
  }

  async getRecommendations(userId) {
    this.validateUserId(userId);

    const [books, preferences] = await Promise.all([
      this.repository.findByUserId(userId),
      this.scheduleRepository.findOneByUserId(userId),
    ]);

    const readBooks = books.filter((book) => book.status === "read");
    const negativeBooks = readBooks.filter((book) => (book.rating || 0) <= 2);
    let recommendations = [];

    const prompt = `
    Voce e um motor de recomendacao inteligente de livros.
    Gere recomendacoes altamente personalizadas para o usuario.
    Priorize livros com alta probabilidade de satisfacao.
    Evite similares aos livros com feedback negativo.
    Retorne apenas JSON valido com uma lista no formato:
    [
      {
        "title": "...",
        "author": "...",
        "genres": ["..."],
        "themes": ["..."],
        "synopsis": "...",
        "reason": "..."
      }
    ]

    Preferencias do usuario:
    ${JSON.stringify(preferences || {}, null, 2)}

    Historico de leitura positiva:
    ${JSON.stringify(readBooks.filter((book) => (book.rating || 0) >= 4), null, 2)}

    Historico de leitura negativa:
    ${JSON.stringify(negativeBooks, null, 2)}

    Biblioteca atual:
    ${JSON.stringify(books, null, 2)}
    `;

    const result = await getAiRecommendations({
      getResponse: this.getResponse,
      prompt,
      fallback: () => this.buildFallbackRecommendations(books, preferences || {}),
      mapItem: (recommendation) => this.upsertAiRecommendation(userId, recommendation),
    });

    recommendations = result.recommendations;

    await registerRecommendationEvent({
      registerHistory: this.registerHistory.bind(this),
      userId,
      type: "ai_recommendation_generated",
      recommendations,
      payload: { source: result.source },
    });

    return recommendations;
  }
}