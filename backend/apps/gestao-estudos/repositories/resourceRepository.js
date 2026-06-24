import { BaseRepository } from "../../../core/baseRepository.js";

export class ResourceRepository extends BaseRepository {
  constructor(database) {
    super(database, "resources");
  }
}
