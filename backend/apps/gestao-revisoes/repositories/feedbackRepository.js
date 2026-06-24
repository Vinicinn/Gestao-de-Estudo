import { BaseRepository } from "../../../core/baseRepository.js";

export class FeedbackRepository extends BaseRepository {
  constructor(database) {
    super(database, "feedbacks");
  }
}
