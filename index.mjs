import deb from "./src/deb.mjs";

import pkg from 'template-file';
const { render, renderFile } = pkg;

import env from "dotenv";
env.config();

import fs from "fs";
import { rl, red, green, blue, purple } from "./src/utils.mjs";

const promptTemplate = fs.readFileSync("assets/templates/prompt.txt", "utf8");
const mergeTemplate = fs.readFileSync("assets/templates/merge.txt", "utf8");

import { tools } from "./src/tools.mjs";

// use GPT-3.5 to complete a given prompts
import completePrompt from "./src/ask-chatgpt.mjs";

const answerQuestion = async (question) => {
  // construct the prompt, with our question and the tools that the chain can use
  let prompt = render(promptTemplate, 
    {
      question, 
      tools: Object.keys(tools).map(toolname => `${toolname}: ${tools[toolname].description}`).
             join("\n"), 
      toolnames: Object.keys(tools).join(",")
    });

  // allow the LLM to iterate until it finds a final answer
  while (true) {
    const response = await completePrompt(prompt);

    // add this to the prompt
    prompt += response;

    const action = response.match(/Action: (.*)/)?.[1];
    if (action) {
      // execute the action specified by the LLMs
      const actionInput = response.match(/Action Input: "?(.*)"?/)?.[1];
      console.log(blue(`Action: ${action.trim()}`));
      console.log(blue(`Action Input: ${actionInput}`));
      const result = await tools[action.trim().toLowerCase()].execute(actionInput);
      prompt += `Observation: ${result}\n`;
    } else {
      return response.match(/Final Answer: (.*)/)?.[1];
    }
  }
};

// merge the chat history with a new question
const mergeHistory = async (question, history) => {
  const prompt = render(mergeTemplate, { question, history });
  return await completePrompt(prompt);
};

// main loop - answer the user's questions
let history = "";
while (true) {
  let question = await rl.question("How can I help? ");
  if (!question.length) process.exit(0);

  if (history.length > 0) {
    question = await mergeHistory(question, history);
  }
  const answer = await answerQuestion(question);
  console.log(answer);
  history += `Q:${question}\nA:${answer}\n`;
}
