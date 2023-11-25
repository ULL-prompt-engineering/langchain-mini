import { rl, red, green, blue, purple } from "./utils.mjs";
import { Parser } from "expr-eval";

const googleSearch = async (question) => {
    console.log(purple(`Google search question: ${question}\n***********`));
  
    let answer = await fetch(
      `https://serpapi.com/search?api_key=${process.env.SERPAPI_API_KEY}&q=${question}`
    ).then((res) => res.json()).then(
        (res) =>
          // try to pull the answer from various components of the response
          res.answer_box?.answer ||
          res.answer_box?.snippet ||
          res.organic_results?.[0]?.snippet
      );
    console.log(purple(`Google search answer: ${answer}\n***********`));
    return answer;
  }
  
  const calculator = (input) => {
    try {
      let answer = Parser.evaluate(input).toString()
      console.log(purple(`Calculator answer: ${answer}\n***********`));
      return answer;
    } catch (e) {    
      console.log(purple(`Calculator got errors: ${e}\n***********`));
      return `Please reformulate the expression. The calculator tool has failed with error:\n'${e}'`;
    }
  }
  // tools that can be used to answer questions
  const tools = {
    search: {
      description:
        "A search engine. Useful for when you need to answer questions about current events. Input should be a search query.",
      execute: googleSearch,
    },
    calculator: {
      description:
        "Useful for getting the result of a numeric math expression. The input to this tool should be a valid mathematical expression that could be executed by a simple calculator.",
      execute: calculator,
    },
  };

  export {tools, calculator, googleSearch}
  