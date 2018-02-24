import AutoPlayer from './AutoPlayer.mjs'
import { Ball } from './GeriMon.mjs'
import AttackLog from './AttackLog.mjs'
import { collisions } from './assets.mjs'
import { reduce, sample, intersects, distance } from './utils.mjs'
import Q from './Q.mjs'

const attacks = []
function gatherAttacks() {
  if (attacks.length > 0) return attacks
  for (let action in collisions) {
    let frameRate = Q.animation('gerimon', action).rate
    let hit = collisions[action].hit
    let frame = -1, col = null
    for (frame = 0; frame < hit.length; frame++) {
      if (hit[frame].x) {
        col = hit[frame] 
        break
      }
    }
    if (col != null) attacks.push({ frame, action, col, frameRate })
  }
  return attacks
}

class AiPlayer extends AutoPlayer {

  attack (target, dt) {
    let dist = distance(target, this)
    if (target instanceof Ball) {
      let attack = gatherAttacks().map(attack => {
        const collisionAtTimeToHit = {
          x: this._absx(attack.col.x, attack.col.w),
          y: this._absy(attack.col.y),
          w: attack.col.w,
          h: attack.col.h
        }
        const steps = Math.floor((attack.frameRate / (1/60)) * attack.frame)
        const ballAtTimeToHit = reduce(steps, (lastPass, i) => {
          let vy = lastPass.vy + Q.gravityY * dt * target.p.gravity
          if (lastPass.y + vy * dt >= 412) vy = target.p.bounce
          return {
            x: lastPass.x + target.p.vx * dt,
            y: lastPass.y + vy * dt,
            w: lastPass.w,
            h: lastPass.h,
            vy: vy
          }
        }, target.p)
        return { collisionAtTimeToHit, ballAtTimeToHit, action: attack.action }
      }).filter(x => intersects(x.ballAtTimeToHit, x.collisionAtTimeToHit))
      if (attack.length > 0) this[sample(attack).action](target)
    } else {
      let probableActions = AttackLog.findActions(
        dist,
        target.p.animation,
        target.p.animationFrame,
        target.p.dir != this.p.dir)
      let action = sample(probableActions)
      if (action) this[action.animation](target)
    }
  }

}

export default AiPlayer
