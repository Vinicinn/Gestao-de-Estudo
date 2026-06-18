import express from "express";
import dotenv from "dotenv";
import cors from "cors";
// variaveis de ambiente
dotenv.config();

import { connectToDatabase, client } from "./config/db.js";
import { getResponse } from "./config/groq.js";
import { userRoutes } from "./routes/userRoutes.js";
import { authRoutes } from "./routes/authRoutes.js";
import { contentRoutes } from "./routes/contentRoutes.js";
import { reviewRoutes } from "./routes/reviewRoutes.js";
import { feedbackRoutes } from "./routes/feedbackRoutes.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";
import { AuthController } from "./controllers/authController.js";
import { UserController } from "./controllers/userController.js";
import { ContentController } from "./controllers/contentController.js";
import { ReviewController } from "./controllers/reviewController.js";
import { FeedbackController } from "./controllers/feedbackController.js";
import { AuthService } from "./services/authService.js";
import { UserService } from "./services/userServices.js";
import { ContentService } from "./services/contentServices.js";
import { ReviewService } from "./services/reviewServices.js";
import { FeedbackService } from "./services/feedbackServices.js";
import { UserRepository } from "./repositories/userRepository.js";
import { ContentRepository } from "./repositories/contentRepository.js";
import { ReviewRepository } from "./repositories/reviewRepository.js";
import { FeedbackRepository } from "./repositories/feedbackRepository.js";

// banco de dados
await connectToDatabase();
const db = client.db("gestaoEstudos");

// instanciando camadas de revisoes
const reviewRepository = new ReviewRepository(db);
const reviewService = new ReviewService(reviewRepository);
const reviewController = new ReviewController(reviewService);

// instanciando feedback repository antes de contentService para injeção de dependência
const feedbackRepository = new FeedbackRepository(db);

// instanciando camadas de conteudos
const contentRepository = new ContentRepository(db);
const contentService = new ContentService(contentRepository, getResponse, feedbackRepository);
const contentController = new ContentController(contentService);

// instanciando camadas de feedback (service e controller)
const feedbackService = new FeedbackService(
  feedbackRepository,
  reviewRepository,
  contentRepository,
  contentService,
);
const feedbackController = new FeedbackController(feedbackService);

// instanciando camadas de usuario
const userRepository = new UserRepository(db);
const userService = new UserService(userRepository);
const userController = new UserController(userService);
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

const app = express();
app.use(cors());
app.use(express.json());

// rotas
app.use("/api/auth", authRoutes(authController));
app.use("/api/users", authMiddleware, userRoutes(userController));
app.use("/api/contents", authMiddleware, contentRoutes(contentController));
app.use("/api/reviews", authMiddleware, reviewRoutes(reviewController));
app.use("/api/feedback", authMiddleware, feedbackRoutes(feedbackController));

// qualquer outra rota nao definida
app.use((req, res) => {
  res.status(404).json({ mensagem: "Rota não encontrada." });
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT}`);
});
