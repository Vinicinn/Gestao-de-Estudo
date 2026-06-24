import { BaseService } from "../../../core/baseService.js";

export class ScheduleService extends BaseService {
  constructor(scheduleRepository, resourceRepository) {
    super(scheduleRepository, "Agendamento");
    this.scheduleRepository = scheduleRepository;
    this.resourceRepository = resourceRepository;
  }

  async validateResource(resourceId, userId) {
    if (!resourceId) return;

    this.validateObjectId(resourceId, "ID do recurso");
    const resource = await this.resourceRepository.findByIdAndUserId(resourceId, userId);
    if (!resource) {
      throw new Error("Recurso nao encontrado");
    }
  }

  normalizePayload(payload) {
    const title = payload.title?.trim();
    const date = payload.date?.trim();

    if (!title || title.length < 2) {
      throw new Error("Titulo do agendamento invalido");
    }
    if (!date || Number.isNaN(Date.parse(date))) {
      throw new Error("Data do agendamento invalida");
    }

    return {
      title,
      date,
      time: payload.time?.trim() || "",
      resourceId: payload.resourceId || null,
      status: payload.status || "pending",
      metadata: payload.metadata || {},
    };
  }

  async beforeCreate(userId, schedule) {
    await this.validateResource(schedule.resourceId, userId);
  }

  async beforeUpdate(id, userId, schedule) {
    await this.validateResource(schedule.resourceId, userId);
  }

  async getUserSchedules(userId) {
    return await this.getAll(userId);
  }

  async createSchedule(userId, payload) {
    return await this.create(userId, payload);
  }

  async updateSchedule(id, userId, payload) {
    return await this.update(id, userId, payload);
  }

  async updateStatus(id, userId, status) {
    const allowedStatus = ["pending", "completed", "skipped"];
    if (!allowedStatus.includes(status)) {
      throw new Error("Status invalido");
    }

    await this.getOwnedById(id, userId);
    await this.repository.update(id, { status });
    return { message: "Status do agendamento atualizado com sucesso" };
  }

  async deleteSchedule(id, userId) {
    return await this.delete(id, userId);
  }
}
