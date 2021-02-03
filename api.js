const Twitter = require('twitter-lite');
require('dotenv').config();

/**
 * @returns {Twitter.default.prototype}
 */
function getClient() {
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
function getUploadClient() {
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
 *
 * @param {Twitter.default.prototype} client
 * @param {Status[]} thread
 * @param {Twitter.default.prototype} uploadClient
 */
async function tweetThread(client, thread, uploadClient) {
  let lastTweetID = '';
  for (const status of thread) {
    const media_ids = [];
    // For each image stored in the status as a Buffer
    if (status.images && uploadClient) {
      for (const image of status.images) {
        if (uploadClient) {
          // Upload it to Twitter's backend
          // const media_id = await uploadImage(uploadClient);
          // media_ids.push(media_id);
        } else {
          console.warn('missing uploadClient');
        }
      }
    }

    console.log(`Tweeting '${status.text}' (in reply to: ${lastTweetID.length === 0 ? '-': lastTweetID})`);

    const tweet = await client.post('statuses/update', {
      status: status.text,
      in_reply_to_status_id: lastTweetID,
      auto_populate_reply_metadata: true,
      media_ids: media_ids.length === 0 ? '' : media_ids.join(',')
    });
    lastTweetID = tweet.id_str;
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


module.exports = {
  getClient,
  getUploadClient,
  tweetThread,
  uploadImage,
};
