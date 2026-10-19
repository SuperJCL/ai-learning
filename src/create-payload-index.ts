import "dotenv/config";

async function main(): Promise<void> {
  const url = process.env.QDRANT_URL;
  const apiKey = process.env.QDRANT_API_KEY;

  if (!url || !apiKey) {
    throw new Error("Missing Qdrant environment variables");
  }

  const response = await fetch(
    `${url.replace(/\/$/, "")}/collections/game_items/index?wait=true`,
    {
      method: "PUT",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        field_name: "name",
        field_schema: "keyword",
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
