const score = document.querySelector('.score');
const startScreen = document.querySelector('.startScreen');
const restartScreen = document.querySelector('.restartScreen');
const gameArea = document.querySelector('.gameArea');
const level = document.querySelector('.level');

// Preload audio files
let gameStart = new Audio("assets/audio/game_theme.mp3");
let gameOver = new Audio("assets/audio/gameOver_theme.mp3");

gameStart.addEventListener('loadeddata', () => {
    gameStart.loop = true;
    gameStart.play();
});

gameOver.addEventListener('loadeddata', () => {
    gameOver.play();
});

const levelSpeed = { easy: 10, moderate: 17, difficult: 25 };

let keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

let player = { speed: 20, score: 0 };

level.addEventListener('click', (e) => {
    startGame(levelSpeed[e.target.id]);
});

restartScreen.addEventListener('click', () => {
    startGame(player.speed);
});

function startGame(speed) {
    startScreen.classList.add('hide');
    restartScreen.style.display = 'none';
    gameArea.innerHTML = "";

    player.start = true;
    player.speed = speed;
    player.score = 0;
    gameStart.play();
    gameStart.loop = true;
    window.requestAnimationFrame(gamePlay);

    createRoadLines();
    createPlayerCar();
    createEnemyCars(3);
}

function createRoadLines() {
    for (let i = 0; i < 12; i++) {
        let roadLineElement = document.createElement('div');
        roadLineElement.setAttribute('class', 'roadLines');
        roadLineElement.y = (i * 150);
        roadLineElement.style.top = roadLineElement.y + "px";
        gameArea.appendChild(roadLineElement);
    }
}

function createPlayerCar() {
    let carElement = document.createElement('div');
    carElement.setAttribute('class', 'car');
    gameArea.appendChild(carElement);

    player.x = carElement.offsetLeft;
    player.y = carElement.offsetTop;
}

function createEnemyCars(count) {
    for (let i = 0; i < count; i++) {
        let enemyCar = document.createElement('div');
        enemyCar.setAttribute('class', 'enemyCar');
        enemyCar.y = ((i + 1) * 350) * - 1;
        enemyCar.style.top = enemyCar.y + "px";
        enemyCar.style.backgroundColor = randomColor();
        enemyCar.style.left = Math.floor(Math.random() * 350) + "px";
        gameArea.appendChild(enemyCar);
    }
}

function randomColor() {
    function c() {
        let hex = Math.floor(Math.random() * 256).toString(16);
        return ("0" + String(hex)).substr(-2);
    }
    return "#" + c() + c() + c();
}

function onCollision(a, b) {
    let aRect = a.getBoundingClientRect();
    let bRect = b.getBoundingClientRect();

    return !((aRect.top > bRect.bottom) || (aRect.bottom < bRect.top) ||
        (aRect.right < bRect.left) || (aRect.left > bRect.right));
}

function onGameOver() {
    player.start = false;
    gameStart.pause();
    gameOver.play();
    restartScreen.style.display = 'block';
    restartScreen.innerHTML = `Game Over <br> Press here to restart`;
}

function moveRoadLines() {
    let roadLines = document.querySelectorAll('.roadLines');
    roadLines.forEach((item) => {
        if (item.y >= 1000) {
            item.y -= 1050;
        }
        item.y += player.speed;
        item.style.top = item.y + "px";
    });
}

function moveEnemyCars(carElement) {
    let enemyCars = document.querySelectorAll('.enemyCar');
    enemyCars.forEach((item) => {

        if (onCollision(carElement, item)) {
            onGameOver();
        }
        if (item.y >= 1050) {
            item.y = -600;
            item.style.left = Math.floor(Math.random() * 350) + "px";
        }
        item.y += player.speed;
        item.style.top = item.y + "px";
    });
}

function gamePlay() {
    let carElement = document.querySelector('.car');
    let road = gameArea.getBoundingClientRect();

    if (player.start) {
        moveRoadLines();
        moveEnemyCars(carElement);

        if (keys.ArrowUp && player.y > (road.top + 70)) player.y -= player.speed;
        if (keys.ArrowDown && player.y < (road.bottom - 85)) player.y += player.speed;
        if (keys.ArrowLeft && player.x > 0) player.x -= player.speed;
        if (keys.ArrowRight && player.x < (road.width - 70)) player.x += player.speed;

        carElement.style.top = player.y + "px";
        carElement.style.left = player.x + "px";

        checkCollisions(carElement);
        updateScore();

        window.requestAnimationFrame(gamePlay);
    }
}

function checkCollisions(carElement) {
    let enemyCars = document.querySelectorAll('.enemyCar');

    enemyCars.forEach((item) => {
        if (onCollision(carElement, item)) {
            onGameOver();
        }

        if (item.y >= 1050) {
            item.y = -600;
            item.style.left = Math.floor(Math.random() * 350) + "px";

            player.score++;
        }
    });
}

function updateScore() {
    const ps = player.score;
    score.innerHTML = 'Score: ' + ps;
}

document.addEventListener('keydown', (e) => {
    e.preventDefault();

    const key = e.key.toLowerCase();

    if (key === 'w' || key === 'arrowup') keys.ArrowUp = true;
    if (key === 's' || key === 'arrowdown') keys.ArrowDown = true;
    if (key === 'a' || key === 'arrowleft') keys.ArrowLeft = true;
    if (key === 'd' || key === 'arrowright') keys.ArrowRight = true;
});

document.addEventListener('keyup', (e) => {
    e.preventDefault();

    const key = e.key.toLowerCase();

    if (key === 'w' || key === 'arrowup') keys.ArrowUp = false;
    if (key === 's' || key === 'arrowdown') keys.ArrowDown = false;
    if (key === 'a' || key === 'arrowleft') keys.ArrowLeft = false;
    if (key === 'd' || key === 'arrowright') keys.ArrowRight = false;
});

let joystick = {
    touching: false,
    originX: 0,
    originY: 0,
    currentX: 0,
    currentY: 0,
    deltaX: 0,
    deltaY: 0,
    angle: 0,
    distance: 0,
    sensitivity: 0.7
};

let swipe = {
    startTime: 0,
    startX: 0,
    startY: 0,
    velocityX: 0,
    velocityY: 0,
    threshold: 10,
    durationThreshold: 100
};

document.addEventListener('touchstart', handleTouchStart, { passive: false });
document.addEventListener('touchmove', (e) => handleTouchMove(e, gameArea.getBoundingClientRect()), { passive: false });
document.addEventListener('touchend', handleTouchEnd);

function handleTouchStart(e) {
    joystick.touching = true;
    joystick.originX = e.touches[0].clientX;
    joystick.originY = e.touches[0].clientY;

    swipe.startTime = performance.now();
    swipe.startX = joystick.originX;
    swipe.startY = joystick.originY;
    swipe.velocityX = 0;
    swipe.velocityY = 0;
}

function handleTouchMove(e, road) {
    if (joystick.touching) {
        e.preventDefault();

        joystick.currentX = e.touches[0].clientX;
        joystick.currentY = e.touches[0].clientY;

        player.x = joystick.currentX - gameArea.getBoundingClientRect().left - 35;
        player.y = joystick.currentY - gameArea.getBoundingClientRect().top - 35;

        player.x = Math.max(0, Math.min(player.x, road.width - 70));
        player.y = Math.max(road.top + 70, Math.min(player.y, road.bottom - 85));
    }

    if (joystick.touching) {
        window.requestAnimationFrame((timestamp) => handleTouchMove(e, road));
    }
}

function handleTouchEnd() {
    joystick.touching = false;
    joystick.deltaX = 0;
    joystick.deltaY = 0;

    player.x += swipe.velocityX * 0.05;
    player.y += swipe.velocityY * 0.05;

    keys.ArrowLeft = false;
    keys.ArrowRight = false;
    keys.ArrowUp = false;
    keys.ArrowDown = false;
}

// L O A D E R

document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
        document.getElementById("loading-spinner").style.display = "none";
    }, 2000);
});