import express from "express";
import dotenv from "dotenv";
// variaveis de ambiente
dotenv.config();

import { connectToDatabase } from "./config/db.js";
import { userRoutes } from "./routes/userRoutes.js";
import { UserController } from "./controllers/userController.js";
import { UserService } from "./services/userServices.js";
import { UserRepository } from "./repositories/userRepository.js";
import { client } from "./config/db.js";

// banco de dados
await connectToDatabase();

const User_Repository = new UserRepository(client.db("gestaoEstudos"));
const User_Service = new UserService(User_Repository);
const User_Controller = new UserController(User_Service);

const app = express();
app.use(express.json());

// rotas de usuario
app.use("/api/users", userRoutes(User_Controller));

// qualquer outra rota nao definida
app.use((req, res) => {
  res.status(404).json({ mensagem: "Rota não encontrada." });
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT}`);
});
