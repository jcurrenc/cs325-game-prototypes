"use strict";

function make_main_game_state( game )
{
    function preload() {
        game.load.image(     'cat', 'assets/png/cat/Idle (1).png' );
        game.load.image(     'catJump', 'assets/png/cat/Jump (3).png' );
        game.load.image(     'catSlide', 'assets/png/cat/Slide (1).png' );
        game.load.image(     'catDead', 'assets/png/cat/Dead (2).png' );
        game.load.image(     'catFall', 'assets/png/dog/Dead (2).png' );
    }
    
    var player;
    
    function create() {
        this.GRAVITY = 2600;
        // Create a sprite at the center of the screen using the 'logo' image.
        player = game.add.sprite( game.world.centerX, game.world.centerY, 'cat' );
        // Anchor the sprite at its center, as opposed to its top-left corner.
        // so it will be truly centered.

        
        // Turn on the arcade physics engine for this sprite.
        game.physics.enable( player, Phaser.Physics.ARCADE );

        game.physics.arcade.gravity.y = this.GRAVITY;
        // Make it bounce off of the world bounds.
        player.body.collideWorldBounds = true;


        game.input.keyboard.addKeyCapture([
            Phaser.Keyboard.LEFT,
            Phaser.Keyboard.RIGHT,
            Phaser.Keyboard.UP,
            Phaser.Keyboard.DOWN
        ]);
    }
    
    function update() {
        // Accelerate the 'logo' sprite towards the cursor,
        // accelerating at 500 pixels/second and moving no faster than 500 pixels/second
        // in X or Y.
        // This function returns the rotation angle that makes it visually match its
        // new trajectory.

        if(this.input.keyboard.isDown(Phaser.Keyboard.LEFT)){
            player.body.acceleration.x = -1500;
        }
        else if(this.input.keyboard.isDown(Phaser.Keyboard.RIGHT)){
            player.body.acceleration.x = 1500;
        }
        else{
            player.body.acceleration.x = 0;
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
