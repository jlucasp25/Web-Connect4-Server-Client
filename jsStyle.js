/*     Script das Animações - Connect4     */
/*     João Lucas Pires - up201606617      */
/*     João Pedro Aguiar - up201606361     */

function activateBlur(elem) {
	var curr = [];

	curr[0] = document.getElementById('localplay');
	curr[1] = document.getElementById('remoteplay');
	curr[2] = document.getElementById('ranking');
	curr[3] = document.getElementById('instructions');
	curr[4] = document.getElementById('rankingl');
	var clicked = document.getElementById(elem);
	
	for ( var i = 0 ; i < curr.length ; i++) {
		if (curr[i] == clicked) {
			curr[i].classList.add('text-focus-in');
			curr[i].classList.remove('hide');
		}
		else {
			if (curr[i].classList.contains('hide') == false) {
				curr[i].classList.add('hide');
			}
		}
	}
}