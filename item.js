
// 3 things to draw for an item: it's icon for the item menu, its icon for the equipped items, and its in-world appearance

var items = {
    lamp: {
        id: "lamp",
        text: "Your trustworthy lamp. \nBasic and simple, but it gets the job done.",
        type: "lamp",
        img: "lamp",
        spread: 0.2,
        power: 255,
        falloff: 0.003,
        on: true,
        oil: 1800,
        maxoil: 1800,
        oilrate: 1,
    },
    knife: {
        id: "knife",
        text: "A small utility knife you take on your walks, \nmostly for peeling apples and cutting small plants.",
        img: "knife",
        type: "attack",
        attack: {
            id: "knife",
            type: "cone",
            damage: "slash",
            spread: 0.3,
            power: 2,
        },
        cooldown: 60,
        timer: 0
    },
}

let loadItems = () => items = loadObject("items")

let initItems = () => {
    entities.item = items
    Object.values(items).forEach(item => {
        if (item.inWorld) {
            item.pos = createVector(...item.pos)
            addEntity(item.id, "item")
        }
    })
}

let collectItem = (item) => {
    item.inWorld = false
    remEntity(item)
    player.items.push(item.id)
    msg = item.msg
    msgTimer = 100
    playSound("item")
}

let updateItems = () => Object.values(items).forEach(item => item.timer > 0 ? item.timer-- : item.timer = 0)

let drawItem = (item) => {
    graphics.push()
    graphics.imageMode(CENTER)
    graphics.image(getImg(item.img), ...worldToScreen(item.pos), item.w, item.h)
    graphics.pop()
}
// let icon = (item, pos, scale) => {
//     image(items[item].icon, pos.x, pos.y, scale.x, scale.y)
//     if (items[item].hasGauge)   gauge(pos.x, pos.y + scale.y, scale.x, items[item].gauge, items[item].gaugebg)
// }

// let smallIcon = (item, pos) => icon(item, pos, /* small scale */)

// let bigICon = (item, pos) => icon(item, pos, /* large scale */)

/**
 * Attempt to use the item with the given id
 * @param {string} id item id
 */
let useItem = (id) =>  itemUse[items[id].type](items[id])

/**
 * Item use function table, item type is the key.
 * Functions take the item object as a parameter
 */
let itemUse = {
    // toggle the lamp
    lamp: (lamp) => lamp.on = !lamp.on,
    // spawn the item's attack, if the item is off cooldown
    attack: (item) => { if (item.timer == 0) { spawnAttack(player.pos, player.facing, item.attack, item.id); item.timer = item.cooldown } },
    // use the oil to refill the held lamp, if any, then remove the oil from inventory
    oil: (oil) => {
        let lamp = getHeldLamp()
        if (lamp) {
            lamp.oil = Math.min(lamp.oil + oil.value, lamp.maxoil)
            player.items = player.items.filter(item => item != oil.id)
            if (player.held.left == oil.id) player.held.left = ""
            if (player.held.right == oil.id) player.held.right = ""
        }
    },
    teleport: (item) => {
        if (item.timer != 0) return
        let target = canvasToWorld(mouseX, mouseY)
        if (!los(player.pos, target))   return
        let oldPos = player.pos
        player.pos = target
        if (!entityCells(player).every(cell => canTraverse(player, cell.x, cell.y))) {
            player.pos = oldPos
        } else {
            player.pos = oldPos 
            remEntity(player)
            item.timer = item.cooldown
            player.pos = target 
            addEntity("player", "player")
        }
    },
    none: () => {}
}
