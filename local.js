var log4js = require('log4js');
var logger = log4js.getLogger('local');
var predict = require('./lib/predict');
var message = require('./test/payload.json');

var fluentHost = message.metadata.fluentHost;

if (fluentHost) {
  log4js.addAppender(require('fluent-logger').support.log4jsAppender('heathcliff-lambda', {
    host: fluentHost,
    timeout: 3.0
  }));
}

logger.info('Starting training');

predict(message);

logger.info('Finished training');

console.log(JSON.stringify(message, null, 2));
