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
const { RedisClient } = require('./redis-client.js');

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
async function randomChoice() {
  const redisClient = RedisClient();
  
  const allIds = JSON.parse((await redisClient.get('all-ids'))??'[]');
  const usedIds = JSON.parse((await redisClient.get('used-ids'))??'[]');

  const nonUsedIds = allIds.filter(x => !usedIds.includes(x));
  if (nonUsedIds.length === 0) {
    return;
  }

  // Pick a random non-used id
  const randomId = pickRandom(nonUsedIds);

  // Update the list of used ids
  usedIds.push(randomId);
  await redisClient.set('used-ids', JSON.stringify(usedIds)); // await that writing is done in the DB.

  return randomId;
}

module.exports = { randomChoice };
