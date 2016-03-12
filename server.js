var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');

if (!fs.existsSync('nets/')){
	fs.mkdirSync('nets/');
}

var app = express();
app.use(bodyParser.json());

var neuralNet = require('./neuralNet');

app.get('/nets/:id', function(req, res) {
	var result = {
		ok: true,
		done: true
	};
	try {
		var id = req.params.id;
		if (!id) {
			throw "An ID is required";
		}
		if (neuralNet.isInprogress(id)) {
			result.done = false;
		} else {
			var path = 'nets/' + id;
			if (!fs.existsSync(path)) {
				throw 'Run with ID ' + id + ' does not exist';
			}
			var data = fs.readFileSync(path, 'utf8');
			result.data = data.split('\n').map(function(row) {
				return row.split(',');
			});
		}
	} catch (e) {
		result = {
			ok: false,
			error: e
		};
	}
	res.send(result);
});

app.post('/nets', function(req, res) {
	var result = neuralNet.runNet(req.body.config, req.body.data);
	res.send(JSON.stringify(result));
});

var server = app.listen(3000, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});
