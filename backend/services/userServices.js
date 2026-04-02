import { ObjectId } from "mongodb";

export class UserService {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async getAllUsers() {
    return await this.userRepository.getAllUsers();
  }

  async createUser({ name, password }) {
    // validacao de negocio
    name = name.trim();
    password = password.trim();

    if (!name) {
      throw new Error("Nome invalido");
    }
    if (!password) {
      throw new Error("Senha invalida");
    }
    if (name.length < 2) {
      throw new Error("Nome deve ter pelo menos 2 caracteres");
    }
    if (password.length < 4) {
      throw new Error("Senha deve ter pelo menos 4 caracteres");
    }

    const user = { name, password };
    return await this.userRepository.createUser(user);
  }

  async getUserById(id) {
    // validacao de negocio
    if (!ObjectId.isValid(id)) {
      throw new Error("ID inválido");
    }

    const user = await this.userRepository.getUserById(id);
    if (user === null) {
      throw new Error("Usuario não encontrado");
    }
    return user;
  }

  async updateUser(id, update) {
    // validacao de negocio
    if (!ObjectId.isValid(id)) {
      throw new Error("ID inválido");
    }

    update.name = update.name.trim();
    update.password = update.password.trim();

    if (!update.name) {
      throw new Error("Nome invalido");
    }
    if (!update.password) {
      throw new Error("Senha invalida");
    }
    if (update.name.length < 2) {
      throw new Error("Nome deve ter pelo menos 2 caracteres");
    }
    if (update.password.length < 4) {
      throw new Error("Senha deve ter pelo menos 4 caracteres");
    }

    await this.userRepository.updateUser(id, update);
  }

  async deleteUser(id) {
    // validacao de negocio
    if (!ObjectId.isValid(id)) {
      throw new Error("ID inválido");
    }
    await this.userRepository.deleteUser(id);
  }
}
