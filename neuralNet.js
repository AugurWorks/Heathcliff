var synaptic = require('synaptic');
var extend = require('extend');

module.exports = {
	runNet: runNet
};

var defaultNetConfig = {
	depth: 4,
	iterations: 20000,
	learningRate: 0.3
};

function runNet(netConfig) {
	var config = extend(true, {}, defaultNetConfig, netConfig);
	var net = createNetwork(config, 5);
	console.log(config);
	console.log(net);
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
