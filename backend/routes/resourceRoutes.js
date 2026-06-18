import { Router } from "express";

export function resourceRoutes(resourceController) {
  const router = Router();

  router.get("/", (req, res) => resourceController.getUserResources(req, res));
  router.get("/recommendations", (req, res) => resourceController.getRecommendations(req, res));
  router.get("/:id", (req, res) => resourceController.getResourceById(req, res));

  router.post("/", (req, res) => resourceController.createResource(req, res));

  router.put("/:id", (req, res) => resourceController.updateResource(req, res));
  router.put("/:id/manual-schedule", (req, res) => resourceController.setManualSchedule(req, res));

  router.delete("/:id", (req, res) => resourceController.deleteResource(req, res));

  return router;
}
