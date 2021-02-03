const got = require('got');
const { getDeputeAsObject } = require('./fetch-informations-depute');
const { randomChoice } = require('./random-choice');
const { getUploadClient, uploadImage } = require('./api');

async function main() {
  const id = 416; // randomChoice()
  const depute = await getDeputeAsObject(id);
  console.log(depute);
  const imageData = (await got(depute.imageUrl)).body;
  console.log(imageData.length);

  const uploadClient = getUploadClient();

  const response = await uploadImage(uploadClient, Buffer.from(imageData));
  console.log(JSON.stringify(response, null, 2));

  // tweetThread(getClient(), [
  //   { text: 'ceci est un test', images: [imageData] },
  // ]);
}

main().catch(err => {
  console.error('ERROR');
  console.log(JSON.stringify(err, null, 2));
});
