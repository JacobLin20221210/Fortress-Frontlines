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
const gridSize = 30; // Size of each grid cell
let gridWidth, gridHeight;
let obstacleGrid = []; // Grid representing obstacles (1 for wall, 0 for free space)
let laikaTarget = null;

let laikaReactionStart = 0;
let laikaIsStuck = false;
let laikaPath = [];

const laikaReactionDelay = 1000; // 1-second reaction time after map starts

let laikaLastShotTime = 0;
const laikaShotCooldown = 2000; // 2 seconds cooldown between shots
const maxBounces = 1;           // Allow 1 bounce for bullet prediction
const detectionRange = 500;


let isPaused = false;        // Tracks if the game is paused
let resumeButton, exitButton; // Buttons for Pause Menu




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
  
  
  // Practice Button
  onePlayerButton = createButton('Practice Mode');
  onePlayerButton.style('background-color', '#6A0DAD');
  onePlayerButton.style('color', '#FFFFFF');
  onePlayerButton.style('border', 'none');
  onePlayerButton.style('border-radius', '25px');
  onePlayerButton.style('font-size', '20px');
  onePlayerButton.style('padding', '10px 30px');
  onePlayerButton.position(width / 2 - 85, height / 2 - 80);

  onePlayerButton.mousePressed(() => {
    gameMode = "1P"; // Set game mode to 1 Player
    gameState = "play";
    onePlayerButton.remove();
    twoPlayerButton.remove();
    instructionsButton.remove();
    newGame();
  });

  // 2 Player Button
  twoPlayerButton = createButton('2 PLAYER Mode');
  twoPlayerButton.style('background-color', '#6A0DAD');
  twoPlayerButton.style('color', '#FFFFFF');
  twoPlayerButton.style('border', 'none');
  twoPlayerButton.style('border-radius', '25px');
  twoPlayerButton.style('font-size', '20px');
  twoPlayerButton.style('padding', '10px 30px');
  twoPlayerButton.position(width / 2 - 90, height / 2);

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
  instructionsButton.position(width / 2 - 90, height / 2 + 80);

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

  //-----------------
  generateObstacleGrid(); //  Add this line to create the wall grid

  //----------------------

  bullets1 = []; bullets2 = [];
  tank1 = new Tank(random(60, width - 60), random(60, height - 60), random(360), 'green', 1);

  if (gameMode === "2P") {
    tank2 = new Tank(random(60, width - 60), random(60, height - 60), random(360), 'red', 2);
  } else if (gameMode === "1P") {
    laika = new Tank(random(60, width - 60), random(60, height - 60), random(360), 'red', 3);
    laikaReactionStart = millis();
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
  } else if (isPaused) {
    // ✅ Center the rectangle
    fill(0, 150); // Semi-transparent black
    rectMode(CENTER); // Center the rectangle from its middle
    rect(width / 2, height / 2, 400, 300); // Centered rectangle (adjust size as needed)

    // ✅ Centered "Paused" Text
    fill(255); // White text
    textSize(48);
    textAlign(CENTER, CENTER);
    text("Paused", width / 2, height / 2 - 50); // Slightly above the center for aesthetics

    return; // Stop further drawing when paused
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
    
      if (bullets1[i].alive()) {
        bullets2.push(bullets1[i]);
      } else {
        // Decrease bullet counter when bullet despawns
        if (bullets1[i].id == 1) {
          tank1.ctr--;
        } else if (gameMode === "2P" && bullets1[i].id == 2) {
          tank2.ctr--;
        } else if (gameMode === "1P" && bullets1[i].id == 3) {
          laika.ctr--;  // ✅ Decrease AI's bullet counter when bullet despawns
        }
      }
    
      // Handle bullet collisions
      collideBT(bullets1[i], tank1);
      if (gameMode === "2P") collideBT(bullets1[i], tank2);
      if (gameMode === "1P") collideBT(bullets1[i], laika);
    
      // Handle bullet-wall collisions
      for (var j = 0; j < walls.length; j++) {
        if (collideBW(bullets1[i], walls[j])) {
          j = -1;  // Multiple collisions per bullet
        }
      }
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
  let bg = loadImage('star night.webp'); // Make sure the file name matches exactly
  image(bg, 0, 0, width, height); // Cover full canvas

  // 🎯 Add Tank Image at Bottom Right
  let tankIcon = loadImage('Tank.png');
  image(tankIcon, width - 150, height - 150, 120, 120); // Adjust size & position as needed

  // 🗒️ Title Text
  textSize(64);
  fill(255);
  textAlign(CENTER, CENTER);
  text("Fortress Frontlines", width / 2, height / 2 - 150);
}

function drawInstructions() {
  background(0);
  textSize(32);
  fill(255);
  text("INSTRUCTIONS", width / 2, 50);
  textSize(20);
  text("Use Arrow keys to move Green Tank", width / 2, 100);
  text("Use W/A/S/D keys to move Red Tank", width / 2, 140);
  text("Press Period key to shoot for Green Tank", width / 2, 180);
  text("Press Space to shoot for Red Tank", width / 2, 220);

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
  background(0);  // ✅ Ensure the background is black

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

    playAgainButton.mousePressed(() => {
      // ✅ Reset Game Variables
      score = [0, 0, 0];
      winner = 0;
      gameOver = false;
      gameend = false;
      bullets1 = [];
      bullets2 = [];
      walls = [];
      lootBoxes = [];  // Clear loot boxes
      tank1 = null;
      tank2 = null;
      laika = null;

      // ✅ Change Game State to Main Menu
      gameState = "start";

      // ✅ Clear the screen
      background(0);

      // ✅ Remove the button
      playAgainButton.remove();
      playAgainButton = null;

      // ✅ Load Main Menu
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

    if (tank.id === 3) {
      laikaIsStuck = true;
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



//-----------------------------------------------------------------------------------------------------


const laikaMaxBullets = 4;       // Max bullets at a time

function laikaAI() {
  if (!laika || !tank1) return;

  const maxBounces = 2; // Laika can predict up to 2 bounces
  const rayCount = 23;  // Number of rays in an arc
  const rayArc = 230;   // Arc angle in front of Laika
  const rayStep = rayArc / (rayCount - 1);

  for (let i = -rayArc / 2; i <= rayArc / 2; i += rayStep) {
    let angle = laika.heading + i;
    let finalPos = raycastWithBounce(laika.pos, angle, maxBounces);

    if (collidePointPoly(finalPos.x, finalPos.y, tank1.hitbox)) {
      if (laika.ctr < maxbullets) {  // Ensure Laika doesn't exceed bullet limit
        laika.ctr++;
        bullets1.push(new Bullet(laika.pos, angle, laika.colour, laika.id)); // Shoot
      }
      break; // Stop checking further rays after a successful hit
    }
  }
}




//const laikaReactionDelay = 1000; // 1-second reaction time
const randomReactionOffset = () => random(200, 500); // ✅ Add randomness (200ms - 500ms)

function waitAfterMapStart() {
  if (millis() - laikaReactionStart < laikaReactionDelay + randomReactionOffset()) {
    laika.setBoost(0);
    laika.setRotation(0);
    return true; // Wait before taking any actions
  }
  return false; // Move to next behavior
}



function raycastWithBounce(startPos, angle, maxBounces) {
  let currentPos = startPos.copy();
  let direction = p5.Vector.fromAngle(radians(angle));
  let bounces = 0;

  while (bounces <= maxBounces) {
    let closestDist = Infinity;
    let collisionPoint = null;
    let newDirection = direction.copy();

    // Check for collision with each wall
    for (let wall of walls) {
      let hit = collideLineRect(
        currentPos.x, currentPos.y,
        currentPos.x + direction.x * 1000,
        currentPos.y + direction.y * 1000,
        wall.pos.x - wall.a, wall.pos.y - wall.b,
        2 * wall.a, 2 * wall.b,
        true
      );

      if (hit && hit.x && hit.y) {
        let distToHit = dist(currentPos.x, currentPos.y, hit.x, hit.y);
        if (distToHit < closestDist) {
          closestDist = distToHit;
          collisionPoint = hit;

          // Reflect the direction (bounce)
          if (abs(hit.top.y - hit.bottom.y) > abs(hit.left.x - hit.right.x)) {
            newDirection.y *= -1; // Horizontal bounce
          } else {
            newDirection.x *= -1; // Vertical bounce
          }
        }
      }
    }

    // Draw the ray for visualization
    //stroke(255, 255, 0);
    //line(currentPos.x, currentPos.y, currentPos.x + direction.x * closestDist, currentPos.y + direction.y * closestDist);

    if (collisionPoint) {
      currentPos = createVector(collisionPoint.x, collisionPoint.y);
      direction = newDirection;
      bounces++;
    } else {
      break; // No more collisions detected
    }
  }

  return currentPos; // Final position after bouncing
}





function shootPlayer() {
  const rayCount = 23;
  const rayArc = 230;
  const rayStep = rayArc / (rayCount - 1);
  const maxBounces = 2; // Allow up to 2 bounces

  for (let i = -rayArc / 2; i <= rayArc / 2; i += rayStep) {
    let angle = laika.heading + i;
    if (raycastWithBounce(laika.pos, angle, maxBounces)) {
      bullets1.push(new Bullet(laika.pos, angle, laika.colour, laika.id));
      return true; // Shoot if player is detected
    }
  }
  return false;
}



function raycastForPlayer(startPos, angle, bouncesLeft) {
  let ray = p5.Vector.fromAngle(radians(angle)).mult(1000); // Long ray
  let endPos = p5.Vector.add(startPos, ray);

  for (let wall of walls) {
    if (collideLineRect(startPos.x, startPos.y, endPos.x, endPos.y, wall.pos.x - wall.a, wall.pos.y - wall.b, wall.a * 2, wall.b * 2)) {
      if (bouncesLeft > 0) {
        // ✅ Reflect the ray off the wall
        let reflectedAngle = reflectAngle(angle, wall);
        return raycastForPlayer(wall.pos, reflectedAngle, bouncesLeft - 1);
      }
      return false; // No more bounces left
    }
  }

  // ✅ Check if the ray hits the player's tank
  return collidePointPoly(endPos.x, endPos.y, tank1.hitbox);
}

function reflectAngle(angle, isVerticalWall) {
  return isVerticalWall ? (180 - angle) % 360 : (360 - angle) % 360;
}



function reflectAngle(angle, wall) {
  // Determine if we're hitting a vertical or horizontal wall
  const isVertical = abs(wall.pos.x - laika.pos.x) < abs(wall.pos.y - laika.pos.y);

  if (isVertical) {
    return (180 - angle) % 360; // Reflect horizontally
  } else {
    return (360 - angle) % 360; // Reflect vertically
  }
}


function raycastForPlayer(startPos, angle, bouncesLeft) {
  let ray = p5.Vector.fromAngle(radians(angle)).mult(1000); // Long ray
  let endPos = p5.Vector.add(startPos, ray);
  //stroke('yellow');
  //line(startPos.x, startPos.y, endPos.x, endPos.y);

  for (let wall of walls) {
    if (collideLineRect(startPos.x, startPos.y, endPos.x, endPos.y, wall.pos.x - wall.a, wall.pos.y - wall.b, wall.a * 2, wall.b * 2)) {
      if (bouncesLeft > 0) {
        // ✅ Reflect the ray off the wall
        let reflectedAngle = reflectAngle(angle, wall);
        return raycastForPlayer(wall.pos, reflectedAngle, bouncesLeft - 1);
      }
      return false; // No more bounces left
    }
  }

  // ✅ Check if the ray hits the player's tank
  return collidePointPoly(endPos.x, endPos.y, tank1.hitbox);
}



let lastUnstickTime = 0;
const unstickCooldown = 2000; // 2 seconds cooldown after unsticking

function unstickLaika() {
  if (!laikaIsStuck || millis() - lastUnstickTime < unstickCooldown) return false;

  if (!checkWallCollisionAhead(laika)) {
    laika.setBoost(fw);
    lastUnstickTime = millis();
    setTimeout(() => {
      laikaIsStuck = false;
      laika.setBoost(0);
    }, 500);
  } else {
    laika.setRotation(random() < 0.5 ? lr : -lr);
  }
  return true;
}




function dodgeBullets() {
  for (let bullet of bullets1) {
    let futureBulletPos = p5.Vector.add(bullet.pos, p5.Vector.mult(bullet.vel, 5));

    if (dist(laika.pos.x, laika.pos.y, futureBulletPos.x, futureBulletPos.y) < 50) {
      // ✅ Move perpendicular to the bullet’s path
      let dodgeDirection = bullet.vel.copy().rotate(HALF_PI);
      laika.setRotation(dodgeDirection.heading() > laika.heading ? lr : -lr);
      laika.setBoost(fw);
      return true;
    }
  }
  return false;
}


function smoothPath(path) {
  if (path.length < 3) return path;

  let smoothPath = [path[0]];

  for (let i = 1; i < path.length - 1; i++) {
    let prev = smoothPath[smoothPath.length - 1];
    let next = path[i + 1];

    // Check if we can move directly from prev to next without hitting a wall
    if (!isPathBlocked(prev, next)) {
      continue; // Skip the current waypoint if it's redundant
    }

    smoothPath.push(path[i]); // Keep waypoint if it's necessary
  }

  smoothPath.push(path[path.length - 1]); // Add final destination
  return smoothPath;
}



function findPath(startPos, endPos) {
  const start = {
    x: Math.floor(startPos.x / gridSize),
    y: Math.floor(startPos.y / gridSize)
  };
  const end = {
    x: Math.floor(endPos.x / gridSize),
    y: Math.floor(endPos.y / gridSize)
  };

  let openSet = [start];
  let cameFrom = {};

  let gScore = Array(gridWidth).fill().map(() => Array(gridHeight).fill(Infinity));
  gScore[start.x][start.y] = 0;

  let fScore = Array(gridWidth).fill().map(() => Array(gridHeight).fill(Infinity));
  fScore[start.x][start.y] = heuristic(start, end);

  while (openSet.length > 0) {
    let current = openSet.reduce((a, b) =>
      fScore[a.x][a.y] < fScore[b.x][b.y] ? a : b
    );

    if (current.x === end.x && current.y === end.y) {
      return smoothPath(reconstructPath(cameFrom, current)); // ✅ Apply path smoothing
    }

    openSet = openSet.filter(node => node !== current);

    for (let neighbor of getNeighbors(current)) {
      if (obstacleGrid[neighbor.x][neighbor.y] === 1) continue;

      let tentative_gScore = gScore[current.x][current.y] + 1;

      if (tentative_gScore < gScore[neighbor.x][neighbor.y]) {
        cameFrom[`${neighbor.x},${neighbor.y}`] = current;
        gScore[neighbor.x][neighbor.y] = tentative_gScore;
        fScore[neighbor.x][neighbor.y] = tentative_gScore + heuristic(neighbor, end);

        if (!openSet.some(n => n.x === neighbor.x && n.y === neighbor.y)) {
          openSet.push(neighbor);
        }
      }
    }
  }

  return [];
}


// Heuristic Function (Manhattan Distance)
function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

// Get Walkable Neighbors
function getNeighbors(node) {
  const dirs = [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 }
  ];
  return dirs
    .map(dir => ({
      x: node.x + dir.x,
      y: node.y + dir.y
    }))
    .filter(
      n =>
        n.x >= 0 &&
        n.x < gridWidth &&
        n.y >= 0 &&
        n.y < gridHeight &&
        obstacleGrid[n.x][n.y] === 0
    );
}

// Reconstruct the Path
function reconstructPath(cameFrom, current) {
  let totalPath = [current];
  while (cameFrom[`${current.x},${current.y}`]) {
    current = cameFrom[`${current.x},${current.y}`];
    totalPath.unshift(current);
  }
  return totalPath.map(cell => ({
    x: cell.x * gridSize + gridSize / 2,
    y: cell.y * gridSize + gridSize / 2
  }));
}



function pathToPlayer() {
  if (laikaPath.length === 0 || dist(laika.pos.x, laika.pos.y, tank1.pos.x, tank1.pos.y) > 150) {
    laikaPath = findPath(laika.pos, tank1.pos); // Recalculate path if far from the player
  }

  if (laikaPath.length > 0) {
    let nextPoint = laikaPath[0];

    // If Laika is close enough to the waypoint, move to the next
    if (dist(laika.pos.x, laika.pos.y, nextPoint.x, nextPoint.y) < 15) {
      laikaPath.shift();
    } else {
      // Calculate desired angle to the next waypoint
      let desiredAngle = atan2(nextPoint.y - laika.pos.y, nextPoint.x - laika.pos.x);
      let angleDiff = (desiredAngle - laika.heading + 360) % 360;

      // ✅ Smooth rotation
      if (angleDiff > 180) {
        laika.setRotation(-lr); // Rotate Left
      } else {
        laika.setRotation(lr);  // Rotate Right
      }

      // ✅ Move forward if mostly aligned with the waypoint
      if (abs(angleDiff) < 20) {
        laika.setBoost(fw);
      } else {
        laika.setBoost(0); // Stop to realign if not facing the waypoint
      }

      return true; // Still following the path
    }
  }

  return false; // No path to follow
}



function loiter() {
  laika.setBoost(0);
  laika.setRotation(0);
  return true; // Idle if no other behaviors are active
}


function isPathBlocked(start, end) {
  let dx = end.x - start.x;
  let dy = end.y - start.y;
  let steps = Math.max(Math.abs(dx), Math.abs(dy)) / gridSize;

  for (let i = 0; i <= steps; i++) {
    let x = start.x + (dx * i) / steps;
    let y = start.y + (dy * i) / steps;

    for (let wall of walls) {
      if (
        x > wall.pos.x - wall.a &&
        x < wall.pos.x + wall.a &&
        y > wall.pos.y - wall.b &&
        y < wall.pos.y + wall.b
      ) {
        return true; // Path is blocked
      }
    }
  }
  return false;
}




function checkWallCollisionAhead(tank, lookAheadDistance = 40) {
  let futurePos = p5.Vector.add(
    tank.pos,
    p5.Vector.fromAngle(radians(tank.heading)).mult(lookAheadDistance)
  );

  for (let wall of walls) {
    if (
      futurePos.x > wall.pos.x - wall.a &&
      futurePos.x < wall.pos.x + wall.a &&
      futurePos.y > wall.pos.y - wall.b &&
      futurePos.y < wall.pos.y + wall.b
    ) {
      return true; // Collision detected ahead
    }
  }
  return false;
}




//-----------------------------------------------------------------------------------------------------


function keyReleased() {
  tank1.setRotation(0); 
  if (tank2) tank2.setRotation(0);
  if (laika) laika.setRotation(0);
  tank1.setBoost(0);
  if (tank2) tank2.setBoost(0);
  if (laika) laika.setBoost(0);
}


function togglePause() {
  isPaused = !isPaused;

  if (isPaused) {
    noLoop(); // Stop the draw loop
    showPauseMenu(); // Display pause options
  } else {
    hidePauseMenu(); // Hide pause options
    loop();          // Resume the draw loop
  }
}

function showPauseMenu() {
  // Dim background
  fill(0, 150);
  rect(width / 2, height / 2, width, height);

  // Resume Button
  resumeButton = createButton('Resume');
  resumeButton.position(width / 2 - 50, height / 2 - 20);
  resumeButton.style('background-color', '#4CAF50');
  resumeButton.style('color', '#FFFFFF');
  resumeButton.style('border', 'none');
  resumeButton.style('border-radius', '15px');
  resumeButton.style('padding', '10px 20px');
  resumeButton.mousePressed(togglePause);

  // Exit Button
  exitButton = createButton('Exit to Menu');
  exitButton.position(width / 2 - 60, height / 2 + 40);
  exitButton.style('background-color', '#F44336');
  exitButton.style('color', '#FFFFFF');
  exitButton.style('border', 'none');
  exitButton.style('border-radius', '15px');
  exitButton.style('padding', '10px 20px');
  exitButton.mousePressed(() => {
    isPaused = false;
    hidePauseMenu();
    clearGameElements();  // ✅ Clear bullets, tanks, etc. BUT DON'T RESET SCORE
    score = [0, 0, 0];
    gameState = "start";
    setupStartMenu();
    loop(); // Resume loop in case player wants to play again
  });
  
}

function clearGameElements() {
  bullets1 = [];
  bullets2 = [];
  walls = [];
  lootBoxes = []; 
  tank1 = null;
  tank2 = null;
  laika = null;
  winner = 0;
  gameend = false;
  gameOver = false;

  // score = [0, 0, 0];  <-- REMOVE THIS IF FOUND ANYWHERE ELSE
}


function hidePauseMenu() {
  if (resumeButton) resumeButton.remove();
  if (exitButton) exitButton.remove();
}


function shootSpreadShot(tpos, angle, colour, id) {
  let spreadAngles = [-15, 0, 15]; // Adjust bullet spread angles (left, center, right)

  for (let offset of spreadAngles) {
    bullets1.push(new Bullet(tpos, angle + offset, colour, id)); // Create spread bullets
  }
}



function keyPressed() {
  // ✅ Toggle Pause when ESC is pressed
  if (keyCode === ESCAPE && (gameMode === "1P" || gameMode === "2P")) {
    togglePause(); // Call the function to pause/resume the game
    return; // Prevent further key actions when toggling pause
  }

  // ✅ Handle Shooting Only When the Game is NOT Paused
  if (!isPaused) {
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
}


