/**
 * This file fetches all the ids.
 * To execute : 
 * node fetch-ids.js
 * 
 * Authors : Corentin Forler, Pierre Sibut-Bourde, 2021.
 */

 
/**
 * Practical requirements.
 */
const got = require("got");
const {Window} = require("happy-dom");
const fs = require("fs");

/**
 * Asynchronous function that gives the body of the URL string in parameter.
 * Returns a Promise.
 * @param {string} url : Target URL.
 */
async function fetchHtml(url) {
  const response = await got(url);
  return response.body;
}

/**
 * Functions that parses the HTML given in parameter.
 * @param {} html : HTML to be parsed.
 */
function parseHtml(html) {
  const window = new Window();
  window.document.body.innerHTML = html
  return window.document;
}

/**
 * Function that extracts ids from the document with a regular expression. See below.
 * Returns an Array of strings.
 * @param {} document 
 */
function extractIds(document) {
  /**
   * This regular expression matches anything with (num_dept)/$id/.
   * In the database, ids are stored in urls of this type. 
   * We therefore catch this expression in the href tag, and gets only $id. 
   */
  const regex = /\(num_dept\)\/(\d+)$/
  return [...document.querySelectorAll('table a')]
  .map(anchor => anchor.getAttribute('href').match(regex))
  .filter(x => x != null)
  .map(match => match[1]);
}

/**
 * Function to generate the URLs of the database.
 * Constructs with an Array of integers (0, 500, ..., 32*500) by default an array of strings.
 * This array are the links to directly request on the website of the Assemblée Nationale.
 * @param {int} increment 
 * @param {int} nbMax 
 */
function generateUrls(increment=500, nbMax=33) {
  const offsets = Array.from({length: nbMax}, (_, i) => increment*i);
  const urls = offsets.map(offset => `https://www2.assemblee-nationale.fr/sycomore/resultats/(offset)/${offset}/`);
  return urls;
}

/**
 * Main function.
 * 1/ Generates URLs.
 * 2/ Gets an array of Promises on URLs.
 * 3/ Awaits the directions of a general Promise, stores in a constant.
 * 4/ Concatenates and flattens to a single array of strings (represents all the ids of the URLs)
 */
async function main() {
  const urls = generateUrls();
  const promises = urls.map(url => 
    fetchHtml(url)
    .then(parseHtml)
    .then(extractIds)
  )
  const results = await Promise.all(promises);
  return Array.prototype.concat([], ...results);
}

/**
 * Stores in a local JSON file.
 */
main().then(ids => {
  fs.writeFile("./ids.json", JSON.stringify(ids), () => console.log("OK!"))
});