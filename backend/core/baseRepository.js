import { ObjectId } from "mongodb";

export class BaseRepository {
  constructor(database, collectionName) {
    this.collection = database.collection(collectionName);
  }
  
  toObjectId(id) {
    return new ObjectId(id);
  }

  async findAll() {
    return await this.collection.find().toArray();
  }

  async findById(id) {
    return await this.collection.findOne({ _id: this.toObjectId(id) });
  }

  async findByUserId(userId) {
    return await this.collection.find({ userId }).toArray();
  }

  async findByIdAndUserId(id, userId) {
    return await this.collection.findOne({ _id: this.toObjectId(id), userId });
  }

  async create(data) {
    return await this.collection.insertOne(data);
  }

  async update(id, data) {
    return await this.collection.updateOne(
      { _id: this.toObjectId(id) },
      { $set: data },
    );
  }

  async delete(id) {
    return await this.collection.deleteOne({ _id: this.toObjectId(id) });
  }

  async deleteByUserId(userId) {
    return await this.collection.deleteMany({ userId });
  }
}
