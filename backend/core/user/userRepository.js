import { BaseRepository } from "../baseRepository.js";

export class UserRepository extends BaseRepository {
  constructor(database) {
    super(database, "users");
  }

  async getUserById(id) {
    return await this.findById(id);
  }

  async createUser(user) {
    return await this.create(user);
  }

  async updateUser(id, update) {
    return await this.update(id, update);
  }

  async deleteUser(id) {
    return await this.delete(id);
  }

  async getUserByEmail(email) {
    return await this.collection.findOne({ email });
  }
}
