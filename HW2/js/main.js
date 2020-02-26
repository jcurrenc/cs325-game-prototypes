"use strict";

function make_main_game_state( game )
{
    function preload() {
        game.load.image(     'cat', 'assets/png/cat/Idle (1).png' );
        game.load.image(     'catJump', 'assets/png/cat/Jump (3).png' );
        game.load.image(     'catSlide', 'assets/png/cat/Slide (1).png' );
        game.load.image(     'catDead', 'assets/png/cat/Dead (2).png' );
        game.load.image(     'catFall', 'assets/png/dog/Dead (2).png' );
        game.load.image(     'leftWall', 'assets/leftWall.png' );
        game.load.image(     'rightWall', 'assets/rightWall.png' );
        game.load.image(     'ground', 'assets/ground.png' );
    }
    
    var player;
    
    function create() {
        this.MAX_SPEED = 500; // pixels/second
        this.ACCELERATION = 1500; // pixels/second/second
        this.DRAG = 600; // pixels/second
        this.GRAVITY = 2600; // pixels/second/second
        this.JUMP_SPEED = -1000;
        // Create a sprite at the center of the screen using the 'logo' image.
        player = game.add.sprite( game.world.centerX, game.world.centerY, 'cat' );
        player.anchor.setTo(.5,.5);
        player.scale.set(0.15);
        //player.body.bounce.set(1.0);
        // Anchor the sprite at its center, as opposed to its top-left corner.
        // so it will be truly centered.

        
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
            // Add the ground blocks, enable physics on each, make them immovable
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

        this.ground = game.add.group();
        for(var x = 0; x < this.game.width; x += 32) {
            // Add the ground blocks, enable physics on each, make them immovable
            var groundBlock = game.add.sprite(x, this.game.height - 32, 'ground');
            game.physics.enable(groundBlock, Phaser.Physics.ARCADE);
            groundBlock.body.immovable = true;
            groundBlock.body.allowGravity = false;
            this.ground.add(groundBlock);
        }

        game.input.keyboard.addKeyCapture([
            Phaser.Keyboard.LEFT,
            Phaser.Keyboard.RIGHT,
            Phaser.Keyboard.UP,
            Phaser.Keyboard.DOWN
        ]);
    }
    
    function update() {
        game.physics.arcade.collide(player,this.ground);
        game.physics.arcade.collide(player,this.leftWall);
        game.physics.arcade.collide(player,this.rightWall);

        if(this.input.keyboard.isDown(Phaser.Keyboard.LEFT)){
            if(!player.body.touching.down && (player.body.touching.right || player.body.touching.left)){
                player.body.velocity.x = 500;
                player.body.velocity.y = -1000;
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
                player.body.velocity.x = -500;
                player.body.velocity.y = -1000;
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
            player.body.velocity.y = -1000;
            if(player.body.touching.left ) {
                player.body.velocity.x = 500;
            }
            else if(player.body.touching.right){
                player.body.velocity.x = -500;
            }
        }

        if(player.body.touching.right && !player.body.touching.down){
            player.body.velocity.x = -500;
            player.body.velocity.y -= 50;
        }
        if(player.body.touching.left && !player.body.touching.down ){
            player.body.velocity.x = 500;
            player.body.velocity.y -= 50;
        }
    }
    
    return { "preload": preload, "create": create, "update": update };
}


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
    
    var game = new Phaser.Game( 400, 600, Phaser.AUTO, 'game' );
    
    game.state.add( "main", make_main_game_state( game ) );
    
    game.state.start( "main" );
};
