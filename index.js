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
  console.log('<main>', 'running...');

  const id = await randomChoice();
  if (id == null) {
    console.error('<main>', 'id is undefined');
    return;
  }
  console.log('<main>', 'id:', id);

  const depute = await getDeputeAsObject(id);
  console.log('<main>', 'depute:', depute);
  // const imageData = (await got(depute.imageUrl)).body; // TODO: check exists

  const tweetTexts = deputeToTweets(depute);
  console.log('<main>', 'tweetTexts:', tweetTexts);
  const tweets = tweetTexts.map(text => ({ text }));
  console.log('<main>', 'tweets:', tweets);

  const api = API();
  console.log('<main>', 'api:', api);

  console.log('<main>', 'tweeting…');
  await api.tweetThread(tweets);

  console.log('<main>', 'done.');
}

main().catch(err => {
  console.error('ERROR');
  console.error(err);
});
