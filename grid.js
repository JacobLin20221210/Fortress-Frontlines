let lootBoxes = []; // To store all loot boxes


function randmap(){
    // return map0();
    if(random() < 0.5)
        return map1();
    else
        return map2();
}

function isPositionClear(x, y, walls, buffer = 30) {
    for (let wall of walls) {
      let wallLeft = wall.pos.x - wall.a - buffer;
      let wallRight = wall.pos.x + wall.a + buffer;
      let wallTop = wall.pos.y - wall.b - buffer;
      let wallBottom = wall.pos.y + wall.b + buffer;
  
      // Check if the loot box overlaps with the wall
      if (x > wallLeft && x < wallRight && y > wallTop && y < wallBottom) {
        return false; // Overlapping with a wall
      }
    }
    return true; // No overlap, position is clear
  }
  

  function map1() {
    var map = [];
    map.push(new Wall(width / 2, height, width / 2, 20));
    map.push(new Wall(width / 2, 0, width / 2, 20));
    map.push(new Wall(0, height / 2, 20, height / 2));
    map.push(new Wall(width, height / 2, 20, height / 2));
  
    for (var i = 0; i < width + 20; i += 300) {
      for (var j = 0; j < height + 20; j += 300) {
        if (random() < 0.5) {
          map.push(new Wall(i, j, 20, 80));
          map.push(new Wall(i, j, 80, 20));
        } else if (random() < 0.4) {
          map.push(new Wall(i, j, 10, 10, -1.5, 'blue'));
        }
  
        // LootBox spawn condition with position check
        if (random() < 0.3) {
          let lootX = i + 50;
          let lootY = j + 50;
          if (isPositionClear(lootX, lootY, map)) {
            lootBoxes.push(new LootBox(lootX, lootY));
          }
        }
      }
    }
    return map;
  }
  
  

  function map2() {
    var map = [];
    map.push(new Wall(width / 2, height, width / 2, 20));
    map.push(new Wall(width / 2, 0, width / 2, 20));
    map.push(new Wall(0, height / 2, 20, height / 2));
    map.push(new Wall(width, height / 2, 20, height / 2));
  
    for (var i = 0; i < width + 20; i += 250) {
      for (var j = 0; j < height + 20; j += 250) {
        if (random() < 0.1) {
          // Empty space occasionally
        } else if (random() < 0.15) {
          map.push(new Wall(i, j, 10, 10, -1.5, 'blue'));
        } else if (random() < 0.5) {
          map.push(new Wall(i, j, 20, 90));
        } else {
          map.push(new Wall(i, j, 90, 20));
        }
  
        // LootBox spawn condition with position check
        if (random() < 0.3) {
          let lootX = i + 30;
          let lootY = j + 30;
          if (isPositionClear(lootX, lootY, map)) {
            lootBoxes.push(new LootBox(lootX, lootY));
          }
        }
      }
    }
    return map;
  }
  
  

  function map0() {
    var map = [];
    map.push(new Wall(width / 2, height, width / 2, 20));
    map.push(new Wall(width / 2, 0, width / 2, 20));
    map.push(new Wall(0, height / 2, 20, height / 2));
    map.push(new Wall(width, height / 2, 20, height / 2));
  
    // Random LootBoxes with position check
    for (let i = 50; i < width - 100; i += 200) {
      for (let j = 50; j < height - 100; j += 200) {
        if (random() < 0.3) {
          if (isPositionClear(i, j, map)) {
            lootBoxes.push(new LootBox(i, j));
          }
        }
      }
    }
    return map;
  }
  
  