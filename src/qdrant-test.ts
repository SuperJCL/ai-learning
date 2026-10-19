import "dotenv/config";

async function main(): Promise<void> {
  const url = process.env.QDRANT_URL;
  const apiKey = process.env.QDRANT_API_KEY;

  if (!url || !apiKey) {
    throw new Error("Missing Qdrant environment variables");
  }

  const response = await fetch(`${url.replace(/\/$/, "")}/collections`, {
    headers: {
      "api-key": apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Qdrant HTTP error: ${response.status}`);
  }

  const data = await response.json();

  console.log("Connected to Qdrant!");
  console.log(data);
}

main().catch(console.error);
