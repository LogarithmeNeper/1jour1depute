/**
 * Useful functions.
 * 
 * Authors : Corentin Forler, Pierre Sibut-Bourde, 2021.
 */

const got = require('got');
const { JSDOM } = require('jsdom');

/**
 * @param {string} url
 * @returns {string} html
 */
module.exports.fetchHtml = async (url) => {
  const response = await got(url);
  return response.body;
};

/**
 * @param {string} html
 * @returns {Document} document
 */
module.exports.parseHtml = (html) => {
  return (new JSDOM(html)).window.document;
};

/**
 * @param {unknown[][]} arrays
 * @returns {unknown[]}
 */
module.exports.flatten = (arrays) => {
  return Array.prototype.concat(...arrays);
};

/**
 * The zip() function takes arrays and aggregates them in a list of tuples
 * @param {any[][]} rows
 * @returns {any[][]}
 */
module.exports.zip = (...rows) => rows[0].map((_, c) => rows.map(row => row[c]));
