import { Router } from "express";

export function scheduleRoutes(scheduleController) {
  const router = Router();

  router.get("/", (req, res) => scheduleController.getAllSchedules(req, res));
  router.post("/", (req, res) => scheduleController.createSchedule(req, res));
  router.get("/date/:date", (req, res) => scheduleController.getSchedulesByDate(req, res));

  return router;
}