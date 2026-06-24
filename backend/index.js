import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

import { connectToDatabase, client } from "./core/config/db.js";
import { getResponse } from "./core/config/groq.js";
import { authRoutes } from "./core/auth/authRoutes.js";
import { userRoutes } from "./core/user/userRoutes.js";
import { resourceRoutes } from "./apps/gestao-estudos/routes/resourceRoutes.js";
import { scheduleRoutes } from "./apps/gestao-estudos/routes/scheduleRoutes.js";
import { feedbackRoutes } from "./apps/gestao-estudos/routes/feedbackRoutes.js";
import { authMiddleware } from "./core/auth/authMiddleware.js";
import { AuthController } from "./core/auth/authController.js";
import { UserController } from "./core/user/userController.js";
import { ResourceController } from "./apps/gestao-estudos/controllers/resourceController.js";
import { ScheduleController } from "./apps/gestao-estudos/controllers/scheduleController.js";
import { FeedbackController } from "./apps/gestao-estudos/controllers/feedbackController.js";
import { AuthService } from "./core/auth/authService.js";
import { UserService } from "./core/user/userServices.js";
import { ResourceService } from "./apps/gestao-estudos/services/resourceServices.js";
import { ScheduleService } from "./apps/gestao-estudos/services/scheduleServices.js";
import { FeedbackService } from "./apps/gestao-estudos/services/feedbackServices.js";
import { UserRepository } from "./core/user/userRepository.js";
import { ResourceRepository } from "./apps/gestao-estudos/repositories/resourceRepository.js";
import { ScheduleRepository } from "./apps/gestao-estudos/repositories/scheduleRepository.js";
import { FeedbackRepository } from "./apps/gestao-estudos/repositories/feedbackRepository.js";

await connectToDatabase();
const db = client.db("gestaoEstudos");

const userRepository = new UserRepository(db);
const userService = new UserService(userRepository);
const userController = new UserController(userService);
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

const resourceRepository = new ResourceRepository(db);
const resourceService = new ResourceService(resourceRepository, getResponse);
const resourceController = new ResourceController(resourceService);

const scheduleRepository = new ScheduleRepository(db);
const scheduleService = new ScheduleService(scheduleRepository, resourceRepository);
const scheduleController = new ScheduleController(scheduleService);

const feedbackRepository = new FeedbackRepository(db);
const feedbackService = new FeedbackService(
  feedbackRepository,
  resourceRepository,
  scheduleRepository,
);
const feedbackController = new FeedbackController(feedbackService);

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes(authController));
app.use("/api/users", authMiddleware, userRoutes(userController));
app.use("/api/resources", authMiddleware, resourceRoutes(resourceController));
app.use("/api/schedules", authMiddleware, scheduleRoutes(scheduleController));
app.use("/api/feedback", authMiddleware, feedbackRoutes(feedbackController));

app.use((req, res) => {
  res.status(404).json({ mensagem: "Rota nao encontrada." });
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT}`);
});
