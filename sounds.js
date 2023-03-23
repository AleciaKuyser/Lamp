
var sounds = {}

let addSound = (name, callback) => sounds[name] = loadSound(`./sounds/${name}.wav`, callback, alert)

let playSound = (name) => sounds[name].isLoaded() ? sounds[name].play() : alert(`Sound ${name} not loaded`)

let loopSound = (name) => sounds[name].isLoaded() ? sounds[name].loop() : alert(`Sound ${name} not loaded`)

let stopSound = (name) => sounds[name].isLoaded() ? sounds[name].stop() : alert(`Sound ${name} not loaded`)

let setVol = (name, vol) => sounds[name].isLoaded() ? sounds[name].setVolume(clamp(vol, 0, 1)) : alert(`Sound ${name} not loaded`)

let loadSounds = () => loadArray("sounds", callback=addSounds)

let addSounds = (sounds) => sounds.forEach(e => addSound(e))
