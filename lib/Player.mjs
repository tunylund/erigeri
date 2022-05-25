import Q from './Q.mjs'
import GeriMon from './GeriMon.mjs'
import { interpolationMultiplier } from './assetBuilder.mjs'

class Player extends GeriMon {
  constructor (p) {
    super(p, {})
    this.p.direction = 'right'
    this.p.oppositeDirection = 'left'
    // Q.input.on("fire", this, 'fire')
    this.on("prestep", this, 'attack')
    this.on("prestep", this, 'unsoku')
  }

  attack () {
    if(this.p.paused) return
    
    if(!Q.inputs.fire) return

    let target, tDist = Infinity, dist
    for(let player of this.stage.lists.players) {
      if(player != this) {
        dist = Math.abs(this.p.x - player.p.x)
        if(dist < tDist) {
          target = player
          tDist = dist
        }
      }
    }

    if (Q.inputs.up && Q.inputs[this.p.direction]) {
      this.fujogeriForward(target)
    }

    if (Q.inputs.up) {
      this.fujogeri(target)
    }

    if (Q.inputs.down && Q.inputs[this.p.oppositeDirection]) {
      this.hangetsuate(target)
    }

    if (Q.inputs.down && Q.inputs[this.p.direction]) {
      this.sentainotsuki(target)
    }

    if (Q.inputs.down) {
      this.manjigeri(target)
    }

    if (Q.inputs[this.p.direction]) {
      this.suiheigeri(target)
    }

    if (Q.inputs[this.p.oppositeDirection]) {
      this.sensogeri(target)
    }

  }

  unsoku () {
    if(this.p.paused) return

    if(Q.inputs.fire) return

    if(Q.inputs.action) {

      this.ushiro()

    } else {

      if(Q.inputs.up) {
        this.kosoku()
      }

      if(Q.inputs.down) {
        if(Q.inputs[this.p.direction]) {
          this.senten()
        }

        else if(Q.inputs[this.p.oppositeDirection]) {
          this.koten()
        }

        else {
          this.gensoku()
        }
      }

      //forward
      if(Q.inputs[this.p.direction]) {
        this.ninoashi() 
        if(this.p.animation === 'ninoashi' && this.p.animationFrame > 1 * interpolationMultiplier) {
          this.stand()
          this.tsuisoku()
        }
      }
      //backward
      if(Q.inputs[this.p.oppositeDirection]) {
        this.taisoku()
      }

    }
  }

}

export default Player
