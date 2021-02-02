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
const fs = require('fs')

const jsonInput = require('./ids.json');
const jsonOutput = require('./used-ids.json');

/**
 * Checks if there is still one id left.
 * Can be done lazily thanks to the check in randomChoice().
 */
function isThereAnIdLeft() {
    return !(jsonInput.length==jsonOutput.length)
}

/**
 * Functions that returns a random element from the ids.
 */
function randomChoice() {
    const index = Math.floor(Math.random()*jsonInput.length);
    const randomId = jsonInput[index];

    
    if(jsonOutput.includes(randomId)) {
        randomChoice()
    }
    else {
        jsonOutput.push(randomId);
        fs.writeFileSync('./used-ids.json', JSON.stringify(jsonOutput));
        return randomId;
    }
}

console.log(isThereAnIdLeft())