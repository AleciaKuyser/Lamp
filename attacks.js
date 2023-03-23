
/** The dynamic attack table */
var attacks = {
    // id: {
    //     id:"id",
    //     type:"type",
    //     timer:"timer",
    //     pos:"pos",
    //     w:0,
    //     h:0,
    //     r:0,
    // }
}

/** Contains all static information about attack types */
var attackTypes = {
    cone: {
        timer:10,
        coll:"cone",
        w: 140,
        h: 140,
        r: 70,
        speed:0,
        acc:0,
        travTypes: ["all"]
    },
    circle: {
        timer: 60,
        coll: "circle",
        travTypes: ["walk", "fly"]
    }
}

/**
 * Generates a new attack and adds it to {@link attacks}
 * @param  {p5.Vector} origin position vector
 * @param  {p5.Vector} facing facing vector
 * @param  {object} attack attack sub-object from the spawning object
 * @param  {string} id attack id, used to identify attacks in {@link attacks}
 */
let spawnAttack = (origin, facing, attack, id) => {
    attacks[id] = mergeAttack(attackTypes[attack.type], attack, origin, facing)
    attacks[id].id = id
    addEntity(id, "attack")
    playSound("attack")
}

/**
 * Rolls together the type and attack objects, 
 * and initialises the position, facing and velocity
 * @param {object} type object from attackTypes
 * @param {object} attack attack sub-object from spawning object
 * @param {p5.Vector} origin position vector to be copied
 * @param {p5.Vector} facing facing vector to be copied
 * @returns {object} the combined attack object
 */
let mergeAttack = (type, attack, origin, facing) => 
    ({...type, ...attack, pos:origin.copy(), facing:facing.copy(), 
        vel:facing.copy().normalize().mult(type.speed ? type.speed : attack.speed)})

let updateAttacks = () => {
    let toDelete = []
    Object.values(attacks).forEach(attack => {
        if (updateAttack(attack))   toDelete.push(attack.id)
    })
    toDelete.forEach(id => {
        remEntity(attacks[id])
        delete attacks[id]
    })
}

let updateAttack = (attack) => {
    attack.timer--
    if (attack.timer <= 0) return true

    // then use updatepos so the attack doesn't actually go inside a wall it shouldn't
    updatePos(attack, "attack", attack.vel)
    
    // destroy tiles
    destroyTiles(attack)

    // then update the velocity by the acceleration
    attack.vel.mult(attack.acc)
}

let destroyTiles = (attack) => {
    entityCells(attack).forEach(cell => {
        // cell has not already been hit
        if (!(world[cell.x][cell.y].hitTime > 0) &&
            // attack is of correct damage type
            attack.damage in tiles[world[cell.x][cell.y].tile].destroy && 
            // attack is actually colliding with cell (failsafe for edge behaviour with entities in cells)
            useCollider(attack, { coll:"rect", pos:cellToWorld(cell), w:tWidth, h:tHeight })) {
            // replace the tile for that cell with the appropriate destroyed tiles
            world[cell.x][cell.y].tile = tiles[world[cell.x][cell.y].tile].destroy[attack.damage]
            // set the timer for the cell to 1 greater than the attack timer, so it can't be 
            // damaged again until this attack expires
            world[cell.x][cell.y].hitTime = attack.timer + 1
        }
    })
}

let drawAttack = (attack) => drawRotEntity(getImg(attack.img), attack.pos, attack.facing, attack.w, attack.h)
