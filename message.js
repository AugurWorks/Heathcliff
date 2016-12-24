var amqp = require('amqplib/callback_api');

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


amqp.connect(amqpConnection, function(err, conn) {
  conn.createChannel(function(err, ch) {
    ch.assertQueue(trainingTopic, {durable: true});
    ch.assertQueue(resultTopic, {durable: true});

    ch.consume(trainingTopic, function(msg) {
      var content = JSON.parse(msg.content.toString());
      console.log(content);
    }, {
      noAck: true
    });
  });
});
