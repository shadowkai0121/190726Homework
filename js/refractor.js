// 複製物件
function clone(source) {
    if (source == null || typeof (source) != 'object') return null;

    let target = new Object();
    for (let attr in source) {
        if (typeof (source[attr]) != 'object') {
            target[attr] = source[attr];
        } else {
            target[attr] = clone(source[attr]);
        }
    }

    return target;
}


canvas.width = 640;
canvas.height = 480;

let ctx = canvas.getContext('2d');

// 繪圖程式
function draw(obj) {
    console.log(obj);
    // ctx.drawImage(
    //     obj.img,
    //     // 人物擷取範圍
    //     obj.avatarImg.x, obj.avatarImg.y,
    //     obj.avatarImg.width, obj.avatarImg.height,
    //     // 人物在地圖的位置
    //     obj.x, obj.y,
    //     // 人物在地圖的大小
    //     obj.avatarImg.width * obj.scale, obj.avatarImg.height * obj.scale
    // );

    ctx.drawImage(
        obj.img,
        // 人物擷取範圍
        0, 0,
        32, 32,
        // 人物在地圖的位置
        obj.x, obj.y,
        // 人物在地圖的大小
        32, 32
    );
    console.log('done');
}

function drawBackGround(bg) {
    reset();
    ctx.drawImage(bg,
        0, 0,
        canvas.width, canvas.height);
}

function reset() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

let bgReady = false,
    bg = new Image();

bg.src = "img/bg.png";
bg.onload = function () {
    drawBackGround(bg);
    bgReady = true;
}



/*******************************************/
// 物件

let direction = [
    "right", "left", "top", "bottom",
    "topRight", "topLeft", "bottomRight", "bottomLeft"
];

// 人物顯示規格
let avatarImg = {
    x: 0,
    y: 0,
    width: 32,
    height: 32
}

// 地圖物件類別
function MapObject() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.dx = 4;
    this.dy = 4;
    this.direction = direction[Math.random() * direction.length];
    this.isDelete = false;
    this.avatarImg = clone(avatarImg);
    this.scale = 1;
}

MapObject.prototype = {
    move: function () {
        switch (this.direction) {
            case "right":
                break;
            case "left":
                break;
            case "top":
                break;
            case "bottom":
                break;
            case "topRight":
                break;
            case "bottomRight":
                break;
            case "topLeft":
                break;
            case "bottomLeft":
                break;
        }
    }
}

function Warrior() {
    MapObject.call(this);
    this.x = 50;
    this.y = canvas.height / 2 + this.avatarImg.width / 2;
    this.direction = "right";
    this.img = new Image();
    this.img.src = "img/warrior.png";
    this.actionCounter = 1;
    this.action(this);
}

Warrior.prototype = Object.create(MapObject.prototype);

Warrior.prototype.action = function (obj) {
    obj.avatarImg.x += obj.actionCounter * obj.avatarImg.width;
    if (obj.avatarImg.x >= obj.img.width - obj.action.width ||
        obj.avatarImg.x <= 0) {
        obj.actionCounter *= -1;
    }
    switch (obj.direction) {
        case "right":
            obj.avatarImg.y = obj.avatarImg.height * 2;
            break;
        case "left":
            obj.avatarImg.y = obj.avatarImg.height * 1;
            break;
        case "top":
            obj.avatarImg.y = obj.avatarImg.height * 3;
            break;
        case "bottom":
            obj.avatarImg.y = obj.avatarImg.height * 0;
            break;
    }
}

let war = new Warrior();
draw(war);