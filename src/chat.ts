import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

//创建客户端
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function main(): Promise<void> {
  //发送prompt请求
  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: "Explain what an LLM is in simple English.",
  });
  //读取生成结果
  console.log(response.text);
}

main().catch(console.error);
