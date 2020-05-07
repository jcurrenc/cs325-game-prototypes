"use strict";

GameStates.makeGame = function( game, shared ) {
    // Create your own variables.
    var timer = null;
    var background = null;
    var leftwall, rightwall;
    var player = null;
    var ground = null;
    var jumpable = null;
    var wall = null;
    var boulders = null;
    var platforms = null;
    var canJump = false;
    var touchingWall = false;
    var GRAVITY = 2000;
    var MAX_SPEED = 500;
    var DRAG = 2000;
    var JUMP_SPEED = -1000;
    var ACCELERATION = 2000;
    var WALL_BOUNCE = 700;
    var SPEED_MODIFIER = 2;
    var PLATFORM_SPAWN_TIME = 1250;
    var ROCK_SPAWN_TIME = 1750;
    var cur_time = 0;
    var timeText;
    var startText;
    var jump, meow;
    var style = { font: "25px Impact", fill: "#963694", align: "center" };

    function quitGame() {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        SPEED_MODIFIER = 2;
        cur_time = 0;
        game.state.start('MainMenu');

    }

    return {
    
        create: function () {
            jump = game.add.audio('jump');
            meow = game.add.audio('meow');
            timeText = game.add.text( 64, 16, "Time: " + cur_time+"s", style );
            startText = game.add.text( game.width/2-100, game.height/2+ 50, " PRESS SPACEBAR TO JUMP", style );
            platforms = game.add.group();
            boulders = game.add.group();
            timer = game.time.create(false);
            timer.loop(PLATFORM_SPAWN_TIME,
               function() {
                    console.log('Spawning platform');
                    var coin = Math.floor(Math.random() * 2) + 1;
                    var xpos, pos, plat;
                    if(coin === 1){
                        xpos = [150,200,250,300,350,400,450,500,550,600];
                        pos = Math.floor(Math.random() * 10);
                        console.log(xpos[pos]);
                        plat = game.add.sprite(xpos[pos]-75, 10,'shortplat');
                    }
                    else{
                        xpos = [200,300,400,500,600];
                        pos = Math.floor(Math.random() * 5);
                        console.log(xpos[pos]);
                        plat = game.add.sprite(xpos[pos]-100,10,'longplat');
                    }
                    plat.anchor.setTo(0.5,0.5);
                    game.physics.enable(plat,Phaser.Physics.ARCADE);
                    plat.body.allowGravity = false;
                    plat.body.allowRotation = false;
                    plat.body.immovable = true;
                    var spdRand = Math.floor(Math.random() * 21) + 1;
                    plat.body.velocity.y = 200+SPEED_MODIFIER+spdRand;
                    //game.world.bringToTop(plat);
                    platforms.add(plat);
                    jumpable.add(plat);
                }, this);

            timer.loop(1000,
                function() {
                    cur_time++;
                    timeText.setText("Time: " + cur_time+"s", true);
                }, this);

            timer.loop(ROCK_SPAWN_TIME,
                function() {
                    var xpos = [200,300,400,500,600];
                    var pos = Math.floor(Math.random() * 5);
                    var boulder = game.add.sprite(xpos[pos]-100,-50,'boulder');
                    boulder.anchor.setTo(0.5,0.5);
                    game.physics.enable(boulder,Phaser.Physics.ARCADE);
                    boulder.body.acceleration.y = -500;
                    boulder.body.allowGravity = true;
                    boulder.body.immovable = true;
                    boulders.add(boulder);
                }, this);

            timer.loop(3000,
                function() {
                    SPEED_MODIFIER+= 1;
                }, this);

            background = game.add.tileSprite(0,0,600,900,'background');
            game.world.sendToBack(background);
            player = game.add.sprite( game.world.centerX, game.world.centerY, 'player' );


            player.frame = 17;
            player.animations.add('run',[8,9,10,11,12,13,14,15,14,13,12,11,10,9,8],10,false);
            player.animations.add('jump',[0,1,2,3,4,5,6,7,6,5,4,3,2,1,0,17],20,false);
            player.animations.add('fall',[0,1,2,3,4,5,6,7,6],20,false);
            // Anchor the sprite at its center, as opposed to its top-left corner.
            // so it will be truly centered.
            player.anchor.setTo( 0.25, 0.5 );
            
            // Turn on the arcade physics engine for this sprite.
            game.physics.enable( player, Phaser.Physics.ARCADE );
            player.body.collideWorldBounds = true;
            player.body.drag.setTo(DRAG, 0);
            player.body.maxVelocity.setTo(MAX_SPEED, MAX_SPEED * 10);
            player.body.setSize(180,445);
            player.scale.set(0.15);
            game.physics.arcade.gravity.y = GRAVITY;

            game.input.keyboard.addKeyCapture([
                Phaser.Keyboard.LEFT,
                Phaser.Keyboard.RIGHT,
                Phaser.Keyboard.SPACEBAR,
                Phaser.Keyboard.DOWN
            ]);
            jumpable = game.add.group();
            ground = game.add.group();

            var groundblock = game.add.sprite(game.width/2, game.height/2+ 50, 'longplat');
            game.physics.enable(groundblock,Phaser.Physics.ARCADE);
            groundblock.anchor.setTo(0.5,0.5);
            //groundblock.scale.x = 6;
            groundblock.body.allowGravity = false;
            groundblock.body.immovable = true;
            groundblock.body.velocity.y = 150;
            ground.add(groundblock);
            jumpable.add(groundblock);

            wall = game.add.group();
            leftwall = game.add.tileSprite(0,0,50,900,'wall');
            rightwall = game.add.tileSprite(game.width-50,0,50,900,'wall');
            game.physics.enable([leftwall,rightwall], Phaser.Physics.ARCADE);
            leftwall.body.allowGravity = false;
            rightwall.body.allowGravity = false;
            leftwall.body.immovable = true;
            rightwall.body.immovable = true;
            rightwall.tilePosition.y += 30;
            wall.add(rightwall);
            wall.add(leftwall);
            jumpable.add(leftwall);
            jumpable.add(rightwall);
            //spawnPlat();
            timer.start();
        },
    
        update: function () {
            if(player.body.onFloor()){
                quitGame();
            }
            leftwall.tilePosition.y += SPEED_MODIFIER;
            rightwall.tilePosition.y += SPEED_MODIFIER;
            background.tilePosition.y += SPEED_MODIFIER;
            game.physics.arcade.collide(player,boulders,function (p,b) {
                console.log("Player hit");
                p.kill();
                b.kill();
                meow.play();
                quitGame();
            }, null, this);

            game.physics.arcade.collide(platforms,boulders,function (p,b) {
                console.log("Player hit");
                //p.kill();
                b.kill();
            }, null, this);
            game.physics.arcade.collide(player,platforms);
            game.physics.arcade.collide(player,ground);
            canJump = game.physics.arcade.collide(player,jumpable);

            game.physics.arcade.collide(wall,player);

            //console.log(btest);
            touchingWall = leftwall.body.touching.right || rightwall.body.touching.left;
            if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
                // If the LEFT key is down, set the player velocity to move left
                player.body.acceleration.x = -ACCELERATION;
                if(canJump) {
                    player.animations.play('run');
                }
                if(player.scale.x > 0 && !touchingWall) {
                    player.scale.x *= -1;
                }
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                // If the RIGHT key is down, set the player velocity to move right
                player.body.acceleration.x = ACCELERATION;
                if(canJump) {
                    player.animations.play('run');
                }
                if(player.scale.x < 0 && !touchingWall) {
                    player.scale.x *= -1;
                }
            } else {
                player.body.acceleration.x = 0;
                if(canJump && !touchingWall) {
                    player.frame = 17;
                }
            }

            if(touchingWall && canJump){
                player.frame = 16;
                player.body.velocity.y = 0;
                if(rightwall.body.touching.left){
                    if(player.scale.x > 0) {
                        player.scale.x *= -1;
                    }
                }
                else{
                    if(player.scale.x < 0) {
                        player.scale.x *= -1;
                    }
                }
            }

            if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && canJump && game.input.keyboard.downDuration(Phaser.Keyboard.SPACEBAR)){
                startText.destroy();
                jump.play();
                player.body.velocity.y = JUMP_SPEED;
                if(touchingWall){
                    if(leftwall.body.touching.right) {
                        player.body.velocity.x = WALL_BOUNCE;
                    }
                    else{
                        player.body.velocity.x = -WALL_BOUNCE;
                    }
                }
                player.animations.play('jump');
            }

        }



    };
};