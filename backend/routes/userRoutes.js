import { Router } from "express";

export function userRoutes(userController) {
  const router = Router();

  router.get("/", (req, res) => userController.getAllUsers(req, res));
  router.post("/", (req, res) => userController.createUser(req, res));
  router.get("/:id", (req, res) => userController.getUserById(req, res));
  router.put("/:id", (req, res) => userController.updateUser(req, res));
  router.delete("/:id", (req, res) => userController.deleteUser(req, res));
  router.post("/login", (req, res) => userController.loginVerify(req, res));

  return router;
}
