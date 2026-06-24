import { Router } from "express";

export function scheduleRoutes(scheduleController) {
  const router = Router();

  router.get("/", (req, res) => scheduleController.getUserSchedules(req, res));
  router.post("/", (req, res) => scheduleController.createSchedule(req, res));
  router.put("/:id", (req, res) => scheduleController.updateSchedule(req, res));
  router.put("/:id/status", (req, res) => scheduleController.updateStatus(req, res));
  router.delete("/:id", (req, res) => scheduleController.deleteSchedule(req, res));

  return router;
}
