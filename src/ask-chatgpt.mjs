import { red, green,  } from "./utils.mjs";
// use GPT-3.5 to complete a given prompts
export default async (prompt) =>
    await fetch("https://api.openai.com/v1/completions", { // https://platform.openai.com/docs/api-reference/completions
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + process.env.OPENAI_API_KEY,
        },
        body: JSON.stringify({
            model: "text-davinci-003",
            prompt,
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
        }),
    })
        .then((res) => res.json())
        .then((res) => res.choices[0].text) // res.choices is a list of completions. Can be more than one if n is greater than 1.
        .then((res) => {
            console.log(red(prompt));
            console.log(green(res));
            return res;
        });
