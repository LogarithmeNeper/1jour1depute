const got = require('got');
const { Window } = require('happy-dom');

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
  const window = new Window();
  window.document.body.innerHTML = html;
  return window.document;
};

/**
 * @param {unknown[][]} arrays
 * @returns {unknown[]}
 */
module.exports.flatten = (arrays) => {
  return Array.prototype.concat(...arrays);
};
