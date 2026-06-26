import { Router } from "express";

export function resourceRoutes(resourceController) {
  const router = Router();

  router.get("/", (req, res) => resourceController.getUserResources(req, res));
  router.get("/reading-list", (req, res) => resourceController.getReadingList(req, res));
  router.get("/read", (req, res) => resourceController.getReadBooks(req, res));
  router.get("/favorites", (req, res) => resourceController.getFavorites(req, res));
  router.get("/recommendations", (req, res) => resourceController.getRecommendations(req, res));
  router.get("/:id", (req, res) => resourceController.getResourceById(req, res));

  router.post("/", (req, res) => resourceController.createResource(req, res));

  router.put("/:id", (req, res) => resourceController.updateResource(req, res));
  router.put("/:id/read", (req, res) => resourceController.markAsRead(req, res));
  router.put("/:id/abandon", (req, res) => resourceController.abandonReading(req, res));
  router.put("/:id/favorite", (req, res) => resourceController.setFavorite(req, res));
  router.put("/:id/review", (req, res) => resourceController.addReview(req, res));

  router.delete("/:id", (req, res) => resourceController.deleteResource(req, res));

  return router;
}