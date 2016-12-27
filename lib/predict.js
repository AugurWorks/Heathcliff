var synaptic = require('synaptic');
var extend = require('extend');

var log4js = require('log4js');
var logger = log4js.getLogger('lib/predict');

module.exports = runNet;

var defaultNetConfig = {
	iterations: 1000000,
	learningRate: 0.05,
	maxBound: 0.9,
	minBound: 0.1,
  maxTime: 290
};

function runNet(id, netConfig, rawData) {
  var startTime = Date.now();
  var data = rawData.map(function(row) {
    return row.map(function(item) {
      return isNaN(item) ? item : parseFloat(item);
    });
  });
  var dataSize = data[0].length - 2;
  var depth = Math.floor(Math.log2(dataSize));
  var config = extend(true, {}, defaultNetConfig, netConfig);
  var args = Array.apply(null, Array(depth + 1)).map(function(val, i) {
    return Math.ceil(dataSize / Math.pow(2, i));
  });
  args.push(1);
  var net = new (Function.prototype.bind.apply(synaptic.Architect.Perceptron, args))();
  var bounds = data.map(function(row) {
    return calculateBounds(row);
  });
	var normalized = data.map(function(row, index) {
    return normalize(row, bounds[index], config);
  });
	for (var i = 0; i < config.iterations; i++) {
    if (i % Math.floor(config.iterations / 10) === 0) {
      logger.debug('Trained net ' + id + ' for ' + i + ' rounds');
    }
		for (var row = 0; row < normalized.length; row++) {
			if (normalized[row][1].toString().toUpperCase() !== "NULL") {
				net.activate(normalized[row].slice(2));
				net.propagate(config.learningRate, [normalized[row][1]]);
			}
		}
    if (config.maxTime && (Date.now() - startTime) / 1000 > config.maxTime) {
      logger.info('Exiting net ' + id + ' due to timeout');
      break;
    }
	}
	var results = normalized.map(function(row) {
		return row.concat(net.activate(row.slice(2)));
	});
  return results.map(function(row, index) {
    return denormalize(row, bounds[index], config);
  });
}

function calculateBounds(row) {
	var max = Math.max.apply(null, row.filter(function(col, index) {
		return index !== 0 && col.toString().toUpperCase() !== "NULL";
	}));
	var min = Math.min.apply(null, row.filter(function(col, index) {
		return index !== 0 && col.toString().toUpperCase() !== "NULL";
	}));
	return [min, max];
}

function normalize(row, bounds, config) {
	return row.map(function(val, index) {
		if (index === 0 || val.toString().toUpperCase() === "NULL") {
			return val;
		}
		return (val - bounds[0]) / (bounds[1] - bounds[0]) * (config.maxBound - config.minBound) + config.minBound;
	});
}

function denormalize(row, bounds, config) {
	return row.map(function(val, index) {
		if (index === 0 || val.toString().toUpperCase() === "NULL") {
			return val;
		}
		return (val - config.minBound) / (config.maxBound - config.minBound) * (bounds[1] - bounds[0]) + bounds[0];
	});
}
