import Q from './Q.mjs'
import { collisions, interpolationMultiplier } from './assetBuilder.mjs'
import playSound from './audio.mjs'
import AttackLog from './AttackLog.mjs'
import { sample, rect, intersects } from './utils.mjs'

function event (p) {
  return {
    x: p.x,
    y: p.y,
    vx: p.vx,
    vy: p.vy,
    animation: p.animation,
    animationFrame: p.animationFrame,
    dir: p.dir,
    flipx: p.flipx,
    jumping: p.jumping,
    walking: p.walking,
    attacking: p.attacking,
    bounce: p.bounce
  }
}

function comboFrom(animation, min, max, comboSuccessFn) {
  return function (fn, frame = 0) {
    return function (target) {
      if (this.p.animation === animation && this.p.animationFrame > min && this.p.animationFrame < max) {
        this[`${animation}End`] && this[`${animation}End`]()
        comboSuccessFn && comboSuccessFn.call(this)
        this.stand()
        const ret = fn.apply(this, arguments)
        this.p.animationFrame = this.p.frame = frame
        return ret
      } else {
        return fn.apply(this, arguments)
      }
    }
  }
}

const comboFromSensogeri = comboFrom('sensogeri', 13 * interpolationMultiplier, 16 * interpolationMultiplier)
const comboFromSentainoTsuki = comboFrom('sentainotsuki', 10 * interpolationMultiplier, 16 * interpolationMultiplier)
const comboFromFujogeri = comboFrom('fujogeri', 10 * interpolationMultiplier, 16 * interpolationMultiplier)
const comboFromManjigeri = comboFrom('manjigeri', 10 * interpolationMultiplier, 13 * interpolationMultiplier)
const comboFromSenten = comboFrom('senten', 5 * interpolationMultiplier, 13 * interpolationMultiplier)
const comboFromKoten = comboFrom('koten', 5 * interpolationMultiplier, 13 * interpolationMultiplier, function () {
  this.p.direction = this.p.direction === 'left' ? 'right' : 'left'
  this.prestep()
})

function attack(fn) {
  return function(target) {
    if(!this.p.landed) return false
    if(this.p.hit) return false
    if(this.p.attacking) return false
    if(this.p.walking && this.p.animationFrame > 4 * interpolationMultiplier || this.p.animation === 'ushiro') return false
    this.sentenEnd()
    this.kotenEnd()
    this.p.sounded = false
    this.p.target = target
    this.p.attacking = true
    this.p.vx = 0
    fn.apply(this, arguments)
    if (target) this.p.attackEvent = { s: event(this.p), t: event(target.p) }
    this.on('step', this, 'hitStep')
    return true
  }
}

function jump(fn) {
  return function() {
    if(this.p.hit) return false
    if(this.p.jumping) return false
    this.p.jumping = true
    let d = fn.apply(this, arguments)
    return typeof d === 'undefined' || d
  }
}

function walk(fn) {
  return function() {
    if(this.p.hit) return false
    if(!this.p.landed) return false
    if(this.p.attacking) return false
    if(this.p.walking) return false
    this.p.walking = true
    let d = fn.apply(this, arguments)
    return typeof d === 'undefined' || d
  }
}

class Head extends Q.MovingSprite {
  
  constructor (owner, force) {
    super({}, {
      color: "#000000",
      w: 4,
      h: 4,
      x: owner.p.x,
      y: owner.p.y - 13,
      scale: 2,
      dir: -1*owner.p.dir,
      sensor: true,
      life: 0,
      gravity: 0.7
    })
    this.add('2d')
    this.p.vy = -150
    this.p.vx = this.p.dir*force * 2
    let bounces = 0
    this.on("bump.bottom", () => {
      this.p.vx = this.p.dir*force * 2
      if (bounces++ < 5) this.p.vy = -100 + bounces * 10
      if (this.p.vy < 0) playSound('assets/bounce.mp3')
    })
  }

  step (t) {
    Q.MovingSprite.prototype.step.call(this, t)
    this.p.life += t
    this.p.angle += this.p.dir * t * 400
    if(this.p.life > 5) {
      this.destroy()
    }
  }
}

class GeriMon extends Q.MovingSprite {
  
  get speed () { return 25 * 2 }
  get friction () { return 5 * 2 }
  get jumpSpeed () { return 130 }
  get hitForce () { return {
    fujogeri: 40,
    manjigeri: 25,
    sensogeri: 40,
    suiheigeri: 35,
    sentainotsuki: 25,
    hangetsuate: 40
  }}

  constructor (p) {
    let w = 22 * 2, h = 32 * 2
    super(p, {
      sprite: "gerimon",
      dir: 1,
      w: w,
      h: h,
      sw: 48 * 2,
      sh: 32 * 2,
      sensor: true,
      movements: [],
      points: [
        [-w/2, -h/2], 
        [ w/2, -h/2 ], 
        [ w/2,  h/2 ], 
        [-w/2,  h/2 ]],
      cx: 10 * 2
    })
    this.add('2d, animation')
    this.p.i = this.p.i || 'a'

    this.on("stand", this, "stand")
    this.on("prestep", this, "prestep")
    this.on("bump.bottom", this, "land")
    this.on("animEnd.senten", this, "sentenEnd")
    this.on("animEnd.sentainotsuki", this, "sentainotsukiEnd")
    this.on("animEnd.ushiro", this, "ushiroEnd")
    this.on("animEnd", this, "logMovement")
    // this.on("postdraw", this, "renderCollisions")

    this.stand()
  }

  logMovement () {
    this.p.movements.push(this.p.animation)
    this.p.movements = this.p.movements.splice(-3)
  }

  _absx (x, w) {
    return this.p.flip ?
      this.p.x + this.p.cx - x - w :
      this.p.x - this.p.cx + x
  }

  _absy (y) {
    return this.p.y-this.p.cy + y
  }

  renderCollisions (ctx) {
    ctx.save()
    ctx.beginPath()

    ctx.fillStyle = "rgba(0,0,0,0.5)"
    ctx.fillRect(this.p.x-this.p.cx, this.p.y-this.p.cy, this.p.w, this.p.h)
    ctx.fill()
    
    let c = collisions[this.p.animation] || collisions.stand,
        ft = c.torso[this.p.animationFrame] || c.torso[0],
        fh = c.head[this.p.animationFrame] || c.head[0],
        fhh= c.hit && c.hit[this.p.animationFrame] || {}
    
    ctx.fillStyle = "rgba(255,125,125,0.5)"
    ft && ctx.fillRect(this._absx(ft.x, ft.w), this._absy(ft.y), ft.w, ft.h)
    ctx.fill()

    ctx.fillStyle = "rgba(125,125,255,0.5)"
    fh && ctx.fillRect(this._absx(fh.x, fh.w), this._absy(fh.y), fh.w, fh.h)
    ctx.fill()

    ctx.fillStyle = "rgba(125,255,125,0.5)"
    fhh && ctx.fillRect(this._absx(fhh.x, fhh.w), this._absy(fhh.y), fhh.w, fhh.h)
    ctx.fill()
    ctx.restore()
  }

  land () {
    this.p.landed = true
    this.p.jumping = false
  }

  sheet (name) {
    if(name) {
      return Q.MovingSprite.prototype.sheet.call(this, `${name}-${this.p.i}`)
    } else {
      return Q.MovingSprite.prototype.sheet.call(this)
    }
  }

  pause () {
    this.p.paused = true
  }

  unpause () {
    this.p.paused = false
    this.stand()
  }

  fujogeriForward (target) {
    return comboFromSentainoTsuki(jump(attack(() => {
      this.sheet("fujogeri")
      this.play('fujogeri', 1)
      this.on('step', this, 'fujogeriForwardStep')
      this.on('step', this, 'fujogeriStep')
    })), 5 * interpolationMultiplier).call(this, target)
  }

  fujogeri (target) {
    return comboFromSentainoTsuki(comboFromSenten(jump(attack(() => {
      this.sheet("fujogeri")
      this.play('fujogeri', 1)
      this.on('step', this, 'fujogeriStep')
    })), 4 * interpolationMultiplier), 5 * interpolationMultiplier).call(this, target)
  }

  fujogeriForwardStep () {
    if(this.p.animationFrame > 4 * interpolationMultiplier && this.p.animationFrame < 7 * interpolationMultiplier) {
      this.p.vx = this.p.dir * this.speed
      this.off('step', this, 'fujogeriForwardStep')
    }
  }

  fujogeriStep () {
    if(this.p.animationFrame > 4 * interpolationMultiplier) {
      this.p.vy = -this.jumpSpeed
      this.p.landed = false
      this.p.jumping = true
      this.off('step', this, 'fujogeriStep')
    }
  }

  hangetsuate (target) {
    return comboFromManjigeri(comboFromKoten(comboFromSenten(attack(() => {
      this.sheet("hangetsuate")
      this.play('hangetsuate', 1)
    }), 5 * interpolationMultiplier), 5 * interpolationMultiplier), 5 * interpolationMultiplier).call(this, target)
  }

  sentainotsuki (target) {
    return comboFromSensogeri(comboFromManjigeri(attack(() => {
      this.sheet("sentainotsuki")
      this.play('sentainotsuki', 1)
    }), 7 * interpolationMultiplier), 4 * interpolationMultiplier).call(this, target)
  }

  sentainotsukiEnd () {
    this.p.x += this.p.dir * 15 * 2
  }

  manjigeri (target) {
    return comboFromFujogeri(comboFromKoten(comboFromSenten(attack(() => {
      this.sheet("manjigeri")
      this.play('manjigeri', 1)
    }), 4 * interpolationMultiplier), 4 * interpolationMultiplier), 2 * interpolationMultiplier).call(this, target)
  }

  suiheigeri (target) {
    return comboFromSensogeri(attack(function() {
      this.sheet("suiheigeri")
      this.play('suiheigeri', 1)
    }), 4 * interpolationMultiplier).call(this, target)
  }

  sensogeri (target) {
    return comboFromManjigeri(comboFromKoten(comboFromSenten(attack(() => {
      this.sheet("sensogeri")
      this.play('sensogeri', 1)
    }), 8 * interpolationMultiplier), 8 * interpolationMultiplier), 5 * interpolationMultiplier).call(this, target)
  }

  ushiro () {
    return walk(function() {
      this.sheet("ushiro")
      this.play('ushiro', 1)
    }).call(this)
  }

  ushiroEnd () {
    this.p.x += this.p.dir * 4 * 2
    this.p.direction = this.p.direction === 'left' ? 'right' : 'left'
    this.prestep()
  }

  ninoashi () {
    return walk(function() {
      this.p.vx = this.p.dir * this.speed/2
      this.sheet("ninoashi")
      this.play('ninoashi', 1)
    }).call(this)
  }

  taisoku () {
    return walk(function() {
      this.p.vx = -this.p.dir * this.speed
      this.sheet("tsuisoku")
      this.play('taisoku', 1)
    }).call(this)
  }
  
  tsuisoku () {
    return walk(function() {
      this.p.vx = this.p.dir * this.speed
      this.sheet("tsuisoku")
      this.play('tsuisoku', 1)
    }).call(this)
  }

  kosoku () {
    return walk(function() {
      this.p.vx = this.p.dir * this.speed/2
      this.sheet("kosoku")
      this.play('kosoku', 1)
    }).call(this)
  }

  gensoku () {
    return walk(function() {
      this.p.vx = -this.p.dir * this.speed * 2/3
      this.sheet("kosoku")
      this.play('kosoku', 1)
    }).call(this)
  }

  senten () {
    return walk(function () {
      this.sheet("senten")
      this.play('senten', 1)
      this.on('step', this, 'sentenStep')
    }).call(this)
  }

  sentenStep () {
    if (this.p.animationFrame > 3 * interpolationMultiplier) {
      this.p.vx = this.p.dir * this.speed * 2.5
    }
    if (this.p.animationFrame > 11 * interpolationMultiplier) {
      this.p.vx = this.p.dir
    }
  }

  sentenEnd () {
    this.off('step', this, 'sentenStep')
    this.p.vx = this.p.dir
  }

  koten () {
    return walk(function () {
      this.sheet("koten")
      this.play('koten', 1)
      this.on('step', this, 'kotenStep')
    }).call(this)
  }

  kotenStep () {
    if (this.p.animationFrame > 2 * interpolationMultiplier) {
      this.p.vx = -this.p.dir * this.speed * 2.5
    }
    if (this.p.animationFrame > 12 * interpolationMultiplier) {
      this.p.vx = this.p.dir
    }
  }

  kotenEnd () {
    this.off('step', this, 'kotenStep')
    this.p.vx = this.p.dir
  }

  hitStep () {
    if(!collisions[this.p.animation]) return
    if(!collisions[this.p.animation].hit[this.p.animationFrame]) return
    if(!collisions[this.p.animation].hit[this.p.animationFrame].w) return
    const collision = collisions[this.p.animation].hit[this.p.animationFrame]
    const targets = [this.p.target].concat(this.stage.lists.balls)
    const missed = targets
      .map(target => {
        let hit = this.hitTest(target, collision)
        if (hit) {
          playSound('assets/hit-' + sample([1,2,3,4]) + '.mp3')
          let value = target.hit(this.p.dir * this.hitForce[this.p.animation], hit)
          this.scoreHit(value, hit)
          if (hit != 'ball') AttackLog.push(this.p.attackEvent, value, hit)
        }
        return hit
      })
      .reduce((missed, hit) => missed && !hit, true)

    if (!this.p.sounded) playSound('assets/miss-' + sample([1,1,1,1,1,1,2]) + '.mp3')
    this.p.sounded = true
  }

  hitTest (target, coll) {
    if(!target) return false
    if(target.p.hit) return false
    let t = target,
        tp = target.p,
        tc = collisions[tp.animation],
        tt = target instanceof GeriMon && tc.torso[tp.animationFrame],
        th = target instanceof GeriMon && tc.head[tp.animationFrame],
        tb = target instanceof Ball && rect(target.p.x, target.p.y - target.p.cy, target.p.w, target.p.h + target.p.cy),
        cr = rect(this._absx(coll.x, coll.w), this._absy(coll.y), coll.w, coll.h)
    
    if(th && intersects(rect(t._absx(th.x, th.w), t._absy(th.y), th.w, tt.h), cr)) {
      return 'head'
    }
    
    if(tt && intersects(rect(t._absx(tt.x, tt.w), t._absy(tt.y), tt.w, tt.h), cr)) {
      return 'torso'
    }

    if(tb && intersects(tb, cr)) {
      return 'ball'
    }

    return false
  }

  scoreHit (value, hit) {
    if (hit === 'head' || hit === 'torso') {
      let prevMovement = this.p.movements[this.p.movements.length-1]
      if(prevMovement && prevMovement.includes('soku')) {
        value += 1
      }
    }
    let score = Q.state.get("score-" + this.p.i) || 0
    Q.state.inc("total-score-" + this.p.i, value*100)
    if (hit != 'ball') {
      Q.state.set("score-" + this.p.i, Math.min((score + value), 4))
    }
  }

  hit (force, hit) {
    this.stand()
    this.p.hit = true 
    if(hit === 'head' && Math.abs(force) > 35 && Math.random() > .75) {
      playSound(`assets/head-off-${sample([1,2,3])}.mp3`)
      this.sheet("headoff-hit")
      this.play('headoffhit', 1)
      this.stage.insert(new Head(this, force))
      return 4
    } else {
      playSound(`assets/hurt-${sample([1,2,3])}.mp3`)
      this.p.vx += force
      this.sheet("torso-hit")
      this.play('torsohit', 1)
      return 1
    }
  }

  finishKicks () {
    this.off('step', this, 'hitStep')
    this.off('step', this, 'fujogeriStep')
    this.off('step', this, 'fujogeriForwardStep')
    this.off('step', this, 'sentenStep')
    this.off('step', this, 'kotenStep')
    this.off('step', this, 'sentainotsukiStep')
    this.off('prestep', this, 'finishKicks')
  }

  stand () {
    this.p.frame = 0
    this.p.vx = 0
    this.play('stand', 1, true)
    this.sheet("tsuisoku")
    this.p.jumping = false
    this.p.attacking = false
    this.p.walking = false
    this.p.hit = false
    this.p.target = null
    this.finishKicks()
  }

  prestep (t) {
    if(this.p.direction === 'left') {
      this.set({flip: 'x'})
      this.p.dir = -1
      this.p.oppositeDirection = 'right'
      this.p.cx = 12 * 2
    }
    if(this.p.direction === 'right') {
      this.set({flip: ''})
      this.p.dir = 1
      this.p.oppositeDirection = 'left'
      this.p.cx = 10 * 2
    }
  }

}


class Ball extends Q.MovingSprite {

  static slow (p) {
    return new Ball({...p, vx: 60, color: '#69f'}, sample([-120, -140, -170]))
  }

  static medium (p) {
    return new Ball({...p, vx: 80, color: '#4d5'}, sample([-120, -140, -170]))
  }

  static fast (p) {
    return new Ball({...p, vx: 100, color: '#f07900'}, sample([-120, -140, -170]))
  }

  constructor (p, bounce, sound) {
    super(p, {
      w: 8,
      h: 8,
      dir: 1,
      sensor: true,
      life: 0,
      gravity: 0.5,
      vy: bounce,
      bounce
    })
    this.add('2d')
    this.on("bump.bottom", () => {
      playSound(bounce <= -170 ? 'assets/bounce-3.mp3' : bounce <= -140 ? 'assets/bounce-2.mp3' : 'assets/bounce-1.mp3')
      this.p.vy = bounce
    })
  }

  step (t) {
    Q.MovingSprite.prototype.step.call(this, t)
    if (this.p.x < 0 || this.p.x > Q.width || this.p.y < 0 || this.p.y > Q.height) {
      this.destroy()
    }

    this.stage.lists.players.map(p => {
      let hit = this.hitTest(p)
      if (hit) {
        let force = 40
        let value = p.hit(force, hit)
        if (Q.state.get('ballround')) {
          let score = Q.state.get('score-' + p.p.i) || 0
          Q.state.set('score-' + p.p.i, Math.min((score + value), 4))
        }
      }
    })
  }

  hit (force, hit) {
    this.p.vx = force * 8
    this.p.hit = true
    return 4
  }

  hitTest (player) {
    let tp = player.p,
        tc = collisions[tp.animation],
        tt = tc && tc.torso[tp.animationFrame],
        th = tc && tc.head[tp.animationFrame],
        cr = rect(this.p.x, this.p.y, this.p.w, this.p.h)
    
    if (player.p.hit) return false
    
    if(th && intersects(rect(player._absx(th.x, th.w), player._absy(th.y), th.w, tt.h), cr)) {
      return 'head'
    }
    
    if(tt && intersects(rect(player._absx(tt.x, tt.w), player._absy(tt.y), tt.w, tt.h), cr)) {
      return 'torso'
    }

    return false
  }

  draw (ctx) {
    ctx.save()
    ctx.fillStyle = this.p.color
    ctx.strokeStyle = this.p.color
    ctx.beginPath();
    ctx.arc(0, 0, this.p.w/2, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
    ctx.restore()
  }
}

export default GeriMon
export { Ball }