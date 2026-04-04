export class StudyController {
  constructor(studyService) {
    this.studyService = studyService;
  }

  async getAllStudies(req, res) {
    res.json(await this.studyService.getAllStudies());
  }

  async createStudy(req, res) {
    // validacao de entrada
    try {
      const { subject, topic, date, hours } = req.body;

      if (!subject) {
        return res.status(400).json({ message: "Matéria é obrigatória" });
      }
      if (!topic) {
        return res.status(400).json({ message: "Assunto é obrigatório" });
      }
      if (!date) {
        return res.status(400).json({ message: "Data do estudo é obrigatória" });
      }
      if (hours === undefined) {
        return res.status(400).json({ message: "Quantidade de horas é obrigatória" });
      }

      const parsedHours = Number(hours);
      if (Number.isNaN(parsedHours)) {
        return res.status(400).json({
          message: "Quantidade de horas inválida",
        });
      }

      await this.studyService.createStudy({
        subject,
        topic,
        date,
        hours: parsedHours,
      });

      res.status(201).json({ message: "Registro de estudo criado" });
    } catch (error) {
      res.status(500).json({
        message: "Error ao criar registro de estudo",
        error: error.message,
      });
    }
  }

  async getTotalHours(req, res) {
    // validacao de entrada
    try {
      res.json({ totalHours: await this.studyService.getTotalHours() });
    } catch (error) {
      res.status(500).json({
        message: "Error ao calcular total de horas estudadas",
        error: error.message,
      });
    }
  }
}
