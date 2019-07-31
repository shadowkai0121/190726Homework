/*
    todo{
        改寫 Explosion 建構子
        改寫 Explosion 物件顯示
        在 Warrior 施放 Piercing 時產生 Explosion
        修正原本 Boss 被攻擊時 Explosion 顯示位置錯誤 Bug
    }

*/
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
    // 更新人物當前的作用範圍
    setScope: function () {
        this.scope = {
            minX: this.x,
            minY: this.y,
            maxX: this.x + this.avatarImg.scale * this.avatarImg.width,
            maxY: this.y + this.avatarImg.scale * this.avatarImg.height
        }
    },
    move: function () {

        // 依據方向變更圖片位置
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

        // 判斷是否觸碰到地圖邊界
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

        // 每次移動時更新物件實體範圍
        this.setScope();
    },
    // 變更方向
    setDirection: function () {
        let direction = [
            "right", "left", "top", "bottom",
            "topRight", "topLeft", "bottomRight", "bottomLeft"
        ];

        this.direction = direction[parseInt(Math.random() * direction.length)];
    },
    // 讓 NPC 亂跑
    randomWalk: function (obj) {
        obj.setDirection();
        setTimeout(obj.randomWalk, Math.random() * (1.5 * 1000), obj);
    }
}



// 玩家建構子
function Warrior() {
    MapObject.call(this);
    this.x = 50;
    this.y = canvas.height / 2 - this.avatarImg.width / 2;
    this.direction = "right";
    this.img = new Image();
    this.img.src = "img/warrior.png";
    // 控制當前人物動作
    this.actionController = 1;
    this.setScope();
    this.action(this);
}

Warrior.prototype = Object.create(MapObject.prototype);

// 動作動畫
Warrior.prototype.action = function (obj) {
    // 圖片 X 軸切割，每一次執行變更一個寬度的距離
    obj.avatarImg.x += obj.actionController * obj.avatarImg.width;

    if (obj.avatarImg.x >= obj.img.width - obj.avatarImg.width ||
        obj.avatarImg.x <= 0) {
        // 反轉切割方向
        obj.actionController *= -1;
    }

    setTimeout(obj.action, 1000 / 5, obj);
}

// 改變方向
Warrior.prototype.setDirection = function (direct) {
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

Warrior.prototype.piercing = function () {
    let piercing = new Piercing(this);
    piercing.isHit();
    skillObjs.push(piercing);
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

    // 撞到邊邊的時候換隨機方向
    if (
        this.x >= canvas.width - this.avatarImg.width ||
        this.y >= canvas.height - this.avatarImg.height ||
        this.x <= 0 ||
        this.y <= 0
    ) {
        this.setDirection();
    }
}


// 圖片規格
let attachSkillImg = {
    scale: 0.5,
    x: 0,
    y: 0,
    width: 320, height: 240
}

function Piercing(caster) {

    this.avatarImg = clone(attachSkillImg);

    switch (caster.direction) {
        case "right":
            // 校正初始位置使技能效果能從人物中線發射
            this.x = caster.x + caster.avatarImg.width;
            this.y = caster.y - this.avatarImg.height * this.avatarImg.scale / 2 + caster.avatarImg.height / 2;

            // 設置作用範圍
            this.scope = {
                minX: caster.x + caster.avatarImg.width,
                minY: caster.y,
                maxX: this.x + this.avatarImg.width * this.avatarImg.scale,
                maxY: caster.y + caster.avatarImg.height
            }
            break;
        case "left":
            this.x = caster.x - this.avatarImg.width * this.avatarImg.scale;
            this.y = caster.y - this.avatarImg.height * this.avatarImg.scale / 2 + caster.avatarImg.height / 2;

            this.scope = {
                minX: caster.x - this.avatarImg.width * this.avatarImg.scale,
                minY: caster.y,
                maxX: caster.x,
                maxY: caster.y + caster.avatarImg.height
            }
            break;
        case "top":
            this.x = caster.x - this.avatarImg.width * this.avatarImg.scale / 2 + caster.avatarImg.width / 2;
            this.y = caster.y - this.avatarImg.height * this.avatarImg.scale;

            this.scope = {
                minX: caster.x,
                minY: caster.y - this.avatarImg.height * this.avatarImg.scale,
                maxX: caster.x + caster.avatarImg.width,
                maxY: caster.y,
            }
            break;
        case "bottom":
            this.x = caster.x - this.avatarImg.width * this.avatarImg.scale / 2 + caster.avatarImg.width / 2;
            this.y = caster.y + caster.avatarImg.height;

            this.scope = {
                minX: caster.x,
                minY: caster.y + caster.avatarImg.height,
                maxX: caster.x + caster.avatarImg.width,
                maxY: this.minY + this.height * this.avatarImg.scale
            }
            break;
    }

    this.direction = caster.direction;
    this.actionController = 0;
    this.img = new Image();
    // 載入對應方向的圖片
    this.img.src = "img/piercing_" + caster.direction + ".png";
    this.action(this);
}

Piercing.prototype.action = function (obj) {
    // 取得下一張圖位置
    let col = obj.actionController % (obj.img.width / obj.avatarImg.width),
        row = Math.floor(obj.actionController / (obj.img.height / obj.avatarImg.height));

    // 動態調整裁切範圍
    obj.avatarImg.x = obj.avatarImg.width * col;
    obj.avatarImg.y = obj.avatarImg.height * row;

    // 計算目前執行次數
    obj.actionController++;
    if (obj.actionController >= 9) {
        // 標記執行完成
        obj.isDelete = true;
        return;
    }

    setTimeout(obj.action, 1000 / 120, obj);
}

Piercing.prototype.isHit = function (enemyObj) {
    // 命中後回傳交叉點數據
    switch (this.direction) {
        case "right":
            /*                                 
                enemy.minX  enemy.maxX      
                    |          |                
                    +----------+ enemy.minY    
                    |   enemy  |               
                    |          |            skill.maxX
                +------------------------------+ skill.minY
                |   |          |               |
                |   +----------+ enemy.maxY    |
                |                              |
                +------------------------------+ skill.maxY
                            +---------------------->
            */
            if (
                this.scope.maxX >= enemyObj.scope.minX &&
                this.scope.minX <= enemyObj.scope.minX &&
                this.scope.minY <= enemyObj.scope.maxY ||
                this.scope.maxY >= enemyObj.scope.minY
            ) {
                console.log("right hit");

                
            }
            break;
        case "left":
            /*
                                enemy.minX   enemy.maxX
                                   +----------+  skill.maxX
                                   |          |    +
              skill.minX           |          |    |
                    +------------------------------+ skill.minY
                    |              |          |    |
                    |   enemy.maxY +----------+    |
                    |                              |
                    +------------------------------+ skill.maxY
                <-------------------+

             */
            if (this.scope.minX <= enemyObj.scope.minX &&
                this.scope.maxX >= enemyObj.scope.maxX &&
                this.scope.minY >= enemyObj.scope.maxY ||
                this.scope.maxY >= enemyObj.scope.minY) {
                console.log("left hit");
            }
            break;
        case "top":
            /*
                                          ^
                                          |
                  skill.minY+-----------+ |
                            |           | |
                            |           | |
            enemy.minY+---------+       | +
                      |     |   |       |
                      |     |   |       |
                      |     |   |       |
                      |     |   |       |
            enemy.maxY+---------+       |
                enemy.minX  | enemy.maxX|
                            |           |
                            |           |
                            +-----------+ skill.maxY
                    skill.minX     skill.maxX
            */
            if (
                this.scope.minY <= enemyObj.scope.minY &&
                this.scope.maxY >= enemyObj.scale.minY &&
                this.scope.minX <= enemyObj.scope.maxX ||
                this.scope.maxX >= enemyObj.scope.minX
            ) {
                console.log("top hit");
            }
            break;
        case "bottom":
            /*
                skill.minX  skill.maxX
                      +---------+ skill.minY
                      |         |
                      |         |
     enemy.minY +----------+    |
                |     |    |    |
                |     |    |    |  +
                |     |    |    |  |
                |     |    |    |  |
     enemy.maxY +----------+    |  |
         enemy.minX   |    |    |  |
                      |    |    |  |
                      |    |    |  |
           skill.maxY +---------+  |
                           |       |
                           +       v
                    enemy.maxX
            */
            if (
                this.scope.maxY >= enemyObj.scope.maxY &&
                this.scope.minY <= enemyObj.scope.maxY &&
                this.scope.minX <= enemyObj.scope.maxX ||
                this.scope.maxX >= enemyObj.scope.minX
            ) {
                console.log("bottom hit");
            }
            break;
    }
}

function Explosion(skill, victim) {
    // 攻擊方向
    // Explosion(x, y) = 計算重疊範圍的中線與目標的邊界

}

function countCrossPoint(obj1, obj2) {

}

// 物件管理中心
let enemyObjs = [],
    skillObjs = [];

// 玩家物件
let player = new Warrior();
// Boss
let boss = new Brick();
enemyObjs.push(boss);

// 紀錄按鍵資訊 
let keysdown = [];
document.onkeydown = function (e) {
    // 移除上下左右鍵預設的動作
    if ([37, 38, 39, 40].includes(e.keyCode)) {
        e.preventDefault();
    }

    keysdown[e.keyCode] = true;
}

document.onkeyup = function (e) {
    delete keysdown[e.keyCode];
}

// 遊戲迴圈
function main() {

    // 判斷按下的按鍵
    if (37 in keysdown) {
        player.setDirection("left");
        player.move();
    }
    if (38 in keysdown) {
        player.setDirection("top");
        player.move();
    }
    if (39 in keysdown) {
        player.setDirection("right");
        player.move();
        draw(player);
    }
    if (40 in keysdown) {
        player.setDirection("bottom");
        player.move();
    }
    if (90 in keysdown) {
        player.piercing();
    }

    // boss.move();
    // 繪製物件
    drawBackGround();
    draw(player);
    draw(boss);

    // 清除已刪除物件
    skillObjs = skillObjs.filter(obj => {
        return obj.isDelete != true;
    });

    // 畫出所有技能物件
    for (let skillObj of skillObjs) {
        if (skillObj) {
            draw(skillObj);
        }
    }

    requestAnimationFrame(main);
}
main();