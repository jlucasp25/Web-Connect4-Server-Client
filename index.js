const http = require('http');
const requests = require('./requests.js');
const update = require('./update.js');
var headers = require('./conf.js').headers;
const PORT = 8156;

const server = http.createServer(function (request,response) {
	let answer;
	switch (request.method) {
		case 'GET':
			answer = requests.doGet(request,response);
			break;
		case 'POST':
			answer = requests.doPost(request,response);
			break;
		default:
			response.status = 400;
			break;
	}
	//response.end();
	//fim
}).listen(PORT);