import fetch from "node-fetch";
import readlineSync from "readline-sync";

const messages = [{ role: "system", content: "You are a friendly assistant" }];

async function sendMessage(userInput) {
  messages.push({ role: "user", content: userInput });

  const response = await fetch("http://localhost:5000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  const raw = await response.text();
  const data = JSON.parse(raw);

  const modelReply = data.response.trim();
  console.log("\nModel:\n" + modelReply);

  messages.push({ role: "assistant", content: modelReply });
}

async function main() {
  while (true) {
    const input = readlineSync.question("\nYou: ");
    if (input.toLowerCase() === "exit") break;
    await sendMessage(input);
  }
}

main();
