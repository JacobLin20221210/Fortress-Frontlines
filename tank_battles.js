var tank1, tank2, laika; // Tanks for player 1, player 2
var walls, bullets1, bullets2;
var gameend, winner, timeout, handle;
var bgcolor;
var fw, bw, lr;
var maxbullets;

var score = [0,0,0];
var gameOver = false; // Track if the game has ended

var playAgainButton; 
var backButton;
var gameState = "start"; // Possible states: "start", "play", "instructions"
var playButton, instructionsButton, onePlayerButton, twoPlayerButton;
var gameMode = ""; // "1P" for single-player, "2P" for two-player mode

function setup() {
  //createCanvas(50 * floor((windowWidth - 20) / 50), 50 * floor((windowHeight - 20) / 50));
  createCanvas(windowWidth, windowHeight); // Full-screen canvas
  rectMode(CENTER);
  angleMode(DEGREES);
  textAlign(CENTER);

  if (gameState === "start") {
    setupStartMenu(); // Create start menu buttons
  }
}

function setupStartMenu() {
  background(0);
  // 1 Player Button
  onePlayerButton = createButton('1 PLAYER');
  onePlayerButton.style('background-color', '#6A0DAD');
  onePlayerButton.style('color', '#FFFFFF');
  onePlayerButton.style('border', 'none');
  onePlayerButton.style('border-radius', '25px');
  onePlayerButton.style('font-size', '20px');
  onePlayerButton.style('padding', '10px 30px');
  onePlayerButton.position(width / 2 - 75, height / 2 - 80);

  onePlayerButton.mousePressed(() => {
    gameMode = "1P"; // Set game mode to 1 Player
    gameState = "play";
    onePlayerButton.remove();
    twoPlayerButton.remove();
    instructionsButton.remove();
    newGame();
  });

  // 2 Player Button
  twoPlayerButton = createButton('2 PLAYER');
  twoPlayerButton.style('background-color', '#6A0DAD');
  twoPlayerButton.style('color', '#FFFFFF');
  twoPlayerButton.style('border', 'none');
  twoPlayerButton.style('border-radius', '25px');
  twoPlayerButton.style('font-size', '20px');
  twoPlayerButton.style('padding', '10px 30px');
  twoPlayerButton.position(width / 2 - 75, height / 2);

  twoPlayerButton.mousePressed(() => {
    gameMode = "2P"; // Set game mode to 2 Player
    gameState = "play";
    onePlayerButton.remove();
    twoPlayerButton.remove();
    instructionsButton.remove();
    newGame();
  });

  // Instructions Button
  instructionsButton = createButton('INSTRUCTIONS');
  instructionsButton.style('background-color', '#6A0DAD');
  instructionsButton.style('color', '#FFFFFF');
  instructionsButton.style('border', 'none');
  instructionsButton.style('border-radius', '25px');
  instructionsButton.style('font-size', '20px');
  instructionsButton.style('padding', '10px 30px');
  instructionsButton.position(width / 2 - 75, height / 2 + 80);

  instructionsButton.mousePressed(() => {
    gameState = "instructions";
    onePlayerButton.remove();
    twoPlayerButton.remove();
    instructionsButton.remove();
  });
}

function newGame(){
  if (winner > 0) score[winner]++;
  if (score[1] >= 5 || score[2] >= 5) {
    gameOver = true; // Trigger game over state
    return;
  }
  walls = randmap().slice();
  bullets1 = []; bullets2 = [];
  tank1 = new Tank(random(60, width - 60), random(60, height - 60), random(360), 'green', 1);

  if (gameMode === "2P") {
    tank2 = new Tank(random(60, width - 60), random(60, height - 60), random(360), 'red', 2);
  } else if (gameMode === "1P") {
    laika = new Tank(random(60, width - 60), random(60, height - 60), random(360), 'red', 3);
  }
  winner = 0;
  gameend = false; timeout = false;
  fw = 8; bw = 8; lr = 4; maxbullets = 4;
  bgcolor = 0;
}

function randPos(){
  return createVector(random(60, width - 60), random(60, height - 60));
}

function draw() {
  if (gameState === "start") {
    drawStartMenu();
    return;
  } else if (gameState === "instructions") {
    drawInstructions();
    return;
  } else if (gameState === "play") {
    if (gameOver) {
      drawWinningScreen();
      return;
    }

    background(bgcolor);  

    tank1.render();
    tank1.collisionBox();


    if (gameMode === "2P") {
      tank2.render();
      tank2.collisionBox();
    } else if (gameMode === "1P") {
      laika.render();
      laika.collisionBox();
      laikaAI(); // Add AI behavior
    }

    // Draw All Loot Boxes and Check for Pickup
    for (let lootBox of lootBoxes) {
      lootBox.render();                // Draw the loot box
      lootBox.checkPickup(tank1);      // Check if player 1 collected it
      if (gameMode === "2P") {
        lootBox.checkPickup(tank2);    // Check if player 2 collected it
      } else if (gameMode === "1P") {
        lootBox.checkPickup(laika);    // Check if AI collected it (optional)
      }
    }


    if (keyIsDown(UP_ARROW)) {
      tank1.setBoost(fw);
    } else if (keyIsDown(DOWN_ARROW)) {
      tank1.setBoost(-bw);
    } 
    if (keyIsDown(LEFT_ARROW)) {
      tank1.setRotation(-lr);
    } else if (keyIsDown(RIGHT_ARROW)) {
      tank1.setRotation(lr);
    } 

    if (gameMode === "2P") {
      if (keyIsDown(87)) {
        tank2.setBoost(fw);
      } else if (keyIsDown(83)) {
        tank2.setBoost(-bw);
      }  
      if (keyIsDown(65)) {
        tank2.setRotation(-lr);
      } else if (keyIsDown(68)) {
        tank2.setRotation(lr);
      }
    }

    bullets2 = [];
    for (var i = 0; i < bullets1.length; i++) {
      bullets1[i].render();
      bullets1[i].update();
      
      if(bullets1[i].alive()){
        bullets2.push(bullets1[i]);
      }
      else if(bullets1[i].id == 1)
      tank1.ctr--;
      else if (gameMode === "2P" && bullets1[i].id == 2)
      tank2.ctr--;
      
      collideBT(bullets1[i], tank1);
      if (gameMode === "2P") collideBT(bullets1[i], tank2);
      if (gameMode === "1P") collideBT(bullets1[i], laika);
      //GOOD ENOUGH FOR SLOW BULLET VELOCITY
      for (var j = 0; j < walls.length; j++)
        if(collideBW(bullets1[i], walls[j])) j = -1;  //Multiple collisions per bullet
    }
    bullets1 = bullets2.slice();

    bgcolor = 0;
    for (var i = 0; i < walls.length; i++) {
      collideTW(tank1, walls[i]);
      if (gameMode === "2P") collideTW(tank2, walls[i]);
      if (gameMode === "1P") collideTW(laika, walls[i]);
      walls[walls.length-1-i].render();
    }

    collideTT(tank1, (gameMode === "2P") ? tank2 : laika);  

    tank1.update();
    if (gameMode === "2P") tank2.update();
    if (gameMode === "1P") laika.update();

    if (gameend) {
      if(!timeout){
        timeout = true; 
        handle = setTimeout(newGame, 2500);
      }
      bgcolor = 50;
      fill(winner == 0 ? 'GRAY' : winner == 1 ? 'GREEN' : 'RED');
      textSize(200);
      text((winner == 0 ? 'DRAW' : winner == 1 ? '1 point' : '1 point'), windowWidth / 2, windowHeight / 2);
    }
    else{
      fill(0, 255, 0, 40);
      textSize(500);
      text(score[1], width/4, height/2 + 150); 
      fill(255, 0, 0, 40);
      textSize(500);
      text(score[2], 3 * width/4, height/2 + 150);
    } 
  }
}

function drawStartMenu() {
  background(0);
  textSize(64);
  fill(255);
  text("Tank Trouble", width / 2 -5, height / 2 - 150);
}

function drawInstructions() {
  background(0);
  textSize(32);
  fill(255);
  text("INSTRUCTIONS", width / 2, 50);
  textSize(20);
  text("Use Arrow keys to move Green Tank", width / 2, 100);
  text("Use W/A/S/D keys to move Red Tank", width / 2, 140);
  text("Press Space to shoot for Green Tank", width / 2, 180);
  text("Press G to shoot for Red Tank", width / 2, 220);

  if (!backButton) {
    backButton = createButton('BACK');
    backButton.style('background-color', '#6A0DAD');
    backButton.style('color', '#FFFFFF');
    backButton.style('border', 'none');
    backButton.style('border-radius', '25px');
    backButton.style('font-size', '20px');
    backButton.style('padding', '10px 30px');
    backButton.position(width / 2 - 75, height / 2 + 150);
    backButton.mousePressed(() => {
      gameState = "start";
      backButton.remove();
      backButton = null;
      setupStartMenu();
    });
  }
  
}

function drawWinningScreen() {
  background(50);
  textSize(64);
  fill(score[1] >= 5 ? 'green' : 'red');
  textAlign(CENTER, CENTER);
  let winnerText = score[1] >= 5 ? "Green Wins!" : "Red Wins!";
  text(winnerText, width / 2, height / 2 - 50);

  if (!playAgainButton) {
    playAgainButton = createButton('Play Again');
    playAgainButton.style('background-color', '#6A0DAD');
    playAgainButton.style('color', '#FFFFFF');
    playAgainButton.style('border', 'none');
    playAgainButton.style('border-radius', '25px');
    playAgainButton.style('font-size', '20px');
    playAgainButton.style('padding', '10px 30px');
    playAgainButton.position(width / 2 - 75, height / 2 + 50);
    
    
    score = [0, 0, 0]; // Reset score
    winner = 0;
    gameOver = false;
    setupStartMenu
    
    playAgainButton.mousePressed(() => {
      
      playAgainButton.remove(); // Remove the button
      playAgainButton = null; // Reset the reference
      gameState = "start";
      background(0);
      setupStartMenu();
    });
  }
}


function collideBW(bullet, wall){
  var hit = collideLineRect(bullet.pos.x, bullet.pos.y, bullet.prevPos.x, bullet.prevPos.y, wall.pos.x - wall.a, wall.pos.y - wall.b, 2*wall.a, 2*wall.b, true);
  if(wall.a <= 10 || wall.b <= 10)
    return false;  
  if(hit.top.x && hit.top.y && bullet.prevPos.y < bullet.pos.y) {
    bullet.pos.y = bullet.pos.y += 2 * (hit.top.y - bullet.pos.y);
    bullet.vel.y *= -1;
    bullet.prevPos.x = hit.top.x;
    bullet.prevPos.y = hit.top.y;
  } else if(hit.bottom.x && hit.bottom.y && bullet.prevPos.y > bullet.pos.y) {
    bullet.pos.y = bullet.pos.y += 2 * (hit.bottom.y - bullet.pos.y);
    bullet.vel.y *= -1;
    bullet.prevPos.x = hit.bottom.x;   
    bullet.prevPos.y = hit.bottom.y;
  } else if(hit.left.x && hit.left.y && bullet.prevPos.x < bullet.pos.x) {
    bullet.pos.x += 2 * (hit.left.x - bullet.pos.x);
    bullet.vel.x *= -1;
    bullet.prevPos.x = hit.left.x;
    bullet.prevPos.y = hit.left.y;
  } else if(hit.right.x && hit.right.y && bullet.prevPos.x > bullet.pos.x) {
    bullet.pos.x += 2 * (hit.right.x - bullet.pos.x);
    bullet.vel.x *= -1;
    bullet.prevPos.x = hit.right.x;
    bullet.prevPos.y = hit.right.y;
  } else if (bullet.pos.x >= wall.pos.x - wall.a && bullet.pos.x <= wall.pos.x + wall.a 
          && bullet.pos.y >= wall.pos.y - wall.b && bullet.pos.y <= wall.pos.y + wall.b){
    bullet.vel.mult(0);
    bullet.lifeSpan = 0;
    return false;
  } else
    return false;
  push();
  strokeWeight(12);
  stroke(bullet.colour);
  point(bullet.prevPos.x, bullet.prevPos.y);
  pop();
  return true;
}

function collideBT(bullet, tank) {
  if (collideLinePoly(bullet.pos.x, bullet.pos.y, bullet.prevPos.x, bullet.prevPos.y, tank.hitbox)) {
    if (!gameend) {
      if (tank.id === 3 && gameMode === "1P") {
        winner = 1;
      } else {
        winner = 3 - tank.id;
      }
      gameend = true;
    }
  }
}


function collideTW(tank, wall) {
  var delta = -25;
  var delta_push = 1;
  var dir = 0;
  if (collideRectPoly(wall.pos.x - wall.a, wall.pos.y - wall.b, 2 * wall.a, 2 * wall.b, tank.hitbox)) {
    tank.heading = tank.prevHeading;
    if (tank.pos.x >= wall.pos.x - wall.a + delta && tank.pos.x <= wall.pos.x + wall.a - delta) {
      dir = wall.pos.y - tank.pos.y > 0 ? 1 : -1;
      tank.thrust.y *= 0;
      tank.vel.y *= -wall.e;
      tank.pos.y -= dir * delta_push;
    }
    if (tank.pos.y >= wall.pos.y - wall.b + delta && tank.pos.y <= wall.pos.y + wall.b - delta) {
      tank.thrust.x *= 0;
      tank.vel.x *= -wall.e;
      dir = wall.pos.x - tank.pos.x > 0 ? 1 : -1;
      tank.pos.x -= dir * delta_push;
    }
  }
}

function collideTT(tank1, tank2) {
  if(collidePolyPoly(tank1.hitbox, tank2.hitbox)){
    var dir = p5.Vector.sub(tank2.pos, tank1.pos);
    dir.setMag(tank1.vel.mag());
    tank2.vel.add(dir);
  }  
}

function keyReleased() {
  tank1.setRotation(0); 
  if (tank2) tank2.setRotation(0);
  if (laika) laika.setRotation(0);
  tank1.setBoost(0);
  if (tank2) tank2.setBoost(0);
  if (laika) laika.setBoost(0);
}




function shootSpreadShot(tpos, angle, colour, id) {
  let spreadAngles = [-15, 0, 15]; // Adjust bullet spread angles (left, center, right)

  for (let offset of spreadAngles) {
    bullets1.push(new Bullet(tpos, angle + offset, colour, id)); // Create spread bullets
  }
}



function keyPressed() {
  // Player 1 Shooting (M or Space)
  if ((key == 'M' || key == ' ') && tank1.ctr < maxbullets) {
    tank1.ctr++;

    if (tank1.hasSpreadshot) {
      // 🎯 Spreadshot for Player 1
      shootSpreadShot(tank1.pos, tank1.heading, tank1.colour, 1);
      tank1.hasSpreadshot = false; // Single-use spreadshot
    } else {
      // Regular Bullet
      bullets1.push(new Bullet(tank1.pos, tank1.heading, tank1.colour, 1));
    }
  }

  // Player 2 Shooting (Q or G)
  if ((key == 'Q' || key == 'G') && gameMode === "2P" && tank2.ctr < maxbullets) {
    tank2.ctr++;

    if (tank2.hasSpreadshot) {
      // 🎯 Spreadshot for Player 2
      shootSpreadShot(tank2.pos, tank2.heading, tank2.colour, 2);
      tank2.hasSpreadshot = false; // Single-use spreadshot
    } else {
      // Regular Bullet
      bullets1.push(new Bullet(tank2.pos, tank2.heading, tank2.colour, 2));
    }
  }
}


