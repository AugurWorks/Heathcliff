var logger = require('winston');
var predict = require('./lib/predict');
var message = require('./test/payload.json');

var Logging = require('./lib/logging');

var logging = new Logging(message.netId, message.metadata, 'local');

logger.info('Starting training');

predict(message);

logger.info('Finished training');
