
/** object to get entity lists from */
var entities = {
	enemy: enemies,
	player: players,
	item: items,
	obstacle: obstacles,
    attack: attacks,
}

/**
 * get an entity object given its id and type
 * @param {string} id id of entity
 * @param {string} type type of entity
 * @returns {entity} entity object
 */
let getEntity = (id, type) => entities[type][id]

/**
 * Finds all cells the entity is in
 * @param {entity} e the entity
 * @returns {p5.Vector[]} the list of cells
 */
let entityCells = (e) => allCells(e.pos.y + e.h / 2, ...(edge(e, e.pos.y - e.h / 2, "x").map(p => createVector(...p))))

/**
 * Finds the list of all cells a rectangle is in
 * @param {number} end the bottom y edge
 * @param {p5.Vector} left the left worldspace corner
 * @param {p5.Vector} right the right worldspace corner
 * @returns {p5.Vector[]} the list of all cells the defined rect is in
 */	
let allCells = (end, left, right) => left.y <= end ? [...axisCells(worldToCell(left), worldToCell(right), [1, 0]), 
                        ...allCells(end, left.add([0, tHeight]), right.add([0, tHeight]))] : []

let drawCentre = (e) => {
	graphics.push()
	graphics.noStroke()
	graphics.fill(0)
	graphics.circle(...worldToScreen(e.pos), 4)
	graphics.pop()
}

let drawBoundingBox = (e) => {
	graphics.push()
	graphics.noFill()
	graphics.stroke(0)
	graphics.strokeWeight(2)
	let screenPos = worldToScreen(e.pos)
	drawRect(screenPos[0] - e.w / 2, screenPos[1] - e.h / 2, e.w, e.h)
	graphics.pop()
}

let drawCellBox = (e) => {
	graphics.push()
	graphics.stroke(0)
	graphics.fill(255)
	drawRect(0, 0, tWidth, tHeight)
	graphics.noStroke()
	graphics.fill('blue')
	graphics.circle((e.pos.x - e.w / 2) % tWidth, (e.pos.y - e.h / 2) % tHeight, 4)
	graphics.fill('red')
	graphics.circle((e.pos.x + e.w / 2) % tWidth, (e.pos.y + e.h / 2) % tHeight, 4)
	graphics.pop()
}

let drawRotEntity = (img, pos, facing, w, h) => {
    graphics.push()
    graphics.imageMode(CENTER)
    graphics.translate(...worldToScreen(pos))
    graphics.rotate(facing.heading() + Math.PI / 2)
    graphics.image(img, 0, 0, w, h)
    graphics.pop()
}