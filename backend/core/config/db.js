import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

export const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let connected = false;

export async function connectToDatabase() {
  if (connected) {
    return;
  }

  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    connected = true;
    console.log("Banco de dados conectado com sucesso.");
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error);
    process.exit(1);
  }
}

export async function getDatabase(databaseName) {
  await connectToDatabase();
  return client.db(databaseName);
}
