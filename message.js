var amqp = require('amqplib/callback_api');
var predict = require('./lib/predict');

var logger = require('winston');

var Logging = require('./lib/logging');

Logging.init();

var config = {
  user: process.env.RABBITMQ_USERNAME || 'guest',
  pass: process.env.RABBITMQ_PASSWORD || 'guest',
  host: process.env.RABBITMQ_HOST || 'localhost',
  port: process.env.RABBITMQ_PORTNUM || 5672
};

var env = process.env.ENV || 'local';
var trainingTopic = 'nets.training' + (env ? '.' + env : '');
var resultTopic = 'nets.results' + (env ? '.' + env : '');
var heartbeatTopic = 'heartbeat' + (env ? '.' + env : '');

var amqpConnection = `amqp://${ config.user }:${ config.pass }@${ config.host }:${ config.port }`;

logger.info('Starting Node Net');

amqp.connect(amqpConnection, {heartbeat: 60}, function(err, conn) {
  conn.createChannel(function(err, ch) {
    logger.info('Connected to RabbitMQ');
    ch.assertQueue(trainingTopic, {durable: true});
    ch.assertQueue(resultTopic, {durable: true});
    ch.assertQueue(heartbeatTopic, {durable: false});

    ch.prefetch(1);

    ch.consume(trainingTopic, function(msg) {
      var content = JSON.parse(msg.content.toString());
      logger.info('Processing net ' + content.netId);
      predict(content, () => {
        ch.sendToQueue(heartbeatTopic, new Buffer(JSON.stringify({
          heartbeat: Date.now()
        })));
      });
      ch.sendToQueue(resultTopic, new Buffer(JSON.stringify(content)));
      ch.ack(msg);
      logger.info('Finished processing net ' + content.netId);
    });
  });
});
