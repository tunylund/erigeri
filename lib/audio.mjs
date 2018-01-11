import Q from './Q.mjs'

let mute = false,
    currentMusic = ''

function playMusic (asset) {
  if(mute) return
  if(Q.assets[asset] && asset != currentMusic) {
    try{ Q.audio.stop(currentMusic) } catch (e) {}
    Q.audio.play(asset, {loop: true})
    currentMusic = asset
  }
}

function playSound (asset) {
  if(mute) return
  Q.audio.play(asset)
}

function toggleMute () {
  mute = !mute
  if(mute) Q.audio.stop()
}

export { playMusic, playSound as default, toggleMute }
