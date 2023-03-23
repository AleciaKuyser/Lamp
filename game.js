
/**
 * draw the main game
 */
let drawGame = () => {
	graphics.clear()
	drawWorld()
	// obstacles.forEach(e => ifOnScreen(e, drawObstacle))
	Object.values(items).forEach(e => e.inWorld ? ifOnScreen(e, drawItem) : false)
	Object.values(attacks).forEach(a => drawAttack(a))
	drawPlayer()
	drawLighting()
	Object.values(enemies).forEach(e => ifOnScreen(e, drawEnemy))
}

/**
 * array of collisions that have already occured
 * @type {[{e1:id, t1:type, e2:id, t2:type}]}
*/
let collided = []

/** update the main game loop */
let updateGame = () => {
	Object.values(enemies).forEach(e => ifNearScreen(e, updateEnemy))
	// obstacles.forEach(o => updateObstacle(o))
	updateAttacks()
	updateItems()
	updatePlayer()
	updateWorld()
    updateLight()
	updatePlayerGlow()
	updateCollision()
	collided.forEach(c => handleCollision(c))
	collided = []
}

var msg = ""
var msgTimer = 0

let overlayMsg = () => {
	if (msg == "")	return
	noStroke()
	fill(200, 180, 0, msgTimer * 3)
	textSize(renderWidth / 25)
	textAlign(CENTER)
	text(msg, xbar, ybar + yUnit, renderWidth, yUnit * 5)
	msgTimer--
	if (msgTimer == 0) msg = ""
}

/**
 * Sets {@link game.transition} to the current {@link game.state}, then {@link game.state} to {@link newState}
 * @param  {String} newState name of state to change to
 * @returns value returned by appropriate onChange function
 */
let gameTransition = (newState) => {
	endState[game.state]()
    game.transition.previous = game.state
    game.state = newState
    game.transition.fromTimer = game.timer
	game.transition.toTimer = game.timer
	initState[newState]()
}

var endState = {
	menu: () => { menContainer.remove(); stopSound("title"); loopSound("ambient") },
	game: () => { stopSound("madloop") },
	inv: () => { inventory.remove() },
	dead: () => { restartButton.remove() },
	exit: () => { restartButton.remove() },
}

var initState = {
	menu: () => { menContainer = genMenu(); loopSound("title") },
	game: () => { loopSound("madloop"); setVol("madloop", 0) },
	inv: () => { inventory = genInventory() },
	dead: () => { restartButton = genRestartButton(); stopSound("ambient") },
	exit: () => { restartButton = genRestartButton(); stopSound("ambient") },
}

let genRestartButton = () => menButton(outWidth / 2 - xUnit * 10, outHeight / 2 + yUnit * 10, xUnit * 20, yUnit * 8, "Restart", () => location.reload())

var difficulties = {
	"Barely a Shadow": {
		stunMult: 2, // enemy stun time multiplier
		lightMult: 2.5, // light damage multiplier
		oilMult: 0.5, // oil consumption multiplier
		speedMult: 0.8, // enemy speed multiplier
		madMult: 0.5, // multiplier for madness
		damMult: 1 // multiplier for damage taken from enemies
	},
	"Dowsed with Darkness": {
		stunMult: 1, // enemy stun time multiplier
		lightMult: 1.5, // light damage multiplier
		oilMult: 1, // oil consumption multiplier
		speedMult: 1, // enemy speed multiplier
		madMult: 1, // multiplier for madness
		damMult: 1 // multiplier for damage taken from enemies
	},
	"Penumbra": {
		stunMult: 0.5, // enemy stun time multiplier
		lightMult: 0.8, // light damage multiplier
		oilMult: 1.5, // oil consumption multiplier
		speedMult: 1.3, // enemy speed multiplier
		madMult: 2, // multiplier for madness
		damMult: 1.5 // multiplier for damage taken from enemies
	}
}

var difficulty = difficulties["Dowsed with Darkness"]

let genMenu = () => {
	let cont = createDiv()
	// button to start the game
	menButton(outWidth / 2 - xUnit * 10, outHeight / 2 + yUnit * 3, xUnit * 20, yUnit * 8, "Start Game", () => gameTransition("game")).parent(cont)
	// dropdown to select difficulty, which will correspond to a modifier for some numbers
	createDiv("Difficulty").position(outWidth / 2 - xUnit * 3, outHeight / 2 + yUnit * 12).size(xUnit * 6, yUnit * 1.5).parent(cont).class("diffLabel")
	let sel = createSelect("Difficulty", "Dowsed with Darkness").parent(cont).class("difficulty")
	sel.position(outWidth / 2 - xUnit * 7, outHeight / 2 + yUnit * 13.8)
	sel.size(xUnit * 14, yUnit * 2.5)
	sel.option('Barely a Shadow')
	sel.option('Dowsed with Darkness')
	sel.option('Penumbra')
	sel.selected("Dowsed with Darkness")
	sel.changed(() => difficulty = difficulties[sel.value()])
	// checkbox for simple lighting (since I already have code for it)
	createDiv("Lighting").position(outWidth / 2 - xUnit * 3, outHeight / 2 + yUnit * 17).size(xUnit * 6, yUnit * 1.5).parent(cont).class("diffLabel")
	let checkbox = createCheckbox('Smooth Lighting', false).parent(cont).class("lighting")
	checkbox.position(outWidth / 2 - xUnit * 4, outHeight / 2 + yUnit * 18.8)
	checkbox.size(xUnit * 8, yUnit * 1.5)
	checkbox.changed(() => {
		simpleLight = checkbox.checked()
		checkbox.child()[0].childNodes[1].textContent = simpleLight ? "Simple Lighting" : "Smooth Lighting"
	})
	return cont
}

var restartButton

let overlayEnd = (death) => {
	push()
	noStroke()	
	fill(0, 220 - game.transition.toTimer / 2)
	rect(xbar, ybar, renderWidth, renderHeight)
	textSize(renderWidth / 7)
	textAlign(CENTER)
	if (death)	overlayDeath()
	else 		overlayExit()
	if (game.transition.toTimer > 0)	game.transition.toTimer--
	pop()
}

let overlayDeath = () => {
	let trans = 255 - game.transition.toTimer
	fill(trans, 0, 0, trans)
	if (player.hp.current <= 0) {
		endText("YOU DIED", yUnit * 5)
	} else {
		endText("YOU LOST", yUnit * 15)
		endText("YOUR MIND", yUnit * 2)
	}
}

let overlayExit = () => {
	let trans = 255 - game.transition.toTimer
	fill(trans - 55, trans - 20, trans, trans)
	endText("YOU", yUnit * 15)
	endText("ESCAPED", yUnit * 2)
}

let endText = (msg, y) => text(msg, xbar, ybar + renderHeight / 2 - y, renderWidth, yUnit * 20)

/**
 * contains the game state, and the correct functions to call for new game states
 */
 var game = {
	state: "menu",
    timer: 255,
    transition: {
        previous: "reset",
        fromTimer: 100,
		toTimer: 100,
    },
	draw: {
		// init: drawInit(), // loading
		menu: drawMenu, // main menu
		game: drawGame, // main game loop
		// for both below, draw paused game in background
		dead: () => {}, // after player dies
		exit: () => {},
		inv: drawGame, // inventory
	},
	update: {
		menu: () => {},
		game: updateGame,	
		dead: () => {},
		exit: () => {},
		inv: () => {}
	},
	overlay: {
		menu: overlayMenu,
		game: () => { overlayHUD(); overlayMsg() },
		dead: () => overlayEnd(true),
		exit: () => overlayEnd(false),
		inv: overlayHUD,
	},
}