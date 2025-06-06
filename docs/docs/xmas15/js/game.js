var Game = function() {
	
	var config = {
		"board" : "#board"
	}
	
	var clock,
		frameCount,
		interval,
		invaderSpeed = 20,
		dir = 1,
		ship,
		score = 0,
		lives = 2,
		motherShip;
	
	var invaders = [],
		bullets = [],
		barriers = [],
		barrierListeners = [];
		
	function levelComplete() {
		
		ship.remove();
		motherShip.remove();
		motherShip = null;
		ship = null;
		invaders = [];
		bullets = [];
		
		glow.dom.get(config["board"]).empty();			
		glow.dom.get(config["board"]).append("<div id='game_over'><h1>NEXT LEVEL</h1></div>");	
		
		setTimeout("Game.init()", 2000);
	}
	
	// Barriers --------------------------------------

	function makeBarriers() {
		var barriers_pos = [
		
			// One
			[100, 300],
			[100, 310],			
			[100, 320],
			[110, 300],
			[120, 300],			
			[130, 300],						
			[130, 310],						
			[130, 320],
			
			// Two
			[180, 300],
			[180, 310],			
			[180, 320],
			[190, 300],
			[200, 300],			
			[210, 300],						
			[210, 310],						
			[210, 320],			

			// Three
			[260, 300],
			[260, 310],			
			[260, 320],
			[270, 300],
			[280, 300],			
			[290, 300],						
			[290, 310],						
			[290, 320],
			
			// Four
			[340, 300],
			[340, 310],			
			[340, 320],
			[350, 300],
			[360, 300],			
			[370, 300],						
			[370, 310],						
			[370, 320]						
			
		]
		
		for (var i=0, len = barriers_pos.length;i<len;i++) {
			var barrier = new Barrier(barriers_pos[i][0],barriers_pos[i][1]);
			glow.dom.get(config["board"]).append(barrier.sprite);	
			barriers.push(barrier);
			
			barrierListeners.push(
				glow.events.addListener(
					barrier,
					'dead',
					function() {Game.removeBarrier(this)}
				)
			);
			
		}		
		
	}
	
	function removeBarriers() {
		for (var i=0, len = barriers.length;i<len;i++) {
			var barrier = barriers[i];
			barrier.sprite.remove();
		}
		barriers = [];
		barrierListeners = [];
	}
	
	
	// Mother Ship --------------------------------------
	
	function makeMotherShip() {
		var score = [50,100,150,300];
		motherShip = new MotherShip(score[Math.floor(Math.random() * score.length)]);
		glow.dom.get(config["board"]).append(motherShip.sprite);		
		motherShip.move();

		glow.events.addListener(
			motherShip,
			'dead',
			function() {Game.removeMotherShip()}
		);			
		
	}
	
	// Bullets ------------------------------------------
	
	function pauseBullets() {
		for (var i=0, len = bullets.length; i < len; i++) {
				bullets[i].movement.stop();
		}			
	}	
	
	function startBullets() {
		for (var i=0, len = bullets.length; i < len; i++) {
			bullets[i].movement.resume();
		}			
	}		
	
	// Invaders  ----------------------------------------
	function makeInvaders() {
		for (var i=0; i < 5; i++) {
		
			for (var y=0; y < 11; y++) {
			
				if (i == 0) {
					var bgOffset = "-36";
					var score = 30;
				} else if (i == 1 || i ==2) {
					var bgOffset = "-18";
					var score = 20;				
				} else {
					var bgOffset = "0";
					var score = 10;				
				}
			
				var invader = new Invader(68 + (34 * y), 65 + (30 * i), score, bgOffset);

				invaders.push(invader);
				
				glow.dom.get(config["board"]).append(invader.sprite);
				
				glow.events.addListener(
					invader,
					'dead',
					function() {Game.removeInvader(this)}
				);				
								
			}
		}
	}
	
	function moveInvadersAcross() {
						
		for (var i=0, len = invaders.length; i < len; i++) {
			
			if (dir > 0) {
				var invader = invaders[invaders.length - (i + 1) ];
			} else {
				var invader = invaders[i];			
			}
			
			var x = invader.pos["x"];
			var y = invader.pos["y"];				
			
			if (dir == -1 && x < 3) {
				dir = 1;
				i = 100;	
				moveInvadersDown();
			} else if (dir == 1 && x > 470) {
				dir = -1;						
				i = 100;
				moveInvadersDown();				
			} else {
				invader.updatePosition(x + (5 * dir), y);
				invader.move();						
			}
			
		}					
	}
	
	function moveInvadersDown() {
		sortInvadersByMinLeft();				
		for (var i=0, len = invaders.length; i < len; i++) {
			var invader = invaders[i];
			var x = invader.pos["x"];
			var y = invader.pos["y"] + 18;
			invader.updatePosition(x, y);
			invader.move();				
			if (y > 370) {
				gameOver();
				i = len;
			}
		}
	}
	
	function sortInvadersByMinLeft() {
		invaders.sort(function(a,b) {
			return a.pos["x"] - b.pos["x"];
		});
	}
	
	// Ship -------------------------------------------------
	
	function makeShip() {
		ship = new Ship();
		glow.dom.get(config["board"]).append(ship.sprite);
		glow.events.addListener(
			ship,
			'dead',
			function() {
				Game.pause();
				setTimeout("Game.shipDead()", 1000);
			},
			this
		);		
	}
	
	// Game -------------------------------------------------
	
	function gameOver() {
		Game.pause();
		glow.dom.get(config["board"]).empty();
		var txt = glow.dom.create("<div id='game_over'><h2>GAME OVER</h2><p><a href='javascript:window.location = window.location'>PLAY AGAIN</a></p></div>");
		glow.dom.get(config["board"]).append(txt);
	}
	
	function updateScore(new_score) {
		score += new_score;
		glow.dom.get("#score_actual").html(score);
	}
	
	
	return {
		
		// Bullets ------------------------------
		
		addBullet : function(bullet) {
			glow.events.addListener(
				bullet,
				'dead',
				function() {Game.removeBullet(this)}
			);					
			
			bullets.push(bullet);
			glow.dom.get(config["board"]).append(bullet.sprite);					
		},
		
		removeBullet : function(bullet) {
			for (var i=0, len = bullets.length; i < len; i++) {
				if (bullets[i] == bullet) {
					bullets.remove(i);								
				}
			}			
		},		
		
		// Invaders ------------------------------		

		removeInvader : function(invader) {
			for (var i=0, len = invaders.length; i < len; i++) {
				if (invaders[i] == invader) {
					updateScore(invader.score);
					invaders.remove(i);								
				}
				
				if (invaders.length == 0) levelComplete();
			}
		},
		
		getInvaders : function() {
			return invaders;
		},
		
		getMotherShip : function() {
			return motherShip;
		},
		
		// Ship  ------------------------------		
		
		getShip : function() {return ship;},
		
		
		shipDead : function() {
			lives = lives - 1;
			
			if (lives >= 0) {
				ship.remove();
				ship = null;
				makeShip();
				this.start();
				glow.dom.get("#lives").get(".life").slice(0,1).remove();
			} else {
				gameOver();
			}
		},
		
		// Mother Ship ------------------------------
		
		removeMotherShip : function() {
			updateScore(motherShip.score);		
			motherShip = null;
			makeMotherShip();
		},
		
		// Barriers ------------------------------
		
		getBarriers : function() {
			return barriers;
		},
		
		removeBarrier : function(barrier) {
			for (var i=0, len = barriers.length; i < len; i++) {
				if (barriers[i] == barrier) {
					barriers.remove(i);								
				}
			}
		},		
		
		// Game  ------------------------------
		
		init : function() {
			invaders = [],
			bullets = [],
			barriers = [],
			barrierListeners = [];
			
			glow.dom.get(config["board"]).empty();						
			frameCount = 1;
			makeInvaders();
			makeShip();
			makeMotherShip();
			makeBarriers();
			updateScore(0);
			this.start();
		},
		
		frame : function() {
			
			if (frameCount > (5 + (invaders.length / 10))) {
				frameCount = 1;				
				moveInvadersAcross();
				
				// Shall invader fire
				if (Math.floor(Math.random() * 8) == 3) {
					var rand = Math.floor(Math.random() * invaders.length);
					invaders[rand].fire();				
				}
				
			}
			
			frameCount++;
		},
				
		pause : function() {
			this.paused = true;
			pauseBullets();
			ship.removeListeners();
			clearInterval(interval);
		},
		
		start : function() {
			this.paused = false;
			
			startBullets();
			ship.makeListeners();

			clearInterval(interval);
			interval = setInterval("Game.frame()", 40);					
		}
		
	}
	

}();

glow.events.addKeyListener("p", "press",
    function () {
    	if (Game.paused) {
    		Game.start();
    	} else {
    		Game.pause();
    	}
    }
);


// Comon stuff
Array.prototype.remove = function(from, to) {
	var rest = this.slice((to || from) + 1 || this.length);
	this.length = from < 0 ? this.length + from : from;
	return this.push.apply(this, rest);
};