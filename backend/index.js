import express from "express";
import dotenv from "dotenv";
import cors from "cors";
// variaveis de ambiente
dotenv.config();

import { connectToDatabase, client } from "./config/db.js";
import { userRoutes } from "./routes/userRoutes.js";
import { contentRoutes } from "./routes/contentRoutes.js";
import { reviewRoutes } from "./routes/reviewRoutes.js";
import { UserController } from "./controllers/userController.js";
import { ContentController } from "./controllers/contentController.js";
import { ReviewController } from "./controllers/reviewController.js";
import { UserService } from "./services/userServices.js";
import { ContentService } from "./services/contentServices.js";
import { ReviewService } from "./services/reviewServices.js";
import { UserRepository } from "./repositories/userRepository.js";
import { ContentRepository } from "./repositories/contentRepository.js";
import { ReviewRepository } from "./repositories/reviewRepository.js";

// banco de dados
await connectToDatabase();
const db = client.db("gestaoEstudos");

// instanciando camadas de usuario
const userRepository = new UserRepository(db);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

// instanciando camadas de conteudos
const contentRepository = new ContentRepository(db);
const contentService = new ContentService(contentRepository);
const contentController = new ContentController(contentService);

// instanciando camadas de revisoes
const reviewRepository = new ReviewRepository(db);
const reviewService = new ReviewService(reviewRepository);
const reviewController = new ReviewController(reviewService);

const app = express();
app.use(cors());
app.use(express.json());

// rotas
app.use("/api/users", userRoutes(userController));
app.use("/api/contents", contentRoutes(contentController));
app.use("/api/reviews", reviewRoutes(reviewController));

// qualquer outra rota nao definida
app.use((req, res) => {
  res.status(404).json({ mensagem: "Rota não encontrada." });
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT}`);
});
