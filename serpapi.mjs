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

search.json(params, callback); 