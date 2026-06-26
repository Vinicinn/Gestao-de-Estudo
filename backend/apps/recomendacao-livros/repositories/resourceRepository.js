import { BaseRepository } from "../../../core/baseRepository.js";

export class ResourceRepository extends BaseRepository {
  constructor(database) {
    super(database, "bookResources");
  }

  async findByUserAndStatus(userId, status) {
    return await this.collection.find({ userId, status }).toArray();
  }

  async findFavoritesByUser(userId) {
    return await this.collection.find({ userId, favorite: true }).toArray();
  }

  async findRatedByUser(userId) {
    return await this.collection.find({ userId, rating: { $ne: null } }).toArray();
  }

  async findByUserAndTitleAuthor(userId, title, author) {
    return await this.collection.findOne({ userId, title, author });
  }
}