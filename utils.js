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
