function Bullet() {
	this.init(Bullet.arguments);
}

Bullet.prototype = {
	
	/**
	 * @param x
	 * @param y	 
	 * @param dir
	 * @param speed
	 */
	init : function(args) {
	
		this.sprite = glow.dom.create("<div class='bullet'></div>");
		this.sprite.css("left", args[0] + "px");
		this.sprite.css("top", args[1] + "px");		
		
		this.top = args[1];
		this.dir = args[2];
		this.speed = args[3];		
		
	},
	
	fire : function() {
		if (this.dir > 0) {
			this.movement = glow.anim.css(this.sprite, 1, {"top": {to:"390"}}).start();						
		} else {
			this.movement = glow.anim.css(this.sprite, 0.7, {"top": {to:"25"}}).start();								
		}
		glow.events.addListener(this.movement, "complete", function() {
				this.die();
			},
			this);
			
		glow.events.addListener(this.movement, "frame", function() {			

			var bul_t = this.sprite.offset().y;
			var bul_b = bul_t + 5;				
			var bul_l = this.sprite.offset().x;
			var bul_r = bul_l + 2;				
			
			// Barriers			
			
			var barriers = Game.getBarriers();
			
			for (var i =0, len = barriers.length; i < len; i++ ) {
			
				var barrier = barriers[i];
				var bar_t = barrier.sprite.offset().y;
				var bar_b = bar_t + 18;				
				var bar_l = barrier.sprite.offset().x;
				var bar_r = bar_l + 26;																
				
				if (bul_t > bar_t && bul_b < bar_b) {
					if (bul_l > bar_l && bul_r < bar_r) {					
						this.die();
						barrier.hit();
						i = len;
					}
				}
			}		
		
		},
		this);
		
	},
	
	die : function() {
		this.sprite.remove();
		glow.events.fire(this, 'dead');
	}
	
}

// Invader Bullet

function InvaderBullet() {
    arguments.callee.base.apply(this, arguments);    
    this.sprite.addClass("invaderBullet");
}

glow.lang.extend(InvaderBullet, Bullet);
InvaderBullet.prototype.oldFire = InvaderBullet.prototype.fire;

InvaderBullet.prototype.fire = function() {
	this.oldFire();
	this.bg_iter = 0;
	this.anim_wait = 0;
	
	glow.events.addListener(this.movement, "frame", function() {
			
			if (this.bg_iter == 0 && this.anim_wait == 2) {
				this.sprite.css("background-position", "-5px 0px");
				this.bg_iter = 1;
				this.anim_wait = 0;
			} else if (this.bg_iter == 0  && this.anim_wait == 2) {
				this.sprite.css("background-position", "0px 0px");
				this.bg_iter = 0;	
				this.anim_wait = 0;				
			} else {
				this.anim_wait++;			
			}
			
			var ship = Game.getShip();
		
			var shp_t = ship.sprite.offset().y;
			var shp_b = shp_t + 18;				
			var shp_l = ship.sprite.offset().x;
			var shp_r = shp_l + 26;									
			
			var bul_t = this.sprite.offset().y;
			var bul_b = bul_t + 8;				
			var bul_l = this.sprite.offset().x;
			var bul_r = bul_l + 5;								
			
			if (bul_t > shp_t && bul_b < shp_b) {
				if (bul_l > shp_l && bul_r < shp_r) {					
					this.die();
					ship.die();
				}
			}
			
		},
		this);	
}



// Ship Bullet ------------------------------------------------
function ShipBullet() {
    arguments.callee.base.apply(this, arguments);    
}

glow.lang.extend(ShipBullet, Bullet);
ShipBullet.prototype.oldFire = ShipBullet.prototype.fire;

ShipBullet.prototype.fire = function() {
	this.oldFire();
	glow.events.addListener(this.movement, "frame", function() {
				
			var bul_t = this.sprite.offset().y;
			var bul_b = bul_t + 5;				
			var bul_l = this.sprite.offset().x;
			var bul_r = bul_l + 2;				

			// Mothership
			
			var ms = Game.getMotherShip();
			var msh_t = ms.sprite.offset().y;
			var msh_b = msh_t + 14;				
			var msh_l = ms.sprite.offset().x;
			var msh_r = msh_l + 32;			
			
			if (bul_t > msh_t && bul_b < msh_b) {
				if (bul_l > msh_l && bul_r < msh_r) {					
					this.die();
					ms.die();
				}
			}			

			// Invaders			
			
			var invaders = Game.getInvaders();
			
			for (var i =0, len = invaders.length; i < len; i++ ) {
			
				var invader = invaders[i];
				var inv_t = invader.sprite.offset().y;
				var inv_b = inv_t + 18;				
				var inv_l = invader.sprite.offset().x;
				var inv_r = inv_l + 26;																
				
				if (bul_t > inv_t && bul_b < inv_b) {
					if (bul_l > inv_l && bul_r < inv_r) {					
						this.die();
						invader.die();
						i = len;
					}
				}
			}
			
		},
		this);	
}


