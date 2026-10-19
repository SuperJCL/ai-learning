import "dotenv/config";

async function main(): Promise<void> {
  const url = process.env.QDRANT_URL;
  const apiKey = process.env.QDRANT_API_KEY;

  if (!url || !apiKey) {
    throw new Error("Missing Qdrant environment variables");
  }

  const response = await fetch(
    `${url.replace(/\/$/, "")}/collections/game_items/points/count`,
    {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        exact: true,
        filter: {
          must: [
            {
              key: "type",
              match: {
                value: "Consumable",
              },
            },
          ],
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Qdrant HTTP error: ${response.status}\n${await response.text()}`,
    );
  }

  const data = await response.json();
  console.log("Total items:", data.result?.count);
}

main().catch(console.error);
