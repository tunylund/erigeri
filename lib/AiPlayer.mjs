import AutoPlayer from './AutoPlayer.mjs'
import AttackLog from './AttackLog.mjs'
import { distance, sample } from './utils.mjs'

class AiPlayer extends AutoPlayer {

  attack (target, dt) {
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
