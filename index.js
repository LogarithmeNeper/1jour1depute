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
  console.error('main()');
  const id = await randomChoice();
  console.error('<main>', 'id:', id);
  const depute = await getDeputeAsObject(id);
  console.error('<main>', 'depute:', depute);
  // const imageData = (await got(depute.imageUrl)).body; // TODO: check exists

  const tweetTexts = deputeToTweets(depute);
  console.error('<main>', 'tweetTexts:', tweetTexts);
  const tweets = tweetTexts.map(text => ({ text }));
  console.error('<main>', 'tweets:', tweets);

  const api = API();
  console.error('<main>', 'api:', api);

  console.error('<main>', 'tweeting…');
  await api.tweetThread(tweets);

  console.error('<main>', 'done.');
}

console.error('starting');
main().catch(err => {
  console.error('ERROR');
  console.error(err);
});
