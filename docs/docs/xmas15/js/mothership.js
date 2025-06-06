function MotherShip() {
	this.init(MotherShip.arguments);
}

MotherShip.prototype = {

	init : function(argv) {
		
		this.sprite = glow.dom.create("<div class='mothership'></div>");
		this.sprite.css("left", "10px");
		this.sprite.css("top", "40px");
	
		this.score = argv[0];
	},
	
	die : function() {	
		this.sprite.remove();
		glow.events.fire(this, 'dead');	
	},
	
	remove : function() {
		this.sprite.remove();
	},
	
	move : function() {
	
		var moveLeft = glow.anim.css(this.sprite, 20, {
			"left": {from:"1000", to:"-1000"}
		});

		var moveRight = glow.anim.css(this.sprite, 20, {
			"left": {from:"-1000",to:"1000"}
		});
		
		this.timeline = new glow.anim.Timeline([moveRight, 10, moveLeft], {"loop":true}).start();
	}
}