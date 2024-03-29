var logdna = require('logdna-winston');
var winston = require('winston');

module.exports = {
  init: function() {
    winston.level = 'debug';
    winston.remove(winston.transports.Console);
    winston.add(winston.transports.Console, {
      prettyPrint: true,
      timestamp: true
    });
    if (process.env.LOGDNA_KEY) {
      var options = {
        key: process.env.LOGDNA_KEY,
        app: 'HCF',
        index_meta: true,
        handleExceptions: true
      };
      winston.add(winston.transports.Logdna, options);
    }
  }
}
