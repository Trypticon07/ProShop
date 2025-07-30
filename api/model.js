import fetch from "node-fetch";
import readlineSync from "readline-sync";
import fs from "fs/promises";

const systemInstructions = await fs.readFile("instructions.txt", "utf-8");

const messages = [{ role: "system", content: systemInstructions }];

export async function sendMessage(userInput) {
  messages.push({ role: "user", content: userInput });

  const response = await fetch("http://192.168.0.182:5000/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  const raw = await response.text();
  const data = JSON.parse(raw);

  const modelReply = data.response.trim();
  //console.log("\nModel:\n" + modelReply);
  console.log(messages);
  messages.push({ role: "assistant", content: modelReply });
  return modelReply;
}

// async function main(input) {
//   while (true) {
//     //const input = readlineSync.question("\nYou: ");
//     if (input.toLowerCase() === "exit") break;
//     //await sendMessage(input);
//   }
// }

// main();
