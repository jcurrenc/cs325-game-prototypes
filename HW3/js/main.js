    "use strict";

function make_main_game_state( game )
{
    function preload() {
        // Load an image and call it 'logo'.
        game.load.image('player', 'assets/gfx/player.png');
        game.load.image('smoke', 'assets/gfx/smoke.png');
        game.load.image('rocket', 'assets/gfx/rocket.png');
        game.load.image('koala', 'assets/koala.png');
        game.load.image('chicken', 'assets/chicken.png');
        game.load.image('elephant', 'assets/elephant.png');
        game.load.image('penguin', 'assets/penguin.png');
        game.load.image('wood', 'assets/wood.png');
        game.load.image('carpenter', 'assets/carpenter.png');
        game.load.image('background', 'assets/background.png');
        game.load.spritesheet('explosion', 'assets/gfx/explosion.png', 128, 128);
    }

    var Follower = function(game, x, y, target) {
        Phaser.Sprite.call(this, game, x, y, 'carpenter');

        // Save the target that this Follower will follow
        // The target is any object with x and y properties
        this.target = target;

        // Set the pivot point for this sprite to the center
        this.anchor.setTo(0.5, 0.5);

        // Enable physics on this object
        game.physics.enable(this, Phaser.Physics.ARCADE);

        // Define constants that affect motion
        this.MAX_SPEED = 300; // pixels/second
        this.MIN_DISTANCE = 5; // pixels
    };

    Follower.prototype = Object.create(Phaser.Sprite.prototype);
    Follower.prototype.constructor = Follower;


// Missile constructor
    var Missile = function(game, x, y) {
        var animals = ['koala', 'chicken', 'elephant', 'penguin'];
        Phaser.Sprite.call(this, game, x, y, animals[game.rnd.integerInRange(0,3)]);

        // Set the pivot point for this sprite to the center
        this.anchor.setTo(0.5, 0.5);

        // Enable physics on the missile
        game.physics.enable(this, Phaser.Physics.ARCADE);

        // Define constants that affect motion
        this.SPEED = 250; // missile speed pixels/second
        this.TURN_RATE = 5; // turn rate in degrees/frame
        this.WOBBLE_LIMIT = 15; // degrees
        this.WOBBLE_SPEED = 250; // milliseconds
        this.SMOKE_LIFETIME = 3000; // milliseconds

        // Create a variable called wobble that tweens back and forth between
        // -this.WOBBLE_LIMIT and +this.WOBBLE_LIMIT forever
        this.wobble = this.WOBBLE_LIMIT;
        game.add.tween(this)
            .to(
                { wobble: -this.WOBBLE_LIMIT },
                this.WOBBLE_SPEED, Phaser.Easing.Sinusoidal.InOut, true, 0,
                Number.POSITIVE_INFINITY, true
            );

        // Add a smoke emitter with 100 particles positioned relative to the
        // bottom center of this missile
        this.smokeEmitter = game.add.emitter(0, 0, 100);

        // Set motion parameters for the emitted particles
        this.smokeEmitter.gravity = 0;
        this.smokeEmitter.setXSpeed(0, 0);
        this.smokeEmitter.setYSpeed(-80, -50); // make smoke drift upwards

        // Make particles fade out after 1000ms
        this.smokeEmitter.setAlpha(1, 0, this.SMOKE_LIFETIME, Phaser.Easing.Linear.InOut);

        // Create the actual particles
        this.smokeEmitter.makeParticles('smoke');

        // Start emitting smoke particles one at a time (explode=false) with a
        // lifespan of this.SMOKE_LIFETIME at 50ms intervals
        this.smokeEmitter.start(false, this.SMOKE_LIFETIME, 50);
    };

// Missiles are a type of Phaser.Sprite
    Missile.prototype = Object.create(Phaser.Sprite.prototype);
    Missile.prototype.constructor = Missile;

    var timer;
    var player;
    var missileGroup;
    var explosionGroup;
    var wallGroup;
    var MAX_MISSILES = 3;

    function create() {
        game.stage.backgroundColor = 0x4488cc;
        game.add.tileSprite(0,0,848,450,'background');

        timer = game.time.create(false);
        timer.loop(5000,function () {
            MAX_MISSILES++;
        },this);

        player = game.add.existing(
            new Follower(game, game.width/2, game.height/2, game.input)
        );

        missileGroup = game.add.group();
        explosionGroup = game.add.group();

        game.input.x = game.width/2;
        game.input.y = game.height/2;
        timer.start();
    }
    
    function update() {
        if (missileGroup.countLiving() < MAX_MISSILES) {
            // Set the launch point to a random location below the bottom edge
            // of the stage
            if(game.rnd.integerInRange(0,1) === 1) {
                launchMissile(game.rnd.integerInRange(50, game.width + 50),
                    game.rnd.integerInRange(50, game.height + 50));
            }
            else{
                launchMissile(game.rnd.integerInRange(-50, -game.width - 50),
                    game.rnd.integerInRange(-50, -game.height - 50));
            }
        }

        // If any missile is within a certain distance of the mouse pointer, blow it up
        missileGroup.forEachAlive(function(m) {
            var distance = game.math.distance(m.x, m.y,
                player.x, player.y);
            if (distance < 50) {
                m.kill();
                getExplosion(m.x, m.y);
            }
        }, this);

    }

    Follower.prototype.update = function() {
        // Calculate distance to target
        var distance = game.math.distance(this.x, this.y, this.target.x, this.target.y);

        // If the distance > MIN_DISTANCE then move
        if (distance > this.MIN_DISTANCE) {
            // Calculate the angle to the target
            var rotation = game.math.angleBetween(this.x, this.y, this.target.x, this.target.y);

            // Calculate velocity vector based on rotation and this.MAX_SPEED
            this.body.velocity.x = Math.cos(rotation) * this.MAX_SPEED;
            this.body.velocity.y = Math.sin(rotation) * this.MAX_SPEED;
        } else {
            this.body.velocity.setTo(0, 0);
        }
    };

    Missile.prototype.update = function() {
        // If this missile is dead, don't do any of these calculations
        // Also, turn off the smoke emitter
        if (!this.alive) {
            this.smokeEmitter.on = false;
            return;
        } else {
            this.smokeEmitter.on = true;
        }

        // Position the smoke emitter at the center of the missile
        this.smokeEmitter.x = this.x;
        this.smokeEmitter.y = this.y;

        // Calculate the angle from the missile to the mouse cursor game.input.x
        // and game.input.y are the mouse position; substitute with whatever
        // target coordinates you need.
        var targetAngle = game.math.angleBetween(
            this.x, this.y,
            player.x, player.y
        );

        // Add our "wobble" factor to the targetAngle to make the missile wobble
        // Remember that this.wobble is tweening (above)
        targetAngle += game.math.degToRad(this.wobble);

        // Gradually (this.TURN_RATE) aim the missile towards the target angle
        if (this.rotation !== targetAngle) {
            // Calculate difference between the current angle and targetAngle
            var delta = targetAngle - this.rotation;

            // Keep it in range from -180 to 180 to make the most efficient turns.
            if (delta > Math.PI) delta -= Math.PI * 2;
            if (delta < -Math.PI) delta += Math.PI * 2;

            if (delta > 0) {
                // Turn clockwise
                this.angle += this.TURN_RATE;
            } else {
                // Turn counter-clockwise
                this.angle -= this.TURN_RATE;
            }

            // Just set angle to target angle if they are close
            if (Math.abs(delta) < game.math.degToRad(this.TURN_RATE)) {
                this.rotation = targetAngle;
            }
        }

        // Calculate velocity vector based on this.rotation and this.SPEED
        this.body.velocity.x = Math.cos(this.rotation) * this.SPEED;
        this.body.velocity.y = Math.sin(this.rotation) * this.SPEED;
    };

     function launchMissile(x, y) {
        // // Get the first dead missile from the missileGroup
        var missile = missileGroup.getFirstDead();

        // If there aren't any available, create a new one
        if (missile === null) {
            missile = new Missile(game);
            missileGroup.add(missile);
        }

        // Revive the missile (set it's alive property to true)
        // You can also define a onRevived event handler in your explosion objects
        // to do stuff when they are revived.
        missile.revive();

        // Move the missile to the given coordinates
        missile.x = x;
        missile.y = y;

        return missile;
    };

     function getExplosion(x, y) {
        // Get the first dead explosion from the explosionGroup
        var explosion = explosionGroup.getFirstDead();

        // If there aren't any available, create a new one
        if (explosion === null) {
            explosion = game.add.sprite(0, 0, 'explosion');
            explosion.anchor.setTo(0.5, 0.5);

            // Add an animation for the explosion that kills the sprite when the
            // animation is complete
            var animation = explosion.animations.add('boom', [0,1,2,3], 60, false);
            animation.killOnComplete = true;

            // Add the explosion sprite to the group
            explosionGroup.add(explosion);
        }

        // Revive the explosion (set it's alive property to true)
        // You can also define a onRevived event handler in your explosion objects
        // to do stuff when they are revived.
        explosion.revive();

        // Move the explosion to the given coordinates
        explosion.x = x;
        explosion.y = y;

        // Set rotation of the explosion at random for a little variety
        explosion.angle = game.rnd.integerInRange(0, 360);

        // Play the animation
        explosion.animations.play('boom');

        // Return the explosion itself in case we want to do anything else with it
        return explosion;
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
    
    var game = new Phaser.Game( 848, 450, Phaser.AUTO, 'game' );
    
    game.state.add( "main", make_main_game_state( game ) );
    
    game.state.start( "main" );
};
