import { ObjectId } from "mongodb";

export class UserRepository {
  constructor(database) {
    this.collection = database.collection("users");
  }

  async getAllUsers() {
    return await this.collection.find().toArray();
  }
  async createUser(user) {
    const result = await this.collection.insertOne(user);
    return result.insertedId;
  }
  async getUserById(id) {
    return await this.collection.findOne({ _id: new ObjectId(id) });
  }
  async updateUser(id, update) {
    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: update },
    );
  }
  async deleteUser(id) {
    await this.collection.deleteOne({ _id: new ObjectId(id) });
  }
}
