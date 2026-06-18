import { ObjectId } from "mongodb";

export class ScheduleService {
  constructor(scheduleRepository, resourceRepository) {
    this.scheduleRepository = scheduleRepository;
    this.resourceRepository = resourceRepository;
  }

  validateUserId(userId) {
    if (!ObjectId.isValid(userId)) {
      throw new Error("ID de usuario invalido");
    }
  }

  async validateResource(resourceId, userId) {
    if (!resourceId) return;
    if (!ObjectId.isValid(resourceId)) {
      throw new Error("ID do recurso invalido");
    }

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

  async getUserSchedules(userId) {
    this.validateUserId(userId);
    return await this.scheduleRepository.findByUserId(userId);
  }

  async createSchedule(userId, payload) {
    this.validateUserId(userId);
    const schedule = this.normalizePayload(payload);
    await this.validateResource(schedule.resourceId, userId);

    return await this.scheduleRepository.create({
      userId,
      ...schedule,
    });
  }

  async updateSchedule(id, userId, payload) {
    this.validateUserId(userId);
    const currentSchedule = await this.scheduleRepository.findByIdAndUserId(id, userId);
    if (!currentSchedule) {
      throw new Error("Agendamento nao encontrado");
    }

    const schedule = this.normalizePayload({ ...currentSchedule, ...payload });
    await this.validateResource(schedule.resourceId, userId);
    await this.scheduleRepository.update(id, schedule);

    return { message: "Agendamento atualizado com sucesso" };
  }

  async updateStatus(id, userId, status) {
    this.validateUserId(userId);
    const allowedStatus = ["pending", "completed", "skipped"];
    if (!allowedStatus.includes(status)) {
      throw new Error("Status invalido");
    }

    const schedule = await this.scheduleRepository.findByIdAndUserId(id, userId);
    if (!schedule) {
      throw new Error("Agendamento nao encontrado");
    }

    await this.scheduleRepository.update(id, { status });
    return { message: "Status do agendamento atualizado com sucesso" };
  }

  async deleteSchedule(id, userId) {
    this.validateUserId(userId);
    const schedule = await this.scheduleRepository.findByIdAndUserId(id, userId);
    if (!schedule) {
      throw new Error("Agendamento nao encontrado");
    }

    await this.scheduleRepository.delete(id);
    return { message: "Agendamento removido com sucesso" };
  }
}
