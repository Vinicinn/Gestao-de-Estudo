import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export function authRoutes(authController) {
  const router = Router();

  router.post("/register", (req, res) => authController.register(req, res));
  router.post("/login", (req, res) => authController.login(req, res));
  router.get("/me", authMiddleware, (req, res) => authController.me(req, res));

  return router;
}
