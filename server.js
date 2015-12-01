var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');

var app = express();
app.use(bodyParser.json());

var neuralNet = require('./neuralNet');

app.get('/', function(req, res) {
	if (req.query.id) {
		res.sendFile(__dirname + '/nets/' + req.query.id);
	} else {
		res.send(JSON.stringify({
			ok: false,
			error: 'Please pass a request ID'
		}));
	}
});

app.post('/', function(req, res) {
	var result = neuralNet.runNet(req.body.config, req.body.data);
	res.send(JSON.stringify(result));
});

var server = app.listen(3000, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});
