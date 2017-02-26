var log4js = require('log4js');

module.exports = FluentD;

function FluentD(netId, metadata, container) {
  if (metadata.fluentHost) {
    this.fluent = require('fluent-logger').support.log4jsAppender('heathcliff-' + container, {
      host: metadata.fluentHost,
      timeout: 3.0,
      tags: {
        netId,
        env: metadata.loggingEnv,
        function: 'HCF'
      }
    });

    log4js.addAppender(this.fluent);
  }
}
FluentD.prototype.close = function(callback) {
  if (this.fluent) {
    this.fluent.close(callback);
  } else {
    callback();
  }
};
