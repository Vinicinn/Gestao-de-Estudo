import { Router } from "express";

export function reviewRoutes(reviewController) {
  const router = Router();

  router.get("/", (req, res) => reviewController.getAllReviews(req, res));
  router.get("/schedule/user/:id", (req, res) => reviewController.getUserSchedules(req, res));
  router.get("/date/:date", (req, res) => reviewController.getReviewsByDate(req, res));
  router.get("/history/:contentId", (req, res) => reviewController.getReviewHistory(req, res));
  router.get("/user/:userId/history", (req, res) => reviewController.getUserReviewHistory(req, res));
  
  router.post("/complete", (req, res) => reviewController.completeReview(req, res));
  router.post("/schedule", (req, res) => reviewController.createReviewSchedule(req, res));

  router.put("/schedule/:id/complete", (req, res) => reviewController.completeSchedule(req, res));
  router.put("/schedule/:id/uncomplete", (req, res) => reviewController.uncompleteSchedule(req, res));
  router.put("/schedule/:id/skip", (req, res) => reviewController.skipSchedule(req, res));

  router.delete("/complete/:id", (req, res) => reviewController.uncompleteReview(req, res));
  router.delete("/all", (req, res) => reviewController.deleteAllReviews(req,res));
  router.delete("/schedule/:id", (req, res) => reviewController.deleteReviewSchedule(req, res));
  
  return router;
}
