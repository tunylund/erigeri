(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Q = require('./Q')
require('./GeriMon')


function distance(a, b) {
  var x = Math.abs(a.p.x - b.p.x),
      y = Math.abs(a.p.y - b.p.y)
  return Math.sqrt(x*x + y*y);
}

function spotAttack(target) {
  if(target.p.animation === 'fujogeri') {
    if(target.p.animationFrame > 4)
      return 'fujogeri'
  }
  if(target.p.animation === 'suiheigeri') {
    if(target.p.animationFrame > 4)
      return 'suiheigeri'
  }
  if(target.p.animation === 'manjigeri') {
    if(target.p.animationFrame > 4)
      return 'manjigeri'
  } 
}

Q.GeriMon.extend("AnimPlayer", {

  attackSequence: ['sensogeri', 'manjigeri', 'fujogeri', 'suiheigeri', 'sentainotsuki', 'hangetsuate'],
  unsokuSequence: ['ninoashi', 'tsuisoku', 'kosoku', 'gensoku', 'taisoku', 'ushiro'],

  init: function(p) {
    this._super(_.extend({
      anim: null,
      sequence: this.attackSequence
    }, p))
    // this.on('stand', this, 'next')
    // this.next()
  },

  next: function() {
    var n = this.p.sequence[this.p.sequence.indexOf(this.p.anim) + 1] || this.p.sequence[0]
    if(this[n]()) {
      this.p.anim = n
    }
  },

  step: function(t) {
    if(Q.inputs.fire) {
      this.p.sequence = this.p.sequence == this.attackSequence ? this.unsokuSequence : this.attackSequence
    }
    this.next()
  }

})
},{"./GeriMon":3,"./Q":7}],2:[function(require,module,exports){
var Q = require('./Q')
require('./GeriMon')


function distance(a, b) {
  var x = Math.abs(a.p.x - b.p.x),
      y = Math.abs(a.p.y - b.p.y)
  return Math.sqrt(x*x + y*y);
}

function spotAttack(target) {
  if(target.p.attacking && target.p.animationFrame > 4) {
    return target.p.animation
  }
}

Q.GeriMon.extend("AutoPlayer", {

  hitDistance: 35,

  moveCloser: function(target) {
    if(distance(target, this) > this.hitDistance + this.p.w/2) {
      this.tsuisoku()
    } else {
      this.ninoashi()
    }
  },

  moveFurther: function(target) {
    this[_.sample(['taisoku', 'gensoku'])]()
  },

  cancelAttack: function() {
    return
    if(this.p.attacking && this.p.animationFrame < 4) {
      this.stand()
    }
  },

  cancelUnsoku: function() {
    if(this.p.walking) {
      if(this.p.animationFrame < 3 || this.p.animationFrame > 6) {
        this.stand()
      }
    }
  },

  attackDuringAttack: function(target, attack) {
    if(attack === 'suiheigeri') {
      if(target.p.animationFrame < 6) {
        this[_.sample(['fujogeri', 'manjigeri'])](target)
      }
    }
    if(attack === 'fujogeri') {
      if(target.p.animationFrame < 10) {
        this.manjigeri(target)
      }
    }
  },

  attackAfterAttack: function(target, attack) {
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
  },

  evade: function(target, attack) {
    if(attack) {
      var r = Math.random()
      this.cancelAttack()
      if(r > .8) {
        this.kosoku()
      } else if (r > .5 || distance(target, this) < this.hitDistance * 3/4) {
        this.gensoku()
      } else {
        this.taisoku()
      }

    }
  },

  attack: function(target, attack) {
    var dist = distance(target, this)
    if(dist < 15) {
      this[_.sample(['hangetsuate', 'tsuisoku'])](target)
    } else if(dist < 26) {
      this[_.sample(['fujogeri', 'sensogeri', 'manjigeri'])](target)
    } else {
      this[_.sample(['fujogeriForward', 'suiheigeri', 'sentainotsuki'])](target)
    }
    // if(dist > 14 && dist < 22) this.fujogeri(target)
    // if(dist > 17 && dist < 26) this.sensogeri(target)
    // if(dist > 20 && dist < 28) {
    //   this[_.sample(['fujogeriForward', 'manjigeri'])](target)
    // }
    // if(dist > 27 && dist < 35) this.suiheigeri(target)
    // this[_.sample(['suiheigeri', 'manjigeri', 'sensogeri', 'manjigeri', 'sensogeri', 'fujogeri', 'fujogeriForward'])](target) 
  },

  lookAt: function(target) {
    var at = target.p.x < this.p.x ? 'left' : 'right'
    if(at != this.p.direction) this.ushiro()
  },

  step: function(t) {
    this._super.apply(this, arguments)

    if(this.p.paused) return;
    
    var others = _.chain(this.instances).without(this).filter(function(i){ return !i.p.hit }).value(),
        target = _.sample(others),
        dist = target ? distance(target, this) : Infinity;
    
    if(target) {

      this.lookAt(target)

      if(dist < this.hitDistance / 2) {
        this.moveFurther(target)
      }
      
      if(dist > this.hitDistance) {
        this.moveCloser(target)
      }

      var spot = spotAttack(target)
      if(spot) {
        this.evade(target, spot)
      } else {
        if(dist > 8 && dist <= this.hitDistance) {
          this.attack(target)
        }
      }
    }

  }

})
},{"./GeriMon":3,"./Q":7}],3:[function(require,module,exports){
var Q = require('./Q'),
    collisions = require('./assets').collisions

Q.animations('gerimon', {
  stand: { frames: [0] },
  sentainotsuki: { frames: _.range(22), rate: 1/10, loop: false, trigger: 'stand' },
  fujogeri: { frames: _.range(15), rate: 1/10, loop: false, trigger: 'stand' },
  suiheigeri: { frames: _.range(15), rate: 1/10, loop: false, trigger: 'stand' },
  manjigeri: { frames: _.range(15), rate: 1/10, loop: false, trigger: 'stand' },
  hangetsuate: { frames: _.range(21), rate: 1/10, loop: false, trigger: 'stand' },
  sensogeri: { frames: _.range(20), rate: 1/12, loop: false, trigger: 'stand' },
  tsuisoku: { frames: _.range(11), rate: 1/10, loop: false, trigger: 'stand' },
  kosoku: { frames: _.range(18), rate: 1/15, loop: false, trigger: 'stand' },
  ushiro: { frames: _.range(7), rate: 1/12, loop: false, trigger: 'stand' },
  ninoashi: { frames: _.range(6), rate: 1/10, loop: false, trigger: 'stand' },
  taisoku: { frames: _.range(11).reverse(), rate: 1/10, loop: false, trigger: 'stand' },
  torsohit: { frames: [0,1,2,3,2,1,0], rate: 1/10, loop: false, trigger: 'stand' },
  headoffhit: { frames: _.range(12).concat([12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12,12]), rate: 1/10, loop: false, trigger: 'stand' }
});



function intersects(a, b) {
  if(a.w + a.h + b.w + b.h == 0) return false;
  var xIntesects = a.x < b.x && a.x+a.w > b.x || 
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

function attack(fn) {
  return function(target) {
    if(!this.p.landed) return false;
    if(this.p.hit) return false;
    if(this.p.attacking) return false;
    if(this.p.walking && this.p.animationFrame > 4 || this.p.animation === 'ushiro') return false;
    this.p.target = target
    this.p.attacking = true
    this.p.vx = 0
    var d= fn.apply(this, arguments)
    if(typeof d === 'undefined' || d) {
      this.on('step', this, 'hitStep')
      return true
    }
    return false
  }
}

function jump(fn) {
  return function() {
    if(this.p.hit) return false;
    if(this.p.jumping) return false;
    var d= fn.apply(this, arguments)
    return typeof d === 'undefined' || d
  }
}

function walk(fn) {
  return function() {
    if(this.p.hit) return false;
    if(!this.p.landed) return false;
    if(this.p.attacking) return false;
    if(this.p.walking) return false;
    this.p.walking = true
    var d= fn.apply(this, arguments)
    return typeof d === 'undefined' || d
  }
}

Q.MovingSprite.extend("Head", {
  init: function(owner, force) {
    this._super({}, {
      color: "#000000",
      w: 4,
      h: 4,
      x: owner.p.x,
      y: owner.p.y - 13,
      dir: -1*owner.p.dir,
      sensor: true,
      life: 0
    })
    this.add('2d');
    this.p.vy = -150
    this.p.vx = this.p.dir*force * 2
  },
  step: function(t) {
    this._super(t)
    this.p.life += t
    this.p.angle += this.p.dir * t * 400
    if(this.p.life > 5) {
      this.destroy()
    }
  }
})

Q.MovingSprite.extend("GeriMon", {
  instances: [],
  speed: 25,
  friction: 5,
  jumpSpeed: 100,
  hitForce: {
    fujogeri: 40,
    manjigeri: 25,
    sensogeri: 40,
    suiheigeri: 35,
    sentainotsuki: 25,
    hangetsuate: 40
  },

  init: function(p) {
    var w = 22, h = 32
    this._super(p, { 
      sprite: "gerimon",
      dir: 1,
      w: w,
      h: h,
      sw: 48,
      sh: 32,
      sensor: true,
      movements: [],
      points: [
        [-w/2, -h/2], 
        [ w/2, -h/2 ], 
        [ w/2,  h/2 ], 
        [-w/2,  h/2 ]],
      cx: 10
    });
    this.add('2d, animation');
    this.instances.push(this)
    this.p.i = "abc"[this.instances.indexOf(this)]

    this.on("stand", this, "stand");
    this.on("prestep", this, "prestep")
    this.on("bump.bottom", this, "land");
    this.on("animEnd.sentainotsuki", this, "sentainotsukiEnd")
    this.on("animEnd.ushiro", this, "ushiroEnd")
    this.on("animEnd", this, "logMovement")
    // this.on("postdraw", this, "renderCollisions")

    this.stand()
  },

  logMovement: function() {
    this.p.movements.push(this.p.animation)
    this.p.movements = this.p.movements.splice(-3)
  },

  _absx: function(x, w) {
    return this.p.flip ? 
      this.p.x + this.p.cx - x - w :
      this.p.x - this.p.cx + x
  },

  _absy: function(y) {
    return this.p.y-this.p.cy + y
  },

  renderCollisions: function(ctx) {
    ctx.save();
    ctx.beginPath();

    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(this.p.x-this.p.cx, this.p.y-this.p.cy, this.p.w, this.p.h);
    ctx.fill();
    
    var c = collisions[this.p.animation] || collisions.stand,
        ft = c.torso[this.p.animationFrame] || c.torso[0],
        fh = c.head[this.p.animationFrame] || c.head[0],
        fhh= c.hit && c.hit[this.p.animationFrame] || {}
    
    ctx.fillStyle = "rgba(255,0,255,0.5)";
    ctx.fillRect(this._absx(ft.x, ft.w), this._absy(ft.y), ft.w, ft.h);
    ctx.fill();

    ctx.fillStyle = "rgba(0,255,255,0.5)";
    ctx.fillRect(this._absx(fh.x, fh.w), this._absy(fh.y), fh.w, fh.h);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,0,0.5)";
    ctx.fillRect(this._absx(fhh.x, fhh.w), this._absy(fhh.y), fhh.w, fhh.h);
    ctx.fill();
    ctx.restore()
  },

  land: function() {
    this.p.landed = true
  },

  sheet: function(name) {
    if(name) {
      return this._super(name + '-' + this.p.i)
    } else {
      return this._super()
    }
  },

  pause: function() {
    this.p.paused = true
  },

  unpause: function() {
    this.p.paused = false
    this.stand()
  },

  fujogeriForward: jump(attack(function() {
    this.p.vx = 0
    this.sheet("fujogeri")
    this.play('fujogeri', 1)
    this.on('step', this, 'fujogeriForwardStep')
    this.on('step', this, 'fujogeriStep')
  })),

  fujogeri: jump(attack(function() {
    this.p.vx = 0
    this.sheet("fujogeri")
    this.play('fujogeri', 1)
    this.on('step', this, 'fujogeriStep')
  })),

  fujogeriForwardStep: function() {
    if(this.p.animationFrame > 4 && this.p.animationFrame < 7) {
      this.p.vx = this.p.dir * this.speed
      this.off('step', this, 'fujogeriForwardStep')
    }
  },

  fujogeriStep: function() {
    if(this.p.animationFrame >= 5) {
      this.p.vy = -this.jumpSpeed
      this.p.landed = false
      this.p.jumping = true
      this.off('step', this, 'fujogeriStep')
    }
  },

  hangetsuate: attack(function() {
    this.sheet("hangetsuate")
    this.play('hangetsuate', 1)
  }),

  sentainotsuki: attack(function() {
    this.sheet("sentainotsuki")
    this.play('sentainotsuki', 1)
  }),

  sentainotsukiEnd: function() {
    this.p.x += this.p.dir * 15
  },

  manjigeri: attack(function() {
    this.sheet("manjigeri")
    this.play('manjigeri', 1)
  }),

  suiheigeri: attack(function() {
    this.sheet("suiheigeri")
    this.play('suiheigeri', 1)
  }),

  sensogeri: attack(function() {
    this.sheet("sensogeri")
    this.play('sensogeri', 1)
  }),

  ushiro: walk(function() {
    this.sheet("ushiro")
    this.play('ushiro', 1)
  }),

  ushiroEnd: function() {
    this.p.x += this.p.dir * 4
    this.p.direction = this.p.direction === 'left' ? 'right' : 'left'
    this.prestep()
  },

  ninoashi: walk(function() {
    this.p.vx = this.p.dir * this.speed/2;
    this.sheet("ninoashi")
    this.play('ninoashi', 1)
  }),

  taisoku: walk(function() {
    this.p.vx = -this.p.dir * this.speed;
    this.sheet("tsuisoku")
    this.play('taisoku', 1)
  }),
  
  tsuisoku: walk(function() {
    this.p.vx = this.p.dir * this.speed;
    this.sheet("tsuisoku")
    this.play('tsuisoku', 1)
  }),

  kosoku: walk(function() {
    this.p.vx = this.p.dir * this.speed/2;
    this.sheet("kosoku")
    this.play('kosoku', 1)
  }),

  gensoku: walk(function() {
    this.p.vx = -this.p.dir * this.speed*2/3;
    this.sheet("kosoku")
    this.play('kosoku', 1)
  }),

  hitStep: function() {
    if(!collisions[this.p.animation]) return;
    var hit = this.hitTest(collisions[this.p.animation].hit[this.p.animationFrame])
    if(hit) {
      var value = this.p.target.hit(this.p.dir * this.hitForce[this.p.animation], hit)

      var prevMovement = this.p.movements[this.p.movements.length-1]
      if(prevMovement && prevMovement.indexOf('soku') > -1) {
        value += 1
      }

      var score = Q.state.get("score-" + this.p.i) || 0
      Q.state.inc("total-score-" + this.p.i, value*100)
      Q.state.set("score-" + this.p.i, Math.min((score + value), 4));
    }
  },

  hitTest: function(coll) {
    if(!this.p.target) return false
    if(this.p.target.p.hit) return false
    var t = this.p.target,
        tp = this.p.target.p,
        tt = collisions[tp.animation].torso[tp.animationFrame],
        th = collisions[tp.animation].head[tp.animationFrame],
        cr = rect(this._absx(coll.x, coll.w), this._absy(coll.y), coll.w, coll.h)
    
    if(intersects(rect(t._absx(tt.x, tt.w), t._absy(tt.y), tt.w, tt.h), cr)) {
      return 'torso'
    }

    if(intersects(rect(t._absx(th.x, th.w), t._absy(th.y), th.w, tt.h), cr)) {
      return 'head'
    }

    return false
  },

  hit: function(force, hit) {
    this.stand()
    this.p.hit = true
    if(hit === 'head' && Math.abs(force) > 35 && Math.random() > .8) {
      this.sheet("headoff-hit")
      this.play('headoffhit', 1)
      this.stage.insert(new Q.Head(this, force))
      return 4
    } else {
      this.p.vx += force
      this.sheet("torso-hit")
      this.play('torsohit', 1)
      return 1
    }
  },

  finishKicks: function() {
    this.off('step', this, 'hitStep')
    this.off('step', this, 'fujogeriStep')
    this.off('step', this, 'fujogeriForwardStep')
    this.off('step', this, 'sentainotsukiStep')
    this.off('prestep', this, 'finishKicks')
  },

  stand: function() {
    this.p.frame = 0
    this.p.vx = 0
    this.play('stand', 1, true)
    this.sheet("tsuisoku")
    this.p.jumping = false;
    this.p.attacking = false;
    this.p.walking = false;
    this.p.hit = false;
    this.p.target = null;
    this.on('prestep', this, 'finishKicks')
  },

  prestep: function(t) {
    if(this.p.direction === 'left') {
      this.set({flip: 'x'})
      this.p.dir = -1
      this.p.oppositeDirection = 'right'
      this.p.cx = 12
    }
    if(this.p.direction === 'right') {
      this.set({flip: ''})
      this.p.dir = 1
      this.p.oppositeDirection = 'left'
      this.p.cx = 10
    }
  }

});

},{"./Q":7,"./assets":8}],4:[function(require,module,exports){
var Q = require('./Q')

Q.GameObject.extend("Hud",{

  init: _.once(function() {

    this.el = document.createElement('div')
    this.el.className = 'hud'
    this.el.innerHTML = 
      '<div class="hud-a"><span class="score score-a score-0"></span><span class="score-value"></span></div>' +
      '<div class="hud-b"><span class="score score-b score-0"></span><span class="score-value"></span></div>' +
      '<div class="hud-c"><span class="score score-c score-0"></span><span class="score-value"></span></div>'
    document.body.appendChild(this.el)

    this.scoreA = document.querySelector('.score-a')
    this.scoreB = document.querySelector('.score-b')
    this.scoreC = document.querySelector('.score-c')

    this.reset()
  }),

  refresh: function() {
    ['a', 'b', 'c'].forEach(_.bind(function(i) {
      var scoreEl = this['score' + i.toUpperCase()],
          scoreValueEl = scoreEl.parentNode.querySelector('.score-value'),
          score = Q.state.get('score-' + i) || 0
      scoreEl.className = scoreEl.className.replace(/score-\d/g, '')
      scoreEl.classList.add('score-' + score)
      scoreValueEl.innerHTML = Q.state.get('total-score-' + i)
    }, this))
  },

  reset: function() {
    Q.state.set({ 
      'score-a': 0, 'score-b': 0, 'score-c': 0 ,
      'total-score-a': 0, 'total-score-b': 0, 'total-score-c': 0 
    });
    Q.state.on("change", this, 'refresh')
    this.refresh()
  }
})

},{"./Q":7}],5:[function(require,module,exports){
var Q = require('./Q')

Q.animations('judge', {
  stand: { frames: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,13], loop: true, rate: 1/10 },
  walk: { frames: _.range(11), loop: true, rate: 1/20 },
  talk: { frames: [10,11,12,11], loop: true, rate: 1/10  }
})

Q.MovingSprite.extend("Judge", {
  
  init: function(p) {
    this._super(p, { 
      sprite: "judge",
      sheet: "judge",
      sensor: true,
      cx: 14,
      scale: .8
    });
    this.add('2d, animation');
    this.stand()

    this.on('sayNext', this, 'sayNext')
    
    this.textEl = document.createElement('div')
    this.textEl.className = 'judgement'
    document.body.appendChild(this.textEl)

    Q.state.on("change", this, 'judge')
  },

  enter: function() {
    this.p.vx = 30
    this.p.flip = ""
    this.play('walk', 1)
    this.on('step', this, 'enterEnd')
  },

  enterEnd: function() {
    if(this.p.x > 100) {
      this.p.vx = 0
      this.off('step', this, 'enterEnd')
      this.trigger('enterEnd')
    }
  },

  exit: function() {
    this.p.vx = -30
    this.p.flip = "x"
    this.play('walk', 1)
    this.on('step', this, 'exitEnd')
  },

  exitEnd: function() {
    if(this.p.x < 15) {
      this.p.vx = 0
      this.off('step', this, 'exitEnd')
      this.trigger('exitEnd')
      this.stand()
    }
  },

  stand: function() {
    this.p.flip = ""
    this.play('stand', 1)
    this.off('enterEnd', this, 'talk')
    this.off('talkEnd', this, 'exit')
    this.off('exitEnd', this, 'stand')
    this.trigger('stand')
  },

  sayNext: function() {
    var text = "";
    if(this.p.said === 0) { text = "The winner is {color}." }
    if(this.p.said === 1) { text = "{color} is second." }
    if(this.p.said === 2) {
      text = _.sample([
        ['{color}, you bitch.', '{color}... really?', 'just... just don\'t, {color}.'],
        ['{color}, you can stop now.', '{color}, you can do better.', 'C\'mon {color}'],
        ['{color}, almost there.', 'maybe next time try to do better {color}.'],
        ['Tough luck {color}.']
      ][this.p.result[this.p.said].score])
    }
    this.textEl.innerHTML = text.replace('{color}', this.p.result[this.p.said] ? this.p.result[this.p.said].color : "")
    this.p.said += 1
    if(this.p.said > 3) {
      this.exit()
      this.trigger('talkEnd')
    } else {
      _.delay(_.bind(this.trigger, this, 'sayNext'), 3000)
    }
  },

  talk: function() {
    this.play('talk', 1)
    this.p.said = 0
    this.sayNext()
  },

  judge: function() {
    if(this.p.animation != 'stand') return;
    this.p.result = _.sortBy([
      {i: 'a', score: Q.state.get('score-a'), color: 'orange'},
      {i: 'b', score: Q.state.get('score-b'), color: 'blue'},
      {i: 'c', score: Q.state.get('score-c'), color: 'green'}
    ], 'score').reverse()
    if(this.p.result[0].score === 4) {
      this.enter()
      this.on('enterEnd', this, 'talk')
      this.on('talkEnd', this, 'exit')
      this.on('exitEnd', this, 'stand')
    }
  }

})

},{"./Q":7}],6:[function(require,module,exports){
var Q = require('./Q'),
    GeriMon = require('./GeriMon')

Q.GeriMon.extend("Player",{
  init: function(p) {
    this._super(p, {});

    this.p.direction = 'right'
    
    // Q.input.on("fire", this, 'fire');
    this.on("prestep", this, 'attack');
    this.on("prestep", this, 'unsoku');
  },

  attack: function() {
    if(this.p.paused) return;
    
    if(!Q.inputs.fire) return

    var target, tDist = Infinity, dist;
    for(var i=0; i<this.instances.length; i++) {
      if(this.instances[i] != this) {
        dist = Math.abs(this.p.x - this.instances[i].p.x)
        if(dist < tDist) {
          target = this.instances[i]
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

  },

  unsoku: function() {
    if(this.p.paused) return;

    if(Q.inputs.fire) return

    if(Q.inputs.action) {
    
      this.ushiro()
    
    } else {

      if(Q.inputs.up) {
        this.kosoku()
      }

      if(Q.inputs.down) {
        this.gensoku() 
      }

      //forward
      if(Q.inputs[this.p.direction]) {
        this.ninoashi() 
        if(this.p.animation === 'ninoashi' && this.p.animationFrame > 1) {
          this.stand()
          this.tsuisoku()
        }
      }
      //backward
      if(Q.inputs[this.p.direction === 'left' ? 'right' : 'left']) {
        this.taisoku()
      }

    }

    
  }

});

},{"./GeriMon":3,"./Q":7}],7:[function(require,module,exports){

var Q = Quintus()
  .include("Sprites, Scenes, Input, 2D, Touch, UI, Anim")
  .setup({ maximize: true })
  .controls()
  .touch();

Q.Evented.prototype._trigger = Q.Evented.prototype.trigger
Q.Evented.prototype.trigger  = function(event,data) {
  // First make sure there are any listeners, then check for any listeners
  // on this specific event, if not, early out.
  if(this.listeners && this.listeners[event]) {
    // Call each listener in the context of either the target passed into
    // `on` or the object itself.
    var i, l = new Array(this.listeners[event].length), len
    for(i=0,len = this.listeners[event].length;i<len;i++) {
      l[i] = [
        this.listeners[event][i][0], 
        this.listeners[event][i][1]
      ]
    }
    for(i=0,len = l.length;i<len;i++) {
      var listener = l[i];
      listener[1].call(listener[0],data);
    }
  }
}

console.log(Q)

module.exports = Q

},{}],8:[function(require,module,exports){
var Q = require('./Q')



function collisions(name, asset, size) {
  if(!Q.asset(asset)) { throw "Invalid Asset:" + asset; }
  
  exports.collisions[name] = { head: [], torso: [], hit: [] }

  var canvas = document.createElement('canvas'),
      context = canvas.getContext('2d'),
      img = document.createElement('img'),
      imgData,
      head = 150,
      torso = 200,
      hit = 100
  
  img.src = asset;
  canvas.width = img.width
  canvas.height = img.height
  context.drawImage(img, 0, 0);
  
  function find(imgData, rcolor) {
    var a = Array.prototype.indexOf.call(imgData.data, rcolor) / 4,
        b = Array.prototype.lastIndexOf.call(imgData.data, rcolor) / 4,
        c = {}
    if(a < -1) return c
    c.x = a % size.tilew
    c.y = Math.floor(a / size.tilew)
    c.w = b % size.tilew - c.x
    c.h = Math.floor(b / size.tilew) - c.y
    return c
  }

  for(var x = 0; x < img.width; x+=size.tilew) {
    imgData = context.getImageData(x, 0, size.tilew, size.tileh);
    exports.collisions[name].head.push(find(imgData, head))
    exports.collisions[name].torso.push(find(imgData, torso))
    exports.collisions[name].hit.push(find(imgData, hit))
  }
}
exports.collisions = {}




function colorize(asset, color) {
  if(!Q.asset(asset)) { throw "Invalid Asset:" + asset; }

  var canvas = document.createElement('canvas'),
      context = canvas.getContext('2d'),
      img = document.createElement('img'),
      imgData,
      colData,
      colImg = document.createElement("img");
  
  img.src = asset;
  canvas.width = img.width
  canvas.height = img.height
  context.drawImage(img, 0, 0);
  imgData = context.getImageData(0, 0, img.width, img.height)
  colData = context.createImageData(img.width, img.height)

  function setColor(c, d, i) { d[i+0] = c[0]; d[i+1] = c[1]; d[i+2] = c[2]; d[i+3] = c[3] }
  function getColor(d, i) { return [d[i+0], d[i+1], d[i+2], d[i+3]] }
  function prevColor(d, i) { return [d[i-4], d[i-3], d[i-2], d[i-1]] }
  function nextColor(d, i) { return [d[i+4], d[i+5], d[i+6], d[i+7]] }
  function transparent(c) { return c[0] === 0 && c[1] === 0 && c[2] === 0 && c[3] === 0 }
  function dark1(c) { return [c[0] -  5, c[1] -  5, c[2] -  5, c[3]] }
  function dark2(c) { return [c[0] - 10, c[1] - 10, c[2] - 10, c[3]] }
  function dark3(c) { return [c[0] - 80, c[1] - 80, c[2] - 80, c[3]] }
  function lighten(c) { return [c[0] + 30, c[1] + 30, c[2] + 30, c[3]] }
  
  for (var i=0, c; i<imgData.data.length; i+=4) {
    c = getColor(imgData.data, i)
    setColor(lighten(c), colData.data, i)
    if (!transparent(c)) {
      if (transparent(prevColor(imgData.data, i-1))) {
        setColor(dark1(c), colData.data, i)
      }
      if (transparent(prevColor(imgData.data, i))) {
        setColor(dark2(c), colData.data, i)
      }
      if (transparent(nextColor(imgData.data, i))) {
        setColor(dark3(color), colData.data, i)
      }
    }
  }

  context.putImageData(colData, 0, 0);
  colImg.src = canvas.toDataURL("image/png");
  return colImg
}


exports.load = function(cb) {

  var playerAssets = [
    "suiheigeri",
    "manjigeri",
    "tsuisoku",
    "ushiro",
    "kosoku",
    "ninoashi",
    "fujogeri",
    "sensogeri",
    "sentainotsuki",
    "hangetsuate",
    "torso-hit",
    "headoff-hit"]

  Q.load(
    _.flatten([
    
      ["/assets/bg-1.png",
      "/assets/tiles.png",
      "/assets/judge.png"],

      _.map(playerAssets, function(name) {
        return "/assets/" + name + ".png"
      }),

      _.map(_.without(playerAssets, "torso-hit", "headoff-hit"), function(name) {
        return "/assets/" + name + "-collisions.png"
      })

    ]), function() {

    var playerTile = { tilew: 48, tileh: 32 }
    Q.sheet("tiles","/assets/tiles.png", { tilew: 32, tileh: 8 });
    Q.sheet("judge", "/assets/judge.png", {tilew: 32, tileh: 32});

    _.each(playerAssets, function(name) {
      Q.assets["/assets/" + name + "-a.png"] = colorize("/assets/" + name + ".png", [240, 121, 0, 255]);
      Q.assets["/assets/" + name + "-b.png"] = colorize("/assets/" + name + ".png", [102, 153, 255, 255]);
      Q.assets["/assets/" + name + "-c.png"] = colorize("/assets/" + name + ".png", [68, 221, 85, 255]);
      Q.sheet(name + '-a', "/assets/" + name + "-a.png", playerTile);
      Q.sheet(name + '-b', "/assets/" + name + "-b.png", playerTile);
      Q.sheet(name + '-c', "/assets/" + name + "-c.png", playerTile);
    })

    _.each(_.without(playerAssets, "torso-hit", "headoff-hit"), function(name) {
      collisions(name, "/assets/" + name + "-collisions.png", playerTile)
    })

    exports.collisions.stand = {
      head: [exports.collisions.tsuisoku.head[0]],
      torso: [exports.collisions.tsuisoku.torso[0]],
      hit: [exports.collisions.tsuisoku.hit[0]]
    }
    exports.collisions.taisoku = {
      head: [].concat(exports.collisions.tsuisoku.head).reverse(),
      torso: [].concat(exports.collisions.tsuisoku.torso).reverse(),
      hit: [].concat(exports.collisions.tsuisoku.hit).reverse()
    }

    cb()
  });

}

},{"./Q":7}],9:[function(require,module,exports){
var Q = require('./Q'),
    assets = require('./assets')
require('./Player')
require('./AutoPlayer')
require('./AnimPlayer')
require('./Hud')
require('./Judge')

var level = new Q.TileLayer({
 tiles: [
 new Array(12).join('0').split(''),
 new Array(12).join('0').split(''),
 new Array(12).join('0').split(''),
 new Array(12).join('0').split(''),
 new Array(12).join('0').split(''),
 new Array(12).join('1').split('')
 ], sheet: 'tiles' 
})

Q.scene('bg', function(stage) {
  var bg = stage.insert(new Q.Sprite({
    asset: "/assets/bg-1.png",
    scale: 704/900
  }))
  bg.center()
  bg.p.y = 270
  stage.on("destroy",function() {
    judge.destroy()
  });
})

Q.scene("anims", function(stage) {
  var layer = stage.collisionLayer(level);
  var playera = stage.insert(new Q.AnimPlayer({x: 64, y: 5*32}))
  var judge = stage.insert(new Q.Judge({x: 24, y: 5*32}))
  stage.add("viewport")//.moveTo(-window.innerWidth/4, -window.innerHeight/4)
  stage.viewport.scale = 2
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2)
  stage.on("destroy",function() {
    playera.destroy();
    judge.destroy()
  });
})

Q.scene("autoplay", function(stage) {
  var layer = stage.collisionLayer(level);
  var playera = stage.insert(new Q.AutoPlayer())
  var playerb = stage.insert(new Q.AutoPlayer())
  var playerc = stage.insert(new Q.AutoPlayer());
  var judge = stage.insert(new Q.Judge({x: 24, y: 5*32}))
  stage.add("viewport")
  stage.viewport.scale = 2
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2)
  stage.on("destroy",function() {
    playera.destroy();
    playerb.destroy();
    playerc.destroy();
    judge.destroy()
  });
  Q.state.on('change', function() {
    if(Q.state.get('score-a') == 4 || Q.state.get('score-b') == 4 || Q.state.get('score-c') == 4) {
      _.invoke([playera, playerb, playerc], 'pause')
    }
  })
  function newRound() {
    hud.reset()
    playera.set({x: 64, y: 5*32})
    playerb.set({x: 168, y: 5*32})
    playerc.set({x: 256, y: 5*32})
    _.invoke([playera, playerb, playerc], 'unpause')
  }
  judge.on('talkEnd', newRound)
  newRound()
})

Q.scene("play", function(stage) {
  var layer = stage.collisionLayer(level);
  var playera = stage.insert(new Q.Player({x: 64, y: 192}))
  var playerb = stage.insert(new Q.AutoPlayer({x: 256, y: 192}))
  var judge = stage.insert(new Q.Judge({x: 24, y: 192}))
  stage.add("viewport")
  stage.viewport.scale = 2
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2)
  stage.on("destroy",function() {
    playera.destroy();
    playerb.destroy();
    judge.destroy()
  });
})

Q.scene('endGame',function(stage) {
  var container = stage.insert(new Q.UI.Container({
    x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
  }));
  
  var button = container.insert(new Q.UI.Button({ x: 0, y: 0, fill: "#CCCCCC",
                                                  label: "Play Again" }))         
  var label = container.insert(new Q.UI.Text({x:10, y: -10 - button.p.h, 
                                                   label: stage.options.label }));

  button.on("click",function() {
    Q.clearStages();
    Q.stageScene('level1');
  });
  container.fit(20);
});

var hud;
assets.load(function() {
  hud = new Q.Hud()
  hud.init()
  Q.stageScene("bg", 0);
  Q.stageScene("autoplay", 1);
})

},{"./AnimPlayer":1,"./AutoPlayer":2,"./Hud":4,"./Judge":5,"./Player":6,"./Q":7,"./assets":8}]},{},[9])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvQW5pbVBsYXllci5qcyIsImxpYi9BdXRvUGxheWVyLmpzIiwibGliL0dlcmlNb24uanMiLCJsaWIvSHVkLmpzIiwibGliL0p1ZGdlLmpzIiwibGliL1BsYXllci5qcyIsImxpYi9RLmpzIiwibGliL2Fzc2V0cy5qcyIsImxpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBRID0gcmVxdWlyZSgnLi9RJylcbnJlcXVpcmUoJy4vR2VyaU1vbicpXG5cblxuZnVuY3Rpb24gZGlzdGFuY2UoYSwgYikge1xuICB2YXIgeCA9IE1hdGguYWJzKGEucC54IC0gYi5wLngpLFxuICAgICAgeSA9IE1hdGguYWJzKGEucC55IC0gYi5wLnkpXG4gIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5KTtcbn1cblxuZnVuY3Rpb24gc3BvdEF0dGFjayh0YXJnZXQpIHtcbiAgaWYodGFyZ2V0LnAuYW5pbWF0aW9uID09PSAnZnVqb2dlcmknKSB7XG4gICAgaWYodGFyZ2V0LnAuYW5pbWF0aW9uRnJhbWUgPiA0KVxuICAgICAgcmV0dXJuICdmdWpvZ2VyaSdcbiAgfVxuICBpZih0YXJnZXQucC5hbmltYXRpb24gPT09ICdzdWloZWlnZXJpJykge1xuICAgIGlmKHRhcmdldC5wLmFuaW1hdGlvbkZyYW1lID4gNClcbiAgICAgIHJldHVybiAnc3VpaGVpZ2VyaSdcbiAgfVxuICBpZih0YXJnZXQucC5hbmltYXRpb24gPT09ICdtYW5qaWdlcmknKSB7XG4gICAgaWYodGFyZ2V0LnAuYW5pbWF0aW9uRnJhbWUgPiA0KVxuICAgICAgcmV0dXJuICdtYW5qaWdlcmknXG4gIH0gXG59XG5cblEuR2VyaU1vbi5leHRlbmQoXCJBbmltUGxheWVyXCIsIHtcblxuICBhdHRhY2tTZXF1ZW5jZTogWydzZW5zb2dlcmknLCAnbWFuamlnZXJpJywgJ2Z1am9nZXJpJywgJ3N1aWhlaWdlcmknLCAnc2VudGFpbm90c3VraScsICdoYW5nZXRzdWF0ZSddLFxuICB1bnNva3VTZXF1ZW5jZTogWyduaW5vYXNoaScsICd0c3Vpc29rdScsICdrb3Nva3UnLCAnZ2Vuc29rdScsICd0YWlzb2t1JywgJ3VzaGlybyddLFxuXG4gIGluaXQ6IGZ1bmN0aW9uKHApIHtcbiAgICB0aGlzLl9zdXBlcihfLmV4dGVuZCh7XG4gICAgICBhbmltOiBudWxsLFxuICAgICAgc2VxdWVuY2U6IHRoaXMuYXR0YWNrU2VxdWVuY2VcbiAgICB9LCBwKSlcbiAgICAvLyB0aGlzLm9uKCdzdGFuZCcsIHRoaXMsICduZXh0JylcbiAgICAvLyB0aGlzLm5leHQoKVxuICB9LFxuXG4gIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBuID0gdGhpcy5wLnNlcXVlbmNlW3RoaXMucC5zZXF1ZW5jZS5pbmRleE9mKHRoaXMucC5hbmltKSArIDFdIHx8IHRoaXMucC5zZXF1ZW5jZVswXVxuICAgIGlmKHRoaXNbbl0oKSkge1xuICAgICAgdGhpcy5wLmFuaW0gPSBuXG4gICAgfVxuICB9LFxuXG4gIHN0ZXA6IGZ1bmN0aW9uKHQpIHtcbiAgICBpZihRLmlucHV0cy5maXJlKSB7XG4gICAgICB0aGlzLnAuc2VxdWVuY2UgPSB0aGlzLnAuc2VxdWVuY2UgPT0gdGhpcy5hdHRhY2tTZXF1ZW5jZSA/IHRoaXMudW5zb2t1U2VxdWVuY2UgOiB0aGlzLmF0dGFja1NlcXVlbmNlXG4gICAgfVxuICAgIHRoaXMubmV4dCgpXG4gIH1cblxufSkiLCJ2YXIgUSA9IHJlcXVpcmUoJy4vUScpXG5yZXF1aXJlKCcuL0dlcmlNb24nKVxuXG5cbmZ1bmN0aW9uIGRpc3RhbmNlKGEsIGIpIHtcbiAgdmFyIHggPSBNYXRoLmFicyhhLnAueCAtIGIucC54KSxcbiAgICAgIHkgPSBNYXRoLmFicyhhLnAueSAtIGIucC55KVxuICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSk7XG59XG5cbmZ1bmN0aW9uIHNwb3RBdHRhY2sodGFyZ2V0KSB7XG4gIGlmKHRhcmdldC5wLmF0dGFja2luZyAmJiB0YXJnZXQucC5hbmltYXRpb25GcmFtZSA+IDQpIHtcbiAgICByZXR1cm4gdGFyZ2V0LnAuYW5pbWF0aW9uXG4gIH1cbn1cblxuUS5HZXJpTW9uLmV4dGVuZChcIkF1dG9QbGF5ZXJcIiwge1xuXG4gIGhpdERpc3RhbmNlOiAzNSxcblxuICBtb3ZlQ2xvc2VyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICBpZihkaXN0YW5jZSh0YXJnZXQsIHRoaXMpID4gdGhpcy5oaXREaXN0YW5jZSArIHRoaXMucC53LzIpIHtcbiAgICAgIHRoaXMudHN1aXNva3UoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm5pbm9hc2hpKClcbiAgICB9XG4gIH0sXG5cbiAgbW92ZUZ1cnRoZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgIHRoaXNbXy5zYW1wbGUoWyd0YWlzb2t1JywgJ2dlbnNva3UnXSldKClcbiAgfSxcblxuICBjYW5jZWxBdHRhY2s6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVyblxuICAgIGlmKHRoaXMucC5hdHRhY2tpbmcgJiYgdGhpcy5wLmFuaW1hdGlvbkZyYW1lIDwgNCkge1xuICAgICAgdGhpcy5zdGFuZCgpXG4gICAgfVxuICB9LFxuXG4gIGNhbmNlbFVuc29rdTogZnVuY3Rpb24oKSB7XG4gICAgaWYodGhpcy5wLndhbGtpbmcpIHtcbiAgICAgIGlmKHRoaXMucC5hbmltYXRpb25GcmFtZSA8IDMgfHwgdGhpcy5wLmFuaW1hdGlvbkZyYW1lID4gNikge1xuICAgICAgICB0aGlzLnN0YW5kKClcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgYXR0YWNrRHVyaW5nQXR0YWNrOiBmdW5jdGlvbih0YXJnZXQsIGF0dGFjaykge1xuICAgIGlmKGF0dGFjayA9PT0gJ3N1aWhlaWdlcmknKSB7XG4gICAgICBpZih0YXJnZXQucC5hbmltYXRpb25GcmFtZSA8IDYpIHtcbiAgICAgICAgdGhpc1tfLnNhbXBsZShbJ2Z1am9nZXJpJywgJ21hbmppZ2VyaSddKV0odGFyZ2V0KVxuICAgICAgfVxuICAgIH1cbiAgICBpZihhdHRhY2sgPT09ICdmdWpvZ2VyaScpIHtcbiAgICAgIGlmKHRhcmdldC5wLmFuaW1hdGlvbkZyYW1lIDwgMTApIHtcbiAgICAgICAgdGhpcy5tYW5qaWdlcmkodGFyZ2V0KVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBhdHRhY2tBZnRlckF0dGFjazogZnVuY3Rpb24odGFyZ2V0LCBhdHRhY2spIHtcbiAgICBpZihhdHRhY2sgPT09ICdzdWloZWlnZXJpJykge1xuICAgICAgaWYodGFyZ2V0LnAuYW5pbWF0aW9uRnJhbWUgPiA2KSB7XG4gICAgICAgIHRoaXMuZnVqb2dlcmkodGFyZ2V0KVxuICAgICAgfVxuICAgIH1cbiAgICBpZihhdHRhY2sgPT09ICdmdWpvZ2VyaScpIHtcbiAgICAgIGlmKHRhcmdldC5wLmFuaW1hdGlvbkZyYW1lID4gMTApIHtcbiAgICAgICAgdGhpcy5tYW5qaWdlcmkodGFyZ2V0KVxuICAgICAgfVxuICAgIH1cbiAgICBpZihhdHRhY2sgPT09ICdtYW5qaWdlcmknKSB7XG4gICAgICBpZih0YXJnZXQucC5hbmltYXRpb25GcmFtZSA+IDcpIHtcbiAgICAgICAgdGhpcy5zdWloZWlnZXJpKHRhcmdldClcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgZXZhZGU6IGZ1bmN0aW9uKHRhcmdldCwgYXR0YWNrKSB7XG4gICAgaWYoYXR0YWNrKSB7XG4gICAgICB2YXIgciA9IE1hdGgucmFuZG9tKClcbiAgICAgIHRoaXMuY2FuY2VsQXR0YWNrKClcbiAgICAgIGlmKHIgPiAuOCkge1xuICAgICAgICB0aGlzLmtvc29rdSgpXG4gICAgICB9IGVsc2UgaWYgKHIgPiAuNSB8fCBkaXN0YW5jZSh0YXJnZXQsIHRoaXMpIDwgdGhpcy5oaXREaXN0YW5jZSAqIDMvNCkge1xuICAgICAgICB0aGlzLmdlbnNva3UoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy50YWlzb2t1KClcbiAgICAgIH1cblxuICAgIH1cbiAgfSxcblxuICBhdHRhY2s6IGZ1bmN0aW9uKHRhcmdldCwgYXR0YWNrKSB7XG4gICAgdmFyIGRpc3QgPSBkaXN0YW5jZSh0YXJnZXQsIHRoaXMpXG4gICAgaWYoZGlzdCA8IDE1KSB7XG4gICAgICB0aGlzW18uc2FtcGxlKFsnaGFuZ2V0c3VhdGUnLCAndHN1aXNva3UnXSldKHRhcmdldClcbiAgICB9IGVsc2UgaWYoZGlzdCA8IDI2KSB7XG4gICAgICB0aGlzW18uc2FtcGxlKFsnZnVqb2dlcmknLCAnc2Vuc29nZXJpJywgJ21hbmppZ2VyaSddKV0odGFyZ2V0KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzW18uc2FtcGxlKFsnZnVqb2dlcmlGb3J3YXJkJywgJ3N1aWhlaWdlcmknLCAnc2VudGFpbm90c3VraSddKV0odGFyZ2V0KVxuICAgIH1cbiAgICAvLyBpZihkaXN0ID4gMTQgJiYgZGlzdCA8IDIyKSB0aGlzLmZ1am9nZXJpKHRhcmdldClcbiAgICAvLyBpZihkaXN0ID4gMTcgJiYgZGlzdCA8IDI2KSB0aGlzLnNlbnNvZ2VyaSh0YXJnZXQpXG4gICAgLy8gaWYoZGlzdCA+IDIwICYmIGRpc3QgPCAyOCkge1xuICAgIC8vICAgdGhpc1tfLnNhbXBsZShbJ2Z1am9nZXJpRm9yd2FyZCcsICdtYW5qaWdlcmknXSldKHRhcmdldClcbiAgICAvLyB9XG4gICAgLy8gaWYoZGlzdCA+IDI3ICYmIGRpc3QgPCAzNSkgdGhpcy5zdWloZWlnZXJpKHRhcmdldClcbiAgICAvLyB0aGlzW18uc2FtcGxlKFsnc3VpaGVpZ2VyaScsICdtYW5qaWdlcmknLCAnc2Vuc29nZXJpJywgJ21hbmppZ2VyaScsICdzZW5zb2dlcmknLCAnZnVqb2dlcmknLCAnZnVqb2dlcmlGb3J3YXJkJ10pXSh0YXJnZXQpIFxuICB9LFxuXG4gIGxvb2tBdDogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgdmFyIGF0ID0gdGFyZ2V0LnAueCA8IHRoaXMucC54ID8gJ2xlZnQnIDogJ3JpZ2h0J1xuICAgIGlmKGF0ICE9IHRoaXMucC5kaXJlY3Rpb24pIHRoaXMudXNoaXJvKClcbiAgfSxcblxuICBzdGVwOiBmdW5jdGlvbih0KSB7XG4gICAgdGhpcy5fc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuXG4gICAgaWYodGhpcy5wLnBhdXNlZCkgcmV0dXJuO1xuICAgIFxuICAgIHZhciBvdGhlcnMgPSBfLmNoYWluKHRoaXMuaW5zdGFuY2VzKS53aXRob3V0KHRoaXMpLmZpbHRlcihmdW5jdGlvbihpKXsgcmV0dXJuICFpLnAuaGl0IH0pLnZhbHVlKCksXG4gICAgICAgIHRhcmdldCA9IF8uc2FtcGxlKG90aGVycyksXG4gICAgICAgIGRpc3QgPSB0YXJnZXQgPyBkaXN0YW5jZSh0YXJnZXQsIHRoaXMpIDogSW5maW5pdHk7XG4gICAgXG4gICAgaWYodGFyZ2V0KSB7XG5cbiAgICAgIHRoaXMubG9va0F0KHRhcmdldClcblxuICAgICAgaWYoZGlzdCA8IHRoaXMuaGl0RGlzdGFuY2UgLyAyKSB7XG4gICAgICAgIHRoaXMubW92ZUZ1cnRoZXIodGFyZ2V0KVxuICAgICAgfVxuICAgICAgXG4gICAgICBpZihkaXN0ID4gdGhpcy5oaXREaXN0YW5jZSkge1xuICAgICAgICB0aGlzLm1vdmVDbG9zZXIodGFyZ2V0KVxuICAgICAgfVxuXG4gICAgICB2YXIgc3BvdCA9IHNwb3RBdHRhY2sodGFyZ2V0KVxuICAgICAgaWYoc3BvdCkge1xuICAgICAgICB0aGlzLmV2YWRlKHRhcmdldCwgc3BvdClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmKGRpc3QgPiA4ICYmIGRpc3QgPD0gdGhpcy5oaXREaXN0YW5jZSkge1xuICAgICAgICAgIHRoaXMuYXR0YWNrKHRhcmdldClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICB9XG5cbn0pIiwidmFyIFEgPSByZXF1aXJlKCcuL1EnKSxcbiAgICBjb2xsaXNpb25zID0gcmVxdWlyZSgnLi9hc3NldHMnKS5jb2xsaXNpb25zXG5cblEuYW5pbWF0aW9ucygnZ2VyaW1vbicsIHtcbiAgc3RhbmQ6IHsgZnJhbWVzOiBbMF0gfSxcbiAgc2VudGFpbm90c3VraTogeyBmcmFtZXM6IF8ucmFuZ2UoMjIpLCByYXRlOiAxLzEwLCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICBmdWpvZ2VyaTogeyBmcmFtZXM6IF8ucmFuZ2UoMTUpLCByYXRlOiAxLzEwLCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICBzdWloZWlnZXJpOiB7IGZyYW1lczogXy5yYW5nZSgxNSksIHJhdGU6IDEvMTAsIGxvb3A6IGZhbHNlLCB0cmlnZ2VyOiAnc3RhbmQnIH0sXG4gIG1hbmppZ2VyaTogeyBmcmFtZXM6IF8ucmFuZ2UoMTUpLCByYXRlOiAxLzEwLCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICBoYW5nZXRzdWF0ZTogeyBmcmFtZXM6IF8ucmFuZ2UoMjEpLCByYXRlOiAxLzEwLCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICBzZW5zb2dlcmk6IHsgZnJhbWVzOiBfLnJhbmdlKDIwKSwgcmF0ZTogMS8xMiwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAgdHN1aXNva3U6IHsgZnJhbWVzOiBfLnJhbmdlKDExKSwgcmF0ZTogMS8xMCwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAga29zb2t1OiB7IGZyYW1lczogXy5yYW5nZSgxOCksIHJhdGU6IDEvMTUsIGxvb3A6IGZhbHNlLCB0cmlnZ2VyOiAnc3RhbmQnIH0sXG4gIHVzaGlybzogeyBmcmFtZXM6IF8ucmFuZ2UoNyksIHJhdGU6IDEvMTIsIGxvb3A6IGZhbHNlLCB0cmlnZ2VyOiAnc3RhbmQnIH0sXG4gIG5pbm9hc2hpOiB7IGZyYW1lczogXy5yYW5nZSg2KSwgcmF0ZTogMS8xMCwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAgdGFpc29rdTogeyBmcmFtZXM6IF8ucmFuZ2UoMTEpLnJldmVyc2UoKSwgcmF0ZTogMS8xMCwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAgdG9yc29oaXQ6IHsgZnJhbWVzOiBbMCwxLDIsMywyLDEsMF0sIHJhdGU6IDEvMTAsIGxvb3A6IGZhbHNlLCB0cmlnZ2VyOiAnc3RhbmQnIH0sXG4gIGhlYWRvZmZoaXQ6IHsgZnJhbWVzOiBfLnJhbmdlKDEyKS5jb25jYXQoWzEyLDEyLDEyLDEyLDEyLDEyLDEyLDEyLDEyLDEyLDEyLDEyLDEyLDEyLDEyLDEyLDEyLDEyLDEyLDEyXSksIHJhdGU6IDEvMTAsIGxvb3A6IGZhbHNlLCB0cmlnZ2VyOiAnc3RhbmQnIH1cbn0pO1xuXG5cblxuZnVuY3Rpb24gaW50ZXJzZWN0cyhhLCBiKSB7XG4gIGlmKGEudyArIGEuaCArIGIudyArIGIuaCA9PSAwKSByZXR1cm4gZmFsc2U7XG4gIHZhciB4SW50ZXNlY3RzID0gYS54IDwgYi54ICYmIGEueCthLncgPiBiLnggfHwgXG4gICAgICAgICAgICAgICAgICAgYS54IDwgYi54K2IudyAmJiBhLngrYS53ID4gYi54K2IudyxcbiAgICAgIHlJbnRlc2VjdHMgPSBhLnkgPCBiLnkgJiYgYS55ICsgYS5oID4gYi55IHx8XG4gICAgICAgICAgICAgICAgICAgYS55IDwgYi55K2IuaCAmJiBhLnkrYS5oID4gYi55K2IuaFxuICByZXR1cm4geEludGVzZWN0cyAmJiB5SW50ZXNlY3RzXG59XG5mdW5jdGlvbiByZWN0KHgsIHksIHcsIGgpIHtcbiAgcmV0dXJuIHtcbiAgICB4OiB4fHwwLFxuICAgIHk6IHl8fDAsXG4gICAgdzogd3x8MCxcbiAgICBoOiBofHwwXG4gIH1cbn1cblxuZnVuY3Rpb24gYXR0YWNrKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICBpZighdGhpcy5wLmxhbmRlZCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmKHRoaXMucC5oaXQpIHJldHVybiBmYWxzZTtcbiAgICBpZih0aGlzLnAuYXR0YWNraW5nKSByZXR1cm4gZmFsc2U7XG4gICAgaWYodGhpcy5wLndhbGtpbmcgJiYgdGhpcy5wLmFuaW1hdGlvbkZyYW1lID4gNCB8fCB0aGlzLnAuYW5pbWF0aW9uID09PSAndXNoaXJvJykgcmV0dXJuIGZhbHNlO1xuICAgIHRoaXMucC50YXJnZXQgPSB0YXJnZXRcbiAgICB0aGlzLnAuYXR0YWNraW5nID0gdHJ1ZVxuICAgIHRoaXMucC52eCA9IDBcbiAgICB2YXIgZD0gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgIGlmKHR5cGVvZiBkID09PSAndW5kZWZpbmVkJyB8fCBkKSB7XG4gICAgICB0aGlzLm9uKCdzdGVwJywgdGhpcywgJ2hpdFN0ZXAnKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZnVuY3Rpb24ganVtcChmbikge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgaWYodGhpcy5wLmhpdCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmKHRoaXMucC5qdW1waW5nKSByZXR1cm4gZmFsc2U7XG4gICAgdmFyIGQ9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICByZXR1cm4gdHlwZW9mIGQgPT09ICd1bmRlZmluZWQnIHx8IGRcbiAgfVxufVxuXG5mdW5jdGlvbiB3YWxrKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLnAuaGl0KSByZXR1cm4gZmFsc2U7XG4gICAgaWYoIXRoaXMucC5sYW5kZWQpIHJldHVybiBmYWxzZTtcbiAgICBpZih0aGlzLnAuYXR0YWNraW5nKSByZXR1cm4gZmFsc2U7XG4gICAgaWYodGhpcy5wLndhbGtpbmcpIHJldHVybiBmYWxzZTtcbiAgICB0aGlzLnAud2Fsa2luZyA9IHRydWVcbiAgICB2YXIgZD0gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgIHJldHVybiB0eXBlb2YgZCA9PT0gJ3VuZGVmaW5lZCcgfHwgZFxuICB9XG59XG5cblEuTW92aW5nU3ByaXRlLmV4dGVuZChcIkhlYWRcIiwge1xuICBpbml0OiBmdW5jdGlvbihvd25lciwgZm9yY2UpIHtcbiAgICB0aGlzLl9zdXBlcih7fSwge1xuICAgICAgY29sb3I6IFwiIzAwMDAwMFwiLFxuICAgICAgdzogNCxcbiAgICAgIGg6IDQsXG4gICAgICB4OiBvd25lci5wLngsXG4gICAgICB5OiBvd25lci5wLnkgLSAxMyxcbiAgICAgIGRpcjogLTEqb3duZXIucC5kaXIsXG4gICAgICBzZW5zb3I6IHRydWUsXG4gICAgICBsaWZlOiAwXG4gICAgfSlcbiAgICB0aGlzLmFkZCgnMmQnKTtcbiAgICB0aGlzLnAudnkgPSAtMTUwXG4gICAgdGhpcy5wLnZ4ID0gdGhpcy5wLmRpcipmb3JjZSAqIDJcbiAgfSxcbiAgc3RlcDogZnVuY3Rpb24odCkge1xuICAgIHRoaXMuX3N1cGVyKHQpXG4gICAgdGhpcy5wLmxpZmUgKz0gdFxuICAgIHRoaXMucC5hbmdsZSArPSB0aGlzLnAuZGlyICogdCAqIDQwMFxuICAgIGlmKHRoaXMucC5saWZlID4gNSkge1xuICAgICAgdGhpcy5kZXN0cm95KClcbiAgICB9XG4gIH1cbn0pXG5cblEuTW92aW5nU3ByaXRlLmV4dGVuZChcIkdlcmlNb25cIiwge1xuICBpbnN0YW5jZXM6IFtdLFxuICBzcGVlZDogMjUsXG4gIGZyaWN0aW9uOiA1LFxuICBqdW1wU3BlZWQ6IDEwMCxcbiAgaGl0Rm9yY2U6IHtcbiAgICBmdWpvZ2VyaTogNDAsXG4gICAgbWFuamlnZXJpOiAyNSxcbiAgICBzZW5zb2dlcmk6IDQwLFxuICAgIHN1aWhlaWdlcmk6IDM1LFxuICAgIHNlbnRhaW5vdHN1a2k6IDI1LFxuICAgIGhhbmdldHN1YXRlOiA0MFxuICB9LFxuXG4gIGluaXQ6IGZ1bmN0aW9uKHApIHtcbiAgICB2YXIgdyA9IDIyLCBoID0gMzJcbiAgICB0aGlzLl9zdXBlcihwLCB7IFxuICAgICAgc3ByaXRlOiBcImdlcmltb25cIixcbiAgICAgIGRpcjogMSxcbiAgICAgIHc6IHcsXG4gICAgICBoOiBoLFxuICAgICAgc3c6IDQ4LFxuICAgICAgc2g6IDMyLFxuICAgICAgc2Vuc29yOiB0cnVlLFxuICAgICAgbW92ZW1lbnRzOiBbXSxcbiAgICAgIHBvaW50czogW1xuICAgICAgICBbLXcvMiwgLWgvMl0sIFxuICAgICAgICBbIHcvMiwgLWgvMiBdLCBcbiAgICAgICAgWyB3LzIsICBoLzIgXSwgXG4gICAgICAgIFstdy8yLCAgaC8yIF1dLFxuICAgICAgY3g6IDEwXG4gICAgfSk7XG4gICAgdGhpcy5hZGQoJzJkLCBhbmltYXRpb24nKTtcbiAgICB0aGlzLmluc3RhbmNlcy5wdXNoKHRoaXMpXG4gICAgdGhpcy5wLmkgPSBcImFiY1wiW3RoaXMuaW5zdGFuY2VzLmluZGV4T2YodGhpcyldXG5cbiAgICB0aGlzLm9uKFwic3RhbmRcIiwgdGhpcywgXCJzdGFuZFwiKTtcbiAgICB0aGlzLm9uKFwicHJlc3RlcFwiLCB0aGlzLCBcInByZXN0ZXBcIilcbiAgICB0aGlzLm9uKFwiYnVtcC5ib3R0b21cIiwgdGhpcywgXCJsYW5kXCIpO1xuICAgIHRoaXMub24oXCJhbmltRW5kLnNlbnRhaW5vdHN1a2lcIiwgdGhpcywgXCJzZW50YWlub3RzdWtpRW5kXCIpXG4gICAgdGhpcy5vbihcImFuaW1FbmQudXNoaXJvXCIsIHRoaXMsIFwidXNoaXJvRW5kXCIpXG4gICAgdGhpcy5vbihcImFuaW1FbmRcIiwgdGhpcywgXCJsb2dNb3ZlbWVudFwiKVxuICAgIC8vIHRoaXMub24oXCJwb3N0ZHJhd1wiLCB0aGlzLCBcInJlbmRlckNvbGxpc2lvbnNcIilcblxuICAgIHRoaXMuc3RhbmQoKVxuICB9LFxuXG4gIGxvZ01vdmVtZW50OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAubW92ZW1lbnRzLnB1c2godGhpcy5wLmFuaW1hdGlvbilcbiAgICB0aGlzLnAubW92ZW1lbnRzID0gdGhpcy5wLm1vdmVtZW50cy5zcGxpY2UoLTMpXG4gIH0sXG5cbiAgX2Fic3g6IGZ1bmN0aW9uKHgsIHcpIHtcbiAgICByZXR1cm4gdGhpcy5wLmZsaXAgPyBcbiAgICAgIHRoaXMucC54ICsgdGhpcy5wLmN4IC0geCAtIHcgOlxuICAgICAgdGhpcy5wLnggLSB0aGlzLnAuY3ggKyB4XG4gIH0sXG5cbiAgX2Fic3k6IGZ1bmN0aW9uKHkpIHtcbiAgICByZXR1cm4gdGhpcy5wLnktdGhpcy5wLmN5ICsgeVxuICB9LFxuXG4gIHJlbmRlckNvbGxpc2lvbnM6IGZ1bmN0aW9uKGN0eCkge1xuICAgIGN0eC5zYXZlKCk7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuXG4gICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgwLDAsMCwwLjUpXCI7XG4gICAgY3R4LmZpbGxSZWN0KHRoaXMucC54LXRoaXMucC5jeCwgdGhpcy5wLnktdGhpcy5wLmN5LCB0aGlzLnAudywgdGhpcy5wLmgpO1xuICAgIGN0eC5maWxsKCk7XG4gICAgXG4gICAgdmFyIGMgPSBjb2xsaXNpb25zW3RoaXMucC5hbmltYXRpb25dIHx8IGNvbGxpc2lvbnMuc3RhbmQsXG4gICAgICAgIGZ0ID0gYy50b3Jzb1t0aGlzLnAuYW5pbWF0aW9uRnJhbWVdIHx8IGMudG9yc29bMF0sXG4gICAgICAgIGZoID0gYy5oZWFkW3RoaXMucC5hbmltYXRpb25GcmFtZV0gfHwgYy5oZWFkWzBdLFxuICAgICAgICBmaGg9IGMuaGl0ICYmIGMuaGl0W3RoaXMucC5hbmltYXRpb25GcmFtZV0gfHwge31cbiAgICBcbiAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDI1NSwwLDI1NSwwLjUpXCI7XG4gICAgY3R4LmZpbGxSZWN0KHRoaXMuX2Fic3goZnQueCwgZnQudyksIHRoaXMuX2Fic3koZnQueSksIGZ0LncsIGZ0LmgpO1xuICAgIGN0eC5maWxsKCk7XG5cbiAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsMjU1LDI1NSwwLjUpXCI7XG4gICAgY3R4LmZpbGxSZWN0KHRoaXMuX2Fic3goZmgueCwgZmgudyksIHRoaXMuX2Fic3koZmgueSksIGZoLncsIGZoLmgpO1xuICAgIGN0eC5maWxsKCk7XG5cbiAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDI1NSwyNTUsMCwwLjUpXCI7XG4gICAgY3R4LmZpbGxSZWN0KHRoaXMuX2Fic3goZmhoLngsIGZoaC53KSwgdGhpcy5fYWJzeShmaGgueSksIGZoaC53LCBmaGguaCk7XG4gICAgY3R4LmZpbGwoKTtcbiAgICBjdHgucmVzdG9yZSgpXG4gIH0sXG5cbiAgbGFuZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLmxhbmRlZCA9IHRydWVcbiAgfSxcblxuICBzaGVldDogZnVuY3Rpb24obmFtZSkge1xuICAgIGlmKG5hbWUpIHtcbiAgICAgIHJldHVybiB0aGlzLl9zdXBlcihuYW1lICsgJy0nICsgdGhpcy5wLmkpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9zdXBlcigpXG4gICAgfVxuICB9LFxuXG4gIHBhdXNlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAucGF1c2VkID0gdHJ1ZVxuICB9LFxuXG4gIHVucGF1c2U6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC5wYXVzZWQgPSBmYWxzZVxuICAgIHRoaXMuc3RhbmQoKVxuICB9LFxuXG4gIGZ1am9nZXJpRm9yd2FyZDoganVtcChhdHRhY2soZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLnZ4ID0gMFxuICAgIHRoaXMuc2hlZXQoXCJmdWpvZ2VyaVwiKVxuICAgIHRoaXMucGxheSgnZnVqb2dlcmknLCAxKVxuICAgIHRoaXMub24oJ3N0ZXAnLCB0aGlzLCAnZnVqb2dlcmlGb3J3YXJkU3RlcCcpXG4gICAgdGhpcy5vbignc3RlcCcsIHRoaXMsICdmdWpvZ2VyaVN0ZXAnKVxuICB9KSksXG5cbiAgZnVqb2dlcmk6IGp1bXAoYXR0YWNrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC52eCA9IDBcbiAgICB0aGlzLnNoZWV0KFwiZnVqb2dlcmlcIilcbiAgICB0aGlzLnBsYXkoJ2Z1am9nZXJpJywgMSlcbiAgICB0aGlzLm9uKCdzdGVwJywgdGhpcywgJ2Z1am9nZXJpU3RlcCcpXG4gIH0pKSxcblxuICBmdWpvZ2VyaUZvcndhcmRTdGVwOiBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLnAuYW5pbWF0aW9uRnJhbWUgPiA0ICYmIHRoaXMucC5hbmltYXRpb25GcmFtZSA8IDcpIHtcbiAgICAgIHRoaXMucC52eCA9IHRoaXMucC5kaXIgKiB0aGlzLnNwZWVkXG4gICAgICB0aGlzLm9mZignc3RlcCcsIHRoaXMsICdmdWpvZ2VyaUZvcndhcmRTdGVwJylcbiAgICB9XG4gIH0sXG5cbiAgZnVqb2dlcmlTdGVwOiBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLnAuYW5pbWF0aW9uRnJhbWUgPj0gNSkge1xuICAgICAgdGhpcy5wLnZ5ID0gLXRoaXMuanVtcFNwZWVkXG4gICAgICB0aGlzLnAubGFuZGVkID0gZmFsc2VcbiAgICAgIHRoaXMucC5qdW1waW5nID0gdHJ1ZVxuICAgICAgdGhpcy5vZmYoJ3N0ZXAnLCB0aGlzLCAnZnVqb2dlcmlTdGVwJylcbiAgICB9XG4gIH0sXG5cbiAgaGFuZ2V0c3VhdGU6IGF0dGFjayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNoZWV0KFwiaGFuZ2V0c3VhdGVcIilcbiAgICB0aGlzLnBsYXkoJ2hhbmdldHN1YXRlJywgMSlcbiAgfSksXG5cbiAgc2VudGFpbm90c3VraTogYXR0YWNrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2hlZXQoXCJzZW50YWlub3RzdWtpXCIpXG4gICAgdGhpcy5wbGF5KCdzZW50YWlub3RzdWtpJywgMSlcbiAgfSksXG5cbiAgc2VudGFpbm90c3VraUVuZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLnggKz0gdGhpcy5wLmRpciAqIDE1XG4gIH0sXG5cbiAgbWFuamlnZXJpOiBhdHRhY2soZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zaGVldChcIm1hbmppZ2VyaVwiKVxuICAgIHRoaXMucGxheSgnbWFuamlnZXJpJywgMSlcbiAgfSksXG5cbiAgc3VpaGVpZ2VyaTogYXR0YWNrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2hlZXQoXCJzdWloZWlnZXJpXCIpXG4gICAgdGhpcy5wbGF5KCdzdWloZWlnZXJpJywgMSlcbiAgfSksXG5cbiAgc2Vuc29nZXJpOiBhdHRhY2soZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zaGVldChcInNlbnNvZ2VyaVwiKVxuICAgIHRoaXMucGxheSgnc2Vuc29nZXJpJywgMSlcbiAgfSksXG5cbiAgdXNoaXJvOiB3YWxrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2hlZXQoXCJ1c2hpcm9cIilcbiAgICB0aGlzLnBsYXkoJ3VzaGlybycsIDEpXG4gIH0pLFxuXG4gIHVzaGlyb0VuZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLnggKz0gdGhpcy5wLmRpciAqIDRcbiAgICB0aGlzLnAuZGlyZWN0aW9uID0gdGhpcy5wLmRpcmVjdGlvbiA9PT0gJ2xlZnQnID8gJ3JpZ2h0JyA6ICdsZWZ0J1xuICAgIHRoaXMucHJlc3RlcCgpXG4gIH0sXG5cbiAgbmlub2FzaGk6IHdhbGsoZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLnZ4ID0gdGhpcy5wLmRpciAqIHRoaXMuc3BlZWQvMjtcbiAgICB0aGlzLnNoZWV0KFwibmlub2FzaGlcIilcbiAgICB0aGlzLnBsYXkoJ25pbm9hc2hpJywgMSlcbiAgfSksXG5cbiAgdGFpc29rdTogd2FsayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAudnggPSAtdGhpcy5wLmRpciAqIHRoaXMuc3BlZWQ7XG4gICAgdGhpcy5zaGVldChcInRzdWlzb2t1XCIpXG4gICAgdGhpcy5wbGF5KCd0YWlzb2t1JywgMSlcbiAgfSksXG4gIFxuICB0c3Vpc29rdTogd2FsayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAudnggPSB0aGlzLnAuZGlyICogdGhpcy5zcGVlZDtcbiAgICB0aGlzLnNoZWV0KFwidHN1aXNva3VcIilcbiAgICB0aGlzLnBsYXkoJ3RzdWlzb2t1JywgMSlcbiAgfSksXG5cbiAga29zb2t1OiB3YWxrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC52eCA9IHRoaXMucC5kaXIgKiB0aGlzLnNwZWVkLzI7XG4gICAgdGhpcy5zaGVldChcImtvc29rdVwiKVxuICAgIHRoaXMucGxheSgna29zb2t1JywgMSlcbiAgfSksXG5cbiAgZ2Vuc29rdTogd2FsayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAudnggPSAtdGhpcy5wLmRpciAqIHRoaXMuc3BlZWQqMi8zO1xuICAgIHRoaXMuc2hlZXQoXCJrb3Nva3VcIilcbiAgICB0aGlzLnBsYXkoJ2tvc29rdScsIDEpXG4gIH0pLFxuXG4gIGhpdFN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgIGlmKCFjb2xsaXNpb25zW3RoaXMucC5hbmltYXRpb25dKSByZXR1cm47XG4gICAgdmFyIGhpdCA9IHRoaXMuaGl0VGVzdChjb2xsaXNpb25zW3RoaXMucC5hbmltYXRpb25dLmhpdFt0aGlzLnAuYW5pbWF0aW9uRnJhbWVdKVxuICAgIGlmKGhpdCkge1xuICAgICAgdmFyIHZhbHVlID0gdGhpcy5wLnRhcmdldC5oaXQodGhpcy5wLmRpciAqIHRoaXMuaGl0Rm9yY2VbdGhpcy5wLmFuaW1hdGlvbl0sIGhpdClcblxuICAgICAgdmFyIHByZXZNb3ZlbWVudCA9IHRoaXMucC5tb3ZlbWVudHNbdGhpcy5wLm1vdmVtZW50cy5sZW5ndGgtMV1cbiAgICAgIGlmKHByZXZNb3ZlbWVudCAmJiBwcmV2TW92ZW1lbnQuaW5kZXhPZignc29rdScpID4gLTEpIHtcbiAgICAgICAgdmFsdWUgKz0gMVxuICAgICAgfVxuXG4gICAgICB2YXIgc2NvcmUgPSBRLnN0YXRlLmdldChcInNjb3JlLVwiICsgdGhpcy5wLmkpIHx8IDBcbiAgICAgIFEuc3RhdGUuaW5jKFwidG90YWwtc2NvcmUtXCIgKyB0aGlzLnAuaSwgdmFsdWUqMTAwKVxuICAgICAgUS5zdGF0ZS5zZXQoXCJzY29yZS1cIiArIHRoaXMucC5pLCBNYXRoLm1pbigoc2NvcmUgKyB2YWx1ZSksIDQpKTtcbiAgICB9XG4gIH0sXG5cbiAgaGl0VGVzdDogZnVuY3Rpb24oY29sbCkge1xuICAgIGlmKCF0aGlzLnAudGFyZ2V0KSByZXR1cm4gZmFsc2VcbiAgICBpZih0aGlzLnAudGFyZ2V0LnAuaGl0KSByZXR1cm4gZmFsc2VcbiAgICB2YXIgdCA9IHRoaXMucC50YXJnZXQsXG4gICAgICAgIHRwID0gdGhpcy5wLnRhcmdldC5wLFxuICAgICAgICB0dCA9IGNvbGxpc2lvbnNbdHAuYW5pbWF0aW9uXS50b3Jzb1t0cC5hbmltYXRpb25GcmFtZV0sXG4gICAgICAgIHRoID0gY29sbGlzaW9uc1t0cC5hbmltYXRpb25dLmhlYWRbdHAuYW5pbWF0aW9uRnJhbWVdLFxuICAgICAgICBjciA9IHJlY3QodGhpcy5fYWJzeChjb2xsLngsIGNvbGwudyksIHRoaXMuX2Fic3koY29sbC55KSwgY29sbC53LCBjb2xsLmgpXG4gICAgXG4gICAgaWYoaW50ZXJzZWN0cyhyZWN0KHQuX2Fic3godHQueCwgdHQudyksIHQuX2Fic3kodHQueSksIHR0LncsIHR0LmgpLCBjcikpIHtcbiAgICAgIHJldHVybiAndG9yc28nXG4gICAgfVxuXG4gICAgaWYoaW50ZXJzZWN0cyhyZWN0KHQuX2Fic3godGgueCwgdGgudyksIHQuX2Fic3kodGgueSksIHRoLncsIHR0LmgpLCBjcikpIHtcbiAgICAgIHJldHVybiAnaGVhZCdcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2VcbiAgfSxcblxuICBoaXQ6IGZ1bmN0aW9uKGZvcmNlLCBoaXQpIHtcbiAgICB0aGlzLnN0YW5kKClcbiAgICB0aGlzLnAuaGl0ID0gdHJ1ZVxuICAgIGlmKGhpdCA9PT0gJ2hlYWQnICYmIE1hdGguYWJzKGZvcmNlKSA+IDM1ICYmIE1hdGgucmFuZG9tKCkgPiAuOCkge1xuICAgICAgdGhpcy5zaGVldChcImhlYWRvZmYtaGl0XCIpXG4gICAgICB0aGlzLnBsYXkoJ2hlYWRvZmZoaXQnLCAxKVxuICAgICAgdGhpcy5zdGFnZS5pbnNlcnQobmV3IFEuSGVhZCh0aGlzLCBmb3JjZSkpXG4gICAgICByZXR1cm4gNFxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnAudnggKz0gZm9yY2VcbiAgICAgIHRoaXMuc2hlZXQoXCJ0b3Jzby1oaXRcIilcbiAgICAgIHRoaXMucGxheSgndG9yc29oaXQnLCAxKVxuICAgICAgcmV0dXJuIDFcbiAgICB9XG4gIH0sXG5cbiAgZmluaXNoS2lja3M6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMub2ZmKCdzdGVwJywgdGhpcywgJ2hpdFN0ZXAnKVxuICAgIHRoaXMub2ZmKCdzdGVwJywgdGhpcywgJ2Z1am9nZXJpU3RlcCcpXG4gICAgdGhpcy5vZmYoJ3N0ZXAnLCB0aGlzLCAnZnVqb2dlcmlGb3J3YXJkU3RlcCcpXG4gICAgdGhpcy5vZmYoJ3N0ZXAnLCB0aGlzLCAnc2VudGFpbm90c3VraVN0ZXAnKVxuICAgIHRoaXMub2ZmKCdwcmVzdGVwJywgdGhpcywgJ2ZpbmlzaEtpY2tzJylcbiAgfSxcblxuICBzdGFuZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLmZyYW1lID0gMFxuICAgIHRoaXMucC52eCA9IDBcbiAgICB0aGlzLnBsYXkoJ3N0YW5kJywgMSwgdHJ1ZSlcbiAgICB0aGlzLnNoZWV0KFwidHN1aXNva3VcIilcbiAgICB0aGlzLnAuanVtcGluZyA9IGZhbHNlO1xuICAgIHRoaXMucC5hdHRhY2tpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnAud2Fsa2luZyA9IGZhbHNlO1xuICAgIHRoaXMucC5oaXQgPSBmYWxzZTtcbiAgICB0aGlzLnAudGFyZ2V0ID0gbnVsbDtcbiAgICB0aGlzLm9uKCdwcmVzdGVwJywgdGhpcywgJ2ZpbmlzaEtpY2tzJylcbiAgfSxcblxuICBwcmVzdGVwOiBmdW5jdGlvbih0KSB7XG4gICAgaWYodGhpcy5wLmRpcmVjdGlvbiA9PT0gJ2xlZnQnKSB7XG4gICAgICB0aGlzLnNldCh7ZmxpcDogJ3gnfSlcbiAgICAgIHRoaXMucC5kaXIgPSAtMVxuICAgICAgdGhpcy5wLm9wcG9zaXRlRGlyZWN0aW9uID0gJ3JpZ2h0J1xuICAgICAgdGhpcy5wLmN4ID0gMTJcbiAgICB9XG4gICAgaWYodGhpcy5wLmRpcmVjdGlvbiA9PT0gJ3JpZ2h0Jykge1xuICAgICAgdGhpcy5zZXQoe2ZsaXA6ICcnfSlcbiAgICAgIHRoaXMucC5kaXIgPSAxXG4gICAgICB0aGlzLnAub3Bwb3NpdGVEaXJlY3Rpb24gPSAnbGVmdCdcbiAgICAgIHRoaXMucC5jeCA9IDEwXG4gICAgfVxuICB9XG5cbn0pO1xuIiwidmFyIFEgPSByZXF1aXJlKCcuL1EnKVxuXG5RLkdhbWVPYmplY3QuZXh0ZW5kKFwiSHVkXCIse1xuXG4gIGluaXQ6IF8ub25jZShmdW5jdGlvbigpIHtcblxuICAgIHRoaXMuZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHRoaXMuZWwuY2xhc3NOYW1lID0gJ2h1ZCdcbiAgICB0aGlzLmVsLmlubmVySFRNTCA9IFxuICAgICAgJzxkaXYgY2xhc3M9XCJodWQtYVwiPjxzcGFuIGNsYXNzPVwic2NvcmUgc2NvcmUtYSBzY29yZS0wXCI+PC9zcGFuPjxzcGFuIGNsYXNzPVwic2NvcmUtdmFsdWVcIj48L3NwYW4+PC9kaXY+JyArXG4gICAgICAnPGRpdiBjbGFzcz1cImh1ZC1iXCI+PHNwYW4gY2xhc3M9XCJzY29yZSBzY29yZS1iIHNjb3JlLTBcIj48L3NwYW4+PHNwYW4gY2xhc3M9XCJzY29yZS12YWx1ZVwiPjwvc3Bhbj48L2Rpdj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwiaHVkLWNcIj48c3BhbiBjbGFzcz1cInNjb3JlIHNjb3JlLWMgc2NvcmUtMFwiPjwvc3Bhbj48c3BhbiBjbGFzcz1cInNjb3JlLXZhbHVlXCI+PC9zcGFuPjwvZGl2PidcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuZWwpXG5cbiAgICB0aGlzLnNjb3JlQSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zY29yZS1hJylcbiAgICB0aGlzLnNjb3JlQiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zY29yZS1iJylcbiAgICB0aGlzLnNjb3JlQyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zY29yZS1jJylcblxuICAgIHRoaXMucmVzZXQoKVxuICB9KSxcblxuICByZWZyZXNoOiBmdW5jdGlvbigpIHtcbiAgICBbJ2EnLCAnYicsICdjJ10uZm9yRWFjaChfLmJpbmQoZnVuY3Rpb24oaSkge1xuICAgICAgdmFyIHNjb3JlRWwgPSB0aGlzWydzY29yZScgKyBpLnRvVXBwZXJDYXNlKCldLFxuICAgICAgICAgIHNjb3JlVmFsdWVFbCA9IHNjb3JlRWwucGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yKCcuc2NvcmUtdmFsdWUnKSxcbiAgICAgICAgICBzY29yZSA9IFEuc3RhdGUuZ2V0KCdzY29yZS0nICsgaSkgfHwgMFxuICAgICAgc2NvcmVFbC5jbGFzc05hbWUgPSBzY29yZUVsLmNsYXNzTmFtZS5yZXBsYWNlKC9zY29yZS1cXGQvZywgJycpXG4gICAgICBzY29yZUVsLmNsYXNzTGlzdC5hZGQoJ3Njb3JlLScgKyBzY29yZSlcbiAgICAgIHNjb3JlVmFsdWVFbC5pbm5lckhUTUwgPSBRLnN0YXRlLmdldCgndG90YWwtc2NvcmUtJyArIGkpXG4gICAgfSwgdGhpcykpXG4gIH0sXG5cbiAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xuICAgIFEuc3RhdGUuc2V0KHsgXG4gICAgICAnc2NvcmUtYSc6IDAsICdzY29yZS1iJzogMCwgJ3Njb3JlLWMnOiAwICxcbiAgICAgICd0b3RhbC1zY29yZS1hJzogMCwgJ3RvdGFsLXNjb3JlLWInOiAwLCAndG90YWwtc2NvcmUtYyc6IDAgXG4gICAgfSk7XG4gICAgUS5zdGF0ZS5vbihcImNoYW5nZVwiLCB0aGlzLCAncmVmcmVzaCcpXG4gICAgdGhpcy5yZWZyZXNoKClcbiAgfVxufSlcbiIsInZhciBRID0gcmVxdWlyZSgnLi9RJylcblxuUS5hbmltYXRpb25zKCdqdWRnZScsIHtcbiAgc3RhbmQ6IHsgZnJhbWVzOiBbMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwxM10sIGxvb3A6IHRydWUsIHJhdGU6IDEvMTAgfSxcbiAgd2FsazogeyBmcmFtZXM6IF8ucmFuZ2UoMTEpLCBsb29wOiB0cnVlLCByYXRlOiAxLzIwIH0sXG4gIHRhbGs6IHsgZnJhbWVzOiBbMTAsMTEsMTIsMTFdLCBsb29wOiB0cnVlLCByYXRlOiAxLzEwICB9XG59KVxuXG5RLk1vdmluZ1Nwcml0ZS5leHRlbmQoXCJKdWRnZVwiLCB7XG4gIFxuICBpbml0OiBmdW5jdGlvbihwKSB7XG4gICAgdGhpcy5fc3VwZXIocCwgeyBcbiAgICAgIHNwcml0ZTogXCJqdWRnZVwiLFxuICAgICAgc2hlZXQ6IFwianVkZ2VcIixcbiAgICAgIHNlbnNvcjogdHJ1ZSxcbiAgICAgIGN4OiAxNCxcbiAgICAgIHNjYWxlOiAuOFxuICAgIH0pO1xuICAgIHRoaXMuYWRkKCcyZCwgYW5pbWF0aW9uJyk7XG4gICAgdGhpcy5zdGFuZCgpXG5cbiAgICB0aGlzLm9uKCdzYXlOZXh0JywgdGhpcywgJ3NheU5leHQnKVxuICAgIFxuICAgIHRoaXMudGV4dEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLnRleHRFbC5jbGFzc05hbWUgPSAnanVkZ2VtZW50J1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy50ZXh0RWwpXG5cbiAgICBRLnN0YXRlLm9uKFwiY2hhbmdlXCIsIHRoaXMsICdqdWRnZScpXG4gIH0sXG5cbiAgZW50ZXI6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC52eCA9IDMwXG4gICAgdGhpcy5wLmZsaXAgPSBcIlwiXG4gICAgdGhpcy5wbGF5KCd3YWxrJywgMSlcbiAgICB0aGlzLm9uKCdzdGVwJywgdGhpcywgJ2VudGVyRW5kJylcbiAgfSxcblxuICBlbnRlckVuZDogZnVuY3Rpb24oKSB7XG4gICAgaWYodGhpcy5wLnggPiAxMDApIHtcbiAgICAgIHRoaXMucC52eCA9IDBcbiAgICAgIHRoaXMub2ZmKCdzdGVwJywgdGhpcywgJ2VudGVyRW5kJylcbiAgICAgIHRoaXMudHJpZ2dlcignZW50ZXJFbmQnKVxuICAgIH1cbiAgfSxcblxuICBleGl0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAudnggPSAtMzBcbiAgICB0aGlzLnAuZmxpcCA9IFwieFwiXG4gICAgdGhpcy5wbGF5KCd3YWxrJywgMSlcbiAgICB0aGlzLm9uKCdzdGVwJywgdGhpcywgJ2V4aXRFbmQnKVxuICB9LFxuXG4gIGV4aXRFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMucC54IDwgMTUpIHtcbiAgICAgIHRoaXMucC52eCA9IDBcbiAgICAgIHRoaXMub2ZmKCdzdGVwJywgdGhpcywgJ2V4aXRFbmQnKVxuICAgICAgdGhpcy50cmlnZ2VyKCdleGl0RW5kJylcbiAgICAgIHRoaXMuc3RhbmQoKVxuICAgIH1cbiAgfSxcblxuICBzdGFuZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLmZsaXAgPSBcIlwiXG4gICAgdGhpcy5wbGF5KCdzdGFuZCcsIDEpXG4gICAgdGhpcy5vZmYoJ2VudGVyRW5kJywgdGhpcywgJ3RhbGsnKVxuICAgIHRoaXMub2ZmKCd0YWxrRW5kJywgdGhpcywgJ2V4aXQnKVxuICAgIHRoaXMub2ZmKCdleGl0RW5kJywgdGhpcywgJ3N0YW5kJylcbiAgICB0aGlzLnRyaWdnZXIoJ3N0YW5kJylcbiAgfSxcblxuICBzYXlOZXh0OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGV4dCA9IFwiXCI7XG4gICAgaWYodGhpcy5wLnNhaWQgPT09IDApIHsgdGV4dCA9IFwiVGhlIHdpbm5lciBpcyB7Y29sb3J9LlwiIH1cbiAgICBpZih0aGlzLnAuc2FpZCA9PT0gMSkgeyB0ZXh0ID0gXCJ7Y29sb3J9IGlzIHNlY29uZC5cIiB9XG4gICAgaWYodGhpcy5wLnNhaWQgPT09IDIpIHtcbiAgICAgIHRleHQgPSBfLnNhbXBsZShbXG4gICAgICAgIFsne2NvbG9yfSwgeW91IGJpdGNoLicsICd7Y29sb3J9Li4uIHJlYWxseT8nLCAnanVzdC4uLiBqdXN0IGRvblxcJ3QsIHtjb2xvcn0uJ10sXG4gICAgICAgIFsne2NvbG9yfSwgeW91IGNhbiBzdG9wIG5vdy4nLCAne2NvbG9yfSwgeW91IGNhbiBkbyBiZXR0ZXIuJywgJ0NcXCdtb24ge2NvbG9yfSddLFxuICAgICAgICBbJ3tjb2xvcn0sIGFsbW9zdCB0aGVyZS4nLCAnbWF5YmUgbmV4dCB0aW1lIHRyeSB0byBkbyBiZXR0ZXIge2NvbG9yfS4nXSxcbiAgICAgICAgWydUb3VnaCBsdWNrIHtjb2xvcn0uJ11cbiAgICAgIF1bdGhpcy5wLnJlc3VsdFt0aGlzLnAuc2FpZF0uc2NvcmVdKVxuICAgIH1cbiAgICB0aGlzLnRleHRFbC5pbm5lckhUTUwgPSB0ZXh0LnJlcGxhY2UoJ3tjb2xvcn0nLCB0aGlzLnAucmVzdWx0W3RoaXMucC5zYWlkXSA/IHRoaXMucC5yZXN1bHRbdGhpcy5wLnNhaWRdLmNvbG9yIDogXCJcIilcbiAgICB0aGlzLnAuc2FpZCArPSAxXG4gICAgaWYodGhpcy5wLnNhaWQgPiAzKSB7XG4gICAgICB0aGlzLmV4aXQoKVxuICAgICAgdGhpcy50cmlnZ2VyKCd0YWxrRW5kJylcbiAgICB9IGVsc2Uge1xuICAgICAgXy5kZWxheShfLmJpbmQodGhpcy50cmlnZ2VyLCB0aGlzLCAnc2F5TmV4dCcpLCAzMDAwKVxuICAgIH1cbiAgfSxcblxuICB0YWxrOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnBsYXkoJ3RhbGsnLCAxKVxuICAgIHRoaXMucC5zYWlkID0gMFxuICAgIHRoaXMuc2F5TmV4dCgpXG4gIH0sXG5cbiAganVkZ2U6IGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMucC5hbmltYXRpb24gIT0gJ3N0YW5kJykgcmV0dXJuO1xuICAgIHRoaXMucC5yZXN1bHQgPSBfLnNvcnRCeShbXG4gICAgICB7aTogJ2EnLCBzY29yZTogUS5zdGF0ZS5nZXQoJ3Njb3JlLWEnKSwgY29sb3I6ICdvcmFuZ2UnfSxcbiAgICAgIHtpOiAnYicsIHNjb3JlOiBRLnN0YXRlLmdldCgnc2NvcmUtYicpLCBjb2xvcjogJ2JsdWUnfSxcbiAgICAgIHtpOiAnYycsIHNjb3JlOiBRLnN0YXRlLmdldCgnc2NvcmUtYycpLCBjb2xvcjogJ2dyZWVuJ31cbiAgICBdLCAnc2NvcmUnKS5yZXZlcnNlKClcbiAgICBpZih0aGlzLnAucmVzdWx0WzBdLnNjb3JlID09PSA0KSB7XG4gICAgICB0aGlzLmVudGVyKClcbiAgICAgIHRoaXMub24oJ2VudGVyRW5kJywgdGhpcywgJ3RhbGsnKVxuICAgICAgdGhpcy5vbigndGFsa0VuZCcsIHRoaXMsICdleGl0JylcbiAgICAgIHRoaXMub24oJ2V4aXRFbmQnLCB0aGlzLCAnc3RhbmQnKVxuICAgIH1cbiAgfVxuXG59KVxuIiwidmFyIFEgPSByZXF1aXJlKCcuL1EnKSxcbiAgICBHZXJpTW9uID0gcmVxdWlyZSgnLi9HZXJpTW9uJylcblxuUS5HZXJpTW9uLmV4dGVuZChcIlBsYXllclwiLHtcbiAgaW5pdDogZnVuY3Rpb24ocCkge1xuICAgIHRoaXMuX3N1cGVyKHAsIHt9KTtcblxuICAgIHRoaXMucC5kaXJlY3Rpb24gPSAncmlnaHQnXG4gICAgXG4gICAgLy8gUS5pbnB1dC5vbihcImZpcmVcIiwgdGhpcywgJ2ZpcmUnKTtcbiAgICB0aGlzLm9uKFwicHJlc3RlcFwiLCB0aGlzLCAnYXR0YWNrJyk7XG4gICAgdGhpcy5vbihcInByZXN0ZXBcIiwgdGhpcywgJ3Vuc29rdScpO1xuICB9LFxuXG4gIGF0dGFjazogZnVuY3Rpb24oKSB7XG4gICAgaWYodGhpcy5wLnBhdXNlZCkgcmV0dXJuO1xuICAgIFxuICAgIGlmKCFRLmlucHV0cy5maXJlKSByZXR1cm5cblxuICAgIHZhciB0YXJnZXQsIHREaXN0ID0gSW5maW5pdHksIGRpc3Q7XG4gICAgZm9yKHZhciBpPTA7IGk8dGhpcy5pbnN0YW5jZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmKHRoaXMuaW5zdGFuY2VzW2ldICE9IHRoaXMpIHtcbiAgICAgICAgZGlzdCA9IE1hdGguYWJzKHRoaXMucC54IC0gdGhpcy5pbnN0YW5jZXNbaV0ucC54KVxuICAgICAgICBpZihkaXN0IDwgdERpc3QpIHtcbiAgICAgICAgICB0YXJnZXQgPSB0aGlzLmluc3RhbmNlc1tpXVxuICAgICAgICAgIHREaXN0ID0gZGlzdFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKFEuaW5wdXRzLnVwICYmIFEuaW5wdXRzW3RoaXMucC5kaXJlY3Rpb25dKSB7XG4gICAgICB0aGlzLmZ1am9nZXJpRm9yd2FyZCh0YXJnZXQpXG4gICAgfVxuXG4gICAgaWYgKFEuaW5wdXRzLnVwKSB7XG4gICAgICB0aGlzLmZ1am9nZXJpKHRhcmdldClcbiAgICB9XG5cbiAgICBpZiAoUS5pbnB1dHMuZG93biAmJiBRLmlucHV0c1t0aGlzLnAub3Bwb3NpdGVEaXJlY3Rpb25dKSB7XG4gICAgICB0aGlzLmhhbmdldHN1YXRlKHRhcmdldClcbiAgICB9XG5cbiAgICBpZiAoUS5pbnB1dHMuZG93biAmJiBRLmlucHV0c1t0aGlzLnAuZGlyZWN0aW9uXSkge1xuICAgICAgdGhpcy5zZW50YWlub3RzdWtpKHRhcmdldClcbiAgICB9XG5cbiAgICBpZiAoUS5pbnB1dHMuZG93bikge1xuICAgICAgdGhpcy5tYW5qaWdlcmkodGFyZ2V0KVxuICAgIH1cblxuICAgIGlmIChRLmlucHV0c1t0aGlzLnAuZGlyZWN0aW9uXSkge1xuICAgICAgdGhpcy5zdWloZWlnZXJpKHRhcmdldClcbiAgICB9XG5cbiAgICBpZiAoUS5pbnB1dHNbdGhpcy5wLm9wcG9zaXRlRGlyZWN0aW9uXSkge1xuICAgICAgdGhpcy5zZW5zb2dlcmkodGFyZ2V0KVxuICAgIH1cblxuICB9LFxuXG4gIHVuc29rdTogZnVuY3Rpb24oKSB7XG4gICAgaWYodGhpcy5wLnBhdXNlZCkgcmV0dXJuO1xuXG4gICAgaWYoUS5pbnB1dHMuZmlyZSkgcmV0dXJuXG5cbiAgICBpZihRLmlucHV0cy5hY3Rpb24pIHtcbiAgICBcbiAgICAgIHRoaXMudXNoaXJvKClcbiAgICBcbiAgICB9IGVsc2Uge1xuXG4gICAgICBpZihRLmlucHV0cy51cCkge1xuICAgICAgICB0aGlzLmtvc29rdSgpXG4gICAgICB9XG5cbiAgICAgIGlmKFEuaW5wdXRzLmRvd24pIHtcbiAgICAgICAgdGhpcy5nZW5zb2t1KCkgXG4gICAgICB9XG5cbiAgICAgIC8vZm9yd2FyZFxuICAgICAgaWYoUS5pbnB1dHNbdGhpcy5wLmRpcmVjdGlvbl0pIHtcbiAgICAgICAgdGhpcy5uaW5vYXNoaSgpIFxuICAgICAgICBpZih0aGlzLnAuYW5pbWF0aW9uID09PSAnbmlub2FzaGknICYmIHRoaXMucC5hbmltYXRpb25GcmFtZSA+IDEpIHtcbiAgICAgICAgICB0aGlzLnN0YW5kKClcbiAgICAgICAgICB0aGlzLnRzdWlzb2t1KClcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy9iYWNrd2FyZFxuICAgICAgaWYoUS5pbnB1dHNbdGhpcy5wLmRpcmVjdGlvbiA9PT0gJ2xlZnQnID8gJ3JpZ2h0JyA6ICdsZWZ0J10pIHtcbiAgICAgICAgdGhpcy50YWlzb2t1KClcbiAgICAgIH1cblxuICAgIH1cblxuICAgIFxuICB9XG5cbn0pO1xuIiwiXG52YXIgUSA9IFF1aW50dXMoKVxuICAuaW5jbHVkZShcIlNwcml0ZXMsIFNjZW5lcywgSW5wdXQsIDJELCBUb3VjaCwgVUksIEFuaW1cIilcbiAgLnNldHVwKHsgbWF4aW1pemU6IHRydWUgfSlcbiAgLmNvbnRyb2xzKClcbiAgLnRvdWNoKCk7XG5cblEuRXZlbnRlZC5wcm90b3R5cGUuX3RyaWdnZXIgPSBRLkV2ZW50ZWQucHJvdG90eXBlLnRyaWdnZXJcblEuRXZlbnRlZC5wcm90b3R5cGUudHJpZ2dlciAgPSBmdW5jdGlvbihldmVudCxkYXRhKSB7XG4gIC8vIEZpcnN0IG1ha2Ugc3VyZSB0aGVyZSBhcmUgYW55IGxpc3RlbmVycywgdGhlbiBjaGVjayBmb3IgYW55IGxpc3RlbmVyc1xuICAvLyBvbiB0aGlzIHNwZWNpZmljIGV2ZW50LCBpZiBub3QsIGVhcmx5IG91dC5cbiAgaWYodGhpcy5saXN0ZW5lcnMgJiYgdGhpcy5saXN0ZW5lcnNbZXZlbnRdKSB7XG4gICAgLy8gQ2FsbCBlYWNoIGxpc3RlbmVyIGluIHRoZSBjb250ZXh0IG9mIGVpdGhlciB0aGUgdGFyZ2V0IHBhc3NlZCBpbnRvXG4gICAgLy8gYG9uYCBvciB0aGUgb2JqZWN0IGl0c2VsZi5cbiAgICB2YXIgaSwgbCA9IG5ldyBBcnJheSh0aGlzLmxpc3RlbmVyc1tldmVudF0ubGVuZ3RoKSwgbGVuXG4gICAgZm9yKGk9MCxsZW4gPSB0aGlzLmxpc3RlbmVyc1tldmVudF0ubGVuZ3RoO2k8bGVuO2krKykge1xuICAgICAgbFtpXSA9IFtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnNbZXZlbnRdW2ldWzBdLCBcbiAgICAgICAgdGhpcy5saXN0ZW5lcnNbZXZlbnRdW2ldWzFdXG4gICAgICBdXG4gICAgfVxuICAgIGZvcihpPTAsbGVuID0gbC5sZW5ndGg7aTxsZW47aSsrKSB7XG4gICAgICB2YXIgbGlzdGVuZXIgPSBsW2ldO1xuICAgICAgbGlzdGVuZXJbMV0uY2FsbChsaXN0ZW5lclswXSxkYXRhKTtcbiAgICB9XG4gIH1cbn1cblxuY29uc29sZS5sb2coUSlcblxubW9kdWxlLmV4cG9ydHMgPSBRXG4iLCJ2YXIgUSA9IHJlcXVpcmUoJy4vUScpXG5cblxuXG5mdW5jdGlvbiBjb2xsaXNpb25zKG5hbWUsIGFzc2V0LCBzaXplKSB7XG4gIGlmKCFRLmFzc2V0KGFzc2V0KSkgeyB0aHJvdyBcIkludmFsaWQgQXNzZXQ6XCIgKyBhc3NldDsgfVxuICBcbiAgZXhwb3J0cy5jb2xsaXNpb25zW25hbWVdID0geyBoZWFkOiBbXSwgdG9yc286IFtdLCBoaXQ6IFtdIH1cblxuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyksXG4gICAgICBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyksXG4gICAgICBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKSxcbiAgICAgIGltZ0RhdGEsXG4gICAgICBoZWFkID0gMTUwLFxuICAgICAgdG9yc28gPSAyMDAsXG4gICAgICBoaXQgPSAxMDBcbiAgXG4gIGltZy5zcmMgPSBhc3NldDtcbiAgY2FudmFzLndpZHRoID0gaW1nLndpZHRoXG4gIGNhbnZhcy5oZWlnaHQgPSBpbWcuaGVpZ2h0XG4gIGNvbnRleHQuZHJhd0ltYWdlKGltZywgMCwgMCk7XG4gIFxuICBmdW5jdGlvbiBmaW5kKGltZ0RhdGEsIHJjb2xvcikge1xuICAgIHZhciBhID0gQXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbChpbWdEYXRhLmRhdGEsIHJjb2xvcikgLyA0LFxuICAgICAgICBiID0gQXJyYXkucHJvdG90eXBlLmxhc3RJbmRleE9mLmNhbGwoaW1nRGF0YS5kYXRhLCByY29sb3IpIC8gNCxcbiAgICAgICAgYyA9IHt9XG4gICAgaWYoYSA8IC0xKSByZXR1cm4gY1xuICAgIGMueCA9IGEgJSBzaXplLnRpbGV3XG4gICAgYy55ID0gTWF0aC5mbG9vcihhIC8gc2l6ZS50aWxldylcbiAgICBjLncgPSBiICUgc2l6ZS50aWxldyAtIGMueFxuICAgIGMuaCA9IE1hdGguZmxvb3IoYiAvIHNpemUudGlsZXcpIC0gYy55XG4gICAgcmV0dXJuIGNcbiAgfVxuXG4gIGZvcih2YXIgeCA9IDA7IHggPCBpbWcud2lkdGg7IHgrPXNpemUudGlsZXcpIHtcbiAgICBpbWdEYXRhID0gY29udGV4dC5nZXRJbWFnZURhdGEoeCwgMCwgc2l6ZS50aWxldywgc2l6ZS50aWxlaCk7XG4gICAgZXhwb3J0cy5jb2xsaXNpb25zW25hbWVdLmhlYWQucHVzaChmaW5kKGltZ0RhdGEsIGhlYWQpKVxuICAgIGV4cG9ydHMuY29sbGlzaW9uc1tuYW1lXS50b3Jzby5wdXNoKGZpbmQoaW1nRGF0YSwgdG9yc28pKVxuICAgIGV4cG9ydHMuY29sbGlzaW9uc1tuYW1lXS5oaXQucHVzaChmaW5kKGltZ0RhdGEsIGhpdCkpXG4gIH1cbn1cbmV4cG9ydHMuY29sbGlzaW9ucyA9IHt9XG5cblxuXG5cbmZ1bmN0aW9uIGNvbG9yaXplKGFzc2V0LCBjb2xvcikge1xuICBpZighUS5hc3NldChhc3NldCkpIHsgdGhyb3cgXCJJbnZhbGlkIEFzc2V0OlwiICsgYXNzZXQ7IH1cblxuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyksXG4gICAgICBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyksXG4gICAgICBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKSxcbiAgICAgIGltZ0RhdGEsXG4gICAgICBjb2xEYXRhLFxuICAgICAgY29sSW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbiAgXG4gIGltZy5zcmMgPSBhc3NldDtcbiAgY2FudmFzLndpZHRoID0gaW1nLndpZHRoXG4gIGNhbnZhcy5oZWlnaHQgPSBpbWcuaGVpZ2h0XG4gIGNvbnRleHQuZHJhd0ltYWdlKGltZywgMCwgMCk7XG4gIGltZ0RhdGEgPSBjb250ZXh0LmdldEltYWdlRGF0YSgwLCAwLCBpbWcud2lkdGgsIGltZy5oZWlnaHQpXG4gIGNvbERhdGEgPSBjb250ZXh0LmNyZWF0ZUltYWdlRGF0YShpbWcud2lkdGgsIGltZy5oZWlnaHQpXG5cbiAgZnVuY3Rpb24gc2V0Q29sb3IoYywgZCwgaSkgeyBkW2krMF0gPSBjWzBdOyBkW2krMV0gPSBjWzFdOyBkW2krMl0gPSBjWzJdOyBkW2krM10gPSBjWzNdIH1cbiAgZnVuY3Rpb24gZ2V0Q29sb3IoZCwgaSkgeyByZXR1cm4gW2RbaSswXSwgZFtpKzFdLCBkW2krMl0sIGRbaSszXV0gfVxuICBmdW5jdGlvbiBwcmV2Q29sb3IoZCwgaSkgeyByZXR1cm4gW2RbaS00XSwgZFtpLTNdLCBkW2ktMl0sIGRbaS0xXV0gfVxuICBmdW5jdGlvbiBuZXh0Q29sb3IoZCwgaSkgeyByZXR1cm4gW2RbaSs0XSwgZFtpKzVdLCBkW2krNl0sIGRbaSs3XV0gfVxuICBmdW5jdGlvbiB0cmFuc3BhcmVudChjKSB7IHJldHVybiBjWzBdID09PSAwICYmIGNbMV0gPT09IDAgJiYgY1syXSA9PT0gMCAmJiBjWzNdID09PSAwIH1cbiAgZnVuY3Rpb24gZGFyazEoYykgeyByZXR1cm4gW2NbMF0gLSAgNSwgY1sxXSAtICA1LCBjWzJdIC0gIDUsIGNbM11dIH1cbiAgZnVuY3Rpb24gZGFyazIoYykgeyByZXR1cm4gW2NbMF0gLSAxMCwgY1sxXSAtIDEwLCBjWzJdIC0gMTAsIGNbM11dIH1cbiAgZnVuY3Rpb24gZGFyazMoYykgeyByZXR1cm4gW2NbMF0gLSA4MCwgY1sxXSAtIDgwLCBjWzJdIC0gODAsIGNbM11dIH1cbiAgZnVuY3Rpb24gbGlnaHRlbihjKSB7IHJldHVybiBbY1swXSArIDMwLCBjWzFdICsgMzAsIGNbMl0gKyAzMCwgY1szXV0gfVxuICBcbiAgZm9yICh2YXIgaT0wLCBjOyBpPGltZ0RhdGEuZGF0YS5sZW5ndGg7IGkrPTQpIHtcbiAgICBjID0gZ2V0Q29sb3IoaW1nRGF0YS5kYXRhLCBpKVxuICAgIHNldENvbG9yKGxpZ2h0ZW4oYyksIGNvbERhdGEuZGF0YSwgaSlcbiAgICBpZiAoIXRyYW5zcGFyZW50KGMpKSB7XG4gICAgICBpZiAodHJhbnNwYXJlbnQocHJldkNvbG9yKGltZ0RhdGEuZGF0YSwgaS0xKSkpIHtcbiAgICAgICAgc2V0Q29sb3IoZGFyazEoYyksIGNvbERhdGEuZGF0YSwgaSlcbiAgICAgIH1cbiAgICAgIGlmICh0cmFuc3BhcmVudChwcmV2Q29sb3IoaW1nRGF0YS5kYXRhLCBpKSkpIHtcbiAgICAgICAgc2V0Q29sb3IoZGFyazIoYyksIGNvbERhdGEuZGF0YSwgaSlcbiAgICAgIH1cbiAgICAgIGlmICh0cmFuc3BhcmVudChuZXh0Q29sb3IoaW1nRGF0YS5kYXRhLCBpKSkpIHtcbiAgICAgICAgc2V0Q29sb3IoZGFyazMoY29sb3IpLCBjb2xEYXRhLmRhdGEsIGkpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29udGV4dC5wdXRJbWFnZURhdGEoY29sRGF0YSwgMCwgMCk7XG4gIGNvbEltZy5zcmMgPSBjYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpO1xuICByZXR1cm4gY29sSW1nXG59XG5cblxuZXhwb3J0cy5sb2FkID0gZnVuY3Rpb24oY2IpIHtcblxuICB2YXIgcGxheWVyQXNzZXRzID0gW1xuICAgIFwic3VpaGVpZ2VyaVwiLFxuICAgIFwibWFuamlnZXJpXCIsXG4gICAgXCJ0c3Vpc29rdVwiLFxuICAgIFwidXNoaXJvXCIsXG4gICAgXCJrb3Nva3VcIixcbiAgICBcIm5pbm9hc2hpXCIsXG4gICAgXCJmdWpvZ2VyaVwiLFxuICAgIFwic2Vuc29nZXJpXCIsXG4gICAgXCJzZW50YWlub3RzdWtpXCIsXG4gICAgXCJoYW5nZXRzdWF0ZVwiLFxuICAgIFwidG9yc28taGl0XCIsXG4gICAgXCJoZWFkb2ZmLWhpdFwiXVxuXG4gIFEubG9hZChcbiAgICBfLmZsYXR0ZW4oW1xuICAgIFxuICAgICAgW1wiL2Fzc2V0cy9iZy0xLnBuZ1wiLFxuICAgICAgXCIvYXNzZXRzL3RpbGVzLnBuZ1wiLFxuICAgICAgXCIvYXNzZXRzL2p1ZGdlLnBuZ1wiXSxcblxuICAgICAgXy5tYXAocGxheWVyQXNzZXRzLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHJldHVybiBcIi9hc3NldHMvXCIgKyBuYW1lICsgXCIucG5nXCJcbiAgICAgIH0pLFxuXG4gICAgICBfLm1hcChfLndpdGhvdXQocGxheWVyQXNzZXRzLCBcInRvcnNvLWhpdFwiLCBcImhlYWRvZmYtaGl0XCIpLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHJldHVybiBcIi9hc3NldHMvXCIgKyBuYW1lICsgXCItY29sbGlzaW9ucy5wbmdcIlxuICAgICAgfSlcblxuICAgIF0pLCBmdW5jdGlvbigpIHtcblxuICAgIHZhciBwbGF5ZXJUaWxlID0geyB0aWxldzogNDgsIHRpbGVoOiAzMiB9XG4gICAgUS5zaGVldChcInRpbGVzXCIsXCIvYXNzZXRzL3RpbGVzLnBuZ1wiLCB7IHRpbGV3OiAzMiwgdGlsZWg6IDggfSk7XG4gICAgUS5zaGVldChcImp1ZGdlXCIsIFwiL2Fzc2V0cy9qdWRnZS5wbmdcIiwge3RpbGV3OiAzMiwgdGlsZWg6IDMyfSk7XG5cbiAgICBfLmVhY2gocGxheWVyQXNzZXRzLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICBRLmFzc2V0c1tcIi9hc3NldHMvXCIgKyBuYW1lICsgXCItYS5wbmdcIl0gPSBjb2xvcml6ZShcIi9hc3NldHMvXCIgKyBuYW1lICsgXCIucG5nXCIsIFsyNDAsIDEyMSwgMCwgMjU1XSk7XG4gICAgICBRLmFzc2V0c1tcIi9hc3NldHMvXCIgKyBuYW1lICsgXCItYi5wbmdcIl0gPSBjb2xvcml6ZShcIi9hc3NldHMvXCIgKyBuYW1lICsgXCIucG5nXCIsIFsxMDIsIDE1MywgMjU1LCAyNTVdKTtcbiAgICAgIFEuYXNzZXRzW1wiL2Fzc2V0cy9cIiArIG5hbWUgKyBcIi1jLnBuZ1wiXSA9IGNvbG9yaXplKFwiL2Fzc2V0cy9cIiArIG5hbWUgKyBcIi5wbmdcIiwgWzY4LCAyMjEsIDg1LCAyNTVdKTtcbiAgICAgIFEuc2hlZXQobmFtZSArICctYScsIFwiL2Fzc2V0cy9cIiArIG5hbWUgKyBcIi1hLnBuZ1wiLCBwbGF5ZXJUaWxlKTtcbiAgICAgIFEuc2hlZXQobmFtZSArICctYicsIFwiL2Fzc2V0cy9cIiArIG5hbWUgKyBcIi1iLnBuZ1wiLCBwbGF5ZXJUaWxlKTtcbiAgICAgIFEuc2hlZXQobmFtZSArICctYycsIFwiL2Fzc2V0cy9cIiArIG5hbWUgKyBcIi1jLnBuZ1wiLCBwbGF5ZXJUaWxlKTtcbiAgICB9KVxuXG4gICAgXy5lYWNoKF8ud2l0aG91dChwbGF5ZXJBc3NldHMsIFwidG9yc28taGl0XCIsIFwiaGVhZG9mZi1oaXRcIiksIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIGNvbGxpc2lvbnMobmFtZSwgXCIvYXNzZXRzL1wiICsgbmFtZSArIFwiLWNvbGxpc2lvbnMucG5nXCIsIHBsYXllclRpbGUpXG4gICAgfSlcblxuICAgIGV4cG9ydHMuY29sbGlzaW9ucy5zdGFuZCA9IHtcbiAgICAgIGhlYWQ6IFtleHBvcnRzLmNvbGxpc2lvbnMudHN1aXNva3UuaGVhZFswXV0sXG4gICAgICB0b3JzbzogW2V4cG9ydHMuY29sbGlzaW9ucy50c3Vpc29rdS50b3Jzb1swXV0sXG4gICAgICBoaXQ6IFtleHBvcnRzLmNvbGxpc2lvbnMudHN1aXNva3UuaGl0WzBdXVxuICAgIH1cbiAgICBleHBvcnRzLmNvbGxpc2lvbnMudGFpc29rdSA9IHtcbiAgICAgIGhlYWQ6IFtdLmNvbmNhdChleHBvcnRzLmNvbGxpc2lvbnMudHN1aXNva3UuaGVhZCkucmV2ZXJzZSgpLFxuICAgICAgdG9yc286IFtdLmNvbmNhdChleHBvcnRzLmNvbGxpc2lvbnMudHN1aXNva3UudG9yc28pLnJldmVyc2UoKSxcbiAgICAgIGhpdDogW10uY29uY2F0KGV4cG9ydHMuY29sbGlzaW9ucy50c3Vpc29rdS5oaXQpLnJldmVyc2UoKVxuICAgIH1cblxuICAgIGNiKClcbiAgfSk7XG5cbn1cbiIsInZhciBRID0gcmVxdWlyZSgnLi9RJyksXG4gICAgYXNzZXRzID0gcmVxdWlyZSgnLi9hc3NldHMnKVxucmVxdWlyZSgnLi9QbGF5ZXInKVxucmVxdWlyZSgnLi9BdXRvUGxheWVyJylcbnJlcXVpcmUoJy4vQW5pbVBsYXllcicpXG5yZXF1aXJlKCcuL0h1ZCcpXG5yZXF1aXJlKCcuL0p1ZGdlJylcblxudmFyIGxldmVsID0gbmV3IFEuVGlsZUxheWVyKHtcbiB0aWxlczogW1xuIG5ldyBBcnJheSgxMikuam9pbignMCcpLnNwbGl0KCcnKSxcbiBuZXcgQXJyYXkoMTIpLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gbmV3IEFycmF5KDEyKS5qb2luKCcwJykuc3BsaXQoJycpLFxuIG5ldyBBcnJheSgxMikuam9pbignMCcpLnNwbGl0KCcnKSxcbiBuZXcgQXJyYXkoMTIpLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gbmV3IEFycmF5KDEyKS5qb2luKCcxJykuc3BsaXQoJycpXG4gXSwgc2hlZXQ6ICd0aWxlcycgXG59KVxuXG5RLnNjZW5lKCdiZycsIGZ1bmN0aW9uKHN0YWdlKSB7XG4gIHZhciBiZyA9IHN0YWdlLmluc2VydChuZXcgUS5TcHJpdGUoe1xuICAgIGFzc2V0OiBcIi9hc3NldHMvYmctMS5wbmdcIixcbiAgICBzY2FsZTogNzA0LzkwMFxuICB9KSlcbiAgYmcuY2VudGVyKClcbiAgYmcucC55ID0gMjcwXG4gIHN0YWdlLm9uKFwiZGVzdHJveVwiLGZ1bmN0aW9uKCkge1xuICAgIGp1ZGdlLmRlc3Ryb3koKVxuICB9KTtcbn0pXG5cblEuc2NlbmUoXCJhbmltc1wiLCBmdW5jdGlvbihzdGFnZSkge1xuICB2YXIgbGF5ZXIgPSBzdGFnZS5jb2xsaXNpb25MYXllcihsZXZlbCk7XG4gIHZhciBwbGF5ZXJhID0gc3RhZ2UuaW5zZXJ0KG5ldyBRLkFuaW1QbGF5ZXIoe3g6IDY0LCB5OiA1KjMyfSkpXG4gIHZhciBqdWRnZSA9IHN0YWdlLmluc2VydChuZXcgUS5KdWRnZSh7eDogMjQsIHk6IDUqMzJ9KSlcbiAgc3RhZ2UuYWRkKFwidmlld3BvcnRcIikvLy5tb3ZlVG8oLXdpbmRvdy5pbm5lcldpZHRoLzQsIC13aW5kb3cuaW5uZXJIZWlnaHQvNClcbiAgc3RhZ2Uudmlld3BvcnQuc2NhbGUgPSAyXG4gIHN0YWdlLnZpZXdwb3J0LmNlbnRlck9uKGxheWVyLnAudy8yLCBsYXllci5wLmgvMilcbiAgc3RhZ2Uub24oXCJkZXN0cm95XCIsZnVuY3Rpb24oKSB7XG4gICAgcGxheWVyYS5kZXN0cm95KCk7XG4gICAganVkZ2UuZGVzdHJveSgpXG4gIH0pO1xufSlcblxuUS5zY2VuZShcImF1dG9wbGF5XCIsIGZ1bmN0aW9uKHN0YWdlKSB7XG4gIHZhciBsYXllciA9IHN0YWdlLmNvbGxpc2lvbkxheWVyKGxldmVsKTtcbiAgdmFyIHBsYXllcmEgPSBzdGFnZS5pbnNlcnQobmV3IFEuQXV0b1BsYXllcigpKVxuICB2YXIgcGxheWVyYiA9IHN0YWdlLmluc2VydChuZXcgUS5BdXRvUGxheWVyKCkpXG4gIHZhciBwbGF5ZXJjID0gc3RhZ2UuaW5zZXJ0KG5ldyBRLkF1dG9QbGF5ZXIoKSk7XG4gIHZhciBqdWRnZSA9IHN0YWdlLmluc2VydChuZXcgUS5KdWRnZSh7eDogMjQsIHk6IDUqMzJ9KSlcbiAgc3RhZ2UuYWRkKFwidmlld3BvcnRcIilcbiAgc3RhZ2Uudmlld3BvcnQuc2NhbGUgPSAyXG4gIHN0YWdlLnZpZXdwb3J0LmNlbnRlck9uKGxheWVyLnAudy8yLCBsYXllci5wLmgvMilcbiAgc3RhZ2Uub24oXCJkZXN0cm95XCIsZnVuY3Rpb24oKSB7XG4gICAgcGxheWVyYS5kZXN0cm95KCk7XG4gICAgcGxheWVyYi5kZXN0cm95KCk7XG4gICAgcGxheWVyYy5kZXN0cm95KCk7XG4gICAganVkZ2UuZGVzdHJveSgpXG4gIH0pO1xuICBRLnN0YXRlLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICBpZihRLnN0YXRlLmdldCgnc2NvcmUtYScpID09IDQgfHwgUS5zdGF0ZS5nZXQoJ3Njb3JlLWInKSA9PSA0IHx8IFEuc3RhdGUuZ2V0KCdzY29yZS1jJykgPT0gNCkge1xuICAgICAgXy5pbnZva2UoW3BsYXllcmEsIHBsYXllcmIsIHBsYXllcmNdLCAncGF1c2UnKVxuICAgIH1cbiAgfSlcbiAgZnVuY3Rpb24gbmV3Um91bmQoKSB7XG4gICAgaHVkLnJlc2V0KClcbiAgICBwbGF5ZXJhLnNldCh7eDogNjQsIHk6IDUqMzJ9KVxuICAgIHBsYXllcmIuc2V0KHt4OiAxNjgsIHk6IDUqMzJ9KVxuICAgIHBsYXllcmMuc2V0KHt4OiAyNTYsIHk6IDUqMzJ9KVxuICAgIF8uaW52b2tlKFtwbGF5ZXJhLCBwbGF5ZXJiLCBwbGF5ZXJjXSwgJ3VucGF1c2UnKVxuICB9XG4gIGp1ZGdlLm9uKCd0YWxrRW5kJywgbmV3Um91bmQpXG4gIG5ld1JvdW5kKClcbn0pXG5cblEuc2NlbmUoXCJwbGF5XCIsIGZ1bmN0aW9uKHN0YWdlKSB7XG4gIHZhciBsYXllciA9IHN0YWdlLmNvbGxpc2lvbkxheWVyKGxldmVsKTtcbiAgdmFyIHBsYXllcmEgPSBzdGFnZS5pbnNlcnQobmV3IFEuUGxheWVyKHt4OiA2NCwgeTogMTkyfSkpXG4gIHZhciBwbGF5ZXJiID0gc3RhZ2UuaW5zZXJ0KG5ldyBRLkF1dG9QbGF5ZXIoe3g6IDI1NiwgeTogMTkyfSkpXG4gIHZhciBqdWRnZSA9IHN0YWdlLmluc2VydChuZXcgUS5KdWRnZSh7eDogMjQsIHk6IDE5Mn0pKVxuICBzdGFnZS5hZGQoXCJ2aWV3cG9ydFwiKVxuICBzdGFnZS52aWV3cG9ydC5zY2FsZSA9IDJcbiAgc3RhZ2Uudmlld3BvcnQuY2VudGVyT24obGF5ZXIucC53LzIsIGxheWVyLnAuaC8yKVxuICBzdGFnZS5vbihcImRlc3Ryb3lcIixmdW5jdGlvbigpIHtcbiAgICBwbGF5ZXJhLmRlc3Ryb3koKTtcbiAgICBwbGF5ZXJiLmRlc3Ryb3koKTtcbiAgICBqdWRnZS5kZXN0cm95KClcbiAgfSk7XG59KVxuXG5RLnNjZW5lKCdlbmRHYW1lJyxmdW5jdGlvbihzdGFnZSkge1xuICB2YXIgY29udGFpbmVyID0gc3RhZ2UuaW5zZXJ0KG5ldyBRLlVJLkNvbnRhaW5lcih7XG4gICAgeDogUS53aWR0aC8yLCB5OiBRLmhlaWdodC8yLCBmaWxsOiBcInJnYmEoMCwwLDAsMC41KVwiXG4gIH0pKTtcbiAgXG4gIHZhciBidXR0b24gPSBjb250YWluZXIuaW5zZXJ0KG5ldyBRLlVJLkJ1dHRvbih7IHg6IDAsIHk6IDAsIGZpbGw6IFwiI0NDQ0NDQ1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJQbGF5IEFnYWluXCIgfSkpICAgICAgICAgXG4gIHZhciBsYWJlbCA9IGNvbnRhaW5lci5pbnNlcnQobmV3IFEuVUkuVGV4dCh7eDoxMCwgeTogLTEwIC0gYnV0dG9uLnAuaCwgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogc3RhZ2Uub3B0aW9ucy5sYWJlbCB9KSk7XG5cbiAgYnV0dG9uLm9uKFwiY2xpY2tcIixmdW5jdGlvbigpIHtcbiAgICBRLmNsZWFyU3RhZ2VzKCk7XG4gICAgUS5zdGFnZVNjZW5lKCdsZXZlbDEnKTtcbiAgfSk7XG4gIGNvbnRhaW5lci5maXQoMjApO1xufSk7XG5cbnZhciBodWQ7XG5hc3NldHMubG9hZChmdW5jdGlvbigpIHtcbiAgaHVkID0gbmV3IFEuSHVkKClcbiAgaHVkLmluaXQoKVxuICBRLnN0YWdlU2NlbmUoXCJiZ1wiLCAwKTtcbiAgUS5zdGFnZVNjZW5lKFwiYXV0b3BsYXlcIiwgMSk7XG59KVxuIl19
