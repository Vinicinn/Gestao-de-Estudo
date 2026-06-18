export class ScheduleController {
  constructor(scheduleService) {
    this.scheduleService = scheduleService;
  }

  async getUserSchedules(req, res) {
    try {
      res.json(await this.scheduleService.getUserSchedules(req.user.id));
    } catch (error) {
      res.status(500).json({ message: "Erro ao buscar agendamentos", error: error.message });
    }
  }

  async createSchedule(req, res) {
    try {
      const result = await this.scheduleService.createSchedule(req.user.id, req.body);
      res.status(201).json({ message: "Agendamento criado com sucesso", id: result.insertedId });
    } catch (error) {
      res.status(400).json({ message: "Erro ao criar agendamento", error: error.message });
    }
  }

  async updateSchedule(req, res) {
    try {
      res.json(await this.scheduleService.updateSchedule(req.params.id, req.user.id, req.body));
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar agendamento", error: error.message });
    }
  }

  async updateStatus(req, res) {
    try {
      res.json(await this.scheduleService.updateStatus(req.params.id, req.user.id, req.body.status));
    } catch (error) {
      res.status(400).json({ message: "Erro ao atualizar status", error: error.message });
    }
  }

  async deleteSchedule(req, res) {
    try {
      res.json(await this.scheduleService.deleteSchedule(req.params.id, req.user.id));
    } catch (error) {
      res.status(400).json({ message: "Erro ao remover agendamento", error: error.message });
    }
  }
}
