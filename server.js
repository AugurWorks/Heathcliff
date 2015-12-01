var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());

var neuralNet = require('./neuralNet')

app.get('/', function(req, res) {
	res.send('Hello world!');
});

app.post('/', function(req, res) {
	var result = neuralNet.runNet({});
	res.send(JSON.stringify(result));
});

var server = app.listen(3000, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});
