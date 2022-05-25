import { getAsset } from '../node_modules/tiny-game-engine/lib/index.mjs'

let mute = false,
    volume = 0.2,
    currentMusicAsset = '',
    currentMusicNode = null

function playMusic (asset) {
  if(mute) return
  if(asset != currentMusicAsset) {
    if (currentMusicNode) currentMusicNode.stop()
    try { currentMusicNode = getAsset(asset)(volume) } catch {}
    if (currentMusicNode) {
      currentMusicNode.loop = true
      currentMusicNode.start()
      currentMusicAsset = asset
    }
  }
}

function playSound (asset) {
  if(mute) return
  getAsset(asset)(volume).start()
}

function toggleMute () {
  mute = !mute
  if(mute && currentMusicNode) currentMusicNode.stop()
}

export { playMusic, playSound as default, toggleMute }
