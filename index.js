const got = require('got');
const { randomChoice } = require('./random-choice');
const { getDeputeAsObject } = require('./fetch-informations-depute');
const { deputeToTweets } = require('./stringify-depute');
const { API } = require('./api');

async function main() {
  const id = 516; // randomChoice()
  const depute = await getDeputeAsObject(id);
  // const imageData = (await got(depute.imageUrl)).body; // TODO: check exists

  const tweetTexts = deputeToTweets(depute);
  const tweets = tweetTexts.map(text => ({ text }));

  console.log(tweets);

  // const api = API();
  // await api.tweetThread(tweets);
}

main().catch(err => {
  console.error('ERROR');
  console.log(JSON.stringify(err, null, 2));
});
