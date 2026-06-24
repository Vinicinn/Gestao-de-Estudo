import { Groq } from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function getResponse(prompt) {
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "Responda apenas em JSON válido",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama-3.1-8b-instant",
    temperature: 1,
    max_completion_tokens: 1024,
    top_p: 1,
    stream: false,
    stop: null,
  });

  return chatCompletion.choices[0].message.content;
}
