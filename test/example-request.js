var request = require('request');

request.post('http://localhost:3000/nets', {
	json: {
		config: {
			depth: 1
		},
		data: [
			['01/01/2015', 0, 0, 0],
			['01/01/2015', 10, 10, 0],
			['01/01/2015', 10, 0, 10],
			['01/01/2015', 0, 10, 10],
			['01/01/2015', "NULL", 5, 5]
		]
	}
}, function(e, r, data) {
	console.log(data);
	setTimeout(function() {
		request.get('http://localhost:3000/nets/' + data.id, function(e, r, res) {
			var json = JSON.parse(res);
			if (json.done) {
				console.log(json.data.map(function(row) {
					return row.join(',');
				}).join('\n'));
			}
		});
	}, 1000);
});
