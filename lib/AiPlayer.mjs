import AutoPlayer from './AutoPlayer.mjs'
import AttackLog from './AttackLog.mjs'

function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function distance(a, b) {
  let x = Math.abs(a.p.x - b.p.x),
      y = Math.abs(a.p.y - b.p.y)
  return Math.sqrt(x*x + y*y)
}

class AiPlayer extends AutoPlayer {

  attack (target) {
    let dist = distance(target, this)
    let probableActions = AttackLog.findActions(
      dist,
      target.p.animation,
      target.p.animationFrame,
      target.p.dir != this.p.dir)
    let action = sample(probableActions)
    if (action) this[action.animation](target)
  }

}

export default AiPlayer
