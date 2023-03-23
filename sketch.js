
var waveshader

/**
 * Called by Processing when page loads. Used to load data from files. 
 * Any asynchronous data loading here is guaranteed to finish before {@link setup} is called
 */
function preload() {
	loadImages()	// the images used for graphics are all loaded here
	loadSounds()	// the sounds used are all loaded here
	loadWorld()		// the grid of tiles, as well as initial positions of the enemies, obstacles and items
	// loadPlayer()	// not much to load here honestly
	loadItems()		// item data includes: in-world appearance, icon, appearance on character, extra behaviour
	loadEnemies()	// the graphics, sound and behaviour to use for each enemy
	// loadObstacles()	// anything which isn't an enemy, item or world tile
	waveshader = loadShader('effect.vert', 'effect.frag')
}

/**
 * Called by Processing after asynchronous loading in {@link preload} is finished
 * Performs other initialisation that doesn't include loading data
 */
function setup() {
	textFont("times new roman")
	initCanvas()
	initWorld()
	// initGame()
	initPlayer()
	initLighting()
	initItems()
	initEnemies()
	// initObstacles()
	initState["menu"]()
	userStartAudio()
}

/**
 * Called by Processing once every frame, after {@link preload} and {@link setup} are finished.
 * Uses game state to draw and update the game as appropriate.
 */
function draw() {
	// clear the offscreen graphics and the canvas
	clear()
	background(0)
	
	// draw the current game state to the graphics buffer
	game.draw[game.state]()

	// perform logic to update the gamestate
	game.update[game.state]()

	// render the game to the display canvas
	if (game.state == "game") {
		madnessEffects()
		render(filter)
	} else {
		render(graphics)
	}
	
	// draw the game's overlay elements to the canvas
	game.overlay[game.state]()
		
	overlayFPS()
}

let overlayFPS = () => {
	fill(255)
	textSize(32)
	text(str(frameRate().toFixed(0)), 50, outHeight)
}

/**
 * Called by Processing when left or right mouse button is clicked. 
 * {@link mouseButton} is either "left" or "right" depending on which button was pressed.
 * @returns false if gamestate is not game, otherwise return value of useItem
 */
function mousePressed() {
	game.state == "game" ? useItem(player.held[mouseButton]) : false 
}

/**
 * ascii value of key used to open the inventory - 69 is "e"
 */
const invKey = 'e'

/**
 * Called by Processing when a key is pressed.
 * Opens the menu if {@link invKey} pressed, or closes it if already open.
 * @returns false if menu key not pressed, otherwise the game state
 */
function keyPressed() {
	if (key == invKey) {
		if (game.state == "inv") gameTransition("game") 
		else if (game.state == "game") gameTransition("inv")
	}
}

/**
 * call function on entity if entity is on screen
 * @param  {entity} e
 * @param  {function} fn
 * @returns false if entity not on screen, otherwise return value of function
 */
let ifOnScreen = (e, fn) => onScreen(e) ? fn(e) : false

let ifNearScreen = (e, fn) => nearScreen(e) ? fn(e) : false 

let nearScreen = (e) => Math.abs(e.pos.x - cam.pos.x) < drawWidth * 2 && Math.abs(e.pos.y - cam.pos.y) < drawHeight * 2

/**
 * @param  {string} name name of json array file in data folder
 * @param  {function} callback callback function to call on loaded array (assign to variable this way)
 * @returns do not use
 */
let loadArray = (name, callback) => loadObject(name, (o) => callback(Object.values(o)))

/**
 * @param  {string} name name of json object file in data folder
 * @param  {function} callback callback function to call on loaded object (assign to variable this way)
 * @returns {object} JSON object from file
 */
let loadObject = (name, callback) => loadJSON(`./data/${name}.json`, 'json', callback)
