// Assuming this file is tank.js and there are no explicit references to boost tiles here.
function Tank(x, y, h, colour, id = 0) {
  this.id = id;
  this.ctr = 0;
  this.pos = createVector(x, y);
  this.prevPos = this.pos.copy()
  this.heading = h;
  this.prevHeading = this.heading;
  this.dampening = 0.97;
  this.rotation = 0;
  this.colour = colour;
  this.vel = createVector(0,0);
  this.thrust = createVector(0, 0); // Update thrust to a vector
  this.hitbox = [];
  this.moving = false; // Track whether the tank is moving

  this.update = function() {
    this.prevPos = this.pos.copy();
    this.prevHeading = this.heading;
    this.boost();
    this.rotate();
    if (!this.moving) {
      this.vel.set(0, 0); // Stop movement if not moving
    }
    this.pos.add(this.vel);
    this.pos.x = constrain(this.pos.x, 0, width);
    this.pos.y = constrain(this.pos.y, 0, height);
  }

  this.setBoost = function(b) {
    if (b !== 0) { // Allow both forward and backward movement
      this.moving = true; // Set moving state
      this.thrust = p5.Vector.fromAngle(radians(this.heading));
      this.thrust.mult(b / 5.0); // Positive for forward, negative for backward
      this.vel = this.thrust.copy();
    } else {
      this.moving = false; // Stop movement when no boost
      this.thrust.set(0, 0);
    }
  }

  this.boost = function() {
    if (this.moving) {
      this.vel.add(this.thrust);
    }
  }

  this.setRotation = function(angle) {
    this.rotation = angle;
  }  

  this.rotate = function() {
    this.heading += this.rotation;
  }

  this.render = function() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.heading);
    fill(this.colour);
    rect(0, 0, 60, 40);
    rect(0, 0, 20, 20);
    rect(25, 0, 50, 8);
    pop();
  }
//
  this.createRotatedVector = function(px, py) {
    var vx = px * cos(this.heading) - py * sin(this.heading);
    var vy = px * sin(this.heading) + py * cos(this.heading);
    return createVector(this.pos.x + vx ,this.pos.y + vy);
  }  

  this.collisionBox = function() {
    var a = 30, b = 20;
    var c = cos(this.heading), s = sin(this.heading);
    var poly = [];
    poly[0] = this.createRotatedVector( a,-b); // body
    poly[1] = this.createRotatedVector(-a,-b);
    poly[2] = this.createRotatedVector(-a, b);
    poly[3] = this.createRotatedVector(a, b);
    poly[4] = this.createRotatedVector(a, 5); // cannon
    poly[5] = this.createRotatedVector(50, 5);
    poly[6] = this.createRotatedVector(50, -5);
    poly[7] = this.createRotatedVector(a, -5);
    this.hitbox = poly.slice();
  }
}
