import { Router } from "express";

export function userRoutes(userController) {
  const router = Router();

  router.get("/me", (req, res) => userController.getCurrentUser(req, res));
  router.put("/me", (req, res) => userController.updateCurrentUser(req, res));
  router.delete("/me", (req, res) => userController.deleteCurrentUser(req, res));

  return router;
}
