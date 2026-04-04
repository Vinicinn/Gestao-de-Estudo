// Service para lógica de negócio de agendamentos manuais
export class ScheduleService {
  constructor(scheduleRepository) {
    this.scheduleRepository = scheduleRepository;
  }

  async getAllSchedules() {
    return await this.scheduleRepository.findAll();
  }

  async createSchedule({ subject, topic, date, time, duration }) {
    // validacao de negocio
    subject = subject?.trim();
    topic = topic?.trim();
    date = date?.trim();
    time = time?.trim();

    if (!subject) {
      throw new Error("Matéria inválida");
    }
    if (!topic) {
      throw new Error("Assunto inválido");
    }
    if (!date || Number.isNaN(Date.parse(date))) {
      throw new Error("Data do agendamento inválida");
    }
    if (!time) {
      throw new Error("Horário inválido");
    }
    if (typeof duration !== "number" || duration <= 0) {
      throw new Error("Duração inválida");
    }

    const schedule = {
      subject,
      topic,
      date,
      time,
      duration,
    };

    await this.scheduleRepository.createSchedule(schedule);
  }

  async getSchedulesByDate(date) {
    // validacao de negocio
    date = date?.trim();
    if (!date || Number.isNaN(Date.parse(date))) {
      throw new Error("Data inválida");
    }

    return await this.scheduleRepository.findByDate(date);
  }
}