/*     Script do Tabuleiro - Connect4      */
/*     João Lucas Pires - up201606617      */
/*     João Pedro Aguiar - up201606361     */

//Variáveis Globais

var currentTurn = 0;
var mainBoard = null;
var p1Points = 0;
var p2Points = 0;
var CPUPoints = 0;

/*Função initializer() - Recebe valores do Formulário de entrada e constrói o tabuleiro.*/
function initialize() {
	/*Obtém valores do formulário*/
	var sizes = [];
	var colors = [];
	var form = document.getElementById('lform');
	var hselect = document.getElementById('boardHeight');
	var wselect = document.getElementById('boardWidth');
	var p1cselect = document.getElementById('pieceColor1');
	var p2cselect = document.getElementById('pieceColor2');
	var bcselect = document.getElementById('boardColor');
	var cpuonoff = form.elements['cpuonoff'].value;
	if (cpuonoff ==	1)
		cpuonoff = 0;
	else
		cpuonoff = null;
	currentTurn = form.elements['firstplay'].value;
	sizes[0] = hselect.options[hselect.selectedIndex].value;
	sizes[1] = wselect.options[wselect.selectedIndex].value;
	colors[0] = p1cselect.options[p1cselect.selectedIndex].value;
	colors[1] = p2cselect.options[p2cselect.selectedIndex].value;
	var bc = bcselect.options[bcselect.selectedIndex].value;
	if (colors[0] == colors[1]) {
		window.alert('Os dois jogadores não podem usar peças de cores iguais. Retornando às cores padrão.');
		colors[0] = 'yellow';
		colors[1] = 'red';
	}

	/*Esconde elementos da página inicial*/
	var bootc = document.getElementById('bootcontainer');
	bootc.classList.add('hide');
	var btndiv = document.createElement("div");
	btndiv.classList.add('text-focus-in');
	btndiv.classList.add('menu');
	btndiv.id = 'btndiv';
	var giveup = document.createElement("a");
	var nextTurn = document.createElement("a");
	giveup.classList.add('buttontext');
	giveup.classList.add('btn');
	nextTurn.classList.add('buttontext');
	nextTurn.classList.add('btn');
	giveup.href = "#";
	giveup.id = "btn1";
	giveup.innerHTML = 'Desistir';
	nextTurn.href = "#";
	nextTurn.innerHTML = 'Passar o turno';
	giveup.addEventListener('click',function() { mainBoard.giveUp(); });
	nextTurn.addEventListener('click', function() {mainBoard.changeTurn();});
	btndiv.appendChild(giveup);
	btndiv.appendChild(nextTurn);
	document.body.appendChild(btndiv);
	
	/*Constrói o objeto tabuleiro*/
	mainBoard = new Board(sizes[0],sizes[1],colors[0],colors[1],cpuonoff,bc);
	mainBoard.drawBoard();
	if (currentTurn == 2 && cpuonoff == 0)
		mainBoard.CPUplay();
}

/*Sai do Jogo - Executa métodos finais, guarda o score e apaga o tabuleiro.*/
/*0 - ganha o jogador 1, 1 ganha o jogador 2, 2 ganha o CPU, 3 empate*/
function exit(whoWon) {
	delete mainBoard;
	mainBoard = undefined;
	if (whoWon == 0)
		p1Points++;
	else if (whoWon == 1)
		p2Points++;
	else
		CPUPoints++;
	LocalStorage(true,whoWon);
	/*Volta ao menu inicial*/
	var board = document.getElementById("boardContainer");
	var btns = document.getElementById("btndiv");
	var bootc = document.getElementById("bootcontainer");
	document.body.removeChild(board);
	document.body.removeChild(btns);
	bootc.classList.remove("hide");
	updateTable();
}
/*Atualiza a tabela com as vitórias*/
function updateTable() {
	var table = document.getElementById("trank");
	if (table.rows.length == 4) {
		table.deleteRow(1);
		table.deleteRow(1);
		table.deleteRow(1);
	}
		var r1 = table.insertRow(1);
		var r1cells = [];
		r1cells.push(r1.insertCell(0));
		r1cells.push(r1.insertCell(1));
		r1cells.push(r1.insertCell(2));
		var r2 = table.insertRow(2);
		var r2cells = [];
		r2cells.push(r2.insertCell(0));
		r2cells.push(r2.insertCell(1));
		r2cells.push(r2.insertCell(2));
		var r3 = table.insertRow(3);
		var r3cells = [];
		r3cells.push(r3.insertCell(0));
		r3cells.push(r3.insertCell(1));
		r3cells.push(r3.insertCell(2));
		r1cells[0].innerHTML = '1';
		r2cells[0].innerHTML = '2';
		r3cells[0].innerHTML = '3';
		if (CPUPoints > p1Points)
			if (CPUPoints >= p2Points) {
				r1cells[1].innerHTML = 'Computador';
				r1cells[2].innerHTML = CPUPoints;
			}
			else {
				r1cells[1].innerHTML = 'Jogador 2';
				r1cells[2].innerHTML = p2Points;
				r2cells[1].innerHTML = 'Computador';
				r2cells[2].innerHTML = CPUPoints;
				r3cells[1].innerHTML = 'Jogador 1';
				r3cells[2].innerHTML = p1Points;
			}
		else {
			if (p2Points >= CPUPoints) {
				r1cells[1].innerHTML = 'Jogador 1';
				r1cells[2].innerHTML = p1Points;
				r2cells[1].innerHTML = 'Jogador 2';
				r2cells[2].innerHTML = p2Points;
				r3cells[1].innerHTML = 'Computador';
				r3cells[2].innerHTML = CPUPoints;
			}
			else {
				r1cells[1].innerHTML = 'Jogador 1';
				r1cells[2].innerHTML = p1Points;
				r2cells[1].innerHTML = 'Computador';
				r2cells[2].innerHTML = CPUPoints;
				r3cells[1].innerHTML = 'Jogador 2';
				r3cells[2].innerHTML = p2Points;
			}
		}
}
/* Classe / Construtor de Objeto tabuleiro (Board) */
function Board(height,width,p1c,p2c,cpu,bc) {

			/*Propriedades do Tabuleiro*/
			this.height = height;
			this.width = width;
				this.player1Color = p1c;
			this.player2Color = p2c;
			if (cpu == null || cpu == undefined)
				this.cpu = false;
			else
				this.cpu = true;
			this.boardColor = bc;
			this.boardState = []; //0 para nada; 1 para jogador 1; 2 para jogador 2
			for ( var i = 0 ; i < height ; i++ )
				this.boardState[i] = [];	
			/*Métodos do Board*/

			/*drawBoard() - Constrói o tabuleiro a partir das propriedades do objeto e apresenta-o na página Web.*/				
			this.drawBoard = function() {
				//Variável para "permitir" aceder a este scope
				_this = this;
				
				//Cria contentor para o tabuleiro
				var boardContainer = document.createElement("div");
				boardContainer.id = "boardContainer";
				boardContainer.classList.add('text-focus-in');
				//Cria colunas e linhas
				for (var i = 0 ; i < this.width; i++) {
					//Cria colunas
					var colx = document.createElement("div");
					colx.classList.add("col");
					colx.classList.add(this.boardColor);
					colx.id = "c" + i;
					cxid = colx.id;
					colx.addEventListener("click",function() {_this.play(this.id);});	
					for (var j = 0 ; j < this.height; j++) {
					//adiciona linhas/pecas nas colunas
						var placex = document.createElement("div");
						placex.id = "l" + j;
						var svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
						svg.setAttribute("width",100);svg.setAttribute("height",100);
						var circ = document.createElementNS("http://www.w3.org/2000/svg",'circle');
						circ.setAttribute("cx",50);circ.setAttribute("cy",50);circ.setAttribute("r",40);
						circ.classList.add("circle");circ.classList.add("white");
						circ.id = "c" + i + "l" + j;
						svg.appendChild(circ);
						placex.appendChild(svg);
						colx.appendChild(placex);
					}
					boardContainer.appendChild(colx); 
				}

				//Cria matriz incial do estado do tabuleiro
				for (var i = 0 ; i < this.height; i++) {
					for (var j = 0 ; j < this.width; j++) {
						this.boardState[i][j] = 0;
					}
				}
				document.body.appendChild(boardContainer);
			};

			this.drawBoardOnline = function() {
				//Variável para "permitir" aceder a este scope
				_this = this;
				console.log("drawing online");
								//Cria contentor para o tabuleiro
				var boardContainer = document.createElement("div");
				boardContainer.id = "boardContainer";
				boardContainer.classList.add('text-focus-in');
				//Cria colunas e linhas
				for (var i = 0 ; i < this.width; i++) {
					//Cria colunas
					var colx = document.createElement("div");
					colx.classList.add("col");
					colx.classList.add(this.boardColor);
					colx.id = "c" + i;
					cxid = colx.id;
					colx.addEventListener("click",function() {_this.playOnline(this.id);});	
					for (var j = 0 ; j < this.height; j++) {
					//adiciona linhas/pecas nas colunas
						var placex = document.createElement("div");
						placex.id = "l" + j;
						var svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
						svg.setAttribute("width",100);svg.setAttribute("height",100);
						var circ = document.createElementNS("http://www.w3.org/2000/svg",'circle');
						circ.setAttribute("cx",50);circ.setAttribute("cy",50);circ.setAttribute("r",40);
						circ.classList.add("circle");circ.classList.add("white");
						circ.id = "c" + i + "l" + j;
						svg.appendChild(circ);
						placex.appendChild(svg);
						colx.appendChild(placex);
					}
					boardContainer.appendChild(colx); 
				}

				//Cria matriz incial do estado do tabuleiro
				for (var i = 0 ; i < this.height; i++) {
					for (var j = 0 ; j < this.width; j++) {
						this.boardState[i][j] = null;
					}
				}
				var txt = document.getElementById('aespera');
				txt.remove();
				var leaveBtn = document.createElement("a");
				leaveBtn.classList.add("buttontext");
				leaveBtn.classList.add("btn");
				leaveBtn.innerHTML = "Sair";
				leaveBtn.id = "leaveBTN";
				leaveBtn.addEventListener("click",function() { request("LEAVE",undefined,user,pass,undefined,game,undefined);});
				document.body.appendChild(leaveBtn);
				document.body.appendChild(boardContainer);

			};

			/*updateStateBoard() - Atualiza o estado do tabuleiro*/
			this.updateStateBoard = function() {
				for ( var i = 0 ; i < this.height ; i++ ) { 
					for ( var j = 0 ; j < this.width; j++ ) {
						if (document.getElementById('c'+j+'l'+i).classList.contains(this.player2Color))
							this.boardState[i][j] = 2;
						else if (document.getElementById('c'+j+'l'+i).classList.contains(this.player1Color))
							this.boardState[i][j] = 1;
						else
							this.boardState[i][j] = 0;
					}
				}
			};

			this.updateStateBoardOnline = function(brd) {
				for (var i = 0 ; i < this.width ; i++) {
					for ( var j = 0 ; j < this.height ; j++) {
						let peca = document.getElementById('c'+i+'l'+j);
						if (brd[i][j] == user) {
							peca.classList.remove('white');
							peca.classList.add("bounce-in-top");
							peca.classList.add(this.player1Color);
	
						}
						else if (brd[i][j] != null){
							peca.classList.remove('white');
							peca.classList.add("bounce-in-top");
							peca.classList.add(this.player2Color);	
							
						}
					}
				}
				if (currentTurnOnline == user)
					setTimeout(writeAlert("Seu turno ("+currentTurnOnline+")"),600);
				else
					setTimeout(writeAlert("Turno do adversário ("+currentTurnOnline+")"),600);
			};
			/*play() - Executa uma jogada/turno*/
			this.play = function(selectedCol) {
				var _this = this;
				this.checkLowerAndPut(selectedCol);
				this.updateStateBoard();
				var turnResult = this.checkWin();
				if (turnResult == 1) {
					/*Alguém Ganhou*/
					if (currentTurn == 1) {
						setTimeout( function() {window.alert('O jogador 2 Ganhou!')},10); //A função anónima em conjunto com o timeout obriga a esperar!
						if (this.cpu == true)
							exit(2);
						elements
							exit(1);
					}
					else {
						setTimeout( function() {window.alert('O jogador 1 Ganhou!')},10);
						exit(0);
					}
				}
				/*Empate*/
				else if (turnResult == 2) {
					setTimeout( function() {window.alert('Empate! Tabuleiro Cheio!');},10);
					exit(3);
				}
				if (this.cpu == true)
					setTimeout(function() {_this.CPUplay();},900);
			};

			this.playOnline = function(selectedCol) {
				if (currentTurnOnline == user) {
					var colnum = parseInt(selectedCol.substring(1));
					request("NOTIFY",undefined,user,pass,undefined,game,colnum);
				}
				else {
					if (currentTurnOnline != undefined)
						alert("Não é a sua vez de jogar!");
					else
						alert("O jogo ainda não começou!");
				}
			};


			/*CPUplay() - Executa a jogada do CPU */
			this.CPUplay = function() {
				//var randCol = Math.floor((Math.random() * (this.width - 1)));
				var selected = this.basicIA();
				this.checkLowerAndPut('c'+selected);
				this.updateStateBoard();
				var turnResult = this.checkWin();
				if (turnResult == 1) {
					/*Alguém Ganhou*/
					if (currentTurn == 1) {
						setTimeout( function() {window.alert('O jogador 2 Ganhou!')},10); //A função anónima em conjunto com o timeout obriga a esperar!
						if (this.cpu == true)
							exit(2);
						else
							exit(1);
					}
					else {
						setTimeout( function() {window.alert('O jogador 1 Ganhou!')},10);
						exit(0);
					}
				}
				/*Empate*/
				else if (turnResult == 2) {
					setTimeout( function() {window.alert('Empate! Tabuleiro Cheio!');},10);
					exit(3);
				}
			};

			/*checkLowerAndPut - Põe peça na posição mais inferior da coluna*/
			this.checkLowerAndPut = function(colx) {
				var selectedColumn = document.getElementById(colx);	
				var childs = selectedColumn.childNodes;
				var played = false;
				//Entra dentro do div da linha, depois do svg e por fim do circle
				for (var i = (childs.length - 1); i >= 0 ; i--) {
					if (childs[i].firstChild.firstChild.classList.contains('white')) {
						childs[i].firstChild.firstChild.classList.remove('white');
						if (currentTurn == 1) {
							childs[i].firstChild.firstChild.classList.add("bounce-in-top");
							childs[i].firstChild.firstChild.classList.add(this.player1Color);
							currentTurn = 2;
							played = true;
						}
						else {
							childs[i].firstChild.firstChild.classList.add("bounce-in-top");
							childs[i].firstChild.firstChild.classList.add(this.player2Color);
							currentTurn = 1;
							played = true;
						}
						break;
					}
				}
				
				if ( played == false )				
						window.alert('Esta coluna está cheia. Tente outra =)');
				return;
			};	
		
		/*checkWin() - Faz verificação de vitória. (0 - Sem vitória;1 - Último jogador ganhou;2 - Empate)*/
		this.checkWin = function() {
			var k = 0;
			for ( var i = 0 ; i < this.height; i++) {
				for ( var j = 0 ; j < this.width; j++) {
					if (this.boardState[i][j] != 0) {
					
						//PESQUISA HORIZONTAL
						for (k = 1; k < 4 && j+k<this.width;k++) {
							if (this.boardState[i][j+k] != this.boardState[i][j])
								break;
						}
						if (k>=4)
							return 1;

						//PESQUISA VERTICAL
						for(k=1; k<4 && i+k<this.height;k++) {
							if (this.boardState[i+k][j] != this.boardState[i][j])
								break;
						}
						if (k>=4)
							return 1;

						//PESQUISA DIAGONAL DIREITA/BAIXO
						for (k=1;k < 4 && i+k<this.height && j+k<this.width;k++) {
							if (this.boardState[i+k][j+k] != this.boardState[i][j])
								break;
						}
						if (k>=4)
							return 1;

						//PESQUISA DIAGONAL ESQUERDA/BAIXO
						for (k=1;k < 4 && i+k<this.height && j-k>=0;k++ ) {
							if (this.boardState[i+k][j-k] != this.boardState[i][j])
								break;
						}
						if (k>=4)
							return 1;
						}
					}
				}

				for (var l = 0 ; l < this.height;l++)
					for ( var m = 0; m < this.width; m++)
						if (this.boardState[l][m] == 0)
							return 0;
				return 2;
		};

		/*IA básica que escolhe a coluna com menos peças para jogar*/
		this.basicIA = function () {
			var count = [];
			var max = -999;
			var maxi = 0;
			for (var i = 0 ; i < this.width; i++) {
				count.push(0);
				for (var j = 0 ; j < this.height; j++) {
					if (this.boardState[j][i] == 0)
						count[i]++;
				}
			}
			for (var i = 0 ; i < this.width;i++) {
				if (count[i] > max) {
					max = count[i];
					maxi = i;
				}
			}
			return maxi;
		};	
		
		/*Muda o turno manualmente*/
		this.changeTurn = function() {
			if (currentTurn == 1) {
				currentTurn = 2;
				window.alert('É a vez do jogador 2.');
				if (this.cpu == true)
					this.CPUplay();
			}
			else {
			currentTurn = 1;
			window.alert('É a vez do jogador 1.');
			}
		};

		this.changeTurnOnline = function() {
			if (currentTurn == 1) {
				currentTurn = 2;
				window.alert('É a vez do jogador 2.');
				if (this.cpu == true)
					this.CPUplay();
			}
			else {
			currentTurn = 1;
			window.alert('É a vez do jogador 1.');
			}
		};

		/*Permite ao jogador atual desistir*/
		this.giveUp = function () {
			if (currentTurn == 1) {
				window.alert('O jogador 1 desistiu. Ganhou o jogador 2!');
				if (this.cpu == true)
					exit(2);
				else
					exit(1);
			}
			else {
				window.alert('O jogador 2 desistiu. Ganhou o jogador 1!');
				exit(0);
			}
		};
	}
