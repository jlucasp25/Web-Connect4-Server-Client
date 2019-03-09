const url = require("url");
const fs = require("fs");
const crypto = require('crypto');
const headers = require('./conf.js').headers;
const updater = require('./update.js');

module.exports.doGet = function(request, response) {
	console.log('received GET req');
	var body = '';
	var parsedURL = url.parse(request.url,true);
	var pathname = parsedURL.pathname;
	var query = parsedURL.query;

	request.on('data', chunk => { body += chunk; } );

	request.on('end', function() {
		switch (pathname) {
			case "/update":
				if (query['game'] == null) {
					response.writeHead(400, headers["plain"]);
					response.write(JSON.stringify({error: "Null Game"}));
					response.end();
					break;
				}
				if (query['nick'] == null) {
					response.writeHead(400, headers["plain"]);
					response.write(JSON.stringify({error: "Null nick"}));
					response.end();
					break;
				}
				var auth = updater.startConnection(query['game'],query['nick'],response);
				if (auth == 1) {
					response.writeHead(400, headers["plain"]);
					response.write(JSON.stringify({error: "Invalid game"}));
					response.end();
				}
				break;
			default:
				response.writeHead(404, headers['plain']);
				response.end();
				break;
		}		
	});

	request.on("close", err => {response.end();});
	request.on('error', err => {response.writeHead(400,headers['plain']);response.end();});
};

module.exports.doPost = function(request, response) {
	var body = '';
	var parsedURL = url.parse(request.url, true);
	var pathname = parsedURL.pathname;

	request.on('data', chunk => { body += chunk; } );

	request.on('end', function() {
		let query = '';
		var authResult = null;
		try {
			query = JSON.parse(body);
		}
		catch(err) {
			console.log(err);
			response.writeHead(400,headers["plain"]);
			response.write(JSON.stringify( { error: "JSON error (" + err + ")"} ));
			response.end();
			return;
		}
		switch(pathname) {
			case "/register":
				if (query['nick'] == null || query['pass'] == null) {
					response.writeHead(400,headers["plain"]);
					response.write(JSON.stringify( { error: "Nick or pass is null"} ));
					response.end();
				}
				authResult = checkUserPass(query['nick'],query['pass']);
				if (authResult == 0) {
					response.writeHead(500, headers["plain"]);
					response.end();
				}
				else if (authResult == 1) {
					response.writeHead(200, headers["plain"]);
					response.write(JSON.stringify({}));
					response.end();
				}
				else {
					response.writeHead(400, headers["plain"]);
					response.write(JSON.stringify({error: "Password incorrect"}));
					response.end();
				}
				break;
			
			case "/ranking":
				if (query['size'] == null) {
					response.writeHead(400,headers["plain"]);
					response.write(JSON.stringify( { error: "Size is null"} ));
					response.end();
					break;
				}
				if (parseInt(query['size']['rows']) <= 0 || parseInt(query['size']['columns']) <= 0) {
					response.writeHead(400,headers["plain"]);
					response.write(JSON.stringify( { error: "Size is invalid"} ));
					response.end();
					break;
				}
				try {
					var file = fs.readFileSync("users.json");
					file = JSON.parse(file.toString())['users'];
				}
				catch (err) {
					response.writeHead(500, headers["plain"]);
					response.end();
					break;
				}
				var rankings = [];
				var cols = query['size'].columns;
				var rows = query['size'].rows;
				cols = cols.toString();
				rows = rows.toString();
				console.log('cols: ' + cols + ' ' + 'rows: ' + rows);
				let i = 0;

				for ( i = 0 ; i < file.length ; i++) {
						if (file[i]['games'].hasOwnProperty(rows))
							if (file[i]['games'][rows].hasOwnProperty(cols))
								rankings.push({ "nick": file[i]['nick'], "victories": file[i]['games'][rows][cols]['victories'], "games": file[i]['games'][rows][cols]['games']});	
				}
				rankings = rankings.slice(0,10);
				var jsonx;
				if (rankings.length > 0)
					jsonx = { ranking: rankings };
				else
					jsonx = {};
				response.writeHead(200, headers['plain']);
				response.write(JSON.stringify(jsonx));
				response.end();
				break;

			case "/join":
				if (query['nick'] == null) {
					response.writeHead(400, headers["plain"]);
					response.write(JSON.stringify({error: "null Nick"}));
					response.end();
					break;
				}
				if (query['pass'] == null) {
					response.writeHead(400, headers["plain"]);
					response.write(JSON.stringify({error: "null Pass"}));
					response.end();
					break;
				}
				if (query['group'] == null || !(Number.isInteger(parseInt(query['group']))) ) {
					response.writeHead(400, headers["plain"]);
					response.write(JSON.stringify({error: "Group invalid"}));
					response.end();
					break;
				}
				if (query['size'] == null || !(Number.isInteger(parseInt(query['size']['columns']))) || !(Number.isInteger(parseInt(query['size']['rows']))) ) {
					console.log('size error');
					response.writeHead(400, headers["plain"]);
					response.write(JSON.stringify({error: "Size invalid"}));
					response.end();
					break;
				}
				authResult = checkUserPass(query['nick'],query['pass']);
				if(authResult!=1) {
					response.writeHead(400, headers["plain"]);
					response.write(JSON.stringify({"error": "Password error"}));
					response.end();
				}
		    	if (updater.nickSizeAlreadyWaiting(query['group'],query['nick'],query['size']) == true ) {
					response.writeHead(400, headers["plain"]);
					response.write(JSON.stringify({"error": "Nao podes jogar contra ti mesmo"}));
					response.end();
					break;
		    	}
		    	else if ( updater.groupSizeAlreadyWaiting(query["group"], query["size"]) == true ) {
		    		var id = updater.joinGame(query["nick"], query["size"], query["group"]);
		    		if(id != null) {
						response.writeHead(200, headers["plain"]);
						response.write(JSON.stringify({"game": id }));
						response.end();
					}
					else {
						console.log('created new game');
						let date = new Date();
						date = date.getTime();
						let idx = crypto.createHash('md5').update(date.toString()).digest('hex');
						updater.pushGame(query["nick"], query["size"],idx, query["group"]);
						response.writeHead(200, headers["plain"]);
						response.write(JSON.stringify({"game": idx}));
						response.end();
					}
		    	}
		    	else {
		    		let date = new Date();
					date = date.getTime();
					console.log('created new game');
					var idx = crypto.createHash('md5').update(date.toString()).digest('hex');
					updater.pushGame(query["nick"], query["size"],idx,query["group"]);
					var jsonx = JSON.stringify( {"game": idx });
					console.log('id: ' + idx);
					response.writeHead(200, headers["plain"]);
					response.write(jsonx);
					response.end();
		    	}

		    	break;

		    case '/leave':
		    	if(query["nick"]==null) {
					response.writeHead(400, headers["plain"]);
					response.write(JSON.stringify({error: "null Nick"}));
					response.end();
					break;
				}
				if(query["pass"]==null){
					response.writeHead(400, headers["plain"]);
					response.write(JSON.stringify({error: "null Pass"}));
					response.end();
					break;
				}
				if(query["game"]==null){
					response.writeHead(400, headers["plain"]);
					response.write(JSON.stringify({error: "null Game"}));
					response.end();
					break;
				}
				authResult = checkUserPass(query['nick'],query['pass']);
		    	if (authResult == 0) {
					response.writeHead(500, headers["plain"]);
					response.end();
				}
				else if (authResult == 1) {
					response.writeHead(200, headers["plain"]);
					response.write(JSON.stringify({}));
					response.end();
				}
				else {
					response.writeHead(400, headers["plain"]);
					response.write(JSON.stringify({error: "Password incorrect"}));
					response.end();
				}
				let left = updater.leaveGame(query['game'], query['nick']);
				if(left==1){
					response.writeHead(400, headers["plain"]);
					response.write(JSON.stringify({error: "Jogo invalido"}));
					response.end();
				}
				else{
					response.writeHead(200, headers["plain"]);
					response.write(JSON.stringify({}));
					response.end();
				}
		    	break;

		    case '/notify':
		    	if (query["game"]==null){
					response.writeHead(400, headers["plain"]);
					response.write(JSON.stringify({error: "null Game"}));
					response.end();
					break;
				}
				if (query["nick"]==null){
					response.writeHead(400, headers["plain"]);
					response.write(JSON.stringify({error: "null Nick"}));
					response.end();
					break;
				}
				if (query["pass"]==null){
					response.writeHead(400, headers["plain"]);
					response.write(JSON.stringify({error: "null Pass"}));
					response.end();
					break;
				}
				if(query["column"]==null){
					response.writeHead(400, headers["plain"]);
					response.write(JSON.stringify({error: "null column"}));
					response.end();
					break;
				}
				authResult = checkUserPass(query['nick'],query['pass']);
				if (authResult == 0) {
					response.writeHead(500, headers["plain"]);
					response.end();
				}
				else if (authResult == 1) {
					console.log('auth 1');
					response.writeHead(200, headers["plain"]);
					response.write(JSON.stringify({}));
					response.end();
				}
				else {
					response.writeHead(400, headers["plain"]);
					response.write(JSON.stringify({error: "Password incorrect"}));
					response.end();
				}
				console.log('cheguei ao played');
				var played = updater.play(query['game'],query['nick'],query['column']);
				// 0 -> Correu bem
				// 1 -> Coluna Cheia
				// 2 -> Turno errado
				// 3  -> Indice invalido
				// 4 -> Problema no jogo/Game not found
				if(played == 0){
				//	response.writeHead(200, headers["plain"]);
				//	response.write(JSON.stringify({}));
				//	response.end();
					}
				else if( played == 1){
					response.writeHead(400, headers["plain"]);
					response.write(JSON.stringify({error: "Column full"}));
					response.end();
				}
				else if( played == 2){
					response.writeHead(400, headers["plain"]);
					response.write(JSON.stringify({error: "Invalid turn"}));
					response.end();
				}
				else if(played == 3){
					response.writeHead(400, headers["plain"]);
					response.write(JSON.stringify({error: "Negative Index"}));
					response.end();
				}
				else{
					response.writeHead(400, headers["plain"]);
					response.write(JSON.stringify({error: "Game not found"}));
					response.end();
				}
				break;
		    default:
		    	response.writeHead(404, headers['plain']);
		    	response.end();
		    	break;
		    	
		}/*acaba o switch(pathname)*/
	});

	request.on("error", function(err){
		response.writeHead(400, headers["plain"]);
		response.end();
	});

};

//Retorna 0 -> erro
//Retorna 1 -> Passe Correcta
//Retorna 2 -> Passe Incorrecta
function checkUserPass(nick, pass) {
	var file = undefined;
	if (nick == "" || pass == "")
		return 0;
	console.log('nick: ' + nick);
	console.log('pass:' + pass);
	pass = crypto.createHash('md5').update(pass).digest('hex');	
	try {
		file = fs.readFileSync("users.json");
		file = JSON.parse(file.toString())['users']; 
	}
	catch (err) {
		return 0;
	}
	let found = false;
	let i = 0;
	for ( i = 0 ; i < file.length ; i++ ) {
		if (file[i]['nick'] == nick) {
			found = true;
			break;
		}
	}
	if (found == true) {
		if (file[i]['pass'] == pass)
			return 1;
		else
			return 2;
	}
	else {
		let jsonx = { "nick": nick , "pass": pass, "games": {} };
		file.push( jsonx );
		file = {"users": file};
		try {
			fs.writeFileSync("users.json", JSON.stringify(file));
			return 1;
		}
		catch(err) {
			return 0;
		}
	}
}