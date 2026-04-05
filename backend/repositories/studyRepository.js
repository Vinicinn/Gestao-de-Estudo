export class StudyRepository {
  constructor(database) {
    this.collection = database.collection("studies");
  }

  async findAll() {
    return await this.collection.find().toArray();
  }

  async createStudy(study) {
    await this.collection.insertOne(study);
  }
}
