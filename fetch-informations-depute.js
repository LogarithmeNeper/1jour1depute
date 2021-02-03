/**
 * This file fetches all required information from a specific MP (with its ids).
 * To execute : 
 * node fetch-information-depute.js
 * 
 * Authors : Corentin Forler, Pierre Sibut-Bourde, 2021.
 */

/**
 * Practical requirements.
 */
const { fetchHtml, parseHtml, flatten } = require('./utils.js');

const { promisify } = require('util');
const fs = require('fs');
const writeFile = promisify(fs.writeFile);


function getDocument(id) {
    const url = `https://www2.assemblee-nationale.fr/sycomore/fiche/(num_dept)/${id}`;
    return fetchHtml(url).then(parseHtml);
}

/**
 * Functions that extracts the URL of the principal image.
 * @param {Document} document 
 */
function getImageUrl(document) {
   const regex = /(.*)sycomore(.*)$/;
   return [...document.querySelectorAll('img')]
   .map(elem => elem.src.match(regex)?.[0])
   .filter(x => x!=null);
}