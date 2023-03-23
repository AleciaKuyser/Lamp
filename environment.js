
/** width of a tile */
const tWidth = 40
/** height of a tile */
const tHeight = 40

/** called by {@link preload} to load world and tile data from files */
let loadWorld = () => {
    world = loadObject("world")
    tiles = loadObject("tiles")
}

/** called by {@link setup} to run post-load initialisation */
let initWorld = () => {
    world = Object.values(world).map(r => Object.values(r).map(e => ({ tile:e.tile, entityTypes:{}, light:0 })))
    updateOnScreenWorld()
}

/**
 * Uses {@link drawTile} to draw every onscreen tile
 */
let drawWorld = () => onScreenWorld.forEach((r, i) => r.forEach((c, j) => {
    drawTile(c.tile, onScreenCellToScreen(i, j))
    // if (Object.keys(c.entityTypes).length > 0) {
    //     graphics.noStroke()
    //     graphics.fill(0)
    //     graphics.circle((i + 0.5) * tWidth - (cam.pos.x - cam.w / 2) % tWidth, (j + 0.5) * tHeight - (cam.pos.y - cam.h / 2) % tHeight, 2)
    // }
}))

/**
 * takes indexes of on-screen world and returns the screensace position of the top left corner
 * @param {number} i x index
 * @param {number} j y index
 * @returns {p5.Vector}
 */
let onScreenCellToScreen = (i, j) => createVector(i * tWidth - (cam.pos.x - cam.w / 2) % tWidth, j * tHeight - (cam.pos.y - cam.h / 2) % tHeight)

/**
 * Adds entity object to world array at cell coordinates
 * @param {string} id id of entity to add
 * @param {string} type type of the entity being added
 * @param {p5.Vector} cell coordinates of cell to add it to
 */
let addToCell = (id, type, cell) => world[cell.x][cell.y].entityTypes[id] = type

/**
 * Add entity to every cell it's in
 * @param {string} id id of the entity to add
 * @param {string} type type of the entity to add
 */
let addEntity = (id, type) => entityCells(getEntity(id, type)).forEach(c => addToCell(id, type, c))

/**
 * Removes every entity with the same id as {@link e} from the cell
 * @param {string} id id of entity to remove
 * @param {p5.Vector} cell coordinates of cell to remove from
 */
let remFromCell = (id, cell) => delete world[cell.x][cell.y].entityTypes[id]

/**
 * Remove entity from every cell it's in
 * @param {entity} e 
 */
let remEntity = (e) => entityCells(e).forEach(c => remFromCell(e.id, c))

/** called by {@link draw} to update properties of the world */
let updateWorld = () => {
    updateOnScreenWorld()
    onScreenWorld.forEach(r => r.forEach(cell => { if (cell.hitTime > 0) cell.hitTime-- }))
}

/** 2D array of world cells, access like world[x][y] */
var world = [[{ tile: "name", entityTypes:{id:"type"}, light: 0 }]]

/** section of {@link world} that is currently on screen */
var onScreenWorld

/** definitions of tile types */
var tiles = {
    name: {
        bgimg: "image name",
        fgimg: "image name",
        travType: "walk",
        destroyed: {
            by: "state"
        },
        opaque: false,
    }
}

/**
 * draws {@link tile} using {@link pos} as the top-left coordinates
 * @param {string} tile the tile name
 * @param {p5.Vector} pos the top-left screenspace position of the tile
 */
let drawTile = (tile, pos) => {
    graphics.push()
    graphics.imageMode(CORNER)
    graphics.image(getImg(tiles[tile].bgimg), pos.x, pos.y, tWidth, tHeight)
    graphics.image(getImg(tiles[tile].fgimg), pos.x, pos.y, tWidth, tHeight)
    // graphics.noStroke()
    // graphics.fill(0)
    // graphics.circle(pos.x, pos.y, 4)
    graphics.pop()
}

/**
 * Use graphics.beginShape() to draw a rect with the given
 * x, y, width and height
 * @param {number} x top-left x
 * @param {number} y top-left y
 * @param {number} width 
 * @param {number} height 
 */
let drawRect = (x, y, width, height) => {
	graphics.beginShape()
	graphics.vertex(x, y)
	graphics.vertex(x + width, y)
	graphics.vertex(x + width, y + height)
	graphics.vertex(x, y + height)
	graphics.endShape(CLOSE)
}

/**
 * Returns whether the given entity can traverse the cell at the given cell coordinates.
 * An entity can traverse a cell if it has the appropriate travType, or if it has the "all" travType.
 * Uses Array.prototype.includes(), as the travTypes list will only be a few items
 * @param {entity} e entity object
 * @param {integer} x 
 * @param {integer} y 
 * @returns {boolean}
 */
let canTraverse = (e, x, y) => e.travTypes.includes("all") || e.travTypes.includes(tiles[world[x][y].tile].travType)

/** uses {@link collideEntities} to perform collision with the entities in every on-screen cell */
let updateCollision = () => onScreenWorld.forEach(row => row.forEach(cell => collideEntities(Object.entries(cell.entityTypes))))

/** the current x bounds of the onsceen world */
let xEdgeI = [0,0]
/** the current y bounds of the onsceen world */
let yEdgeI = [0,0]

/**
 * updates {@link onScreenWorld} to the current on screen world.
 * Uses {@link shouldUpdateOnscreenWorld} to check if the world needs 
 * updating so the slow array slice operation doesn't happen every frame.
 * @returns {object[][]} the new on screen world
 */
let updateOnScreenWorld = () => shouldUpdateOnscreenWorld() ? 
                                onScreenWorld = world.slice(...xEdgeI).map(r => r.slice(...yEdgeI))
                                          : false

/** 
 * Recalculates xEdgeI and yEdgeI and compares to the previous values.
 * If they've changed, then we need to re-slice the world
 */
let shouldUpdateOnscreenWorld = () => {
    let nxEdgeI = edgeIndices(cam.pos.x, cam.w, tWidth, world.length)
    let nyEdgeI = edgeIndices(cam.pos.y, cam.h, tHeight, world[0].length)
    if (nxEdgeI[0] != xEdgeI[0] || nxEdgeI[1] != xEdgeI[1] ||
        nyEdgeI[0] != yEdgeI[0] || nyEdgeI[1] != yEdgeI[1]) {
        xEdgeI = nxEdgeI
        yEdgeI = nyEdgeI
        return true
    }
    return false
}

/**
 * Get the start and end indices of the on-screen world along an axis
 * @param {number} pos position along the axis
 * @param {number} size size of screen along axis
 * @param {number} t size of cell along axis
 * @param {number} len length of world array along axis
 * @returns {number[2]} start and end indices of the on-screen cells along the axis
 */
let edgeIndices = (pos, size, t, len) => [Math.floor((pos - size / 2) / t), Math.ceil((pos + size / 2) / t)].map(e => clamp(e, 0, len))

/**
 * @param {p5.Vector} pos world-space vector
 * @returns {p5.Vector} cell-space vector
 */
let worldToCell = (pos) => createVector(Math.floor(pos.x / tWidth), Math.floor(pos.y / tHeight))

/**
 * @param {p5.Vector} cell cell-space vector
 * @returns {p5.Vector} world-space vector
 */
let cellToWorld = (cell) => createVector(cell.x * tWidth, cell.y * tHeight)
