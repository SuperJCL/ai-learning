import { answerQuestion } from "./rag";

async function main(): Promise<void> {
  const scene = process.argv[2];

  let question: string;

  if (scene === "heal") {
    console.log("你受伤后回到营地，向物品顾问寻求治疗建议。");
    question = "I am injured after a battle. What can help me heal?";
  } else if (scene === "battle") {
    console.log("你即将迎战敌人，向物品顾问寻求武器建议。");
    question = "I need a weapon to attack enemies.";
  } else {
    console.log("请选择场景：heal 或 battle");
    return;
  }

  const answer = await answerQuestion(question);

  console.log("\n物品顾问：");
  console.log(answer);
}

main().catch(console.error);
