/*     Script Server-Side - Connect4     */
/*     João Lucas Pires - up201606617      */
/*     João Pedro Aguiar - up201606361     */

const serverURL = "http://127.0.0.1:8156/";
const serverURLupdate = "http://127.0.0.1:8156/update";
var serverJoin = null;
var user = undefined;
var pass = null;
var game = null;
var cols = null;
var rows = null;
var p2name = null;
var nupdates = 0;
var isOnline = false;
var mainBoardOnline = undefined;
var currentTurnOnline = undefined;
//GRUPO 56

//{"board":{"board":[[null,null,null,null],[null,null,null,null],[null,null,null,null],[null,null,null,null]],"size":{"rows":4,"columns":4}},"turn":"lucas9990"}
function answer(fnType,jsonAnswer) { return new Promise(function(resolve,reject) {
	//window.alert(JSON.stringify(jsonAnswer));
	if (fnType == "REGISTER") {
		if (JSON.stringify(jsonAnswer) == "{}") {
			serverResponse = true;
			return resolve("Registo Sucedido/Password Confirmada!");
		}
		else
			serverResponse = false;
			return reject(Error('Erro: ' + jsonAnswer.error));
	}
	else if (fnType == "JOIN") {
		console.log(jsonAnswer);
		if (jsonAnswer.hasOwnProperty('game')) {
			return resolve(jsonAnswer.game);
		}
		else
			return reject(Error('Erro_join: '+ jsonAnswer.error ));
	}
	else if (fnType == "LEAVE") {
		if (JSON.stringify(jsonAnswer) == "{}") {
			return resolve("Saiu do jogo!");			
		}
		else
			return reject(Error("Erro durante o Leave"));
	}
	else if (fnType == "NOTIFY") {
		if (JSON.stringify(jsonAnswer) == "{}")
			return resolve("Jogada válida");
		else if (jsonAnswer.hasOwnProperty("error")) {
			if (jsonAnswer.error[0] == 'c' && jsonAnswer.error[1] == 'o' && jsonAnswer.error[2] == 'l' ) {
				alert("Coluna cheia. Tente novamente.");
				return resolve("COL_FULL");
			}
			return reject(Error('Erro: ' + jsonAnswer.error));
		}
	}
	else if (fnType == "RANKING") {
		console.log('reached Ranking');
		if (JSON.stringify(jsonAnswer) == "{}") {
			return reject(Error("Ainda não existe tabela para os valores pedidos."));
		}
		else if (jsonAnswer.hasOwnProperty("error")) {
			return reject(Error("Erro: " + jsonAnswer.error));
		}
		else if (jsonAnswer.hasOwnProperty("ranking")) {
			rankingDraw(jsonAnswer.ranking);
			return resolve("Tabela descarregada");
		}
		else
			return reject(Error("Algum erro durante a transferência do ranking"));
	}
	else {
		return reject(Error("O tipo de pedido é inválido!"));
	}
});}



function register(nickx, passx,sizex) {
	var jsonStr = JSON.stringify({ nick: nickx , pass: passx });
	fetch(serverURL+'register', { method:"POST" , body: jsonStr } ).
	then( response => response.json() ).
	then( data => { answer("REGISTER",data).then(str => { window.alert(str);request("JOIN",56,nickx,passx,sizex,undefined,undefined)}).catch( err => {alert(err.message);location.reload(true)})}).
	catch( err => {alert(err.message);location.reload(true);} ) 

}

 function join(groupx,nickx,passx,sizex) {
	var jsonStr = JSON.stringify( { group: groupx, nick: nickx , pass: passx, size: sizex });
	 fetch(serverURL+'join', { method: "POST", body: jsonStr }).then( response => response.json()).
	then( data => {answer("JOIN",data).then(str => {console.log(str);game = str;update();}).catch( err => {alert(err.message);location.reload(true)})}).
	catch( err => {alert(err.message);location.reload(true);})
	
}

function leave(nickx,passx,gamex) {
	var jsonStr = JSON.stringify( { nick: nickx, pass: passx, game: gamex});
	fetch(serverURL+'leave',{ method:"POST" , body: jsonStr } ).
	then( response => response.json() ).
	then( data => { answer("LEAVE",data).then(str => alert(str)).catch(err => {alert(err.message);location.reload(true)})}).
	catch( err => {alert(err.message);location.reload(true)}) 
}

function notify(nickx,passx,gamex,columnx) {
	var jsonStr = JSON.stringify( { nick: nickx, pass: passx, game: gamex, column: columnx});
	fetch(serverURL+'notify',{ method:"POST" , body: jsonStr } ).
	then( response => response.json() ).
	then( data => {answer("NOTIFY",data).then(str => console.log(str)).catch(err => {alert(err.message);location.reload(true);})}).
	catch(err => {alert(err.message);location.reload(true)}); 
}


function ranking(sizex) {
	console.log('reached ranking fetch');
	var jsonStr = JSON.stringify( { size: sizex });
	fetch(serverURL+'ranking',{ method:"POST" , body: jsonStr } ).
	then( response => response.json() ).
	then( data => {answer("RANKING",data).then(str => alert(str)).catch(err => {alert(err.message);location.reload(true);})}).
	catch( err => {alert(err.message);location.reload(true)} ); 
}

/*.error != NULL */
function request(fnType,group,nick,pass,size,game,column) {
	if (fnType == "REGISTER") {
			register(nick,pass,size);
	} 
	else if (fnType == "JOIN") {
			join(group,nick,pass,size);
	}
	else if (fnType == "LEAVE") {
			leave(nick,pass,game);
	}
	else if (fnType == "NOTIFY") {
			notify(nick,pass,game,column);
	}
	else if (fnType == "RANKING") {
			ranking(size);
	}
	else {
		window.alert("fnType inválido no pedido!");
		return;
	}
	return;
}


function startAndPair() {
	isOnline = true;
	var usx = document.getElementById('sUname').value;
	var pswx = document.getElementById('sPsw').value;
	user = usx;
	pass = pswx;
	var sizer = document.getElementById('boardHeightON').value;
	var sizec = document.getElementById('boardWidthON').value;
	rows = parseInt(sizer);
	cols = parseInt(sizec);
	var sizex = { rows: parseInt(sizer) , columns: parseInt(sizec) } ;
	//window.alert(JSON.stringify(sizex));
	waiting(false);
	request("REGISTER",undefined,user,pass,sizex,undefined,undefined);
	var p1c = document.getElementById('pieceColor1r');
	var cp1c = p1c.options[p1c.selectedIndex].value;
	var p2c = document.getElementById('pieceColor2r');
	var cp2c = p2c.options[p2c.selectedIndex].value;
	var bc = document.getElementById('boardColorr');
	var cbc = bc.options[bc.selectedIndex].value;
	//request("JOIN",56,user,pass,sizex,undefined,undefined);
	mainBoardOnline = new Board(rows,cols,cp1c,cp2c,null,cbc);
	mainBoardOnline.drawBoardOnline();
	return;	
}

function update() {
	let url = serverURLupdate+'?nick='+user+'&game='+game;
	var eventListener = new EventSource(url);
	console.log("update_game: " + game)
	eventListener.onmessage = function(jsonMsg) {
		console.log(jsonMsg.data);
		var data = JSON.parse(jsonMsg.data);
		if (data.hasOwnProperty("winner") && data.winner == null) {
			alert("Empate! Fim do Jogo.");
			eventListener.close();
			location.reload(true);
			return;
		}

		if (data.hasOwnProperty("winner")) {
			alert(data.winner + " ganhou!");
			eventListener.close();
			location.reload(true);
		}

		if (data.hasOwnProperty("error")) {
			alert("Erro: "+data.error);
		}

		if (data.hasOwnProperty("turn"))
			currentTurnOnline = data.turn;

		if (data.hasOwnProperty("board")){
			if (data.board.hasOwnProperty("board")) {
				alert("Encontrado um utilizador! O jogo começou.");
				mainBoardOnline.updateStateBoardOnline(data.board.board);
			}
			else
				mainBoardOnline.updateStateBoardOnline(data.board);
		}
	
	}
}

function waiting(goBack) {
	if (goBack == false) {
	var body = document.getElementById('bootcontainer');
	body.classList.add('hide');
	var aespera = document.createElement('h2');
	aespera.innerHTML = 'Á espera de um jogo...';
	aespera.classList.add('title');
	aespera.id = "aespera";
	document.body.appendChild(aespera);
	}
	else {
		var body = document.getElementById('bootcontainer');
		var txt = document.getElementById('aespera');
		txt.remove();
		body.classList.remove('hide');
	}
}

function parseRanking() {
	let rkHeight = parseInt(document.getElementById('rankingHeight').value);
	let rkWidth = parseInt(document.getElementById('rankingWidth').value);
	let sizex = { rows: rkHeight , columns: rkWidth }; 
	let formx = document.getElementById('rankForm');
	formx.remove();
	request("RANKING",undefined,undefined,undefined,sizex,undefined,undefined);
}

function rankingDraw(jsonRank) {
	console.log('tried to draw');
	console.log(jsonRank);
	let count = 1;
	let tab = document.createElement("table");
	let head = tab.createTHead();
	let hrow = head.insertRow(0);
	let hcell1 = hrow.insertCell(0);
	hcell1.innerHTML = '#';
	let hcell2 = hrow.insertCell(1);
	hcell2.innerHTML = 'Nick';
	let hcell3 = hrow.insertCell(2);
	hcell3.innerHTML = 'Vitórias';
	let hcell4 = hrow.insertCell(3);
	hcell4.innerHTML = 'Jogos';
 	for (let i = 0 ; i < 10 ; i++) {
 		if (jsonRank[i] == undefined)
 			break;
 		let row = tab.insertRow();
 		let cell1 = row.insertCell(0);
 		cell1.innerHTML = count;
		let cell2 = row.insertCell(1);
 		cell2.innerHTML = jsonRank[i].nick;
 		let cell3 = row.insertCell(2);
 		cell3.innerHTML = jsonRank[i].victories;
 		let cell4 = row.insertCell(3);
 		cell4.innerHTML = jsonRank[i].games;
		count++;
	}
	var reloadbtn = document.createElement("a");
	reloadbtn.classList.add("buttontext");
	reloadbtn.classList.add("btn");
	reloadbtn.id="rldbtn";
	reloadbtn.innerHTML = "Voltar";
	reloadbtn.addEventListener("click", function() { setTimeout(location.reload(true),800);});

	document.getElementById('ranking').appendChild(tab);
		document.getElementById('ranking').appendChild(reloadbtn);
}

function writeAlert(str) {
	let alert = document.createElement("div");
	alert.classList.add("alert");
	let span = document.createElement("span");
	span.classList.add('closebtn');
	span.addEventListener("click",function() { this.parentElement.style.display='none';});
	span.innerHTML = '&times;';	
	alert.innerHTML = str;
	alert.appendChild(span);
	document.body.appendChild(alert);	
	setTimeout(function() {alert.classList.add('alertexit');setTimeout(function() {alert.remove();},800);},5000);	
}

window.onload = function BuildStorage() {
	LocalStorage(false);
}

function LocalStorage(save,winner) {
	if (typeof(Storage) !== "undefined") {
    	var storage = window.localStorage;
    	if (storage.getItem("PC") === null) {
    		storage.setItem("PC","0");
    		storage.setItem("P1","0");
    		storage.setItem("P2","0");
    		displayStorage(storage);
    	}
    	else {
    		if (save == true) {
    			updateStorage(storage,winner);
    			displayStorage(storage);
    		}
    		else
    			displayStorage(storage);
    	}
    } 
    else 
    {
    window.alert("O seu browser não suporta WebStorage, logo a funcionalidade não está disponível.");
    return;
	}
}

function updateStorage(storage,winner) {
	if (winner == 0) {
		let val = parseInt(storage.P1);
		val++;
		storage.P1 = val.toString();
	}
	else if (winner == 1) {
		let val = parseInt(storage.P2);
		val++;
		storage.P2 = val.toString();
	}
	else if ( winner == 2) {
		let val = parseInt(storage.PC);
		val++;
		storage.PC = val.toString();
	}
	else {
		return;
	}
}

function displayStorage(storage) {
	var container = document.getElementById('rankingl');
	while (container.firstChild)
		container.removeChild(container.firstChild);
	let tab = document.createElement("table");
	let head = tab.createTHead();
	let hrow = head.insertRow(0);
	let hcell1 = hrow.insertCell(0);
	hcell1.innerHTML = 'Jogador';
	let hcell2 = hrow.insertCell(1);
	hcell2.innerHTML = 'Num. Vitórias';
	for (let i = 0 ; i < 3 ; i++) {
 		let row = tab.insertRow();
 		let cell1 = row.insertCell(0);
 		if (i == 0)
 			cell1.innerHTML = "Computador";
		else if (i == 1)
			cell1.innerHTML = "Jogador 1";
		else
			cell1.innerHTML = "Jogador 2";
		let cell2 = row.insertCell(1);
 		if (i == 0)
	 		cell2.innerHTML = storage.PC;
		else if (i == 1)
			cell2.innerHTML = storage.P1;
		else
			cell2.innerHTML = storage.P2;
	}
	container.appendChild(tab);	
}