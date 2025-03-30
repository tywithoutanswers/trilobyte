
/***
 *       _____                _              _       
 *      / ____|              | |            | |      
 *     | |     ___  _ __  ___| |_ __ _ _ __ | |_ ___ 
 *     | |    / _ \| '_ \/ __| __/ _` | '_ \| __/ __|
 *     | |___| (_) | | | \__ | || (_| | | | | |_\__ \
 *      \_____\___/|_| |_|___/\__\__,_|_| |_|\__|___/
 *                                                   
 *                                                   
 */

FRAMERATE = 60;
GRAVITY = 0.02;

const defaultFish = {
    name: "Default Fish",
    description: "missing description has been replaced by the description of the default fish",
    image: "game_assets/fish.png",
    speed: 0.1,
    edgeRepulsion: 0.5, 
    movement: "wiggle",
    baseChance: 0,
};

/***
 *     __      __        _       _     _          
 *     \ \    / /       (_)     | |   | |         
 *      \ \  / __ _ _ __ _  __ _| |__ | | ___ ___ 
 *       \ \/ / _` | '__| |/ _` | '_ \| |/ _ / __|
 *        \  | (_| | |  | | (_| | |_) | |  __\__ \
 *         \/ \__,_|_|  |_|\__,_|_.__/|_|\___|___/
 *                                               
 */

reeling = false;

captureRate = 0.5; // How quickly captureProgress occurs in % per frame
uncaptureRate = 0.1; // How quickly captureProgress decreases in % per frame 

captureZoneSize = 15; // Size of fish catching zone in % of total capture bar size. Recommended not to exceed 15%
captureProgress = 0; // Progress in % of catching the current fish.

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

currentFish = {};

fishList = { 

    atlanticCod : {
        name: "Atlantic Cod",
        description: "insert description",
        image: "game_assets/atlantic-cod_128.png",
        baseChance: 100,
    },

    commonOctopus : {
        name: "Common Octopus",
        description: "insert description",
        image: "game_assets/common-octopus_128.png",
        speed: 0.3,
        baseChance: 50,
    }
};

fishCaught = {};

/***
 *      _____                 _                                      ______                _   _                 
 *     |  __ \               | |                                    |  ____|              | | (_)                
 *     | |__) |__ _ _ __   __| | ___  _ __ ___  _ __   ___ ___ ___  | |__ _   _ _ __   ___| |_ _  ___  _ __  ___ 
 *     |  _  // _` | '_ \ / _` |/ _ \| '_ ` _ \| '_ \ / _ / __/ __| |  __| | | | '_ \ / __| __| |/ _ \| '_ \/ __|
 *     | | \ | (_| | | | | (_| | (_) | | | | | | | | |  __\__ \__ \ | |  | |_| | | | | (__| |_| | (_) | | | \__ \
 *     |_|  \_\__,_|_| |_|\__,_|\___/|_| |_| |_|_| |_|\___|___|___/ |_|   \__,_|_| |_|\___|\__|_|\___/|_| |_|___/
 *                                                                                                               
 *                                                                                                               
 */

// int between min and max
function randInt(min, max) {
    return (Math.floor(Math.random() * max) + min);
}

// select fish based on weighted random draw, driven by their "baseChance" property.
function selectFishByChance() {
    chanceSum = 0;
    for (field in fishList) {
        chanceSum += fishList[field].baseChance ?? 0;
    }
    randomSelection = randInt(0, chanceSum);
    console.log(randomSelection);
    for (field in fishList) {
        if (randomSelection < fishList[field].baseChance ?? 0) {
            return fishList[field];
        } else {
            randomSelection -= fishList[field].baseChance ?? 0;
            console.log("%d",randomSelection);
        }
    }
    console.error("Something went wrong when selecting a fish by chance");
    return defaultFish;
}

function randomApproxNorm(min,max,n) {
    return 0;
}

/***
 *       _____                         __                  _   _                 
 *      / ____|                       / _|                | | (_)                
 *     | |  __  __ _ _ __ ___   ___  | |_ _   _ _ __   ___| |_ _  ___  _ __  ___ 
 *     | | |_ |/ _` | '_ ` _ \ / _ \ |  _| | | | '_ \ / __| __| |/ _ \| '_ \/ __|
 *     | |__| | (_| | | | | | |  __/ | | | |_| | | | | (__| |_| | (_) | | | \__ \
 *      \_____|\__,_|_| |_| |_|\___| |_|  \__,_|_| |_|\___|\__|_|\___/|_| |_|___/
 *                                                                               
 *                                                                               
 */

// Runs when the page is loaded starting into the gameloop
function init() {
    for (let i = 0; i < 100; i+=1) {
        console.log("%d",randomApproxNorm(0,100,10));
    }

    loadFishAsCurrent(selectFishByChance());
    setInterval(gameloop,1000/FRAMERATE);
}

function newEncounter() {
    captureZone.y = 0;
    captureZone.dy = 0;
    fishZone.y = 0;
    fishZone.dy = 0;
    loadFishAsCurrent(selectFishByChance());
}

function mergeFishWithDefault(fishData) {
    for (const field in defaultFish) { 
        if ( !fishData.hasOwnProperty() ) {
            fishData[field] = defaultFish[field];
        }
    }
}

function loadFishAsCurrent(fishData) {
    // Iterates over
    currentFish = {}; 
    for (const field in defaultFish) { 
        currentFish[field] = defaultFish[field];
    }
    for (const field in fishData) {
        currentFish[field] = fishData[field];
    }
    document.getElementById("fishGraphic").src=currentFish.image;
}



// Contains the code which is run each frame 
function gameloop() {
    


    if (reeling) {
        captureZone.dy = Math.min(1, captureZone.dy + 0.1);
    }
    updatePhysics();
    updateHTML();
    if (captureProgress >= 100) {
        captureProgress = 0;
        fishCaught[currentFish.name] ??= 0;
        fishCaught[currentFish.name] += 1;
        newEncounter();
    } else if (captureProgress < 1) {
        captureProgress = 1;
    }
}

function moveFish() {
     // fish's movement due to fish behaviour 
    switch (currentFish.movement) {
        case "wiggle": 
        
        fishZone.dy += Math.random() * currentFish.speed;
        fishZone.dy -= Math.random() * currentFish.speed;

        if (fishZone.y > 75) {
            fishZone.dy -= Math.random() * currentFish.edgeRepulsion
        }
        if (fishZone.y + fishZone.h < 25) {
            fishZone.dy += Math.random() * currentFish.edgeRepulsion
        }

        fishZone.dy *= 0.99;
        fishZone.dy *= 0.99;

        break;
        case "none":
        break;
        default:
        console.log("movement type missing for current fish");
    }
   

    // update position based on velocity
    fishZone.y += fishZone.dy;

    // bounds check
    if (fishZone.y + fishZone.h > 100) {
        fishZone.y = 100 - fishZone.h;
        fishZone.dy *= -0.3;
    }
    if (fishZone.y < 0) {
        fishZone.y = 0;
        fishZone.dy *= -0.3;
    }
}

// Updates the postion of game objects
function updatePhysics() {
    moveFish();
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

    // Check if the current fish intersects the capture zone
    if (
        fishZone.y + fishZone.h > captureZone.y && //If the top of the fish bound is above the bottom of the capturezone bound 
        fishZone.y < captureZone.y + captureZone.h //If the bottom of the fishzone bound is bellow the top of the capture zone 
    ) {
        // Success, increment captureProgress and show positive capture colour
        captureProgress+=captureRate;
        document.getElementById("progressBar").style = "background-color: green;";
    } else {
        // Failure, decrement captureProgress and show negative capture colour
        captureProgress-=uncaptureRate;
        document.getElementById("progressBar").style = "background-color: blue;";
    }
}

// Updates CSS and HTML of the page to display the current gamestate
function updateHTML() {
    fishZoneElement = document.getElementById("fishZone");
    fishZoneElement.style.bottom = fishZone.y + "%";
    fishZoneElement.style.height = fishZone.h + "%";

    captureZoneElement = document.getElementById("captureZone");
    captureZoneElement.style.bottom = captureZone.y + "%";
    captureZoneElement.style.height = captureZone.h + "%";

    progressBar = document.getElementById("progressBar");
    progressBar.style.height = captureProgress + "%";

    /*
    testing = document.getElementById("testingParagraph");
    testing.innerHTML = "";
    for (field in fishCaught) {
        testing.innerHTML += field + ":" + fishCaught[field] + "<br>";
    }
    */
}

// Prevents default click behaviour
function preventDefault(event) {
    event.preventDefault;
}

function startReel(event) {
    reeling = true;
}

function stopReel(event) {
    reeling = false;
}