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

let bg = new Image();

bg.src = "img/bg.png";
bg.onload = function () {
    drawBackGround();
}

function drawBackGround() {
    reset();
    ctx.drawImage(bg,
        0, 0,
        canvas.width, canvas.height);
}

function reset() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// 繪圖程式
function draw(obj) {
    ctx.drawImage(obj.img,
        // 人物擷取範圍
        obj.avatarImg.x, obj.avatarImg.y,
        obj.avatarImg.width, obj.avatarImg.height,
        // 人物在地圖的位置
        obj.x, obj.y,
        //     // 人物在地圖的大小
        obj.avatarImg.width, obj.avatarImg.height);
}

/*******************************************/
// 物件

// 方向表
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
                this.x += this.dx;
                if (this.x >= canvas.width) {
                    this.x = canvas.width;
                }
                break;
            case "left":
                this.x -= this.dx;
                if (this.x <= 0) {
                    this.x = 0;
                }
                break;
            case "top":
                this.y -= this.dy;
                if (this.y <= 0) {
                    this.y = 0;
                }
                break;
            case "bottom":
                this.y += this.dy;
                if (this.y >= canvas.height) {
                    this.y = canvas.height;
                }
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
    // 圖片 X 軸切割，每一次執行變更一個寬度的距離
    obj.avatarImg.x += obj.actionCounter * obj.avatarImg.width;

    if (obj.avatarImg.x >= obj.img.width - obj.avatarImg.width ||
        obj.avatarImg.x <= 0) {
        // 反轉切割方向
        obj.actionCounter *= -1;
    }

    setTimeout(obj.action, 1000 / 5, obj);
}

Warrior.prototype.trunArround = function (direct) {
    // 設置角色當前方向
    this.direction = direct;

    // 因應角色方向選擇切割圖片的 Y 軸
    switch (this.direction) {
        case "right":
            this.avatarImg.y = this.avatarImg.height * 2;
            break;
        case "left":
            this.avatarImg.y = this.avatarImg.height * 1;
            break;
        case "top":
            this.avatarImg.y = this.avatarImg.height * 3;
            break;
        case "bottom":
            this.avatarImg.y = this.avatarImg.height * 0;
            break;
    }
}

// 玩家物件
let player = new Warrior();

// 使用者功能
let keysdown = [];
document.onkeydown = function (e) {
    if ([37, 38, 39, 40].includes(e.keyCode)) {
        e.preventDefault();
    }
    keysdown[e.keyCode] = true;
}

document.onkeyup = function (e) {
    delete keysdown[e.keyCode];
}


function main() {

    // 判斷按下的按鍵
    if (37 in keysdown) {
        player.trunArround("left");
        player.move();
    }
    if (38 in keysdown) {
        player.trunArround("top");
        player.move();
    }
    if (39 in keysdown) {
        player.trunArround("right");
        player.move();
        draw(player);
    }
    if (40 in keysdown) {
        player.trunArround("bottom");
        player.move();
    }

    // 繪製物件
    drawBackGround();
    draw(player);

    requestAnimationFrame(main);
}
main();
