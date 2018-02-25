var logger = require('winston');
var predict = require('./lib/predict');
var message = require('./test/payload.json');

var Logging = require('./lib/logging');

Logging.init();

logger.info('Starting training');

predict(message);

logger.info('Finished training');
