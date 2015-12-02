var synaptic = require('synaptic');
var extend = require('extend');
var uuid = require('node-uuid');
var fs = require('fs');

var inprogress = [];

module.exports = {
	runNet: runNet,
	isInprogress: isInprogress
};

var defaultNetConfig = {
	depth: 4,
	iterations: 20000,
	learningRate: 0.3,
	maxBound: 0.9,
	minBound: 0.1
};

function runNet(netConfig, data) {
	var id = uuid.v4();
	var config = extend(true, {}, defaultNetConfig, netConfig);
	var net = createNetwork(config, data[0].length - 1);
	inprogress.push(id);
	setTimeout(function() {
		asyncRun(net, config, data, id);
	}, 0);
	return {
		ok: true,
		id: id
	};
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

function isInprogress(id) {
	return inprogress.indexOf(id) != -1;
}

function asyncRun(net, config, data, id) {
	var bounds = calculateBounds(data);
	var normalized = normalize(data, bounds, config);
	for (var i = 0; i < config.iterations; i++) {
		for (var row = 0; row < normalized.length; row++) {
			net.activate(normalized[row].slice(1));
			net.propagate(config.learningRate, [normalized[row][0]]);
		}
	}
	var results = normalized.map(function(row) {
		return row.concat(net.activate(row.slice(1)));
	});
	var denormalized = denormalize(results, bounds, config);
	fs.writeFileSync('nets/' + id, denormalized.map(function(row) {
		return row.join(',');
	}).join('\n'));
	var index = inprogress.indexOf(id);
	inprogress.splice(index, 1);
	console.log('Done writing ' + id);
}

function calculateBounds(data) {
	var max = Math.max.apply(null, data.map(function(row) {
		return Math.max.apply(null, row);
	}));
	var min = Math.min.apply(null, data.map(function(row) {
		return Math.min.apply(null, row);
	}));
	return [min, max];
}

function normalize(data, bounds, config) {
	return data.map(function(row) {
		return row.map(function(val) {
			return (val - bounds[0]) / (bounds[1] - bounds[0]) * (config.maxBound - config.minBound) + config.minBound;
		});
	});
}

function denormalize(normalized, bounds, config) {
	return normalized.map(function(row) {
		return row.map(function(val) {
			return (val - config.minBound) / (config.maxBound - config.minBound) * (bounds[1] - bounds[0]) + bounds[0];
		});
	});
}
