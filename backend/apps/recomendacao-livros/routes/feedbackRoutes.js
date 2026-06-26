import { Router } from "express";

export function feedbackRoutes(feedbackController) {
  const router = Router();

  router.get("/", (req, res) => feedbackController.getUserFeedbacks(req, res));
  router.get("/summary", (req, res) => feedbackController.getSummary(req, res));
  router.get("/type/:type", (req, res) => feedbackController.getByType(req, res));
  router.post("/", (req, res) => feedbackController.createFeedback(req, res));
  router.delete("/:id", (req, res) => feedbackController.deleteFeedback(req, res));

  return router;
}