
var images = {}

let addImg = (name, callback) => images[name] = loadImage(`./imgs/${name}.png`, callback, alert)

let getImg = (name) => name in images ? images[name] : alert(`Image ${name} is not loaded`)

let loadImages = () => loadArray("images", callback=getImgs)

let getImgs = (imgs) => imgs.forEach(e => addImg(e))
