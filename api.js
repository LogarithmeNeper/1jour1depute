const Twitter = require('twitter-lite');
require('dotenv').config();

const client = new Twitter({
    consumer_key: process.env.API_KEY,
    consumer_secret: process.env.API_KEY_SECRET
});