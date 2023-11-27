import OpenAI from "openai";
import { red, green, } from "./utils.mjs";
import deb from "./deb.mjs";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 30 * 1000, // 30 seconds (default is 10 minutes)
});

export default async (prompt) => {
    // See https://platform.openai.com/docs/api-reference/chat/create
    const completion = await openai.chat.completions.create({
        messages: [
            { "role": "system", "content": prompt },
        ],
        model: "gpt-3.5-turbo", // Currently points to gpt-3.5-turbo-0613. Will point to gpt-3.5-turbo-1106 starting Dec 11, 2023.
        // "gpt-3.5-turbo-16k",
        // "gpt-3.5-turbo-1106",
        // "gpt-4-0613",
        // "gpt-3.5-turbo-instruct", // Similar capabilities as text-davinci-003 but compatible with legacy Completions endpoint and not Chat Completions.
        max_tokens: 256,  // The token count of your prompt plus max_tokens cannot exceed 
        // the model's context length.
        temperature: 0.7, // Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.
        stream: false, // boolean or null.  Optional. Defaults to false
        // Whether to stream back partial progress. 
        // If set, tokens will be sent as data-only server-sent events 
        // as they become available, with the stream terminated by a 
        // data: [DONE] message.
        stop: ["Observation:"], // string / array / null
        // See https://platform.openai.com/docs/api-reference/completions/create#completions-create-stop
        // Up to 4 sequences where the API will stop generating further tokens. 
        // The returned text will not contain the stop sequence. Defaults to null
        n: 1, // integer. Optional. Defaults to 1
    });
    //console.log(green(deb(completion)));
    let res = completion.choices[0].message.content;
    //console.log(green(res));
    return res;
}

