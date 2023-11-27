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

// This is chat-gpt-3.5 and the old completions endpoint
//import completePrompt from "./src/ask-chatgpt.mjs";
// this is with gpt-3.5-turbo and the new chat completions endpoint
// Uncomment the following line to use the new chat completions endpoint
import completePrompt from "./src/ask-chatgpt.chat-completions.mjs";

const answerQuestion = async (question) => {
  // construct the prompt, with our question and the tools that the chain can use
  let prompt = render(promptTemplate, 
    {
      question, 
      tools: Object.keys(tools).map(toolname => `${toolname}: ${tools[toolname].description}`).
             join("\n"), 
      toolnames: Object.keys(tools).join(",")
    });
  console.log(red(prompt));

  // allow the LLM to iterate until it finds a final answer
  while (true) {
    const response = await completePrompt(prompt);
    console.log(green(response));
    
    // add this to the prompt
    prompt += response;

    const action = response.match(/Action: (.*)/)?.[1];
    //console.log(`New prompt with the answer of the LLM:\n`)
    //console.log(red(prompt));

    if (action) {
      // execute the action specified by the LLMs
      const actionInput = response.match(/Action Input: "?(.*)"?/)?.[1];
      console.log(`Going to execute the tool `+
           blue(`${action.trim()}(${deb(actionInput)})`));
      const result = await tools[action.trim().toLowerCase()].execute(actionInput);
      prompt += `Observation: ${result}\n`
    } else {
      return response.match(/Final Answer: (.*)/)?.[1];
    }
  }
};


// main loop - answer the user's questions
let history = ``;
let skip = false;
while (true) {
  let question = await rl.question("How can I help? ");
  if (!question.length) process.exit(0);

  if (history.length > 0) {
    // merge the chat history with a new question
    let historyAndQuestion = render(mergeTemplate, { question, history })
    let newQuestion = await completePrompt(historyAndQuestion);
    console.log(purple(historyAndQuestion));
    console.log(purple(newQuestion));
    newQuestion = newQuestion.match(/newQuestion:\s*(.*)/)?.[1];
    console.log(purple(`New question: ${deb(newQuestion)}`));
    if (newQuestion) {
      question = newQuestion;
    }
  }
  if (question) {
    const answer = await answerQuestion(question);
    console.log(answer);
    history += `- Your answer to question: "${question}" was "${answer}"\n`;
  }
}
