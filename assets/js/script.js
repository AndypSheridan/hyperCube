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
        //Jump configuration
        this.jumpHeight = 12;
        this.shouldJump = false;
        this.jumpCounter = 0;
    }

    /*
    *Create jump animation
    *14 frames up, 4 frames stationary, 14 frames down
    */
    jump() {
        if(this.shouldJump){
            this.jumpCounter++;
            if(this.jumpCounter < 15){
                //Go up
                this.y -= this.jumpHeight;
            }else if(this.jumpCounter > 14 && this.jumpCounter < 19){
                this.y += 0;
            }else if(this.jumpCounter < 33){
                //Come back down
                this.y += this.jumpHeight;
            }

            //End the cycle
            if(this.jumpCounter >= 32){
                this.shouldJump = false;
            }
        }
    }

    //Draw function renders player to canvas
    draw() {
        this.jump();
        ctx.fillstyle = this.color;
        ctx.fillRect(this.x,this.y,this.size,this.size);
    }
}

//Initialise instance of player class
let player = new Player(150,350,50,"black");

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


