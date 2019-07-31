/*
    todo{
        按鍵 cd
        角色物件的碰撞
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
    this.avatarImg = clone(avatarImg);
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.dx = 4;
    this.dy = 4;
    this.setDirection();
    this.isDelete = false;
    this.setScope();
}

MapObject.prototype = {
    // 更新人物的作用範圍
    setScope: function () {
        this.scope = {
            minX: this.x,
            minY: this.y,
            maxX: this.x + this.avatarImg.scale * this.avatarImg.width,
            maxY: this.y + this.avatarImg.scale * this.avatarImg.height
        }
    },
    move: function () {
        // 變更角色位置
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
        setTimeout(obj.randomWalk, Math.random() * (2 * 1000), obj);
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
    this.setDirection(this.direction);
    this.action(this);
}

Warrior.prototype = Object.create(MapObject.prototype);

// 動作動畫
Warrior.prototype.action = function (self) {
    // 圖片 X 軸切割，每一次執行變更一個寬度的距離
    self.avatarImg.x += self.actionController * self.avatarImg.width;

    if (self.avatarImg.x >= self.img.width - self.avatarImg.width ||
        self.avatarImg.x <= 0) {
        // 反轉切割方向
        self.actionController *= -1;
    }

    setTimeout(self.action, 1000 / 5, self);
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

// 角色技能
Warrior.prototype.piercing = function () {
    let piercing = new Piercing(this);

    for (let enemyObj of enemyObjs) {
        piercing.isHit(enemyObj);
    }

    skillObjs.push(piercing);
}


// 這是個磚塊
function Brick() {
    MapObject.call(this);
    this.x = canvas.width / 2 - this.avatarImg.width / 2;
    this.y = canvas.height / 2 - this.avatarImg.height / 2;
    this.img = new Image();
    this.img.src = "img/brick_boss.png";
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
let piercingImg = {
    scale: 0.5,
    x: 0,
    y: 0,
    width: 320,
    height: 240
}

function Piercing(caster) {

    this.avatarImg = clone(piercingImg);

    // 依照攻擊方向設置技能物件起始位置
    switch (caster.direction) {
        case "right":
            // 校正初始位置使技能效果能從人物中線發射
            this.x = caster.x + caster.avatarImg.width;

            this.y =
                caster.y -
                this.avatarImg.height * this.avatarImg.scale / 2 +
                caster.avatarImg.height / 2;

            // 設置作用範圍
            this.scope = {
                minX: caster.x + caster.avatarImg.width,
                minY: caster.y,
                maxX: this.x + this.avatarImg.width * this.avatarImg.scale,
                maxY: caster.y + caster.avatarImg.height
            }
            break;

        case "left":
            this.x =
                caster.x -
                this.avatarImg.width * this.avatarImg.scale;

            this.y =
                caster.y -
                this.avatarImg.height * this.avatarImg.scale / 2 +
                caster.avatarImg.height / 2;

            this.scope = {
                minX: caster.x - this.avatarImg.width * this.avatarImg.scale,
                minY: caster.y,
                maxX: caster.x,
                maxY: caster.y + caster.avatarImg.height
            }
            break;

        case "top":
            this.x =
                caster.x -
                this.avatarImg.width * this.avatarImg.scale / 2 +
                caster.avatarImg.width / 2;

            this.y =
                caster.y -
                this.avatarImg.height * this.avatarImg.scale;

            this.scope = {
                minX: caster.x,
                minY: caster.y - this.avatarImg.height * this.avatarImg.scale,
                maxX: caster.x + caster.avatarImg.width,
                maxY: caster.y,
            }
            break;

        case "bottom":
            this.x =
                caster.x -
                this.avatarImg.width * this.avatarImg.scale / 2 +
                caster.avatarImg.width / 2;

            this.y = caster.y + caster.avatarImg.height;

            this.scope = {
                minX: caster.x,
                minY: caster.y + caster.avatarImg.height,
                maxX: caster.x + caster.avatarImg.width,
                maxY: caster.y + this.avatarImg.height * this.avatarImg.scale
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

Piercing.prototype.action = function (self) {
    // 取得下一張圖位置
    // (obj.img.width / obj.avatarImg.width) 代表這張圖片有幾欄
    let col = self.actionController % (self.img.width / self.avatarImg.width),
        // (obj.img.height / obj.avatarImg.height) 代表這張圖片有幾列
        row = Math.floor(
            self.actionController / (self.img.height / self.avatarImg.height)
        );

    // 動態調整裁切範圍
    self.avatarImg.x = self.avatarImg.width * col;
    self.avatarImg.y = self.avatarImg.height * row;

    // 計算目前執行次數
    self.actionController++;
    if (self.actionController >= 9) {
        // 標記執行完成
        self.isDelete = true;
        return;
    }

    setTimeout(self.action, 1000 / 40, self);
}

Piercing.prototype.isHit = function (enemyObj) {
    switch (this.direction) {
        case "right":
            /*                                 
                enemy.minX  enemy.maxX                   
                    +----------+ enemy.minY 
                    |   enemy  |               
                    |          |            skill.maxX
                +------------------------------+ skill.minY
                |   |          |               |
                |   +----------+ enemy.maxY    |
                |                              |
                +------------------------------+ skill.maxY
          skill.minX           +---------------------->
            */
            if (
                // 物件在技能的寬度內
                this.scope.minX <= enemyObj.scope.minX &&
                this.scope.maxX >= enemyObj.scope.minX &&
                // 判斷上下是否重疊
                isOverlapping(this, enemyObj)
            ) {
                // 命中產生爆炸
                let explosion = new Explosion(
                    enemyObj.scope.minX, getCenterLine(this, enemyObj)
                );
                skillObjs.push(explosion);
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
            if (
                // 物件在技能寬度內
                this.scope.minX <= enemyObj.scope.minX &&
                this.scope.maxX >= enemyObj.scope.maxX &&
                isOverlapping(this, enemyObj)
            ) {
                // 命中產生爆炸
                let explosion = new Explosion(
                    enemyObj.scope.maxX, getCenterLine(this, enemyObj)
                );
                skillObjs.push(explosion);
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
                this.scope.minY <= enemyObj.scope.maxY &&
                this.scope.maxY >= enemyObj.scope.minY &&
                isOverlapping(this, enemyObj)
            ) {
                // 命中產生爆炸
                let explosion = new Explosion(
                    getCenterLine(this, enemyObj), enemyObj.scope.maxY
                );
                skillObjs.push(explosion);
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
                this.scope.maxY >= enemyObj.scope.minY &&
                this.scope.minY <= enemyObj.scope.maxY &&
                isOverlapping(this, enemyObj)
            ) {
                // 命中產生爆炸
                let explosion = new Explosion(
                    getCenterLine(this, enemyObj), enemyObj.scope.minY
                );
                skillObjs.push(explosion);
            }
            break;
    }
}

// 判斷重疊範圍
function isOverlapping(source, target) {
    // 水平重疊
    if (source.direction === "right" || source.direction === "left") {
        if (
            // 物件與技能下緣重疊
            (
                source.scope.maxY >= target.scope.minY &&
                source.scope.minY <= target.scope.maxY
            ) ||
            // 物件與技能上緣重疊
            (
                source.scope.maxY <= (source.scope.maxY + target.avatarImg.height)
                &&
                source.scope.minY >= target.scope.minY
            )
        ) {
            return true;
        }
    }

    // 垂直重疊
    else if (source.direction === "top" || source.direction === "bottom") {
        if (
            // 右側重疊
            (
                source.scope.minX <= target.scope.maxX
                &&
                (source.scope.minX - target.avatarImg.width) <= target.scope.minX
            ) ||
            // 左側重疊
            (
                source.scope.minX <= target.scope.minX &&
                (source.scope.minX + target.avatarImg.width) >= target.scope.maxX
            )
        ) {
            return true;
        }
    }

    // 沒有重疊
    return false;
}

// 取得重疊範圍的中心線
// 以技能的方向為基準
function getCenterLine(source, target) {

    if (source.direction === "right" || source.direction === "left") {

        // 判斷是上面重疊還是下面
        let horizontal = source.scope.minY >= target.scope.maxY ?
            (source.scope.minY + target.scope.maxY) / 2 :
            (source.scope.maxY + target.scope.minY) / 2;

        return horizontal;
    }

    else if (source.direction === "top" || source.direction === "bottom") {

        // 判斷是左邊還右邊重疊
        let vertical = source.scope.minX <= target.scope.maxX ?
            (source.scope.minX + target.scope.maxX) / 2 :
            (source.scope.maxX + target.scope.minX) / 2;

        return vertical;
    }

    throw "getCenterLine: 技能方向指定錯誤";

}

// 爆炸圖片規格
let explosionImg = {
    scale: 0.3,
    x: 0,
    y: 0,
    width: 120,
    height: 120
}

function Explosion(x, y) {
    // Explosion(x, y) = 重疊範圍的中線與目標的邊界
    this.avatarImg = clone(explosionImg);

    this.x = x - this.avatarImg.width * this.avatarImg.scale / 2;
    this.y = y - this.avatarImg.width * this.avatarImg.scale / 2;

    this.img = new Image();
    this.img.src = "img/explosion.png"

    this.actionController = 0;
    this.action(this);
}

Explosion.prototype.action = function (self) {

    self.avatarImg.x = self.avatarImg.width * self.actionController;

    self.actionController++;

    if (self.actionController >= 8) {
        self.isDelete = true;
        return;
    }

    setTimeout(self.action, 1000 / 30, self);
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

    // 清除已刪除物件
    skillObjs = skillObjs.filter(obj => {
        return obj.isDelete != true;
    });

    // boss 亂動
    boss.move();

    // 判斷按下的按鍵
    if (37 in keysdown) {
        player.setDirection("left");
        player.move();
        draw(player);
    }
    if (38 in keysdown) {
        player.setDirection("top");
        player.move();
        draw(player);
    }
    if (39 in keysdown) {
        player.setDirection("right");
        player.move();
        draw(player);
    }
    if (40 in keysdown) {
        player.setDirection("bottom");
        player.move();
        draw(player);
    }
    // 按下 Z 鍵發出攻擊
    if (90 in keysdown) {
        player.piercing();
    }

    // 繪製物件
    drawBackGround();
    draw(player);
    draw(boss);

    // 畫出所有技能物件
    for (let skillObj of skillObjs) {
        if (skillObj) {
            draw(skillObj);
        }
    }

    requestAnimationFrame(main);
}
main();