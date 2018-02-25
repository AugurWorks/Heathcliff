var logger = require('winston');
var predict = require('./lib/predict');

var Logging = require('./lib/logging');

var AWS = require('aws-sdk');
var sqs = new AWS.SQS();

exports.predict = function(event, context, callback) {
  var message = JSON.parse(event.Records[0].Sns.Message);

  Logging.init();

  logger.info('Starting training');

  predict(message);

  logger.info('Finished training');

  var params = {
    MessageBody: JSON.stringify(message),
    QueueUrl: 'https://sqs.us-east-1.amazonaws.com/274685854631/' + message.metadata.sqsName
  };

  logger.debug('Sending SQS message to' + params.QueueUrl);
  sqs.sendMessage(params).promise().then(() => {
    logger.info('Successfully sent SQS message');
    callback(null, 'Finished training net ' + message.netId)
  }).catch((err) => {
    logger.error(err);
    callback(err);
  });

  logger.debug('Done calling SQS sendMessage method');
};
