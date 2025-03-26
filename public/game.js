// CONSTANTS
FRAMERATE = 60;
GRAVITY = 0.01;
// VARIABLES
captureRate = 1; // How quickly captureProgress occurs in % per frame
uncaptureRate = 0.1; // How quickly captureProgress decreases in % per frame 

captureZoneSize = 15; // Size of fish catching zone in % of total capture bar size. Recommended not to exceed 15%
captureProgress = 0;

fishSpeed = 0.1;

fishZone = {
    y : 0,
    dy : 2,
    h : 5
}
captureZone = {
    y : 0,
    dy : 2,
    h : captureZoneSize
}

function init() {
    setInterval(gameloop,1000/FRAMERATE);
    for (i=0; i < 100; i++) {
        console.log(random.normal(0,1));
    }

}
function gameloop() {
    updatePhysics();
    updateHTML();
}

function updatePhysics() {
    fishZone.dy += Math.random() *fishSpeed;
    fishZone.dy -= Math.random() *fishSpeed;
    fishZone.y += fishZone.dy;
    if (fishZone.y + fishZone.h > 100) {
        fishZone.y = 100 - fishZone.h;
        fishZone.dy *= -0.3;
    }
    if (fishZone.y < 0) {
        fishZone.y = 0;
        fishZone.dy *= -0.3;
    }

    captureZone.dy -= GRAVITY;
    captureZone.y += captureZone.dy;
    if (captureZone.y + captureZone.h > 100) {
        captureZone.y = 100 - captureZone.h;
        captureZone.dy *= -0.5;
    }
    if (captureZone.y < 0) {
        captureZone.y = 0;
        captureZone.dy *= -0.5;
    }

    // Check if the current fish is fully inside the capture zone.
    if (
        fishZone.y > captureZone.y && //If the bottom of the fish bound is above the bottom of the capturezone bound 
        fishZone.y + fishZone.h < captureZone.y + captureZone.h //If the top of the fishzone bound is bellow the top of the capture zone 
    ) {
        // Success, increment captureProgress and show positive capture colour
        captureProgress+=captureRate;
        document.getElementById("captureProgress").style = "background-color: green;";
    } else {
        // Failure, decrement captureProgress and show negative capture colour
        captureProgress-=uncaptureRate;
        document.getElementById("captureProgress").style = "background-color: blue;";
    }
}

function updateHTML() {
    fishZoneElement = document.getElementById("fishZone");
    fishZoneElement.style.bottom = fishZone.y + "%";
    fishZoneElement.style.height = fishZone.h + "%";

    captureZoneElement = document.getElementById("captureZone");
    captureZoneElement.style.bottom = captureZone.y + "%";
    captureZoneElement.style.height = captureZone.h + "%";

    captureProgressElement = document.getElementById("captureProgress");
    captureProgressElement.style.height = captureProgress + "%";
}

function reel(event) {
    event.preventDefault(event);
    captureZone.dy += 1;
}