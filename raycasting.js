
// /**
//  * Checks if line between s1 and e1 intersects line between s2 and e2
//  * @param {p5.Vector} s1 
//  * @param {p5.Vector} e1 
//  * @param {p5.Vector} s2 
//  * @param {p5.Vector} e2 
//  * @returns {boolean}
//  */
// let newintersect = (s1, e1, s2, e2) => intersect2(ray(s1, e1), ray(s2, e2), ray(s1, s2))

// /** step 2 of calulating intersect - do not call directly */
// let intersect2 = (r1, r2, coeff) => intersect3(r1, r2, intersectDenom(r1, r2), coeff)

// /** step 3 of calulating intersect - do not call directly */
// let intersect3 = (r1, r2, denom, coeff) => inBounds(intersectParam(coeff, r2, Math.sign(denom)), 0, denom) &&
//                                            inBounds(intersectParam(coeff, r1, Math.sign(denom)), 0, denom)


// Given three collinear points p, q, r, the function checks if
// point q lies on line segment 'pr'
let onSegment = (p, q, r) => q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
                             q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)
 
// To find orientation of ordered triplet (p, q, r).
// The function returns following values
// 0 --> p, q and r are collinear
// 1 --> Clockwise
// 2 --> Counterclockwise
let ori = (p, q, r) => ((val) => val > 0 ? 1 : val < 0 ? 2 : 0) 
        ((q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y))
 
// The main function that returns true if line segment 'p1q1'
// and 'p2q2' intersect.
let intersect = (s1, e1, s2, e2) => {
    // Find the four orientations needed for general and
    // special cases
    let o1 = ori(s1, e1, s2);
    let o2 = ori(s1, e1, e2);
    let o3 = ori(s2, e2, s1);
    let o4 = ori(s2, e2, e1);
 
    // General case
    if (o1 != o2 && o3 != o4)
        return true;
 
    // Special Cases
    // p1, q1 and p2 are collinear and p2 lies on segment p1q1
    if (o1 == 0 && onSegment(s1, s2, e1)) return true;
 
    // p1, q1 and q2 are collinear and q2 lies on segment p1q1
    if (o2 == 0 && onSegment(s1, e2, e1)) return true;
 
    // p2, q2 and p1 are collinear and p1 lies on segment p2q2
    if (o3 == 0 && onSegment(s2, s1, e2)) return true;
 
     // p2, q2 and q1 are collinear and q1 lies on segment p2q2
    if (o4 == 0 && onSegment(s2, e1, e2)) return true;
 
    return false; // Doesn't fall in any of the above cases
}


/**
 * Wrapper for p5.Vector.sub(). 
 * Finds the vector line between the two points
 * @param {p5.Vector} start the position to subtract from
 * @param {p5.Vector} end the position to subtract
 * @returns {p5.Vector} the vector from start to end
 */
let ray = (start, end) => p5.Vector.sub(start, end)

/**
 * @param {p5.Vector} r1 the first line
 * @param {p5.Vector} r2 the second line
 * @returns {number} the denominator for t and u
 */
let intersectDenom = (r1, r2) => (r1.x * r2.y) - (r1.y * r2.x)

/**
 * from first bezier param
 * @param {p5.Vector} coeff x and y coefficients
 * @param {p5.Vector} r one of the lines
 * @param {1|-1|0} sign sign of the denominator
 * @returns {number} t or u, based on parameters
 */
let intersectParam = (coeff, r, sign) => ((coeff.x * r.y) - (coeff.y * r.x)) * sign

/**
 * Checks whether a number is within the given bounds
 * @param {number} num the number to check
 * @param {number} min minimum bound, inclusive
 * @param {number} max maximum bound, inclusive
 * @returns {boolean}
 */
let inBounds = (num, min, max) => num >= min && num <= max

/**
 * Gets the list of cell coordinates that the line between two points passes through
 * @param {p5.Vector} s starting worldspace position
 * @param {p5.Vector} e ending worldspace position
 * @returns {p5.Vector[]} list of cells coordinates along the line between the points
 */
let getCells = (s, e) => iterCells(s, e, worldToCell(s), worldToCell(e), [])

/** [top, right, down, left]
 * @type {p5.Vector[]}
*/
let dirs = [new p5.Vector(0, -1), new p5.Vector(1, 0), new p5.Vector(0, 1), new p5.Vector(-1, 0)]

/**
 * For each adjacent cell to {@link curr}, if that cell is not the previously visited cell,
 * check if the line from {@link s} to {@link e} intersects with the edge between the current and adjacent cell.
 * If it does, then that adjacent cell is the next cell the line goes through, so recurse
 * @param {p5.Vector} s worldspace starting point
 * @param {p5.Vector} e worldspace end point
 * @param {p5.Vector} curr current cell coordinates
 * @param {p5.Vector} end coordinates of final cell
 * @param {p5.Vector} prev coordinates of previously traversed cell
 * @returns {p5.Vector[]} list of cells the line from s to e goes through
 */
let iterCells = (s, e, curr, end, prev) => curr.equals(end) ? [end] : iterCells2(s, e, curr, end, prev, cellCorners(curr))

let iterCells2 = (s, e, curr, end, prev, corners) => {
    // print(curr, end)
    for (let i = 0; i < 4; i++) {
        let next = curr.copy().add(dirs[i])
        // print([s, e], [i, corners[i], ((i+1)), corners[(i+1)%4]])
        if (!prev.some(v => v.equals(next)) && intersect(s, e, corners[i], corners[(i+1)%4])) {
            // print(next, prev)
            // recur through the rest of the cells
            return [curr, ...iterCells(s, e, next, end, [curr, ...prev])]
        }
    }
    print(`Failed to find cells from ${s.x}, ${s.y} to ${e.x}, ${e.y}`)
    return []
}

/** offsets for cell corners 
 * @type {p5.Vector[]}
*/
let cellOffs = [new p5.Vector(0, 0), new p5.Vector(1, 0), new p5.Vector(1, 1), new p5.Vector(0, 1)]

/**
 * @param {p5.Vector} cell coordinates of the cell
 * @returns {p5.Vector[]} worldspace corners of that cell
 */
let cellCorners = (cell) => cellOffs.map(o => cellToWorld(cell.copy().add(o)))
