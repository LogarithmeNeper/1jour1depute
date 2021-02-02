/**
 * Practical requirements.
 */
const jsonInput = require('./ids.json');

/**
 * Functions that returns a random element from the ids.
 */
function randomChoice() {
    const index = Math.floor(Math.random()*jsonInput.length);
    return jsonInput[index];
}

console.log(randomChoice());