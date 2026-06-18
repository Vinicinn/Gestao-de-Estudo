import { ObjectId } from "mongodb";

export class UserRepository {
  constructor(database) {
    this.collection = database.collection("users");
  }

  async getAllUsers() {
    return await this.collection.find().toArray();
  }

  async getUserById(id) {
    return await this.collection.findOne({ _id: new ObjectId(id) });
  }

  async createUser(user) {
    return await this.collection.insertOne(user);
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

  async deleteAll() {
    await this.collection.deleteMany({});
  }

  async getUserByName(name) {
    return await this.collection.findOne({ name });
  }

  async getUserByEmail(email) {
    return await this.collection.findOne({ email });
  }
}
