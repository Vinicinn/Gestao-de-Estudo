import { BaseController } from "../../../core/baseController.js";

export class ScheduleController extends BaseController {
  constructor(scheduleService) {
    super(scheduleService, "Agendamento");
    this.scheduleService = scheduleService;
  }

  async getUserSchedules(req, res) {
    return await this.getAll(req, res);
  }

  async createSchedule(req, res) {
    return await this.create(req, res);
  }

  async updateSchedule(req, res) {
    return await this.update(req, res);
  }

  async updateStatus(req, res) {
    return await this.handle(
      res,
      async () => this.ok(res, await this.scheduleService.updateStatus(req.params.id, req.user.id, req.body.status)),
      "Erro ao atualizar status",
    );
  }

  async deleteSchedule(req, res) {
    return await this.delete(req, res);
  }
}
