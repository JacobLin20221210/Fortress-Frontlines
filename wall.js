function Wall(x, y, a, b, e=0.2, clr = 255) {
  this.pos = createVector(x, y);
  this.a = a;
  this.b = b;
  this.e = e; 
  this.clr = clr;
  
  this.render = function() {
    push();
    translate(this.pos.x, this.pos.y);
    fill(this.clr);
    noStroke();
    // noFill();
    // stroke(255);
    rect(0,0,2*this.a, 2*this.b,4);
    pop();
  }
}

function LootBox(x, y, size = 20, clr = 'yellow') {
  this.pos = createVector(x, y);
  this.size = size;
  this.clr = clr;
  this.collected = false;

  this.render = function() {
    if (!this.collected) {
      push();
      translate(this.pos.x, this.pos.y);
      fill(this.clr);
      noStroke();
      rectMode(CENTER);
      rect(0, 0, this.size, this.size, 4);
      pop();
    }
  };

  this.checkPickup = function(tank) {
    if (!this.collected && dist(tank.pos.x, tank.pos.y, this.pos.x, this.pos.y) < this.size) {
      this.collected = true;
      tank.hasSpreadshot = true;  // Grant spreadshot ability
    }
  };
}

