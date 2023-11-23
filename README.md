- [🦜️🔗 LangChain-mini](#️-langchain-mini)
  - [Setup](#setup)
  - [How the Google Search API works](#how-the-google-search-api-works)
  - [The Calculator tool](#the-calculator-tool)
  - [The prompt template](#the-prompt-template)
  - [The Reason-Action (ReAct) loop](#the-reason-action-react-loop)
  - [Tracing the Agent model "How many five year periods are in the current year? Be accurate!"](#tracing-the-agent-model-how-many-five-year-periods-are-in-the-current-year-be-accurate)
    - [1](#1)
    - [2](#2)
    - [3](#3)
    - [4 `How can I help?` "What is the current year? Be accurate!"](#4-how-can-i-help-what-is-the-current-year-be-accurate)
      - [1](#1-1)
      - [2](#2-1)
    - [5 `How can I help?` "Try again. Think step by step. How many five year periods are in the current year? Be accurate!"](#5-how-can-i-help-try-again-think-step-by-step-how-many-five-year-periods-are-in-the-current-year-be-accurate)
      - [1](#1-2)
      - [2](#2-2)
      - [3](#3-1)
  - [Tracing "What was the highest temperature (in Celsius) in Santa Cruz de Tenerife yesterday?"](#tracing-what-was-the-highest-temperature-in-celsius-in-santa-cruz-de-tenerife-yesterday)
    - [1](#1-3)
    - [2](#2-3)
    - [3](#3-2)
    - [4](#4)
  - [November 2023 OpenAI Update](#november-2023-openai-update)
  - [References](#references)

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

1. [Re-implementing LangChain in 100 lines of code](https://blog.scottlogic.com/2023/05/04/langchain-mini.html) by [Colin Eberhardt](https://blog.scottlogic.com/ceberhardt) (May 2023). This repo is a fork of [langchain-mini](https://github.com/ColinEberhardt/langchain-mini)
2. [Prompt Engineering 101](https://github.com/ULL-prompt-engineering/prompt-engineering-101) tutorial. Ask the author for access.

## Setup

Install dependencies, and run (with node >= v18):

```
➜  langchain-mini git:(main) nvm use v20
Now using node v20.5.0 (npm v9.8.0)
```

Install dependencies:

~~~
% npm install
~~~

You'll need to have both an OpenAI and SerpApi keys. These can be supplied to the application via a `.env` file:

~~~
OPENAI_API_KEY="..."
SERPAPI_API_KEY="..."
~~~

## How the Google Search API works

See the notes at [/serpapi/README.md](/serpapi/README.md) for details.

## The Calculator tool

The most important thing about the calculator is that it has to provide an appropiate anwser to the LLM if there were 
errors. If there are errors, the returned string ask the LLM `Please reformulate the expression. The calculator tool has failed with error:\n'${e}'`:

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

The [assets/templates/prompt.txt](/assets/templates/prompt.txt) file is a template from which we will build the instructions  for the LLM on each step of the 
chat. The LLM answers to the previous questions are appended to the template as `Thought`s. The result of the call to the tools will be added to the template as `Observation`s.

```
Answer the following questions as best you can. You have access to the following tools:

{{tools}}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{{toolnames}}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {{question}}
Thought:
```

Notice the `Thought:` field at the end. This is where the program will append the LLM response.

The template is first filled inside the function `answerQuestion` with the information of the `question` 
and the available `tools`:

```js
const promptTemplate = fs.readFileSync("assets/templates/prompt.txt", "utf8");
/* ... */
let prompt = render(promptTemplate, 
    {
      question, 
      tools: Object.keys(tools).map(toolname => `${toolname}: ${tools[toolname].description}`).
             join("\n"), 
      toolnames: Object.keys(tools).join(",")
    });
```

## The Reason-Action (ReAct) loop

Then we want to iteratively:

1. ask the LLM to give us a thought, that is to decide which tool to use (or no tool at all)
   
   ```js
    const response = await completePrompt(prompt);
    prompt += response;
   ```
   Since the `prompt` ends with the `Thought` field, the LLM response is added as a `Tought`.
   The LLM also has filled the `Action:` and `Action Input:` entries.
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

## Tracing the Agent model "How many five year periods are in the current year? Be accurate!"

You can now run the chain:

```
➜  langchain-mini git:(main) ✗ node index.mjs
How can I help? How many five year periods are in the current year? Be accurate!
```

We input our question `How many five year periods are in the current year? Be accurate!`, and here is the trace of the console.logs:

### 1

The initial prompt is:

```
How can I help? How many five year periods are in the current year? Be accurate!
```
The execution of
```js
let prompt = render(promptTemplate, 
    {
      question, 
      tools: Object.keys(tools).map(toolname => `${toolname}: ${tools[toolname].description}`).
             join("\n"), 
      toolnames: Object.keys(tools).join(",")
    });
```

renders:

```
Answer the following questions as best you can. You have access to the following tools:

search: a search engine. useful for when you need to answer questions about current events. input should be a search query.
calculator: Useful for getting the result of a math expression. The input to this tool should be a valid mathematical expression that could be executed by a simple calculator.

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [search,calculator]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: 
```
Here we are in the first step of the **ReAct** iteration. 

The LLM has thought about what to do, and decides to use the **calculator** tool. 

The input to the calculator must be the current year divided by 5. But it wrongly assumed the year is 2020.

```
Thought:
 I need to do some basic math
Action: calculator
Action Input: 2020 / 5
```

Our agent reads the action from the `Action:` field and the input from the `Action Input:` field:

```js
const action = response.match(/Action: (.*)/)?.[1];
    if (action) {
      // execute the action specified by the LLMs
      const actionInput = response.match(/Action Input: "?(.*)"?/)?.[1];
      console.log(blue(`Action: ${action.trim()}`));
      console.log(blue(`Action Input: ${actionInput}`));
```

then calls the corresponding tool and fills the `Observation:` field with the result of the tool:

```js
      const result = await tools[action.trim().toLowerCase()].execute(actionInput);
      prompt += `Observation: ${result}\n`;
```

As a consequence, the calculator tool echoes to the console:

```
Action: calculator
Action Input: 2020 / 5
Calculator answer: 404
***********
```

But at the time of this writing the year is 2023!.

### 2

Now it continues to the next step.


```
Answer the following questions as best you can. You have access to the following tools:

search: a search engine. useful for when you need to answer questions about current events. input should be a search query.
calculator: Useful for getting the result of a math expression. The input to this tool should be a valid mathematical expression that could be executed by a simple calculator.

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [search,calculator]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: How many five year periods are in the current year? Be accurate!
Thought: I need to do some basic math
Action: calculator
Action Input: 2020 / 5
Observation: 404

Thought:
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
``` 
```
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

### 4 `How can I help?` "What is the current year? Be accurate!"

Whithout leaving the [main readline loop](/index.mjs#L119-L129):

```js
while (true) {
  let question = await rl.question("How can I help? ");
  if (history.length > 0) {
    question = await mergeHistory(question, history);
  }
  const answer = await answerQuestion(question);
  console.log(answer);
  history += `Q:${question}\nA:${answer}\n`;
}
```
we (human) ask the app again:

```
How can I help? What is the current year? Be accurate!
```

The **ReAct** loop starts again:

#### 1

As it is a "follow up" question, new fields now appear in the instructions.

The **Chat History** field that summarizes the conversation so far, having the format `Q: <question>\nA: <answer>\nQ: <question>\nA: <answer>\n...\n\n` with a new paragraph separating it to the rest of the prompt template. 

This text comes from the `assets/templates/merge.txt` template file:
   
```
Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.
Chat History:
${history}
Follow Up Input: ${question}
Standalone question:
```

and is computed by the function [mergeHistory](index.mjs#L111-L117):

```js
// merge the chat history with a new question
const mergeHistory = async (question, history) => {
  const prompt = mergeTemplate
    .replace("${question}", question)
    .replace("${history}", history);
  return await completePrompt(prompt);
};
```

The `history` variable is updated [on the `main` loop](/index.mjs#L119-L129):

```js
let history = "";
while (true) {
  let question = await rl.question("How can I help? ");
  if (history.length > 0) {
    question = await mergeHistory(question, history);
  }
  const answer = await answerQuestion(question);
  console.log(answer);
  history += `Q:${question}\nA:${answer}\n`;
}
```

This provides the app with **some form of memory**, so that the LLM can use the previous questions and answers to answer the current question.

Another new field is the **Follow Up Input** containing the current question `What is the current year? Be accurate!` and the **Standalone question** field[^1] that is the question `What is the current year?` to be answered by the LLM.

[^1]: I find curious that we haven't given instructions about this field to the LLM but was filled by it filled it out from the **Follow Up Input**. Why is it so?

```
Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.
Chat History:
Q:How many five year periods are in the current year? Be accurate!
A:There are 404 five year periods in the current year.

Follow Up Input: What is the current year? Be accurate!
Standalone question:
 What is the current year?
``` 
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
```
```
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


#### 2

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
```
```
Begin!

Question:  What is the current year?
Thought: I need to find out what year it is
Action: search
Action Input: current year
Observation: The current year is 2023 and today's date (according to the Gregorian calendar) is Tuesday, July 25, 2023. If you encounter AD or CE in front of, ...

Final Answer: The current year is 2023.
The current year is 2023.
```

Much better!. The **search** tool has found the correct anwser. 

### 5 `How can I help?` "Try again. Think step by step. How many five year periods are in the current year? Be accurate!"

Now we  reformulate the original question asking the LLM to think step by step and be accurate.


```
How can I help? Try again. Think step by step. How many five year periods are in the **current year**? Be accurate!
```

The **ReAct** loop starts again:

#### 1

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
```
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
``` 
```
Begin!

Question:  What is the total number of five year periods in the year 2023?
Thought:
 I need to calculate the amount of five year periods.
Action: calculator
Action Input: 2023/5

Calculator answer: 404.6
***********
```

Notice 

1. The Chat History has grown:
   
   ```
   Chat History:
    Q:How many five year periods are in the current year? Be accurate!
    A:There are 404 five year periods in the current year.
    Q: What is the current year?
    A:The current year is 2023.
   ```
   It gives a lot of context to the LLM
2. the `Question: What is the total number of five year periods in the year 2023?`: it correctly remembers the value of the current year at this writing, 2023. Also, 
3. the `Thought: I need to calculate the amount of five year periods`. 
4. The LLM has decided to use the **calculator** tool. 
5. The input to the calculator is `2023/5`.

#### 2

The iteration continues

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

#### 3

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

## Tracing "What was the highest temperature (in Celsius) in Santa Cruz de Tenerife yesterday?"

Let us run the program and formulate the question:

```
➜  langchain-mini git:(main) ✗ node index.mjs                         
How can I help? What was the highest temperature (in Celsius) in Santa Cruz de Tenerife yesterday?
```

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
```
```
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
```
```
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

The **Thought** `I need to convert from Fahrenheit to Celsius` is right 
**but the expression `(75 F - 32) * 5/9` used as `Action Input` can not be computed by the calculator tool**, since `F` is not defined.

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
```
```
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

The **Thought** field `I need to change the expression` is right and it is a the consequence of the returned value  
`Please reformulate the expression. The calculator tool has failed ...` 
inside the `catch` in the [calculator](/index.mjs#L32-L41) function code:

```js
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

Now the reformulated expression `((75-32) * 5/9)` used as `Action Input` is valid.

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
``` 

```
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
Observation: `23.88888888888889`

Thought: I now know the final answer
Final Answer: Yesterday's highest temperature in Santa Cruz de Tenerife was 23.89 Celsius.
Yesterday's highest temperature in Santa Cruz de Tenerife was 23.89 Celsius.
How can I help? 
```

Notice the round of `23.88888888888889` to `23.89` in the LLM answer.

## November 2023 OpenAI Update

The [completion API](https://platform.openai.com/docs/api-reference/completions) that is used in this branch of the project is now labelled as `legacy`.

The legacy **Completion API** for a  given a prompt, makes the model to return 

- one or more predicted completions along with 
- the probabilities of alternative tokens at each position. 

Most developer should use  

- [Chat Completions API](https://platform.openai.com/docs/guides/text-generation/text-generation-models) 
  - See <https://platform.openai.com/docs/guides/text-generation/chat-completions-api>

Most models that support the legacy Completions endpoint [will be shut off on January 4th, 2024](https://platform.openai.com/docs/deprecations/).

I have installed the `openai` package version `4.20.0`:

```
➜  serpapi git:(dev) npm ls openai
langchain-mini@1.0.0 /Users/casianorodriguezleon/campus-virtual/2223/learning/openai-learning/langchain-mini
└── openai@4.20.0
```

Text generation models are now capable of 

- [JSON mode](https://platform.openai.com/docs/guides/text-generation/json-mode) and 
- [Reproducible outputs](https://platform.openai.com/docs/guides/text-generation/reproducible-outputs). 

A common way to use Chat Completions is to instruct the model to always return a JSON object that makes sense for your use case, by specifying this in the system message. While this does work in some cases, occasionally the models may generate output that does not parse to valid JSON objects.

To prevent these errors and improve model performance, when calling 

- `gpt-4-1106-preview` or 
- `gpt-3.5-turbo-1106`, 

you can set `response_format` to `{ "type": "json_object" }` to enable [JSON mode](https://platform.openai.com/docs/guides/text-generation/json-mode). 

When **JSON mode** is enabled, **the model is constrained to only generate strings that parse into valid JSON object**.



## References

* [Re-implementing LangChain in 100 lines of code](https://blog.scottlogic.com/2023/05/04/langchain-mini.html) by [Colin Eberhardt](https://blog.scottlogic.com/ceberhardt) (May 2023)
* The ReAct model was introduced by Google in [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629) (March of 2023)
* [ReAct: Synergizing Reasoning and Acting in Language Models](https://www.promptingguide.ai/techniques/react)
* [Brex's Prompt Engineering Guide](https://github.com/brexhq/prompt-engineering#react) GitHub repo
* [Model ReAct Knowledge Language](https://amatriain.net/blog/prompt201#react) Amatrian's blog post in "Prompt Engineering 201: Advanced methods and toolkits"
* [Prompt Engineering with OpenAI's GPT-3 and other LLMs](https://www.classcentral.com/classroom/youtube-prompt-engineering-with-openai-s-gpt-3-and-other-llms-126224)  by James Briggs via [YouTube](https://www.youtube.com/watch?v=BP9fi_0XTlw)