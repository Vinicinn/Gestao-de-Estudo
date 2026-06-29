import { BaseController } from "../../../core/baseController.js";

export class ScheduleController extends BaseController {
  constructor(scheduleService) {
    super(scheduleService, "Perfil");
    this.scheduleService = scheduleService;
  }

  async getUserSchedules(req, res) {
    return await this.handle(
      res,
      async () => this.ok(res, await this.scheduleService.getUserSchedules(req.user.id)),
      "Erro ao buscar perfil de treino",
      500,
    );
  }

  async updateSchedule(req, res) {
    return await this.handle(
      res,
      async () => this.ok(res, await this.scheduleService.updateSchedule(req.user.id, req.body)),
      "Erro ao atualizar perfil de treino",
    );
  }
}
