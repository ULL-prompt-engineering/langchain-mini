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

For more information about this project, read the accompanying blogpost - [Re-implementing LangChain in 100 lines of code](https://blog.scottlogic.com/2023/05/04/langchain-mini.html)

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

### How many five year periods are in the current year? Be accurate!

You can now run the chain:

```
➜  langchain-mini git:(main) ✗ node index.mjs
How can I help? How many five year periods are in the current year? Be accurate!
```

We input our question, and here is the trace of the console.logs:

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
