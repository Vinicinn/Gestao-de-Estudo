import { ObjectId } from "mongodb";

export class BaseService {
  constructor(repository, entityName = "Registro") {
    this.repository = repository;
    this.entityName = entityName;
  }

  validateObjectId(id, fieldName = "ID") {
    if (!ObjectId.isValid(id)) {
      throw new Error(`${fieldName} invalido`);
    }
  }

  validateUserId(userId) {
    this.validateObjectId(userId, "ID de usuario");
  }

  async getByUser(userId) {
    this.validateUserId(userId);
    return await this.repository.findByUserId(userId);
  }

  async getAll(userId) {
    return await this.getByUser(userId);
  }

  async getOwnedById(id, userId) {
    this.validateObjectId(id, `ID de ${this.entityName.toLowerCase()}`);
    this.validateUserId(userId);

    const item = await this.repository.findByIdAndUserId(id, userId);
    if (!item) {
      throw new Error(`${this.entityName} nao encontrado`);
    }

    return item;
  }

  async getById(id, userId) {
    return await this.getOwnedById(id, userId);
  }

  normalizePayload(payload) {
    return payload;
  }

  prepareUpdate(currentItem, payload) {
    return { ...currentItem, ...payload };
  }

  async beforeCreate() {}

  async beforeUpdate() {}

  async beforeDelete() {}

  async createForUser(userId, data) {
    this.validateUserId(userId);
    return await this.repository.create({ userId, ...data });
  }

  async create(userId, payload) {
    this.validateUserId(userId);
    const data = this.normalizePayload(payload);
    await this.beforeCreate(userId, data, payload);
    return await this.createForUser(userId, data);
  }

  async updateOwned(id, userId, data) {
    await this.repository.update(id, data);
    return { message: `${this.entityName} atualizado com sucesso` };
  }

  async update(id, userId, payload) {
    const currentItem = await this.getOwnedById(id, userId);
    const data = this.normalizePayload(this.prepareUpdate(currentItem, payload));
    await this.beforeUpdate(id, userId, data, payload, currentItem);
    return await this.updateOwned(id, userId, data);
  }

  async deleteOwned(id, userId) {
    const item = await this.getOwnedById(id, userId);
    await this.beforeDelete(id, userId, item);
    await this.repository.delete(id);
    return { message: `${this.entityName} removido com sucesso` };
  }

  async delete(id, userId) {
    return await this.deleteOwned(id, userId);
  }
}
