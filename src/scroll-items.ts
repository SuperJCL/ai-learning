import "dotenv/config";

async function main(): Promise<void> {
  const url = process.env.QDRANT_URL;
  const apiKey = process.env.QDRANT_API_KEY;

  if (!url || !apiKey) {
    throw new Error("Missing Qdrant environment variables");
  }

  const response = await fetch(
    `${url.replace(/\/$/, "")}/collections/game_items/points/scroll`,
    {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        limit: 2,
        offset: 3,
        with_payload: true,
        with_vector: false,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Qdrant HTTP error: ${response.status}\n${await response.text()}`,
    );
  }

  const data = await response.json();

  console.log("Points:", data.result?.points);
  console.log("Next offset:", data.result?.next_page_offset);
}

main().catch(console.error);
