import { Router } from "express";

export function reviewRoutes(reviewController) {
  const router = Router();

  router.get("/", (req, res) => reviewController.getAllReviews(req, res));
  router.post("/schedule", (req, res) => reviewController.createReviewSchedule(req, res));
  router.get("/schedule/user/:id", (req, res) => reviewController.getUserSchedules(req, res));
  router.get("/date/:date", (req, res) => reviewController.getReviewsByDate(req, res));
  
  // Novos endpoints para registro completo de revisões
  router.post("/complete", (req, res) => reviewController.completeReview(req, res));
  router.get("/history/:contentId", (req, res) => reviewController.getReviewHistory(req, res));
  router.get("/user/:userId/history", (req, res) => reviewController.getUserReviewHistory(req, res));

  return router;
}
