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

const { promisify } = require('util');
const fs = require('fs');

const { fetchHtml, parseHtml, flatten } = require('./utils.js');
const { RedisClient } = require('./redis-client.js');
const writeFile = promisify(fs.writeFile);

/**
 * Function that extracts ids from the document with a regular expression. See below.
 * Returns an Array of strings.
 * @param {Document} document
 * @returns {number[]}
 */
function extractIds(document) {
  /**
   * This regular expression matches anything with (num_dept)/$id/.
   * In the database, ids are stored in urls of this type.
   * We therefore catch this expression in the href tag, and we only retain $id as a number.
   */
  const regex = /\(num_dept\)\/(\d+)$/;
  return [...document.querySelectorAll('table a')]
    .map(anchor => anchor.getAttribute('href').match(regex))
    .filter(x => x != null)
    .map(match => +match[1]);
}

/**
 * Function to generate the URLs of the database.
 * Constructs with an Array of integers (0, 500, ..., 32*500) by default an array of strings.
 * This array are the links to directly request on the website of the Assemblée Nationale.
 * @param {number} increment
 * @param {number} nbMax
 * @returns {string[]}
 */
function generateUrls(increment = 500, nbMax = 33) {
  const offsets = Array.from({length: nbMax}, (_, i) => increment * i);
  const urls = offsets.map(offset => `https://www2.assemblee-nationale.fr/sycomore/resultats/(offset)/${offset}/`);
  return urls;
}

/**
 * Main function.
 * 1/ Generates URLs.
 * 2/ Gets an array of Promises on URLs.
 * 3/ Awaits the directions of a general Promise, stores in a constant.
 * 4/ Concatenates and flattens to a single array of numbers (represents all the ids of the URLs)
 * @returns {Promise<number[]>}
 */
async function fetchAllIds() {
  const urls = generateUrls();
  const promises = urls.map(url => fetchHtml(url)
    .then(parseHtml)
    .then(extractIds)
  );
  const results = await Promise.all(promises);
  return flatten(results);
}

/**
 * Main function
 */
async function main() {
  console.log('Fetching ids');
  const ids = await fetchAllIds();
  console.log('↳ Done.');

  console.log();

  const path = './ids.json';
  console.log(`Writing ${ids.length} ids to file ${path}`);
  await writeFile(path, JSON.stringify(ids));
  console.log('↳ Done.');
}

/**
 * Main function using redis
 */
async function mainRedis() {
  console.log('Fetching ids');
  const ids = await fetchAllIds();
  console.log('↳ Done.');

  console.log();

  const key = 'all-ids';
  console.log(`Writing ${ids.length} ids to redis key '${key}'`);
  const redisClient = RedisClient();
  await redisClient.set(key, JSON.stringify(ids));
  console.log('↳ Done.');
}


if (process.argv[2] === 'redis') {
  mainRedis().catch(console.error);
} else if (process.argv[2] === 'fs') {
  main().catch(console.error);
} else {
  console.log('Usage: node fetch-ids.js <storage>');
  console.log('       <storage>: redis | fs');
}
