function Ship() {
	this.init(Ship.arguments);
}

Ship.prototype = {

	init : function(argv) {
		
		this.sprite = glow.dom.create("<div class='ship'></div>");
		this.sprite.css("left", "230px");
		this.sprite.css("top", "370px");	
		this.bullet = false;
		
		this.listeners = [];
	
	},
	
	die : function() {
		this.sprite.css("background-position", "0px 0px");
		try {
			this.moveLeft.stop();
		} catch(e) {}
		glow.events.fire(this, 'dead');	
	},
	
	makeListeners : function() {
	
		this.listeners.push(glow.events.addKeyListener("LEFT", "down",
				function (e) {
					e.preventDefault(); 			
					if (this.moveLeft) {
						this.moveLeft.stop();
						this.moveLeft = false;					
					}			
					this.moveLeft = glow.anim.css(this.sprite, 1, {"left": {to:"0"}}).start();			
				},
				this
			)		
		);

		this.listeners.push(glow.events.addKeyListener("LEFT", "up",
				function (e) {
					e.preventDefault(); 
					if (this.moveLeft) {
						this.moveLeft.stop();
						this.moveLeft = false;					
					}
				},
				this
			)				
		);
		
		this.listeners.push(glow.events.addKeyListener("RIGHT", "down",
				function (e) {
					e.preventDefault(); 
					if (this.moveLeft) {
						this.moveLeft.stop();
						this.moveLeft = false;					
					}
					this.moveLeft = glow.anim.css(this.sprite, 1, {"left": {to:"470"}}).start();			
				},
				this
			)
		);

		this.listeners.push(glow.events.addKeyListener("RIGHT", "up",
				function (e) {
					e.preventDefault(); 			
					if (this.moveLeft) {
						this.moveLeft.stop();
						this.moveLeft = false;					
					}
				},
				this
			)
		);		
		
		this.listeners.push(glow.events.addKeyListener("UP", "down",
				function (e) {
					e.preventDefault(); 			
					if (!this.bullet) {
						var x = parseInt(this.sprite.css("left"));
						var y = parseInt(this.sprite.css("top"));					
						
						this.bullet = new ShipBullet(x + 15,y,-1,1);
						Game.addBullet(this.bullet)
						this.bullet.fire();
	
						this.bulletListener = glow.events.addListener(
							this.bullet,
							'dead',
							function() {this.bullet = false;},
							this
						);					
						
					}
				},
				this
			)
		);					
	},
	
	remove : function() {
		this.sprite.remove();		
		this.removeListeners();
	},
	
	removeListeners : function() {
		for (var i=0, len = this.listeners.length;i < len; i++) {
				glow.events.removeListener(this.listeners[i]);
		}	
		this.listeners = [];
	}
}