var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');

var app = express();
app.use(bodyParser.json());

var neuralNet = require('./neuralNet');

app.get('/', function(req, res) {
	var result = {};
	if (req.query.id) {
		result.ok = true;
		if (neuralNet.isInprogress(req.query.id)) {
			result.done = false;
		} else {
			var data = fs.readFileSync('nets/' + req.query.id, 'utf8');
			result.done = true;
			result.data = data.split('\n').map(function(row) {
				return row.split(',');
			});
		}
	} else {
		result.ok = false;
		result.error = 'Please pass a request ID';
	}
	res.send(result);
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
