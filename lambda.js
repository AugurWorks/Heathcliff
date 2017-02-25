var log4js = require('log4js');
var logger = log4js.getLogger('lambda');
var predict = require('./lib/predict');

var FluentD = require('./lib/fluentd');

var AWS = require('aws-sdk');
var sqs = new AWS.SQS();

exports.predict = function(event, context, callback) {
  var message = JSON.parse(event.Records[0].Sns.Message);

  var fluent = new FluentD(message.metadata.fluentHost, message.metadata.loggingEnv, 'lambda');

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
      fluent.close(() => callback(err));

    } else {
      logger.info('Successfully sent SQS message');
      fluent.close(() => callback(null, 'Finished training net ' + message.netId));
    }
  });
};
