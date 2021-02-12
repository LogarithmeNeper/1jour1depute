/**
 * Entry point of the program.
 *
 * Authors : Corentin Forler, Pierre Sibut-Bourde, 2021.
 */

const { randomChoice } = require('./random-choice');
const { getDeputeAsObject } = require('./fetch-informations-depute');
const { deputeToTweets } = require('./stringify-depute');
const { API } = require('./api');

async function main() {
  const dryRun = (process.argv[2] === 'dry-run');
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

main().catch(err => {
  console.error('ERROR');
  console.error(err);
});
