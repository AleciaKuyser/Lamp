
// the output canvas fills the screen
var canvas
const outWidth = innerWidth
const outHeight = innerHeight
const outAspect = outWidth / outHeight

// the offscreen graphics has independent width and height
var graphics
const drawWidth = 800 // 20 tiles
const drawHeight = 600 // 15 tiles

var filter

// aspect ratio to render the graphics to the canvas with
const renderAspect = 1.333
// if the render aspect is greater than the output aspect, fit the height, otherwise the width
const renderHeight = renderAspect < outAspect ? outHeight : outWidth / renderAspect
const renderWidth = renderHeight * renderAspect
// the "bars" that appear at the sides or top of the screen
let calcbar = (render, output) => Math.abs(output - render) / 2
const xbar = calcbar(renderWidth, outWidth)
const ybar = calcbar(renderHeight, outHeight)

// conceptual camera, used to translate worldspace into screenspace
var cam = {
    pos: null,
    w: drawWidth,
    h: drawHeight,
    coll: "rect",
    lag: drawHeight * 20,
}
var zoom

let setZoom = (z) => z > 1 ? setZoom(1) : z < 0.6 ? setZoom(0.6) : zoom = newZoom(zoomSize(z), z)

let zoomSize = (z) => createVector(drawWidth, drawHeight).mult(z)

let newZoom = (size, z) => ({
    size: size,
    offset: createVector(calcbar(size.x, drawWidth), calcbar(size.y, drawHeight)),
    value: z
})

let setCamera = (x, y) => cam.pos = createVector(x, y)

/**
 * Attempt to move camera by the movement vector, or towards the player if the player is offcentre
 * @param {p5.Vector} move the movement
 */
// let moveCamera = () => camChasePlayer() ? fixMoveCamera(ray(player.pos, cam.pos).normalize().mult(player.speed)) : false
let moveCamera = () => mc2(player.pos.copy().add(player.facing.copy().mult(120 * Math.pow(zoom.value, 1.5))), cam.pos)
let mc2 = (target) => moveCam(ray(target, cam.pos), Math.min(cam.lag, sqdist(target, cam.pos) / cam.lag))
let moveCam = (r, lag) => fixMoveCamera(r.normalize().mult(player.speed * Math.min(1, lag / Math.pow(zoom.value, 2))))

/**
 * Should the camera chase the player?
 * @returns {boolean}
 */
let camChasePlayer = () => sqdist(player.pos, cam.pos) >= player.speed * player.speed

/**
 * Move the camera without going out of bounds
 * @param {p5.Vector} move 
 */
let fixMoveCamera = (move) => cam.pos.add([camInBounds(move, "x") ? move.x : 0, camInBounds(move, "y") ? move.y : 0])

/**
 * Checks that the camera's edges will still be in bounds of the world after movement.
 * Camera will get stuck if it ever goes out of bounds further than one movement
 * @param {p5.Vector} move the attempted camera movement
 * @param {"x"|"y"} axis the axis to check bounds of
 * @returns {boolean} camera's edges will be in bounds of the world after the movement
 */
let camInBounds = (move, axis) => axis == "x" ? inBounds(cam.pos.x + move.x, cam.w / 2, world.length * tWidth - cam.w / 2)
                                              : inBounds(cam.pos.y + move.y, cam.h / 2, world[0].length * tHeight - cam.h / 2)

let onScreen = (e) => useCollider(e, cam)

let initCanvas = () => {
    setCamera(3670.999, 1510.999)
    // setCamera(3539.9999, 459.9999)
    setZoom(1)
    // we want the player to be able to right click, so disable the context menu
    canvas = createCanvas(outWidth, outHeight).elt
    canvas.addEventListener("contextmenu", (e) => e.preventDefault())
    canvas.focus()
    // we want a clean blocky look, not a blurry one
    noSmooth()
    setAttributes('antialias', false)
    graphics = createGraphics(drawWidth, drawHeight)
    filter = createGraphics(drawWidth, drawHeight, WEBGL)
}

// render the graphics to the canvas using 
let render = (g) => image(g, xbar, ybar, renderWidth, renderHeight, // position and size to draw to canvas
                        zoom.offset.x, zoom.offset.y, zoom.size.x, zoom.size.y) // rectangle defining what part of the graphics to draw from

let worldToScreen = (pos) => [pos.x - cam.pos.x + cam.w / 2, pos.y - cam.pos.y + cam.h / 2]

let screenToWorld = (pos) => [pos.x + cam.pos.x - cam.w / 2, pos.y + cam.pos.y - cam.h / 2]

let canvasToWorld = (x, y) => createVector((x / outWidth * drawWidth) + cam.pos.x - cam.w / 2, 
                                           (y / outHeight * drawHeight) + cam.pos.y - cam.h / 2)

let madnessEffects = () => {
    filter.clear()
    let madness = player.madness.current / player.madness.max
    
    // shader() sets the active shader with our shader
    filter.shader(waveshader);
    
    // // lets just send the cam to our shader as a uniform
    waveshader.setUniform('tex0', graphics);
    
    // // send a slow frameCount to the shader as a time variable
    waveshader.setUniform('time', frameCount * Math.pow(madness, 3) / 20);

    // // send the two values to the shader
    waveshader.setUniform('frequency', madness * 5);
    waveshader.setUniform('amplitude', Math.pow(madness, 3) / 80);
    // filter.image(graphics, drawWidth / -2, drawHeight / -2, drawWidth, drawHeight)
    filter.rect(0, 0, drawWidth, drawHeight)
}