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
        obj.avatarImg.scale * obj.avatarImg.width, obj.avatarImg.scale * obj.avatarImg.height);
}

/*******************************************/
// 物件

// 人物圖片規格
let avatarImg = {
    scale: 1,
    x: 0,
    y: 0,
    width: 32,
    height: 32,
}

// 地圖物件類別
function MapObject() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.dx = 4;
    this.dy = 4;
    this.setDirection();
    this.isDelete = false;
    this.avatarImg = clone(avatarImg);
}

MapObject.prototype = {
    setDirection: function () {
        let direction = [
            "right", "left", "top", "bottom",
            "topRight", "topLeft", "bottomRight", "bottomLeft"
        ];

        this.direction = direction[parseInt(Math.random() * direction.length)];
    },
    setScope: function () {
        this.scope = {
            minX: this.x,
            minY: this.y,
            maxX: this.x + this.avatarImg.scale * this.avatarImg.width,
            maxY: this.y + this.avatarImg.scale * this.avatarImg.height
        }
    },
    move: function () {
        // 每次移動時更新物件實體範圍
        this.setScope();

        switch (this.direction) {
            case "right":
                this.x += this.dx;
                break;
            case "left":
                this.x -= this.dx;
                break;
            case "top":
                this.y -= this.dy;
                break;
            case "bottom":
                this.y += this.dy;
                break;
            case "topRight":
                this.x += this.dx;
                this.y += this.dy;
                break;
            case "bottomRight":
                this.x += this.dx;
                this.y -= this.dy;
                break;
            case "topLeft":
                this.x -= this.dx;
                this.y -= this.dy;
                break;
            case "bottomLeft":
                this.x -= this.dx;
                this.y += this.dy;
                break;
        }

        if (this.x >= canvas.width - this.avatarImg.width) {
            this.x = canvas.width - this.avatarImg.width;
        }
        if (this.x <= 0) {
            this.x = 0;
        }
        if (this.y <= 0) {
            this.y = 0;
        }
        if (this.y >= canvas.height - this.avatarImg.height) {
            this.y = canvas.height - this.avatarImg.height;
        }
    },
    randomWalk: function (obj) {
        obj.setDirection();
        setTimeout(obj.randomWalk, Math.random() * (1.5 * 1000), obj);
    }
}



function Warrior() {
    MapObject.call(this);
    this.x = 50;
    this.y = canvas.height / 2 - this.avatarImg.width / 2;
    this.direction = "right";
    this.img = new Image();
    this.img.src = "img/warrior.png";
    this.actionCounter = 1;
    this.setScope();
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



function Brick() {
    MapObject.call(this);
    this.x = canvas.width / 2 - this.avatarImg.width / 2;
    this.y = canvas.height / 2 - this.avatarImg.height / 2;
    this.img = new Image();
    this.img.src = "img/brick_boss.png";
    this.setScope();
    this.randomWalk(this);
}

Brick.prototype = Object.create(MapObject.prototype);

Brick.prototype.move = function () {
    MapObject.prototype.move.call(this);

    if (
        this.x >= canvas.width - this.avatarImg.width ||
        this.y >= canvas.height - this.avatarImg.height ||
        this.x <= 0 ||
        this.y <= 0
    ) {
        this.setDirection();
    }
}


// 玩家物件
let player = new Warrior();
// Boss
let boss = new Brick();

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
    boss.move();

    // 繪製物件
    drawBackGround();
    draw(player);
    draw(boss);

    requestAnimationFrame(main);
}
main();