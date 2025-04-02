
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

const FRAMERATE = 60;
const GRAVITY = 0.02;

const defaultFish = {
    /*basic info*/
    name: "Default Fish",
    description: "missing description has been replaced by the description of the default fish",
    image: "assets/game_assets/fish.png",

    baseChance: 0, // chance to randomly appear
    pointValue: 1,

    /*behavior*/
    wiggleStrength : 0.1, //0.01 - 0.5
    gravity : 0, // constant downwards accel
    feistynessMult : 1.1, // linear multiplier for speed based on current capture progress
    edgeRepel : 0.1, // force applied away from an edge when within 10 units of it
    captureRateMult : 1, // multiplier for how long it takes a fish to capture 
    lungeChance: 0.01, // 0.001 - 0.01 chance to gain a large burst of speed each frame 
    lungePower: 1, // [1-4] power of a lunge 
    lungeIsJump: false,
    drag: 0.01,
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

let reeling = false;
let captureRate = 0.5;
let uncaptureRate = 0.1;
let captureZoneSize = 15;
let captureProgress = 0;
let encounterFrameTimer = 0.5;

let fishZone = {
    y : 0,
    dy : 2,
    h : 5
}
let captureZone = {
    y : 0,
    dy : 2,
    h : captureZoneSize
}

let currentFish = {};

window.fishList = window.fishList || { 
    dublinBayPrawm : {
        name: "Dublin Bay Prawn",
        description: "insert description",
        image: "/assets/game_assets/dublin-bay-prawn_64.png",
        baseChance: 150,
        pointValue: 10,
        captureRateMult : 3,
        feistynessMult: 0.5,
        wiggleStrength: 0.2,
        lungeChance: 0,
    },
    atlanticCod : {
        name: "Atlantic Cod",
        description: "insert description",
        image: "/assets/game_assets/atlantic-cod_128.png",
        baseChance: 100,
        pointValue: 50,
    },

    commonOctopus : {
        name: "Common Octopus",
        description: "insert description",
        image: "/assets/game_assets/common-octopus_128.png",
        baseChance: 20,
        pointValue: 120,
        
        wiggleStrength: 0.3,
        feistynessMult: 0.5,
    },

    brownCrab : {
        name: "Brown Crab",
        description: "insert description",
        image: "/assets/game_assets/brown_crab.jpeg",
        baseChance: 50,
        pointValue: 40,

        wiggleStrength: 0,
        edgeRepel: 0.01,
        gravity: 0.04,
        lungeChance: 0.015,
        lungePower: 2.4,
        drag : 0.05,
        lungeIsJump: true,
    },

    goldFish : {
        name: "The Gold Fish",
        description: "missing description has been replaced by the description of the default fish",
        image: "/assets/game_assets/fish.png",

        baseChance: 0.1, // chance to randomly appear
        pointValue: 1000,

        /*behavior*/
        wiggleStrength : 0.4, //0.01 - 0.5
        gravity : 0, // constant downwards accel
        feistynessMult : 6.0, // linear multiplier for speed based on current capture progress
        edgeRepel : 0.3, // force applied away from an edge when within 10 units of it
        captureRateMult : 0.3, // multiplier for how long it takes a fish to capture 
        lungeChance: 0.01, // 0.001 - 0.01 chance to gain a large burst of speed each frame 
        lungePower: 0, // [1-4] power of a lunge 
        lungeIsJump: false,
        drag: 0.1,
        }  
};

window.fishCaught = window.fishCaught || {};

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
    let chanceSum = 0;
    for (let field in fishList) {
        chanceSum += fishList[field].baseChance ?? 0;
    }
    let randomSelection = randInt(0, chanceSum);
    console.log(randomSelection);
    for (let field in fishList) {
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
    sum = 0;
    for (i=0; i<n; i++) {
        sum += randInt(min,max);
    }
    return sum / n;
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
function popupClickStart() {
    document.getElementById("gamePopup").style.visibility = "hidden";
}
export function init() {
    loadFishAsCurrent(selectFishByChance());
    setInterval(gameloop, 1000 / FRAMERATE);
}

function newEncounter() {
    fishZone.y = randInt(0,100);
    fishZone.dy = 0;
    captureProgress = 25
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

function catchSuccess() {
    fishCaught[currentFish.name] ??= 0;
    fishCaught[currentFish.name] += 1;
    newEncounter();
}

function catchFail() {
    newEncounter();
}

// Contains the code which is run each frame 
function gameloop() {
    if (reeling) {
        captureZone.dy = Math.min(1, captureZone.dy + 0.1);
    }
    updatePhysics();
    updateHTML();
    if (captureProgress >= 100) {
        catchSuccess();
    } else if (captureProgress < 1) {
        catchFail();
    }
}

function moveFish() {
    let motion = 0;
    //wiggle
    motion += currentFish.wiggleStrength * Math.random();
    motion -= currentFish.wiggleStrength * Math.random();
    //edge repel
    //wiggle
    if (fishZone.y < 10) motion += currentFish.edgeRepel * Math.random();
    if (fishZone.y + fishZone.h > 90) motion -= currentFish.edgeRepel * Math.random();

    //lunge
    if (Math.random() < currentFish.lungeChance) {
        if (currentFish.lungeIsJump || Math.random > 0.5) {
            motion += currentFish.lungePower;
        } else {
            motion -= currentFish.lungePower;
        }
    }
    //feistyness
    motion *= 1 + ( (currentFish.feistynessMult - 1) * (captureProgress / 100) );
    //gravity 
    motion -= currentFish.gravity;

    fishZone.dy *= 1 - currentFish.drag;
    fishZone.dy += motion;


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
        captureProgress+= captureRate * currentFish.captureRateMult;
    } else {
        // Failure, decrement captureProgress and show negative capture colour
        captureProgress-=uncaptureRate * currentFish.captureRateMult;
    }
    let red = Math.round(((100 - captureProgress) / 50) * 255);
    let green = Math.round(( captureProgress / 100) * 255);

    let color = "rgb("+red+","+green+",0)";
    document.getElementById("progressBar").style.backgroundColor = color;
}

// Updates CSS and HTML of the page to display the current gamestate
function updateHTML() {
    let fishZoneElement = document.getElementById("fishZone");
    fishZoneElement.style.bottom = fishZone.y + "%";
    fishZoneElement.style.height = fishZone.h + "%";

    let fishGraphicElement = document.getElementById("fishGraphic");
    fishGraphicElement.style.rotate = (10*fishZone.dy)+"deg";

    let captureZoneElement = document.getElementById("captureZone");
    captureZoneElement.style.bottom = captureZone.y + "%";
    captureZoneElement.style.height = captureZone.h + "%";

    let progressBar = document.getElementById("progressBar");
    progressBar.style.height = captureProgress + "%";

    let sideBarElement = document.getElementById("sideBar");
    let fishCaughtString = "";
    for (let fish in fishCaught) {
        fishCaughtString += fish + ": "
        fishCaughtString += fishCaught[fish] + "<br>"
    }
    sideBarElement.innerHTML = fishCaughtString;
}
// Prevents default click behaviour
export function startReel(event) {
    event.preventDefault();
    reeling = true;
}

export function stopReel(event) {
    event.preventDefault();
    reeling = false;
}

export function preventDefault(event) {
    event.preventDefault();
}

