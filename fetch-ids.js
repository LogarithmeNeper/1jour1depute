const { fetchHtml, parseHtml, flatten } = require('./utils.js');

const { promisify } = require('util');
const fs = require('fs');
const writeFile = promisify(fs.writeFile);

/**
 * @param {Document} document
 * @returns {string[]}
 */
function extractIds(document) {
  const regex = /\(num_dept\)\/(\d+)$/;
  return [...document.querySelectorAll('table a')]
    .map(anchor => anchor.getAttribute('href').match(regex))
    .filter(x => x != null)
    .map(match => match[1]);
}

/**
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
 * @returns {Promise<string[]>}
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
  console.log('Fetching ids…');
  const ids = await fetchAllIds();
  console.log('Done.');

  console.log();

  const path = './ids.json';
  console.log(`Writing ${ids.length} ids to ${path}…`);
  await writeFile(path, JSON.stringify(ids));
  console.log('Done.');
}

main().catch(console.error);
