import GeriMon from './GeriMon.mjs'
import { Ball } from './GeriMon.mjs'
import { collisions } from './assets.mjs'

function distance(a, b) {
  let x = Math.abs(a.p.x - b.p.x),
      y = Math.abs(a.p.y - b.p.y)
  return Math.sqrt(x*x + y*y)
}

function spotAttack(target) {
  if(target.p.attacking && target.p.animationFrame > 4 * 2) {
    return target.p.animation
  }
}

function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

class AutoPlayer extends GeriMon {

  get hitDistance() { return 35*2 }

  moveCloser (target) {
    if(distance(target, this) > this.hitDistance + this.p.w) {
      this.senten()
    } else if(distance(target, this) > this.hitDistance + this.p.w/2) {
      this.tsuisoku()
    } else {
      this.ninoashi()
    }
  }

  moveFurther (target) {
    this[sample(['taisoku', 'gensoku', 'koten'])]()
  }

  cancelAttack () {
    return
    if(this.p.attacking && this.p.animationFrame < 4 * 2) {
      this.stand()
    }
  }

  cancelUnsoku () {
    if(this.p.walking) {
      if(this.p.animationFrame < 3 * 2 || this.p.animationFrame > 6 * 2) {
        this.stand()
      }
    }
  }

  attackDuringAttack (target, attack) {
    if(attack === 'suiheigeri') {
      if(target.p.animationFrame < 6) {
        this[sample(['fujogeri', 'manjigeri'])](target)
      }
    }
    if(attack === 'fujogeri') {
      if(target.p.animationFrame < 10 * 2) {
        this.manjigeri(target)
      }
    }
  }

  attackAfterAttack (target, attack) {
    if(attack === 'suiheigeri') {
      if(target.p.animationFrame > 6 * 2) {
        this.fujogeri(target)
      }
    }
    if(attack === 'fujogeri') {
      if(target.p.animationFrame > 10 * 2) {
        this.manjigeri(target)
      }
    }
    if(attack === 'manjigeri') {
      if(target.p.animationFrame > 7 * 2) {
        this.suiheigeri(target)
      }
    }
  }

  evade (target, attack) {
    if(attack) {
      this.cancelAttack()
      if(Math.random() > .6) {
        this[sample(['kosoku', 'koten'])]()
      } else if (Math.random() > .5 || distance(target, this) < this.hitDistance * 3/4) {
        this.gensoku()
      } else {
        this.taisoku()
      }

    }
  }

  attack (target, dt) {
    let dist = distance(target, this)
    if(dist < 15*2) {
      this[sample(['hangetsuate', 'tsuisoku'])](target)
    } else if(dist < 26*2) {
      this[sample(['fujogeri', 'sensogeri', 'manjigeri'])](target)
    } else {
      this[sample(['fujogeriForward', 'suiheigeri', 'sentainotsuki'])](target)
    }
  }

  lookAt (target) {
    const at = target.p.x < this.p.x ? 'left' : 'right'
    if(at != this.p.direction) this.ushiro()
  }

  step (dt) {
    GeriMon.prototype.step.apply(this, arguments)
    
    if(this.p.paused) return
    
    let others = this.stage.lists.players
                  .filter(p => p != this)
                  .filter(p => !p.p.hit),
        closeBalls = (this.stage.lists.balls || [])
                  .filter(b => b.p.x < this.p.x && b.p.vx > 0 || b.p.x > this.p.x && b.p.vx < 0)
                  .filter(b => distance(b, this) < this.hitDistance * 4)
                  .sort((a, b) => distance(a, this) < distance(b, this) ? -1 : 1),
        target = closeBalls[0] || sample(others),
        dist = target ? distance(target, this) : Infinity

    if(target) {

      this.lookAt(target)

      if (target instanceof Ball) {
        this.attack(target, dt)
      } else {
        if(dist < this.hitDistance / 2) {
          this.moveFurther(target)
        }
        
        if(dist > this.hitDistance) {
          this.moveCloser(target)
        }
  
        const spot = spotAttack(target)
        if(spot) {
          this.evade(target, spot)
        } else {
          if(dist > 8 && dist <= this.hitDistance) {
            this.attack(target, dt)
          }
        }
      }
    }

  }

}

export default AutoPlayer
