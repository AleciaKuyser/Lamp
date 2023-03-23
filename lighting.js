
var simpleLight = false
var lighting

let initLighting = () => {
    lighting = createGraphics(drawWidth, drawHeight, WEBGL)
    lighting.noSmooth()
    lighting.setAttributes("perPixelLighting", false, "depth", false, "stencil", false, "antialiasing", false)
}

let drawLighting = () => {
    let lightCols = getLightCols()
    lighting.clear()
    lighting.noStroke()
    lightCols.forEach(r => simpleLight ? lightRects(...r) : lightCol(...r))
    graphics.blend(lighting, drawWidth / -2, drawHeight / -2, drawWidth, drawHeight, 0, 0, drawWidth, drawHeight, HARD_LIGHT)
}

let updatePlayerGlow = () => onScreenWorld.forEach((r, i, o) => r.forEach((c, j) => {
    let target = createVector(...screenToWorld(onScreenCellToScreen(i, j))).add([tWidth / 2, tHeight / 2])
    c.light += Math.min(80, 100000 / sqdist(target, player.pos))
}))

let getLightCols = () => {
    let lightCols = []
    onScreenWorld.forEach((r, i) => {
        lightCols[i] = [[], [], []]
        r.forEach((_, j) => {
            // top left, top right
            addLightCol(lightCols[i], i, j)
        })
        // bottom left, bottom right
        addLightCol(lightCols[i], i, r.length)
    })
    return lightCols
}

let addLightCol = (lightCol, i, j) => {
    let pos = onScreenCellToScreen(i, j)
    let x = pos.x - drawWidth / 2, y = pos.y - drawHeight / 2
    lightCol[0].push(x, x + tWidth)
    lightCol[1].push(y, y)
    // if (simpleLight)    lightCol[2].push(getLight(i, j), getLight(i + 1, j))
    lightCol[2].push(vertexLight(i, j), vertexLight(i + 1, j))
}

let vertexLight = (i, j) => {
    let l1 = getLight(i - 1, j - 1)
    let l2 = getLight(i - 1, j)
    let l3 = getLight(i, j - 1)
    let l4 = getLight(i, j)
    return (l1 + l2 + l3 + l4) / 4
}

let getLight = (i, j) => onScreenWorld[i] && onScreenWorld[i][j] ? onScreenWorld[i][j].light : 0

let drawLight = (pos, lights) => {
    lighting.noStroke()
    lighting.fill(lights.reduce((s, e) => s + e, 0) / 4 + 10)
    lightingRect(pos.x, pos.y, tWidth, tHeight)
}

let lightRects = (xs, ys, lights) => {
    for (let i = 0; i < lights.length - 2; i += 2) {
        drawLight(createVector(xs[i], ys[i]), [lights[i], lights[i+1], lights[i+2], lights[i+3]])
    }
}

let lightCol = (xs, ys, lights) => {
    lighting.beginShape(TRIANGLE_STRIP)
    lights.forEach((l, i) => {
        lighting.fill(l)
        lighting.vertex(xs[i], ys[i])
    })
    lighting.endShape(CLOSE)
}

let lightingRect = (x, y, w, h) => {
    lighting.triangle(x, y, x + w, y, x + w, y + h)
    lighting.triangle(x + w, y + h, x, y + h, x, y)
}

let updateLight = () => {
    let lamp = getHeldLamp()
    // if the lamp is off or has no lamp oil, it can't cast light
    if (!lamp || !lamp.on || lamp.oil <= 0) {
        setZoom(zoom.value * 0.999)
        onScreenWorld.forEach(r => r.forEach(c => c.light = 0))
        return
    }
    setZoom(zoom.value * 1.005)

    // let origin = player.pos.copy().add([player.facing.x * player.w / -2, player.facing.y * player.h / -2])
    let origin = player.pos.copy().add([player.facing.x * tWidth / -4, player.facing.y * tHeight / -4])

    onScreenWorld.forEach((r, i) => r.forEach((c, j) => {
        // target is centre of cell
        let target = createVector(...screenToWorld(onScreenCellToScreen(i, j))).add([tWidth / 2, tHeight / 2])
        let angle = 1 - ray(target, origin).normalize().dot(player.facing)
        // graphics.text(str(angle.toFixed(2)), ...worldToScreen(target))
        if (target.x <= 0 || target.y <= 0 || angle > lamp.spread) {
            c.light = 0
            return
        }
        // no point calculating los if the light would be 0 anyway
        let light = (lamp.power - sqdist(origin, target) * lamp.falloff) * (1 - angle / lamp.spread)
        if (light <= 0) {
            c.light = 0
            return
        }
        c.light = los(origin, target) ? light : 0
        // c.light = light
    }))
}

let getHeldLamp = () => leftItem().type == "lamp" ? leftItem() : rightItem().type == "lamp" ? rightItem() : false

let leftItem = () => items[player.held.left]

let rightItem = () => items[player.held.right]
