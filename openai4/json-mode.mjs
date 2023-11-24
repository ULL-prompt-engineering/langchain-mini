import { config } from "dotenv";
import deb from "../src/deb.mjs";
config('../.env');

import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 30 * 1000, // 30 seconds (default is 10 minutes)

});

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant designed to output JSON.",
      },
      { role: "user", content: "Who won the world series in 2020?" },
    ],
    model: "gpt-3.5-turbo-1106",
    response_format: { type: "json_object" },
  });
  let firstMessage = completion.choices[0];
  if (firstMessage.finish_reason === "stop") {
    console.log(JSON.parse(firstMessage.message.content));
  } else {
    console.log(`The completion did not finish due to timeout: ${deb(completion)}`);
  }
  console.log(deb(completion)); 
  /*
  {
  id: 'chatcmpl-8OCBnLI7QLRH1Oehi0yZGfYLVIC2c',
  object: 'chat.completion',
  created: 1700777419,
  model: 'gpt-3.5-turbo-1106',
  choices: [
    {
      index: 0,
      message: {
        role: 'assistant',
        content: '{\n  "winner": "Los Angeles Dodgers"\n}'
      },
      finish_reason: 'stop'
    }
  ],
  usage: { prompt_tokens: 31, completion_tokens: 11, total_tokens: 42 },
  system_fingerprint: 'fp_eeff13170a'
}
  */
}

main();