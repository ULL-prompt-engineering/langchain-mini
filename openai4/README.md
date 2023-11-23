## Chat Completions API

The Chat Completions API is a general-purpose tool for building chatbots and dialogue systems.

```js
const completion = await openai.chat.completions.create({
    messages: [{"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Who won the world series in 2020?"},
        {"role": "assistant", "content": "The Los Angeles Dodgers won the World Series in 2020."},
        {"role": "user", "content": "Where was it played?"}],
    model: "gpt-3.5-turbo",
  });
```

Messages must be an array of message objects, where each object has a **`role`** and a **`content`**. 
The `role` can be  

1. "`system`", 
2. "`user`", or 
3. "`assistant`" 


Conversations can be as short as one message or many back and forth turns.

Typically, a conversation is formatted with 

1. a **system message** first, followed by 
2. alternating **user** and **assistant** messages.

The **system message** helps set the behavior of the assistant. 
For example, you can 

- modify the **personality** of the assistant or 
- provide specific instructions about how it should behave throughout the conversation.

**Assistant messages** store previous assistant responses, **but can also be written by you to give examples of desired behavior**.

## Prices

The following paragraph has 35 words and 35 tokens:

```
✗ echo 'Multiple models, each with different capabilities and price points.
Prices are per 1,000 tokens.
You can think of tokens as pieces of words, where 1,000 tokens is about 750 words.
This paragraph is 35 tokens.' | wc
       4      35     211
```

See <https://openai.com/pricing>

Here is an example of cost and usage:

| Cost                          | Usage |
| ---                           | --- |
| ![](../images/usage-cost.png) | ![](../images/usage-activity.png) |


It is a paymnet system based on tokens.