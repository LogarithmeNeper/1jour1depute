const redis = require('redis');
if (process.env.NODE_ENV !== 'production') require('dotenv').config()

function RedisClient() {
  const client = redis.createClient(process.env.REDIS_URL, {
    tls: {
      rejectUnauthorized: false,
    },
  });

  client.on('error', (error) => {
    console.error('REDIS ERROR');
    console.error(error);
    process.exit(42);
  });

  client.on('warning', () => {
    console.error('client will emit warning when password was set but none is needed and if a deprecated option/function/similar is used.');
  });

  const api = {
    get: promisify(client.get).bind(client),
    set: promisify(client.set).bind(client),
  };
  return api;
}

module.exports = { RedisClient };
