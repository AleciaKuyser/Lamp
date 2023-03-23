
/**
 * Returns the furthest cell along the path that the entity can traverse
 * @param {entity} e
 * @param {p5.Vector} start position
 * @param {p5.Vector} end position
 * @returns {p5.Vector} cell
 */
let furthestTraverse = (e, start, end) => {
    let curr = worldToCell(start)
    for (const cell of getCells(start, end)) {
        if (canTraverse(e, cell.x, cell.y)) curr = cell
        else return curr
    }
}

/**
 * Checks that the path between the two entities is traversable by e1
 * @param {entity} e1 the checking entity
 * @param {entity} e2 the target entity
 * @returns {boolean}
 */
let clearPath = (e1, e2) => clearCorners(corners(e1), corners(e2))

/**
 * True if the entity can traverse the path between each corresponding pair of corners
 * @param {entity} e the traversing entity
 * @param {p5.Vector[]} cs1 corners of traversing entity
 * @param {p5.Vector[]} cs2 corners of target, should be same length as cs1
 * @returns {boolean}
 */
let clearCorners = (e, cs1, cs2) => cs1.every((c, i) => traversableLine(e, c, cs2[i]))

/**
 * Checks if the entity can traverse every cell along the line between the points
 * @param {entity} e the traversing entity
 * @param {p5.Vector} p1 the starting position
 * @param {p5.Vector} p2 the end position
 * @returns {boolean}
 */
let traversableLine = (e, p1, p2) => getCells(p1, p2).every(cell => canTraverse(e, cell.x, cell.y))

/**
 * Check if e1 can see e2
 * @param {entity} e1 
 * @param {entity} e2 
 * @returns {boolean}
 */
let canSee = (e1, e2) => seeCorners(corners(e1), corners(e2))

const cornerOffs = [[-1, -1], [1, -1], [1, 1], [-1, 1]]

let corners = (e) => cornerOffs.map(c => corner(e.pos, e.w * c[0], e.h * c[1]))

/**
 * True if there is los between any corresponding pair of corners
 * @param {p5.Vector[]} cs1 corners of observer
 * @param {p5.Vector[]} cs2 corners of target, should be same length as cs1
 * @returns {boolean}
 */
let seeCorners = (cs1, cs2) => cs1.some((e, i) => los(e, cs2[i]))

/**
 * Checks whether there is line of sight between two points
 * @param {p5.Vector} p1 position 1
 * @param {p5.Vector} p2 position 2
 * @returns {boolean}
 */
let los = (p1, p2) => getCells(p1, p2).every(cell => !tiles[world[cell.x][cell.y].tile].opaque)

/**
 * Determines whether e1 can hear e2.
 * Currently just a euclidian distance check, may be updated for noise mechanics
 * @param {entity} e1 entity listening
 * @param {entity} e2 entity to be heard
 * @returns {boolean}
 */
let canHear = (e1, e2) => sqdist(e1.pos, e2.pos) <= sqhearing(e1.fsm[e1.state].hearing * 40)

let sqhearing = (hearing) => hearing * hearing