import express from "express";
import { connectToDatabase } from "./config/db.js";
import dotenv from "dotenv";

dotenv.config(); // variaveis de ambiente
connectToDatabase(); // banco de dados

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT}`);
});
