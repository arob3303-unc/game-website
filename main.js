import Phaser from 'phaser';

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    physics: {
        default: 'arcade',  // Ensure arcade physics is enabled
        arcade: {
            gravity: { y: 0 },  // No gravity for top-down control
            debug: false        // Enable if you want to debug physics
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let tractor;
let cow;
let hayBales;

let cursors;
let wasdKeys;

let score = 0;
let hearts = 3;
let scoreText;
let heartImages = [];

let resetButton;


function preload () {
    this.load.image('hay', 'assets/hay_bale.png');
    this.load.image('grass', 'assets/grass.png');
    this.load.image('tractor', 'assets/tractor.png');
    this.load.image('cow', 'assets/cow.png');
    this.load.image('restart', 'assets/restart.png');
    this.load.image('fullHeart', 'assets/full_heart.png');
    this.load.image('emptyHeart', 'assets/empty_heart.png');
}

function create () {

    const grass = this.add.image(400,300,'grass');
    const restart = this.add.image(720,575,'restart');

    restart.setScale(.35);

    // haybales
    hayBales = this.physics.add.group();
    spawnHayBale();

    //cows
    cows = this.physics.add.group();
    spawnCow();

    // Score and hearts display
    scoreText = this.add.text(16, 16, '0', { fontSize: '32px', fill: '#000', fontStyle: 'bold' });
    for (let i = 0; i < hearts; i++) {
        let heart = this.add.image(770 - i * 40, 30, 'fullHeart');  // Add heart images at the top-right
        heart.setScale(.3);  // Scale the heart size
        heartImages.push(heart);  // Store heart image references in an array
    }

    // Reset button
    resetButton = restart
        .setInteractive()
        .on('pointerdown', () => resetGame.call(this));

    this.physics.world.setBounds(0, 0, 800, 600); // bounds for the game world
    tractor = this.physics.add.image(200, 300, 'tractor'); // player controls this image (object)
    tractor.setVisible(true);
    tractor.setDepth(1);
    tractor.setScale(0.43);
    tractor.setCollideWorldBounds(true);

    cursors = this.input.keyboard.createCursorKeys();

    wasdKeys = this.input.keyboard.addKeys({
        w: Phaser.Input.Keyboard.KeyCodes.W,
        a: Phaser.Input.Keyboard.KeyCodes.A,
        s: Phaser.Input.Keyboard.KeyCodes.S,
        d: Phaser.Input.Keyboard.KeyCodes.D
    });

    // Overlap detection (tractor with hay bales and cows)
    this.physics.add.overlap(tractor, hayBales, collectHay, null, this);
    this.physics.add.overlap(tractor, cows, hitCow, null, this);

}

function update () {
    // Reset the player's velocity (movement) before applying any new inputs
    tractor.setVelocity(0);

    // Arrow key controls
    if (cursors.left.isDown) {
        tractor.setVelocityX(-200); // Move left
    } else if (cursors.right.isDown) {
        tractor.setVelocityX(200); // Move right
    }

    if (cursors.up.isDown) {
        tractor.setVelocityY(-200); // Move up
    } else if (cursors.down.isDown) {
        tractor.setVelocityY(200); // Move down
    }

    // WASD controls
    if (wasdKeys.a.isDown) {
        tractor.setVelocityX(-200); // Move left
    } else if (wasdKeys.d.isDown) {
        tractor.setVelocityX(200); // Move right
    }

    if (wasdKeys.w.isDown) {
        tractor.setVelocityY(-200); // Move up
    } else if (wasdKeys.s.isDown) {
        tractor.setVelocityY(200); // Move down
    }
}

// Function to spawn a hay bale randomly within the game bounds
function spawnHayBale() {
    const x = Phaser.Math.Between(50, 750);  // Random x within bounds
    const y = Phaser.Math.Between(50, 550);  // Random y within bounds
    const hay = hayBales.create(x, y, 'hay');
    hay.setScale(0.2);
}

// Function to spawn a cow randomly within the game bounds
function spawnCow() {
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(50, 550);
    const cow = cows.create(x, y, 'cow');
    cow.setScale(0.15);
}

// Function to collect a hay bale
function collectHay(tractor, hay) {
    hay.destroy();  // Remove the collected hay bale
    score += 1;  // Increment score
    scoreText.setText('' + score);  // Update score display

    spawnHayBale();
    spawnCow();
}

// Function when the tractor hits a cow
function hitCow(tractor, cow) {
    hearts -= 1;  // Subtract a heart
    heartImages[hearts].destroy();
    heartImages.pop();
    cow.destroy();

    // Check if hearts are 0, then trigger game over logic
    if (hearts == 0) {
        this.physics.pause();  // Stop game movement
        tractor.setTint(0xff0000);  // Change tractor color to red to indicate game over
        this.add.text(400, 300, 'Game Over', { fontSize: '64px', fill: '#f00', fontStyle: 'bold' }).setOrigin(0.5);
    }
}

function resetGame() {
    score = 0;
    hearts = 3;
    scoreText.setText(score);

    heartImages.forEach(heart => heart.destroy()); // Destroy all current heart images
    heartImages = []; // Clear the array
    for (let i = 0; i < hearts; i++) {
        let heart = this.add.image(770 - i * 40, 30, 'fullHeart');  // Add heart images at the top-right
        heart.setScale(.3);  // Scale the heart size
        heartImages.push(heart);  // Store heart image references in an array
    }

    tractor.clearTint();  // Remove red tint from game over
    this.physics.resume();  // Resume game
    this.scene.restart();  // Restart the current scene
}
