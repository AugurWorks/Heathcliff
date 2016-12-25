var synaptic = require('synaptic');
var extend = require('extend');

module.exports = {
  syncRunNet: syncRunNet
};

var defaultNetConfig = {
	depth: 4,
	iterations: 20000,
	learningRate: 0.3,
	maxBound: 0.9,
	minBound: 0.1
};

function syncRunNet(netConfig, rawData) {
  var data = rawData.map(function(row) {
    return row.map(function(item) {
      return isNaN(item) ? item : parseFloat(item);
    });
  });
  var config = extend(true, {}, defaultNetConfig, netConfig);
  var net = createNetwork(config, data[0].length - 2);
  var bounds = calculateBounds(data);
	var normalized = normalize(data, bounds, config);
	for (var i = 0; i < config.iterations; i++) {
		for (var row = 0; row < normalized.length; row++) {
			if (normalized[row][1].toString().toUpperCase() !== "NULL") {
				net.activate(normalized[row].slice(2));
				net.propagate(config.learningRate, [normalized[row][1]]);
			}
		}
	}
	var results = normalized.map(function(row) {
		return row.concat(net.activate(row.slice(2)));
	});
  return denormalize(results, bounds, config);
}

function createNetwork(config, dataSize) {
	var inputLayer = new synaptic.Layer(dataSize);
	var outputLayer = new synaptic.Layer(1);
	var lastLayer = inputLayer;
	var hiddenLayers = [];
	for (var l = 0; l < config.depth; l++) {
		var hiddenLayer = new synaptic.Layer(dataSize);
		lastLayer.project(hiddenLayer);
		hiddenLayers.push(hiddenLayer);
		lastLayer = hiddenLayer;
	}
	lastLayer.project(outputLayer);
	return new synaptic.Network({
		input: inputLayer,
		hidden: hiddenLayers,
		output: outputLayer
	});
}

function calculateBounds(data) {
	var max = Math.max.apply(null, data.map(function(row) {
		return Math.max.apply(null, row.filter(function(col, index) {
			return index !== 0 && col.toString().toUpperCase() !== "NULL";
		}));
	}));
	var min = Math.min.apply(null, data.map(function(row) {
		return Math.min.apply(null, row.filter(function(col, index) {
			return index !== 0 && col.toString().toUpperCase() !== "NULL";
		}));
	}));
	return [min, max];
}

function normalize(data, bounds, config) {
	return data.map(function(row) {
		return row.map(function(val, index) {
			if (index === 0 || val.toString().toUpperCase() === "NULL") {
				return val;
			}
			return (val - bounds[0]) / (bounds[1] - bounds[0]) * (config.maxBound - config.minBound) + config.minBound;
		});
	});
}

function denormalize(normalized, bounds, config) {
	return normalized.map(function(row) {
		return row.map(function(val, index) {
			if (index === 0 || val.toString().toUpperCase() === "NULL") {
				return val;
			}
			return (val - config.minBound) / (config.maxBound - config.minBound) * (bounds[1] - bounds[0]) + bounds[0];
		});
	});
}
