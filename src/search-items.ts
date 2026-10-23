import { answerQuestion } from "./rag";

async function main(): Promise<void> {
  const query = process.argv[2];

  if (!query?.trim()) {
    console.log("Please enter a question.");
    return;
  }

  const answer = await answerQuestion(query);
  console.log("Answer:\n" + answer);
}

main().catch(console.error);
