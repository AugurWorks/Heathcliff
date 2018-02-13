var logdna = require('logdna-winston');
var winston = require('winston');

module.exports = Logging;

function Logging(netId, metadata, container) {
  winston.level = 'debug';
  winston.remove(winston.transports.Console);
  winston.add(winston.transports.Console, {
    'timestamp': true
  });
  if (process.env.LOGDNA_KEY) {
    var options = {
      key: process.env.LOGDNA_KEY,
      app: 'HCF',
      env: metadata.loggingEnv,
      index_meta: true,
      handleExceptions: true
    };
    winston.add(winston.transports.Logdna, options);
  }
}
