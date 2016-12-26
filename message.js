var amqp = require('amqplib/callback_api');
var predict = require('./lib/predict');

var log4js = require('log4js');
var logger = log4js.getLogger('message');

if (process.env.FLUENTD_HOST) {
  log4js.addAppender(require('fluent-logger').support.log4jsAppender('node-net', {
    host: process.env.FLUENTD_HOST,
    timeout: 3.0
  }));
}

var config = {
  user: process.env.RABBITMQ_USERNAME || 'guest',
  pass: process.env.RABBITMQ_PASSWORD || 'guest',
  host: process.env.RABBITMQ_HOST || 'localhost',
  port: process.env.RABBITMQ_PORTNUM || 5672
};

var env = process.env.ENV || 'local';
var trainingTopic = 'nets.training' + (env ? '.' + env : '');
var resultTopic = 'nets.results' + (env ? '.' + env : '');

var amqpConnection = `amqp://${ config.user }:${ config.pass }@${ config.host }:${ config.port }`;

logger.info('Starting Node Net');

amqp.connect(amqpConnection, function(err, conn) {
  conn.createChannel(function(err, ch) {
    logger.info('Connected to RabbitMQ');
    ch.assertQueue(trainingTopic, {durable: true});
    ch.assertQueue(resultTopic, {durable: true});

    ch.consume(trainingTopic, function(msg) {
      var content = JSON.parse(msg.content.toString());
      logger.info('Processing net ' + content.netId);
      var results = predict(content.netId, content.trainingConfig, content.data);
      content.data = results;
      ch.sendToQueue(resultTopic, new Buffer(JSON.stringify(content)));
      ch.ack(msg);
      logger.info('Finished processing net ' + content.netId);
    }, {
      noAck: false
    });
  });
});
