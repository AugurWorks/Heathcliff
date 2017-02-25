var log4js = require('log4js');

module.exports = FluentD;

function FluentD(fluentHost, env, container) {
  if (fluentHost) {
    this.fluent = require('fluent-logger').support.log4jsAppender('heathcliff-' + container, {
      host: fluentHost,
      timeout: 3.0,
      tags: {
        env: env,
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
