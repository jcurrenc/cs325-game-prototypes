"use strict";

function make_main_game_state( game )
{
    function preload() {
        // Load an image and call it 'logo'.
        game.load.image('ground', '/assets/gfx/ground.png');
		game.load.spritesheet('ship', '/assets/gfx/ship.png', 32, 32);
    }
    
    var bouncy;
    
    function create() {
        this.game.stage.backgroundColor = 0x333333;

		// Define motion constants
		this.ROTATION_SPEED = 180; // degrees/second
		this.ACCELERATION = 200; // pixels/second/second
		this.MAX_SPEED = 250; // pixels/second
		this.DRAG = 25; // pixels/second
		this.GRAVITY = 100; // pixels/second/second

		// Add the ship to the stage
		this.ship = this.game.add.sprite(this.game.width/2, this.game.height/2, 'ship');
		this.ship.anchor.setTo(0.5, 0.5);
		this.ship.angle = -90; // Point the ship up

		// Enable physics on the ship
		this.game.physics.enable(this.ship, Phaser.Physics.ARCADE);

		// Set maximum velocity
		this.ship.body.maxVelocity.setTo(this.MAX_SPEED, this.MAX_SPEED); // x, y

		// Add drag to the ship that slows it down when it is not accelerating
		this.ship.body.drag.setTo(this.DRAG, this.DRAG); // x, y

		// Turn on gravity
		game.physics.arcade.gravity.y = this.GRAVITY;

		// Make ship bounce a little
		this.ship.body.bounce.setTo(0.25, 0.25);

		// Create some ground for the ship to land on
		this.ground = this.game.add.group();
		for(var x = 0; x < this.game.width; x += 32) {
			// Add the ground blocks, enable physics on each, make them immovable
			var groundBlock = this.game.add.sprite(x, this.game.height - 32, 'ground');
			this.game.physics.enable(groundBlock, Phaser.Physics.ARCADE);
			groundBlock.body.immovable = true;
			groundBlock.body.allowGravity = false;
			this.ground.add(groundBlock);
		}

		// Capture certain keys to prevent their default actions in the browser.
		// This is only necessary because this is an HTML5 game. Games on other
		// platforms may not need code like this.
		this.game.input.keyboard.addKeyCapture([
			Phaser.Keyboard.LEFT,
			Phaser.Keyboard.RIGHT,
			Phaser.Keyboard.UP,
			Phaser.Keyboard.DOWN
		]);
    }
    
    function update() {
		// Collide the ship with the ground
		this.game.physics.arcade.collide(this.ship, this.ground);

		// Keep the ship on the screen
		if (this.ship.x > this.game.width) this.ship.x = 0;
		if (this.ship.x < 0) this.ship.x = this.game.width;

		if (this.leftInputIsActive()) {
			// If the LEFT key is down, rotate left
			this.ship.body.angularVelocity = -this.ROTATION_SPEED;
		} else if (this.rightInputIsActive()) {
			// If the RIGHT key is down, rotate right
			this.ship.body.angularVelocity = this.ROTATION_SPEED;
		} else {
			// Stop rotating
			this.ship.body.angularVelocity = 0;
		}

		if (this.upInputIsActive()) {
			// If the UP key is down, thrust
			// Calculate acceleration vector based on this.angle and this.ACCELERATION
			this.ship.body.acceleration.x = Math.cos(this.ship.rotation) * this.ACCELERATION;
			this.ship.body.acceleration.y = Math.sin(this.ship.rotation) * this.ACCELERATION;

			// Show the frame from the spritesheet with the engine on
			this.ship.frame = 1;
		} else {
			// Otherwise, stop thrusting
			this.ship.body.acceleration.setTo(0, 0);

			// Show the frame from the spritesheet with the engine off
			this.ship.frame = 0;
		}
    }
    
	// This function should return true when the player activates the "go left" control
	// In this case, either holding the right arrow or tapping or clicking on the left
	// side of the screen.
	GameState.prototype.leftInputIsActive = function() {
		var isActive = false;

		isActive = this.input.keyboard.isDown(Phaser.Keyboard.LEFT);
		isActive |= (this.game.input.activePointer.isDown &&
			this.game.input.activePointer.x < this.game.width/4);

		return isActive;
	};

	// This function should return true when the player activates the "go right" control
	// In this case, either holding the right arrow or tapping or clicking on the right
	// side of the screen.
	GameState.prototype.rightInputIsActive = function() {
		var isActive = false;

		isActive = this.input.keyboard.isDown(Phaser.Keyboard.RIGHT);
		isActive |= (this.game.input.activePointer.isDown &&
			this.game.input.activePointer.x > this.game.width/2 + this.game.width/4);

		return isActive;
	};

	// This function should return true when the player activates the "jump" control
	// In this case, either holding the up arrow or tapping or clicking on the center
	// part of the screen.
	GameState.prototype.upInputIsActive = function() {
		var isActive = false;

		isActive = this.input.keyboard.isDown(Phaser.Keyboard.UP);
		isActive |= (this.game.input.activePointer.isDown &&
			this.game.input.activePointer.x > this.game.width/4 &&
			this.game.input.activePointer.x < this.game.width/2 + this.game.width/4);

		return isActive;
	};
	
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
    
    var game = new Phaser.Game( 800, 600, Phaser.AUTO, 'game' );
    
    game.state.add( "main", make_main_game_state( game ) );
    
    game.state.start( "main" );
};
