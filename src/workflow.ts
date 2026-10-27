import { answerQuestion } from "./rag";

type Scene = "heal" | "battle";

function chooseScene(hp: number): Scene {
  if (hp <= 30) {
    return "heal";
  }

  return "battle";
}

async function main(): Promise<void> {
  const hp = 80;
  const scene = chooseScene(hp);

  const question =
    scene === "heal"
      ? "I am injured after a battle. What can help me heal?"
      : "I need a weapon to attack enemies.";

  console.log(`HP ${hp} → ${scene}`);

  const answer = await answerQuestion(question);
  console.log("\n物品顾问：");
  console.log(answer);
}

main().catch(console.error);
