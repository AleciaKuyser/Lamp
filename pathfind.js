
// Code all adapted from previous project

let cellToIndex = (cell) => cell.x * world[0].length + cell.y

let heuristic = (cell, goal) => Math.abs(goal.y - cell.y) + Math.abs(goal.x - cell.x)

let buildPath = (cells, prev, end) => prev[end] != null ? [...buildPath(cells, prev, prev[end]), cells[end]] : [cells[end]]

let onRoute = (prev, curr, next) => prev[curr] != null ? prev[curr] == next || onRoute(prev, prev[curr], next) : false

/**
 * Use astar to find a cell path from the entity's current position to the goal
 * @param {entity} entity the pathfinding entity
 * @param {p5.Vector} goal target world position
 * @returns {p5.Vector[]} list of cells making up the path
 */
let astar = (entity, goal) => {
    let startCell = worldToCell(entity.pos)
    let endCell = worldToCell(goal)
    let start = cellToIndex(startCell)
    let end = cellToIndex(endCell)

    // linear mapping of the 2D grid
    // grid[i][j] becomes cell[i * world[0].length + j]
    // use an array instead of a function, as the function involves division
    // converting the position to an index is just multiplication and addition
    let cells = new Array(world.length * world[0].length)
    for (let x = 0; x < world.length; x++)
        for (let y = 0; y < world[0].length; y++)
            cells[x * world[0].length + y] = createVector(x, y)

    let toExpand = [start];

    let distances = (new Array(cells.length)).fill(Number.MAX_VALUE);
    distances[start] = 0;

    let priorities = (new Array(cells.length)).fill(Number.MAX_VALUE);
    priorities[start] = heuristic(startCell, endCell);  // lower priority number = lower cost, so higher priority

    let previous = (new Array(cells.length));
    previous[start] = null;

    while (toExpand.length > 0) {
        // remove the first element of the toExpand list
        // gets the index of the cell we're expanding
        let expand = toExpand.shift();
        // the position in the grid of the cell we're expanding
        let cell = cells[expand];
        if (reachedEnd(entity, cell, endCell)) return buildPath(cells, previous, end);
        // the list of offsets to neighbouring cells, used to get the neighbouring cells
        for (let offset of getOffsets(cell.x, cell.y, world.length - 1, world[0].length - 1)) {
            // neighbouring cell vector
            let neighbourCell = cell.copy().add(offset);
            // neighbouring cell index
            let neighbour = cellToIndex(neighbourCell);
            if (neighbour == start || onRoute(previous, expand, neighbour)) continue

            let newDistance = distances[expand] + cost[entity.fsm[entity.state].cost](cell, neighbourCell);
            // if the path through this cell to the neighbour is cheaper than the current path to the neighbour
            // print(newDistance, distances[neighbour])
            if (entityTraverse(entity, neighbourCell.x, neighbourCell.y)
                    && newDistance < distances[neighbour]) {
                // update the path
                distances[neighbour] = newDistance;
                previous[neighbour] = expand;
                priorities[neighbour] = distances[neighbour] + heuristic(neighbourCell, endCell);
                // and add the neighbour to the list, avoid putting in duplicates
                if (!toExpand.includes(neighbour))  toExpand.push(neighbour);
            }
        }
        // sort the toExpand list so the highest priority
        toExpand.sort((a, b) => priorities[a] - priorities[b]);
    }
    return []; // failed to find a path
}

let reachedEnd = (entity, cell, end) => getTempCells(entity, cell.x, cell.y).some(c => c.equals(end))

let entityTraverse = (entity, x, y) => getTempCells(entity, x, y).every(cell => canTraverse(entity, cell.x, cell.y))

let getTempCells = (entity, x, y) => {
    let pos = entity.pos
    entity.pos = createVector(x * 40 + 19.999, y * 40 + 19.999)
    let cells = entityCells(entity)
    entity.pos = pos 
    return cells
}


let getOffsets = (i, j, maxI, maxJ) => {
    if (i == 0) {
        if (j == 0) return [[1, 0], [0, 1]];    // no top or left
        if (j == maxJ) return [[1, 0], [0, -1]]  // no top or right
        return [[0, -1], [1, 0], [0, 1]];  // just no top
    } 
    if (i == maxI) {
        if (j == 0) return [[-1, 0], [0, 1]];// no bottom or left
        if (j == maxJ) return [[-1, 0], [0, -1]]; // no bottom or right
        return [[-1, 0], [0, -1], [0, 1]];  // just no bottom
    } 
    if (j == 0) return [[-1, 0], [1, 0], [0, 1]]; // just no left
    if (j == maxJ)  return [[-1, 0], [0, -1], [1, 0]]; // just no right
    return [[1, 0], [0, 1], [-1, 0], [0, -1]];  // all directions
}

let convertOffset = (x, y) => {
    if (x == -1)    return 0;   // [-1, 0]
    if (y == 1)    return 1;    // [0, 1]
    if (x == 1)     return 2;   // [1, 0]
    if (y == -1)    return 3;   // [0, -1]
}
