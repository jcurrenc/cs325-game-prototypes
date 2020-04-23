"use strict";

GameStates.makeGame = function( game, shared ) {
    // Create your own variables.
    var leftwall, rightwall;
    var player = null;
    var ground = null;
    var jumpable = null;
    var wall = null;
    var canJump = false;
    var touchingWall = false;
    var GRAVITY = 2600;
    var MAX_SPEED = 500;
    var DRAG = 600;
    var JUMP_SPEED = -1000;
    var ACCELERATION = 1500;
    var WALL_BOUNCE = 400;

    function quitGame() {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        game.state.start('MainMenu');

    }
    
    return {
    
        create: function () {

            // Create a sprite at the center of the screen using the 'logo' image.
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

            var groundblock = game.add.sprite(game.width/2, game.height - 40, 'longplat');
            game.physics.enable(groundblock,Phaser.Physics.ARCADE);
            groundblock.anchor.setTo(0.5,0.5);
            groundblock.scale.x = 6;
            groundblock.body.allowGravity = false;
            groundblock.body.immovable = true;
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
        },
    
        update: function () {
            leftwall.tilePosition.y += 2;
            rightwall.tilePosition.y += 2;

            game.physics.arcade.collide(player,ground);
            canJump = game.physics.arcade.collide(player,jumpable);
            game.physics.arcade.collide(wall,player);
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
            console.log(touchingWall);

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
