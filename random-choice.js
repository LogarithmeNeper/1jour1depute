/**
 * This file randomly chooses an id from the local database in a json file, and uses it
 * if it has not been seen before.
 * To execute :
 * node random-choice.js
 *
 * Authors : Corentin Forler, Pierre Sibut-Bourde, 2021.
 */

/**
 * Practical requirements.
 */
const fs = require('fs');

const allIds = require('./ids.json');
const usedIds = require('./used-ids.json');

/**
 * Checks if there is still one id left.
 */
function isThereAnIdLeft() {
  return allIds.length !== usedIds.length;
}

/**
 * @param {Array} array
 * @returns {any}
 */
function pickRandom(array) {
  const index = Math.floor(Math.random() * array.length);
  return array[index];
}

/**
 * Functions that returns a random element from the ids.
 * @returns {number | undefined}
 */
function randomChoice() {
  const nonUsedIds = allIds.filter(x => !usedIds.includes(x));
  if (nonUsedIds.length === 0) {
    return;
  }

  // Pick a random non-used id
  const randomId = pickRandom(nonUsedIds);

  // Update the list of used ids
  usedIds.push(randomId);
  fs.writeFileSync('./used-ids.json', JSON.stringify(usedIds));

  return randomId;
}

module.exports = { randomChoice };
