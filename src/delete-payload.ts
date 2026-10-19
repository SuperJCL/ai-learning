import "dotenv/config";

async function main(): Promise<void> {
  const url = process.env.QDRANT_URL;
  const apiKey = process.env.QDRANT_API_KEY;

  if (!url || !apiKey) {
    throw new Error("Missing Qdrant environment variables");
  }

  const response = await fetch(
    `${url.replace(/\/$/, "")}/collections/game_items/points/payload/delete?wait=true`,
    {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        points: [2],
        keys: ["type"],
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Qdrant HTTP error: ${response.status}\n${await response.text()}`,
    );
  }

  console.log(await response.json());
}

main().catch(console.error);
