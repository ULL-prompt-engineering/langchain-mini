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

You can now run the chain:

~~~
➜  langchain-mini git:(develop) ✗ npm test

> langchain-mini@1.0.0 test
> node index.mjs

How can I help? Who is Olivia Wilde's boyfriend? What is his current age raised to the 0.23 power?
(node:85168) ExperimentalWarning: The Fetch API is an experimental feature. This feature could change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
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

Question: Who is Olivia Wilde's boyfriend? What is his current age raised to the 0.23 power?
Thought:
 I need to find out Olivia Wilde's boyfriend and then calculate his age raised to the 0.23 power.
Action: search
Action Input: "Olivia Wilde's boyfriend"

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

Question: Who is Olivia Wilde's boyfriend? What is his current age raised to the 0.23 power?
Thought: I need to find out Olivia Wilde's boyfriend and then calculate his age raised to the 0.23 power.
Action: search
Action Input: "Olivia Wilde's boyfriend"
Observation: Wilde began dating American actor and comedian Jason Sudeikis in November 2011. They became engaged in January 2013. The couple have two children: a son, born in 2014, and a daughter, born in 2016.

Thought: I need to find out Jason Sudeikis' age
Action: search
Action Input: "Jason Sudeikis age"

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

Question: Who is Olivia Wilde's boyfriend? What is his current age raised to the 0.23 power?
Thought: I need to find out Olivia Wilde's boyfriend and then calculate his age raised to the 0.23 power.
Action: search
Action Input: "Olivia Wilde's boyfriend"
Observation: Wilde began dating American actor and comedian Jason Sudeikis in November 2011. They became engaged in January 2013. The couple have two children: a son, born in 2014, and a daughter, born in 2016.
Thought: I need to find out Jason Sudeikis' age
Action: search
Action Input: "Jason Sudeikis age"
Observation: 47 years

Thought: I now know the age and can calculate the result
Action: calculator
Action Input: 47^0.23

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

Question: Who is Olivia Wilde's boyfriend? What is his current age raised to the 0.23 power?
Thought: I need to find out Olivia Wilde's boyfriend and then calculate his age raised to the 0.23 power.
Action: search
Action Input: "Olivia Wilde's boyfriend"
Observation: Wilde began dating American actor and comedian Jason Sudeikis in November 2011. They became engaged in January 2013. The couple have two children: a son, born in 2014, and a daughter, born in 2016.
Thought: I need to find out Jason Sudeikis' age
Action: search
Action Input: "Jason Sudeikis age"
Observation: 47 years
Thought: I now know the age and can calculate the result
Action: calculator
Action Input: 47^0.23
Observation: 2.4242784855673896

Final Answer: Jason Sudeikis, Olivia Wilde's boyfriend, is 47 years old and his age raised to the 0.23 power is 2.4242784855673896.
Jason Sudeikis, Olivia Wilde's boyfriend, is 47 years old and his age raised to the 0.23 power is 2.4242784855673896.
How can I help?  
~~~

