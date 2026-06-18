import { ObjectId } from "mongodb";

export class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  sanitizeUser(user) {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
    };
  }

  async getAllUsers() {
    const users = await this.userRepository.getAllUsers();
    return users.map((user) => this.sanitizeUser(user));
  }

  async createUser() {
    throw new Error("Use /api/auth/register para cadastrar usuarios");
  }

  async getUserById(id) {
    if (!ObjectId.isValid(id)) {
      throw new Error("ID invalido");
    }

    const user = await this.userRepository.getUserById(id);
    if (user === null) {
      throw new Error("Usuario nao encontrado");
    }

    return this.sanitizeUser(user);
  }

  async updateUser(id, update) {
    if (!ObjectId.isValid(id)) {
      throw new Error("ID invalido");
    }
    if (update.password) {
      throw new Error("Use um fluxo especifico de autenticacao para alterar senha");
    }

    const nextUpdate = {};

    if (update.name) {
      nextUpdate.name = update.name.trim();
    }
    if (update.email) {
      nextUpdate.email = update.email.trim().toLowerCase();
    }
    if (!nextUpdate.name) {
      throw new Error("Nome invalido");
    }
    if (nextUpdate.name.length < 2) {
      throw new Error("Nome deve ter pelo menos 2 caracteres");
    }
    if (nextUpdate.email && !nextUpdate.email.includes("@")) {
      throw new Error("Email invalido");
    }

    const user = await this.userRepository.getUserById(id);
    if (user === null) {
      throw new Error("Usuario nao encontrado");
    }

    await this.userRepository.updateUser(id, nextUpdate);
  }

  async deleteUser(id) {
    if (!ObjectId.isValid(id)) {
      throw new Error("ID invalido");
    }

    const user = await this.userRepository.getUserById(id);
    if (user === null) {
      throw new Error("Usuario nao encontrado");
    }

    await this.userRepository.deleteUser(id);
  }

  async deleteAllUsers() {
    await this.userRepository.deleteAll();
  }

  async getUserByName(name) {
    if (!name) {
      throw new Error("Nome invalido");
    }

    const user = await this.userRepository.getUserByName(name);
    return user ? this.sanitizeUser(user) : null;
  }
}
