import { ObjectId } from "mongodb";

export class ContentRepository {
  constructor(database) {
    this.collection = database.collection("contents");
  }

  async findAll() {
    return await this.collection.find().toArray();
  }

  async findByUserId(userId) {
    return await this.collection.find({ userId }).toArray();
  }

  async findById(id) {
    return await this.collection.findOne({ _id: new ObjectId(id) });
  }

  async create(content) {
    return await this.collection.insertOne(content);
  }

  async update(id, content) {
    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: content },
    );
  }

  async updateNextReview(id, nextReview) {
    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { nextReview: nextReview } },
    );
  }

  async delete(id) {
    await this.collection.deleteOne({ _id: new ObjectId(id) });
  }
}
