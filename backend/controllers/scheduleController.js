export class ScheduleController {
  constructor(scheduleService) {
    this.scheduleService = scheduleService;
  }

  async getAllSchedules(req, res) {
    res.json(await this.scheduleService.getAllSchedules());
  }

  async createSchedule(req, res) {
    // validacao de entrada
    try {
      const { subject, topic, date, time, duration } = req.body;

      if (!subject) {
        return res.status(400).json({ message: "Matéria é obrigatória" });
      }
      if (!topic) {
        return res.status(400).json({ message: "Assunto é obrigatório" });
      }
      if (!date) {
        return res.status(400).json({ message: "Data do agendamento é obrigatória" });
      }
      if (!time) {
        return res.status(400).json({ message: "Horário é obrigatório" });
      }
      if (duration === undefined) {
        return res.status(400).json({ message: "Duração é obrigatória" });
      }

      const parsedDuration = Number(duration);
      if (Number.isNaN(parsedDuration)) {
        return res.status(400).json({
          message: "Duração inválida",
        });
      }

      await this.scheduleService.createSchedule({
        subject,
        topic,
        date,
        time,
        duration: parsedDuration,
      });

      res.status(201).json({ message: "Agendamento manual criado" });
    } catch (error) {
      res.status(500).json({
        message: "Error ao criar agendamento manual",
        error: error.message,
      });
    }
  }

  async getSchedulesByDate(req, res) {
    // validacao de entrada
    try {
      const { date } = req.params;
      if (!date) {
        return res.status(400).json({ message: "Data é obrigatória" });
      }
      res.json(await this.scheduleService.getSchedulesByDate(date));
    } catch (error) {
      res.status(500).json({
        message: "Error ao buscar agendamentos por data",
        error: error.message,
      });
    }
  }
}