const debug = require('debug');

const log = {
  app: debug('app:main'),
  db: debug('app:db'),
  auth: debug('app:auth'),
  api: debug('app:api'),
  error: debug('app:error'),
  upload: debug('app:upload'),
  worker: debug('app:worker')
};

module.exports = log;
