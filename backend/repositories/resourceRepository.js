import { ObjectId } from "mongodb";

export class ResourceRepository {
  constructor(database) {
    this.collection = database.collection("resources");
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

  async findByIdAndUserId(id, userId) {
    return await this.collection.findOne({ _id: new ObjectId(id), userId });
  }

  async create(resource) {
    return await this.collection.insertOne(resource);
  }

  async update(id, resource) {
    return await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: resource },
    );
  }

  async delete(id) {
    return await this.collection.deleteOne({ _id: new ObjectId(id) });
  }

  async deleteByUserId(userId) {
    return await this.collection.deleteMany({ userId });
  }
}
