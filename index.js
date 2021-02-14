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

async function main(dryRun = false) {
  console.log('running...');
  if (dryRun) {
    console.log('DRY RUN');
  }

  const id = await randomChoice(dryRun);
  if (id == null) {
    console.error('id is undefined');
    return;
  }
  console.log('id:', id);

  const depute = await getDeputeAsObject(id);
  // const imageData = (await got(depute.imageUrl)).body; // TODO: check exists

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
  });
}
