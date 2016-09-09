var PI2 = Math.PI * 2;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function Car(id, peer, color) {
	EventEmitter.call(this);

	this.id        = id;
	this.peer      = peer;
	this.color     = color;
	this.x         = 0; // position
	this.y         = 0;
	this.sx        = 0; // speed
	this.sy        = 0;
	this.speed     = 0;
	this.rotation  = 0;
	this.timestamp = 0;
	this.keyTurn   = 0; // turn: 0 = false, -1 = cw, 1 = ccw
	this.keyAccel  = 0; // accelerating: 0 = false, 1 = true
	this.asset     = null;

	this._createAsset();
}
inherits(Car, EventEmitter);

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Car.prototype.getState = function () {
	return {
		x: this.x,
		y: this.y,
		t: this.keyTurn,
		a: this.keyAccel,
		s: this.speed,
		r: this.rotation,
		sx: this.sx,
		sy: this.sy
	};
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Car.prototype.sync = function (sync) {
	this.x         = sync.x;
	this.y         = sync.y;
	this.keyTurn   = sync.t;
	this.keyAccel  = sync.a;
	this.speed     = sync.s;
	this.rotation  = sync.r;
	this.sx        = sync.sx;
	this.sy        = sync.sy;
	this.timestamp = Date.now();
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Car.prototype._createAsset = function () {
	var canvas = this.asset = document.createElement('canvas');
	canvas.width  = 40;
	canvas.height = 40;
	var ctx = canvas.getContext('2d');
	ctx.font = '40px Verdana';
	ctx.textAlign = 'center';
	// ctx.fillStyle = '#FFF';
	// ctx.fillRect(0,0,40,40)
	ctx.fillStyle = this.color;
	ctx.shadowColor     = '#444';
	ctx.shadowBlur      = 4;
	ctx.fillText('→', 20, 35);
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Car.prototype.respawn = function (x, y) {
	this.x         = x;
	this.y         = y;
	this.sx        = 0;
	this.sy        = 0;
	this.speed     = 0;
	this.rotation  = 0;
	this.timestamp = Date.now();
	return this;
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Car.prototype.render = function (ctx) {
	ctx.save();
	ctx.translate(this.x, this.y);
	ctx.rotate(this.rotation);
	ctx.drawImage(this.asset, -20, -20);
	ctx.restore();
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Car.prototype.keyChange = function (direction, press) {
	var shouldEmit = true;
	     if (direction === 38) this.keyAccel = ~~press;   // accelerate
	else if (direction === 39) this.keyTurn  = ~~press;   // right
	else if (direction === 37) this.keyTurn  = - ~~press; // left
	else shouldEmit = false;
	if (shouldEmit) this.emit('keyChanged');
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
Car.prototype.update = function () {
	var now = Date.now();
	var dt  = now - this.timestamp;
	this.timestamp = now;

	var da = dt * 0.005;

	// update rotation relatively to keyTurn
	this.rotation += this.keyTurn * da;
	if      (this.rotation > PI2) this.rotation -= PI2;
	else if (this.rotation < 0)   this.rotation += PI2;

	// update speed relatively to keyAccel
	this.speed += this.keyAccel * da;
	// this.speed *= 0.8;
	this.speed *= Math.pow(0.8, dt * 0.05);;

	// update speed
	var friction = Math.pow(0.95, dt * 0.05);
	this.sx = this.sx * friction + Math.cos(this.rotation) * this.speed;
	this.sy = this.sy * friction + Math.sin(this.rotation) * this.speed;

	// update position
	this.x += this.sx;
	this.y += this.sy;

	// bound position to canvas
	// TODO: new position should take dt in account (calculate when collision occured)
	if (this.x > 400) { this.x = 400; if (this.sx > 0) this.sx *= -1; }
	if (this.x < 0)   { this.x = 0;   if (this.sx < 0) this.sx *= -1; }
	if (this.y > 400) { this.y = 400; if (this.sy > 0) this.sy *= -1; }
	if (this.y < 0)   { this.y = 0;   if (this.sy < 0) this.sy *= -1; }
};


