// Controller para endpoints de estudos
export class StudyController {
  constructor(studyService, reviewService, scheduleService) {
    this.studyService = studyService;
    this.reviewService = reviewService;
    this.scheduleService = scheduleService;
  }

  async getAllStudies(req, res) {
    res.json(await this.studyService.getAllStudies());
  }

  async createStudy(req, res) {
    // validacao de entrada
    try {
      const { subject, topic, initialDate } = req.body;

      if (!subject) {
        return res.status(400).json({ message: "Matéria é obrigatória" });
      }
      if (!topic) {
        return res.status(400).json({ message: "Assunto é obrigatório" });
      }
      if (!initialDate) {
        return res.status(400).json({ message: "Data inicial é obrigatória" });
      }

      await this.studyService.createStudy({
        subject,
        topic,
        initialDate,
      });

      res.status(201).json({ message: "Estudo cadastrado e revisões geradas" });
    } catch (error) {
      res.status(500).json({
        message: "Error ao criar estudo",
        error: error.message,
      });
    }
  }

  async getTodayItems(req, res) {
    // validacao de entrada
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const reviews = await this.reviewService.getReviewsByDate(today);
      const schedules = await this.scheduleService.getSchedulesByDate(today);

      res.json({
        date: today,
        reviews,
        schedules,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error ao buscar itens do dia",
        error: error.message,
      });
    }
  }
}
