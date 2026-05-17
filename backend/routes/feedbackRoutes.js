import { Router } from "express";

export function feedbackRoutes(feedbackController) {
  const router = Router();

  router.get("/review/user/:userId", (req, res) => feedbackController.getUserReviewFeedback(req, res));

  router.post("/review", (req, res) => feedbackController.createReviewFeedback(req, res));
  router.post("/schedule", (req, res) => feedbackController.createScheduleFeedback(req, res));

  router.delete("/review", (req, res) => feedbackController.deleteReviewFeedback(req, res));
  router.delete("/schedule/:scheduleId", (req, res) => feedbackController.deleteScheduleFeedback(req, res));

  router.post("/skip", (req, res) => feedbackController.createSkippedReview(req, res));
  router.get("/skip/user/:userId", (req, res) => feedbackController.getSkippedReviewsByUser(req, res));

  return router;
}
