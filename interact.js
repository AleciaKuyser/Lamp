
/**
 * Function table for interactions caused by collisions.
 * Missing entries correspond to "false" in the canCollide table
 */
var interact = {
    enemy: {
        enemy: () => {}, // maybe push enemies apart?
        player: (enemy, player) => { enemyAttack(player, enemy) },
        attack: (enemy, attack) => stunEnemy(enemy, attack),
    },
    player: {
        enemy: (player, enemy) => { enemyAttack(player, enemy) },
        item: (player, item) => collectItem(item)
    },
    attack: {
        enemy: (attack, enemy) => stunEnemy(enemy, attack),
    },
    item: {
        player: (item, player) => collectItem(item),
    }
}

let enemyAttack = (player, enemy) => {
    player.hp.current -= enemy.damage * difficulty.damMult
    if (player.hp.current <= 0) {
        Object.values(sounds).forEach(s => s.stop())
        gameTransition("dead")
        playSound("end")
    } else {
        player.wasHurt = true
    }
}

let stunEnemy = (enemy, attack) => {
    enemy.state = "stunned" 
    enemy.timer = enemy.fsm.stunned.time * attack.power * difficulty.stunMult
    enemy.velocity.mult(0)
    enemy.plan = []
}
