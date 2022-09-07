//Extract context to allow interaction with canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

//Game SFX
let scoreSFX = new Audio("https://archive.org/download/classiccoin/classiccoin.wav");
let gameOverSFX = new Audio("https://archive.org/download/smb_gameover/smb_gameover.wav");
let jumpSFX = new Audio("https://archive.org/download/jump_20210424/jump.wav");

//Create horizontal line across width of canvas
function drawBackgroundLine() {
    ctx.beginPath();
    ctx.moveTo(0,400);
    ctx.lineTo(600,400);
    ctx.lineWidth = 1.9;
    ctx.strokeStyle = "black";
    ctx.stroke();
}

//Create player class
class Player {
    constructor(x,y,size,color){
        this.x=x;
        this.y=y;
        this.size=size;
        this.color=color;
    }

    //Draw function renders player to canvas
    draw() {
        ctx.fillstyle = this.color;
        ctx.fillRect(this.x,this.y,this.size,this.size);
    }
}

//Initialise instance of player class
let player = new Player(150,350,50,"blue");

//Animate function updates canvas to create illusion of movement
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0,0,canvas.width,canvas.height);

    //Canvas Logic
    drawBackgroundLine();
    //Foreground
    player.draw();
}

animate();


