var request = require('request');

request.post('http://localhost:3000', {
	json: {
		config: {
			depth: 1
		},
		data: [
			[0, 0, 0],
			[1, 1, 0],
			[1, 0, 1],
			[0, 1, 1]
		]
	}
}, function(e, r, data) {
	console.log(data);
});
