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
    direction = ["bottom", "left", "right", "top"];

function Player() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
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
                if (this.x >= canvas.width - this.avatarImg.width) {
                    this.x = canvas.width - this.avatarImg.width;
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
                if (this.y >= canvas.height - this.avatarImg.height) {
                    this.y = canvas.height - this.avatarImg.height;
                }
                break;
        }

    },
}

// draw interface
let Draw = {
    // 人物大小 32*32
    avatarImg: {
        x: 0,
        y: 0,
        width: 32,
        height: 32
    },
    draw: function () {
        // 取得人物對應的面向
        this.avatarImg.y = 32 * direction.indexOf(this.direction);
        ctx.drawImage(this.img,
            // 人物擷取範圍
            this.avatarImg.x, this.avatarImg.y, this.avatarImg.width, this.avatarImg.height,
            // 人物在地圖的位置
            this.x, this.y,
            // 人物在地圖的大小
            this.avatarImg.width, this.avatarImg.height);
    },
    // 人物動作
    actionFrame: 32,
    action: function (obj) {
        obj.avatarImg.x += obj.actionFrame;

        if (obj.avatarImg.x >= obj.avatarImg.width * 2 || obj.avatarImg.x <= 0) {
            obj.actionFrame *= -1;
        }

        setTimeout(obj.action, 1000 / 3, obj);
    }
}

function Warrior() {
    Player.call(this);
    this.x = 50
    this.y = canvas.height / 2;
    this.name = "Warrior";
    this.img = new Image();
    this.img.src = "img/warrior.png";
    this.action(this);
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


// 產生玩家物件
let player = new Warrior();

let mainReq = [];
// 畫面更新
function update() {
    if (bgReady) {
        reset()
        ctx.drawImage(bgImg, 0, 0);
        player.draw();
    }

    mainReq["update"] = requestAnimationFrame(update);
}
update();

function reset() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


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
    update();
    main();
}

function pause() {
    for (let request in mainReq) {
        cancelAnimationFrame(mainReq[request]);
    }
}

function userReset() {
    pause();
    reset();
    ctx.drawImage(bgImg, 0, 0);
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

    mainReq["main"] = requestAnimationFrame(main);
}
main();
