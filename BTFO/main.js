//Based on the Charge Rush tutorial by JunoNgx
//Link: https://github.com/JunoNgx/crisp-game-lib-tutorial

title = "BTFO";

description = `
    The ship will
    move to where 
    the mouse is. 
    Click to shoot, 
    wait longer to 
    charge up a more
    powerful shot
     `;

//Character Sprites
characters = [
`
   p  
   p
  ppp
  p p
 ppppp
 pp pp
`,

`
  pp
 pppp  
pppppp
pp  pp
 p  p
`,

`
 p  p
pp  pp
p    p
pp  pp
 pppp
  pp
`,

`
  p
  p
  p
  p
`
];

// Game design variable container
const G = {
	WIDTH: 100,
	HEIGHT: 150,

    STAR_SPEED_MIN: 0.5,
	STAR_SPEED_MAX: 1.0,
    
    PLAYER_FIRE_RATE: 200,
    PLAYER_GUN_OFFSET: 3,

    FBULLET_SPEED: 5,

    ENEMY_MIN_BASE_SPEED: 1.0,
    ENEMY_MAX_BASE_SPEED: 2.0,
    ENEMY_FIRE_RATE: 120,

    EBULLET_SPEED: 1.0,
    EBULLET_ROTATION_SPD: 0.1
};

// Game runtime options
options = {
	viewSize: {x: G.WIDTH, y: G.HEIGHT},
    isCapturing: true,
    isCapturingGameCanvasOnly: true,
    captureCanvasScale: 2,
    seed: 1,
    isPlayingBgm: true,
    isReplayEnabled: true,
    theme: "dark"
};

// Typedefs
/**
 * @typedef {{
 * pos: Vector,
 * speed: number
 * }} Star
 */

/**
 * @type { Star [] }
 */
let stars;

/**
 * @typedef {{
 * pos: Vector,
 * firingCooldown: number,
 * isFiringLeft: boolean,
 * overCharge: number
 * }} Player
 */

/**
 * @type { Player }
 */
let player;

/**
 * @typedef {{
 * pos: Vector
 * }} FBullet
 */

/**
 * @type { FBullet [] }
 */
let fBullets;

/**
 * @typedef {{
 * pos: Vector,
 * firingCooldown: number
 * }} Enemy
 */

/**
 * @type { Enemy [] }
 */
let enemies;

/**
 * @typedef {{
 * pos: Vector,
 * firingCooldown: number
 * }} Enemy2
 */

/**
 * @type { Enemy2 [] }
 */
let enemies2;

/**
 * @typedef {{
 * pos: Vector,
 * angle: number,
 * rotation: number,
 * duration: number
 * }} EBullet
 */

/**
 * @type { EBullet [] }
 */
let eBullets;

/**
 * @typedef {{
 * pos: Vector,
 * angle: number,
 * rotation: number,
 * duration: number
 * }} EBullet2
 */

/**
 * @type { EBullet2 [] }
 */
let eBullets2;

/**
 * @type { number }
 */
let currentEnemySpeed;

/**
 * @type { number }
 */
let waveCount;

/**
 * 
 */


function update() {
	if (!ticks) {
		stars = times(20, () => {
            const posX = rnd(0, G.WIDTH);
            const posY = rnd(0, G.HEIGHT);
            // Initialize stars
            return {
                pos: vec(posX, posY),
                speed: rnd(G.STAR_SPEED_MIN, G.STAR_SPEED_MAX)
            };
        });

        player = {
            pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
            firingCooldown: G.PLAYER_FIRE_RATE,
            isFiringLeft: true,
            overCharge: 0
        };

        fBullets = [];
        enemies = [];
        eBullets = [];
        enemies2 = [];
        eBullets2 = [];

        waveCount = 0;
	}

    // Spawning enemies (Homing Shot)
    if (enemies.length === 0) {
        currentEnemySpeed =
            rnd(G.ENEMY_MIN_BASE_SPEED, G.ENEMY_MAX_BASE_SPEED) * difficulty;
        for (let i = 0; i < 6; i++) {
            const posX = rnd(0, G.WIDTH);
            const posY = -rnd(i * G.HEIGHT * 0.1);
            enemies.push({
                pos: vec(posX, posY),
                firingCooldown: (G.ENEMY_FIRE_RATE - rnd (0, 60)) 
            });
        }

        waveCount++; // Increase the tracking variable by one
    }

    // Spawning enemies2 (Straight Shot)
    if (enemies2.length === 0) {
        currentEnemySpeed =
            rnd(G.ENEMY_MIN_BASE_SPEED, G.ENEMY_MAX_BASE_SPEED) * difficulty;
        for (let i = 0; i < 4; i++) {
            const posX = rnd(0, G.WIDTH);
            const posY = -rnd(i * G.HEIGHT * 0.1);
            enemies2.push({
                pos: vec(posX, posY),
                firingCooldown: (G.ENEMY_FIRE_RATE + rnd (0, 40)) 
            });
        }
    }

    // Update for Star
    stars.forEach((s) => {
        // Move the star downwards
        s.pos.y += s.speed;
        // Bring the star back to top once it's past the bottom of the screen
        if (s.pos.y > G.HEIGHT) s.pos.y = 0;

        color("light_black");
        box(s.pos, 1);
    });

    // Updating and drawing the player
    player.pos = vec(input.pos.x, input.pos.y);
    player.pos.clamp(0, G.WIDTH, 0, G.HEIGHT);
    
    //player firing display
    if (player.firingCooldown > 100) {
        color("yellow");
        text("NextShotin:" + (player.firingCooldown - 100).toString(), 3, 10);
    }
    else{
        color("green");
        text("NextShotin:READY", 3, 10);
    }

    //overCharge display
    if (player.overCharge < 1) {
        color("yellow");
        text("CHARGING", 3, 20);
    }
    else{
        color("red");
        text("CHARGED", 3, 20);
    }

    // Cooling down for the next shot
    if(player.firingCooldown > 0){
        player.firingCooldown--;
    }
    else if((player.firingCooldown == 0) && (player.overCharge == 0)){
        player.firingCooldown = 0;
        player.overCharge = 1;
    }
    else{
        player.firingCooldown = 0;
    }
    // Time to fire the next shot
    if (player.firingCooldown <= 100) {
        if (input.isPressed == true){
            // Get the side from which the bullet is fired
            const offset = (player.isFiringLeft)
            ? -G.PLAYER_GUN_OFFSET
            : G.PLAYER_GUN_OFFSET;
            // Create the bullet
            fBullets.push({
                pos: vec(player.pos.x + offset, player.pos.y),
            });
            if(player.overCharge == 1){
                fBullets.push({
                    pos: vec(player.pos.x + offset + 5, player.pos.y + 10),
                });
                fBullets.push({
                    pos: vec(player.pos.x + offset - 5, player.pos.y + 10),
                });
                fBullets.push({
                    pos: vec(player.pos.x + offset + 10, player.pos.y + 15),
                });
                fBullets.push({
                    pos: vec(player.pos.x + offset - 10, player.pos.y + 15),
                });
                //Reset the overCharge
                player.overCharge = 0;
            }
            // Reset the firing cooldown
            player.firingCooldown = G.PLAYER_FIRE_RATE;
            // Switch the side of the firing gun by flipping the boolean value
            player.isFiringLeft = !player.isFiringLeft;

            color("yellow");
            // Generate particles
            particle(
                player.pos.x + offset, // x coordinate
                player.pos.y, // y coordinate
                4, // The number of particles
                1, // The speed of the particles
                -PI/2, // The emitting angle
                PI/4  // The emitting width
            );
        }
    }
    color ("cyan");
    char("a", player.pos);

    // Updating and drawing bullets
    
    fBullets.forEach((fb) => {
        fb.pos.y -= G.FBULLET_SPEED;

        // Drawing fBullets for the first time, allowing interaction from enemies
        color("yellow");
        box(fb.pos, 2);
    });
    

    remove(enemies, (e) => {
        //e.pos.y += currentEnemySpeed;
        if(e.pos.y < ((G.HEIGHT/7) + (difficulty * 80 - 80))){
            e.pos.y += currentEnemySpeed;
        }
        e.firingCooldown--;
        if (e.firingCooldown <= 0) {
            eBullets.push({
                pos: vec(e.pos.x, e.pos.y),
                angle: e.pos.angleTo(player.pos),
                rotation: rnd(),
                duration: 130
            });
            e.firingCooldown = G.ENEMY_FIRE_RATE;
            play("select");
        }

        color("black");
        // Interaction from enemies to fBullets
        // Shorthand to check for collision against another specific type
        // Also draw the sprites
        const isCollidingWithFBullets = char("b", e.pos).isColliding.rect.yellow;
        const isCollidingWithPlayer = char("b", e.pos).isColliding.char.a;
        if (isCollidingWithPlayer) {
            end();
            play("powerUp");
        }
        
        if (isCollidingWithFBullets) {
            color("yellow");
            particle(e.pos);
            play("explosion");
            addScore(10 * waveCount, e.pos);
        }
        
        // Also another condition to remove the object
        return (isCollidingWithFBullets || e.pos.y > G.HEIGHT);
    });

    //For straight shot enemie2s
    remove(enemies2, (e2) => {
        //e2.pos.y += currentEnemySpeed;
        if(e2.pos.y < ((G.HEIGHT/7) + (difficulty * 80 - 80))){
            e2.pos.y += currentEnemySpeed;
        }
        e2.firingCooldown--;
        if (e2.firingCooldown <= 0) {
            eBullets2.push({
                pos: vec(e2.pos.x, e2.pos.y),
                angle: e2.pos.angleTo(player.pos),
                rotation: rnd(),
                duration: 160
            });
            e2.firingCooldown = G.ENEMY_FIRE_RATE;
            play("select");
        }

        color("red");
        // Interaction from enemies to fBullets
        // Shorthand to check for collision against another specific type
        // Also draw the sprits
        const isCollidingWithFBullets = char("c", e2.pos).isColliding.rect.yellow;
        const isCollidingWithPlayer = char("c", e2.pos).isColliding.char.a;
        if (isCollidingWithPlayer) {
            end();
            play("powerUp");
        }
        
        if (isCollidingWithFBullets) {
            color("yellow");
            particle(e2.pos);
            play("explosion");
            addScore(5 * waveCount, e2.pos);
        }
        
        // Also another condition to remove the object
        return (isCollidingWithFBullets || e2.pos.y > G.HEIGHT);
    });

    
    remove(fBullets, (fb) => {
        // Interaction from fBullets to enemies, after enemies have been drawn
        color("yellow");
        const isCollidingWithEnemies = box(fb.pos, 2).isColliding.char.b;
        return (isCollidingWithEnemies || fb.pos.y < 0);
    });

    remove(fBullets, (fb) => {
        // Interaction from fBullets to enemies2, after enemies2 have been drawn
        color("yellow");
        const isCollidingWithEnemies2 = box(fb.pos, 2).isColliding.char.c;
        return (isCollidingWithEnemies2 || fb.pos.y < 0);
    });
    

    remove(eBullets, (eb) => {
        eb.pos.x += G.EBULLET_SPEED * Math.cos(eb.angle);
        eb.pos.y += G.EBULLET_SPEED * Math.sin(eb.angle);
        eb.angle = eb.pos.angleTo(player.pos),
        eb.rotation += G.EBULLET_ROTATION_SPD;

        color("red");
        const isCollidingWithPlayer
            = char("b", eb.pos, {rotation: eb.rotation}).isColliding.char.a;

        if (isCollidingWithPlayer) {
            // End the game
            end();
            play("powerUp");
        }

        const isCollidingWithFBullets
            = char("b", eb.pos, {rotation: eb.rotation}).isColliding.rect.yellow;
        if (isCollidingWithFBullets) addScore(1, eb.pos);
        
        // If eBullet is not onscreen, remove it
        return (!eb.pos.isInRect(0, 0, G.WIDTH, G.HEIGHT));
    });

    remove(eBullets, (eb) => {
        eb.duration--;
        if(eb.duration == 0){
            return true;
        }
    });

    //for straight shots
    remove(eBullets2, (eb2) => {
        eb2.pos.x += (G.EBULLET_SPEED + 2) * Math.cos(eb2.angle);
        eb2.pos.y += (G.EBULLET_SPEED + 2) * Math.sin(eb2.angle);

        color("green");
        const isCollidingWithPlayer
            = char("d", eb2.pos).isColliding.char.a;

        if (isCollidingWithPlayer) {
            // End the game
            end();
            play("powerUp");
        }

        const isCollidingWithFBullets
            = char("d", eb2.pos).isColliding.rect.yellow;
        if (isCollidingWithFBullets) addScore(1, eb2.pos);
        
        // If eBullet2 is not onscreen, remove it
        return (!eb2.pos.isInRect(0, 0, G.WIDTH, G.HEIGHT));
    });

    remove(eBullets2, (eb2) => {
        eb2.duration--;
        if(eb2.duration == 0){
            return true;
        }
    });
}