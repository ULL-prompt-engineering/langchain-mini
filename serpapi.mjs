import deb from "./deb.mjs";
import env from "dotenv";
env.config();
const question = process.argv[2] || "What is the current year?";

import SerpApi from 'google-search-results-nodejs';
const search = new SerpApi.GoogleSearch(process.env.SERPAPI_API_KEY);

const params = {
  q: question, // "query" 
  hl: "en", // "Google UI Language"
  gl: "us", // "Google Country",
  num: 1,   // "Number of results"
  //google_domain: "Google Domain", Parameter defines the Google domain to use. It defaults to google.com. Head to the Google domains page for a full list of supported Google domains
  //location: "Location Requested", where you want the search to originate. If several locations match the location requested, It'll pick the most popular one.
  //device: It can be set to desktop (default) to use a regular browser, tablet to use a tablet browser (currently using iPads), or mobile to use a mobile browser.
  //safe: "Safe Search Flag",
  //start: "Pagination Offset", See https://serpapi.com/search-api#api-parameters-pagination. It skips the given number of results. It's used for pagination.
  //api_key: "Your SERP API Key",  // https://serpapi.com/dashboard
  //tbm: "nws|isch|shop", "to be matched": parameter defines the type of search you want to do. Images, videos
  //tbs: "custom to be search criteria", // (to be searched) parameter defines advanced search parameters that aren't possible in the regular query field. (e.g., advanced search for patents, dates, news, videos, images, apps, or text contents).
  //async: true|false,   // allow async query
  //output: "json|html", // output format
};

const callback = function(data) {
  console.log(deb(data)); 
};

search.json(params, callback); 