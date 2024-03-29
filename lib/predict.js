var synaptic = require('synaptic');
var extend = require('extend');
var SDC = require('statsd-client');

var winston = require('winston');
var WinstonContext = require('winston-context');

module.exports = runNet;

var defaultNetConfig = {
  iterations: process.env.ITERATIONS || 50000,
  learningRate: process.env.LEARNING_RATE || 0.0025,
  maxBound: 0.9,
  minBound: 0.1,
  maxTime: 280,
  depth: 4
};

function runNet(message, intervalFn) {
  var logger = new WinstonContext(winston, '', {
    algorithmRequestId: message.algorithmRequestId,
    env: message.metadata.loggingEnv,
    function: 'HCF',
    netId: message.netId
  });
  var sdc = new SDC({
    host: process.env.STATSD_HOST,
    tags: {
      h: `heathcliff-${message.metadata.loggingEnv}`,
      ty: 'APP'
    }
  });

  sdc.increment('heathcliff.count.started');

  var id = message.netId;
  var startTime = Date.now();
  var data = message.data.map(function(row) {
    return row.map(function(item) {
      return isNaN(item) ? item : parseFloat(item);
    });
  });
  var dataSize = data[0].length - 2;
  var config = extend(true, {}, defaultNetConfig, message.trainingConfig);

  logger.info('Running with the following config:');
  logger.info(JSON.stringify(config));

  var trainingStatFn = getTrainingStatFn(id, dataSize, data.length, config.learningRate, Date.now());

  var args = Array.apply(null, Array(config.depth)).map(function() {
    return dataSize;
  });
  args.push(1);
  var net = new (Function.prototype.bind.apply(synaptic.Architect.Perceptron, args))();
  var bounds = data.map(function(row) {
    return calculateBounds(row);
  });
  var normalized = data.map(function(row, index) {
    return normalize(row, bounds[index], config);
  });

  message.trainingStats = [trainingStatFn(0, calculateRms(net, normalized), 'STARTING', null)];

  for (var i = 1; i <= config.iterations; i++) {
    if (i % Math.floor(config.iterations / 10) === 0 && i !== config.iterations) {
      logger.debug('Trained net ' + id + ' for ' + i + ' rounds');
      message.trainingStats.push(trainingStatFn(i, calculateRms(net, normalized), 'RUNNING', null));
      if (intervalFn) {
        intervalFn.apply(message);
      }
    }
    for (var row = 0; row < normalized.length; row++) {
      if (normalized[row][1].toString().toUpperCase() !== 'NULL') {
        net.activate(normalized[row].slice(2));
        net.propagate(config.learningRate, [normalized[row][1]]);
      }
    }
    if (config.maxTime && (Date.now() - startTime) / 1000 > config.maxTime) {
      logger.info('Exiting net ' + id + ' due to timeout');
      message.trainingStats.push(trainingStatFn(i, calculateRms(net, normalized), 'DONE', 'OUT_OF_TIME'));
      sdc.gauge('heathcliff.histogram.rounds', i);
      sdc.increment('heathcliff.count.completed.expired');
      break;
    }
    if (i == config.iterations - 1) {
      message.trainingStats.push(trainingStatFn(i, calculateRms(net, normalized), 'DONE', 'HIT_TRAINING_LIMIT'));
      sdc.gauge('heathcliff.histogram.rounds', i);
      sdc.increment('heathcliff.count.completed.limit');
    }
  }

  var results = normalized.map(function(row) {
    return row.concat(net.activate(row.slice(2)));
  });
  message.data = results.map(function(row, index) {
    return denormalize(row, bounds[index], config);
  });

  sdc.gauge('heathcliff.histogram.time', Date.now() - startTime, {
    un: 'ms'
  });
  sdc.increment('heathcliff.count.processed');
  sdc.close();
}

function calculateBounds(row) {
  var max = Math.max.apply(null, row.filter(function(col, index) {
    return index !== 0 && col.toString().toUpperCase() !== 'NULL';
  }));
  var min = Math.min.apply(null, row.filter(function(col, index) {
    return index !== 0 && col.toString().toUpperCase() !== 'NULL';
  }));
  return [min, max];
}

function normalize(row, bounds, config) {
  return row.map(function(val, index) {
    if (index === 0 || val.toString().toUpperCase() === 'NULL') {
      return val;
    }
    return (val - bounds[0]) / (bounds[1] - bounds[0]) * (config.maxBound - config.minBound) + config.minBound;
  });
}

function denormalize(row, bounds, config) {
  return row.map(function(val, index) {
    if (index === 0 || val.toString().toUpperCase() === 'NULL') {
      return val;
    }
    return (val - config.minBound) / (config.maxBound - config.minBound) * (bounds[1] - bounds[0]) + bounds[0];
  });
}

function calculateRms(net, normalized) {
  var error = normalized.slice(0, normalized.length - 1).reduce(function(sum, row) {
    return sum + Math.pow(net.activate(row.slice(2)) - row[1], 2);
  }, 0);
  return Math.sqrt(error / normalized.length);
}

function getTrainingStatFn(netId, dataSets, rowCount, learningConstant, startDate) {
  return function(roundsTrained, rmsError, trainingStage, trainingStopReason) {
    return {
      netId,
      dataSets,
      rowCount,
      learningConstant,
      secondsElapsed: Math.floor((Date.now() - startDate) / 1000),
      roundsTrained,
      rmsError,
      trainingStage,
      trainingStopReason,
      dateCreated: new Date()
    };
  };
}
