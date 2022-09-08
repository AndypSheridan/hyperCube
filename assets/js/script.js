//Extract context to allow interaction with canvas
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

//Game SFX
let scoreSFX = new Audio("https://archive.org/download/classiccoin/classiccoin.wav");
let gameOverSFX = new Audio("https://archive.org/download/smb_gameover/smb_gameover.wav");
let jumpSFX = new Audio("https://archive.org/download/jump_20210424/jump.wav");

//Used for 'setInterval'
let presetTime = 1000;
//Blocks can speed up when player has scored points at intervals of 10
let enemySpeed = 5;
let score = 0;
//Used to see if user has scored another 10 points or not
let scoreIncrement = 0;
//So cube doesn't score more than one point at a time!
let canScore = true;

//Create horizontal line across width of canvas
function drawBackgroundLine() {
    ctx.beginPath();
    ctx.moveTo(0,400);
    ctx.lineTo(600,400);
    ctx.lineWidth = 1.9;
    ctx.strokeStyle = "black";
    ctx.stroke();
}

function drawScore() {
    ctx.font = "80px Arial";
    ctx.fillStyle = "black";
    let scoreString = score.toString();
    let xOffset = ((scoreString.length - 1) * 20);
    ctx.fillText(scoreString, 280 - xOffset, 100);
}

//Both Min and Max are included in this random generation function
function getRandomNumber(min,max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomNumberInterval(timeInterval) {
    let returnTime = timeInterval;
    if(Math.random() < 0.5) {
        returnTime += getRandomNumber(presetTime / 3, presetTime * 1.5);
    }else{
        returnTime -= getRandomNumber(presetTime / 5, presetTime / 2);
    }
    return returnTime;
}

//Create player class
class Player {
    constructor(x,y,size,color){
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        //Jump configuration
        this.jumpHeight = 12;
        this.shouldJump = false;
        this.jumpCounter = 0;
        this.jumpUp = true;
        //Related to spin animation
        this.spin = 0;
        //Get a perfect 90 degree rotation
        this.spinIncrement = 90 / 32;
    }

    rotation() {
        let offsetXPosition = this.x + (this.size / 2);
        let offsetYPosition = this.y + (this.size / 2);
        ctx.translate(offsetXPosition,offsetYPosition);
        //Division is there to convert degrees into radians
        ctx.rotate(this.spin * Math.PI / 180);
        ctx.rotate(this.spinIncrement * Math.PI / 180);
        ctx.translate(-offsetXPosition,-offsetYPosition);
        //4.5 because 90 /20 (number of iterations in jump) is 4.5
        this.spin += this.spinIncrement;
    }

    counterRotation() {
        //This rotates the cube back to its origin so that it can be moved upwards properly
        let offsetXPosition = this.x + (this.size / 2);
        let offsetYPosition = this.y + (this.size / 2);
        ctx.translate(offsetXPosition,offsetYPosition);
        ctx.rotate(-this.spin * Math.PI / 180);
        ctx.translate(-offsetXPosition,-offsetYPosition);
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
            this.rotation();
            //End the cycle
            if(this.jumpCounter >= 32){
                this.counterRotation();
                this.spin = 0;
                this.shouldJump = false;
            }
        }
    }

    //Draw function renders player to canvas
    draw() {
        this.jump();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x,this.y,this.size,this.size);
        //Reset the rotation so the rotation of other elements is unchanged
        if(this.shouldJump) this.counterRotation();
    }
}

//Initialise instance of player class
let player = new Player(150,350,50,"black");

class AvoidBlock {
    constructor(size, speed){
        this.x = canvas.width + size;
        this.y = 400 - size;
        this.size = size;
        this.color = "red";
        this.slideSpeed = speed;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x,this.y,this.size,this.size);
    }
    slide() {
        this.draw();
        this.x -= this.slideSpeed;
    }
}

let arrayBlocks = [];

//Auto generate blocks
function generateBlocks() {
    let timeDelay = randomNumberInterval(presetTime);
    arrayBlocks.push(new AvoidBlock(50, enemySpeed));

    setTimeout(generateBlocks, timeDelay);
}

//Returns true if colliding
function squaresColliding(player,block){
    let s1 = Object.assign(Object.create(Object.getPrototypeOf(player)), player);
    let s2 = Object.assign(Object.create(Object.getPrototypeOf(block)), block);
    //Don't need pixel perfect collision detection
    s2.size = s2.size - 10;
    s2.x = s2.x + 10;
    s2.y = s2.y + 10;
    return !(
        s1.x>s2.x+s2.size || //S1 is to the right of S2
        s1.x+s1.size<s2.x || //S1 is to the left of S2
        s1.y>s2.y+s2.size || //S1 is below S2
        s1.y+s1.size<s2.y //S1 is above S2
    )
}

//Returns true if player is past the block
function isPastBlock(player, block) {
    return(
        player.x + (player.size / 2) > block.x + (block.size / 4) &&
        player.x + (player.size / 2) < block.x + (block.size / 4) * 3
    )
}

function shouldIncreaseSpeed() {
    //Check to see if game speed should be increased
    if(scoreIncrement + 10 === score){
        scoreIncrement = score;
        enemySpeed++;

        //Update speed of existing blocks
        arrayBlocks.forEach(block => {
            block.slideSpeed = enemySpeed;
        });
    }
}

let animationId = null;
//Animate function updates canvas to create illusion of movement
function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    //Canvas Logic
    drawBackgroundLine();
    drawScore();
    //Foreground
    player.draw();

    arrayBlocks.forEach((arrayBlock, index) => {
        arrayBlock.slide();
        //End game as player and enemy have collided
        if(squaresColliding(player, arrayBlock)){
            gameOverSFX.play();

            cancelAnimationFrame(animationId);
        }
        //User should score a point if this is the case
        if(isPastBlock(player, arrayBlock) && canScore){
            canScore = false;
            scoreSFX.currentTime = 0;
            scoreSFX.play();
            score++;
        }
        //Delete block that has left the screen
        if((arrayBlock.x + arrayBlock.size) <= 0){
            setTimeout(() => {
                arrayBlocks.splice(index, 1);
            }, 0)
        }
    })
}

animate();
setTimeout(() => {
    generateBlocks();
}, randomNumberInterval(presetTime))

//Event Listeners
addEventListener("keydown", e => {
    if(e.code === "Space"){
        if(!player.shouldJump){
            jumpSFX.play();
            player.jumpCounter = 0;
            player.shouldJump = true;
            canScore = true;
        }
    }
})
