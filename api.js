const Twitter = require('twitter-lite');
require('dotenv').config();

/**
 * @returns {Twitter.default.prototype}
 */
function newClient() {
  return new Twitter({
    consumer_key: process.env.API_KEY,
    consumer_secret: process.env.API_KEY_SECRET,
    access_token_key: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  });
}

/**
 * @returns {Twitter.default.prototype}
 */
function newUploadClient() {
  return new Twitter({
    subdomain: 'upload',
    version: '1.1',
    consumer_key: process.env.API_KEY,
    consumer_secret: process.env.API_KEY_SECRET,
    access_token_key: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  });
}


/**
 * @typedef {{
 * text: string
 * images?: Buffer[]
 * }} Status
 */

/**
 * Tweets a text status with one picture
 * @param {string} text
 * @param {Buffer[]} imageDataArray
 * @param {object} additionalParams
 * @param {Twitter.default.prototype} client
 * @param {Twitter.default.prototype} uploadClient
 */
async function tweetTextAndImages(text, imageDataArray, additionalParams, client, uploadClient) {
  const media_ids = [];

  // For each image stored in the status as a Buffer
  for (const imageData of imageDataArray) {
    // Upload it to Twitter's backend
    console.warn(`did not upload image Buffer<${imageData.toString('hex').slice(0,8)}>…: not implemented`);
    // const media_id = await uploadImage(imageData, uploadClient);
    // media_ids.push(media_id);
  }

  return client.post('statuses/update', {
    status: text,
    auto_populate_reply_metadata: true,
    media_ids: media_ids.length === 0 ? '' : media_ids.join(','),
    ...additionalParams
  });
}

/**
 *
 * @param {Status[]} thread
 * @param {Twitter.default.prototype} client
 * @param {Twitter.default.prototype} uploadClient
 */
async function tweetThread(thread, client, uploadClient) {
  let lastTweetID = '';
  for (const status of thread) {
    console.log(`Tweeting ${JSON.stringify(status)}`, lastTweetID.length === 0 ? '(standalone)' : `(in reply to ${lastTweetID})`);

    const hasImages = Array.isArray(status.images) && status.images.length > 0;
    if (hasImages) {
      // Tweet with images
      const tweet = await tweetTextAndImages(
        status.text,
        status.images,
        { in_reply_to_status_id: lastTweetID },
        client,
        uploadClient
      );
      lastTweetID = tweet.id_str;
    } else {
      // Text-only tweet
      const tweet = await client.post('statuses/update', {
        status: status.text,
        auto_populate_reply_metadata: true,
        in_reply_to_status_id: lastTweetID,
      });
      lastTweetID = tweet.id_str;
    }
  }
}


/**
 * @param {Twitter.default.prototype} uploadClient
 * @param {Buffer} imageData
 */
async function uploadImage(uploadClient, imageData) {
  // post2(uploadClient, imageData.toString('base64'));
  // return await _post(uploadClient, 'media/upload', {
  //   media_category: 'tweet_image',
  //   media_data: imageData.toString('base64')
  // });
}

function API() {
  const client = newClient();
  const uploadClient = newUploadClient();
  const api = {
    /** @param {Status[]} thread */
    async tweetThread(thread) {
      return tweetThread(thread, client, uploadClient);
    }
  };
  return api;
}

module.exports = { API };
