// See https://serpapi.com/integrations/javascript#examples
const env = require("dotenv");
env.config({ path: '../.env'});

const { getJson } = require("serpapi");
getJson({ 
  engine: "google",
  api_key: process.env.SERPAPI_API_KEY, // Get your API_KEY from https://serpapi.com/manage-api-key
  q: "current president of Spain",
  location: "Spain",
  num: 1,
}, (json) => {
  console.log(json["organic_results"]);
});