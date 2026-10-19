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

  const items = [
    {
      id: 2,
      name: "Medical Herbs",
      description: "Natural herbs that help restore health.",
    },
    {
      id: 3,
      name: "Iron Sword",
      description: "A sharp metal weapon used for combat.",
    },
  ];

  const points = [];

  for (const item of items) {
    const result = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: item.description,
    });

    const vector = result.embeddings?.[0]?.values;

    if (!vector || vector.length !== 3072) {
      throw new Error(`Invalid embedding for ${item.name}`);
    }

    points.push({
      id: item.id,
      vector,
      payload: {
        name: item.name,
        description: item.description,
      },
    });
  }

  const response = await fetch(
    `${url.replace(/\/$/, "")}/collections/game_items/points?wait=true`,
    {
      method: "PUT",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ points }),
    },
  );

  if (!response.ok) {
    throw new Error(`Qdrant HTTP error: ${response.status}`);
  }

  console.log(await response.json());
}

main().catch(console.error);
