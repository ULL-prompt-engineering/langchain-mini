## How the Google Search API works

To get a Google Search API key, you can sign in with your google or your GitHub accounts [SerpApi](https://serpapi.com/) account (You need to verify your email and your phone).

[![/images/serpapi-sign-in.png](/images/serpapi-sign-in.png)](https://serpapi.com/) 

Here is the function inside [/src/tools.mjs](/src/tools.mjs) that uses the SerpApi to answer a  question:

```js
// use serpapi to answer the question
const googleSearch = async (question) => {
  console.log(purple(`Google search question: ${question}\n***********`));

  let answer = await fetch(
    `https://serpapi.com/search?api_key=${process.env.SERPAPI_API_KEY}&q=${question}`
  ).then((res) => res.json()).then(
      (res) =>
        // try to pull the answer from various components of the response
        res.answer_box?.answer ||
        res.answer_box?.snippet ||
        res.organic_results?.[0]?.snippet
    );
  console.log(purple(`Google search answer: ${answer}\n***********`));
  return answer;
}
```

Consulting the [Google Search Engine Results API](https://serpapi.com/search-api) we can see that the `/search` API endpoint allows us to scrape the results from Google search engine via our SerpApi service. 

We can also see that the `q` parameter is required and defines the query we want to search. 

You can use anything that you would use in a [regular Google search](/docs/google-search.md). e.g. `inurl:`, `site:`, `intitle:`. See the [full list](https://serpapi.com/advanced-google-query-parameters) of supported advanced search query parameters.

They also support [advanced search query parameters](https://www.google.com/support/enterprise/static/gsa/docs/admin/current/gsa_doc_set/xml_reference/request_format.html) such as `as_dt` or `as_eq`

* `as_dt` modifies the `as_sitesearch` parameter 
  * `i`: Include only results in the web directory specified by `as_sitesearch`
  * `e`: Exclude all results in the web directory specified by `as_sitesearch`. For example, to exclude results, use `as_dt=e`.
* `as_eq`  excludes the specified terms from the search results. 
  * For example, to filter out results that contain the term `deprecated`, use `as_eq=deprecated`. 

The [api-key](https://serpapi.com/search-api#api-parameters-serpapi-parameters-api-key) is also required and defines the **SerpApi** private key to use. That is why we provide it in the fetch request:

```js 
fetch(`https://serpapi.com/search?api_key=${process.env.SERPAPI_API_KEY}&q=${question}`);
```

makes an HTTP GET request to the SERP API (Search Engine Results Page API) provided by `serpapi.com`. 

See the [full list](https://serpapi.com/advanced-google-query-parameters) of supported advanced search query parameters.

The JSON output result from `res.json()` includes structured data for 

* <a href="https://serpapi.com/organic-results">organic results</a> Google search main results are called organic results. Is an array. For each organic result, we are able to extract its `snippet` `answers` and more. 
* <a href="https://serpapi.com/local-pack">local results</a>, 
* <a href="https://serpapi.com/google-ads">ad results</a>, 
* the <a href="https://serpapi.com/knowledge-graph">knowledge graph</a>,
* <a href="https://serpapi.com/direct-answer-box-api">direct answer boxes</a>, 
* <a href="https://serpapi.com/images-results">images results</a>, 
* <a href="https://serpapi.com/news-results">news results</a>, 
* <a href="https://serpapi.com/shopping-results">shopping results</a>,
*  <a href="https://serpapi.com/videos-results">video results</a>, and more.
  
The code at [serpapi/serpapi.mjs](serpapi/serpapi.mjs) illustrates how to use the SerpApi to answer a simple question:

```js
import deb from "./deb.mjs";
import env from "dotenv";
env.config();

import SerpApi from 'google-search-results-nodejs';
const search = new SerpApi.GoogleSearch(process.env.SERPAPI_API_KEY);

const params = {
  q: "What is the current year?",
  hl: "en",
  gl: "us",
  num: 1, // ask for only one result
};

const callback = function(data) {
  console.log(deb(data)); 
};

ssearch.json(params, callback); 
```
Here is the (folded) output. Notice the field `snippet` of the first object in the array `organic_results`:

![serpapi](/images/serpapi.png)

See the full output in file [serpapi/serpapi-output.mjs](serpapi/serpapi-output.mjs).

The code example does not deal with errors. 
A search status is accessible through `search_metadata.status`. 
It flows this way: `Processing` -> `Success` || `Error`. 
If a search has failed, `error` will contain an error message. `search_metadata.id` is the search ID inside SerpApi.


## Execution of example serpapi.mjs

The question is: `What is the current year?`

```
➜  serpapi git:(dev) ✗ node serpapi.mjs
```

```js
{
  search_metadata: {
    id: '655f1de1797ac624bbc1bd3f',
    status: 'Success',
    json_endpoint: 'https://serpapi.com/searches/bc2f95df3a578b80/655f1de1797ac624bbc1bd3f.json',
    created_at: '2023-11-23 09:39:45 UTC',
    processed_at: '2023-11-23 09:39:45 UTC',
    google_url: 'https://www.google.com/search?q=What+is+the+current+year%3F&oq=What+is+the+current+year%3F&hl=en&gl=us&num=1&sourceid=chrome&ie=UTF-8',
    raw_html_file: 'https://serpapi.com/searches/bc2f95df3a578b80/655f1de1797ac624bbc1bd3f.html',
    total_time_taken: 0.53
  },
  search_parameters: {
    engine: 'google',
    q: 'What is the current year?',
    google_domain: 'google.com',
    hl: 'en',
    gl: 'us',
    num: '1',
    device: 'desktop'
  },
  search_information: {
    query_displayed: 'What is the current year?',
    total_results: 8600000000,
    time_taken_displayed: 0.33,
    menu_items: [
      {
        position: 1,
        title: 'Images',
        link: 'https://www.google.com/search?num=1&sca_esv=584815692&hl=en&gl=us&q=What+is+the+current+year%3F&tbm=isch&source=lnms&sa=X&ved=2ahUKEwiX-bLt6dmCAxUuFlkFHZr4AWEQ0pQJegQIFxAB',
        serpapi_link: 'https://serpapi.com/search.json?device=desktop&engine=google_images&gl=us&google_domain=google.com&hl=en&q=What+is+the+current+year%3F'
      },
      {
        position: 2,
        title: 'In the world',
        link: 'https://www.google.com/search?num=1&sca_esv=584815692&hl=en&gl=us&q=What+is+the+current+year+in+the+world&uds=H4sIAAAAAAAA_-MK4uLxzFMoyUhVKM8vykkRkgzPSCxRyCwGCyWXFhWl5pUoVKYmFtkbCBWp4pJUyEQywwi3GQBj95F1bwAAAA&sa=X&ved=2ahUKEwiX-bLt6dmCAxUuFlkFHZr4AWEQxKsJegQIFhAB&ictx=0',
        serpapi_link: 'https://serpapi.com/search.json?device=desktop&engine=google&gl=us&google_domain=google.com&hl=en&num=1&q=What+is+the+current+year+in+the+world'
      },
      {
        position: 3,
        title: 'In economics',
        link: 'https://www.google.com/search?num=1&sca_esv=584815692&hl=en&gl=us&q=What+is+current+year+in+economics%3F&uds=H4sIAAAAAAAA_-Py5-LxzFNITc7Py8_NTC4WkgzPSCxRyCxWKMlIVUguLSpKzStRqExNLLI3YCxSgkkiSyhkIum3N8JtAAAxRfRXbAAAAA&sa=X&ved=2ahUKEwiX-bLt6dmCAxUuFlkFHZr4AWEQxKsJegQIFRAB&ictx=0',
        serpapi_link: 'https://serpapi.com/search.json?device=desktop&engine=google&gl=us&google_domain=google.com&hl=en&num=1&q=What+is+current+year+in+economics%3F'
      },
      {
        position: 4,
        title: 'In 40k',
        link: 'https://www.google.com/search?num=1&sca_esv=584815692&hl=en&gl=us&q=What+is+the+current+year+in+40k%3F&uds=H4sIAAAAAAAA_-Ny52LzzFMwMcgWkgzPSCxRyCxWKMlIVUguLSpKzStRqExNLLI3YCxSwCWpkAnWbW-EWzsApSz-umQAAAA&sa=X&ved=2ahUKEwiX-bLt6dmCAxUuFlkFHZr4AWEQxKsJegQIFBAB&ictx=0',
        serpapi_link: 'https://serpapi.com/search.json?device=desktop&engine=google&gl=us&google_domain=google.com&hl=en&num=1&q=What+is+the+current+year+in+40k%3F'
      },
      {
        position: 5,
        title: 'In roman numerals',
        link: 'https://www.google.com/search?num=1&sca_esv=584815692&hl=en&gl=us&q=What+is+the+current+year+in+roman+numerals%3F&uds=H4sIAAAAAAAA_-OK5RL0zFMoys9NzFPIK81NLUrMKRaSDM9ILFHILFYoyUhVSC4tKkrNK1GoTE0ssjdgLNLGJamQiW6QvRFukwDQXSTLegAAAA&sa=X&ved=2ahUKEwiX-bLt6dmCAxUuFlkFHZr4AWEQxKsJegQIHRAB&ictx=0',
        serpapi_link: 'https://serpapi.com/search.json?device=desktop&engine=google&gl=us&google_domain=google.com&hl=en&num=1&q=What+is+the+current+year+in+roman+numerals%3F'
      },
      {
        position: 6,
        title: 'In Forgotten Realms',
        link: 'https://www.google.com/search?num=1&sca_esv=584815692&hl=en&gl=us&q=What+is+the+current+year+in+Forgotten+Realms%3F&uds=H4sIAAAAAAAA_-NK5BL2zFNwyy9Kzy8pSc1TCEpNzMktFpIMz0gsUcgsVijJSFVILi0qSs0rUahMTSyyN2As0sUlqZCJaZS9EW6zADIkE-d-AAAA&sa=X&ved=2ahUKEwiX-bLt6dmCAxUuFlkFHZr4AWEQxKsJegQIIBAB&ictx=0',
        serpapi_link: 'https://serpapi.com/search.json?device=desktop&engine=google&gl=us&google_domain=google.com&hl=en&num=1&q=What+is+the+current+year+in+Forgotten+Realms%3F'
      },
      {
        position: 7,
        title: 'In the MCU',
        link: 'https://www.google.com/search?num=1&sca_esv=584815692&hl=en&gl=us&q=What+is+the+current+year+in+the+MCU%3F&uds=H4sIAAAAAAAA_-Py5-LyzFMoyUhV8HUOFZIMz0gsUcgsBgsklxYVpeaVKFSmJhbZGzAWqeCSVMiEm2BvhNsIAPs-jmpsAAAA&sa=X&ved=2ahUKEwiX-bLt6dmCAxUuFlkFHZr4AWEQxKsJegQIIRAB&ictx=0',
        serpapi_link: 'https://serpapi.com/search.json?device=desktop&engine=google&gl=us&google_domain=google.com&hl=en&num=1&q=What+is+the+current+year+in+the+MCU%3F'
      },
      {
        position: 8,
        title: 'In Star Wars',
        link: 'https://www.google.com/search?num=1&sca_esv=584815692&hl=en&gl=us&q=What+is+the+current+year+in+Star+Wars%3F&uds=H4sIAAAAAAAA_-MK5uLxzFMILkksUghPLCoWkgzPSCxRyCxWKMlIVUguLSpKzStRqExNLLI3YCxSwyWpkIlkhr0RbkMAqa8Q4nAAAAA&sa=X&ved=2ahUKEwiX-bLt6dmCAxUuFlkFHZr4AWEQxKsJegQIHxAB&ictx=0',
        serpapi_link: 'https://serpapi.com/search.json?device=desktop&engine=google&gl=us&google_domain=google.com&hl=en&num=1&q=What+is+the+current+year+in+Star+Wars%3F'
      },
      {
        position: 9,
        title: 'In MHA',
        link: 'https://www.google.com/search?num=1&sca_esv=584815692&hl=en&gl=us&q=What+is+the+current+year+in+MHA%3F&uds=H4sIAAAAAAAA_-Ny52LzzFPw9XAUkgzPSCxRyCxWKMlIVUguLSpKzStRqExNLLI3YCxSwCWpkAnWbW-EWzsAnDz8dWQAAAA&sa=X&ved=2ahUKEwiX-bLt6dmCAxUuFlkFHZr4AWEQxKsJegQIHhAB&ictx=0',
        serpapi_link: 'https://serpapi.com/search.json?device=desktop&engine=google&gl=us&google_domain=google.com&hl=en&num=1&q=What+is+the+current+year+in+MHA%3F'
      }
    ],
    organic_results_state: 'Results for exact spelling'
  },
  organic_results: [
    {
      position: 1,
      title: 'What year is it? - Current Year today',
      link: 'https://www.saturdaygift.com/what-year-is-it/',
      displayed_link: 'https://www.saturdaygift.com › what-year-is-it',
      favicon: 'https://serpapi.com/searches/655f1de1797ac624bbc1bd3f/images/9d63f688f045ce9eed0fe2f29ba2a854e2cced37ddd01c1bfd30f4fc0cb0146e.png',
      snippet: "Gregorian calendar – the modern day calendar. The current year is 2023 and today's date (according to the Gregorian calendar) is Wednesday, November 22, 2023.",
      snippet_highlighted_words: [ '2023' ],
      sitelinks: {
        inline: [
          {
            title: "Today's Date",
            link: 'https://www.saturdaygift.com/what-year-is-it/#:~:text=Today%27s%20date,-Wednesday%2C%20November%2022%2C'
          },
          {
            title: 'Gregorian Calendar -- The...',
            link: 'https://www.saturdaygift.com/what-year-is-it/#:~:text=Gregorian%20calendar%20%2D%2D%20the%20modern%20day%20calendar'
          },
          {
            title: 'Chinese Calendar',
            link: 'https://www.saturdaygift.com/what-year-is-it/#:~:text=Chinese%20calendar,-According%20to%20the%20Chinese%20calendar'
          }
        ]
      },
      about_page_link: 'https://www.google.com/search?q=About+https://www.saturdaygift.com/what-year-is-it/&tbm=ilp',
      about_page_serpapi_link: 'https://serpapi.com/search.json?engine=google_about_this_result&google_domain=google.com&q=About+https%3A%2F%2Fwww.saturdaygift.com%2Fwhat-year-is-it%2F',
      cached_page_link: 'https://webcache.googleusercontent.com/search?q=cache:aoqISKOkr4MJ:https://www.saturdaygift.com/what-year-is-it/&hl=en&gl=us',
      source: 'Saturday Gift'
    }
  ],
  related_searches: [
    {
      block_position: 1,
      query: 'What is the current year in the world',
      link: 'https://www.google.com/search?num=1&sca_esv=584815692&hl=en&gl=us&q=What+is+the+current+year+in+the+world&sa=X&ved=2ahUKEwiX-bLt6dmCAxUuFlkFHZr4AWEQ1QJ6BAgQEAE',
      serpapi_link: 'https://serpapi.com/search.json?device=desktop&engine=google&gl=us&google_domain=google.com&hl=en&num=1&q=What+is+the+current+year+in+the+world'
    },
    {
      block_position: 1,
      query: 'what year is it really on earth',
      link: 'https://www.google.com/search?num=1&sca_esv=584815692&hl=en&gl=us&q=What+year+is+it+really+on+Earth&sa=X&ved=2ahUKEwiX-bLt6dmCAxUuFlkFHZr4AWEQ1QJ6BAgREAE',
      serpapi_link: 'https://serpapi.com/search.json?device=desktop&engine=google&gl=us&google_domain=google.com&hl=en&num=1&q=What+year+is+it+really+on+Earth'
    },
    {
      block_position: 1,
      query: 'current year date',
      link: 'https://www.google.com/search?num=1&sca_esv=584815692&hl=en&gl=us&q=Current+year+date&sa=X&ved=2ahUKEwiX-bLt6dmCAxUuFlkFHZr4AWEQ1QJ6BAgSEAE',
      serpapi_link: 'https://serpapi.com/search.json?device=desktop&engine=google&gl=us&google_domain=google.com&hl=en&num=1&q=Current+year+date'
    },
    {
      block_position: 1,
      query: 'what year is it scientifically',
      link: 'https://www.google.com/search?num=1&sca_esv=584815692&hl=en&gl=us&q=What+year+is+it+scientifically&sa=X&ved=2ahUKEwiX-bLt6dmCAxUuFlkFHZr4AWEQ1QJ6BAgTEAE',
      serpapi_link: 'https://serpapi.com/search.json?device=desktop&engine=google&gl=us&google_domain=google.com&hl=en&num=1&q=What+year+is+it+scientifically'
    },
    {
      block_position: 1,
      query: 'current year 2023',
      link: 'https://www.google.com/search?num=1&sca_esv=584815692&hl=en&gl=us&q=Current+year+2023&sa=X&ved=2ahUKEwiX-bLt6dmCAxUuFlkFHZr4AWEQ1QJ6BAgPEAE',
      serpapi_link: 'https://serpapi.com/search.json?device=desktop&engine=google&gl=us&google_domain=google.com&hl=en&num=1&q=Current+year+2023'
    },
    {
      block_position: 1,
      query: 'what year was i born',
      link: 'https://www.google.com/search?num=1&sca_esv=584815692&hl=en&gl=us&q=What+year+was+I+born&sa=X&ved=2ahUKEwiX-bLt6dmCAxUuFlkFHZr4AWEQ1QJ6BAgOEAE',
      serpapi_link: 'https://serpapi.com/search.json?device=desktop&engine=google&gl=us&google_domain=google.com&hl=en&num=1&q=What+year+was+I+born'
    },
    {
      block_position: 1,
      query: 'what year is it without christianity',
      link: 'https://www.google.com/search?num=1&sca_esv=584815692&hl=en&gl=us&q=What+year+is+it+without+Christianity&sa=X&ved=2ahUKEwiX-bLt6dmCAxUuFlkFHZr4AWEQ1QJ6BAgNEAE',
      serpapi_link: 'https://serpapi.com/search.json?device=desktop&engine=google&gl=us&google_domain=google.com&hl=en&num=1&q=What+year+is+it+without+Christianity'
    },
    {
      block_position: 1,
      query: 'what day of the year is it out of 365',
      link: 'https://www.google.com/search?num=1&sca_esv=584815692&hl=en&gl=us&q=What+day+of+the+year+is+it+out+of+365&sa=X&ved=2ahUKEwiX-bLt6dmCAxUuFlkFHZr4AWEQ1QJ6BAgMEAE',
      serpapi_link: 'https://serpapi.com/search.json?device=desktop&engine=google&gl=us&google_domain=google.com&hl=en&num=1&q=What+day+of+the+year+is+it+out+of+365'
    }
  ],
  pagination: {
    current: 1,
    next: 'https://www.google.com/search?q=What+is+the+current+year%3F&oq=What+is+the+current+year%3F&hl=en&gl=us&num=1&start=1&sourceid=chrome&ie=UTF-8',
    other_pages: {
      '2': 'https://www.google.com/search?q=What+is+the+current+year%3F&oq=What+is+the+current+year%3F&hl=en&gl=us&num=1&start=1&sourceid=chrome&ie=UTF-8',
      '3': 'https://www.google.com/search?q=What+is+the+current+year%3F&oq=What+is+the+current+year%3F&hl=en&gl=us&num=1&start=2&sourceid=chrome&ie=UTF-8',
      '4': 'https://www.google.com/search?q=What+is+the+current+year%3F&oq=What+is+the+current+year%3F&hl=en&gl=us&num=1&start=3&sourceid=chrome&ie=UTF-8',
      '5': 'https://www.google.com/search?q=What+is+the+current+year%3F&oq=What+is+the+current+year%3F&hl=en&gl=us&num=1&start=4&sourceid=chrome&ie=UTF-8'
    }
  },
  serpapi_pagination: {
    current: 1,
    next_link: 'https://serpapi.com/search.json?device=desktop&engine=google&gl=us&google_domain=google.com&hl=en&num=1&q=What+is+the+current+year%3F&start=1',
    next: 'https://serpapi.com/search.json?device=desktop&engine=google&gl=us&google_domain=google.com&hl=en&num=1&q=What+is+the+current+year%3F&start=1',
    other_pages: {
      '2': 'https://serpapi.com/search.json?device=desktop&engine=google&gl=us&google_domain=google.com&hl=en&num=1&q=What+is+the+current+year%3F&start=1',
      '3': 'https://serpapi.com/search.json?device=desktop&engine=google&gl=us&google_domain=google.com&hl=en&num=1&q=What+is+the+current+year%3F&start=2',
      '4': 'https://serpapi.com/search.json?device=desktop&engine=google&gl=us&google_domain=google.com&hl=en&num=1&q=What+is+the+current+year%3F&start=3',
      '5': 'https://serpapi.com/search.json?device=desktop&engine=google&gl=us&google_domain=google.com&hl=en&num=1&q=What+is+the+current+year%3F&start=4'
    }
  }
}
```

## Execution of example serpapi2.mjs

The question is: `Who is the president of Spain?`

```
➜  serpapi git:(dev) ✗ node serpapi2.js 
```

```js
[
  {
    position: 1,
    title: 'Pedro Sánchez Pérez-Castejón - President',
    link: 'https://www.lamoncloa.gob.es/lang/en/presidente/biografia/Paginas/index.aspx',
    displayed_link: 'https://www.lamoncloa.gob.es › biografia › Paginas',
    favicon: 'https://serpapi.com/searches/655f1dbda5ad6ddd9b17f248/images/3e408209959c211792a80e9f684d628fd3ed2c8dae17ba64ebfa01fea6a656f7.png',
    snippet: 'Pedro Sánchez has been President of the Government of Spain since June 2018. He holds a Doctorate in Economics and is General Secretary of the Spanish Socialist ...',
    snippet_highlighted_words: [ 'Pedro Sánchez' ],
    about_page_link: 'https://www.google.com/search?q=About+https://www.lamoncloa.gob.es/lang/en/presidente/biografia/Paginas/index.aspx&tbm=ilp',
    about_page_serpapi_link: 'https://serpapi.com/search.json?engine=google_about_this_result&google_domain=google.com&q=About+https%3A%2F%2Fwww.lamoncloa.gob.es%2Flang%2Fen%2Fpresidente%2Fbiografia%2FPaginas%2Findex.aspx',
    cached_page_link: 'https://webcache.googleusercontent.com/search?q=cache:BLMyQ7UALI0J:https://www.lamoncloa.gob.es/lang/en/presidente/biografia/Paginas/index.aspx&hl=en&gl=us',
    source: 'La Moncloa'
  }
]
```