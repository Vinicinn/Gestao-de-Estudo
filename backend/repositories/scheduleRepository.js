export class ScheduleRepository {
  constructor(database) {
    this.collection = database.collection("schedules");
  }

  async findAll() {
    return await this.collection.find().toArray();
  }

  async createSchedule(schedule) {
    await this.collection.insertOne(schedule);
  }

  async findByDate(date) {
    return await this.collection.find({ date: date }).toArray();
  }
}