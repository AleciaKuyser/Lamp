
/**
 * enemies object, keys are enemy IDs, values are an object containing that enemy's properties
 */
var enemies = {
    enemy: {
        id: "enemy",
        img: "enemy",
        plan: [], // list of cells the enemy will traverse
        state: "patrol",
        timer: 0,
        planTimer: 0,
        lightDamage: 0,
        damage: 0.5,
        limit: 25500,
        speed: 1,
        acc: 0.2,
        patrol: [[9, 13], [12, 13], [13, 15], [10, 12]],
        fsm: {
            stunned: {
                fns:["timerZero"], // list of function conditions for state change
                tos:["retreat"], // 
                time:30,
            },
            patrol: {
                fns:["hearAndSee"],
                tos:["attack"],
                hearing: 600,
            },
            attack: {
                fns:["noHearPlayer", "timerZero"],
                tos:["retreat", "retreat"],
                cost:"none",
                hearing: 1200,
                time:300,
                planTime:200,
            },
            retreat: {
                fns:["hasRetreated"],
                tos:["patrol"],
                cost:"default",
            }
        },
        travTypes: ["walk"],
        pos:[499.9, 499.9],
        w:60,
        h:60,
        r:30,
        coll:"circle",
        velocity:0,
    }
}

/** called by {@link preload}. Loads enemy data file */
let loadEnemies = () => enemies = loadObject("enemies")

let initEnemies = () => {
    entities.enemy = enemies
    Object.values(enemies).forEach((enemy) => {
        enemy.plan = []
        enemy.timer = 0
        enemy.planTimer = 0
        enemy.lightDamage = 0
        enemy.patrol = enemy.patrol.map(c => createVector(...c))
        enemy.pos = enemy.patrol[0].copy().mult(40).add(19.999, 19.999)
        enemy.velocity = createVector(0, 0)
        addEntity(enemy.id, "enemy")
    })
    // print(enemies)
}

let drawEnemy = (enemy) => {
    graphics.push()
    graphics.tint(enemy.lightDamage / enemy.limit * 255)
    // drawRotEntity(getImg(enemy.img), enemy.pos, enemy.velocity.copy().normalize(), enemy.w, enemy.h)
    graphics,imageMode(CORNER)
    graphics.image(getImg(enemy.img), ...worldToScreen(enemy.pos.copy().sub([enemy.w / 2, enemy.h / 2])))
    graphics.pop()
}

let updateEnemy = (enemy) => {
    enemyFSM(enemy)

    moveEnemy(enemy)

    enemyLight(enemy)

    if (enemy.planTimer > 0 && enemy.state != "patrol") enemy.planTimer--
    if (enemy.timer > 0) enemy.timer--
}

/**
 * Update the enemy's state based on its FSM
 * @param {entity} enemy 
 */
let enemyFSM = (enemy) => {
    let fsm = enemy.fsm[enemy.state]
    fsm.fns.forEach((fn, i) => {
        if (stateChange[fn](enemy)) {
            enemy.state = fsm.tos[i]
            enemy.planTimer = 0
            enemy.timer = "time" in enemy.fsm[enemy.state] ? enemy.fsm[enemy.state].time : 0
        }
    })
}

/**
 * Update the enemy's plan if necessary, 
 * then use the plan to update the position
 * @param {entity} enemy 
 */
let moveEnemy = (enemy) => {
    if (enemy.state == "stunned") return
    if (enemy.planTimer == 0) {
        enemy.plan = plan[enemy.state](enemy)
        enemy.planTimer = enemy.fsm[enemy.state].planTime
        if(!enemy.planTimer) enemy.planTimer = -1
    } 
    if (enemy.plan.length > 0) {
        acc = doPlan(enemy).mult(difficulty.speedMult)
        let move = enemy.velocity.add(acc).limit(adjustedSpeed(enemy))
        updatePos(enemy, "enemy", move)
    }
}

/**
 * Adjusts the enemy's speed based off their light damage.
 * Enemy also moves 1.5x speed if in the attack state
 * @param {entity} enemy 
 * @returns {number} speed 
 */
let adjustedSpeed = (enemy) => ((enemy, speed) => speed * (1 - enemy.lightDamage / enemy.limit) * difficulty.speedMult) 
                            (enemy, enemy.state == "attack" ? enemy.speed * 1.5 : enemy.speed)

/**
 * Use the enemy's plan to generate movement
 * @param {entity} enemy 
 * @returns {p5.Vector} the movement
 */
let doPlan = (enemy) => {
    let target = cellToWorld(enemy.plan[0]).add([tWidth / 1.95, tHeight / 1.98])
    if (sqdist(enemy.pos, target) < (tWidth * enemy.w * enemy.speed) / 3) enemy.plan.shift()
    return ray(target, enemy.pos).normalize().mult(enemy.acc)
}

/**
 * Perform light-based enemy updates
 * @param {entity} enemy 
 */
let enemyLight = (enemy) => {
    cells = entityCells(enemy)
    let light = cells.reduce((s, c) => world[c.x][c.y].light + s, 0) / cells.length - 40
    light = Math.max(0, light)
    player.madness.current += light * difficulty.madMult
    if (player.madness.current >= player.madness.max) {
        gameTransition("dead")
        playSound("madness")
    }
    enemy.lightDamage += light * difficulty.lightMult
    if (enemy.lightDamage > enemy.limit) {
        enemy.lightDamage = enemy.limit
        enemy.state = "stunned" 
        enemy.timer = enemy.fsm.stunned.time * difficulty.stunMult
        enemy.velocity.mult(0)
        enemy.plan = []
    }
    if (enemy.state != "stunned" && light == 0) {
        enemy.lightDamage = Math.max(0, enemy.lightDamage - 100)
    }
}
