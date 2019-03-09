const fs = require('fs');
var headers = require('./conf.js').headers;
var games = [];


module.exports.pushGame = function(nick,size,id,group) {
	var board = [];
	for (let i = 0 ; i < size.columns ; i++) {
		board.push([]);
		for (let j = 0 ; j < size.rows ; j++)
			board[i].push(null);
	}
	var timeout = setTimeout(
			function() {
				waitIsOver(id);
			},120000);
	games.push({"group": group, "size": size, "nick1": nick, "nick2": null, "gameid": id, "timeout": timeout, "responses": {"response1": null, "response2": null}, "board": board, "turn": null, "active": false});
}

module.exports.joinGame = function(nick,size,group) {
	for (let i = 0 ; i < games.length ; i++) {
		if (games[i]['size'].columns == size.columns && games[i]['size'].rows == size.rows && games[i]['group'] == group && games[i]['active'] == false ) {
			console.log('dei_join');
			games[i]['nick2'] = nick;
			return games[i]['gameid'];
		}
	}
	return null; // ou false
}

function waitIsOver(id) {
	console.log('entered on waitIsOver');
	for (let i = 0 ; i < games.length ; i++) {
		if (games[i].gameid == id) {
			if (games[i].nick2 == null)
				update(JSON.stringify({winner: null}),games[i].responses.response1,games[i].responses.response2);
			else if (games[i].turn == games[i].nick1)
				update(JSON.stringify({winner: games[i].nick2}), games[i].responses.response1,games[i].responses.response2);			
			else
				update(JSON.stringify({winner: games[i].nick1}), games[i].responses.response1,games[i].responses.response2);
	
		if (games[i].responses.response1 != null) {
			games[i].responses.response1.end();
		}
		if (games[i].responses.response2 != null) {
			games[i].responses.responses2.end();
		}
		games.splice(i,1);
		break;
		}
	}
}

function updateRanking(size,win,lose) {
	try {
		var file = fs.readFileSync("users.json");
		file = JSON.parse(file.toString())['users'];
	}
	catch (err) {
		return 1;
	}
	let rows = size.rows;
	let cols = size.columns;
	rows = rows.toString();
	cols = cols.toString();
	for (let i = 0 ; i < file.length ; i++) {
		if (file[i]['nick'] == win) {
			if (!file[i]['games'].hasOwnProperty(rows)) {
				file[i]['games'][rows] = {};
				if (!file[i]['games'][rows].hasOwnProperty(cols))
					file[i]['games'][rows][cols] = {};
				file[i]['games'][rows][cols]['games'] = 1;//pode se tirar
				file[i]['games'][rows][cols]['victories'] = 1;
			}
			else if (!file[i]['games'][rows].hasOwnProperty(cols)) {
				file[i]['games'][rows][cols] = {};
				file[i]['games'][rows][cols]['games'] = 1;//pode se tirar
				file[i]['games'][rows][cols]['victories'] = 1;
			}
			else {
				file[i]['games'][rows][cols]['games']++;
				file[i]['games'][rows][cols]['victories']++;
			}
		}
		else if (file[i]['nick'] == lose) {
			if (!file[i]['games'].hasOwnProperty(rows)) {
				file[i]['games'][rows] = {};
				if (!file[i]['games'][rows].hasOwnProperty(cols))
					file[i]['games'][rows][cols] = {};
				file[i]['games'][rows][cols]['games'] = 1;
				file[i]['games'][rows][cols]['victories'] = 0;	
			}
			else if (!file[i]['games'][rows].hasOwnProperty(cols)) {
				file[i]['games'][rows][cols] = {};
				file[i]['games'][rows][cols]['games'] = 1;//pode se tirar
				file[i]['games'][rows][cols]['victories'] = 1;
			}
			else {
				file[i]['games'][rows][cols]['games']++;
			}
		}
	}
	let final = {users: file};
	try {
		fs.writeFileSync("users.json",JSON.stringify(final));
	}
	catch(err) {
		return 2;
	}
	return 0;
}

module.exports.nickSizeAlreadyWaiting = function(group,nick,size) {
	for (var i = 0 ; i < games.length ; i++) {
		console.log('grp: ' + games[i].group + ' ' + 'nick:' + games[i].nick1);
		if (games[i].group == group && games[i].nick1 == nick && games[i].size.column == size.columns && games[i].size.rows == size.rows && games[i].active == false)
			return true;
	}
	return false;
}

module.exports.groupSizeAlreadyWaiting = function(group,size) {
	for (var i = 0; i < games.length ; i++) {
		if (games[i].group == group && games[i]['size']['columns'] == size['columns'] && games[i]['size']['rows'] == size['rows'] && games[i].active == false)
			return true;
	}
	return false;
}

module.exports.leaveGame = function(id,nick) {
	var win;
	var lose;
	for (let i = 0 ; i < games.length ; i++) {
		if (games[i].gameid == id) {
			if (games[i].nick1 != nick && games[i].nick2 != nick)
				return 1;
			clearTimeout(games[i].timeout);
			if (games[i].nick2 == null) {
				winner = null;
			}
			else {
				if (games[i].nick1 == nick) {
					lose = games[i].nick1;
					win = games[i].nick2;
				}
				else {
					lose = games[i].nick2;
					win = games[i].nick1;
				}
				updateRanking(games[i]['size'],win,lose);
			}
			update(JSON.stringify({winner: winner}), games[i].responses.response1, games[i].responses.response2);
			if (games[i].responses.response1 != null)
				games[i].responses.response1.end();
			if (games[i].responses.response2 != null)	
				games[i].responses.response2.end();
			games.splice(i,1);
			return 0;
		}

	}
	return 1;
}
				// 0 -> Correu bem
				// 1 -> Coluna Cheia
				// 2 -> Turno errado
				// 3  -> Indice invalido
				// 4 -> Problema no jogo/Game not found
module.exports.play = function(id, nick,column) {
	console.log('someone played');
	for (let i = 0; i < games.length ; i++ ) {
		if (games[i].gameid == id && games[i].active == true) {
			clearTimeout(games[i].timeout);
			//Caso 1
			if (games[i].board[column] > games[i].size.rows) {
				return 1;
			}
			//Caso 2
			if (games[i].turn != nick)
				return 2;
			//Caso 3
			if (column < 0)
				return 3
			else {
				//Por peça no array
				console.log(games[i]['size']['rows'] + ' rows');
				for (let xi = games[i]['size']['rows'] - 1 ; xi >= 0; xi-- ) {
					if (games[i].board[column][xi] == null) {
						games[i].board[column][xi] = nick;
						break;
					}
				}
				console.log('changed the board with column value: ' + column);
				console.log(games[i].board);
				let win = checkWin(games[i].board,games[i]['size']['columns'],games[i]['size']['rows'],nick);
				console.log('checkStateWin: ' + win);
				if (win == 0) {	
					//Ninguem ganhou
					if (games[i].turn == games[i].nick1)
						games[i].turn = games[i].nick2;
					else {
						games[i].turn = games[i].nick1;
					}
					var timeout = setTimeout(function() { waitIsOver(id); },120000);
					games[i].timeout = timeout;
					update(JSON.stringify({turn: games[i].turn, board: games[i].board, column: column }),games[i].responses.response1,games[i].responses.response2);
					console.log('sucess on update');
					//games[i].responses.response1.end();	
					//games[i].responses.response2.end();
				
				}
				else if (win == 1) {
					//Ultimo jogador ganhou
					update(JSON.stringify({winner: nick, board: games[i].board,column: column}),games[i].responses.response1,games[i].responses.response2);
					games[i].responses.response1.end();
					games[i].responses.response2.end();
					if (nick == games[i].nick1)
						updateRanking(games[i].size,nick, games[i].nick2);
					else
						updateRanking(games[i].size,nick, games[i].nick1);
					games.splice(i,1);
					
				}
				else {
					console.log('tabuleiro cheio');
					//Tabuleiro cheio
					//leavegame();
					
				}
				return 0;
			}
		}
	}
	return 4;
 }

function startGame(selected) {
	games[selected].active = true;
	games[selected].turn = games[selected].nick1;
	update(JSON.stringify({ turn: games[selected].turn, board: games[selected].board}),games[selected].responses.response1,games[selected].responses.response2);
	return;
}

module.exports.startConnection = function(id, nick, response) {
	for ( let i = 0 ; i < games.length ; i++) {
		if (games[i].gameid == id) {
			console.log('encontrei GID no startConnection');
			if (games[i].nick1 == nick && games[i].responses.response1 == null) {
				games[i].responses.response1 = response;
				response.writeHead(200, {
					'Content-Type': 'text/event-stream',
					'Cache-Control': 'no-cache',
					'Access-Control-Allow-Origin': '*',
					'Connection': 'keep-alive'
				});
				return 0;
			}
			else if (games[i].nick2 == nick && games[i].responses.response2 == null) {
				games[i].responses.response2 = response;
				response.writeHead(200, {
					'Content-Type': 'text/event-stream',
					'Cache-Control': 'no-cache',
					'Access-Control-Allow-Origin': '*',
					'Connection': 'keep-alive'
				});
				games[i].active = true;
				startGame(i);
				return 0;
			}
			break;
		}
	}
	return 1;
}

function update( message, response1, response2 ) {
	if (response1 != null) {
		console.log('wrote on response1');
		response1.write('data: '+message+"\n\n");
	}
	if (response2 != null) {
		console.log('wrote on response2');
		response2.write('data: '+message+"\n\n");
	}
	return;
}

function checkWin(boardState,height,width,nick) {
			var k = 0;
			for ( var i = 0 ; i < height; i++) {
				for ( var j = 0 ; j < width; j++) {
					if (boardState[i][j] != null) {
					
						//PESQUISA HORIZONTAL
						for (k = 1; k < 4 && j+k<width;k++) {
							if (boardState[i][j+k] != boardState[i][j])
								break;
						}
						if (k>=4)
							return 1;

						//PESQUISA VERTICAL
						for(k=1; k<4 && i+k<height;k++) {
							if (boardState[i+k][j] != boardState[i][j])
								break;
						}
						if (k>=4)
							return 1;

						//PESQUISA DIAGONAL DIREITA/BAIXO
						for (k=1;k < 4 && i+k<height && j+k<width;k++) {
							if (boardState[i+k][j+k] != boardState[i][j])
								break;
						}
						if (k>=4)
							return 1;

						//PESQUISA DIAGONAL ESQUERDA/BAIXO
						for (k=1;k < 4 && i+k<height && j-k>=0;k++ ) {
							if (boardState[i+k][j-k] != boardState[i][j])
								break;
						}
						if (k>=4)
							return 1;
						}
					}
				}

		for (var l = 0 ; l < height;l++)
			for ( var m = 0; m < width; m++)
				if (boardState[l][m] == null)
					return 0;
		
		return 2;
}