import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function main(): Promise<void> {
  const url = process.env.QDRANT_URL;
  const apiKey = process.env.QDRANT_API_KEY;

  if (!url || !apiKey) {
    throw new Error("Missing Qdrant environment variables");
  }

  const description = "A potion that restores health.";

  const embeddingResponse = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: description,
  });

  const vector = embeddingResponse.embeddings?.[0]?.values;

  if (!vector || vector.length !== 3072) {
    throw new Error("Invalid embedding vector");
  }

  const response = await fetch(
    `${url.replace(/\/$/, "")}/collections/game_items/points?wait=true`,
    {
      method: "PUT",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        points: [
          {
            id: 1,
            vector,
            payload: {
              name: "Healing Potion",
              description,
              type: "Consumable",
            },
          },
        ],
      }),
    },
  );

  const data = await response.json();
  console.log(data);

  if (!response.ok) {
    throw new Error(`Qdrant HTTP error: ${response.status}`);
  }
}

main().catch(console.error);
