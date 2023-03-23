
/**
 * Used to generate "plans" for enemies based on their state.
 * The "plan" is an ordered list of tiles for them to traverse.
 * Every enemy can afford to use expensive planning functions like A*
 * because the game is slow-paced and there aren't many enemies
 */
var plan = {
    // sleeping - do nothing until state changes
    sleep: () => [],
    // use astar to find route to next cell on patrol
    patrol: (enemy) => [...enemy.patrol],
    // pathfind to last known position of player
    alert: () => {},
    // target a point a certain distance behind the player
    stalk: (enemy) => astar(enemy, player.pos),
    // run away from the player
    escape: () => {},
    // rush towards the player
    attack: (enemy) => astar(enemy, player.pos),
    // return to the closest point in the patrol
    retreat: (enemy) => astar(enemy, enemy.patrol.reduce((prev, curr) => {
        let pos = cellToWorld(curr)
        let dist = sqdist(enemy.pos, pos);
        return dist < prev.dist ? {pos:pos, dist:dist} : prev
    }, {dist:Number.POSITIVE_INFINITY}).pos),
    stunned: () => []
}


// * Patrolling / Lurking
//     * following a predetermined path / roaming a particular area
// * Sleeping
//     * avoid waking the enemy up
// * Searching for the player
//     * aware that the player exists / is nearby, but not of their position
//     * e.g. they notice an item the player has taken / have heard, but not seen, the player
// * Running from the player
//     * like a curious cat gauging the abilities of an unfamiliar creature
// * Stalking the player
//     * following the player, but keeping a distance and staying in the darkness
// * Attacking the player
//     * making a dash towards the player
//     * lashing out because the player got too close
//     * sneaking up behind the player

/**
 * All enemies have a state machine defining which functions to use
 * when in a certain state to decide when it should enter a new state
 */
var stateChange = {
    hasItem: (enemy) => player.items.includes(enemy.fsm[enemy.state].item),
    hearAndSee: (enemy) => canHear(enemy, player) && canSee(enemy, player),
    hearOrSee: (enemy) => canHear(enemy, player) || canSee(enemy, player),
    hearNorSee: (enemy) => !canHear(enemy, player) && !canSee(enemy, player),
    clearPath: (enemy) => clearPath(enemy, player),
    noClearPath: (enemy) => !clearPath(enemy, player),
    seePlayer: (enemy) => canSee(enemy, player),
    noSeePlayer: (enemy) => !canSee(enemy, player),
    hearPlayer: (enemy) => canHear(enemy, player),
    noHearPlayer: (enemy) => !canHear(enemy, player),
    timerZero: (enemy) => enemy.timer == 0,
    hasRetreated: (enemy) => enemy.plan.length == 0,
}

var cost = {
    default: (curr, next) => (world[next.x][next.y].light - world[curr.x][curr.y].light) / 100,
    none: (curr, next) => 0,
}
