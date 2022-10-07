const musicButtons = document.getElementsByClassName("musicToggle");
const cardScore = document.getElementById("card-score");
const myAudio = document.getElementById("myAudio");
const splash = document.querySelector('.splash');
const canvas = document.getElementById("canvas");
const card = document.getElementById("card");
const ctx = canvas.getContext("2d");
let highscores = JSON.parse(localStorage.getItem("highscores")) || [];
let scoreList = document.querySelector('.scoretable');
let presetTime = 1000;
let scoreIncrement = 0;
let isPlaying = false;
let canScore = true;
let enemySpeed = 5;
let timeleft = 20;
let score = 0;

/**
 * Game SFX
 * See credits for further information
 */
let jumpSFX = new Audio("https://archive.org/download/jump_20210424/jump.wav");
jumpSFX.volume = 0;

/**
 * Game Music
 * Toggle music on and off
 */
for(let button of musicButtons) {
    button.addEventListener('touchstart', () => {
        toggleMusic();
    });

    button.addEventListener('click', () => {
        if(!navigator.userAgentData.mobile) {
            toggleMusic();
        }
    });
}
function toggleMusic() {
    isPlaying ? myAudio.pause() : myAudio.play();
}

myAudio.onplaying = function() {
    isPlaying = true;
    jumpSFX.volume = 0.3;
};

myAudio.onpause = function() {
    isPlaying = false;
    jumpSFX.volume = 0;
};

/**
 * Sets the splash screen to display-none after 20s
 */
document.addEventListener('DOMContentLoaded', (e)=>{
    setTimeout(()=>{
        splash.classList.add('display-none');
    }, 20000);
});

/**
 * Creates countdown timer for splash screen
 */
let downloadTimer = setInterval(function() {
    if(timeleft <= 0) {
        clearInterval(downloadTimer);
        document.getElementById("countdown").innerHTML = "Finished";
    } else {
        document.getElementById("countdown").innerHTML = "Game Starts in " + timeleft;
    }
    timeleft -= 1;    
    }, 1000);

/**
 * Adds click event listener to skip button on splash screen
 */
let skipIntro = document.getElementById('skip-intro');
skipIntro.addEventListener('click', function(e) {
    if(e.type === 'click') {
       splash.style.display = "none";
    }
});    


/**
 * Leaderboard code
 */  
function checkScore() {
    let worstScore = 0;
    if (highscores.length > 4) {
      worstScore = highscores[highscores.length - 1].score;
    }
    if (score > worstScore) {
        let clicker = window.prompt(`${score} – Top score! What's your name?`);
        if (clicker === null){
            clicker = "Anonymous";
        }
        highscores.push({score, clicker});
        
    }
    highscores.sort((a, b) => a.score > b.score ? -1 : 1);
    if (highscores.length > 5) {
        highscores.pop();
      }
      populateTable();
      localStorage.setItem('highscores', JSON.stringify(highscores));
}  

/**
 * Populate high score table
 */
function populateTable() {
    scoreList.innerHTML = highscores.map((row) => {
      return `<tr><td>${row.clicker}</td><td>${row.score}</tr>`;
    }).join('');
  }

/**
 * Function to clear leaderboard scores
 */
function clearScores() {
    highscores.splice(0, highscores.length);
    localStorage.setItem('highscores', JSON.stringify(highscores));
    populateTable();
  }


/**
 *  Starts game
 */
function startGame() {
    player = new Player(150,390,50,"#DADBD0");
    arrayBlocks = [];
    score = 0;
    scoreIncrement = 0;
    enemySpeed = 5;
    canScore = true;
    presetTime = 1200;
}

/**
 * Restarts game - called from DOM
 */
function restartGame(button){
    card.style.display = "none";
    button.blur();
    startGame();
    requestAnimationFrame(animate);
}

/**
 * Creates horizontal line across width of canvas
 * Code based on tutorial by Qixotl LFC on youtube. Full details in credits in readme.md
 */
function drawBackgroundLine() {
    ctx.beginPath();
    ctx.moveTo(0,440);
    ctx.lineTo(600,440);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "transparent";
    ctx.stroke();
}
/**
 * Draws score to canvas
 * Code based on tutorial by Qixotl LFC on youtube. Full details in credits in readme.md
 */
function drawScore() {
    ctx.font = "64px 'IBM Plex Mono'";
    ctx.fillStyle = "#DADBD0";
    let scoreString = score.toString();
    let xOffset = ((scoreString.length - 1) * 20);
    ctx.fillText(scoreString, 280 - xOffset, 100);
}

/**
 * Generates random numbers
 */
function getRandomNumber(min,max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Sets random interval for obstacles
 */
function randomNumberInterval(timeInterval) {
    let returnTime = timeInterval;
    if(Math.random() < 0.5) {
        returnTime += getRandomNumber(presetTime / 3, presetTime * 1.5);
    }else{
        returnTime -= getRandomNumber(presetTime / 5, presetTime / 2);
    }
    return returnTime;
}

/**
 * Creates player class
 * Code based on tutorial by Qixotl LFC on youtube. Full details in credits in readme.md
 */
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
        //Get a perfect 360 degree rotation
        this.spinIncrement = 360 / 32;
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

    /**
     * Draw function renders player to canvas
     */
    draw() {
        this.jump();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x,this.y,this.size,this.size);
        //Reset the rotation so the rotation of other elements is unchanged
        if(this.shouldJump) this.counterRotation();
    }
}

/**
 * Initialises instance of player class
 */
let player = new Player(150,390,50,"#DADBD0");

/**
 * Create obstacle class
 * Code based on tutorial by Qixotl LFC on youtube. Full details in credits in readme.md
 */
class AvoidBlock {
    constructor(size, speed){
        this.x = canvas.width + size;
        this.y = 440 - size;
        this.size = size;
        this.color = "#000";
        this.slideSpeed = speed;
    }
    //Draw blocks to canvas
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

/**
 * Auto generates blocks
 */
function generateBlocks() {
    let timeDelay = randomNumberInterval(presetTime);
    arrayBlocks.push(new AvoidBlock(50, enemySpeed));

    setTimeout(generateBlocks, timeDelay);
}

/**
 * Collision detection
 * Code based on tutorial by Qixotl LFC on youtube. Full details in credits in readme.md
 */
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
    );
}

/**
 * Determines if player is past the block
 * Code based on tutorial by Qixotl LFC on youtube. Full details in credits in readme.md
 */
function isPastBlock(player, block) {
    return(
        player.x + (player.size / 2) > block.x + (block.size / 4) &&
        player.x + (player.size / 2) < block.x + (block.size / 4) * 3
    );
}

function shouldIncreaseSpeed() {
    //Check to see if game speed should be increased
    if(scoreIncrement + 10 === score){
        scoreIncrement = score;
        enemySpeed++;
        presetTime >= 100 ? presetTime -= 100 : presetTime = presetTime / 2;
        //Update speed of existing blocks
        arrayBlocks.forEach(block => {
            block.slideSpeed = enemySpeed;
        });
    }
}

let animationId = null;

/**
 * Animate function updates canvas to create illusion of movement
 * Code based on tutorial by Qixotl LFC on youtube. Full details in credits in readme.md
 */
function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    //Canvas Logic
    drawBackgroundLine();
    drawScore();
    //Foreground
    player.draw();

    //Check to see if game speed should be increased
    shouldIncreaseSpeed();

    arrayBlocks.forEach((arrayBlock, index) => {
        arrayBlock.slide();
        //End game as player and enemy have collided
        if(squaresColliding(player, arrayBlock)){
            cardScore.textContent = score;
            card.style.display = "block";
            checkScore();

            cancelAnimationFrame(animationId);
        }
        //User should score a point if this is the case
        if(isPastBlock(player, arrayBlock) && canScore){
            canScore = false;
            score++;
        }
        //Delete block that has left the screen
        if((arrayBlock.x + arrayBlock.size) <= 0){
            setTimeout(() => {
                arrayBlocks.splice(index, 1);
            }, 0);
        }
    });
}

animate();
setTimeout(() => {
    generateBlocks();
}, randomNumberInterval(presetTime));

/**
 * Event listeners
 */
addEventListener("keydown", e => {
    if(e.code === "Space"){
        if(!player.shouldJump){
            jumpSFX.play();
            player.jumpCounter = 0;
            player.shouldJump = true;
            canScore = true;
        }
    }
});

addEventListener("touchstart", e => {
    if(e.type === "touchstart"){
        e.preventDefault();
        if(!player.shouldJump){
            player.shouldJump = true;
            canScore = true;
            if (isPlaying) {
                jumpSFX.play();
            }
            player.jumpCounter = 0;
        }
    }
});
