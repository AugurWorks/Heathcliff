var log4js = require('log4js');
var logger = log4js.getLogger('lambda');
var predict = require('./lib/predict');

var AWS = require('aws-sdk');
var sqs = new AWS.SQS();

exports.predict = function(event, context, callback) {
  var message = JSON.parse(event.Records[0].Sns.Message);
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

  var params = {
    MessageBody: JSON.stringify(message),
    QueueUrl: 'https://sqs.us-east-1.amazonaws.com/274685854631/' + message.metadata.sqsName
  };
  sqs.sendMessage(params, function(err, data) {
    if (err) {
      logger.error(err);
      callback(err);

    } else {
      logger.info('Successfully sent SQS message');
      callback(null, 'Finished training net ' + message.netId);
    }
  });
};
