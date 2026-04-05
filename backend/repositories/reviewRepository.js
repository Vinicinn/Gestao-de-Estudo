// Repository para operações com revisões
export class ReviewRepository {
  constructor(database) {
    this.collection = database.collection("reviews");
  }

  async findAll() {
    return await this.collection.find().toArray();
  }

  async createReview(review) {
    await this.collection.insertOne(review);
  }

  async findByDate(date) {
    return await this.collection.find({ reviewDate: date }).toArray();
  }
}