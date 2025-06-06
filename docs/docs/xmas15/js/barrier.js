function Barrier() {
	this.init(Barrier.arguments);
}

Barrier.prototype = {

	init : function(args) {
	
		this.sprite = glow.dom.create("<div class='barrier'></div>");
		this.sprite.css("left", args[0] + "px");
		this.sprite.css("top", args[1] + "px");		
		this.hitcount = 0;
	},
	
	hit : function() {
		this.hitcount++;
		if (this.hitcount >= 3) {
			this.die();
		} else {
			this.sprite.css("opacity", 1 - ((this.hitcount * 2) / 10))
		}
	},
	
	die : function() {
		this.sprite.remove();
		glow.events.fire(this, 'dead');
	}
	
}