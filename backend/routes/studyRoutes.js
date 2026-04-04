import { Router } from "express";

export function studyRoutes(studyController) {
  const router = Router();

  router.get("/", (req, res) => studyController.getAllStudies(req, res));
  router.post("/", (req, res) => studyController.createStudy(req, res));
  router.get("/total-hours", (req, res) => studyController.getTotalHours(req, res));

  return router;
}
