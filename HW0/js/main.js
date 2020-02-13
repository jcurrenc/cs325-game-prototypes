"use strict";

function make_main_game_state( game )
{
    function preload() {
        // Load images
        game.load.image( 'planet', 'assets/planet.png' );
		    game.load.spritesheet('ship','assets/ship.png',32,32);
        game.load.audio('thrust', 'assest/22453__nathanshadow__space-ambient.aiff');
        game.load.audio('music', 'assest/bensound-endlessmotion.mp3');
    }



    function create() {
      this.music = game.add.audio('music');
      this.thrust = game.add.audio('thrust');

      this.music.play();
  		// Set stage background color
  		game.stage.backgroundColor = 0x333333;

  		// Define motion constants
  		this.ROTATION_SPEED = 180; // degrees/second
  		this.ACCELERATION = 200; // pixels/second/second
  		this.MAX_SPEED = 250; // pixels/second
  		this.DRAG = 25; // pixels/second
  		this.GRAVITY = 25; // pixels/second/second
      this.shipGravVectX = 0;
      this.shipGravVectY = 0;

  		// Add the ship to the stage
  		this.ship = game.add.sprite(game.width/2, game.height/2, 'ship');
  		this.ship.anchor.setTo(0.5, 0.5);
  		this.ship.angle = -90; // Point the ship up

      // Enable physics on the ship
  		game.physics.enable(this.ship, Phaser.Physics.ARCADE);

      // Set maximum velocity
      this.ship.body.maxVelocity.setTo(this.MAX_SPEED,this.MAX_SPEED);

      // Add drag to the ship that slows it down when it is not accelerating
      this.ship.body.drag.setTo(this.DRAG,this.DRAG);

      // Turn on gravity
      //game.physics.arcade.gravity = this.GRAVITY;

      // Make ship bounce a little
      this.ship.body.bounce.setTo(0.25, 0.25);

      // Create some ground for the ship to land on
      this.planets = game.add.group();
      var planet1 = game.add.sprite(168-100, 182-100, 'planet');
      var planet2 = game.add.sprite(213-100 , 412-100, 'planet');
      var planet3 = game.add.sprite(610-100, 421-100, 'planet');
      var planet4 = game.add.sprite(578-100, 155-100, 'planet');
      game.physics.enable(planet1,Phaser.Physics.ARCADE);
      game.physics.enable(planet2,Phaser.Physics.ARCADE);
      game.physics.enable(planet3,Phaser.Physics.ARCADE);
      game.physics.enable(planet4,Phaser.Physics.ARCADE);
      planet1.body.immovable = true;
      planet2.body.immovable = true;
      planet3.body.immovable = true;
      planet4.body.immovable = true;
      planet1.body.setCircle(90);
      planet2.body.setCircle(90);
      planet3.body.setCircle(90);
      planet4.body.setCircle(90);
      this.planets.add(planet1);
      this.planets.add(planet2);
      this.planets.add(planet3);
      this.planets.add(planet4);

      /*
      for(var x = 0; x < this.game.width; x += 32) {
          // Add the ground blocks, enable physics on each, make them immovable
          var groundBlock = game.add.sprite(x, game.height - 32, 'ground');
          game.physics.enable(groundBlock, Phaser.Physics.ARCADE);
          groundBlock.body.immovable = true;
          groundBlock.body.allowGravity = false;
          this.ground.add(groundBlock);
      }
      */

      // Capture certain keys to prevent their default actions in the browser.
      // This is only necessary because this is an HTML5 game. Games on other
      // platforms may not need code like this.
      game.input.keyboard.addKeyCapture([
          Phaser.Keyboard.LEFT,
          Phaser.Keyboard.RIGHT,
          Phaser.Keyboard.UP,
          Phaser.Keyboard.DOWN
      ]);
    }

    function update() {
      /*
      var p;
      for(p of this.planets.getAll()){
        var angle = game.physics.arcade.angleToXY(this.ship,p.body.x,p.body.y);
        var dist = game.physics.arcade.distanceBetween(this.ship,p);
        this.shipGravVectX += this.GRAVITY/dist * Math.cos(angle);
        this.shipGravVectY += this.GRAVITY/dist * Math.sin(angle);
      }
      */
      this.closestPlanet = this.planets.getClosestTo(this.ship);

      this.angtoClosest = game.physics.arcade.angleToXY(this.ship,this.closestPlanet.position.x,this.closestPlanet.position.y);

      // Collide the ship with the planetd
      game.physics.arcade.collide(this.ship, this.planets);

      // Keep the ship on the screen
      if (this.ship.x > game.width) this.ship.x = 0;
      if (this.ship.x < 0) this.ship.x = game.width;
      if (this.ship.y > game.height) this.ship.y = 0;
      if (this.ship.y < 0) this.ship.y = game.height;


      if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
          // If the LEFT key is down, rotate left
          this.ship.body.angularVelocity = -this.ROTATION_SPEED;
      } else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
          // If the RIGHT key is down, rotate right
          this.ship.body.angularVelocity = this.ROTATION_SPEED;
      } else {
          // Stop rotating
          this.ship.body.angularVelocity = 0;
      }

      if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
          // If the UP key is down, thrust
          // Calculate acceleration vector based on this.angle and this.ACCELERATION
          //this.ship.body.acceleration.x = Math.cos(this.ship.rotation) * this.ACCELERATION + this.shipGravVectX;
          //this.ship.body.acceleration.y = Math.sin(this.ship.rotation) * this.ACCELERATION + this.shipGravVectY;

          this.ship.body.acceleration.x = Math.cos(this.ship.rotation) * this.ACCELERATION + Math.cos(this.angtoClosest) * this.GRAVITY;
          this.ship.body.acceleration.y = Math.sin(this.ship.rotation) * this.ACCELERATION + Math.sin(this.angtoClosest) * this.GRAVITY ;

          // Show the frame from the spritesheet with the engine on
          this.ship.frame = 1;
      } else {
          // Otherwise, stop thrusting
          //this.ship.body.acceleration.setTo(0, 0);

          //this.ship.body.acceleration.x = this.shipGravVectX;
          //this.ship.body.acceleration.y = this.shipGravVectY;

          this.ship.body.acceleration.x = Math.cos(this.ship.rotation) * this.ACCELERATION + Math.cos(this.angtoClosest) * this.GRAVITY;
          this.ship.body.acceleration.y = Math.sin(this.ship.rotation) * this.ACCELERATION + Math.sin(this.angtoClosest) * this.GRAVITY ;

          // Show the frame from the spritesheet with the engine off
          this.ship.frame = 0;
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

    var game = new Phaser.Game( 800, 600, Phaser.AUTO, 'game' );

    game.state.add( "main", make_main_game_state( game ) );

    game.state.start( "main" );
};
