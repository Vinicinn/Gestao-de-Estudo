import { BaseRepository } from "../../../core/baseRepository.js";

export class ScheduleRepository extends BaseRepository {
  constructor(database) {
    super(database, "schedules");
  }
}
