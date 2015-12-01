var synaptic = require('synaptic');
var extend = require('extend');
var uuid = require('node-uuid');
var fs = require('fs');

module.exports = {
	runNet: runNet
};

var defaultNetConfig = {
	depth: 4,
	iterations: 20000,
	learningRate: 0.3
};

function runNet(netConfig, data) {
	var id = uuid.v4();
	var config = extend(true, {}, defaultNetConfig, netConfig);
	var net = createNetwork(config, data[0].length - 1);
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

function asyncRun(net, config, data, id) {
	for (var i = 0; i < config.iterations; i++) {
		for (var row = 0; row < data.length; row++) {
			net.activate(data[row].slice(1));
			net.propagate(config.learningRate, [data[row][0]]);
		}
	}
	var results = data.map(function(row) {
		return row.concat(net.activate(row.slice(1))).join(',');
	});
	fs.writeFileSync('nets/' + id, results.join('\n'));
	console.log('Done writing ' + id);
}
