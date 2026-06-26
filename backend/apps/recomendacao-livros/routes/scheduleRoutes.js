import { Router } from "express";

export function scheduleRoutes(scheduleController) {
  const router = Router();

  router.get("/", (req, res) => scheduleController.getUserSchedules(req, res));
  router.put("/", (req, res) => scheduleController.updateSchedule(req, res));

  return router;
}