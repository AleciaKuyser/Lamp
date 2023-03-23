
let handleCollision = (c) => interact[c[0][1]][c[1][1]](getEntity(...c[0]), getEntity(...c[1]))

var canCollide = {
    enemy: { enemy:true, player:true, attack:true, item:false },
    player: { enemy:true, player:false, attack:false, item:true },
    attack: { enemy:true, player:false, attack:false, item:false },
    item: { enemy:false, player:true, attack:false, item:false, }
}

/**
 * uses {@link collideWith} to recursively collide every object in the list with every other object in the list exactly once
 * @param {string[][]} ets array of entity-type entries
 * @returns 
 */
let collideEntities = (ets) => ets.length > 1 ? collideWith(...ets) : true

/**
 * collides the first entity in the list with the rest of the list, then calls {@link collideEntities} to recurse through the list
 * @param  {string[]} et0 first entity-type entry
 * @param {string[][]} ets unrolled array of other entity-type entries
 * @returns 
 */
let collideWith = (et0, ...ets) => ets.length > 0 ? collideEntities(ets, ets.forEach(et => collide(et0, et))) : false

/**
 * If the first entity is colliding with the second entity, add the collision to the collided list
 * @param {string[]} et1 entity-type entry
 * @param {string[]} et2 
 * @returns false if no collision, otherwise new length of collided list
 */
let collide = (et1, et2) => canCollide[et1[1]][et2[1]] && !hasCollided(et1, et2) && useCollider(getEntity(...et1), getEntity(...et2)) 
                            ? collided.push([et1, et2]) : false

/**
 * Check if a collision between {@link e1} and {@link e2} has already occured this frame
 * @param {string[]} et1 
 * @param {string[]} et2 
 * @returns true if a collision between e1 and e2 has already happened, otherwise undefined
 */
let hasCollided = (et1, et2) => collided.some(c => sameCollision(c, [et1, et2]))

/**
 * Check if two collisions are between the same entities.
 * Order of entities doesn't matter
 * @param {collision} c1 
 * @param {collision} c2 
 * @returns {boolean} true if they are the same collision, otherwise false
 */
let sameCollision = (c1, c2) => sameColl(c1, c2) || sameColl(c1, c2.reverse())

/**
 * Check if two collisions are between the same entities.
 * Order of entities DOES matter
 * @param {collision} c1 
 * @param {collision} c2 
 * @returns {boolean}
 */
let sameColl = (c1, c2) => c1.every((c, i) => c.every((e, j) => e == c2[i][j]))

/**
 * Selects the appropriate collision function and calculates collision
 * @param {object} e1 the first entity
 * @param {object} e2 the second entity
 * @returns {boolean} whether the two entities are colliding
 */
let useCollider = (e1, e2) => e1 && e2 ? collider[e1.coll][e2.coll](e1, e2) : false

/**
 * Collision between two rectangular entities
 * @param {object} rec1 the first entity
 * @param {object} rec2 the second entity
 * @returns {boolean} whether their bounding rectangles overlap
 */
let rectrect = (rec1, rec2) => overlap(rec1.pos.x, rec2.pos.x, rec1.w, rec2.w) 
                            && overlap(rec1.pos.y, rec2.pos.y, rec1.h, rec2.h)

/**
 * Function to determine whether two entities overlap along an axis
 * @param {number} pos1 position of entity 1 along axis
 * @param {number} pos2 position of entity 2 along axis
 * @param {number} size1 size of entity 1 along axis
 * @param {number} size2 size of entity 2 along axis
 * @returns {boolean} whether the distance along the axis is less than the sum of halfsizes
 */
let overlap = (pos1, pos2, size1, size2) => Math.abs(pos1 - pos2) <= (size1 + size2) / 2

/**
 * Collision between two circular entities. 
 * Compares square distances for greater efficiency.
 * @param {object} circ1 the first entity
 * @param {object} circ2 the second entity
 * @returns {boolean} whether the circles overlap
 */
let circlecircle = (circ1, circ2) => p5.Vector.sub(circ1.pos, circ2.pos).magSq() <= Math.pow(circ1.r + circ2.r, 2)

let circlecone = (circ, cone) => compTheta(circ, cone) && circlecircle(circ, cone)

let conecone = (con1, con2) => compTheta(con1, con2) && compTheta(con2, con1) && circlecircle(con1, con2)

/**
 * Collision between a circlular and a rectangular entity.
 * Uses square distance for greater efficiency.
 * @param {object} circ the circular entity
 * @param {object} rect the rectangular entity
 * @returns {boolean} whether the circle and square overlap
 */
let circlerect = (circ, rect) => sqdist(circ.pos, crClosest(circ, rect)) < circ.r * circ.r

let conerect = (cone, rect) => compTheta(rect, cone) && circlerect(cone, rect)

let compTheta = (e, cone) => 1 - ray(e.pos, cone.pos).normalize().dot(cone.facing) <= cone.spread

/**
 * Finds the closest corner to the circle, or returns
 * the circle's position if the circle is inside the rectangle
 * @param {object} circ the circular entity
 * @param {object} rect the rectangular entity
 * @returns {p5.Vector} the closest point to the circle
 */
let crClosest = (circ, rect) => createVector(clamp(circ.pos.x, ...axisBounds(rect.pos.x, rect.w)),
                                             clamp(circ.pos.y, ...axisBounds(rect.pos.y, rect.h)))

/**
 * Calculates the square distance between two vectors
 * so distances can be compared without square root
 * @param {p5.Vector} v1 the point to subtract from
 * @param {p5.Vector} v2 the point to subtract
 * @returns {number} the square distance between the vectors
 */
let sqdist = (v1, v2) => p5.Vector.sub(v1, v2).magSq()

/**
 * If the number is out of bounds, return the bound, otherwise the number
 * @param {number} num the number to clamp
 * @param {number} min the lower bound
 * @param {number} max the upper bound
 * @returns {number} num, min or max as appropriate
 */
let clamp = (num, min, max) => Math.max(Math.min(num, max), min)

/**
 * @param {p5.Vector} pos the centre
 * @param {number} offx offset from centre in the x direction
 * @param {number} offy offset from centre in the y direction
 * @returns {p5.Vector} new vector adding the offsets to the corner
 */
let corner = (pos, offx, offy) => p5.Vector.add(pos, [offx, offy])

/**
 * Collider function table, rearranges arguments as appropriate
 */
var collider = {
    circle: {
        circle: circlecircle,
        rect: circlerect,
        cone: circlecone
    },
    rect: {
        circle: (rec, circ) => circlerect(circ, rec),
        rect: rectrect,
        cone: (rec, con) => conerect(con, rec)
    },
    cone: {
        circle: (con, circ) => circlecone(circ, con),
        rect: conerect,
        cone: conecone
    }
}

// /**
//  * is the point within the bounds of the rectangle
//  * @param {p5.Vector} pos point we're checking
//  * @param {number} left left edge
//  * @param {number} right right edge
//  * @param {number} top top edge
//  * @param {number} bottom bottom edge
//  * @returns {boolean} whether the point is within the bounds of the rect
//  */
// let inrect = (pos, left, right, top, bottom) => inBounds(pos.x, left, right) && inBounds(pos.y, top, bottom)

// /**
//  * @param {p5.Vector} pos position of the rect
//  * @param {p5.Vector} rect height and width of the rect
//  * @returns {number[4]} [left x bound, right x bound, top y bound, bottom y bound]
//  */
// let rectBounds = (pos, rect) => [...axisBounds(pos.x, rect.x), ...axisBounds(pos.y, rect.y)]

/**
 * @param {number} pos centre position of rect along axis
 * @param {number} size size of rect along that axis
 * @returns {number[2]} the bounds of the rect along the axis
 */
let axisBounds = (pos, size) => ((pos, size) => [-size, size].map(e => pos + e)) (pos, Math.floor(size / 2))

/** top, right, bottom, left */
const edges = [[0, -1], [1, 0], [0, 1], [-1, 0]]

/**
 * Moves the entity by as much movement as possible, without entering cells the entity cannot traverse.
 * Updates the entity's position in the world grid.
 * Works on the assumption that an entity never moves more than one cell per frame
 * @param {entity} e entity to move
 * @param {string} type type of entity
 * @param {p5.Vector} move movement vector
 */
let updatePos = (e, type, move) => {
    // need the position and move separate for the calculation
    let changes = cellChanges(e, move)

    let validEdges = []
    // 
    e.pos.add(move)
    changes.forEach((dir, i) => {
        if (!dir) return
        let cells = edgeCells(e, edges[i])
        let valid = cells.every(cell => canTraverse(e, cell.x, cell.y))
        // if the move isn't valid, we need to remove the movement in this axis from the vector
        if (!valid) e.pos.sub([edges[i][0] ? move.x : 0, edges[i][1] ? move.y : 0])
        // if the move is valid, we don't modify the movement vector, but we do update the world
        else validEdges.push(edges[i])
    })

    validEdges.forEach(edge => 
        updateCells(e, type, edge[0] ? move.x * edge[0] : move.y * edge[1], edge)
    )
}

/**
 * Add or remove from cells as appropriate
 * @param {entity} e the entity
 * @param {string} type the type of entity
 * @param {number} u move * edge
 * @param {-1|1|0[]} edge 
 */
let updateCells = (e, type, u, edge) => 
        // positive means edge and move are in the same direction, so we add to new cells
        u > 0 ? edgeCells(e, edge).forEach(c => addToCell(e.id, type, c)) :
        // negative means edge and move are opposite, so we remove from old cells
        u < 0 ? edgeCells(e, edge).forEach(c => remFromCell(e.id, c.add(edge))) : false

/**
 * @param {object} e the entity moving
 * @param {p5.Vector} move movement vector
 * @returns {-1|1|0[]} the directions in which the entity has changed cell - positive or negative along the axis
 */
let cellChanges = (e, move) => [axisChange(e.pos.y - e.h / 2, move.y, tHeight), axisChange(e.pos.x + e.w / 2, move.x, tWidth), 
                                axisChange(e.pos.y + e.h / 2, move.y, tHeight), axisChange(e.pos.x - e.w / 2, move.x, tWidth)]

/**
 * (p % t + o) is greater than t if the move goes across the cell boundary in the positive direction,
 * or less than 0 if the move goes across the cell boundary in the negative direction
 * @param {number} p current position along axis
 * @param {number} m movement along axis
 * @param {number} t size of cell along axis
 * @returns {-1|1|0} return direction of axis change, or 0 if no axis changes
 */
let axisChange = (p, m, t) => ((a, t) => a >= t ? 1 : a < 0 ? -1 : 0) ((p % t) + m, t)

/**
 * Finds the cells the edge of the entity in the movement direction are in
 * @param {entity} e the entity
 * @param {1|-1|0[]} dir the direction of the movement
 * @returns {p5.Vector[]} list of cells along the edge of the entity in that direction
 */
let edgeCells = (e, dir) => axisCells(...edgeCorners(e, dir), [dir[1], dir[0]].map(d => Math.abs(d)))

/**
 * Finds the list of cells from start to end along a given axis
 * @param {p5.Vector} start starting cell
 * @param {p5.Vector} end ending cell
 * @param {"x"|"y"} axis axis we're moving along
 * @returns {p5.Vector[]} list of cells between start and end along that axis
 */
let axisCells = (start, end, dir) => start.equals(end) ? [end] : [start, ...axisCells(start.copy().add(dir), end, dir)]

/**
 * Cellspace corners of the edge of the entity in that direction, 
 * plus the movement in that direction
 * @param {object} e the entity moving
 * @param {-1|1|0[2]} dir the direction along each axis
 * @returns {p5.Vector[2]} the corners of the edge in that direction
 */
 let edgeCorners = (e, dir) => (dir[0] == 0 ? edge(e, e.pos.y + (e.h / 2) * dir[1], "x")                        
                                            : edge(e, e.pos.x + (e.w / 2) * dir[0], "y"))
                                            // convert coordinates from worldspace to cellspace
                                            .map(c => worldToCell(createVector(...c)))

/**
 * Worldspace corners of the given edge
 * @param {entity} e the entity
 * @param {number} edge the position of the edge
 * @param {"x"|"y"} axis the axis we're going along
 * @returns {number[][]} the coordinates of the edge corners
 */
let edge = (e, edge, axis) => axis == "y" ? axisBounds(e.pos.y, e.h).map(b => [edge, b])
                                          : axisBounds(e.pos.x, e.w).map(b => [b, edge])
