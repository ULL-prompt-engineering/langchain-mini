import OpenAI from "openai";
const openai = new OpenAI();

import { yourRole, userQuestion, ULLAssistantInfo } from "./ull-info.mjs";
//console.log(yourRole)
//process.exit(0)

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [
        {"role": "system",  "content": yourRole },
        //{"role": "user", "content": userQuestion[0]},
        {"role": "assistant", "content": ULLAssistantInfo[1]},
        {"role": "user", "content": userQuestion[1]},
        //{"role": "assistant", "content": ULLAssistantInfo[1]},
    ],
    model: "gpt-3.5-turbo",
  });
  console.log(completion.choices[0]);
}
main();