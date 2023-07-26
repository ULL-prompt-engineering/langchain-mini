- [🦜️🔗 LangChain-mini](#️-langchain-mini)
  - [How the Google Search API works](#how-the-google-search-api-works)
  - [The Calculator tool](#the-calculator-tool)
  - [The prompt template](#the-prompt-template)
  - [Running / developing](#running--developing)
  - [Tracing the Agent model "How many five year periods are in the current year? Be accurate!"](#tracing-the-agent-model-how-many-five-year-periods-are-in-the-current-year-be-accurate)
    - [1](#1)
    - [2](#2)
    - [3](#3)
    - [How can I help? "What is the current year? Be accurate!"](#how-can-i-help-what-is-the-current-year-be-accurate)
    - [How can I help? "Try again. Think step by step. How many five year periods are in the **current year**? Be accurate!"](#how-can-i-help-try-again-think-step-by-step-how-many-five-year-periods-are-in-the-current-year-be-accurate)
  - [What was the highest temperature (in Celsius) in Santa Cruz de Tenerife yesterday?](#what-was-the-highest-temperature-in-celsius-in-santa-cruz-de-tenerife-yesterday)
    - [1](#1-1)
    - [2](#2-1)
    - [3](#3-1)
    - [4](#4)

# 🦜️🔗 LangChain-mini 

This is a very simple re-implementation of [LangChain](https://github.com/hwchase17/langchain), in ~100 lines of code. In essence, it is an LLM (GPT-3.5) powered chat application that is able to use tools (Google search and a calculator) in order to hold conversations and answer questions. 

Here's an example:

~~~
Q: What is the world record for solving a rubiks cube?
The world record for solving a Rubik's Cube is 4.69 seconds, held by Yiheng Wang (China).
Q: Can a robot solve it faster?
The fastest time a robot has solved a Rubik's Cube is 0.637 seconds.
Q: Who made this robot?
Infineon created the robot that solved a Rubik's Cube in 0.637 seconds.
Q: What time would an average human expect for solving?
It takes the average person about three hours to solve a Rubik's cube for the first time.
~~~

This is not intended to be a replacement for LangChain, instead it was built for fun and educational purposes. If you're interested in how LangChain, and similar tools work, this is a good starting point.

For more information about this project, read 

1. The blogpost - [Re-implementing LangChain in 100 lines of code](https://blog.scottlogic.com/2023/05/04/langchain-mini.html)
2. [Prompt Engineering 101](https://github.com/ULL-prompt-engineering/prompt-engineering-101) tutorial

## How the Google Search API works

Here is the function inside [index.mjs](index.mjs#L16-L30) that uses the SerpApi to answer a  question:

```js
// use serpapi to answer the question
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
```

Consulting the [Google Search Engine Results API](https://serpapi.com/search-api) we can see that the `/search` API endpoint allows us to scrape the results from Google search engine via our SerpApi service. 

We can also see that the `q` parameter is required and defines the query we want to search. 

We can use anything that we would use in a regular Google search. e.g. `inurl:`, `site:`, `intitle:`. 

They also support [advanced search query parameters](https://www.google.com/support/enterprise/static/gsa/docs/admin/current/gsa_doc_set/xml_reference/request_format.html) such as `as_dt` or `as_eq`

* `as_dt` modifies the `as_sitesearch` parameter 
  * `i`: Include only results in the web directory specified by `as_sitesearch`
  * `e`: Exclude all results in the web directory specified by `as_sitesearch`. For example, to exclude results, use `as_dt=e`.
* `as_eq`  excludes the specified terms from the search results. 
  * For example, to filter out results that contain the term `deprecated`, use `as_eq=deprecated`. 

The [api-key](https://serpapi.com/search-api#api-parameters-serpapi-parameters-api-key) is also required and defines the **SerpApi** private key to use. That is why we the fetch request:

```js 
fetch(`https://serpapi.com/search?api_key=${process.env.SERPAPI_API_KEY}&q=${question}`);
```

makes an HTTP GET request to the SERP API (Search Engine Results Page API) provided by `serpapi.com`. 

See the [full list](https://serpapi.com/advanced-google-query-parameters) of supported advanced search query parameters.

The JSON output result from `res.json()` includes structured data for 

* <a href="https://serpapi.com/organic-results">organic results</a> Google search main results are called organic results. Is an array. For each organic result, we are able to extract its `snippet` `answers` and more. 
* <a href="https://serpapi.com/local-pack">local results</a>, 
* <a href="https://serpapi.com/google-ads">ad results</a>, 
* the <a href="https://serpapi.com/knowledge-graph">knowledge graph</a>,
* <a href="https://serpapi.com/direct-answer-box-api">direct answer boxes</a>, 
* <a href="https://serpapi.com/images-results">images results</a>, 
* <a href="https://serpapi.com/news-results">news results</a>, 
* <a href="https://serpapi.com/shopping-results">shopping results</a>,
*  <a href="https://serpapi.com/videos-results">video results</a>, and more.
  
The code at [serpapi.mjs](serpapi.mjs) illustrates how to use the SerpApi to answer a simple question:

```js
import deb from "./deb.mjs";
import env from "dotenv";
env.config();

import SerpApi from 'google-search-results-nodejs';
const search = new SerpApi.GoogleSearch(process.env.SERPAPI_API_KEY);

const params = {
  q: "What is the current year?",
  hl: "en",
  gl: "us",
  num: 1, // ask for only one result
};

const callback = function(data) {
  console.log(deb(data)); 
};

ssearch.json(params, callback); 
```
Here is the (folded) output. Notice the field `snippet` of the first object in the array `organic_results`:

![serpapi](/images/serpapi.png)

See the full output in file [serpapi-output.mjs](serpapi-output.mjs).

The code example does not deal with errors. 
A search status is accessible through `search_metadata.status`. 
It flows this way: `Processing` -> `Success` || `Error`. 
If a search has failed, `error` will contain an error message. `search_metadata.id` is the search ID inside SerpApi.

## The Calculator tool

The most important thing about the calculator is that it has to provide an appropiate anwser to the LLM if there ere 
errors. That is why it ask the LLM `Please reformulate the expression. The calculator tool has failed with error:\n'${e}'`:

``` js
import { Parser } from "expr-eval";
```
``` js
const calculator = (input) => {
  try {
    let answer = Parser.evaluate(input).toString()
    console.log(blue(`Calculator answer: ${answer}\n***********`));
    return answer;
  } catch (e) {    
    console.log(blue(`Calculator got errors: ${e}\n***********`));
    return `Please reformulate the expression. The calculator tool has failed with error:\n'${e}'`;
  }
}
```

## The prompt template 

The `prompt.txt` file is a template from which we will build the instructions  for the LLM on each step of the 
chat. The LLM answers to the previous questions are appended to the template as `Thought`s. The result of the call to the tools will be added to the template as `Observation`s.

```
Answer the following questions as best you can. You have access to the following tools:

${tools}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [${toolnames}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: ${question}
Thought:
```

Notice the `Thought:` field at the end. This is where the LLM will write its thoughts.

The template is first filled inside the function `answerQuestion` with the information of the `question` 
and the available `tools`:

```js
let prompt = promptTemplate.replace("${question}", question).replace(
    "${tools}",
    Object.keys(tools)
      .map((toolname) => `${toolname}: ${tools[toolname].description}`)
      .join("\n")
  ).replace("${toolnames}", Object.keys(tools).join(","));
```

Then we want to iteratively:

1. ask the LLM to give us an Action,
   
   ```js
   const action = await completePrompt(prompt);
   prompt += action;
   ```
   Since the `prompt` ends with the `Thought` field, the LLM response is added as a `Tought`.
   We also need to determine the values for the `action` and the `actionInput` fields from the LLM response using regular expressions:

   ```js
    const action = response.match(/Action: (.*)/)?.[1];
    if (action) {
      // execute the action specified by the LLMs
      const actionInput = response.match(/Action Input: "?(.*)"?/)?.[1];
      ...
    }
   ```
2. execute the corresponding tool (`calculator` or `search`) based on the given `action`, supplying them with the `Action Input`, 

  ```js
  const result = await tools[action.trim().toLowerCase()].execute(actionInput);
  ``` 
4. appending the results of the tool to the prompt as an `Observation`:

    ```js
        prompt += `Observation: ${result}\n`;
    ```

5. This process continues until the LLM orchestrator determines that it has enough information and returns a Final Answer.
   
   ```js
    const action = response.match(/Action: (.*)/)?.[1];
    if (action) {
      ...
    } else {
      return response.match(/Final Answer: (.*)/)?.[1]; // The text after the colon
    } 
   ```


## Running / developing 
Install dependencies, and run (with node >= v18):

~~~
% npm install
~~~

You'll need to have both an OpenAI and SerpApi keys. These can be supplied to the application via a `.env` file:

~~~
OPENAI_API_KEY="..."
SERPAPI_API_KEY="..."
~~~

##  Tracing the Agent model "How many five year periods are in the current year? Be accurate!"

You can now run the chain:

```
➜  langchain-mini git:(main) ✗ node index.mjs
How can I help? How many five year periods are in the current year? Be accurate!
```

We input our question `How many five year periods are in the current year? Be accurate!`, and here is the trace of the console.logs:

### 1

```
Answer the following questions as best you can. You have access to the following tools:

search: a search engine. useful for when you need to answer questions about current events. input should be a search query.
calculator: Useful for getting the result of a math expression. The input to this tool should be a valid mathematical expression that could be executed by a simple calculator.

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [search]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: How many five year periods are in the current year? Be accurate!
Thought:
 I need to figure out the current year, and then calculate the number of five year periods
Action: Calculator
Action Input: (2020/5)

Calculator answer: 404
***********
```
Here is in the first step of the **ReAct** iteration. The LLM has thought about what to do, and has decided to use the **calculator** tool. The input to the calculator must be the current year divided by 5. But it wrongly assumed the year is 2022.

### 2

Now it continues to the next step:

```
Answer the following questions as best you can. You have access to the following tools:

search: a search engine. useful for when you need to answer questions about current events. input should be a search query.
calculator: Useful for getting the result of a math expression. The input to this tool should be a valid mathematical expression that could be executed by a simple calculator.

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [search]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: How many five year periods are in the current year? Be accurate!
Thought: I need to figure out the current year, and then calculate the number of five year periods
Action: Calculator
Action Input: (2020/5)
Observation: 404

Thought: I need to round up to the nearest whole number
Action: Calculator
Action Input: ceil(404)

Calculator answer: 404
***********
```

Notice the `Thought: I need to round ...`. Has decided to round. The iteration continues:

### 3

```
Answer the following questions as best you can. You have access to the following tools:

search: a search engine. useful for when you need to answer questions about current events. input should be a search query.
calculator: Useful for getting the result of a math expression. The input to this tool should be a valid mathematical expression that could be executed by a simple calculator.

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [search]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: How many five year periods are in the current year? Be accurate!
Thought: I need to figure out the current year, and then calculate the number of five year periods
Action: Calculator
Action Input: (2020/5)
Observation: 404
Thought: I need to round up to the nearest whole number
Action: Calculator
Action Input: ceil(404)
Observation: 404

Final Answer: There are 404 five year periods in the current year.
There are 404 five year periods in the current year.
```

The answer is wrong since at the time of this wrinting the year is 2023, so we try again. This time we ask the LLM only for the current year, asking the LLM to be accurate:

### How can I help? "What is the current year? Be accurate!"

```
How can I help? What is the current year? Be accurate!
```
The **ReAct** loop starts again:

```
Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.
Chat History:
Q:How many five year periods are in the current year? Be accurate!
A:There are 404 five year periods in the current year.

Follow Up Input: What is the current year? Be accurate!
Standalone question:
 What is the current year?
Answer the following questions as best you can. You have access to the following tools:

search: a search engine. useful for when you need to answer questions about current events. input should be a search query.
calculator: Useful for getting the result of a math expression. The input to this tool should be a valid mathematical expression that could be executed by a simple calculator.

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [search]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question:  What is the current year?
Thought:
 I need to find out what year it is
Action: search
Action Input: current year

Google search question: current year
***********
Google search answer: The current year is 2023 and today's date (according to the Gregorian calendar) is Tuesday, July 25, 2023. If you encounter AD or CE in front of, ...
***********
```

Notice the `Thought: I need to find out what year it is`. 
The LLM has decided to use the **search** tool. The input to the search tool is `current year`. 

The iteration continues:

```
Answer the following questions as best you can. You have access to the following tools:

search: a search engine. useful for when you need to answer questions about current events. input should be a search query.
calculator: Useful for getting the result of a math expression. The input to this tool should be a valid mathematical expression that could be executed by a simple calculator.

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [search]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question:  What is the current year?
Thought: I need to find out what year it is
Action: search
Action Input: current year
Observation: The current year is 2023 and today's date (according to the Gregorian calendar) is Tuesday, July 25, 2023. If you encounter AD or CE in front of, ...

Final Answer: The current year is 2023.
The current year is 2023.
```

Better. 

### How can I help? "Try again. Think step by step. How many five year periods are in the **current year**? Be accurate!"

Now we  reformulate the original question asking the LLM to think step by step and be accurate.

```
How can I help? Try again. Think step by step. How many five year periods are in the **current year**? Be accurate!
```

The **ReAct** loop starts again:

```
Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.
Chat History:
Q:How many five year periods are in the current year? Be accurate!
A:There are 404 five year periods in the current year.
Q: What is the current year?
A:The current year is 2023.

Follow Up Input: Try again. Think step by step. How many five year periods are in the **current year**? Be accurate!
Standalone question:
 What is the total number of five year periods in the year 2023?
Answer the following questions as best you can. You have access to the following tools:

search: a search engine. useful for when you need to answer questions about current events. input should be a search query.
calculator: Useful for getting the result of a math expression. The input to this tool should be a valid mathematical expression that could be executed by a simple calculator.

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [search]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question:  What is the total number of five year periods in the year 2023?
Thought:
 I need to calculate the amount of five year periods.
Action: calculator
Action Input: 2023/5

Calculator answer: 404.6
***********
```

Notice the `Question: What is the total number of five year periods in the year 2023?`: it correctly remembers the value of the current year at this writing, 2023. Also, the `Thought: I need to calculate the amount of five year periods`. The LLM has decided to use the **calculator** tool. The input to the calculator is `2023/5`.

The iteration continues:

```
Answer the following questions as best you can. You have access to the following tools:

search: a search engine. useful for when you need to answer questions about current events. input should be a search query.
calculator: Useful for getting the result of a math expression. The input to this tool should be a valid mathematical expression that could be executed by a simple calculator.

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [search]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question:  What is the total number of five year periods in the year 2023?
Thought: I need to calculate the amount of five year periods.
Action: calculator
Action Input: 2023/5
Observation: 404.6

Thought: I need to round up the number to the nearest whole number.
Action: calculator
Action Input: ceil(404.6)

Calculator answer: 405
***********
``` 

Notice the `Thought: I need to round up the number to the nearest whole number`. The LLM has decided to use the **calculator** tool. The input to the calculator is `ceil(404.6)` and the calculator output is `405`.

```
Answer the following questions as best you can. You have access to the following tools:

search: a search engine. useful for when you need to answer questions about current events. input should be a search query.
calculator: Useful for getting the result of a math expression. The input to this tool should be a valid mathematical expression that could be executed by a simple calculator.

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [search]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question:  What is the total number of five year periods in the year 2023?
Thought: I need to calculate the amount of five year periods.
Action: calculator
Action Input: 2023/5
Observation: 404.6
Thought: I need to round up the number to the nearest whole number.
Action: calculator
Action Input: ceil(404.6)
Observation: 405

Thought: I now know the final answer.
Final Answer: 405
405
```

## What was the highest temperature (in Celsius) in Santa Cruz de Tenerife yesterday?


### 1

```
➜  langchain-mini git:(main) ✗ node index.mjs                         
How can I help? What was the highest temperature (in Celsius) in Santa Cruz de Tenerife yesterday?
Answer the following questions as best you can. You have access to the following tools:

search: a search engine. useful for when you need to answer questions about current events. input should be a search query.
calculator: Useful for getting the result of a math expression. The input to this tool should be a valid mathematical expression that could be executed by a simple calculator.

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [search]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: What was the highest temperature (in Celsius) in Santa Cruz de Tenerife yesterday?
Thought:
 I need to find a reliable source of information
Action: search
Action Input: "highest temperature in Santa Cruz de Tenerife yesterday"

Action: search
Action Input: highest temperature in Santa Cruz de Tenerife yesterday"
Google search question: highest temperature in Santa Cruz de Tenerife yesterday"
***********
Google search answer: Santa Cruz de Tenerife Temperature Yesterday. Maximum temperature yesterday: 75 °F (at 3:00 pm) Minimum temperature yesterday: 63 °F (at 4:30 am)
***********
```

### 2

```
Answer the following questions as best you can. You have access to the following tools:

search: a search engine. useful for when you need to answer questions about current events. input should be a search query.
calculator: Useful for getting the result of a math expression. The input to this tool should be a valid mathematical expression that could be executed by a simple calculator.

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [search]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: What was the highest temperature (in Celsius) in Santa Cruz de Tenerife yesterday?
Thought: I need to find a reliable source of information
Action: search
Action Input: "highest temperature in Santa Cruz de Tenerife yesterday"
Observation: Santa Cruz de Tenerife Temperature Yesterday. Maximum temperature yesterday: 75 °F (at 3:00 pm) Minimum temperature yesterday: 63 °F (at 4:30 am)

Thought: I need to convert from Fahrenheit to Celsius
Action: calculator
Action Input: (75 F - 32) * 5/9

Action: calculator
Action Input: (75 F - 32) * 5/9
Calculator got errors: Error: parse error [1:6]: Expected )
***********
```

The **Thought** `I need to convert from Fahrenheit to Celsius` is right but 
the expression `(75 F - 32) * 5/9` used as `Action Input` is not valid, since `F` is not defined.

### 3

Continue:

```
Answer the following questions as best you can. You have access to the following tools:

search: a search engine. useful for when you need to answer questions about current events. input should be a search query.
calculator: Useful for getting the result of a math expression. The input to this tool should be a valid mathematical expression that could be executed by a simple calculator.

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [search]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: What was the highest temperature (in Celsius) in Santa Cruz de Tenerife yesterday?
Thought: I need to find a reliable source of information
Action: search
Action Input: "highest temperature in Santa Cruz de Tenerife yesterday"
Observation: Santa Cruz de Tenerife Temperature Yesterday. Maximum temperature yesterday: 75 °F (at 3:00 pm) Minimum temperature yesterday: 63 °F (at 4:30 am)
Thought: I need to convert from Fahrenheit to Celsius
Action: calculator
Action Input: (75 F - 32) * 5/9
Observation: Please reformulate the expression. The calculator tool has failed with error:
'Error: parse error [1:6]: Expected )'

Thought: I need to change the expression
Action: calculator
Action Input: ((75-32) * 5/9)

Action: calculator
Action Input: ((75-32) * 5/9)
Calculator answer: 23.88888888888889
***********
```
The **Thought** `I need to change the expression` is right 
and the expression `((75-32) * 5/9)` used as `Action Input` is valid.

### 4

```
Answer the following questions as best you can. You have access to the following tools:

search: a search engine. useful for when you need to answer questions about current events. input should be a search query.
calculator: Useful for getting the result of a math expression. The input to this tool should be a valid mathematical expression that could be executed by a simple calculator.

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [search]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: What was the highest temperature (in Celsius) in Santa Cruz de Tenerife yesterday?
Thought: I need to find a reliable source of information
Action: search
Action Input: "highest temperature in Santa Cruz de Tenerife yesterday"
Observation: Santa Cruz de Tenerife Temperature Yesterday. Maximum temperature yesterday: 75 °F (at 3:00 pm) Minimum temperature yesterday: 63 °F (at 4:30 am)
Thought: I need to convert from Fahrenheit to Celsius
Action: calculator
Action Input: (75 F - 32) * 5/9
Observation: Please reformulate the expression. The calculator tool has failed with error:
'Error: parse error [1:6]: Expected )'
Thought: I need to change the expression
Action: calculator
Action Input: ((75-32) * 5/9)
Observation: 23.88888888888889

Thought: I now know the final answer
Final Answer: Yesterday's highest temperature in Santa Cruz de Tenerife was 23.89 Celsius.
Yesterday's highest temperature in Santa Cruz de Tenerife was 23.89 Celsius.
How can I help? 
```