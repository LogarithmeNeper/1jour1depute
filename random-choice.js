/**
 * This file randomly chooses an id from the local database in a json file.
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
