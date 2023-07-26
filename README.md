- [🦜️🔗 LangChain-mini](#️-langchain-mini)
  - [How the Google Search API works](#how-the-google-search-api-works)
  - [Running / developing](#running--developing)
  - [Tracing the Agent model "How many five year periods are in the current year? Be accurate!"](#tracing-the-agent-model-how-many-five-year-periods-are-in-the-current-year-be-accurate)
  - [What was the high temperature in San Cristobal de La Laguna yesterday in Celsius?](#what-was-the-high-temperature-in-san-cristobal-de-la-laguna-yesterday-in-celsius)

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
  num: 1,
};

const callback = function(data) {
  console.log(deb(data)); 
};

ssearch.json(params, callback); 
```
Here is the output:

![serpapi](/images/serpapi.png)

See the full output in file [serpapi-output.mjs](serpapi-output.mjs).

The code example does not deal with errors. 
A search status is accessible through `search_metadata.status`. 
It flows this way: `Processing` -> `Success` || `Error`. 
If a search has failed, `error` will contain an error message. `search_metadata.id` is the search ID inside SerpApi.


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
Notice the `Thought: I need to find out what year it is`. The LLM has decided to use the **search** tool. The input to the search tool is `current year`. 
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

Better. Now we  reformulate the original question asking the LLM to think step by step and be accurate.

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

## What was the high temperature in San Cristobal de La Laguna yesterday in Celsius?

```
➜  langchain-mini git:(main) node index.mjs              
How can I help? What was the high temperature in San Cristobal de La Laguna yesterday in Celsius?
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
```

First iteration: 

```
Question: What was the high temperature in San Cristobal de La Laguna yesterday in Celsius?
Thought:
 I should search for an answer.
Action: search
Action Input: "san cristobal de la laguna temperature yesterday celsius"

Google search question: san cristobal de la laguna temperature yesterday celsius"
***********
Google search answer: San Cristóbal de La Laguna, Santa Cruz de Tenerife, Spain Weather Historystar_ratehome ; 1:30 AM, 64 °F · 63 °F ; 2:00 AM, 66 °F · 61 °F ; 2:30 AM, 66 °F · 59 °F ; 3: ...
***********
```

Second iteration:

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

Question: What was the high temperature in San Cristobal de La Laguna yesterday in Celsius?
Thought: I should search for an answer.
Action: search
Action Input: "san cristobal de la laguna temperature yesterday celsius"
Observation: San Cristóbal de La Laguna, Santa Cruz de Tenerife, Spain Weather Historystar_ratehome ; 1:30 AM, 64 °F · 63 °F ; 2:00 AM, 66 °F · 61 °F ; 2:30 AM, 66 °F · 59 °F ; 3: ...

Thought: I should convert the temperature from Fahrenheit to Celsius.
Action: calculator
Action Input: (64-32)*5/9

Calculator answer: 17.77777777777778
***********
```

The formula is correct: `C = 5/9(F-32)` but it has chosen  `64 °F` . Yesterday (25/07/2023) we reached more than 72°F, that is more than 22°C.

Third iteration:

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

Question: What was the high temperature in San Cristobal de La Laguna yesterday in Celsius?
Thought: I should search for an answer.
Action: search
Action Input: "san cristobal de la laguna temperature yesterday celsius"
Observation: San Cristóbal de La Laguna, Santa Cruz de Tenerife, Spain Weather Historystar_ratehome ; 1:30 AM, 64 °F · 63 °F ; 2:00 AM, 66 °F · 61 °F ; 2:30 AM, 66 °F · 59 °F ; 3: ...
Thought: I should convert the temperature from Fahrenheit to Celsius.
Action: calculator
Action Input: (64-32)*5/9
Observation: 17.77777777777778

Thought: I now know the final answer.
Final Answer: The high temperature in San Cristobal de La Laguna yesterday in Celsius was 17.78°C.
The high temperature in San Cristobal de La Laguna yesterday in Celsius was 17.78°C.
```

The answer is wrong but seems to be due to the fact that the results of the search are insufficient. 