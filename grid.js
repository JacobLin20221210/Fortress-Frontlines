let lootBoxes = []; // To store all loot boxes


function randmap(){
    // return map0();
    if(random() < 0.5)
        return map1();
    else
        return map2();
}

function map1(){
    var map = [];
    map.push(new Wall(width / 2, height, width / 2, 20));
    map.push(new Wall(width / 2, 0, width / 2, 20));
    map.push(new Wall(0, height / 2, 20, height / 2));
    map.push(new Wall(width, height / 2, 20, height / 2));
    for(var i = 0; i < width + 20; i += 300){
        for(var j = 0; j < height + 20; j += 300){
            if(random() < 0.5){
                map.push(new Wall(i, j, 20, 80));
                map.push(new Wall(i, j, 80, 20));
            }
            else if(random() < 0.4){
                map.push(new Wall(i, j, 10, 10, -1.5, 'blue'));
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
            if (random() < 0.1)
                ;
            else if (random() < 0.15)
                map.push(new Wall(i, j, 10, 10, -1.5, 'blue'));
            else if (random() < 0.5)
                map.push(new Wall(i, j, 20, 90));
            else
                map.push(new Wall(i, j, 90, 20));
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
    return map;  
}