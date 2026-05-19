import { ObjectId } from "mongodb";

export class FeedbackRepository {
  constructor(database) {
    this.reviewFeedbackCollection = database.collection("reviewFeedbacks");
    this.scheduleFeedbackCollection = database.collection("scheduleFeedbacks");
  }

  async createReviewFeedback(feedback) {
    return await this.reviewFeedbackCollection.insertOne(feedback);
  }

  async findReviewFeedbackByUserId(userId, filters = {}) {
    const query = { userId };

    if (filters.subject) {
      query.subject = filters.subject;
    }

    if (filters.from || filters.to) {
      query.createdAt = {};

      if (filters.from) {
        query.createdAt.$gte = filters.from;
      }
      if (filters.to) {
        query.createdAt.$lte = filters.to;
      }
    }

    return await this.reviewFeedbackCollection.find(query).toArray();
  }

  async findReviewFeedbackByQuery(query) {
    return await this.reviewFeedbackCollection.find(query).toArray();
  }


  async findReviewFeedbackByUserContentAndDate(userId, contentId, reviewDate) {
    return await this.reviewFeedbackCollection.findOne({
      userId,
      contentId: new ObjectId(contentId),
      reviewDate,
      feedbackType: "review",
    });
  }

  async deleteReviewFeedbackByUserContentAndDate(userId, contentId, reviewDate) {
    return await this.reviewFeedbackCollection.deleteMany({
      userId,
      contentId: new ObjectId(contentId),
      reviewDate,
      feedbackType: "review",
    });
  }

  async deleteReviewFeedbackByContentId(contentId) {
    let query;
    // Se contentId é uma string válida, converte para ObjectId
    if (typeof contentId === 'string' && ObjectId.isValid(contentId)) {
      query = {
        contentId: new ObjectId(contentId),
        feedbackType: "review"
      };
    } else {
      // Se já é ObjectId, usa diretamente
      query = {
        contentId: contentId,
        feedbackType: "review"
      };
    }
    
    const result = await this.reviewFeedbackCollection.deleteMany(query);
    console.log(`[FeedbackRepository] Deletados ${result.deletedCount} feedbacks com contentId ${contentId}`);
    return result;
  }

  async createScheduleFeedback(feedback) {
    return await this.scheduleFeedbackCollection.insertOne(feedback);
  }

  async findScheduleFeedbackByScheduleId(scheduleId) {
    return await this.scheduleFeedbackCollection.findOne({ scheduleId });
  }

  async deleteScheduleFeedbackByScheduleId(scheduleId) {
    return await this.scheduleFeedbackCollection.deleteMany({ scheduleId });
  }

  async createSkippedReview(skipped) {
    return await this.reviewFeedbackCollection.insertOne(skipped);
  }

  async findSkippedReviewsByUserId(userId) {
    return await this.reviewFeedbackCollection.find({ userId, skipped: true }).toArray();
  }

  async findSkippedReviewByUserContentAndDate(userId, contentId, reviewDate) {
    return await this.reviewFeedbackCollection.findOne({
      userId,
      contentId: new ObjectId(contentId),
      reviewDate,
      skipped: true,
    });
  }

}

