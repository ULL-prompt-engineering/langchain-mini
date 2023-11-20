// See https://serpapi.com/integrations/javascript#examples
const env = require("dotenv");
env.config('../.env');

const { getJson } = require("serpapi");
getJson({ 
  engine: "google",
  api_key: process.env.SERPAPI_API_KEY, // Get your API_KEY from https://serpapi.com/manage-api-key
  q: "coffee",
  location: "Austin, Texas",
}, (json) => {
  console.log(json["organic_results"]);
});