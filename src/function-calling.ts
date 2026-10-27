import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { getPlayerState } from "./tools";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function main(): Promise<void> {
  const question = "我现在的生命值是多少？请先查询玩家状态。";
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: question,
    config: {
      // 本次生成请求的配置
      tools: [
        // 提供给模型的工具列表
        {
          functionDeclarations: [
            // 工具的说明书
            {
              name: "getPlayerState",
              description: "获取玩家当前生命值 hp 和最大生命值 maxHp。",
            },
          ],
        },
      ],
    },
  });

  console.log("工具调用请求：");
  console.log(JSON.stringify(response.functionCalls, null, 2));

  const toolResponses = (response.functionCalls ?? []).map((call) => {
    if (call.name !== "getPlayerState") {
      throw new Error(`Unknown tool: ${call.name}`);
    }

    const result = getPlayerState();
    console.log("工具执行结果：", result);

    return {
      functionResponse: {
        id: call.id,
        name: call.name,
        response: result,
      },
    };
  });

  if (toolResponses.length === 0) {
    console.log("模型没有请求工具调用。");
    return;
  }

  const modelContent = response.candidates?.[0]?.content;

  if (!modelContent) {
    throw new Error("Missing model response content");
  }

  const finalResponse = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: [
      { role: "user", parts: [{ text: question }] },
      modelContent,
      { role: "user", parts: toolResponses },
    ],
  });

  console.log("最终回答：");
  console.log(finalResponse.text);
}

main().catch(console.error);
