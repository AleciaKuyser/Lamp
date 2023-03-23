
/** the player */
var player = {
    type: "player",
    id:"player",
    items:["lamp", "knife"],
    coll: "circle",
    pos: null, // vector, position in world space
    facing: null, // vector, unit direction vector
    held: {
        left: "lamp",
        right: "knife",
    },
    w: 55,
    h: 45,
    r: 25,
    wasHurt: false,
    hp: { current: 500, max: 500 },
    madness: { current: 0, max: 50000 },
    speed: 3,
    travTypes: ["walk"],
}

/** players object to make entity code consistent */
var players = {player: player}

/**
 * assigns the item to the specified hand, swaps equipped items if already equipped in other hand
 * @param {string} item item name
 * @param {"left"|"right"} hand the hand to equip the item to
 * @returns {string} item name
 */
let equip = (item, hand) => player.held[otherHand(hand)] == item ? swapEquips() : player.held[hand] = item

/**
 * @param {"left"|"right"} hand the hand
 * @returns {"right"|"left"} the other hand
 */
let otherHand = (hand) => hand == "left" ? "right" : "left"

/**
 * Swaps left and right held items
 * @returns {string[2]} left item, right item
 */
let swapEquips = () => [player.held["left"], player.held["right"]] = [player.held["right"], player.held["left"]]

let initPlayer = () => {
    player.pos = cam.pos.copy()
    player.facing = createVector(0, -1)
    addEntity("player", "player")
}

/** called by {@link draw} every frame the player should be updated */
let updatePlayer = () => {
    playerLook()
    playerMove()
    updateHeld()
    updateHurtSound()
    player.madness.current = Math.max(0, player.madness.current - 20 / difficulty.madMult)
    setVol("madloop", Math.pow(player.madness.current / player.madness.max, 3) / 2)
    checkWin(worldToCell(player.pos))
}

let updateHurtSound = () => {
    if (player.wasHurt) {
        if (!sounds["hurt"].isPlaying())    playSound("hurt")
        // else sounds["hurt"].jump(1, 1)
    } else {
        sounds["hurt"].pause()
    }
    player.wasHurt = false
}

let checkWin = (pos) => { if(world[pos.x][pos.y].tile == "exit") gameTransition("exit") }

let updateHeld = () => Object.values(player.held).forEach(e => updateLamp(items[e]))

let updateLamp = (item) => item && item.type == "lamp" && item.on && item.oil > 0 ? item.oil -= item.oilrate * difficulty.oilMult : false

/** called by {@link draw} every frame the player should be drawn */
let drawPlayer = () => {
    drawRotEntity(getImg("player"), player.pos, player.facing, player.w, player.h)
    // drawCentre(player)
    // drawBoundingBox(player)
    // drawCellBox(player)
}

/** update the player's facing direction to face the current mouse position */
let playerLook = () => player.facing = ray(canvasToWorld(mouseX, mouseY), player.pos).normalize()

/** w, d, s, a */
let moveKeys = [87, 68, 83, 65]
/** up, right, down, left */
let moves = [[0, -1], [1, 0], [0, 1], [-1, 0]]

/**
 * Moves the player by its speed based on which movement keys are currently down
 */
let playerMove = () => {
    let move = createVector(0, 0)
    moveKeys.forEach((e, i) => { if(keyIsDown(e)) move.add(moves[i]) })
    move = move.normalize().mult(player.speed)
    updatePos(player, "player", move)
    moveCamera()
}
