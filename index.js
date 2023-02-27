const express = require('express');
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();


const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);




const textGeneration = async (prompt) => {

    try {
        const response = await openai.createCompletion({
            // Fine-tuned model
            model:'text-davinci-003',
            //prompt: "This is a discussion between a therapist named Hope and a patient \n\n\n\nHope: Good morning! How are you today?\n\nPatient: Hi Hope. I'm feeling kind of down. I'm not sure why.\n\nHope: It's okay to feel down sometimes. Can you tell me a bit more about why you're feeling this way?",

            prompt: `Human: ${prompt}\nAI: `,
            temperature: 0.7,
            max_tokens: 256,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
          });
    
        return {
            status: 1,
            response: `${response.data.choices[0].text}`
        };
    } catch (error) {
        return {
            status: 0,
            response: ''
        };
    }
};


const webApp = express();

const PORT = 5500;

webApp.use(express.urlencoded({ extended: true }));
webApp.use(express.json());
webApp.use((req, res, next) => {
    console.log(`Path ${req.path} with Method ${req.method}`);
    next();
});


webApp.get('/', (req, res) => {
    res.sendStatus(200);
});


webApp.post('/dialogflow', async (req, res) => {
    
    let action = req.body.queryResult.action;
    let queryText = req.body.queryResult.queryText;

    if (action === 'input.unknown') {
        let result = await textGeneration(queryText);
        if (result.status == 1) {
            res.send(
                {
                    fulfillmentText: result.response
                }
            );
        } else {
            res.send(
                {
                    fulfillmentText: `Sorry, I don't know`
                }
            );
        }
    } else {
        res.send(
            {
                fulfillmentText: `No handler for the action ${action}.`
            }
        );
    }
});

webApp.listen(PORT, () => { 
    console.log(`Server is up and running at ${PORT}`);
});


/*

const express = require("express");
require("actions-on-google")
// require('dotenv').config();
const axios = require('axios');
const { WebhookClient } = require("dialogflow-fulfillment");
const app = express();
app.post("/dialogflow", express.json(), (req, res) => {
    const agent = new WebhookClient({ request: req, response: res });
    let intentMap = new Map();
    intentMap.set("Default Welcome Intent", welcome);
    intentMap.set("Default Fallback Intent", queryGPT);
    agent.handleRequest(intentMap);
  
    function welcome(agent) {
      agent.add('Hi, I am your virtual personal mental health assistant. How are you doing today?');
  }
  
  async function queryGPT(agent) {
      // agent.add('Sorry! I am unable to understand this at the moment. I am still learning humans. You can pick any of the service that might help me.');
      const instance = axios.create({
        baseURL: 'https://api.openai.com/v1/',
        headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      });
    
      const dialog = [
        `The following is a conversation with an AI assistant that can have meaningful conversations with users. The assistant is helpful, empathic, and friendly. Its objective is to make the user feel better by feeling heard. With each response, the AI assisstant prompts the user to continue the conversation in a natural way.
AI: Hello, I am your personal mental health AI assistant. How are you doing today?`,
      ];
      let query = agent.query;
      console.log('querytext ', query)
      dialog.push(`User: ${query}`);
      dialog.push('AI:');
      // agent.add(`you said ${query}`)
    
      const completionParmas = {
        model: "davinci:ft-personal-2023-02-25-08-19-56",
        prompt: dialog.join('\n'),
        max_tokens: 60,
        temperature: 0.85,
        n: 1,
        stream: false,
        logprobs: null,
        echo: false,
        stop: '\n',
      };
    
      try {
        const result = await instance.post('/engines/davinci/completions', completionParmas);
        const botResponse = result.data.choices[0].text.trim();
        agent.add(botResponse);
      } catch (err) {
        console.log(err);
        agent.add('Sorry. Something went wrong. Can you say that again?');
      }
    
  }
});
const port = 3000;
app.listen(port, () => console.log(`App listening on port ${port}!`))*/






