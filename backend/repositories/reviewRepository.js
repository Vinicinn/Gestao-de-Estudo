// Repository para operações com revisões
import { ObjectId } from "mongodb";

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

  async findSchedulesByUserId(userId) {
    return await this.collection
      .find({ userId, type: "schedule" })
      .toArray();
  }

  async findCompletedReviews(contentId) {
    return await this.collection
      .find({ 
        contentId, 
        type: "completed_review" 
      })
      .toArray();
  }

  async findByQuery(query) {
    return await this.collection.find(query).toArray();
  }

  async findUserCompletedReviewsByDate(userId, date) {
    return await this.collection
      .find({ 
        userId, 
        reviewDate: date,
        type: "completed_review" 
      })
      .toArray();
  }

  async getReviewStats(userId) {
    return await this.collection
      .aggregate([
        { $match: { userId, type: "completed_review" } },
        { $group: { 
            _id: "$contentId", 
            count: { $sum: 1 },
            lastReview: { $max: "$reviewDate" }
          }
        }
      ])
      .toArray();
  }
}
