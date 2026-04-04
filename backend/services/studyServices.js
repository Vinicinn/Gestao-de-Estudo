export class StudyService {
  constructor(studyRepository) {
    this.studyRepository = studyRepository;
  }

  async getAllStudies() {
    return await this.studyRepository.findAll();
  }

  async createStudy({ subject, topic, date, hours }) {
    // validacao de negocio
    subject = subject?.trim();
    topic = topic?.trim();
    date = date?.trim();

    if (!subject) {
      throw new Error("Matéria inválida");
    }
    if (!topic) {
      throw new Error("Assunto inválido");
    }
    if (!date || Number.isNaN(Date.parse(date))) {
      throw new Error("Data do estudo inválida");
    }
    if (typeof hours !== "number" || hours <= 0) {
      throw new Error("Quantidade de horas inválida");
    }

    const study = {
      subject,
      topic,
      date,
      hours,
    };

    await this.studyRepository.createStudy(study);
  }

  async getTotalHours() {
    const studies = await this.studyRepository.findAll();
    return studies.reduce((total, study) => total + (Number(study.hours) || 0), 0);
  }
}
