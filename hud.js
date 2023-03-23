
/**
 * Draw gameplay HUD elements to the canvas
 */
let overlayHUD = () => {
    HUD.madness()
    HUD.HP()
    Object.values(player.held).forEach((e, i) => HUD.equip(e, i))
}

var inventory

let genInventory = () => {
    let inv = createDiv().class("scroll-container")
    inv.position(renderWidth - 210 * xRatio + xbar, ybar)
    inv.size(220 * xRatio, renderHeight - 120 * yRatio)
    player.items.forEach(id => invItem(id).parent(inv))
    return inv
}

let invItem = (id) => {
    let item = items[id]
    let itemContainer = createDiv().class("item-container")

    // image button to use item
    let img = menImage(item.img, 0, 0, 80 * xRatio, 80 * yRatio, item.text, () => { useItem(id); gameTransition("inv"); })
    img.parent(itemContainer)
    // darken if on cooldown
    img.style(`filter`, `brightness(${item.timer > 0 ? 30 : 100}%)`)

    // equip buttons
    let buttonContainer = createDiv().parent(itemContainer)
    // button to equip left
    menButton(0, 0, 120 * xRatio, 40 * yRatio, "Left", () => equip(id, "left")).parent(buttonContainer)
    // button to equip right
    menButton(0, 0, 120 * xRatio, 40 * yRatio, "Right", () => equip(id, "right")).parent(buttonContainer)
    return itemContainer
}

const xUnit = renderWidth / 60
const yUnit = renderHeight / 60
const itemSize = renderWidth / 9
const xRatio = renderWidth / drawWidth
const yRatio = renderHeight / drawHeight

let HUD = {
    madness: () => { /* use madness to select correct madness icon */ 
        image(getImg(`madness${Math.floor((player.madness.current / player.madness.max) * 4)}`), xbar, ybar, xRatio * 60, yRatio * 60)
    },
    HP: () => {
        gauge(xbar + xUnit * 4, ybar + yUnit * 2, xUnit * 12, player.hp.current / player.hp.max, 'red', '#33000066')
         /* draw background rect, then rect using current/max */ 
    },
    equip: (id, hand) => {
        push()
        item = items[id]
        let aspect = item.w / item.h
        let h = aspect > 1 ? itemSize / aspect : itemSize
        let w = h * aspect
        let x = xbar + xUnit * 3 + hand * (renderWidth - xUnit * 6 - w), y = outHeight - yUnit * 3
        overlayRect(x - xUnit / 2, y - h - yUnit / 2 - ybar, w + 2 * xUnit / 2, h + 2 * yUnit / 2, "#00000066", 'black', 4)
        if (item.timer > 0) tint(120 * (1 - (item.timer / item.cooldown)) + 80)
        imageMode(CENTER)
        image(getImg(item.img), x + itemSize / 2, y - h - ybar + itemSize / 2, w, h)
        if (item.timer > 0) noTint()
        if (item.type == "lamp") gauge(x, y + yUnit, w, item.oil / item.maxoil, 'black', '#BBBBBB66')
        /* draw rect for background; draw item image; draw additional item properties (e.g. lamp oil gauge) */ 
        pop()
    },
}

/**
 * @type {p5.Element} start button html element
 */
var menContainer

/**
 * The graphics rendered to graphics for the main menu
 */
let drawMenu = () => {
    graphics.clear()
    graphics.noStroke()
    for (let frac = 1; frac > 0; frac -= 0.04) {
        graphics.fill(lerpColor(color("#554444"), color("#221111"), frac))
        let w = drawWidth * frac, h = drawHeight * frac
        graphics.rect((drawWidth - w) / 2, (drawHeight - h) / 2, w, h)
    }
}

/**
 * The graphics rendered to the canvas for the main menu
 */
let overlayMenu = () => {
	textSize(renderWidth / 7)
	fill("#FFDDDD")
	textAlign(CENTER)
    text("LAMP", outWidth / 2, outHeight / 2)
}

/** ratio of height to width */
const gaugeratio = 0.1
/** ratio of margin to width */
const gaugemargin = 0.015

/**
 * Draws a gauge on the canvas
 * @param {number} xPos top-left x
 * @param {number} yPos top-left y
 * @param {number} width 
 * @param {number} fill fill ratio, 0 to 1
 * @param {p5.Color} col gauge colour
 * @param {p5.Color} bgcol gauge background colour
 */
let gauge = (xPos, yPos, width, fill, col, bgcol) => {
    let height = width * gaugeratio, margin = width * gaugemargin
    overlayRect(xPos, yPos, width, height, bgcol) // background
    overlayRect(xPos + margin, yPos + margin, (width - 2 * margin) * fill, height - 2 * margin, col) // gauge
}

/**
 * Uses beginShape() to create a rectangle on the canvas
 * @param {number} x top-left x position
 * @param {number} y top-left y position
 * @param {number} width 
 * @param {number} height 
 * @param {p5.Color} col fill colour
 * @param {p5.Color} line line colour
 * @param {number} weight line weigth
 */
let overlayRect = (x, y, width, height, col, line, weight) => {
    col ? fill(col) : noFill()
    line ? stroke(line) : noStroke()
    weight ? strokeWeight(weight) : noStroke()
	beginShape()
	vertex(x, y)
	vertex(x + width, y)
	vertex(x + width, y + height)
	vertex(x, y + height)
	endShape(CLOSE)
}

/**
 * Creates a HTML button that will refocus the canvas after click
 * @param {number} x top-left x position
 * @param {number} y top-left y position
 * @param {number} w button width
 * @param {number} h button height
 * @param {string} text button text
 * @param {function} onclick onclick function
 * @returns {p5.Element} the button HTML element
 */
let menButton = (x, y, w, h, text, onclick) => {
	let button = createButton(text)
	button.position(x, y)
	button.size(w, h)
	button.mousePressed(() => { onclick(); canvas.focus() })
	return button
}

/**
 * Creates a clickable HTML image that will refocus the canvas after click
 * @param {p5.Image} img the image
 * @param {number} x top-left x position
 * @param {number} y top-left y position
 * @param {number} w image width
 * @param {number} h image height
 * @param {string} text hover text
 * @param {function} onclick onclick function
 * @returns {p5.Element} the HTML image element
 */
let menImage = (img, x, y, w, h, text, onclick) => {
    let image = createImg(`./imgs/${img}.png`)
    image.position(x, y)
    image.size(w, h)
    image.attribute("title", text)
    image.mousePressed(() => { onclick(); canvas.focus(); })
    return image
}
