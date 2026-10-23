import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function main(): Promise<void> {
  const models = await ai.models.list();

  // 列出google LLM模型
  for await (const model of models) {
    console.log(model.name, model.supportedActions?.join(", "));
  }
}

main().catch(console.error);
