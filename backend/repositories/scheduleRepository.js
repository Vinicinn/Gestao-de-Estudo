import { ObjectId } from "mongodb";

export class ScheduleRepository {
  constructor(database) {
    this.collection = database.collection("schedules");
  }

  async findByUserId(userId) {
    return await this.collection.find({ userId }).toArray();
  }

  async findByIdAndUserId(id, userId) {
    return await this.collection.findOne({ _id: new ObjectId(id), userId });
  }

  async create(schedule) {
    return await this.collection.insertOne(schedule);
  }

  async update(id, update) {
    return await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: update },
    );
  }

  async delete(id) {
    return await this.collection.deleteOne({ _id: new ObjectId(id) });
  }
}
