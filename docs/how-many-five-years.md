# Tracing the Agent model "How many five year periods are in the current year? Be accurate!"

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
