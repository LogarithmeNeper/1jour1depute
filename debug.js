/**
 * Entry point of the program.
 *
 * Authors : Corentin Forler, Pierre Sibut-Bourde, 2021.
 */

const { RedisClient } = require('./redis-client');


async function main() {
  if (process.argv.length <= 2) {
    console.error([
      'Usage: debug-edit-db <command> <...args>',
      'Available commands:',
      '• read all       -- display all the available ids',
      '• read used      -- display the used ids',
      '• fetch all      -- refresh all the ids',
      '• clear used     -- empty the used ids list',
      '• push used <id> -- add an id to the used ids list',
      '• pop used <id>  -- remove an id from the used ids list',
      '',
      'Database engine: redis',
    ].join('\n'));
    return;
  }

  const redisClient = await RedisClient();

  const [$0, $1, command, ...args] = process.argv;
  if (command === 'read') {
    if (args[0] === 'all') {
      console.log(JSON.parse(await redisClient.get('all-ids')));
    } else if (args[0] === 'used') {
      console.log(JSON.parse(await redisClient.get('used-ids')));
    } else {
      invalidArg0('expected: `all` | `used`');
    }
  } else if (command === 'fetch') {
    if (args[0] === 'all') {
      const { mainRedis } = require('./fetch-ids');
      await mainRedis();
    } else {
      invalidArg0('expected: `all`');
    }
  } else if (command === 'clear') {
    if (args[0] === 'used') {
      await redisClient.set('used-ids', '[]');
    } else {
      invalidArg0('expected: `used`, cannot clear `all`');
    }
  } else if (command === 'push') {
    if (args[0] === 'used') {
      const id = +args[1];
      if (!Number.isNaN(id)) {
        const list = JSON.parse(await redisClient.get('used-ids')) || [];
        list.push(id);
        await redisClient.set('used-ids', JSON.stringify(list));
      } else {
        invalidArg('id', 'expected: number');
      }
    } else {
      invalidArg0('expected: `used`, cannot push elsewhere');
    }
  } else if (command === 'pop') {
    if (args[0] === 'used') {
      const id = +args[1];
      if (!Number.isNaN(id)) {
        const list = JSON.parse(await redisClient.get('used-ids')) || [];
        const i = list.indexOf(id);
        if (i >= 0) {
          list.splice(i, 1);
          await redisClient.set('used-ids', JSON.stringify(list));
        } else {
          console.error(`id ${id} is not used`);
        }
      } else {
        invalidArg('id', 'expected: number');
      }
    } else {
      invalidArg0('expected: `used`, cannot pop elsewhere');
    }
  }

  await redisClient.quit();

  function invalidArg0(reason = '(no reason specified)') {
    console.error(`error: invalid argument ${args[0]} for command ${command}: ${reason}`);
    process.exit(2);
  }

  function invalidArg(name, reason = '(no reason specified)') {
    console.error(`error: invalid value for argument <${name}> for command ${command}: ${reason}`);
    process.exit(3);
  }
}

main().catch(err => {
  console.error('ERROR');
  console.error(err);
});
