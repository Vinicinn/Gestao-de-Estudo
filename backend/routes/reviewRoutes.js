import { Router } from "express";

export function reviewRoutes(reviewController) {
  const router = Router();

  router.get("/", (req, res) => reviewController.getAllReviews(req, res));
  router.get("/date/:date", (req, res) => reviewController.getReviewsByDate(req, res));

  return router;
}