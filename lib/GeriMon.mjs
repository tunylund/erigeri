import Q from './Q.mjs'
import { collisions } from './assets.mjs'
import playSound from './audio.mjs'

function range(i) {
  let res = []
  while(res.length < i) res.push(res.length)
  return res
}

function sample(arr) {
  return arr[Math.floor(arr.length * Math.random())]
}

Q.animations('gerimon', {
  stand: { frames: [0] },
  senten: { frames: range(19), rate: 1/12, loop: false, trigger: 'stand' },
  koten: { frames: range(19), rate: 1/12, loop: false, trigger: 'stand' },
  sentainotsuki: { frames: range(22), rate: 1/12, loop: false, trigger: 'stand' },
  fujogeri: { frames: range(15), rate: 1/12, loop: false, trigger: 'stand' },
  suiheigeri: { frames: range(15), rate: 1/12, loop: false, trigger: 'stand' },
  manjigeri: { frames: range(15), rate: 1/12, loop: false, trigger: 'stand' },
  hangetsuate: { frames: range(21), rate: 1/12, loop: false, trigger: 'stand' },
  sensogeri: { frames: range(20), rate: 1/12, loop: false, trigger: 'stand' },
  tsuisoku: { frames: range(11), rate: 1/12, loop: false, trigger: 'stand' },
  kosoku: { frames: range(18), rate: 1/17, loop: false, trigger: 'stand' },
  ushiro: { frames: range(7), rate: 1/12, loop: false, trigger: 'stand' },
  ninoashi: { frames: range(6), rate: 1/12, loop: false, trigger: 'stand' },
  taisoku: { frames: range(11).reverse(), rate: 1/12, loop: false, trigger: 'stand' },
  torsohit: { frames: [0,1,2,3,2,1,0], rate: 1/12, loop: false, trigger: 'stand' },
  headoffhit: { frames: range(13), rate: 1/12, loop: false }
})

function intersects(a, b) {
  if(a.w + a.h + b.w + b.h == 0) return false
  let xIntesects = a.x < b.x && a.x+a.w > b.x || 
                   a.x < b.x+b.w && a.x+a.w > b.x+b.w,
      yIntesects = a.y < b.y && a.y + a.h > b.y ||
                   a.y < b.y+b.h && a.y+a.h > b.y+b.h
  return xIntesects && yIntesects
}

function rect(x, y, w, h) {
  return {
    x: x||0,
    y: y||0,
    w: w||0,
    h: h||0
  }
}

function trySenten(fn, frame = 0) {
  return function (target) {
    if (this.p.animation === 'senten' && this.p.animationFrame > 5 && this.p.animationFrame < 13) {
      this.sentenEnd()
      this.stand()
      fn.apply(this, arguments)
      this.p.animationFrame = this.p.frame = frame
    } else {
      fn.apply(this, arguments)
    }
  }
}

function tryKoten(fn, frame = 0) {
  return function (target) {
    if (this.p.animation === 'koten' && this.p.animationFrame > 5 && this.p.animationFrame < 13) {
      this.kotenEnd()
      this.stand()
      this.p.direction = this.p.direction === 'left' ? 'right' : 'left'
      this.prestep()
      fn.apply(this, arguments)
      this.p.animationFrame = this.p.frame = frame
    } else {
      fn.apply(this, arguments)
    }
  }
}

function attack(fn) {
  return function(target) {
    if(!this.p.landed) return false
    if(this.p.hit) return false
    if(this.p.attacking) return false
    if(this.p.walking && this.p.animationFrame > 4 || this.p.animation === 'ushiro') return false
    this.sentenEnd()
    this.kotenEnd()
    this.p.sounded = false
    this.p.target = target
    this.p.attacking = true
    this.p.vx = 0
    let d = fn.apply(this, arguments)
    if(typeof d === 'undefined' || d) {
      this.on('step', this, 'hitStep')
      return true
    }
    return false
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
      life: 0
    })
    this.add('2d')
    this.p.vy = -150
    this.p.vx = this.p.dir*force * 2
    this.on("bump.bottom", () => {
      if(this.p.vy > 0)
        playSound('assets/bounce.mp3')
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
  
  get speed () { return 25*2 }
  get friction () { return 5*2 }
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
    let w = 22*2, h = 32*2
    super(p, {
      sprite: "gerimon",
      dir: 1,
      w: w,
      h: h,
      sw: 48*2,
      sh: 32*2,
      sensor: true,
      movements: [],
      points: [
        [-w/2, -h/2], 
        [ w/2, -h/2 ], 
        [ w/2,  h/2 ], 
        [-w/2,  h/2 ]],
      cx: 10*2
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
    ctx.fillRect(this._absx(ft.x, ft.w), this._absy(ft.y), ft.w, ft.h)
    ctx.fill()

    ctx.fillStyle = "rgba(125,125,255,0.5)"
    ctx.fillRect(this._absx(fh.x, fh.w), this._absy(fh.y), fh.w, fh.h)
    ctx.fill()

    ctx.fillStyle = "rgba(125,255,125,0.5)"
    ctx.fillRect(this._absx(fhh.x, fhh.w), this._absy(fhh.y), fhh.w, fhh.h)
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
    jump(attack(() => {
      this.sheet("fujogeri")
      this.play('fujogeri', 1)
      this.on('step', this, 'fujogeriForwardStep')
      this.on('step', this, 'fujogeriStep')
    })).call(this, target)
  }

  fujogeri (target) {
    jump(attack(function() {
      this.sheet("fujogeri")
      this.play('fujogeri', 1)
      this.on('step', this, 'fujogeriStep')
    })).call(this, target)
  }

  fujogeriForwardStep () {
    if(this.p.animationFrame > 4 && this.p.animationFrame < 7) {
      this.p.vx = this.p.dir * this.speed
      this.off('step', this, 'fujogeriForwardStep')
    }
  }

  fujogeriStep () {
    if(this.p.animationFrame > 4) {
      this.p.vy = -this.jumpSpeed
      this.p.landed = false
      this.p.jumping = true
      this.off('step', this, 'fujogeriStep')
    }
  }

  hangetsuate (target) {
    tryKoten(trySenten(attack(function() {
      this.sheet("hangetsuate")
      this.play('hangetsuate', 1)
    }), 5), 5).call(this, target)
  }

  sentainotsuki (target) {
    attack(function() {
      this.sheet("sentainotsuki")
      this.play('sentainotsuki', 1)
    }).call(this, target)
  }

  sentainotsukiEnd () {
    this.p.x += this.p.dir * 15*2
  }

  manjigeri (target) {
    tryKoten(trySenten(attack(function() {
      this.sheet("manjigeri")
      this.play('manjigeri', 1)
    }), 4), 4).call(this, target)
  }

  suiheigeri (target) {
    attack(function() {
      this.sheet("suiheigeri")
      this.play('suiheigeri', 1)
    }).call(this, target)
  }

  sensogeri (target) {
    tryKoten(trySenten(attack(function() {
      this.sheet("sensogeri")
      this.play('sensogeri', 1)
    }), 8), 8).call(this, target)
  }

  ushiro () {
    walk(function() {
      this.sheet("ushiro")
      this.play('ushiro', 1)
    }).call(this)
  }

  ushiroEnd () {
    this.p.x += this.p.dir * 4*2
    this.p.direction = this.p.direction === 'left' ? 'right' : 'left'
    this.prestep()
  }

  ninoashi () {
    walk(function() {
      this.p.vx = this.p.dir * this.speed/2
      this.sheet("ninoashi")
      this.play('ninoashi', 1)
    }).call(this)
  }

  taisoku () {
    walk(function() {
      this.p.vx = -this.p.dir * this.speed
      this.sheet("tsuisoku")
      this.play('taisoku', 1)
    }).call(this)
  }
  
  tsuisoku () {
    walk(function() {
      this.p.vx = this.p.dir * this.speed
      this.sheet("tsuisoku")
      this.play('tsuisoku', 1)
    }).call(this)
  }

  kosoku () {
    walk(function() {
      this.p.vx = this.p.dir * this.speed/2
      this.sheet("kosoku")
      this.play('kosoku', 1)
    }).call(this)
  }

  gensoku () {
    walk(function() {
      this.p.vx = -this.p.dir * this.speed*2/3
      this.sheet("kosoku")
      this.play('kosoku', 1)
    }).call(this)
  }

  senten () {
    walk(function () {
      this.sheet("senten")
      this.play('senten', 1)
      this.on('step', this, 'sentenStep')
    }).call(this)
  }

  sentenStep () {
    if (this.p.animationFrame > 3) {
      this.p.vx = this.p.dir * this.speed*2.5
    }
    if (this.p.animationFrame > 11) {
      this.p.vx = this.p.dir
    }
  }

  sentenEnd () {
    this.off('step', this, 'sentenStep')
    this.p.vx = this.p.dir
  }

  koten () {
    walk(function () {
      this.sheet("koten")
      this.play('koten', 1)
      this.on('step', this, 'kotenStep')
    }).call(this)
  }

  kotenStep () {
    if (this.p.animationFrame > 2) {
      this.p.vx = -this.p.dir * this.speed*2.5
    }
    if (this.p.animationFrame > 12) {
      this.p.vx = this.p.dir
    }
  }

  kotenEnd () {
    this.off('step', this, 'kotenStep')
    this.p.vx = this.p.dir
  }

  hitStep () {
    if(!collisions[this.p.animation]) return
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
    if(hit === 'head' && Math.abs(force) > 35 && Math.random() > .5) {
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
      this.p.cx = 12*2
    }
    if(this.p.direction === 'right') {
      this.set({flip: ''})
      this.p.dir = 1
      this.p.oppositeDirection = 'left'
      this.p.cx = 10*2
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
      vy: bounce
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
        let score = Q.state.get('score-' + p.p.i) || 0
        Q.state.set('score-' + p.p.i, Math.min((score + value), 4))
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