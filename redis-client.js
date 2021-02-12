const redis = require('redis');
const { promisify } = require('util');
if (process.env.NODE_ENV !== 'production') require('dotenv').config();

async function RedisClient() {
  return new Promise((resolve, reject) => {
    const client = redis.createClient(process.env.REDIS_URL);
    console.error('redis.createClient ok');

    client.on('connect', () => {
      console.error('REDIS CONNECTED');
    });

    client.on('ready', () => {
      console.error('REDIS READY');
      resolve({
        get: promisify(client.get).bind(client),
        set: promisify(client.set).bind(client),
        quit: promisify(client.quit).bind(client),
      });
    });

    client.on('end', () => {
      console.error('REDIS END');
      // reject('end');
    });

    client.on('reconnecting', () => {
      console.error('REDIS RECONNECTING');
      // reject('end');
    });

    client.on('disconnected', () => {
      console.error('REDIS DISCONNECTED');
      reject('disconnected');
    });

    client.on('error', (error) => {
      console.error('REDIS ERROR');
      console.error(error);
      reject('error');
      process.exit(42);
    });

    client.on('warning', () => {
      console.error('REDIS WARNING');
      // reject('warning');
      console.error('client will emit warning when password was set but none is needed and if a deprecated option/function/similar is used.');
    });
  });
}
module.exports = { RedisClient };
