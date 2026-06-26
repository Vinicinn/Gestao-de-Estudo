import { Router } from "express";
import { getDatabase } from "../../core/config/db.js";
import { getResponse } from "../../core/config/groq.js";
import { authRoutes } from "../../core/auth/authRoutes.js";
import { authMiddleware } from "../../core/auth/authMiddleware.js";
import { AuthController } from "../../core/auth/authController.js";
import { AuthService } from "../../core/auth/authService.js";
import { userRoutes } from "../../core/user/userRoutes.js";
import { UserController } from "../../core/user/userController.js";
import { UserService } from "../../core/user/userServices.js";
import { UserRepository } from "../../core/user/userRepository.js";
import { ResourceController } from "./controllers/resourceController.js";
import { ScheduleController } from "./controllers/scheduleController.js";
import { FeedbackController } from "./controllers/feedbackController.js";
import { ResourceService } from "./services/resourceServices.js";
import { ScheduleService } from "./services/scheduleServices.js";
import { FeedbackService } from "./services/feedbackServices.js";
import { ResourceRepository } from "./repositories/resourceRepository.js";
import { ScheduleRepository } from "./repositories/scheduleRepository.js";
import { FeedbackRepository } from "./repositories/feedbackRepository.js";
import { resourceRoutes } from "./routes/resourceRoutes.js";
import { scheduleRoutes } from "./routes/scheduleRoutes.js";
import { feedbackRoutes } from "./routes/feedbackRoutes.js";

export async function recomendacaoLivrosApp() {
  const database = await getDatabase("recomendacaoLivros");

  const userRepository = new UserRepository(database);
  const userService = new UserService(userRepository);
  const userController = new UserController(userService);
  const authService = new AuthService(userRepository);
  const authController = new AuthController(authService);

  const feedbackRepository = new FeedbackRepository(database);
  const scheduleRepository = new ScheduleRepository(database);
  const resourceRepository = new ResourceRepository(database);

  const resourceService = new ResourceService(
    resourceRepository,
    scheduleRepository,
    feedbackRepository,
    getResponse,
  );
  const scheduleService = new ScheduleService(scheduleRepository, feedbackRepository);
  const feedbackService = new FeedbackService(feedbackRepository, resourceRepository);

  const resourceController = new ResourceController(resourceService);
  const scheduleController = new ScheduleController(scheduleService);
  const feedbackController = new FeedbackController(feedbackService);

  const router = Router();

  router.use("/auth", authRoutes(authController));
  router.use("/users", authMiddleware, userRoutes(userController));
  router.use("/books", authMiddleware, resourceRoutes(resourceController));
  router.use("/preferences", authMiddleware, scheduleRoutes(scheduleController));
  router.use("/history", authMiddleware, feedbackRoutes(feedbackController));

  return router;
}