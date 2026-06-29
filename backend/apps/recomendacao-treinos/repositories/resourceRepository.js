import { BaseRepository } from "../../../core/baseRepository.js";

export class ResourceRepository extends BaseRepository {
  constructor(database) {
    super(database, "workoutResources");
  }

  async findByUserAndStatus(userId, status) {
    return await this.collection.find({ userId, status }).toArray();
  }

  async findFavoritesByUser(userId) {
    return await this.collection.find({ userId, favorite: true }).toArray();
  }

  async findCompletedByUser(userId) {
    return await this.collection.find({ userId, status: "completed" }).toArray();
  }

  async findByUserAndName(userId, name) {
    return await this.collection.findOne({ userId, name });
  }
}
