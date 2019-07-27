/*
    todo:
        特效測試
        玩家物件
        攻擊功能 (反彈)
        設置磚塊
        設置敵人
*/

canvas.width = 640;
canvas.height = 480;

let ctx = canvas.getContext('2d'),
    fps = 1000 / 60;

function Player() {
    this.x = 0;
    this.y = 0;
    this.dx = 4;
    this.dy = 4;
    this.direction = "right";
    this.heath = 100;
}

Player.prototype = {
    move: function () {
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
        }
    },
}

// draw interface
let Draw = {
    // 人物大小 32*32
    avatarSize: {
        x: 0,
        y: 0,
        width: 32,
        height: 32
    },
    setImg: function (render) {
        this.img.onload = function () {
            render(this);
        }
    },
    draw: function () {
        ctx.drawImage(this.img,
            // 人物擷取範圍
            this.avatarSize.x, this.avatarSize.y, this.avatarSize.width, this.avatarSize.height,
            // 人物在地圖的位置
            this.x, this.y,
            // 人物在地圖的大小
            this.avatarSize.width, this.avatarSize.height);
    }
}

function Warrior() {
    Player.call(this);
    this.name = "Warrior";
    this.img = new Image();
    this.img.src = "img/warrior.png";
    this.setImg(update);
}

// warrior extends palyer
Warrior.prototype = Object.create(Player.prototype);
// 實作 draw
Object.assign(Warrior.prototype, Draw);

// 背景圖片
let bgReady = false,
    bgImg = new Image();
bgImg.src = "img/bg.png";
bgImg.onload = function () {
    ctx.drawImage(bgImg, 0, 0);
    bgReady = true;
}


let player = new Warrior();

function update() {
    if (bgReady) {
        reset()
        ctx.drawImage(bgImg, 0, 0);
        player.draw();
    }
}
setInterval(update, fps);

// 使用者功能
let keysdown = [];
document.onkeydown = function (e) {
    if ([37, 38, 39, 40].includes(e.keyCode)) {
        e.preventDefault();
    }
    keysdown[e.keyCode] = true;
    console.log("keydown with " + e.keyCode);
}

document.onkeyup = function (e) {
    delete keysdown[e.keyCode];
}

function start() {
    console.log("start clicked");
}

function pause() {
    console.log("pause clicked");
}

function reset() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function main() {
    if (37 in keysdown) {
        player.direction = "left";
        player.move();
    }
    if (38 in keysdown) {
        player.direction = "top";
        player.move();
    }
    if (39 in keysdown) {
        player.direction = "right";
        player.move();
    }
    if (40 in keysdown) {
        player.direction = "bottom";
        player.move();
    }

    requestAnimationFrame(main);
}

main();