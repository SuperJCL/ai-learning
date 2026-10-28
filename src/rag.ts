import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

type GameItemPoint = {
  score: number;
  payload: {
    name: string;
    description: string;
  };
};

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

//构建上下文信息函数
function buildContext(points: GameItemPoint[]): string {
  return points
    .map((point) => `${point.payload.name}: ${point.payload.description}`)
    .join("\n");
}
// 构建提示词函数
function buildPrompt(query: string, context: string): string {
  return `
  你是一个游戏物品助手。
  请仅根据参考资料推荐物品，并简要说明理由。
  如果资料不足，请明确说明，不要编造物品或效果。

  参考资料：
  ${context}

  玩家问题：
  ${query}
`;
}

//让生成函数返回回答
async function generateAnswer(prompt: string): Promise<string | undefined> {
  // 将原来的 const maxAttempts = 3;
  // 以及整个 for 重试循环移到这里
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const answer = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
      });
      return answer.text;
    } catch (error) {
      //错误抛出处理
      const is503 =
        error instanceof Error && "status" in error && error.status === 503;

      if (!is503 || attempt === maxAttempts) {
        throw error;
      }

      const delayMs = 2000 * 2 ** (attempt - 1);

      console.log(`Gemini 暂时繁忙，${delayMs / 1000} 秒后重试……`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

//问题文本 → 查询向量
async function embedQuery(query: string): Promise<number[]> {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: query,
  });

  const vector = response.embeddings?.[0]?.values;

  if (!vector || vector.length !== 3072) {
    throw new Error("Invalid query embedding");
  }

  return vector;
}
//查询向量 → Qdrant 物品结果
async function searchItems(vector: number[]): Promise<GameItemPoint[]> {
  const url = process.env.QDRANT_URL;
  const apiKey = process.env.QDRANT_API_KEY;

  if (!url || !apiKey) {
    throw new Error("Missing Qdrant environment variables");
  }

  const response = await fetch(
    `${url.replace(/\/$/, "")}/collections/game_items/points/query`,
    {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: vector,
        limit: 5,
        with_payload: true,
        score_threshold: 0.65,
      }),
    },
  );

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error(`Qdrant HTTP error: ${response.status}\n${errorDetails}`);
  }

  const data = await response.json();
  const points: GameItemPoint[] = data.result?.points ?? [];

  return points;
}

//问题 → 回答
export async function answerQuestion(
  query: string,
): Promise<string | undefined> {
  const vector = await embedQuery(query);
  const points = await searchItems(vector);

  if (points.length === 0) {
    return "No matching items found.";
  }

  console.table(
    points.map((point) => ({
      name: point.payload.name,
      score: point.score,
    })),
  );

  const context = buildContext(points);
  console.log("Context:\n" + context);

  const prompt = buildPrompt(query, context);
  console.log("Prompt:\n" + prompt);

  return await generateAnswer(prompt);
}

export async function searchGameItems(query: string): Promise<GameItemPoint[]> {
  const vector = await embedQuery(query);
  return await searchItems(vector);
}
