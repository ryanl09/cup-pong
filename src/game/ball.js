/* Burak Kanber */
var width = 800;
var height = 800;
var canvas = false;
var ctx = false;
var frameRate = 1/80; // Seconds
var frameDelay = frameRate * 1000; // ms
var loopTimer = false;

var startX = 0;
var startY = 0;
var endX = 0;
var endY = 0;
var m = 0;
var sizeMult = 0;
var shotsTaken = 0;
var cupsHit = 0;

var shots = 0;
var shotsMade = 0;
var canShoot = true;
var wasReset=true;
var lastY = 0;

var nothingCounter=0;
const MAX_NOTHING = 5 * 1/(frameRate); //seconds

/*
 * Experiment with values of mass, radius, restitution,
 * gravity (ag), and density (rho)!
 * 
 * Changing the constants literally changes the environment
 * the ball is in. 
 * 
 * Some settings to try:
 * the moon: ag = 1.6
 * water: rho = 1000, mass 5
 * beach ball: mass 0.05, radius 30
 * lead ball: mass 10, restitution -0.05
 */
var size = 20;

var ball = {
    position: {x: width/2, y: 0, z:0 },
    velocity: {x: 10, y: 0, z: 0},
    mass: 0.1, //kg
    radius: 15, // 1px = 1cm
    restitution: -0.7
    };

var Cd = 0.47;  // Dimensionless
var rho = 1.22; // kg / m^3
var A = Math.PI * ball.radius * ball.radius / (10000); // m^2
var ag = 9.81;  // m / s^2
var mouse = {x: 0, y: 0, isDown: false};

function getMousePosition(e) {
    mouse.x = e.pageX - 30;
    mouse.y = e.pageY - 30;
}
var mouseDown = function(e) {
    if (global.myturn && canShoot) {
        if (e.which == 1) {
            getMousePosition(e);
            mouse.isDown = true;
            startX = mouse.x;
            startY = mouse.y;
            m = 0;
            ball.position.x = mouse.y;
            ball.position.y = 300;
            ball.position.z = mouse.x;
            ball.velocity.x = 0;
            ball.velocity.y = 0;
            ball.velocity.z = 0;
        }
    }
}
var mouseUp = function(e) { 
    if (global.myturn && canShoot) {
        if (e.which == 1) {
            mouse.isDown = false;
            canShoot = false;
            wasReset=false;
            endX = mouse.x;
            endY = mouse.y;
            if (endY - startY === 0 && endX - startX === 0 || endY < 300) {
                resetBall(false);
                return;
            }
            ball.velocity.y = 3;
            ball.velocity.x = (endY - startY) / 15;
            ball.velocity.z = (endX - startX) / 15;
        }
    }
}

var setup = function() {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext('2d');
    
    canvas.onmousemove = getMousePosition;
    canvas.onmousedown = mouseDown;
    canvas.onmouseup = mouseUp;
    
    ctx.fillStyle = 'red';
    ctx.strokeStyle = '#000000';



    loopTimer = setInterval(loop, frameDelay);
}

function resetBall(counts) { 
    if (counts) {
        shots++;
        shotsTaken++;
        if (shots >= 2) {
            shots = 0;
            shotsMade = 0;
            global.myturn = false;
            global.con.send("turn", getUserid(), false);
        }
    }
    ball.velocity.x = 0;
    ball.velocity.y = 0;
    ball.velocity.z = 0;
    ball.position.x = 700;
    ball.position.z = 400 - (size + sizeMult);
    ball.position.y = 0;
    canShoot=true;
    wasReset=true;
}

var loop = function() {
    if ( ! mouse.isDown) {
        // Do physics
            // Drag force: Fd = -1/2 * Cd * A * rho * v * v
            
        var Fx = -0.5 * Cd * A * rho * ball.velocity.x * ball.velocity.x * ball.velocity.x / Math.abs(ball.velocity.x);
        var Fy = -0.5 * Cd * A * rho * ball.velocity.y * ball.velocity.y * ball.velocity.y / Math.abs(ball.velocity.y);
        var Fz = -0.5 * Cd * A * rho & ball.velocity.z * ball.velocity.z * ball.velocity.z / Math.abs(ball.velocity.z);
        
        Fx = (isNaN(Fx) ? 0 : Fx);
        Fy = (isNaN(Fy) ? 0 : Fy);
        
            // Calculate acceleration ( F = ma )
        var ax = Fx / ball.mass;
        var ay = ag + (Fy / ball.mass);
        var az = Fz / ball.mass;
            // Integrate to get velocity
        ball.velocity.x += ax*frameRate;
        ball.velocity.y += ay*frameRate;
        ball.velocity.z += az*frameRate;
        
            // Integrate to get position
        ball.position.x += ball.velocity.x*frameRate*100;
        ball.position.y += ball.velocity.y*frameRate*100;
        ball.position.z += ball.velocity.z*frameRate*100;

        if (ball.position.x < 0 - (size + sizeMult)) {
            resetBall(true);
        }
        if (ball.position.x > 800 + (size + sizeMult)) {
            resetBall(false);
        }

        if (lastY == ball.position.y && !wasReset) {
            resetBall(true);
        }
        lastY = ball.position.y;
    }
    // Handle collisions

    var ballMidX = ball.position.z + ((size + sizeMult) / 2);
    var ballMidY = ball.position.x + ((size + sizeMult) / 2);
    
    if (global.myturn) {
        if (ball.position.y > height - ball.radius) {
            ball.velocity.y *= ball.restitution;
            ball.position.y = height - ball.radius;
            for (let i = 0; i < cups.length; i++) { 
                if (!cups[i].hit) {
                    if (ballMidX >= cups[i].hitBounds.left && ballMidX <= cups[i].hitBounds.right &&
                        ballMidY >= cups[i].hitBounds.top && ballMidY <= cups[i].hitBounds.bottom) {
                            cups[i].hit = true;
                            cupsHit++;
                            shotsMade++;
                            resetBall(true);
                            global.con.send("cup", getUserid(), i);
                            if (cupsHit >= global.cupCount) {
                                global.con.send("gameover", getUserid());
                                game.inMatch = false;
                            }
                            break;
                        }
                        if (ballMidX >= cups[i].hitBounds.left && ballMidX <= cups[i].hitBounds.right &&
                            ballMidY <= cups[i].y + cups[i].height && ballMidY >= cups[i].hitBounds.bottom) {
                            ball.velocity.x *= ball.restitution;
                            ball.velocity.z *= ball.restitution;
                        }
                }
            }
        }
        if (!game.inMatch) {
            global.shots = shotsTaken;
            global.hit = cupsHit;
            startX = 0;
            startY = 0;
            endX = 0;
            endY = 0;
            m = 0;
            sizeMult = 0;
            cupsHit = 0;
            shots = 0;
            shotsMade = 0;
            canShoot = true;
            wasReset=true;
            lastY = 0;
            clearInterval(loopTimer);
        }
    }
    /*
    if (ball.position.x > width) {
        ball.velocity.x *= ball.restitution;
        ball.position.x = width - ball.radius;
    }
    if (ball.position.x < 0) {
        ball.velocity.x *= ball.restitution;
        ball.position.x = ball.radius;
    }
    */

    /*if (ball.position.z < 0 - (size + sizeMult) || ball.position.z > (size + sizeMult)) {
        resetBall();
    }
    if (ball.position.x < 0 - (size + sizeMult) || ball.position.x >= 800 + (size + sizeMult)) {
        resetBall();
    }*/

    

    //console.log(`x: ${ball.position.x} y: ${ball.position.y} z: ${ball.position.z} midx: ${ballMidX} midy: ${ballMidY} sizeMult: ${sizeMult}`);
    // Draw the ball
    ctx.clearRect(0,0,width,height);
    
    ctx.save();
    
    /*
    ctx.beginPath();
    ctx.arc(0, 0, ball.radius, 0, Math.PI*2, true);
    ctx.fill();
    ctx.closePath();
    */
    renderCups();
    sizeMult = 0.3 * (800 - ball.position.y);
    if (global.myturn) {
        ctx.drawImage(images.ball, ball.position.z, ball.position.x, size + sizeMult, size + sizeMult);
        if (mouse.isDown) {
            ctx.drawImage(images.dash, 0, 325, 1000, 25);
        }
    }
    if (!global.myturn) {
        ctx.fillStyle = "#e00909";
        ctx.font = "bold 16px Arial";
        ctx.fillText("it is not your turn", 400, 400);
    }
    ctx.restore();
}
