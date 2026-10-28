import { searchGameItems } from "./tools";

async function main(): Promise<void> {
  const items = await searchGameItems("items that restore health");
  console.log(JSON.stringify(items, null, 2));
}

main().catch(console.error);
