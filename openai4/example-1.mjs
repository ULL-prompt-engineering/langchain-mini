import OpenAI from "openai";
const openai = new OpenAI();

import { systemRole, userQuestion, ULLAssistantInfo } from "./ull-info.mjs";
//console.log(systemRole)
//process.exit(0)

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [
        {"role": "system",  "content": systemRole },
        //{"role": "user", "content": userQuestion[0]},
        {"role": "assistant", "content": ULLAssistantInfo[1]},
        {"role": "user", "content": userQuestion[1]},
        //{"role": "assistant", "content": ULLAssistantInfo[1]},
    ],
    model: //"gpt-3.5-turbo", // Currently points to gpt-3.5-turbo-0613. Will point to gpt-3.5-turbo-1106 starting Dec 11, 2023.
           //"gpt-3.5-turbo-16k",
           // "gpt-3.5-turbo-1106",
           "gpt-4-0613",
           //"gpt-3.5-turbo-instruct", // Similar capabilities as text-davinci-003 but compatible with legacy Completions endpoint and not Chat Completions.
  });
  console.log(completion.choices[0]);
}
main();