// Service para lógica de negócio de estudos
export class StudyService {
  constructor(studyRepository, reviewService) {
    this.studyRepository = studyRepository;
    this.reviewService = reviewService;
  }

  async getAllStudies() {
    return await this.studyRepository.findAll();
  }

  async createStudy({ subject, topic, initialDate }) {
    // validacao de negocio
    subject = subject?.trim();
    topic = topic?.trim();
    initialDate = initialDate?.trim();

    if (!subject) {
      throw new Error("Matéria inválida");
    }
    if (!topic) {
      throw new Error("Assunto inválido");
    }
    if (!initialDate || Number.isNaN(Date.parse(initialDate))) {
      throw new Error("Data inicial inválida");
    }

    const study = {
      subject,
      topic,
      initialDate,
    };

    const createdStudy = await this.studyRepository.createStudy(study);

    // Gera revisões automáticas baseadas na curva de Ebbinghaus
    await this.generateReviews(createdStudy.insertedId, subject, topic, initialDate);

    return createdStudy;
  }

  // Gera revisões nos intervalos: 1, 3, 7, 15, 30 dias
  async generateReviews(studyId, subject, topic, initialDate) {
    const intervals = [1, 3, 7, 15, 30]; // dias da curva de esquecimento
    const initial = new Date(initialDate);

    for (const interval of intervals) {
      const reviewDate = new Date(initial);
      reviewDate.setDate(reviewDate.getDate() + interval);
      const reviewDateStr = reviewDate.toISOString().split('T')[0]; // formato YYYY-MM-DD

      await this.reviewService.createReview({
        studyId: studyId.toString(),
        subject,
        topic,
        reviewDate: reviewDateStr,
        interval,
      });
    }
  }

  async getTotalHours() {
    // Método mantido para compatibilidade
    const studies = await this.studyRepository.findAll();
    return studies.reduce((total, study) => total + (Number(study.hours) || 0), 0);
  }
}
