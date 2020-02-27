"use strict";

function make_main_game_state( game )
{
    /*
    function preload() {
        game.load.image(     'cat', 'assets/png/cat/Idle (1).png' );
        game.load.image(     'catJump', 'assets/png/cat/Jump (3).png' );
        game.load.image(     'catSlide', 'assets/png/cat/Slide (1).png' );
        game.load.image(     'catDead', 'assets/png/cat/Dead (2).png' );
        game.load.image(     'catFall', 'assets/png/dog/Dead (2).png' );
        game.load.image(     'leftWall', 'assets/leftWall.png' );
        game.load.image(     'rightWall', 'assets/rightWall.png' );
        game.load.image(     'rightSpike', 'assets/rightSpike.png' );
        game.load.image(     'leftSpike', 'assets/leftSpike.png' );
        game.load.image(     'ground', 'assets/ground.png' );
    }
    */
    var background;
    var player;
    var timer;
    var runtime = 0;
    var score = 0;
    var gravModifier = 0;
    var style = { font: "25px Impact", fill: "#963694", align: "center" };
    var scoreText;
    var hpText;
    var gamePlaying = false;
    var meow;
    var jump;
    var music = null;

    function updateRuntime() {
        runtime++;
        score += 10;
        scoreText.setText("Score: " + score+"", true);
        console.log(runtime);
    }


    function create() {
        meow = game.add.audio('catMeow');
        jump = game.add.audio('jump');
        music = game.add.audio('titleMusic');
        music.play();
        background = game.add.tileSprite(0, 0, 400, 800, 'background');
        scoreText = game.add.text( 64, 16, "Score: " + score, style );
        var text = game.add.text(64, 50, "Hold left to start!", style);

        hpText = game.add.text(64,32, "HP: 3",style);
        //this.text = game.add.text( game.world.centerX/2, game.world.centerY, "Press UP to jump onto one\n of the walls!", style );
        this.jumpH = -700;
        this.bounceD = 400;
        this.MAX_SPEED = 500; // pixels/second
        this.ACCELERATION = 1500; // pixels/second/second
        this.DRAG = 600; // pixels/second
        this.GRAVITY = 2000; // pixels/second/second
        this.JUMP_SPEED = -1000;
        // Create a sprite at the center of the screen using the 'logo' image.
        player = game.add.sprite( 48, 200, 'cat' );
        player.anchor.setTo(.5,.5);
        player.scale.set(0.15);
        player.maxHealth = 3;
        player.health = 3;

        timer = game.time.create(false);
        timer.loop(5000,updateRuntime,this);
        timer.loop(3000,spawnSpike,this);
        timer.loop(2500,spawnCat,this);
        // Turn on the arcade physics engine for this sprite.

        game.physics.enable( player, Phaser.Physics.ARCADE );

        game.physics.arcade.gravity.y = this.GRAVITY;
        // Make it bounce off of the world bounds.
        player.body.collideWorldBounds = true;
        player.body.maxVelocity.setTo(this.MAX_SPEED, this.MAX_SPEED * 10);
        player.body.drag.setTo(this.DRAG, 0);

        this.leftWall = game.add.group();
        this.rightWall = game.add.group();
        for(var y = 0; y < game.height; y += 32) {
            var leftBlock = game.add.sprite(0, y, 'leftWall');
            var rightBlock = game.add.sprite(game.width - 32, y, 'rightWall');
            game.physics.enable(rightBlock, Phaser.Physics.ARCADE);
            game.physics.enable(leftBlock, Phaser.Physics.ARCADE);
            leftBlock.body.width = 30;
            rightBlock.body.width = 10;
            leftBlock.body.checkCollision.up = false;
            rightBlock.body.checkCollision.up = false;
            leftBlock.body.checkCollision.down = false;
            rightBlock.body.checkCollision.down = false;
            leftBlock.body.immovable = true;
            rightBlock.body.immovable = true;
            rightBlock.body.allowGravity = false;
            leftBlock.body.allowGravity = false;
            this.leftWall.add(leftBlock);
            this.rightWall.add(rightBlock);
        }

        /*
        this.ground = game.add.group();
        for(var x = 0; x < this.game.width; x += 32) {
            var groundBlock = game.add.sprite(x, this.game.height - 32, 'ground');
            game.physics.enable(groundBlock, Phaser.Physics.ARCADE);
            groundBlock.body.immovable = true;
            groundBlock.body.allowGravity = false;
            this.ground.add(groundBlock);
        }
        */

        this.spikes = game.add.group();
        this.cats = game.add.group();
        game.input.keyboard.addKeyCapture([
            Phaser.Keyboard.LEFT,
            Phaser.Keyboard.RIGHT,
            Phaser.Keyboard.UP,
            Phaser.Keyboard.DOWN
        ]);

        timer.start();
    }

    function update() {
        if(player.health === 0){
            quitGame();
        }
        if(player.body.checkWorldBounds()){
            quitGame();
        }
        background.tilePosition.y += 2;
        game.physics.arcade.collide(player,this.ground);
        game.physics.arcade.collide(player,this.leftWall);
        game.physics.arcade.collide(player,this.rightWall);
        game.physics.arcade.collide(player, this.spikes, spikeCallback, null, this);
        game.physics.arcade.collide(player, this.cats, catCallback, null, this);

        if(this.input.keyboard.isDown(Phaser.Keyboard.LEFT)){
            if(!player.body.touching.down && (player.body.touching.right || player.body.touching.left)){
                player.body.velocity.x = this.bounceD;
                player.body.velocity.y = this.jumpH;
                jump.play();
            }
            else{
                player.body.acceleration.x = -1500;
            }
            if(player.scale.x > 0) {
                player.scale.x *= -1;
            }
        }
        else if(this.input.keyboard.isDown(Phaser.Keyboard.RIGHT)){
            if(!player.body.touching.down && (player.body.touching.left || player.body.touching.right)){
                player.body.velocity.x = -this.bounceD;
                player.body.velocity.y = this.jumpH;
                jump.play();
            }
            else{
                player.body.acceleration.x = 1500;
            }
            if(player.scale.x < 0) {
                player.scale.x *= -1;
            }
        }
        else{
            player.body.acceleration.x = 0;
        }

        if(this.input.keyboard.isDown(Phaser.Keyboard.UP) && (player.body.touching.down || player.body.touching.left || player.body.touching.right)){
            player.body.velocity.y = this.jumpH;
            jump.play();
            if(player.body.touching.left ) {
                player.body.velocity.x = this.bounceD;
            }
            else if(player.body.touching.right){
                player.body.velocity.x = -this.bounceD;
            }
        }

        if(player.body.touching.right && !player.body.touching.down){
            player.body.velocity.x = -this.bounceD;
            player.body.velocity.y -= 50;
        }
        if(player.body.touching.left && !player.body.touching.down ){
            player.body.velocity.x = this.bounceD;
            player.body.velocity.y -= 50;
        }
    }

    function spawnSpike() {
        var coin = Math.floor(Math.random() * 2) + 1;
        var spike;
        if(coin === 1){
            spike = game.add.sprite(16,32, 'leftSpike');
            spike.anchor.setTo(0.25,0.5);
        }
        else{
            spike = game.add.sprite(game.width-16,32, 'rightSpike');
            spike.anchor.setTo(0.75,0.5);
        }
        game.physics.enable(spike, Phaser.Physics.ARCADE);
        spike.body.allowGravity = false;
        spike.body.velocity.y = 200;
        spike.checkWorldBounds = true;
        spike.outOfBoundsKill = true;
        this.spikes.add(spike);
    }

    function spawnCat(){
        var xpos = [32, 75, 118, 161, 204, 247, 290];
        var pos =  Math.floor(Math.random() * 6);
        var cat = game.add.sprite(xpos[pos],0, 'catFall');
        game.physics.enable(cat);
        cat.body.allowGravity = false;
        cat.body.velocity.y = 100;
        cat.body.acceleration.y  = 20;
        cat.checkWorldBounds = true;
        cat.outOfBoundsKill = true;
        meow.play();
        this.cats.add(cat);

    }
    function spikeCallback() {
        player.damage(3);
        quitGame();
    }

    function catCallback(player, cat) {
        player.damage(1);
        cat.kill();
        hpText.setText("HP: "+ player.health,true);
    }

    function quitGame() {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        music.stop();
        game.state.start('gameover');

    }

    return { "create": create, "update": update };
}

function makeGameOver( game ) {

    function quitGame() {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        game.state.start('menu');

    }

    return {

        create: function () {

            //	We've already preloaded our assets, so let's kick right into the Main Menu itself.
            //	Here all we're doing is playing some music and adding a picture and button
            //	Naturally I expect you to do something significantly better :)


            game.add.sprite(0, 0, 'titlePage');
            var cat = game.add.sprite(100, 450, 'cat');
            cat.scale.setTo(0.5);

            var text = game.add.text( 100, 300, 'Game Over!\nPress UP to play again!');

            game.input.keyboard.addKeyCapture([
                Phaser.Keyboard.LEFT,
                Phaser.Keyboard.RIGHT,
                Phaser.Keyboard.UP,
                Phaser.Keyboard.DOWN
            ]);
        },

        update: function () {

            if(this.input.keyboard.isDown(Phaser.Keyboard.UP)){
                quitGame();
            }
        }

    };
};

function makeMainMenu( game ) {

    var music = null;
    var playButton = null;

    function startGame(pointer) {

        //	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
        music.stop();

        //	And start the actual game
        game.state.start('main');

    }

    return {

        create: function () {

            //	We've already preloaded our assets, so let's kick right into the Main Menu itself.
            //	Here all we're doing is playing some music and adding a picture and button
            //	Naturally I expect you to do something significantly better :)

            music = game.add.audio('titleMusic');
            music.play();

            game.add.sprite(0, 0, 'titlePage');
            var cat = game.add.sprite(100, 450, 'cat');
            cat.scale.setTo(0.5);

            playButton = game.add.button( 100, 300, 'playButton', startGame, null, 'over', 'out', 'down');

        },

        update: function () {

            //	Do some nice funky main menu effect here

        }

    };
};

function makePreloader( game ) {

    var background = null;
    var preloadBar = null;

    var ready = false;

    return {

        preload: function () {

            //	These are the assets we loaded in Boot.js
            //	A nice sparkly background and a loading progress bar
            background = game.add.sprite(0, 0, 'preloaderBackground');
            preloadBar = game.add.sprite(100, 300, 'preloaderBar');

            //	This sets the preloadBar sprite as a loader sprite.
            //	What that does is automatically crop the sprite from 0 to full-width
            //	as the files below are loaded in.
            game.load.setPreloadSprite(preloadBar);

            //	Here we load the rest of the assets our game needs.
            //	As this is just a Project Template I've not provided these assets, swap them for your own.
            game.load.image('titlePage', 'assets/title.jpg');
            game.load.atlas('playButton', 'assets/play_button.png', 'assets/play_button.json');
            game.load.audio('titleMusic', ['assets/Nyan Cat [Piano Cover].mp3']);
            game.load.audio('catMeow', ['assets/meow.mp3']);
            game.load.audio('jump', ['assets/jump.mp3']);
            //	+ lots of other required assets here
            game.load.image(     'cat', 'assets/png/cat/Idle (1).png' );
            game.load.image(     'catJump', 'assets/png/cat/Jump (3).png' );
            game.load.image(     'catSlide', 'assets/png/cat/Slide (1).png' );
            game.load.image(     'catDead', 'assets/png/cat/Dead (2).png' );
            game.load.image(     'catFall', 'assets/png/dog/fall.png' );
            game.load.image(     'leftWall', 'assets/leftWall.png' );
            game.load.image(     'rightWall', 'assets/rightWall.png' );
            game.load.image(     'rightSpike', 'assets/rightSpike.png' );
            game.load.image(     'leftSpike', 'assets/leftSpike.png' );
            game.load.image(     'ground', 'assets/ground.png' );
            game.load.image('background', 'assets/background.jpg');
        },

        create: function () {

            //	Once the load has finished we disable the crop because we're going to sit in the update loop for a short while as the music decodes
            preloadBar.cropEnabled = false;

        },

        update: function () {

            //	You don't actually need to do this, but I find it gives a much smoother game experience.
            //	Basically it will wait for our audio file to be decoded before proceeding to the MainMenu.
            //	You can jump right into the menu if you want and still play the music, but you'll have a few
            //	seconds of delay while the mp3 decodes - so if you need your music to be in-sync with your menu
            //	it's best to wait for it to decode here first, then carry on.

            //	If you don't have any music in your game then put the game.state.start line into the create function and delete
            //	the update function completely.

            if (game.cache.isSoundDecoded('titleMusic') && ready == false)
            {
                ready = true;
                game.state.start('menu');
            }

        }

    };
};

function makeBoot( game ) {
    return {
        preload: function () {

            //  Here we load the assets required for our Preloader state (in this case a background and a loading bar)
            game.load.image('preloaderBackground', 'assets/preloader_background.jpg');
            game.load.image('preloaderBar', 'assets/preloader_bar.png');

        },

        create: function () {

            //  By this point the preloader assets have loaded to the cache, we've set the game settings
            //  So now let's start the real preloader going
            game.state.start('preloader');

        }
    };
};

window.onload = function() {
    // You might want to start with a template that uses GameStates:
    //     https://github.com/photonstorm/phaser/tree/v2.6.2/resources/Project%20Templates/Basic
    
    // You can copy-and-paste the code from any of the examples at http://examples.phaser.io here.
    // You will need to change the fourth parameter to "new Phaser.Game()" from
    // 'phaser-example' to 'game', which is the id of the HTML element where we
    // want the game to go.
    // The assets (and code) can be found at: https://github.com/photonstorm/phaser/tree/master/examples/assets
    // You will need to change the paths you pass to "game.load.image()" or any other
    // loading functions to reflect where you are putting the assets.
    // All loading functions will typically all be found inside "preload()".
    
    var game = new Phaser.Game( 400, 800, Phaser.AUTO, 'game' );

    game.state.add( "boot", makeBoot( game ) );
    game.state.add( "preloader", makePreloader( game ) );
    game.state.add( "menu", makeMainMenu( game ) );
    game.state.add( "main", make_main_game_state( game ) );
    game.state.add("gameover", makeGameOver(game));
    
    game.state.start( "boot" );
};
