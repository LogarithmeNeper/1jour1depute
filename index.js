/**
 * Entry point of the program.
 *
 * Authors : Corentin Forler, Pierre Sibut-Bourde, 2021.
 */

const { randomChoice } = require('./random-choice');
const { getDeputeAsObject } = require('./fetch-informations-depute');
const { deputeToTweets } = require('./stringify-depute');
const { API } = require('./api');

const now = new Date();
const target = new Date();
target.setUTCHours(10, 0, 0);

const dt = ((+now) - (+target)) / 1000;
const shouldRun = Math.abs(dt) <= (5 * 60);
const dryRun = (process.argv[2] === 'dry-run');

function isDeputeValid(depute) {
  return (depute.mandats.length > 0);
}

async function main(dryRun = false, nRetries = 3) {
  if (dryRun) {
    console.log('dry run...');
  } else {
    console.log('running...');
  }

  const id = await randomChoice(dryRun);
  if (id == null) {
    console.error('id is null or undefined');
    return process.exit(13);
  }
  console.log('id:', id);

  const depute = await getDeputeAsObject(id);
  // const imageData = (await got(depute.imageUrl)).body; // TODO: check exists

  if (!isDeputeValid(depute)) {
    if (nRetries <= 1) {
      console.error('failed (too many attempts)');
      return process.exit(11);
    } else {
      return await main(dryRun, nRetries - 1); // loop
    }
  }

  const tweetTexts = deputeToTweets(depute);
  const tweets = tweetTexts.map(text => ({ text }));

  if (!dryRun) {
    const api = API();
    await api.tweetThread(tweets);
  } else {
    console.log(depute);
    console.log(tweets);
  }

  console.log('done.');
}

if (shouldRun || dryRun) {
  main(dryRun).catch(err => {
    console.error('ERROR');
    console.error(err);
    process.exit(12);
  });
}

/* 
Fix on branch and try beforehand :

const now = changeTimezone(new Date(), 'Europe/Paris');
const time = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
const shouldRun = time > '10:57' && time < '11:03';
const dryRun = (process.argv[2] === 'dry-run');

if (shouldRun || dryRun) {
  if (dryRun) {
    console.log(`shouldRun = ${shouldRun}`);
  }
  main(dryRun).catch(err => {
    console.error('ERROR');
    console.error(err);
    process.exit(12);
  });
}

// https://stackoverflow.com/a/53652131
function changeTimezone(date, ianatz) {
  const invdate = new Date(date.toLocaleString('en-US', { timeZone: ianatz }));
  const diff = date.getTime() - invdate.getTime();
  return new Date(date.getTime() - diff);
}

and delete lines 64-70
*/