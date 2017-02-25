var log4js = require('log4js');
var logger = log4js.getLogger('local');
var predict = require('./lib/predict');
var message = require('./test/payload.json');

var FluentD = require('./lib/fluentd');

var fluent = new FluentD(message.metadata.fluentHost, message.metadata.loggingEnv, 'local');

logger.info('Starting training');

predict(message);

logger.info('Finished training');

fluent.close(() => {
  console.log('Done flushing logs');
});
