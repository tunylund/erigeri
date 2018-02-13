import Q from './Q.mjs'
import GeriMon from './GeriMon.mjs'

function distance(a, b) {
  let x = Math.abs(a.p.x - b.p.x),
      y = Math.abs(a.p.y - b.p.y)
  return Math.sqrt(x*x + y*y)
}

function spotAttack(target) {
  if(target.p.attacking && target.p.animationFrame > 4) {
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
    if(this.p.attacking && this.p.animationFrame < 4) {
      this.stand()
    }
  }

  cancelUnsoku () {
    if(this.p.walking) {
      if(this.p.animationFrame < 3 || this.p.animationFrame > 6) {
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
      if(target.p.animationFrame < 10) {
        this.manjigeri(target)
      }
    }
  }

  attackAfterAttack (target, attack) {
    if(attack === 'suiheigeri') {
      if(target.p.animationFrame > 6) {
        this.fujogeri(target)
      }
    }
    if(attack === 'fujogeri') {
      if(target.p.animationFrame > 10) {
        this.manjigeri(target)
      }
    }
    if(attack === 'manjigeri') {
      if(target.p.animationFrame > 7) {
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

  attack (target, attack) {
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

  step (t) {
    GeriMon.prototype.step.apply(this, arguments)

    if(this.p.paused) return
    
    let others = this.stage.lists.players
                  .filter(p => p != this)
                  .filter(p => !p.p.hit),
        target = sample(others),
        dist = target ? distance(target, this) : Infinity
    
    if(target) {

      this.lookAt(target)

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
          this.attack(target)
        }
      }
    }

  }

}

export default AutoPlayer
