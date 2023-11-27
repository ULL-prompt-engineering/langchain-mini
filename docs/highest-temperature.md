# Tracing "What was the highest temperature (in Celsius) in Santa Cruz de Tenerife yesterday?"


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
