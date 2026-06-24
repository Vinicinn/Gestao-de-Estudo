export class BaseController {
  constructor(service = null, entityName = "Registro") {
    this.service = service;
    this.entityName = entityName;
  }

  ok(res, data) {
    return res.status(200).json(data);
  }

  created(res, data) {
    return res.status(201).json(data);
  }

  async handle(res, action, errorMessage, errorStatus = 400) {
    try {
      return await action();
    } catch (error) {
      return res.status(errorStatus).json({
        message: errorMessage,
        error: error.message,
      });
    }
  }

  async getAll(req, res) {
    return await this.handle(
      res,
      async () => this.ok(res, await this.service.getAll(req.user.id)),
      `Erro ao buscar ${this.entityName.toLowerCase()}s`,
      500,
    );
  }

  async getById(req, res) {
    return await this.handle(
      res,
      async () => this.ok(res, await this.service.getById(req.params.id, req.user.id)),
      `Erro ao buscar ${this.entityName.toLowerCase()}`,
      404,
    );
  }

  async create(req, res) {
    return await this.handle(
      res,
      async () => {
        const result = await this.service.create(req.user.id, req.body);
        return this.created(res, {
          message: `${this.entityName} criado com sucesso`,
          id: result.insertedId,
        });
      },
      `Erro ao criar ${this.entityName.toLowerCase()}`,
    );
  }

  async update(req, res) {
    return await this.handle(
      res,
      async () => this.ok(res, await this.service.update(req.params.id, req.user.id, req.body)),
      `Erro ao atualizar ${this.entityName.toLowerCase()}`,
    );
  }

  async delete(req, res) {
    return await this.handle(
      res,
      async () => this.ok(res, await this.service.delete(req.params.id, req.user.id)),
      `Erro ao remover ${this.entityName.toLowerCase()}`,
    );
  }
}
