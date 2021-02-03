/**
 * This file fetches all required information from a specific MP (with its ids).
 * To execute : 
 * node fetch-information-depute.js
 * 
 * Authors : Corentin Forler, Pierre Sibut-Bourde, 2021.
 */


/**
 * Functions that extracts the URL of the principal image.
 * @param {Document} document 
 */
function getImageUrl(document) {
   const regex = /(.*)sycomore(.*)$/;
   return [...document.querySelectorAll('img')]
   .map(elem => elem.src.match(regex)?.[0])
   .filter(x => x!=null)
}