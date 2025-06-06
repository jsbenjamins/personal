/* Script om van een tabel (6 x 6) met platen een memoryspel te maken
*
* aantal variablelen die over het hele script nodig zijn
* pics 			- array om platen in op te slaan
* map 			- om locatie van platen op te slaan
* user			- om locatie van goed omgedraaide platen op te slaan
* temparray 	- tijdelijke array om map te kunnen randomiseren
* clickarray 	- om kliklocaties op te slaan
* ticker		- om te kunnen tellen
* sec 			- om tellen om te zetten in seconden
* min			- om teller om te zetten in minuten
* ctr 			- teller om bij te houden hoeveel platen aangeklikt zijn.
* id 			- id is pointer naar de clock
* oktoclick 	- om te kijen of je nog verder mag klikken
* finished 		- duhuh, are you done yet? ;)
* jehebtertwee 	- heb je twee kaarten omgedraaid.
*
*/

var pics = new Array();
for (i = 0; i <= 30; i++) {
	pics[i] = new Image();
	pics[i].src = '0.png';
	}

var map=new Array(1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9,10,10,11,11,12,12,13,13,14,14,15,15,16,16,17,17,18,18);
var user = new Array();
var temparray = new Array();
var clickarray = new Array(0, 0);
var clicks = new Array();
var times = new Array();
var ticker, sec, min, ctr, id, oktoclick, finished, jehebtertwee, geschud, gestart, clicksctr, timesctr;

/* Initialiseer die shit
*/
function init() {
	// defineer functie voor 'Start' knop, id = 'b'
	document.f.b.onclick=function() {begingame()};
	// zet the timeout op 0
	clearTimeout(id);
	// zet alle locaties op onomgedraaid en ken de showimage fucntie toe
	// aan de bijbehorende span met id 'link'+nr die bij die locatie hoort
	for (i = 0; i <= 35 ;i++) {
		user[i] = 0;
		document.getElementById("link"+i).onclick=function() {showimage(this.id);};
	}
	// zet alles op nul en aanklikbaar
	ticker = 0;
	min = 0;
	sec = 0;
	ctr = 0;
	oktoclick = true;
	finished = 0;
	jehebtertwee = 0;
	geschud = 0;
	gestart = 0;
	clicksctr = 0;
	timesctr = 0;
	scramble();
}

/* definieer de begingame functie
*/
function begingame() {
	document.f.b.value='Begin';
	loop();
	gestart = 1;
}

/* definieer de loop-functie; het starten van de klok en het
* randomiseren van de platen
*/
function loop() {
	if (document.f.b.value == 'Begin') {
		runclk();
	}
}

/* klokfunctie */
function runclk() {
	// rond de ticker naar beneden af voor minuten
	min = Math.floor(ticker/60);
	// rond het verschil tussen de ticker en de minuten af 
	// naar seconden
	sec = (ticker-(min*60))+'';
	if(sec.length == 1) {
		sec = "0"+sec;
		}
	// ticker  + 1
	ticker++;
	// schrijf de minuten en seconden naar de startknop.
	document.f.b.value = min+":"+sec;
	// run de klok over 1000 ms weer
	id = setTimeout('runclk()', 1000);
}

/* schud de kaarten */
function scramble() {
	if (!geschud==1) {
	//for (z = 0; z < 5; z++) {
		for (x = 0; x <= 35; x++) {
			temparray[0] = Math.floor(Math.random()*36);
			temparray[1] = map[temparray[0]];
			temparray[2] = map[x];
			map[x] = temparray[1];
			map[temparray[0]] = temparray[2];
      	}
   	//}
	geschud == 1;
	}
	//alert(map);
}

function flipimage(idee,plaat1,plaat2,idee2,plaat12,plaat22) {
	wd = document.getElementById(idee).getAttribute("width");
	if (arguments.length == 6) {
		wd2 = document.getElementById(idee2).getAttribute("width");
	}
	wdmax=96;          
	wdmin=0;            
	rate = 12;
	plaatnaam = document.getElementById(idee).getAttribute("src");
	plaatnaam = plaatnaam.substring(plaatnaam.lastIndexOf('/')+1);
	if (plaatnaam==plaat2) {
		flipped = 1;
		}
		else {
		flipped = 0;
		}
	if (flipped==1) {
		inc = -12;
		}
		else {
		inc=12;
		}
	wd = wd - inc;
	if (arguments.length == 6) {
		wd2 = wd2 -inc;
	}
	if (wd > wdmax) {
		return;
	}
  	document.getElementById(idee).setAttribute("width",wd);
	if (arguments.length == 6) {
		document.getElementById(idee2).setAttribute("width",wd2);
	}
	if (wd==wdmin) {
		document.getElementById(idee).setAttribute("src",plaat2);
		if (arguments.length == 6) {
			document.getElementById(idee2).setAttribute("src",plaat22);
			setTimeout("flipimage(idee,plaat1,plaat2,idee2,plaat12,plaat22)",rate);
		}else{
		setTimeout("flipimage(idee,plaat1,plaat2)",rate);}
 	}
  	else {
		if (arguments.length == 6) {
			setTimeout("flipimage(idee,plaat1,plaat2,idee2,plaat12,plaat22)",rate);
		}else{
   		setTimeout("flipimage(idee,plaat1,plaat2)",rate);}
   	}
}

function showimage(but) {
	if (gestart==1) {
		if (jehebtertwee < 2) {
		var newbut = String(but).substring(4,String(but).length);
		if (oktoclick) {
		oktoclick = false;
		idee =("img"+newbut);
		plaat1="0.png";
		plaat2=(map[newbut]+".png");
		flipimage(idee,plaat1,plaat2);
		if (ctr == 0) {
			ctr++;
			jehebtertwee++;
			clickarray[0] = newbut;
			oktoclick = true;
			}
		else {
			clickarray[1] = newbut;
			ctr = 0;
			jehebtertwee++;
			setTimeout('returntoold()', 1000);
			}
		}
		}
		else {
		}
	}
	else {
		//alert("Je hebt nog niet op start gedrukt");
		document.getElementById('message').innerHTML = "You did not press start yet";
		setTimeout('document.getElementById("message").innerHTML = "";',1500);
	}
}

function returntoold() {
if ((clickarray[0] == clickarray[1]) && (!user[clickarray[0]])) {
	idee=("img"+clickarray[0]);
	plaat1=(clickarray[0]+".png");
	plaat2="0.png";
	setTimeout('flipimage(idee,plaat1,plaat2)',300);
	setTimeout('jehebtertwee = 0;',540);
	oktoclick = true;
	}
	else {
		clicks[clicksctr] = map[clickarray[0]];
		clicksctr++;
		clicks[clicksctr] = map[clickarray[1]];
		clicksctr++;
		times[timesctr] = document.f.b.value;
		timesctr++;
		if (map[clickarray[0]] != map[clickarray[1]]) {
							
				idee=("img"+clickarray[0]);
				plaat1=(clickarray[0]+".png");
				plaat2="0.png";
				
				idee2=("img"+clickarray[1]);
				plaat12=(clickarray[1]+".png");
				plaat22="0.png";
				setTimeout('flipimage(idee,plaat1,plaat2,idee2,plaat12,plaat22);',300);
				setTimeout('jehebtertwee = 0;',540);
		}
		if (map[clickarray[0]] == map[clickarray[1]]) {
			if (user[clickarray[0]] == 0&&user[clickarray[1]] == 0) {
				finished++;
				idee=("img"+clickarray[0]);
				idee2=("img"+clickarray[1]);
				document.getElementById("leeg").setAttribute("src",map[clickarray[0]]+".png");
				document.getElementById(idee).setAttribute("src","leeg2.png");
				document.getElementById(idee).width = '0px';
				document.getElementById(idee).height = '0px';
				document.getElementById(idee2).setAttribute("src","leeg2.png");
				document.getElementById(idee2).width = '0px';
				document.getElementById(idee2).height = '0px';
				jehebtertwee = 0;
				}
			user[clickarray[0]] = 1;
			user[clickarray[1]] = 1;
		}
		if (finished >= 18) {
			//alert(['Je was klaar in '+document.f.b.value+' en je hebt ' +clicks.length+ ' keer moeten klikken']);
			document.getElementById('message').innerHTML = ['You found them all in '+document.f.b.value+' and needed ' +clicks.length+ ' clicks for it.'];
			//alert(times);
			//antwoord = [document.f.b.value + '|' + clicks + '|' + times + '|' + map];
			//alert(antwoord);
			resetGame();
			document.getElementById("spel").innerHTML = '<img src="kaart_en.png">';
			document.getElementById("instructie").innerHTML = 'Yes, that is all of them!';
			document.getElementById("flashplayer").innerHTML = '';
		
		}
		else {
			oktoclick = true;
			setTimeout('jehebtertwee = 0;',540);
		}
   	}
}

function resetGame() {
	//for (i = 0; i <= 35 ;i++) {
	//	user[i] = 0;
	//	document.getElementById("img"+i).setAttribute("src","0.png");
	//}
	//document.getElementById("leeg").setAttribute("src","leeg.png");
	init();
	document.f.b.value='Start';

}

window.onload=function() {init();};