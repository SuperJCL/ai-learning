import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { cosineSimilarity } from "./similarity";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function main(): Promise<void> {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: [
      "I need something to heal myself.",
      "A potion that restores health.",
      "The weather is sunny today.",
    ],
  });
  const vectorA = response.embeddings?.[0]?.values;
  const vectorB = response.embeddings?.[1]?.values;

  if (!vectorA || !vectorB) {
    throw new Error("Failed to generate embeddings");
  }

  const similarity = cosineSimilarity(vectorA, vectorB);
  const vectorC = response.embeddings?.[2]?.values;

  if (!vectorC) {
    throw new Error("Failed to generate third embedding");
  }

  console.log("Similarity A-B:", cosineSimilarity(vectorA, vectorB));

  console.log("Similarity A-C:", cosineSimilarity(vectorA, vectorC));

  console.log("Cosine Similarity:", similarity);

  const rankedResults = [
    {
      name: "Healing Potion",
      similarity: cosineSimilarity(vectorA, vectorB),
    },
    {
      name: "Sunny Weather",
      similarity: cosineSimilarity(vectorA, vectorC),
    },
  ];

  rankedResults.sort((a, b) => b.similarity - a.similarity);

  console.log("Ranked results:", rankedResults);

  //   const vector = response.embeddings?.[0]?.values;

  //   console.log("Number of embeddings:", response.embeddings?.length);

  //   console.log(
  //     "First vector dimension:",
  //     response.embeddings?.[0]?.values?.length,
  //   );

  //   console.log(
  //     "Second vector dimension:",
  //     response.embeddings?.[1]?.values?.length,
  //   );
}

main().catch(console.error);
