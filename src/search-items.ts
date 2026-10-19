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

  const query = "I need something to heal myself.";

  const embeddingResponse = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: query,
  });

  const vector = embeddingResponse.embeddings?.[0]?.values;

  if (!vector || vector.length !== 3072) {
    throw new Error("Invalid query embedding");
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
        filter: {
          must: [
            {
              key: "type",
              match: {
                value: "Consumable",
              },
            },
            {
              should: [
                {
                  key: "name",
                  match: {
                    value: "Healing Potion",
                  },
                },
                {
                  key: "name",
                  match: {
                    value: "Medical Herbs",
                  },
                },
              ],
            },
          ],
        },
      }),
    },
  );

  if (!response.ok) {
    const errorDetails = await response.text();

    throw new Error(`Qdrant HTTP error: ${response.status}\n${errorDetails}`);
  }

  const data = await response.json();

  const points = data.result?.points ?? [];

  if (points.length === 0) {
    console.log("No matching items found.");
  } else {
    console.log(JSON.stringify(points, null, 2));
  }
}

main().catch(console.error);
