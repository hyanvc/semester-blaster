const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

let imgData;

// ================== SET PIXEL ==================
function initPixels(){
    imgData = ctx.createImageData(canvas.width, canvas.height);
}
function setPixel(x,y,r=255,g=255,b=255,a=255){
    x=Math.floor(x); y=Math.floor(y);
    if(x<0||y<0||x>=canvas.width||y>=canvas.height) return;
    const i=(x+y*canvas.width)*4;
    imgData.data[i]=r;
    imgData.data[i+1]=g;
    imgData.data[i+2]=b;
    imgData.data[i+3]=a;
}
function renderPixels(){
    ctx.putImageData(imgData,0,0);
}

// ================== LINHA ==================
function drawLine(x0,y0,x1,y1){
    let dx=Math.abs(x1-x0), dy=Math.abs(y1-y0);
    let sx=x0<x1?1:-1, sy=y0<y1?1:-1;
    let err=dx-dy;

    while(true){
        setPixel(x0,y0,255,255,0);
        if(x0===x1 && y0===y1) break;
        let e2=2*err;
        if(e2>-dy){ err-=dy; x0+=sx;}
        if(e2<dx){ err+=dx; y0+=sy;}
    }
}

// ================== TEXTURA ==================
const playerImg = new Image();
playerImg.src = "./nave-uece.png";

// ================== INPUT ==================
let keys={};
document.addEventListener("keydown",e=>keys[e.key]=true);
document.addEventListener("keyup",e=>keys[e.key]=false);

// ================== GAME ==================
let player={x:400,y:550};
let shots=[];
let enemies=[];
let score=0;
let level=1;
let gameStarted=false,gameOver=false;

let currentPassword = "";

// ================== PASSWORD ==================
function generatePassword(){
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pass="";
    for(let i=0;i<5;i++){
        pass += chars[Math.floor(Math.random()*chars.length)];
    }

    currentPassword = pass;
    localStorage.setItem("gamePassword", pass);
}

// ================== MINIMAPA ==================
function mapToMini(x,y){
    return {
        x: 750 + (x/900)*120,
        y: 20 + (y/600)*120
    };
}

// ================== INIMIGOS ==================
function createEnemies(){
    const materias = ["GA","DIS","ORG","INTRO","CALC","FIS","ALG","POO"];

    enemies=[];
    for(let i=0;i<5;i++){
        for(let j=0;j<8;j++){
            enemies.push({
                x:80+j*70,
                y:50+i*50,
                alive:true,
                hp: level === 1 ? 3 : 5,
                name: materias[j % materias.length]
            });
        }
    }
}

// ================== START ==================
function startGame(){
    const input = document.getElementById("passwordInput")?.value;
    const savedPassword = localStorage.getItem("gamePassword");

    if(input && savedPassword && input === savedPassword){
        level = 2;
    } else {
        level = 1;
    }

    document.getElementById("menu").style.display="none";
    canvas.style.display="block";

    gameStarted=true;
    gameOver=false;
    score=0;

    createEnemies();
    initPixels();
}

function restartGame(){
    location.reload();
}

// ================== UPDATE ==================
function update(){
    if(!gameStarted||gameOver)return;

    if(keys["ArrowLeft"]) player.x-=5;
    if(keys["ArrowRight"]) player.x+=5;

    // tiro
    if(keys[" "]){
        shots.push({x:player.x, y:player.y - 40});
        keys[" "]=false;
    }

    shots.forEach(s=>s.y-=6);

    enemies.forEach(e=>{
        if(!e.alive)return;
        e.x+=Math.sin(Date.now()/500);
    });

    // colisão correta
    shots = shots.filter(s=>{
        let hit = false;

        enemies.forEach(e=>{
            if(e.alive &&
               s.x > e.x && s.x < e.x+40 &&
               s.y > e.y && s.y < e.y+40){

                e.hp--;
                hit = true;

                if(e.hp <= 0){
                    e.alive=false;
                    score++;
                }
            }
        });

        return !hit;
    });

    // progressão
    if(enemies.every(e=>!e.alive)){
        if(level === 1){
            generatePassword();
            alert("SEMESTRE 2 LIBERADO!\nPASSWORD: " + currentPassword);
            level = 2;
            createEnemies();
        } else {
            endGame();
        }
    }
}

// ================== DRAW ==================
function draw(){
    if(!gameStarted||gameOver)return;

    imgData.data.fill(0);

    // tiros
    shots.forEach(s=>{
        if(s.y > 0){
            drawLine(s.x,s.y,s.x,s.y-10);
        }
    });

    renderPixels();

    // inimigos
    enemies.forEach(e=>{
        if(e.alive){
            ctx.strokeStyle="white";
            ctx.strokeRect(e.x,e.y,40,40);

            ctx.fillStyle="white";
            ctx.font="10px Arial";
            ctx.fillText(e.name, e.x+3, e.y+15);

            ctx.fillStyle="red";
            ctx.fillRect(e.x, e.y+30, e.hp*10, 5);
        }
    });

    // player
    if (playerImg.complete && playerImg.naturalWidth !== 0) {
        ctx.drawImage(playerImg, player.x-40, player.y-40, 80, 80);
    }

    // HUD
    ctx.fillStyle="white";
    ctx.fillText("Score: "+score,10,20);
    ctx.fillText("Semestre: "+level,10,40);

    // ================== MINIMAPA ==================
    ctx.strokeStyle="white";
    ctx.strokeRect(750,20,120,120);

    enemies.forEach(e=>{
        if(e.alive){
            let m = mapToMini(e.x,e.y);
            ctx.fillStyle="white";
            ctx.fillRect(m.x,m.y,3,3);
        }
    });

    let p = mapToMini(player.x,player.y);
    ctx.fillStyle="red";
    ctx.fillRect(p.x,p.y,4,4);
}

// ================== LOOP ==================
function loop(){
    update();
    draw();
    requestAnimationFrame(loop);
}
loop();

// ================== GAME OVER ==================
function endGame(){
    gameOver=true;
    canvas.style.display="none";
    document.getElementById("gameover").style.display="block";
    document.getElementById("finalText").innerText="FORMADO!";
    document.getElementById("finalScore").innerText="Score: "+score;
}