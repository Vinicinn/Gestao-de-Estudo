import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

import { connectToDatabase, client } from "./config/db.js";
import { getResponse } from "./config/groq.js";
import { authRoutes } from "./routes/authRoutes.js";
import { userRoutes } from "./routes/userRoutes.js";
import { resourceRoutes } from "./routes/resourceRoutes.js";
import { scheduleRoutes } from "./routes/scheduleRoutes.js";
import { feedbackRoutes } from "./routes/feedbackRoutes.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";
import { AuthController } from "./controllers/authController.js";
import { UserController } from "./controllers/userController.js";
import { ResourceController } from "./controllers/resourceController.js";
import { ScheduleController } from "./controllers/scheduleController.js";
import { FeedbackController } from "./controllers/feedbackController.js";
import { AuthService } from "./services/authService.js";
import { UserService } from "./services/userServices.js";
import { ResourceService } from "./services/resourceServices.js";
import { ScheduleService } from "./services/scheduleServices.js";
import { FeedbackService } from "./services/feedbackServices.js";
import { UserRepository } from "./repositories/userRepository.js";
import { ResourceRepository } from "./repositories/resourceRepository.js";
import { ScheduleRepository } from "./repositories/scheduleRepository.js";
import { FeedbackRepository } from "./repositories/feedbackRepository.js";

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
