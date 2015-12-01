var request = require('request');

request.post('http://localhost:3000', {
	json: {
		config: {
			depth: 6
		},
		data: [
			[1, 2, 3, 4],
			[2, 3, 4, 1],
			[3, 4, 1, 2],
			[4, 1, 2, 3]
		]
	}
}, function(e, r, data) {
	console.log(data);
});
