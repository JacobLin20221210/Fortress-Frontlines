function Bullet(tpos, angle, colour, id) {
  this.id = id;
  this.startFrame = frameCount;
  this.lifeSpan = 5*60; //player can shoot 4 bullets by default
  this.pos = createVector(tpos.x + 52*cos(angle), tpos.y + 52*sin(angle));
  this.prevPos = this.pos.copy();
  this.vel = p5.Vector.fromAngle(radians(angle));
  this.colour = colour;
  this.vel.mult(10);
  
  this.update = function() {
    this.prevPos = this.pos.copy();
    this.pos.add(this.vel);
  }
  
  this.render = function() {
    push();
    stroke(this.colour);
    strokeWeight(12);
    point(this.pos.x, this.pos.y);
    pop();
  }

  this.alive = function() {
    return (frameCount - this.startFrame <= this.lifeSpan);
    // return (this.pos.x <= windowWidth && this.pos.x >= 0) && (this.pos.y <= windowHeight && this.pos.y >= 0) && (frameCount - this.startFrame <= this.lifeSpan);
  }
}

function shootSpreadShot(tpos, angle, colour, id) {
  let spreadAngles = [-15, 0, 15]; // Angles for left, center, right bullets
  let bullets = []; // To store spread bullets

  for (let offset of spreadAngles) {
    let spreadAngle = angle + offset; // Adjust angle for spread
    bullets.push(new Bullet(tpos, spreadAngle, colour, id + '-' + offset)); // Unique ID for each bullet
  }

  return bullets; // Return the spreadshot bullets
}

