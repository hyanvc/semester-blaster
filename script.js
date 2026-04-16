
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
let fillDone = false;

// ================== MINIMAPA ==================
const minimap = {
    x: canvas.width - 160,
    y: 20,
    width: 140,
    height: 100
};

// ================== VIEWPORT ==================

// janela do mundo (lógica)
const world = {
    xmin: 0,
    ymin: 0,
    xmax: 800,
    ymax: 600
};

// viewport (tela/canvas)
const viewport = {
    xmin: 0,
    ymin: 0,
    xmax: canvas.width,
    ymax: canvas.height
};


function drawMinimap() {

    // fundo
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(minimap.x, minimap.y, minimap.width, minimap.height);

    ctx.strokeStyle = "white";
    ctx.strokeRect(minimap.x, minimap.y, minimap.width, minimap.height);

    // escala mundo -> minimapa
    function toMinimap(x, y) {

    // clamp (limita dentro do mundo)
    x = Math.max(world.xmin, Math.min(world.xmax, x));
    y = Math.max(world.ymin, Math.min(world.ymax, y));

    return {
        x: minimap.x + (x - world.xmin) * minimap.width / (world.xmax - world.xmin),
        y: minimap.y + (y - world.ymin) * minimap.height / (world.ymax - world.ymin)
    };
}

    // PLAYER
    let p = toMinimap(player.x, player.y);
    ctx.fillStyle = "white";
    ctx.fillRect(p.x - 2, p.y - 2, 4, 4);

    // INIMIGOS
    enemies.forEach(e => {
        if (!e.alive) return;
        let pos = toMinimap(e.x, e.y);
        ctx.fillStyle = "red";
        ctx.fillRect(pos.x - 2, pos.y - 2, 4, 4);
    });

    // BOSS
    if (boss) {
        let b = toMinimap(boss.x + boss.size / 2, boss.y + boss.size / 2);
        ctx.fillStyle = "purple";
        ctx.fillRect(b.x - 3, b.y - 3, 6, 6);
    }

    // ================== HUD ABAIXO ==================
   ctx.fillStyle = "white";
ctx.font = "13px Arial";
ctx.textAlign = "left";

let hudX = minimap.x;
let hudY = minimap.y + minimap.height + 20;

ctx.fillText("Score: " + score, hudX, hudY);
ctx.fillText("Vida: " + playerLife, hudX, hudY + 18);
ctx.fillText("Moedas: " + coins, hudX, hudY + 36);

ctx.fillStyle = "rgba(0,0,0,0.6)";
ctx.fillRect(minimap.x - 5, hudY - 15, minimap.width + 10, 60);
}

// conversão mundo -> viewport
function worldToViewport(x, y) {
    const vx = viewport.xmin + (x - world.xmin) * (viewport.xmax - viewport.xmin) / (world.xmax - world.xmin);
    const vy = viewport.ymin + (y - world.ymin) * (viewport.ymax - viewport.ymin) / (world.ymax - world.ymin);

    return {
        x: vx,
        y: vy
    };
}

const materias = [
    "Alg", "Calc1", "Fisic1", "Calc3",
    "SO", "Grafos", "Automatos", "Comp",
    "Complex", "PE", "Proj", "Adm"
];

ctx.imageSmoothingEnabled = false;

let imgData;

// ================== NOVO ==================
let coins = 0;
let coinAnimations = [];
let fireCooldown = 0;
let fireRate = 40;
let shipLevel = 1;
let showingUpgrade = false;

// ================== IMAGENS ==================
const bossImg = new Image();
bossImg.src = "./Thanos.png";

// ================== PIXEL ==================
function initPixels() {
    imgData = ctx.createImageData(canvas.width, canvas.height);
}

function setPixel(x, y, r = 255, g = 255, b = 255, a = 255) {
    x = Math.floor(x);
    y = Math.floor(y);

    if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;

    const i = (x + y * canvas.width) * 4;

    imgData.data[i] = r;
    imgData.data[i + 1] = g;
    imgData.data[i + 2] = b;
    imgData.data[i + 3] = a;
}

// ================== FLOOD FILL ==================
function getPixel(x, y) {
    const i = (Math.floor(x) + Math.floor(y) * canvas.width) * 4;
    return [
        imgData.data[i],
        imgData.data[i + 1],
        imgData.data[i + 2],
        imgData.data[i + 3]
    ];
}

function colorsMatch(c1, c2) {
    return (
        c1[0] === c2[0] &&
        c1[1] === c2[1] &&
        c1[2] === c2[2] &&
        c1[3] === c2[3]
    );
}

function floodFill(x, y, fillColor = [0, 150, 255, 255]) {
    x = Math.floor(x);
    y = Math.floor(y);

    const targetColor = getPixel(x, y);
    if (colorsMatch(targetColor, fillColor)) return;

    const stack = [[x, y]];

    while (stack.length > 0) {
        const [cx, cy] = stack.pop();

        if (cx < 0 || cy < 0 || cx >= canvas.width || cy >= canvas.height)
            continue;

        const currentColor = getPixel(cx, cy);
        if (!colorsMatch(currentColor, targetColor)) continue;

        setPixel(cx, cy, ...fillColor);

        stack.push([cx + 1, cy]);
        stack.push([cx - 1, cy]);
        stack.push([cx, cy + 1]);
        stack.push([cx, cy - 1]);
    }
}



function renderPixels() {
    ctx.putImageData(imgData, 0, 0);
}

// ================== CLIPPING ==================
const INSIDE = 0;
const LEFT = 1;
const RIGHT = 2;
const BOTTOM = 4;
const TOP = 8;

const clipXmin = 0;
const clipYmin = 0;
const clipXmax = canvas.width;
const clipYmax = canvas.height;

function computeOutCode(x, y) {
    let code = INSIDE;

    if (x < clipXmin) code |= LEFT;
    else if (x > clipXmax) code |= RIGHT;

    if (y < clipYmin) code |= TOP;
    else if (y > clipYmax) code |= BOTTOM;

    return code;
}

function cohenSutherlandClip(x0, y0, x1, y1) {
    let outcode0 = computeOutCode(x0, y0);
    let outcode1 = computeOutCode(x1, y1);
    let accept = false;

    while (true) {
        if (!(outcode0 | outcode1)) {
            accept = true;
            break;
        } else if (outcode0 & outcode1) {
            break;
        } else {
            let x, y;
            let outcodeOut = outcode0 ? outcode0 : outcode1;

            if (outcodeOut & TOP) {
                x = x0 + (x1 - x0) * (clipYmin - y0) / (y1 - y0);
                y = clipYmin;
            } else if (outcodeOut & BOTTOM) {
                x = x0 + (x1 - x0) * (clipYmax - y0) / (y1 - y0);
                y = clipYmax;
            } else if (outcodeOut & RIGHT) {
                y = y0 + (y1 - y0) * (clipXmax - x0) / (x1 - x0);
                x = clipXmax;
            } else if (outcodeOut & LEFT) {
                y = y0 + (y1 - y0) * (clipXmin - x0) / (x1 - x0);
                x = clipXmin;
            }

            if (outcodeOut === outcode0) {
                x0 = x;
                y0 = y;
                outcode0 = computeOutCode(x0, y0);
            } else {
                x1 = x;
                y1 = y;
                outcode1 = computeOutCode(x1, y1);
            }
        }
    }

    if (accept) return [x0, y0, x1, y1];
    return null;
}

function drawLine(x0, y0, x1, y1, color = [255, 255, 0]) {
    const clipped = cohenSutherlandClip(x0, y0, x1, y1);
    if (!clipped) return;

    [x0, y0, x1, y1] = clipped;

    x0 |= 0;
    y0 |= 0;
    x1 |= 0;
    y1 |= 0;

    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);

    let sx = x0 < x1 ? 1 : -1;
    let sy = y0 < y1 ? 1 : -1;

    let err = dx - dy;

    while (true) {
        setPixel(x0, y0, ...color);

        if (x0 === x1 && y0 === y1) break;

        let e2 = 2 * err;

        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
        }

        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
    }
}

// ================== INPUT ==================
let keys = {};

document.addEventListener("keydown", e => keys[e.key] = true);
document.addEventListener("keyup", e => keys[e.key] = false);

// ================== GAME ==================
let player = { x: 400, y: 550 };
let shots = [];
let enemyShots = [];
let enemies = [];
let boss = null;

let score = 0;
let level = 1;

let gameStarted = false;
let gameOver = false;

let playerLife = 12;

// ================== PASSWORD ==================
function generatePassword() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pass = "";

    for (let i = 0; i < 5; i++) {
        pass += chars[Math.floor(Math.random() * chars.length)];
    }

    localStorage.setItem("gamePassword", pass);
}



// ================== INIMIGOS ==================
function createEnemies() {
    enemies = [];

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 4; j++) {
            enemies.push({
                x: 80 + j * 70,
                y: -Math.random() * 300,
                alive: true,
                hp: 1,
                cooldown: 0,
                speed: 0.5 + Math.random() * 0.3,
                nome: materias[Math.floor(Math.random() * materias.length)]
            });
        }
    }
}

// ================== BOSS ==================
function createBoss() {
    boss = {
        x: 250,
        y: 80,
        size: 200,
        hp: 150,
        maxHp: 150,
        cooldown: 0,
        direction: 1
    };
}

// ================== START ==================
function startGame() {
    document.getElementById("menu").style.display = "none";
    canvas.style.display = "block";

    gameStarted = true;
    gameOver = false;

    score = 0;
    coins = 0;
    shipLevel = 1;
    fireRate = 40;
    playerLife = 12;
    level = 1;

    createEnemies();
    initPixels();
}

// ================== UPDATE ==================
function update() {
    if (!gameStarted || gameOver || showingUpgrade) return;

    if (keys["ArrowLeft"]) player.x -= 5;
    if (keys["ArrowRight"]) player.x += 5;

    if (fireCooldown > 0) fireCooldown--;

    if (keys[" "]) {
        if (shipLevel === 4) {
            if (fireCooldown <= 0) {
                shots.push({ x: player.x, y: player.y - 40 });
                fireCooldown = 8;
            }
        } else {
            if (fireCooldown <= 0) {
                shots.push({ x: player.x, y: player.y - 40 });
                fireCooldown = fireRate;
            }
            keys[" "] = false;
        }
    }

    shots.forEach(s => s.y -= 6);

    // movimento inimigos
    enemies.forEach(e => {
        if (!e.alive) return;

        e.y += e.speed;

        let hit =
            e.x > player.x - 30 &&
            e.x < player.x + 30 &&
            e.y > player.y - 30 &&
            e.y < player.y + 30;

        if (hit) {
            playerLife--;

            e.y = -50;
            e.x = Math.random() * (canvas.width - 40);

            if (playerLife <= 0) {
                gameOver = true;
                alert("REPROVADO 💀");
            }
        }

        if (e.y > canvas.height + 20) {
            e.y = -50;
            e.x = Math.random() * (canvas.width - 40);
        }
    });

    // colisão inimigos
    shots = shots.filter(s => {
        let hit = false;

        enemies.forEach(e => {
            if (
                e.alive &&
                s.x > e.x && s.x < e.x + 40 &&
                s.y > e.y && s.y < e.y + 40
            ) {
                e.hp--;
                hit = true;

                if (e.hp <= 0) {
                    e.alive = false;
                    score++;
                    coins++;

                    coinAnimations.push({
    x: e.x,
    y: e.y,
    targetX: minimap.x + minimap.width / 2,
    targetY: minimap.y + minimap.height + 30,
    progress: 0
});
                }
            }
        });

        return !hit;
    });

    // tiros inimigos
    enemyShots.forEach(s => s.y += 2);

    enemyShots = enemyShots.filter(s => {
        let hit =
            s.x > player.x - 40 &&
            s.x < player.x + 40 &&
            s.y > player.y - 40 &&
            s.y < player.y + 40;

        if (hit) {
            playerLife--;

            if (playerLife <= 0) {
                gameOver = true;
                alert("REPROVADO 💀");
            }
        }

        return !hit && s.y < canvas.height;
    });

    // boss
    if (level === 3 && boss) {
        boss.x += boss.direction * 2;

        if (boss.x <= 50 || boss.x + boss.size >= canvas.width - 50) {
            boss.direction *= -1;
        }

        boss.cooldown--;

        if (boss.cooldown <= 0) {
            enemyShots.push({
                x: boss.x + boss.size / 2,
                y: boss.y + boss.size
            });
            boss.cooldown = 40;
        }

        shots = shots.filter(s => {
            let hit =
                s.x > boss.x &&
                s.x < boss.x + boss.size &&
                s.y > boss.y &&
                s.y < boss.y + boss.size;

            if (hit) boss.hp--;
            return !hit;
        });

        if (boss.hp <= 0) {
            alert("FORMADO 🎓");
            gameOver = true;
        }
    }

    // progressão
    if (level !== 3 && enemies.every(e => !e.alive)) {
        showUpgradeMenu();

        if (level === 1) {
            generatePassword();
            level = 2;
            createEnemies();
        } else if (level === 2) {
            level = 3;
            createBoss();
        }
    }
}

// ================== UPGRADE ==================
function showUpgradeMenu() {
    showingUpgrade = true;

    setTimeout(() => {
        let escolha = prompt(
            "UPGRADE:\n" +
            "1 - Nave 2 (10 moedas)\n" +
            "2 - Nave 3 (20 moedas)\n" +
            "3 - Nave 4 (30 moedas)\n" +
            "0 - Continuar"
        );

        if (escolha === "1" && coins >= 10) {
            shipLevel = 2;
            fireRate = 25;
            coins -= 10;
        } else if (escolha === "2" && coins >= 20) {
            shipLevel = 3;
            fireRate = 10;
            coins -= 20;
        } else if (escolha === "3" && coins >= 30) {
            shipLevel = 4;
            coins -= 30;
        }

        showingUpgrade = false;
    }, 100);
}

// ================== NAVE ==================
function drawEnemyShip(x, y, nome) {
    ctx.save();
    ctx.translate(x, y);

    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.lineTo(15, -10);
    ctx.lineTo(-15, -10);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "orange";
    ctx.fillRect(-20, 0, 10, 8);
    ctx.fillRect(10, 0, 10, 8);

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    ctx.fillStyle = "white";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";

    ctx.fillText("nav", x, y - 20);
    ctx.fillText("(" + nome + ")", x, y - 8);
}

function drawShip() {
    ctx.fillStyle = "white";

    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.lineTo(20, 20);
    ctx.lineTo(-20, 20);
    ctx.closePath();
    ctx.fill();

    if (shipLevel >= 2) {
        ctx.fillStyle = "cyan";
        ctx.fillRect(-30, 0, 10, 25);
        ctx.fillRect(20, 0, 10, 25);
    }

    if (shipLevel >= 3) {
        ctx.fillStyle = "lime";
        ctx.beginPath();
        ctx.moveTo(0, -40);
        ctx.lineTo(10, -20);
        ctx.lineTo(-10, -20);
        ctx.fill();
    }

    if (shipLevel === 4) {
        ctx.fillStyle = "orange";
        ctx.fillRect(-5, 20, 10, 30);

        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillRect(-40, 10, 15, 10);
        ctx.fillRect(25, 10, 15, 10);
    }
}

// ================== DRAW ==================
function draw() {
    if (!gameStarted || gameOver) return;

    imgData.data.fill(0);

    shots.forEach(s => {
let p1 = worldToViewport(s.x, s.y);
let p2 = worldToViewport(s.x, s.y - 10);

drawLine(p1.x, p1.y, p2.x, p2.y, [255, 255, 0]);    });

   enemyShots.forEach(s => {
    let p1 = worldToViewport(s.x, s.y);
    let p2 = worldToViewport(s.x, s.y + 10);

    drawLine(p1.x, p1.y, p2.x, p2.y, [255, 0, 0]);
});
    renderPixels();

    if (level !== 3) {
        enemies.forEach(e => {
            if (e.alive) {
let p = worldToViewport(e.x + 20, e.y + 20);
drawEnemyShip(p.x, p.y, e.nome);            }
        });
    }

    // moedas
    coinAnimations.forEach(c => {
        c.progress += 0.05;
        c.x += (c.targetX - c.x) * 0.1;
        c.y += (c.targetY - c.y) * 0.1;

        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(c.x, c.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    coinAnimations = coinAnimations.filter(c => c.progress < 1);

    // boss
    if (level === 3 && boss) {
        if (bossImg.complete) {
let p = worldToViewport(boss.x, boss.y);

ctx.drawImage(
    bossImg,
    p.x,
    p.y,
    boss.size,
    boss.size
);        }

        ctx.fillStyle = "red";
      let pBar = worldToViewport(boss.x, boss.y - 20);

ctx.fillRect(
    pBar.x,
    pBar.y,
    (boss.hp / boss.maxHp) * boss.size,
    10
);
    }

    // player
    ctx.save();
let p = worldToViewport(player.x, player.y);
ctx.translate(p.x, p.y);    drawShip();
    ctx.restore();
    
    if (!fillDone) {
    let fillPoint = worldToViewport(player.x, player.y - 5);
    floodFill(fillPoint.x, fillPoint.y, [0, 100, 255, 255]);
    fillDone = true;
}

    drawMinimap();

}

// ================== LOOP ==================
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();