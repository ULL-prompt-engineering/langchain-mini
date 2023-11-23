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
  console.log(deb(completion)); // { "winner": "Los Angeles Dodgers", "year": 2020 }
}

main();