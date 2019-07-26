canvas.width = 640;
canvas.height = 480;

let ctx = canvas.getContext('2d');

// 讀取圖片
let bgImg = new Image(),
    bgReady = false;
bgImg.src = "img/bg.png";
bgImg.onload = function () {
    ctx.drawImage(bgImg, 0, 0);
    bgReady = true;
}

// 使用者功能
let keysdown = [];
document.onkeydown = function (e) {
    console.log("keydown with " + e.keyCode);
    if ([37, 38, 39, 40].includes(e.keyCode)) {
        e.preventDefault();
    }
    keysdown[e.keyCode] = true;
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
    console.log("reset clicked");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
}
