import "dotenv/config";
import { GoogleGenAI, Content } from "@google/genai";
import { getPlayerState, getInventory, searchGameItems } from "./tools";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function main(): Promise<void> {
  const question = "根据我当前的状态和背包，我该如何准备下一场战斗？";

  const contents: Content[] = [{ role: "user", parts: [{ text: question }] }];

  const maxTurns = 5;

  for (let turn = 1; turn <= maxTurns; turn++) {
    console.log(`\n第 ${turn} 轮模型请求`);

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents,
      config: {
        systemInstruction: `
            你是游戏物品顾问。
            简单问候可以直接回答。
            需要玩家当前状态时，调用状态工具。
            需要确认玩家拥有哪些物品时，调用背包工具。
            需要物品用途资料时，调用搜索工具。
            不要把数据库中的物品当作玩家已拥有的物品。
            不要编造工具未提供的数值，也不要声称已经使用物品。
            对建议中涉及的每种具体物品，分别查询其资料后再说明用途。
            不要仅根据物品名称推测用途。
            工具未提供战斗胜率、装备状态、伤害加成或具体治疗数值时，
            不要将这些信息描述为已知事实；需要时说明资料不足。
            建议执行某个动作，不等于已经执行该动作。
        `,
        tools: [
          {
            functionDeclarations: [
              {
                name: "getPlayerState",
                description: "获取玩家当前生命值 hp 和最大生命值 maxHp。",
              },
              {
                name: "getInventory",
                description: "查询玩家背包中的物品名称和数量。",
              },
              {
                name: "searchGameItems",
                description:
                  "根据自然语言搜索游戏物品资料，返回相关物品及描述。",
                parametersJsonSchema: {
                  type: "object",
                  properties: {
                    query: {
                      type: "string",
                      description: "描述所需物品或用途的搜索文本。",
                    },
                  },
                  required: ["query"],
                },
              },
            ],
          },
        ],
      },
    });

    const calls = response.functionCalls ?? [];

    if (calls.length === 0) {
      console.log("最终回答：");
      console.log(response.text);
      return;
    }

    const modelContent = response.candidates?.[0]?.content;

    if (!modelContent) {
      throw new Error("Missing model response content");
    }

    contents.push(modelContent);

    const toolResponses = await Promise.all(
      calls.map(async (call) => {
        console.log("执行工具：", call.name);
        console.log("工具参数：", call.args);

        let result: Record<string, unknown>;

        if (call.name === "getPlayerState") {
          result = getPlayerState();
        } else if (call.name === "getInventory") {
          result = getInventory();
        } else if (call.name === "searchGameItems") {
          const query = call.args?.query;

          if (typeof query !== "string" || !query.trim()) {
            throw new Error("searchGameItems requires a non-empty query");
          }

          const items = await searchGameItems(query);
          result = { items };
        } else {
          throw new Error(`Unknown tool: ${call.name}`);
        }

        console.log("工具结果：", JSON.stringify(result, null, 2));

        return {
          functionResponse: {
            id: call.id,
            name: call.name,
            response: result,
          },
        };
      }),
    );

    contents.push({ role: "user", parts: toolResponses });
  }

  throw new Error("已达到最大模型请求轮数，停止执行。");
}

main().catch(console.error);
