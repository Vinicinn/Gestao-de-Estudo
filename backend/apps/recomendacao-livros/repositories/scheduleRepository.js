import { BaseRepository } from "../../../core/baseRepository.js";

export class ScheduleRepository extends BaseRepository {
  constructor(database) {
    super(database, "bookSchedules");
  }

  async findOneByUserId(userId) {
    return await this.collection.findOne({ userId });
  }

  async upsertByUserId(userId, data) {
    return await this.collection.updateOne(
      { userId },
      { $set: data },
      { upsert: true },
    );
  }
}