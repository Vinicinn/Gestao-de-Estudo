import { BaseRepository } from "../../../core/baseRepository.js";

export class FeedbackRepository extends BaseRepository {
  constructor(database) {
    super(database, "bookFeedbacks");
  }

  async findByUserId(userId) {
    return await this.collection.find({ userId }).sort({ createdAt: -1 }).toArray();
  }

  async findByType(userId, type) {
    return await this.collection.find({ userId, type }).sort({ createdAt: -1 }).toArray();
  }
}