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
const { fetchHtml, parseHtml, zip } = require('./utils');

/**
 * @typedef {{
 * anneeDebut?: number;
 * anneeFin?: number;
 * regimePolitique?: string;
 * legislature?: string;
 * departement?: string;
 * groupe?: string;
 * }} Mandat
 */

/**
 * @typedef {{
 * nomComplet?: string
 * anneeNaissance?: number
 * anneeDeces?: number
 * mandats?: Mandat[]
 * imageUrl?: string
 * }} Depute
 */

/**
 * @param {number} id The unique identifier of the député
 * @returns {Promise<Depute>}
 */
async function getDeputeAsObject(id) {
  const document = await getDocument(id);
  const nomComplet = getNomComplet(document);
  const [anneeNaissance, anneeDeces] = getAnneesVie(document);
  const mandats = getMandats(document);

  /** @type {Depute} */
  const depute = {
    nomComplet,
    anneeNaissance,
    anneeDeces,
    mandats,
    imageUrl: getImageUrl(id),
    bdUrl: `https://www2.assemblee-nationale.fr/sycomore/fiche/(num_dept)/${id}`,
    hasBio: hasBio(document),
  };
  return depute;
}

/**
 * @param {Document} document
 * @returns {boolean}
 */
function hasBio(document) {
  return document.querySelector('[href="#bio"]') !== null;
}

/**
 * @param {Document} document
 * @returns {string}
 */
function getNomComplet(document) {
  const el = document.querySelector('#haut-contenu-page > article > div.titre-bandeau-bleu > h1');
  return el.textContent;
}

/**
 * @param {Document} document
 * @returns {[number, number] | [number] | []}
 */
function getAnneesVie(document) {
  const el = document.querySelector('#haut-contenu-page > article > div.titre-bandeau-bleu > p');
  const m = el.textContent.match(/(\d{4})/g);
  if (m) {
    return m.map(x => +x);
  } else {
    return [];
  }
}

/**
 * @param {Document} document
 * @returns {Mandats[]}
 */
function getMandats(document) {
  const mandats = [];
  const elements = document.querySelectorAll('#mandats_an > dl');
  for (const el of elements) {
    const mandat = extractMandatFromElement(el);
    mandats.push(mandat);
  }
  return mandats.sort((a, b) => b.anneeDebut - a.anneeDebut); // dans l'ordre antichronologique
}

/**
 * Extracts a Mandat from an HTMLElement
 * @param {HTMLElement} el
 * @returns {Mandat}
 */
function extractMandatFromElement(el) {
  /** @type {Mandat} */
  const mandat = {};

  const terms = [...el.querySelectorAll('dt')];
  const defs = [...el.querySelectorAll('dd')];

  const keyValuePairs = zip(terms, defs);
  for (const [termEl, defEl] of keyValuePairs) {
    const text = defEl.textContent.trim();
    const term = termEl.textContent.trim();
    switch (term) {
      case 'Régime politique':
        mandat.regimePolitique = text;
        break;
      case 'Législature':
        mandat.legislature = text;
        break;
      case 'Mandat': {
        const m = text.match(/(\d{4})/g);
        if (m) {
          [mandat.anneeDebut, mandat.anneeFin] = m;
        }
        break;
      }
      case 'Département':
        mandat.departement = text;
        break;
      case 'Groupe':
        mandat.groupe = text;
        break;
    }
  }

  return mandat;
}

/**
 * Function that gets the document body given an id.
 * @param {number} id
 * @returns {Promise<Document>}
 */
function getDocument(id) {
  const url = `https://www2.assemblee-nationale.fr/sycomore/fiche/(num_dept)/${id}`;
  return fetchHtml(url).then(parseHtml);
}

/**
 * Functions that directly guess the URL of the main image.
 * @param {Document} document
 */
function getImageUrl(id) {
  return `https://www2.assemblee-nationale.fr/static/sycomore/jpg/${id}.jpg`;
}

module.exports = { getDeputeAsObject };
