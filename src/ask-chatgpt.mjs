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
            max_tokens: 256,
            temperature: 0.7,
            stream: false,
            stop: ["Observation:"],
        }),
    })
        .then((res) => res.json())
        .then((res) => res.choices[0].text)
        .then((res) => {
            console.log(red(prompt));
            console.log(green(res));
            return res;
        });
