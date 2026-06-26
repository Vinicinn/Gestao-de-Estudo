import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

import { gestaoEstudosApp } from "./apps/gestao-estudos/gestaoEstudosApp.js";
import { recomendacaoLivrosApp } from "./apps/recomendacao-livros/recomendacaoLivrosApp.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/gestao-estudos", await gestaoEstudosApp());
app.use("/api/recomendacao-livros", await recomendacaoLivrosApp());

app.use((req, res) => {
  res.status(404).json({ mensagem: "Rota nao encontrada." });
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT}`);
});
