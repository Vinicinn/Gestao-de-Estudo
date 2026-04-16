import { Router } from "express";

export function contentRoutes(contentController) {
  const router = Router();

  router.get("/", (req, res) => contentController.getAllContents(req, res));
  router.get("/user/:id", (req, res) => contentController.getAllUserContents(req, res));
  router.get("/user/:id/recommendations", (req, res) => contentController.getUserRecommendations(req, res));
  router.post("/", (req, res) => contentController.createContent(req, res));
  router.get("/:id", (req, res) => contentController.getContentById(req, res));
  router.post("/:id/feedback", (req, res) => contentController.submitContentFeedback(req, res));
  router.put("/:id", (req, res) => contentController.updateContent(req, res));
  router.put("/:id/review-dates", (req, res) => contentController.updateReviewDates(req, res));
  router.get("/:id/review-info", (req, res) => contentController.getReviewDatesInfo(req, res));
  router.delete("/:id", (req, res) => contentController.deleteContent(req, res));

  return router;
}
