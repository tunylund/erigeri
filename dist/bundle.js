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
    this.on("destroy", this, function(){ this.instances.remove(this) })
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

    Q.state.set({ 
      'total-score-a': 0, 'total-score-b': 0, 'total-score-c': 0 
    });

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
      'score-a': 0, 'score-b': 0, 'score-c': 0
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
      _.delay(_.bind(this.trigger, this, 'sayNext'), 2500)
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

var Q = Quintus({imagePath: ''})
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
    
      ["assets/bg-1.png",
      "assets/tiles.png",
      "assets/judge.png"],

      _.map(playerAssets, function(name) {
        return "assets/" + name + ".png"
      }),

      _.map(_.without(playerAssets, "torso-hit", "headoff-hit"), function(name) {
        return "assets/" + name + "-collisions.png"
      })

    ]), function() {

    var playerTile = { tilew: 48, tileh: 32 }
    Q.sheet("tiles","assets/tiles.png", { tilew: 32, tileh: 8 });
    Q.sheet("judge", "assets/judge.png", {tilew: 32, tileh: 32});

    _.each(playerAssets, function(name) {
      Q.assets["assets/" + name + "-a.png"] = colorize("assets/" + name + ".png", [240, 121, 0, 255]);
      Q.assets["assets/" + name + "-b.png"] = colorize("assets/" + name + ".png", [102, 153, 255, 255]);
      Q.assets["assets/" + name + "-c.png"] = colorize("assets/" + name + ".png", [68, 221, 85, 255]);
      Q.sheet(name + '-a', "assets/" + name + "-a.png", playerTile);
      Q.sheet(name + '-b', "assets/" + name + "-b.png", playerTile);
      Q.sheet(name + '-c', "assets/" + name + "-c.png", playerTile);
    })

    _.each(_.without(playerAssets, "torso-hit", "headoff-hit"), function(name) {
      collisions(name, "assets/" + name + "-collisions.png", playerTile)
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
    asset: "assets/bg-1.png",
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

Q.scene("play-1on1", function(stage) {
  var layer = stage.collisionLayer(level);
  var playera = stage.insert(new Q.Player())
  var playerb = stage.insert(new Q.AutoPlayer())
  var judge = stage.insert(new Q.Judge({x: 24, y: 5*32}))
  stage.add("viewport")
  stage.viewport.scale = 2
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2)
  stage.on("destroy",function() {
    playera.destroy();
    playerb.destroy();
    judge.destroy();
    layer.destroy();
  });
  Q.state.on('change', function() {
    if(Q.state.get('score-a') == 4 || Q.state.get('score-b') == 4) {
      _.invoke([playera, playerb], 'pause')
    }
  })
  function newRound() {
    hud.reset()
    playera.set({x: 64, y: 5*32})
    playerb.set({x: 168, y: 5*32})
    _.invoke([playera, playerb], 'unpause')
  }
  judge.on('talkEnd', newRound)
  newRound()
})

Q.scene("play-1on2", function(stage) {
  var layer = stage.collisionLayer(level);
  var playera = stage.insert(new Q.Player())
  var playerb = stage.insert(new Q.AutoPlayer())
  var playerc = stage.insert(new Q.AutoPlayer())
  var judge = stage.insert(new Q.Judge({x: 24, y: 5*32}))
  stage.add("viewport")
  stage.viewport.scale = 2
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2)
  stage.on("destroy",function() {
    playera.destroy();
    playerb.destroy();
    playerc.destroy();
    judge.destroy();
    layer.destroy();
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

var hud;
assets.load(function() {
  hud = new Q.Hud()
  hud.init()
  Q.stageScene("bg", 0);
  Q.stageScene("play-1on2", 1);
})

},{"./AnimPlayer":1,"./AutoPlayer":2,"./Hud":4,"./Judge":5,"./Player":6,"./Q":7,"./assets":8}]},{},[9])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvQW5pbVBsYXllci5qcyIsImxpYi9BdXRvUGxheWVyLmpzIiwibGliL0dlcmlNb24uanMiLCJsaWIvSHVkLmpzIiwibGliL0p1ZGdlLmpzIiwibGliL1BsYXllci5qcyIsImxpYi9RLmpzIiwibGliL2Fzc2V0cy5qcyIsImxpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdFpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIFEgPSByZXF1aXJlKCcuL1EnKVxucmVxdWlyZSgnLi9HZXJpTW9uJylcblxuXG5mdW5jdGlvbiBkaXN0YW5jZShhLCBiKSB7XG4gIHZhciB4ID0gTWF0aC5hYnMoYS5wLnggLSBiLnAueCksXG4gICAgICB5ID0gTWF0aC5hYnMoYS5wLnkgLSBiLnAueSlcbiAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkpO1xufVxuXG5mdW5jdGlvbiBzcG90QXR0YWNrKHRhcmdldCkge1xuICBpZih0YXJnZXQucC5hbmltYXRpb24gPT09ICdmdWpvZ2VyaScpIHtcbiAgICBpZih0YXJnZXQucC5hbmltYXRpb25GcmFtZSA+IDQpXG4gICAgICByZXR1cm4gJ2Z1am9nZXJpJ1xuICB9XG4gIGlmKHRhcmdldC5wLmFuaW1hdGlvbiA9PT0gJ3N1aWhlaWdlcmknKSB7XG4gICAgaWYodGFyZ2V0LnAuYW5pbWF0aW9uRnJhbWUgPiA0KVxuICAgICAgcmV0dXJuICdzdWloZWlnZXJpJ1xuICB9XG4gIGlmKHRhcmdldC5wLmFuaW1hdGlvbiA9PT0gJ21hbmppZ2VyaScpIHtcbiAgICBpZih0YXJnZXQucC5hbmltYXRpb25GcmFtZSA+IDQpXG4gICAgICByZXR1cm4gJ21hbmppZ2VyaSdcbiAgfSBcbn1cblxuUS5HZXJpTW9uLmV4dGVuZChcIkFuaW1QbGF5ZXJcIiwge1xuXG4gIGF0dGFja1NlcXVlbmNlOiBbJ3NlbnNvZ2VyaScsICdtYW5qaWdlcmknLCAnZnVqb2dlcmknLCAnc3VpaGVpZ2VyaScsICdzZW50YWlub3RzdWtpJywgJ2hhbmdldHN1YXRlJ10sXG4gIHVuc29rdVNlcXVlbmNlOiBbJ25pbm9hc2hpJywgJ3RzdWlzb2t1JywgJ2tvc29rdScsICdnZW5zb2t1JywgJ3RhaXNva3UnLCAndXNoaXJvJ10sXG5cbiAgaW5pdDogZnVuY3Rpb24ocCkge1xuICAgIHRoaXMuX3N1cGVyKF8uZXh0ZW5kKHtcbiAgICAgIGFuaW06IG51bGwsXG4gICAgICBzZXF1ZW5jZTogdGhpcy5hdHRhY2tTZXF1ZW5jZVxuICAgIH0sIHApKVxuICAgIC8vIHRoaXMub24oJ3N0YW5kJywgdGhpcywgJ25leHQnKVxuICAgIC8vIHRoaXMubmV4dCgpXG4gIH0sXG5cbiAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIG4gPSB0aGlzLnAuc2VxdWVuY2VbdGhpcy5wLnNlcXVlbmNlLmluZGV4T2YodGhpcy5wLmFuaW0pICsgMV0gfHwgdGhpcy5wLnNlcXVlbmNlWzBdXG4gICAgaWYodGhpc1tuXSgpKSB7XG4gICAgICB0aGlzLnAuYW5pbSA9IG5cbiAgICB9XG4gIH0sXG5cbiAgc3RlcDogZnVuY3Rpb24odCkge1xuICAgIGlmKFEuaW5wdXRzLmZpcmUpIHtcbiAgICAgIHRoaXMucC5zZXF1ZW5jZSA9IHRoaXMucC5zZXF1ZW5jZSA9PSB0aGlzLmF0dGFja1NlcXVlbmNlID8gdGhpcy51bnNva3VTZXF1ZW5jZSA6IHRoaXMuYXR0YWNrU2VxdWVuY2VcbiAgICB9XG4gICAgdGhpcy5uZXh0KClcbiAgfVxuXG59KSIsInZhciBRID0gcmVxdWlyZSgnLi9RJylcbnJlcXVpcmUoJy4vR2VyaU1vbicpXG5cblxuZnVuY3Rpb24gZGlzdGFuY2UoYSwgYikge1xuICB2YXIgeCA9IE1hdGguYWJzKGEucC54IC0gYi5wLngpLFxuICAgICAgeSA9IE1hdGguYWJzKGEucC55IC0gYi5wLnkpXG4gIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5KTtcbn1cblxuZnVuY3Rpb24gc3BvdEF0dGFjayh0YXJnZXQpIHtcbiAgaWYodGFyZ2V0LnAuYXR0YWNraW5nICYmIHRhcmdldC5wLmFuaW1hdGlvbkZyYW1lID4gNCkge1xuICAgIHJldHVybiB0YXJnZXQucC5hbmltYXRpb25cbiAgfVxufVxuXG5RLkdlcmlNb24uZXh0ZW5kKFwiQXV0b1BsYXllclwiLCB7XG5cbiAgaGl0RGlzdGFuY2U6IDM1LFxuXG4gIG1vdmVDbG9zZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgIGlmKGRpc3RhbmNlKHRhcmdldCwgdGhpcykgPiB0aGlzLmhpdERpc3RhbmNlICsgdGhpcy5wLncvMikge1xuICAgICAgdGhpcy50c3Vpc29rdSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubmlub2FzaGkoKVxuICAgIH1cbiAgfSxcblxuICBtb3ZlRnVydGhlcjogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgdGhpc1tfLnNhbXBsZShbJ3RhaXNva3UnLCAnZ2Vuc29rdSddKV0oKVxuICB9LFxuXG4gIGNhbmNlbEF0dGFjazogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuXG4gICAgaWYodGhpcy5wLmF0dGFja2luZyAmJiB0aGlzLnAuYW5pbWF0aW9uRnJhbWUgPCA0KSB7XG4gICAgICB0aGlzLnN0YW5kKClcbiAgICB9XG4gIH0sXG5cbiAgY2FuY2VsVW5zb2t1OiBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLnAud2Fsa2luZykge1xuICAgICAgaWYodGhpcy5wLmFuaW1hdGlvbkZyYW1lIDwgMyB8fCB0aGlzLnAuYW5pbWF0aW9uRnJhbWUgPiA2KSB7XG4gICAgICAgIHRoaXMuc3RhbmQoKVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBhdHRhY2tEdXJpbmdBdHRhY2s6IGZ1bmN0aW9uKHRhcmdldCwgYXR0YWNrKSB7XG4gICAgaWYoYXR0YWNrID09PSAnc3VpaGVpZ2VyaScpIHtcbiAgICAgIGlmKHRhcmdldC5wLmFuaW1hdGlvbkZyYW1lIDwgNikge1xuICAgICAgICB0aGlzW18uc2FtcGxlKFsnZnVqb2dlcmknLCAnbWFuamlnZXJpJ10pXSh0YXJnZXQpXG4gICAgICB9XG4gICAgfVxuICAgIGlmKGF0dGFjayA9PT0gJ2Z1am9nZXJpJykge1xuICAgICAgaWYodGFyZ2V0LnAuYW5pbWF0aW9uRnJhbWUgPCAxMCkge1xuICAgICAgICB0aGlzLm1hbmppZ2VyaSh0YXJnZXQpXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIGF0dGFja0FmdGVyQXR0YWNrOiBmdW5jdGlvbih0YXJnZXQsIGF0dGFjaykge1xuICAgIGlmKGF0dGFjayA9PT0gJ3N1aWhlaWdlcmknKSB7XG4gICAgICBpZih0YXJnZXQucC5hbmltYXRpb25GcmFtZSA+IDYpIHtcbiAgICAgICAgdGhpcy5mdWpvZ2VyaSh0YXJnZXQpXG4gICAgICB9XG4gICAgfVxuICAgIGlmKGF0dGFjayA9PT0gJ2Z1am9nZXJpJykge1xuICAgICAgaWYodGFyZ2V0LnAuYW5pbWF0aW9uRnJhbWUgPiAxMCkge1xuICAgICAgICB0aGlzLm1hbmppZ2VyaSh0YXJnZXQpXG4gICAgICB9XG4gICAgfVxuICAgIGlmKGF0dGFjayA9PT0gJ21hbmppZ2VyaScpIHtcbiAgICAgIGlmKHRhcmdldC5wLmFuaW1hdGlvbkZyYW1lID4gNykge1xuICAgICAgICB0aGlzLnN1aWhlaWdlcmkodGFyZ2V0KVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBldmFkZTogZnVuY3Rpb24odGFyZ2V0LCBhdHRhY2spIHtcbiAgICBpZihhdHRhY2spIHtcbiAgICAgIHZhciByID0gTWF0aC5yYW5kb20oKVxuICAgICAgdGhpcy5jYW5jZWxBdHRhY2soKVxuICAgICAgaWYociA+IC44KSB7XG4gICAgICAgIHRoaXMua29zb2t1KClcbiAgICAgIH0gZWxzZSBpZiAociA+IC41IHx8IGRpc3RhbmNlKHRhcmdldCwgdGhpcykgPCB0aGlzLmhpdERpc3RhbmNlICogMy80KSB7XG4gICAgICAgIHRoaXMuZ2Vuc29rdSgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRhaXNva3UoKVxuICAgICAgfVxuXG4gICAgfVxuICB9LFxuXG4gIGF0dGFjazogZnVuY3Rpb24odGFyZ2V0LCBhdHRhY2spIHtcbiAgICB2YXIgZGlzdCA9IGRpc3RhbmNlKHRhcmdldCwgdGhpcylcbiAgICBpZihkaXN0IDwgMTUpIHtcbiAgICAgIHRoaXNbXy5zYW1wbGUoWydoYW5nZXRzdWF0ZScsICd0c3Vpc29rdSddKV0odGFyZ2V0KVxuICAgIH0gZWxzZSBpZihkaXN0IDwgMjYpIHtcbiAgICAgIHRoaXNbXy5zYW1wbGUoWydmdWpvZ2VyaScsICdzZW5zb2dlcmknLCAnbWFuamlnZXJpJ10pXSh0YXJnZXQpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbXy5zYW1wbGUoWydmdWpvZ2VyaUZvcndhcmQnLCAnc3VpaGVpZ2VyaScsICdzZW50YWlub3RzdWtpJ10pXSh0YXJnZXQpXG4gICAgfVxuICAgIC8vIGlmKGRpc3QgPiAxNCAmJiBkaXN0IDwgMjIpIHRoaXMuZnVqb2dlcmkodGFyZ2V0KVxuICAgIC8vIGlmKGRpc3QgPiAxNyAmJiBkaXN0IDwgMjYpIHRoaXMuc2Vuc29nZXJpKHRhcmdldClcbiAgICAvLyBpZihkaXN0ID4gMjAgJiYgZGlzdCA8IDI4KSB7XG4gICAgLy8gICB0aGlzW18uc2FtcGxlKFsnZnVqb2dlcmlGb3J3YXJkJywgJ21hbmppZ2VyaSddKV0odGFyZ2V0KVxuICAgIC8vIH1cbiAgICAvLyBpZihkaXN0ID4gMjcgJiYgZGlzdCA8IDM1KSB0aGlzLnN1aWhlaWdlcmkodGFyZ2V0KVxuICAgIC8vIHRoaXNbXy5zYW1wbGUoWydzdWloZWlnZXJpJywgJ21hbmppZ2VyaScsICdzZW5zb2dlcmknLCAnbWFuamlnZXJpJywgJ3NlbnNvZ2VyaScsICdmdWpvZ2VyaScsICdmdWpvZ2VyaUZvcndhcmQnXSldKHRhcmdldCkgXG4gIH0sXG5cbiAgbG9va0F0OiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICB2YXIgYXQgPSB0YXJnZXQucC54IDwgdGhpcy5wLnggPyAnbGVmdCcgOiAncmlnaHQnXG4gICAgaWYoYXQgIT0gdGhpcy5wLmRpcmVjdGlvbikgdGhpcy51c2hpcm8oKVxuICB9LFxuXG4gIHN0ZXA6IGZ1bmN0aW9uKHQpIHtcbiAgICB0aGlzLl9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG5cbiAgICBpZih0aGlzLnAucGF1c2VkKSByZXR1cm47XG4gICAgXG4gICAgdmFyIG90aGVycyA9IF8uY2hhaW4odGhpcy5pbnN0YW5jZXMpLndpdGhvdXQodGhpcykuZmlsdGVyKGZ1bmN0aW9uKGkpeyByZXR1cm4gIWkucC5oaXQgfSkudmFsdWUoKSxcbiAgICAgICAgdGFyZ2V0ID0gXy5zYW1wbGUob3RoZXJzKSxcbiAgICAgICAgZGlzdCA9IHRhcmdldCA/IGRpc3RhbmNlKHRhcmdldCwgdGhpcykgOiBJbmZpbml0eTtcbiAgICBcbiAgICBpZih0YXJnZXQpIHtcblxuICAgICAgdGhpcy5sb29rQXQodGFyZ2V0KVxuXG4gICAgICBpZihkaXN0IDwgdGhpcy5oaXREaXN0YW5jZSAvIDIpIHtcbiAgICAgICAgdGhpcy5tb3ZlRnVydGhlcih0YXJnZXQpXG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmKGRpc3QgPiB0aGlzLmhpdERpc3RhbmNlKSB7XG4gICAgICAgIHRoaXMubW92ZUNsb3Nlcih0YXJnZXQpXG4gICAgICB9XG5cbiAgICAgIHZhciBzcG90ID0gc3BvdEF0dGFjayh0YXJnZXQpXG4gICAgICBpZihzcG90KSB7XG4gICAgICAgIHRoaXMuZXZhZGUodGFyZ2V0LCBzcG90KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYoZGlzdCA+IDggJiYgZGlzdCA8PSB0aGlzLmhpdERpc3RhbmNlKSB7XG4gICAgICAgICAgdGhpcy5hdHRhY2sodGFyZ2V0KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gIH1cblxufSkiLCJ2YXIgUSA9IHJlcXVpcmUoJy4vUScpLFxuICAgIGNvbGxpc2lvbnMgPSByZXF1aXJlKCcuL2Fzc2V0cycpLmNvbGxpc2lvbnNcblxuUS5hbmltYXRpb25zKCdnZXJpbW9uJywge1xuICBzdGFuZDogeyBmcmFtZXM6IFswXSB9LFxuICBzZW50YWlub3RzdWtpOiB7IGZyYW1lczogXy5yYW5nZSgyMiksIHJhdGU6IDEvMTAsIGxvb3A6IGZhbHNlLCB0cmlnZ2VyOiAnc3RhbmQnIH0sXG4gIGZ1am9nZXJpOiB7IGZyYW1lczogXy5yYW5nZSgxNSksIHJhdGU6IDEvMTAsIGxvb3A6IGZhbHNlLCB0cmlnZ2VyOiAnc3RhbmQnIH0sXG4gIHN1aWhlaWdlcmk6IHsgZnJhbWVzOiBfLnJhbmdlKDE1KSwgcmF0ZTogMS8xMCwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAgbWFuamlnZXJpOiB7IGZyYW1lczogXy5yYW5nZSgxNSksIHJhdGU6IDEvMTAsIGxvb3A6IGZhbHNlLCB0cmlnZ2VyOiAnc3RhbmQnIH0sXG4gIGhhbmdldHN1YXRlOiB7IGZyYW1lczogXy5yYW5nZSgyMSksIHJhdGU6IDEvMTAsIGxvb3A6IGZhbHNlLCB0cmlnZ2VyOiAnc3RhbmQnIH0sXG4gIHNlbnNvZ2VyaTogeyBmcmFtZXM6IF8ucmFuZ2UoMjApLCByYXRlOiAxLzEyLCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICB0c3Vpc29rdTogeyBmcmFtZXM6IF8ucmFuZ2UoMTEpLCByYXRlOiAxLzEwLCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICBrb3Nva3U6IHsgZnJhbWVzOiBfLnJhbmdlKDE4KSwgcmF0ZTogMS8xNSwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAgdXNoaXJvOiB7IGZyYW1lczogXy5yYW5nZSg3KSwgcmF0ZTogMS8xMiwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAgbmlub2FzaGk6IHsgZnJhbWVzOiBfLnJhbmdlKDYpLCByYXRlOiAxLzEwLCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICB0YWlzb2t1OiB7IGZyYW1lczogXy5yYW5nZSgxMSkucmV2ZXJzZSgpLCByYXRlOiAxLzEwLCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICB0b3Jzb2hpdDogeyBmcmFtZXM6IFswLDEsMiwzLDIsMSwwXSwgcmF0ZTogMS8xMCwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAgaGVhZG9mZmhpdDogeyBmcmFtZXM6IF8ucmFuZ2UoMTIpLmNvbmNhdChbMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTJdKSwgcmF0ZTogMS8xMCwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfVxufSk7XG5cblxuXG5mdW5jdGlvbiBpbnRlcnNlY3RzKGEsIGIpIHtcbiAgaWYoYS53ICsgYS5oICsgYi53ICsgYi5oID09IDApIHJldHVybiBmYWxzZTtcbiAgdmFyIHhJbnRlc2VjdHMgPSBhLnggPCBiLnggJiYgYS54K2EudyA+IGIueCB8fCBcbiAgICAgICAgICAgICAgICAgICBhLnggPCBiLngrYi53ICYmIGEueCthLncgPiBiLngrYi53LFxuICAgICAgeUludGVzZWN0cyA9IGEueSA8IGIueSAmJiBhLnkgKyBhLmggPiBiLnkgfHxcbiAgICAgICAgICAgICAgICAgICBhLnkgPCBiLnkrYi5oICYmIGEueSthLmggPiBiLnkrYi5oXG4gIHJldHVybiB4SW50ZXNlY3RzICYmIHlJbnRlc2VjdHNcbn1cbmZ1bmN0aW9uIHJlY3QoeCwgeSwgdywgaCkge1xuICByZXR1cm4ge1xuICAgIHg6IHh8fDAsXG4gICAgeTogeXx8MCxcbiAgICB3OiB3fHwwLFxuICAgIGg6IGh8fDBcbiAgfVxufVxuXG5mdW5jdGlvbiBhdHRhY2soZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHRhcmdldCkge1xuICAgIGlmKCF0aGlzLnAubGFuZGVkKSByZXR1cm4gZmFsc2U7XG4gICAgaWYodGhpcy5wLmhpdCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmKHRoaXMucC5hdHRhY2tpbmcpIHJldHVybiBmYWxzZTtcbiAgICBpZih0aGlzLnAud2Fsa2luZyAmJiB0aGlzLnAuYW5pbWF0aW9uRnJhbWUgPiA0IHx8IHRoaXMucC5hbmltYXRpb24gPT09ICd1c2hpcm8nKSByZXR1cm4gZmFsc2U7XG4gICAgdGhpcy5wLnRhcmdldCA9IHRhcmdldFxuICAgIHRoaXMucC5hdHRhY2tpbmcgPSB0cnVlXG4gICAgdGhpcy5wLnZ4ID0gMFxuICAgIHZhciBkPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgaWYodHlwZW9mIGQgPT09ICd1bmRlZmluZWQnIHx8IGQpIHtcbiAgICAgIHRoaXMub24oJ3N0ZXAnLCB0aGlzLCAnaGl0U3RlcCcpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5mdW5jdGlvbiBqdW1wKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLnAuaGl0KSByZXR1cm4gZmFsc2U7XG4gICAgaWYodGhpcy5wLmp1bXBpbmcpIHJldHVybiBmYWxzZTtcbiAgICB2YXIgZD0gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgIHJldHVybiB0eXBlb2YgZCA9PT0gJ3VuZGVmaW5lZCcgfHwgZFxuICB9XG59XG5cbmZ1bmN0aW9uIHdhbGsoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMucC5oaXQpIHJldHVybiBmYWxzZTtcbiAgICBpZighdGhpcy5wLmxhbmRlZCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmKHRoaXMucC5hdHRhY2tpbmcpIHJldHVybiBmYWxzZTtcbiAgICBpZih0aGlzLnAud2Fsa2luZykgcmV0dXJuIGZhbHNlO1xuICAgIHRoaXMucC53YWxraW5nID0gdHJ1ZVxuICAgIHZhciBkPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgcmV0dXJuIHR5cGVvZiBkID09PSAndW5kZWZpbmVkJyB8fCBkXG4gIH1cbn1cblxuUS5Nb3ZpbmdTcHJpdGUuZXh0ZW5kKFwiSGVhZFwiLCB7XG4gIGluaXQ6IGZ1bmN0aW9uKG93bmVyLCBmb3JjZSkge1xuICAgIHRoaXMuX3N1cGVyKHt9LCB7XG4gICAgICBjb2xvcjogXCIjMDAwMDAwXCIsXG4gICAgICB3OiA0LFxuICAgICAgaDogNCxcbiAgICAgIHg6IG93bmVyLnAueCxcbiAgICAgIHk6IG93bmVyLnAueSAtIDEzLFxuICAgICAgZGlyOiAtMSpvd25lci5wLmRpcixcbiAgICAgIHNlbnNvcjogdHJ1ZSxcbiAgICAgIGxpZmU6IDBcbiAgICB9KVxuICAgIHRoaXMuYWRkKCcyZCcpO1xuICAgIHRoaXMucC52eSA9IC0xNTBcbiAgICB0aGlzLnAudnggPSB0aGlzLnAuZGlyKmZvcmNlICogMlxuICB9LFxuICBzdGVwOiBmdW5jdGlvbih0KSB7XG4gICAgdGhpcy5fc3VwZXIodClcbiAgICB0aGlzLnAubGlmZSArPSB0XG4gICAgdGhpcy5wLmFuZ2xlICs9IHRoaXMucC5kaXIgKiB0ICogNDAwXG4gICAgaWYodGhpcy5wLmxpZmUgPiA1KSB7XG4gICAgICB0aGlzLmRlc3Ryb3koKVxuICAgIH1cbiAgfVxufSlcblxuUS5Nb3ZpbmdTcHJpdGUuZXh0ZW5kKFwiR2VyaU1vblwiLCB7XG4gIGluc3RhbmNlczogW10sXG4gIHNwZWVkOiAyNSxcbiAgZnJpY3Rpb246IDUsXG4gIGp1bXBTcGVlZDogMTAwLFxuICBoaXRGb3JjZToge1xuICAgIGZ1am9nZXJpOiA0MCxcbiAgICBtYW5qaWdlcmk6IDI1LFxuICAgIHNlbnNvZ2VyaTogNDAsXG4gICAgc3VpaGVpZ2VyaTogMzUsXG4gICAgc2VudGFpbm90c3VraTogMjUsXG4gICAgaGFuZ2V0c3VhdGU6IDQwXG4gIH0sXG5cbiAgaW5pdDogZnVuY3Rpb24ocCkge1xuICAgIHZhciB3ID0gMjIsIGggPSAzMlxuICAgIHRoaXMuX3N1cGVyKHAsIHsgXG4gICAgICBzcHJpdGU6IFwiZ2VyaW1vblwiLFxuICAgICAgZGlyOiAxLFxuICAgICAgdzogdyxcbiAgICAgIGg6IGgsXG4gICAgICBzdzogNDgsXG4gICAgICBzaDogMzIsXG4gICAgICBzZW5zb3I6IHRydWUsXG4gICAgICBtb3ZlbWVudHM6IFtdLFxuICAgICAgcG9pbnRzOiBbXG4gICAgICAgIFstdy8yLCAtaC8yXSwgXG4gICAgICAgIFsgdy8yLCAtaC8yIF0sIFxuICAgICAgICBbIHcvMiwgIGgvMiBdLCBcbiAgICAgICAgWy13LzIsICBoLzIgXV0sXG4gICAgICBjeDogMTBcbiAgICB9KTtcbiAgICB0aGlzLmFkZCgnMmQsIGFuaW1hdGlvbicpO1xuICAgIHRoaXMuaW5zdGFuY2VzLnB1c2godGhpcylcbiAgICB0aGlzLnAuaSA9IFwiYWJjXCJbdGhpcy5pbnN0YW5jZXMuaW5kZXhPZih0aGlzKV1cblxuICAgIHRoaXMub24oXCJzdGFuZFwiLCB0aGlzLCBcInN0YW5kXCIpO1xuICAgIHRoaXMub24oXCJwcmVzdGVwXCIsIHRoaXMsIFwicHJlc3RlcFwiKVxuICAgIHRoaXMub24oXCJidW1wLmJvdHRvbVwiLCB0aGlzLCBcImxhbmRcIik7XG4gICAgdGhpcy5vbihcImFuaW1FbmQuc2VudGFpbm90c3VraVwiLCB0aGlzLCBcInNlbnRhaW5vdHN1a2lFbmRcIilcbiAgICB0aGlzLm9uKFwiYW5pbUVuZC51c2hpcm9cIiwgdGhpcywgXCJ1c2hpcm9FbmRcIilcbiAgICB0aGlzLm9uKFwiYW5pbUVuZFwiLCB0aGlzLCBcImxvZ01vdmVtZW50XCIpXG4gICAgdGhpcy5vbihcImRlc3Ryb3lcIiwgdGhpcywgZnVuY3Rpb24oKXsgdGhpcy5pbnN0YW5jZXMucmVtb3ZlKHRoaXMpIH0pXG4gICAgLy8gdGhpcy5vbihcInBvc3RkcmF3XCIsIHRoaXMsIFwicmVuZGVyQ29sbGlzaW9uc1wiKVxuXG4gICAgdGhpcy5zdGFuZCgpXG4gIH0sXG5cbiAgbG9nTW92ZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC5tb3ZlbWVudHMucHVzaCh0aGlzLnAuYW5pbWF0aW9uKVxuICAgIHRoaXMucC5tb3ZlbWVudHMgPSB0aGlzLnAubW92ZW1lbnRzLnNwbGljZSgtMylcbiAgfSxcblxuICBfYWJzeDogZnVuY3Rpb24oeCwgdykge1xuICAgIHJldHVybiB0aGlzLnAuZmxpcCA/IFxuICAgICAgdGhpcy5wLnggKyB0aGlzLnAuY3ggLSB4IC0gdyA6XG4gICAgICB0aGlzLnAueCAtIHRoaXMucC5jeCArIHhcbiAgfSxcblxuICBfYWJzeTogZnVuY3Rpb24oeSkge1xuICAgIHJldHVybiB0aGlzLnAueS10aGlzLnAuY3kgKyB5XG4gIH0sXG5cbiAgcmVuZGVyQ29sbGlzaW9uczogZnVuY3Rpb24oY3R4KSB7XG4gICAgY3R4LnNhdmUoKTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG5cbiAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsMCwwLDAuNSlcIjtcbiAgICBjdHguZmlsbFJlY3QodGhpcy5wLngtdGhpcy5wLmN4LCB0aGlzLnAueS10aGlzLnAuY3ksIHRoaXMucC53LCB0aGlzLnAuaCk7XG4gICAgY3R4LmZpbGwoKTtcbiAgICBcbiAgICB2YXIgYyA9IGNvbGxpc2lvbnNbdGhpcy5wLmFuaW1hdGlvbl0gfHwgY29sbGlzaW9ucy5zdGFuZCxcbiAgICAgICAgZnQgPSBjLnRvcnNvW3RoaXMucC5hbmltYXRpb25GcmFtZV0gfHwgYy50b3Jzb1swXSxcbiAgICAgICAgZmggPSBjLmhlYWRbdGhpcy5wLmFuaW1hdGlvbkZyYW1lXSB8fCBjLmhlYWRbMF0sXG4gICAgICAgIGZoaD0gYy5oaXQgJiYgYy5oaXRbdGhpcy5wLmFuaW1hdGlvbkZyYW1lXSB8fCB7fVxuICAgIFxuICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMjU1LDAsMjU1LDAuNSlcIjtcbiAgICBjdHguZmlsbFJlY3QodGhpcy5fYWJzeChmdC54LCBmdC53KSwgdGhpcy5fYWJzeShmdC55KSwgZnQudywgZnQuaCk7XG4gICAgY3R4LmZpbGwoKTtcblxuICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwyNTUsMjU1LDAuNSlcIjtcbiAgICBjdHguZmlsbFJlY3QodGhpcy5fYWJzeChmaC54LCBmaC53KSwgdGhpcy5fYWJzeShmaC55KSwgZmgudywgZmguaCk7XG4gICAgY3R4LmZpbGwoKTtcblxuICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMjU1LDI1NSwwLDAuNSlcIjtcbiAgICBjdHguZmlsbFJlY3QodGhpcy5fYWJzeChmaGgueCwgZmhoLncpLCB0aGlzLl9hYnN5KGZoaC55KSwgZmhoLncsIGZoaC5oKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIGN0eC5yZXN0b3JlKClcbiAgfSxcblxuICBsYW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAubGFuZGVkID0gdHJ1ZVxuICB9LFxuXG4gIHNoZWV0OiBmdW5jdGlvbihuYW1lKSB7XG4gICAgaWYobmFtZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3N1cGVyKG5hbWUgKyAnLScgKyB0aGlzLnAuaSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuX3N1cGVyKClcbiAgICB9XG4gIH0sXG5cbiAgcGF1c2U6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC5wYXVzZWQgPSB0cnVlXG4gIH0sXG5cbiAgdW5wYXVzZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLnBhdXNlZCA9IGZhbHNlXG4gICAgdGhpcy5zdGFuZCgpXG4gIH0sXG5cbiAgZnVqb2dlcmlGb3J3YXJkOiBqdW1wKGF0dGFjayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAudnggPSAwXG4gICAgdGhpcy5zaGVldChcImZ1am9nZXJpXCIpXG4gICAgdGhpcy5wbGF5KCdmdWpvZ2VyaScsIDEpXG4gICAgdGhpcy5vbignc3RlcCcsIHRoaXMsICdmdWpvZ2VyaUZvcndhcmRTdGVwJylcbiAgICB0aGlzLm9uKCdzdGVwJywgdGhpcywgJ2Z1am9nZXJpU3RlcCcpXG4gIH0pKSxcblxuICBmdWpvZ2VyaToganVtcChhdHRhY2soZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLnZ4ID0gMFxuICAgIHRoaXMuc2hlZXQoXCJmdWpvZ2VyaVwiKVxuICAgIHRoaXMucGxheSgnZnVqb2dlcmknLCAxKVxuICAgIHRoaXMub24oJ3N0ZXAnLCB0aGlzLCAnZnVqb2dlcmlTdGVwJylcbiAgfSkpLFxuXG4gIGZ1am9nZXJpRm9yd2FyZFN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMucC5hbmltYXRpb25GcmFtZSA+IDQgJiYgdGhpcy5wLmFuaW1hdGlvbkZyYW1lIDwgNykge1xuICAgICAgdGhpcy5wLnZ4ID0gdGhpcy5wLmRpciAqIHRoaXMuc3BlZWRcbiAgICAgIHRoaXMub2ZmKCdzdGVwJywgdGhpcywgJ2Z1am9nZXJpRm9yd2FyZFN0ZXAnKVxuICAgIH1cbiAgfSxcblxuICBmdWpvZ2VyaVN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMucC5hbmltYXRpb25GcmFtZSA+PSA1KSB7XG4gICAgICB0aGlzLnAudnkgPSAtdGhpcy5qdW1wU3BlZWRcbiAgICAgIHRoaXMucC5sYW5kZWQgPSBmYWxzZVxuICAgICAgdGhpcy5wLmp1bXBpbmcgPSB0cnVlXG4gICAgICB0aGlzLm9mZignc3RlcCcsIHRoaXMsICdmdWpvZ2VyaVN0ZXAnKVxuICAgIH1cbiAgfSxcblxuICBoYW5nZXRzdWF0ZTogYXR0YWNrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2hlZXQoXCJoYW5nZXRzdWF0ZVwiKVxuICAgIHRoaXMucGxheSgnaGFuZ2V0c3VhdGUnLCAxKVxuICB9KSxcblxuICBzZW50YWlub3RzdWtpOiBhdHRhY2soZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zaGVldChcInNlbnRhaW5vdHN1a2lcIilcbiAgICB0aGlzLnBsYXkoJ3NlbnRhaW5vdHN1a2knLCAxKVxuICB9KSxcblxuICBzZW50YWlub3RzdWtpRW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAueCArPSB0aGlzLnAuZGlyICogMTVcbiAgfSxcblxuICBtYW5qaWdlcmk6IGF0dGFjayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNoZWV0KFwibWFuamlnZXJpXCIpXG4gICAgdGhpcy5wbGF5KCdtYW5qaWdlcmknLCAxKVxuICB9KSxcblxuICBzdWloZWlnZXJpOiBhdHRhY2soZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zaGVldChcInN1aWhlaWdlcmlcIilcbiAgICB0aGlzLnBsYXkoJ3N1aWhlaWdlcmknLCAxKVxuICB9KSxcblxuICBzZW5zb2dlcmk6IGF0dGFjayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNoZWV0KFwic2Vuc29nZXJpXCIpXG4gICAgdGhpcy5wbGF5KCdzZW5zb2dlcmknLCAxKVxuICB9KSxcblxuICB1c2hpcm86IHdhbGsoZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zaGVldChcInVzaGlyb1wiKVxuICAgIHRoaXMucGxheSgndXNoaXJvJywgMSlcbiAgfSksXG5cbiAgdXNoaXJvRW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAueCArPSB0aGlzLnAuZGlyICogNFxuICAgIHRoaXMucC5kaXJlY3Rpb24gPSB0aGlzLnAuZGlyZWN0aW9uID09PSAnbGVmdCcgPyAncmlnaHQnIDogJ2xlZnQnXG4gICAgdGhpcy5wcmVzdGVwKClcbiAgfSxcblxuICBuaW5vYXNoaTogd2FsayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAudnggPSB0aGlzLnAuZGlyICogdGhpcy5zcGVlZC8yO1xuICAgIHRoaXMuc2hlZXQoXCJuaW5vYXNoaVwiKVxuICAgIHRoaXMucGxheSgnbmlub2FzaGknLCAxKVxuICB9KSxcblxuICB0YWlzb2t1OiB3YWxrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC52eCA9IC10aGlzLnAuZGlyICogdGhpcy5zcGVlZDtcbiAgICB0aGlzLnNoZWV0KFwidHN1aXNva3VcIilcbiAgICB0aGlzLnBsYXkoJ3RhaXNva3UnLCAxKVxuICB9KSxcbiAgXG4gIHRzdWlzb2t1OiB3YWxrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC52eCA9IHRoaXMucC5kaXIgKiB0aGlzLnNwZWVkO1xuICAgIHRoaXMuc2hlZXQoXCJ0c3Vpc29rdVwiKVxuICAgIHRoaXMucGxheSgndHN1aXNva3UnLCAxKVxuICB9KSxcblxuICBrb3Nva3U6IHdhbGsoZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLnZ4ID0gdGhpcy5wLmRpciAqIHRoaXMuc3BlZWQvMjtcbiAgICB0aGlzLnNoZWV0KFwia29zb2t1XCIpXG4gICAgdGhpcy5wbGF5KCdrb3Nva3UnLCAxKVxuICB9KSxcblxuICBnZW5zb2t1OiB3YWxrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC52eCA9IC10aGlzLnAuZGlyICogdGhpcy5zcGVlZCoyLzM7XG4gICAgdGhpcy5zaGVldChcImtvc29rdVwiKVxuICAgIHRoaXMucGxheSgna29zb2t1JywgMSlcbiAgfSksXG5cbiAgaGl0U3RlcDogZnVuY3Rpb24oKSB7XG4gICAgaWYoIWNvbGxpc2lvbnNbdGhpcy5wLmFuaW1hdGlvbl0pIHJldHVybjtcbiAgICB2YXIgaGl0ID0gdGhpcy5oaXRUZXN0KGNvbGxpc2lvbnNbdGhpcy5wLmFuaW1hdGlvbl0uaGl0W3RoaXMucC5hbmltYXRpb25GcmFtZV0pXG4gICAgaWYoaGl0KSB7XG4gICAgICB2YXIgdmFsdWUgPSB0aGlzLnAudGFyZ2V0LmhpdCh0aGlzLnAuZGlyICogdGhpcy5oaXRGb3JjZVt0aGlzLnAuYW5pbWF0aW9uXSwgaGl0KVxuXG4gICAgICB2YXIgcHJldk1vdmVtZW50ID0gdGhpcy5wLm1vdmVtZW50c1t0aGlzLnAubW92ZW1lbnRzLmxlbmd0aC0xXVxuICAgICAgaWYocHJldk1vdmVtZW50ICYmIHByZXZNb3ZlbWVudC5pbmRleE9mKCdzb2t1JykgPiAtMSkge1xuICAgICAgICB2YWx1ZSArPSAxXG4gICAgICB9XG5cbiAgICAgIHZhciBzY29yZSA9IFEuc3RhdGUuZ2V0KFwic2NvcmUtXCIgKyB0aGlzLnAuaSkgfHwgMFxuICAgICAgUS5zdGF0ZS5pbmMoXCJ0b3RhbC1zY29yZS1cIiArIHRoaXMucC5pLCB2YWx1ZSoxMDApXG4gICAgICBRLnN0YXRlLnNldChcInNjb3JlLVwiICsgdGhpcy5wLmksIE1hdGgubWluKChzY29yZSArIHZhbHVlKSwgNCkpO1xuICAgIH1cbiAgfSxcblxuICBoaXRUZXN0OiBmdW5jdGlvbihjb2xsKSB7XG4gICAgaWYoIXRoaXMucC50YXJnZXQpIHJldHVybiBmYWxzZVxuICAgIGlmKHRoaXMucC50YXJnZXQucC5oaXQpIHJldHVybiBmYWxzZVxuICAgIHZhciB0ID0gdGhpcy5wLnRhcmdldCxcbiAgICAgICAgdHAgPSB0aGlzLnAudGFyZ2V0LnAsXG4gICAgICAgIHR0ID0gY29sbGlzaW9uc1t0cC5hbmltYXRpb25dLnRvcnNvW3RwLmFuaW1hdGlvbkZyYW1lXSxcbiAgICAgICAgdGggPSBjb2xsaXNpb25zW3RwLmFuaW1hdGlvbl0uaGVhZFt0cC5hbmltYXRpb25GcmFtZV0sXG4gICAgICAgIGNyID0gcmVjdCh0aGlzLl9hYnN4KGNvbGwueCwgY29sbC53KSwgdGhpcy5fYWJzeShjb2xsLnkpLCBjb2xsLncsIGNvbGwuaClcbiAgICBcbiAgICBpZihpbnRlcnNlY3RzKHJlY3QodC5fYWJzeCh0dC54LCB0dC53KSwgdC5fYWJzeSh0dC55KSwgdHQudywgdHQuaCksIGNyKSkge1xuICAgICAgcmV0dXJuICd0b3JzbydcbiAgICB9XG5cbiAgICBpZihpbnRlcnNlY3RzKHJlY3QodC5fYWJzeCh0aC54LCB0aC53KSwgdC5fYWJzeSh0aC55KSwgdGgudywgdHQuaCksIGNyKSkge1xuICAgICAgcmV0dXJuICdoZWFkJ1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZVxuICB9LFxuXG4gIGhpdDogZnVuY3Rpb24oZm9yY2UsIGhpdCkge1xuICAgIHRoaXMuc3RhbmQoKVxuICAgIHRoaXMucC5oaXQgPSB0cnVlXG4gICAgaWYoaGl0ID09PSAnaGVhZCcgJiYgTWF0aC5hYnMoZm9yY2UpID4gMzUgJiYgTWF0aC5yYW5kb20oKSA+IC44KSB7XG4gICAgICB0aGlzLnNoZWV0KFwiaGVhZG9mZi1oaXRcIilcbiAgICAgIHRoaXMucGxheSgnaGVhZG9mZmhpdCcsIDEpXG4gICAgICB0aGlzLnN0YWdlLmluc2VydChuZXcgUS5IZWFkKHRoaXMsIGZvcmNlKSlcbiAgICAgIHJldHVybiA0XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucC52eCArPSBmb3JjZVxuICAgICAgdGhpcy5zaGVldChcInRvcnNvLWhpdFwiKVxuICAgICAgdGhpcy5wbGF5KCd0b3Jzb2hpdCcsIDEpXG4gICAgICByZXR1cm4gMVxuICAgIH1cbiAgfSxcblxuICBmaW5pc2hLaWNrczogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5vZmYoJ3N0ZXAnLCB0aGlzLCAnaGl0U3RlcCcpXG4gICAgdGhpcy5vZmYoJ3N0ZXAnLCB0aGlzLCAnZnVqb2dlcmlTdGVwJylcbiAgICB0aGlzLm9mZignc3RlcCcsIHRoaXMsICdmdWpvZ2VyaUZvcndhcmRTdGVwJylcbiAgICB0aGlzLm9mZignc3RlcCcsIHRoaXMsICdzZW50YWlub3RzdWtpU3RlcCcpXG4gICAgdGhpcy5vZmYoJ3ByZXN0ZXAnLCB0aGlzLCAnZmluaXNoS2lja3MnKVxuICB9LFxuXG4gIHN0YW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAuZnJhbWUgPSAwXG4gICAgdGhpcy5wLnZ4ID0gMFxuICAgIHRoaXMucGxheSgnc3RhbmQnLCAxLCB0cnVlKVxuICAgIHRoaXMuc2hlZXQoXCJ0c3Vpc29rdVwiKVxuICAgIHRoaXMucC5qdW1waW5nID0gZmFsc2U7XG4gICAgdGhpcy5wLmF0dGFja2luZyA9IGZhbHNlO1xuICAgIHRoaXMucC53YWxraW5nID0gZmFsc2U7XG4gICAgdGhpcy5wLmhpdCA9IGZhbHNlO1xuICAgIHRoaXMucC50YXJnZXQgPSBudWxsO1xuICAgIHRoaXMub24oJ3ByZXN0ZXAnLCB0aGlzLCAnZmluaXNoS2lja3MnKVxuICB9LFxuXG4gIHByZXN0ZXA6IGZ1bmN0aW9uKHQpIHtcbiAgICBpZih0aGlzLnAuZGlyZWN0aW9uID09PSAnbGVmdCcpIHtcbiAgICAgIHRoaXMuc2V0KHtmbGlwOiAneCd9KVxuICAgICAgdGhpcy5wLmRpciA9IC0xXG4gICAgICB0aGlzLnAub3Bwb3NpdGVEaXJlY3Rpb24gPSAncmlnaHQnXG4gICAgICB0aGlzLnAuY3ggPSAxMlxuICAgIH1cbiAgICBpZih0aGlzLnAuZGlyZWN0aW9uID09PSAncmlnaHQnKSB7XG4gICAgICB0aGlzLnNldCh7ZmxpcDogJyd9KVxuICAgICAgdGhpcy5wLmRpciA9IDFcbiAgICAgIHRoaXMucC5vcHBvc2l0ZURpcmVjdGlvbiA9ICdsZWZ0J1xuICAgICAgdGhpcy5wLmN4ID0gMTBcbiAgICB9XG4gIH1cblxufSk7XG4iLCJ2YXIgUSA9IHJlcXVpcmUoJy4vUScpXG5cblEuR2FtZU9iamVjdC5leHRlbmQoXCJIdWRcIix7XG5cbiAgaW5pdDogXy5vbmNlKGZ1bmN0aW9uKCkge1xuXG4gICAgdGhpcy5lbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgdGhpcy5lbC5jbGFzc05hbWUgPSAnaHVkJ1xuICAgIHRoaXMuZWwuaW5uZXJIVE1MID0gXG4gICAgICAnPGRpdiBjbGFzcz1cImh1ZC1hXCI+PHNwYW4gY2xhc3M9XCJzY29yZSBzY29yZS1hIHNjb3JlLTBcIj48L3NwYW4+PHNwYW4gY2xhc3M9XCJzY29yZS12YWx1ZVwiPjwvc3Bhbj48L2Rpdj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwiaHVkLWJcIj48c3BhbiBjbGFzcz1cInNjb3JlIHNjb3JlLWIgc2NvcmUtMFwiPjwvc3Bhbj48c3BhbiBjbGFzcz1cInNjb3JlLXZhbHVlXCI+PC9zcGFuPjwvZGl2PicgK1xuICAgICAgJzxkaXYgY2xhc3M9XCJodWQtY1wiPjxzcGFuIGNsYXNzPVwic2NvcmUgc2NvcmUtYyBzY29yZS0wXCI+PC9zcGFuPjxzcGFuIGNsYXNzPVwic2NvcmUtdmFsdWVcIj48L3NwYW4+PC9kaXY+J1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5lbClcblxuICAgIHRoaXMuc2NvcmVBID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNjb3JlLWEnKVxuICAgIHRoaXMuc2NvcmVCID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNjb3JlLWInKVxuICAgIHRoaXMuc2NvcmVDID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNjb3JlLWMnKVxuXG4gICAgUS5zdGF0ZS5zZXQoeyBcbiAgICAgICd0b3RhbC1zY29yZS1hJzogMCwgJ3RvdGFsLXNjb3JlLWInOiAwLCAndG90YWwtc2NvcmUtYyc6IDAgXG4gICAgfSk7XG5cbiAgICB0aGlzLnJlc2V0KClcbiAgfSksXG5cbiAgcmVmcmVzaDogZnVuY3Rpb24oKSB7XG4gICAgWydhJywgJ2InLCAnYyddLmZvckVhY2goXy5iaW5kKGZ1bmN0aW9uKGkpIHtcbiAgICAgIHZhciBzY29yZUVsID0gdGhpc1snc2NvcmUnICsgaS50b1VwcGVyQ2FzZSgpXSxcbiAgICAgICAgICBzY29yZVZhbHVlRWwgPSBzY29yZUVsLnBhcmVudE5vZGUucXVlcnlTZWxlY3RvcignLnNjb3JlLXZhbHVlJyksXG4gICAgICAgICAgc2NvcmUgPSBRLnN0YXRlLmdldCgnc2NvcmUtJyArIGkpIHx8IDBcbiAgICAgIHNjb3JlRWwuY2xhc3NOYW1lID0gc2NvcmVFbC5jbGFzc05hbWUucmVwbGFjZSgvc2NvcmUtXFxkL2csICcnKVxuICAgICAgc2NvcmVFbC5jbGFzc0xpc3QuYWRkKCdzY29yZS0nICsgc2NvcmUpXG4gICAgICBzY29yZVZhbHVlRWwuaW5uZXJIVE1MID0gUS5zdGF0ZS5nZXQoJ3RvdGFsLXNjb3JlLScgKyBpKVxuICAgIH0sIHRoaXMpKVxuICB9LFxuXG4gIHJlc2V0OiBmdW5jdGlvbigpIHtcbiAgICBRLnN0YXRlLnNldCh7IFxuICAgICAgJ3Njb3JlLWEnOiAwLCAnc2NvcmUtYic6IDAsICdzY29yZS1jJzogMFxuICAgIH0pO1xuICAgIFEuc3RhdGUub24oXCJjaGFuZ2VcIiwgdGhpcywgJ3JlZnJlc2gnKVxuICAgIHRoaXMucmVmcmVzaCgpXG4gIH1cbn0pXG4iLCJ2YXIgUSA9IHJlcXVpcmUoJy4vUScpXG5cblEuYW5pbWF0aW9ucygnanVkZ2UnLCB7XG4gIHN0YW5kOiB7IGZyYW1lczogWzAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMTNdLCBsb29wOiB0cnVlLCByYXRlOiAxLzEwIH0sXG4gIHdhbGs6IHsgZnJhbWVzOiBfLnJhbmdlKDExKSwgbG9vcDogdHJ1ZSwgcmF0ZTogMS8yMCB9LFxuICB0YWxrOiB7IGZyYW1lczogWzEwLDExLDEyLDExXSwgbG9vcDogdHJ1ZSwgcmF0ZTogMS8xMCAgfVxufSlcblxuUS5Nb3ZpbmdTcHJpdGUuZXh0ZW5kKFwiSnVkZ2VcIiwge1xuICBcbiAgaW5pdDogZnVuY3Rpb24ocCkge1xuICAgIHRoaXMuX3N1cGVyKHAsIHsgXG4gICAgICBzcHJpdGU6IFwianVkZ2VcIixcbiAgICAgIHNoZWV0OiBcImp1ZGdlXCIsXG4gICAgICBzZW5zb3I6IHRydWUsXG4gICAgICBjeDogMTQsXG4gICAgICBzY2FsZTogLjhcbiAgICB9KTtcbiAgICB0aGlzLmFkZCgnMmQsIGFuaW1hdGlvbicpO1xuICAgIHRoaXMuc3RhbmQoKVxuXG4gICAgdGhpcy5vbignc2F5TmV4dCcsIHRoaXMsICdzYXlOZXh0JylcbiAgICBcbiAgICB0aGlzLnRleHRFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgdGhpcy50ZXh0RWwuY2xhc3NOYW1lID0gJ2p1ZGdlbWVudCdcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMudGV4dEVsKVxuXG4gICAgUS5zdGF0ZS5vbihcImNoYW5nZVwiLCB0aGlzLCAnanVkZ2UnKVxuICB9LFxuXG4gIGVudGVyOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAudnggPSAzMFxuICAgIHRoaXMucC5mbGlwID0gXCJcIlxuICAgIHRoaXMucGxheSgnd2FsaycsIDEpXG4gICAgdGhpcy5vbignc3RlcCcsIHRoaXMsICdlbnRlckVuZCcpXG4gIH0sXG5cbiAgZW50ZXJFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMucC54ID4gMTAwKSB7XG4gICAgICB0aGlzLnAudnggPSAwXG4gICAgICB0aGlzLm9mZignc3RlcCcsIHRoaXMsICdlbnRlckVuZCcpXG4gICAgICB0aGlzLnRyaWdnZXIoJ2VudGVyRW5kJylcbiAgICB9XG4gIH0sXG5cbiAgZXhpdDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLnZ4ID0gLTMwXG4gICAgdGhpcy5wLmZsaXAgPSBcInhcIlxuICAgIHRoaXMucGxheSgnd2FsaycsIDEpXG4gICAgdGhpcy5vbignc3RlcCcsIHRoaXMsICdleGl0RW5kJylcbiAgfSxcblxuICBleGl0RW5kOiBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLnAueCA8IDE1KSB7XG4gICAgICB0aGlzLnAudnggPSAwXG4gICAgICB0aGlzLm9mZignc3RlcCcsIHRoaXMsICdleGl0RW5kJylcbiAgICAgIHRoaXMudHJpZ2dlcignZXhpdEVuZCcpXG4gICAgICB0aGlzLnN0YW5kKClcbiAgICB9XG4gIH0sXG5cbiAgc3RhbmQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC5mbGlwID0gXCJcIlxuICAgIHRoaXMucGxheSgnc3RhbmQnLCAxKVxuICAgIHRoaXMub2ZmKCdlbnRlckVuZCcsIHRoaXMsICd0YWxrJylcbiAgICB0aGlzLm9mZigndGFsa0VuZCcsIHRoaXMsICdleGl0JylcbiAgICB0aGlzLm9mZignZXhpdEVuZCcsIHRoaXMsICdzdGFuZCcpXG4gICAgdGhpcy50cmlnZ2VyKCdzdGFuZCcpXG4gIH0sXG5cbiAgc2F5TmV4dDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRleHQgPSBcIlwiO1xuICAgIGlmKHRoaXMucC5zYWlkID09PSAwKSB7IHRleHQgPSBcIlRoZSB3aW5uZXIgaXMge2NvbG9yfS5cIiB9XG4gICAgaWYodGhpcy5wLnNhaWQgPT09IDEpIHsgdGV4dCA9IFwie2NvbG9yfSBpcyBzZWNvbmQuXCIgfVxuICAgIGlmKHRoaXMucC5zYWlkID09PSAyKSB7XG4gICAgICB0ZXh0ID0gXy5zYW1wbGUoW1xuICAgICAgICBbJ3tjb2xvcn0sIHlvdSBiaXRjaC4nLCAne2NvbG9yfS4uLiByZWFsbHk/JywgJ2p1c3QuLi4ganVzdCBkb25cXCd0LCB7Y29sb3J9LiddLFxuICAgICAgICBbJ3tjb2xvcn0sIHlvdSBjYW4gc3RvcCBub3cuJywgJ3tjb2xvcn0sIHlvdSBjYW4gZG8gYmV0dGVyLicsICdDXFwnbW9uIHtjb2xvcn0nXSxcbiAgICAgICAgWyd7Y29sb3J9LCBhbG1vc3QgdGhlcmUuJywgJ21heWJlIG5leHQgdGltZSB0cnkgdG8gZG8gYmV0dGVyIHtjb2xvcn0uJ10sXG4gICAgICAgIFsnVG91Z2ggbHVjayB7Y29sb3J9LiddXG4gICAgICBdW3RoaXMucC5yZXN1bHRbdGhpcy5wLnNhaWRdLnNjb3JlXSlcbiAgICB9XG4gICAgdGhpcy50ZXh0RWwuaW5uZXJIVE1MID0gdGV4dC5yZXBsYWNlKCd7Y29sb3J9JywgdGhpcy5wLnJlc3VsdFt0aGlzLnAuc2FpZF0gPyB0aGlzLnAucmVzdWx0W3RoaXMucC5zYWlkXS5jb2xvciA6IFwiXCIpXG4gICAgdGhpcy5wLnNhaWQgKz0gMVxuICAgIGlmKHRoaXMucC5zYWlkID4gMykge1xuICAgICAgdGhpcy5leGl0KClcbiAgICAgIHRoaXMudHJpZ2dlcigndGFsa0VuZCcpXG4gICAgfSBlbHNlIHtcbiAgICAgIF8uZGVsYXkoXy5iaW5kKHRoaXMudHJpZ2dlciwgdGhpcywgJ3NheU5leHQnKSwgMjUwMClcbiAgICB9XG4gIH0sXG5cbiAgdGFsazogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wbGF5KCd0YWxrJywgMSlcbiAgICB0aGlzLnAuc2FpZCA9IDBcbiAgICB0aGlzLnNheU5leHQoKVxuICB9LFxuXG4gIGp1ZGdlOiBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLnAuYW5pbWF0aW9uICE9ICdzdGFuZCcpIHJldHVybjtcbiAgICB0aGlzLnAucmVzdWx0ID0gXy5zb3J0QnkoW1xuICAgICAge2k6ICdhJywgc2NvcmU6IFEuc3RhdGUuZ2V0KCdzY29yZS1hJyksIGNvbG9yOiAnb3JhbmdlJ30sXG4gICAgICB7aTogJ2InLCBzY29yZTogUS5zdGF0ZS5nZXQoJ3Njb3JlLWInKSwgY29sb3I6ICdibHVlJ30sXG4gICAgICB7aTogJ2MnLCBzY29yZTogUS5zdGF0ZS5nZXQoJ3Njb3JlLWMnKSwgY29sb3I6ICdncmVlbid9XG4gICAgXSwgJ3Njb3JlJykucmV2ZXJzZSgpXG4gICAgaWYodGhpcy5wLnJlc3VsdFswXS5zY29yZSA9PT0gNCkge1xuICAgICAgdGhpcy5lbnRlcigpXG4gICAgICB0aGlzLm9uKCdlbnRlckVuZCcsIHRoaXMsICd0YWxrJylcbiAgICAgIHRoaXMub24oJ3RhbGtFbmQnLCB0aGlzLCAnZXhpdCcpXG4gICAgICB0aGlzLm9uKCdleGl0RW5kJywgdGhpcywgJ3N0YW5kJylcbiAgICB9XG4gIH1cblxufSlcbiIsInZhciBRID0gcmVxdWlyZSgnLi9RJyksXG4gICAgR2VyaU1vbiA9IHJlcXVpcmUoJy4vR2VyaU1vbicpXG5cblEuR2VyaU1vbi5leHRlbmQoXCJQbGF5ZXJcIix7XG4gIGluaXQ6IGZ1bmN0aW9uKHApIHtcbiAgICB0aGlzLl9zdXBlcihwLCB7fSk7XG5cbiAgICB0aGlzLnAuZGlyZWN0aW9uID0gJ3JpZ2h0J1xuICAgIFxuICAgIC8vIFEuaW5wdXQub24oXCJmaXJlXCIsIHRoaXMsICdmaXJlJyk7XG4gICAgdGhpcy5vbihcInByZXN0ZXBcIiwgdGhpcywgJ2F0dGFjaycpO1xuICAgIHRoaXMub24oXCJwcmVzdGVwXCIsIHRoaXMsICd1bnNva3UnKTtcbiAgfSxcblxuICBhdHRhY2s6IGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMucC5wYXVzZWQpIHJldHVybjtcbiAgICBcbiAgICBpZighUS5pbnB1dHMuZmlyZSkgcmV0dXJuXG5cbiAgICB2YXIgdGFyZ2V0LCB0RGlzdCA9IEluZmluaXR5LCBkaXN0O1xuICAgIGZvcih2YXIgaT0wOyBpPHRoaXMuaW5zdGFuY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZih0aGlzLmluc3RhbmNlc1tpXSAhPSB0aGlzKSB7XG4gICAgICAgIGRpc3QgPSBNYXRoLmFicyh0aGlzLnAueCAtIHRoaXMuaW5zdGFuY2VzW2ldLnAueClcbiAgICAgICAgaWYoZGlzdCA8IHREaXN0KSB7XG4gICAgICAgICAgdGFyZ2V0ID0gdGhpcy5pbnN0YW5jZXNbaV1cbiAgICAgICAgICB0RGlzdCA9IGRpc3RcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChRLmlucHV0cy51cCAmJiBRLmlucHV0c1t0aGlzLnAuZGlyZWN0aW9uXSkge1xuICAgICAgdGhpcy5mdWpvZ2VyaUZvcndhcmQodGFyZ2V0KVxuICAgIH1cblxuICAgIGlmIChRLmlucHV0cy51cCkge1xuICAgICAgdGhpcy5mdWpvZ2VyaSh0YXJnZXQpXG4gICAgfVxuXG4gICAgaWYgKFEuaW5wdXRzLmRvd24gJiYgUS5pbnB1dHNbdGhpcy5wLm9wcG9zaXRlRGlyZWN0aW9uXSkge1xuICAgICAgdGhpcy5oYW5nZXRzdWF0ZSh0YXJnZXQpXG4gICAgfVxuXG4gICAgaWYgKFEuaW5wdXRzLmRvd24gJiYgUS5pbnB1dHNbdGhpcy5wLmRpcmVjdGlvbl0pIHtcbiAgICAgIHRoaXMuc2VudGFpbm90c3VraSh0YXJnZXQpXG4gICAgfVxuXG4gICAgaWYgKFEuaW5wdXRzLmRvd24pIHtcbiAgICAgIHRoaXMubWFuamlnZXJpKHRhcmdldClcbiAgICB9XG5cbiAgICBpZiAoUS5pbnB1dHNbdGhpcy5wLmRpcmVjdGlvbl0pIHtcbiAgICAgIHRoaXMuc3VpaGVpZ2VyaSh0YXJnZXQpXG4gICAgfVxuXG4gICAgaWYgKFEuaW5wdXRzW3RoaXMucC5vcHBvc2l0ZURpcmVjdGlvbl0pIHtcbiAgICAgIHRoaXMuc2Vuc29nZXJpKHRhcmdldClcbiAgICB9XG5cbiAgfSxcblxuICB1bnNva3U6IGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMucC5wYXVzZWQpIHJldHVybjtcblxuICAgIGlmKFEuaW5wdXRzLmZpcmUpIHJldHVyblxuXG4gICAgaWYoUS5pbnB1dHMuYWN0aW9uKSB7XG4gICAgXG4gICAgICB0aGlzLnVzaGlybygpXG4gICAgXG4gICAgfSBlbHNlIHtcblxuICAgICAgaWYoUS5pbnB1dHMudXApIHtcbiAgICAgICAgdGhpcy5rb3Nva3UoKVxuICAgICAgfVxuXG4gICAgICBpZihRLmlucHV0cy5kb3duKSB7XG4gICAgICAgIHRoaXMuZ2Vuc29rdSgpIFxuICAgICAgfVxuXG4gICAgICAvL2ZvcndhcmRcbiAgICAgIGlmKFEuaW5wdXRzW3RoaXMucC5kaXJlY3Rpb25dKSB7XG4gICAgICAgIHRoaXMubmlub2FzaGkoKSBcbiAgICAgICAgaWYodGhpcy5wLmFuaW1hdGlvbiA9PT0gJ25pbm9hc2hpJyAmJiB0aGlzLnAuYW5pbWF0aW9uRnJhbWUgPiAxKSB7XG4gICAgICAgICAgdGhpcy5zdGFuZCgpXG4gICAgICAgICAgdGhpcy50c3Vpc29rdSgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vYmFja3dhcmRcbiAgICAgIGlmKFEuaW5wdXRzW3RoaXMucC5kaXJlY3Rpb24gPT09ICdsZWZ0JyA/ICdyaWdodCcgOiAnbGVmdCddKSB7XG4gICAgICAgIHRoaXMudGFpc29rdSgpXG4gICAgICB9XG5cbiAgICB9XG5cbiAgICBcbiAgfVxuXG59KTtcbiIsIlxudmFyIFEgPSBRdWludHVzKHtpbWFnZVBhdGg6ICcnfSlcbiAgLmluY2x1ZGUoXCJTcHJpdGVzLCBTY2VuZXMsIElucHV0LCAyRCwgVG91Y2gsIFVJLCBBbmltXCIpXG4gIC5zZXR1cCh7IG1heGltaXplOiB0cnVlIH0pXG4gIC5jb250cm9scygpXG4gIC50b3VjaCgpO1xuXG5RLkV2ZW50ZWQucHJvdG90eXBlLl90cmlnZ2VyID0gUS5FdmVudGVkLnByb3RvdHlwZS50cmlnZ2VyXG5RLkV2ZW50ZWQucHJvdG90eXBlLnRyaWdnZXIgID0gZnVuY3Rpb24oZXZlbnQsZGF0YSkge1xuICAvLyBGaXJzdCBtYWtlIHN1cmUgdGhlcmUgYXJlIGFueSBsaXN0ZW5lcnMsIHRoZW4gY2hlY2sgZm9yIGFueSBsaXN0ZW5lcnNcbiAgLy8gb24gdGhpcyBzcGVjaWZpYyBldmVudCwgaWYgbm90LCBlYXJseSBvdXQuXG4gIGlmKHRoaXMubGlzdGVuZXJzICYmIHRoaXMubGlzdGVuZXJzW2V2ZW50XSkge1xuICAgIC8vIENhbGwgZWFjaCBsaXN0ZW5lciBpbiB0aGUgY29udGV4dCBvZiBlaXRoZXIgdGhlIHRhcmdldCBwYXNzZWQgaW50b1xuICAgIC8vIGBvbmAgb3IgdGhlIG9iamVjdCBpdHNlbGYuXG4gICAgdmFyIGksIGwgPSBuZXcgQXJyYXkodGhpcy5saXN0ZW5lcnNbZXZlbnRdLmxlbmd0aCksIGxlblxuICAgIGZvcihpPTAsbGVuID0gdGhpcy5saXN0ZW5lcnNbZXZlbnRdLmxlbmd0aDtpPGxlbjtpKyspIHtcbiAgICAgIGxbaV0gPSBbXG4gICAgICAgIHRoaXMubGlzdGVuZXJzW2V2ZW50XVtpXVswXSwgXG4gICAgICAgIHRoaXMubGlzdGVuZXJzW2V2ZW50XVtpXVsxXVxuICAgICAgXVxuICAgIH1cbiAgICBmb3IoaT0wLGxlbiA9IGwubGVuZ3RoO2k8bGVuO2krKykge1xuICAgICAgdmFyIGxpc3RlbmVyID0gbFtpXTtcbiAgICAgIGxpc3RlbmVyWzFdLmNhbGwobGlzdGVuZXJbMF0sZGF0YSk7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUVxuIiwidmFyIFEgPSByZXF1aXJlKCcuL1EnKVxuXG5cblxuZnVuY3Rpb24gY29sbGlzaW9ucyhuYW1lLCBhc3NldCwgc2l6ZSkge1xuICBpZighUS5hc3NldChhc3NldCkpIHsgdGhyb3cgXCJJbnZhbGlkIEFzc2V0OlwiICsgYXNzZXQ7IH1cbiAgXG4gIGV4cG9ydHMuY29sbGlzaW9uc1tuYW1lXSA9IHsgaGVhZDogW10sIHRvcnNvOiBbXSwgaGl0OiBbXSB9XG5cbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLFxuICAgICAgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpLFxuICAgICAgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyksXG4gICAgICBpbWdEYXRhLFxuICAgICAgaGVhZCA9IDE1MCxcbiAgICAgIHRvcnNvID0gMjAwLFxuICAgICAgaGl0ID0gMTAwXG4gIFxuICBpbWcuc3JjID0gYXNzZXQ7XG4gIGNhbnZhcy53aWR0aCA9IGltZy53aWR0aFxuICBjYW52YXMuaGVpZ2h0ID0gaW1nLmhlaWdodFxuICBjb250ZXh0LmRyYXdJbWFnZShpbWcsIDAsIDApO1xuICBcbiAgZnVuY3Rpb24gZmluZChpbWdEYXRhLCByY29sb3IpIHtcbiAgICB2YXIgYSA9IEFycmF5LnByb3RvdHlwZS5pbmRleE9mLmNhbGwoaW1nRGF0YS5kYXRhLCByY29sb3IpIC8gNCxcbiAgICAgICAgYiA9IEFycmF5LnByb3RvdHlwZS5sYXN0SW5kZXhPZi5jYWxsKGltZ0RhdGEuZGF0YSwgcmNvbG9yKSAvIDQsXG4gICAgICAgIGMgPSB7fVxuICAgIGlmKGEgPCAtMSkgcmV0dXJuIGNcbiAgICBjLnggPSBhICUgc2l6ZS50aWxld1xuICAgIGMueSA9IE1hdGguZmxvb3IoYSAvIHNpemUudGlsZXcpXG4gICAgYy53ID0gYiAlIHNpemUudGlsZXcgLSBjLnhcbiAgICBjLmggPSBNYXRoLmZsb29yKGIgLyBzaXplLnRpbGV3KSAtIGMueVxuICAgIHJldHVybiBjXG4gIH1cblxuICBmb3IodmFyIHggPSAwOyB4IDwgaW1nLndpZHRoOyB4Kz1zaXplLnRpbGV3KSB7XG4gICAgaW1nRGF0YSA9IGNvbnRleHQuZ2V0SW1hZ2VEYXRhKHgsIDAsIHNpemUudGlsZXcsIHNpemUudGlsZWgpO1xuICAgIGV4cG9ydHMuY29sbGlzaW9uc1tuYW1lXS5oZWFkLnB1c2goZmluZChpbWdEYXRhLCBoZWFkKSlcbiAgICBleHBvcnRzLmNvbGxpc2lvbnNbbmFtZV0udG9yc28ucHVzaChmaW5kKGltZ0RhdGEsIHRvcnNvKSlcbiAgICBleHBvcnRzLmNvbGxpc2lvbnNbbmFtZV0uaGl0LnB1c2goZmluZChpbWdEYXRhLCBoaXQpKVxuICB9XG59XG5leHBvcnRzLmNvbGxpc2lvbnMgPSB7fVxuXG5cblxuXG5mdW5jdGlvbiBjb2xvcml6ZShhc3NldCwgY29sb3IpIHtcbiAgaWYoIVEuYXNzZXQoYXNzZXQpKSB7IHRocm93IFwiSW52YWxpZCBBc3NldDpcIiArIGFzc2V0OyB9XG5cbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLFxuICAgICAgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpLFxuICAgICAgaW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyksXG4gICAgICBpbWdEYXRhLFxuICAgICAgY29sRGF0YSxcbiAgICAgIGNvbEltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG4gIFxuICBpbWcuc3JjID0gYXNzZXQ7XG4gIGNhbnZhcy53aWR0aCA9IGltZy53aWR0aFxuICBjYW52YXMuaGVpZ2h0ID0gaW1nLmhlaWdodFxuICBjb250ZXh0LmRyYXdJbWFnZShpbWcsIDAsIDApO1xuICBpbWdEYXRhID0gY29udGV4dC5nZXRJbWFnZURhdGEoMCwgMCwgaW1nLndpZHRoLCBpbWcuaGVpZ2h0KVxuICBjb2xEYXRhID0gY29udGV4dC5jcmVhdGVJbWFnZURhdGEoaW1nLndpZHRoLCBpbWcuaGVpZ2h0KVxuXG4gIGZ1bmN0aW9uIHNldENvbG9yKGMsIGQsIGkpIHsgZFtpKzBdID0gY1swXTsgZFtpKzFdID0gY1sxXTsgZFtpKzJdID0gY1syXTsgZFtpKzNdID0gY1szXSB9XG4gIGZ1bmN0aW9uIGdldENvbG9yKGQsIGkpIHsgcmV0dXJuIFtkW2krMF0sIGRbaSsxXSwgZFtpKzJdLCBkW2krM11dIH1cbiAgZnVuY3Rpb24gcHJldkNvbG9yKGQsIGkpIHsgcmV0dXJuIFtkW2ktNF0sIGRbaS0zXSwgZFtpLTJdLCBkW2ktMV1dIH1cbiAgZnVuY3Rpb24gbmV4dENvbG9yKGQsIGkpIHsgcmV0dXJuIFtkW2krNF0sIGRbaSs1XSwgZFtpKzZdLCBkW2krN11dIH1cbiAgZnVuY3Rpb24gdHJhbnNwYXJlbnQoYykgeyByZXR1cm4gY1swXSA9PT0gMCAmJiBjWzFdID09PSAwICYmIGNbMl0gPT09IDAgJiYgY1szXSA9PT0gMCB9XG4gIGZ1bmN0aW9uIGRhcmsxKGMpIHsgcmV0dXJuIFtjWzBdIC0gIDUsIGNbMV0gLSAgNSwgY1syXSAtICA1LCBjWzNdXSB9XG4gIGZ1bmN0aW9uIGRhcmsyKGMpIHsgcmV0dXJuIFtjWzBdIC0gMTAsIGNbMV0gLSAxMCwgY1syXSAtIDEwLCBjWzNdXSB9XG4gIGZ1bmN0aW9uIGRhcmszKGMpIHsgcmV0dXJuIFtjWzBdIC0gODAsIGNbMV0gLSA4MCwgY1syXSAtIDgwLCBjWzNdXSB9XG4gIGZ1bmN0aW9uIGxpZ2h0ZW4oYykgeyByZXR1cm4gW2NbMF0gKyAzMCwgY1sxXSArIDMwLCBjWzJdICsgMzAsIGNbM11dIH1cbiAgXG4gIGZvciAodmFyIGk9MCwgYzsgaTxpbWdEYXRhLmRhdGEubGVuZ3RoOyBpKz00KSB7XG4gICAgYyA9IGdldENvbG9yKGltZ0RhdGEuZGF0YSwgaSlcbiAgICBzZXRDb2xvcihsaWdodGVuKGMpLCBjb2xEYXRhLmRhdGEsIGkpXG4gICAgaWYgKCF0cmFuc3BhcmVudChjKSkge1xuICAgICAgaWYgKHRyYW5zcGFyZW50KHByZXZDb2xvcihpbWdEYXRhLmRhdGEsIGktMSkpKSB7XG4gICAgICAgIHNldENvbG9yKGRhcmsxKGMpLCBjb2xEYXRhLmRhdGEsIGkpXG4gICAgICB9XG4gICAgICBpZiAodHJhbnNwYXJlbnQocHJldkNvbG9yKGltZ0RhdGEuZGF0YSwgaSkpKSB7XG4gICAgICAgIHNldENvbG9yKGRhcmsyKGMpLCBjb2xEYXRhLmRhdGEsIGkpXG4gICAgICB9XG4gICAgICBpZiAodHJhbnNwYXJlbnQobmV4dENvbG9yKGltZ0RhdGEuZGF0YSwgaSkpKSB7XG4gICAgICAgIHNldENvbG9yKGRhcmszKGNvbG9yKSwgY29sRGF0YS5kYXRhLCBpKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnRleHQucHV0SW1hZ2VEYXRhKGNvbERhdGEsIDAsIDApO1xuICBjb2xJbWcuc3JjID0gY2FudmFzLnRvRGF0YVVSTChcImltYWdlL3BuZ1wiKTtcbiAgcmV0dXJuIGNvbEltZ1xufVxuXG5cbmV4cG9ydHMubG9hZCA9IGZ1bmN0aW9uKGNiKSB7XG5cbiAgdmFyIHBsYXllckFzc2V0cyA9IFtcbiAgICBcInN1aWhlaWdlcmlcIixcbiAgICBcIm1hbmppZ2VyaVwiLFxuICAgIFwidHN1aXNva3VcIixcbiAgICBcInVzaGlyb1wiLFxuICAgIFwia29zb2t1XCIsXG4gICAgXCJuaW5vYXNoaVwiLFxuICAgIFwiZnVqb2dlcmlcIixcbiAgICBcInNlbnNvZ2VyaVwiLFxuICAgIFwic2VudGFpbm90c3VraVwiLFxuICAgIFwiaGFuZ2V0c3VhdGVcIixcbiAgICBcInRvcnNvLWhpdFwiLFxuICAgIFwiaGVhZG9mZi1oaXRcIl1cblxuICBRLmxvYWQoXG4gICAgXy5mbGF0dGVuKFtcbiAgICBcbiAgICAgIFtcImFzc2V0cy9iZy0xLnBuZ1wiLFxuICAgICAgXCJhc3NldHMvdGlsZXMucG5nXCIsXG4gICAgICBcImFzc2V0cy9qdWRnZS5wbmdcIl0sXG5cbiAgICAgIF8ubWFwKHBsYXllckFzc2V0cywgZnVuY3Rpb24obmFtZSkge1xuICAgICAgICByZXR1cm4gXCJhc3NldHMvXCIgKyBuYW1lICsgXCIucG5nXCJcbiAgICAgIH0pLFxuXG4gICAgICBfLm1hcChfLndpdGhvdXQocGxheWVyQXNzZXRzLCBcInRvcnNvLWhpdFwiLCBcImhlYWRvZmYtaGl0XCIpLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHJldHVybiBcImFzc2V0cy9cIiArIG5hbWUgKyBcIi1jb2xsaXNpb25zLnBuZ1wiXG4gICAgICB9KVxuXG4gICAgXSksIGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHBsYXllclRpbGUgPSB7IHRpbGV3OiA0OCwgdGlsZWg6IDMyIH1cbiAgICBRLnNoZWV0KFwidGlsZXNcIixcImFzc2V0cy90aWxlcy5wbmdcIiwgeyB0aWxldzogMzIsIHRpbGVoOiA4IH0pO1xuICAgIFEuc2hlZXQoXCJqdWRnZVwiLCBcImFzc2V0cy9qdWRnZS5wbmdcIiwge3RpbGV3OiAzMiwgdGlsZWg6IDMyfSk7XG5cbiAgICBfLmVhY2gocGxheWVyQXNzZXRzLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICBRLmFzc2V0c1tcImFzc2V0cy9cIiArIG5hbWUgKyBcIi1hLnBuZ1wiXSA9IGNvbG9yaXplKFwiYXNzZXRzL1wiICsgbmFtZSArIFwiLnBuZ1wiLCBbMjQwLCAxMjEsIDAsIDI1NV0pO1xuICAgICAgUS5hc3NldHNbXCJhc3NldHMvXCIgKyBuYW1lICsgXCItYi5wbmdcIl0gPSBjb2xvcml6ZShcImFzc2V0cy9cIiArIG5hbWUgKyBcIi5wbmdcIiwgWzEwMiwgMTUzLCAyNTUsIDI1NV0pO1xuICAgICAgUS5hc3NldHNbXCJhc3NldHMvXCIgKyBuYW1lICsgXCItYy5wbmdcIl0gPSBjb2xvcml6ZShcImFzc2V0cy9cIiArIG5hbWUgKyBcIi5wbmdcIiwgWzY4LCAyMjEsIDg1LCAyNTVdKTtcbiAgICAgIFEuc2hlZXQobmFtZSArICctYScsIFwiYXNzZXRzL1wiICsgbmFtZSArIFwiLWEucG5nXCIsIHBsYXllclRpbGUpO1xuICAgICAgUS5zaGVldChuYW1lICsgJy1iJywgXCJhc3NldHMvXCIgKyBuYW1lICsgXCItYi5wbmdcIiwgcGxheWVyVGlsZSk7XG4gICAgICBRLnNoZWV0KG5hbWUgKyAnLWMnLCBcImFzc2V0cy9cIiArIG5hbWUgKyBcIi1jLnBuZ1wiLCBwbGF5ZXJUaWxlKTtcbiAgICB9KVxuXG4gICAgXy5lYWNoKF8ud2l0aG91dChwbGF5ZXJBc3NldHMsIFwidG9yc28taGl0XCIsIFwiaGVhZG9mZi1oaXRcIiksIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIGNvbGxpc2lvbnMobmFtZSwgXCJhc3NldHMvXCIgKyBuYW1lICsgXCItY29sbGlzaW9ucy5wbmdcIiwgcGxheWVyVGlsZSlcbiAgICB9KVxuXG4gICAgZXhwb3J0cy5jb2xsaXNpb25zLnN0YW5kID0ge1xuICAgICAgaGVhZDogW2V4cG9ydHMuY29sbGlzaW9ucy50c3Vpc29rdS5oZWFkWzBdXSxcbiAgICAgIHRvcnNvOiBbZXhwb3J0cy5jb2xsaXNpb25zLnRzdWlzb2t1LnRvcnNvWzBdXSxcbiAgICAgIGhpdDogW2V4cG9ydHMuY29sbGlzaW9ucy50c3Vpc29rdS5oaXRbMF1dXG4gICAgfVxuICAgIGV4cG9ydHMuY29sbGlzaW9ucy50YWlzb2t1ID0ge1xuICAgICAgaGVhZDogW10uY29uY2F0KGV4cG9ydHMuY29sbGlzaW9ucy50c3Vpc29rdS5oZWFkKS5yZXZlcnNlKCksXG4gICAgICB0b3JzbzogW10uY29uY2F0KGV4cG9ydHMuY29sbGlzaW9ucy50c3Vpc29rdS50b3JzbykucmV2ZXJzZSgpLFxuICAgICAgaGl0OiBbXS5jb25jYXQoZXhwb3J0cy5jb2xsaXNpb25zLnRzdWlzb2t1LmhpdCkucmV2ZXJzZSgpXG4gICAgfVxuXG4gICAgY2IoKVxuICB9KTtcblxufVxuIiwidmFyIFEgPSByZXF1aXJlKCcuL1EnKSxcbiAgICBhc3NldHMgPSByZXF1aXJlKCcuL2Fzc2V0cycpXG5yZXF1aXJlKCcuL1BsYXllcicpXG5yZXF1aXJlKCcuL0F1dG9QbGF5ZXInKVxucmVxdWlyZSgnLi9BbmltUGxheWVyJylcbnJlcXVpcmUoJy4vSHVkJylcbnJlcXVpcmUoJy4vSnVkZ2UnKVxuXG52YXIgbGV2ZWwgPSBuZXcgUS5UaWxlTGF5ZXIoe1xuIHRpbGVzOiBbXG4gbmV3IEFycmF5KDEyKS5qb2luKCcwJykuc3BsaXQoJycpLFxuIG5ldyBBcnJheSgxMikuam9pbignMCcpLnNwbGl0KCcnKSxcbiBuZXcgQXJyYXkoMTIpLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gbmV3IEFycmF5KDEyKS5qb2luKCcwJykuc3BsaXQoJycpLFxuIG5ldyBBcnJheSgxMikuam9pbignMCcpLnNwbGl0KCcnKSxcbiBuZXcgQXJyYXkoMTIpLmpvaW4oJzEnKS5zcGxpdCgnJylcbiBdLCBzaGVldDogJ3RpbGVzJyBcbn0pXG5cblEuc2NlbmUoJ2JnJywgZnVuY3Rpb24oc3RhZ2UpIHtcbiAgdmFyIGJnID0gc3RhZ2UuaW5zZXJ0KG5ldyBRLlNwcml0ZSh7XG4gICAgYXNzZXQ6IFwiYXNzZXRzL2JnLTEucG5nXCIsXG4gICAgc2NhbGU6IDcwNC85MDBcbiAgfSkpXG4gIGJnLmNlbnRlcigpXG4gIGJnLnAueSA9IDI3MFxuICBzdGFnZS5vbihcImRlc3Ryb3lcIixmdW5jdGlvbigpIHtcbiAgICBqdWRnZS5kZXN0cm95KClcbiAgfSk7XG59KVxuXG5RLnNjZW5lKFwiYW5pbXNcIiwgZnVuY3Rpb24oc3RhZ2UpIHtcbiAgdmFyIGxheWVyID0gc3RhZ2UuY29sbGlzaW9uTGF5ZXIobGV2ZWwpO1xuICB2YXIgcGxheWVyYSA9IHN0YWdlLmluc2VydChuZXcgUS5BbmltUGxheWVyKHt4OiA2NCwgeTogNSozMn0pKVxuICB2YXIganVkZ2UgPSBzdGFnZS5pbnNlcnQobmV3IFEuSnVkZ2Uoe3g6IDI0LCB5OiA1KjMyfSkpXG4gIHN0YWdlLmFkZChcInZpZXdwb3J0XCIpLy8ubW92ZVRvKC13aW5kb3cuaW5uZXJXaWR0aC80LCAtd2luZG93LmlubmVySGVpZ2h0LzQpXG4gIHN0YWdlLnZpZXdwb3J0LnNjYWxlID0gMlxuICBzdGFnZS52aWV3cG9ydC5jZW50ZXJPbihsYXllci5wLncvMiwgbGF5ZXIucC5oLzIpXG4gIHN0YWdlLm9uKFwiZGVzdHJveVwiLGZ1bmN0aW9uKCkge1xuICAgIHBsYXllcmEuZGVzdHJveSgpO1xuICAgIGp1ZGdlLmRlc3Ryb3koKVxuICB9KTtcbn0pXG5cblEuc2NlbmUoXCJhdXRvcGxheVwiLCBmdW5jdGlvbihzdGFnZSkge1xuICB2YXIgbGF5ZXIgPSBzdGFnZS5jb2xsaXNpb25MYXllcihsZXZlbCk7XG4gIHZhciBwbGF5ZXJhID0gc3RhZ2UuaW5zZXJ0KG5ldyBRLkF1dG9QbGF5ZXIoKSlcbiAgdmFyIHBsYXllcmIgPSBzdGFnZS5pbnNlcnQobmV3IFEuQXV0b1BsYXllcigpKVxuICB2YXIgcGxheWVyYyA9IHN0YWdlLmluc2VydChuZXcgUS5BdXRvUGxheWVyKCkpO1xuICB2YXIganVkZ2UgPSBzdGFnZS5pbnNlcnQobmV3IFEuSnVkZ2Uoe3g6IDI0LCB5OiA1KjMyfSkpXG4gIHN0YWdlLmFkZChcInZpZXdwb3J0XCIpXG4gIHN0YWdlLnZpZXdwb3J0LnNjYWxlID0gMlxuICBzdGFnZS52aWV3cG9ydC5jZW50ZXJPbihsYXllci5wLncvMiwgbGF5ZXIucC5oLzIpXG4gIHN0YWdlLm9uKFwiZGVzdHJveVwiLGZ1bmN0aW9uKCkge1xuICAgIHBsYXllcmEuZGVzdHJveSgpO1xuICAgIHBsYXllcmIuZGVzdHJveSgpO1xuICAgIHBsYXllcmMuZGVzdHJveSgpO1xuICAgIGp1ZGdlLmRlc3Ryb3koKVxuICB9KTtcbiAgUS5zdGF0ZS5vbignY2hhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgaWYoUS5zdGF0ZS5nZXQoJ3Njb3JlLWEnKSA9PSA0IHx8IFEuc3RhdGUuZ2V0KCdzY29yZS1iJykgPT0gNCB8fCBRLnN0YXRlLmdldCgnc2NvcmUtYycpID09IDQpIHtcbiAgICAgIF8uaW52b2tlKFtwbGF5ZXJhLCBwbGF5ZXJiLCBwbGF5ZXJjXSwgJ3BhdXNlJylcbiAgICB9XG4gIH0pXG4gIGZ1bmN0aW9uIG5ld1JvdW5kKCkge1xuICAgIGh1ZC5yZXNldCgpXG4gICAgcGxheWVyYS5zZXQoe3g6IDY0LCB5OiA1KjMyfSlcbiAgICBwbGF5ZXJiLnNldCh7eDogMTY4LCB5OiA1KjMyfSlcbiAgICBwbGF5ZXJjLnNldCh7eDogMjU2LCB5OiA1KjMyfSlcbiAgICBfLmludm9rZShbcGxheWVyYSwgcGxheWVyYiwgcGxheWVyY10sICd1bnBhdXNlJylcbiAgfVxuICBqdWRnZS5vbigndGFsa0VuZCcsIG5ld1JvdW5kKVxuICBuZXdSb3VuZCgpXG59KVxuXG5RLnNjZW5lKFwicGxheS0xb24xXCIsIGZ1bmN0aW9uKHN0YWdlKSB7XG4gIHZhciBsYXllciA9IHN0YWdlLmNvbGxpc2lvbkxheWVyKGxldmVsKTtcbiAgdmFyIHBsYXllcmEgPSBzdGFnZS5pbnNlcnQobmV3IFEuUGxheWVyKCkpXG4gIHZhciBwbGF5ZXJiID0gc3RhZ2UuaW5zZXJ0KG5ldyBRLkF1dG9QbGF5ZXIoKSlcbiAgdmFyIGp1ZGdlID0gc3RhZ2UuaW5zZXJ0KG5ldyBRLkp1ZGdlKHt4OiAyNCwgeTogNSozMn0pKVxuICBzdGFnZS5hZGQoXCJ2aWV3cG9ydFwiKVxuICBzdGFnZS52aWV3cG9ydC5zY2FsZSA9IDJcbiAgc3RhZ2Uudmlld3BvcnQuY2VudGVyT24obGF5ZXIucC53LzIsIGxheWVyLnAuaC8yKVxuICBzdGFnZS5vbihcImRlc3Ryb3lcIixmdW5jdGlvbigpIHtcbiAgICBwbGF5ZXJhLmRlc3Ryb3koKTtcbiAgICBwbGF5ZXJiLmRlc3Ryb3koKTtcbiAgICBqdWRnZS5kZXN0cm95KCk7XG4gICAgbGF5ZXIuZGVzdHJveSgpO1xuICB9KTtcbiAgUS5zdGF0ZS5vbignY2hhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgaWYoUS5zdGF0ZS5nZXQoJ3Njb3JlLWEnKSA9PSA0IHx8IFEuc3RhdGUuZ2V0KCdzY29yZS1iJykgPT0gNCkge1xuICAgICAgXy5pbnZva2UoW3BsYXllcmEsIHBsYXllcmJdLCAncGF1c2UnKVxuICAgIH1cbiAgfSlcbiAgZnVuY3Rpb24gbmV3Um91bmQoKSB7XG4gICAgaHVkLnJlc2V0KClcbiAgICBwbGF5ZXJhLnNldCh7eDogNjQsIHk6IDUqMzJ9KVxuICAgIHBsYXllcmIuc2V0KHt4OiAxNjgsIHk6IDUqMzJ9KVxuICAgIF8uaW52b2tlKFtwbGF5ZXJhLCBwbGF5ZXJiXSwgJ3VucGF1c2UnKVxuICB9XG4gIGp1ZGdlLm9uKCd0YWxrRW5kJywgbmV3Um91bmQpXG4gIG5ld1JvdW5kKClcbn0pXG5cblEuc2NlbmUoXCJwbGF5LTFvbjJcIiwgZnVuY3Rpb24oc3RhZ2UpIHtcbiAgdmFyIGxheWVyID0gc3RhZ2UuY29sbGlzaW9uTGF5ZXIobGV2ZWwpO1xuICB2YXIgcGxheWVyYSA9IHN0YWdlLmluc2VydChuZXcgUS5QbGF5ZXIoKSlcbiAgdmFyIHBsYXllcmIgPSBzdGFnZS5pbnNlcnQobmV3IFEuQXV0b1BsYXllcigpKVxuICB2YXIgcGxheWVyYyA9IHN0YWdlLmluc2VydChuZXcgUS5BdXRvUGxheWVyKCkpXG4gIHZhciBqdWRnZSA9IHN0YWdlLmluc2VydChuZXcgUS5KdWRnZSh7eDogMjQsIHk6IDUqMzJ9KSlcbiAgc3RhZ2UuYWRkKFwidmlld3BvcnRcIilcbiAgc3RhZ2Uudmlld3BvcnQuc2NhbGUgPSAyXG4gIHN0YWdlLnZpZXdwb3J0LmNlbnRlck9uKGxheWVyLnAudy8yLCBsYXllci5wLmgvMilcbiAgc3RhZ2Uub24oXCJkZXN0cm95XCIsZnVuY3Rpb24oKSB7XG4gICAgcGxheWVyYS5kZXN0cm95KCk7XG4gICAgcGxheWVyYi5kZXN0cm95KCk7XG4gICAgcGxheWVyYy5kZXN0cm95KCk7XG4gICAganVkZ2UuZGVzdHJveSgpO1xuICAgIGxheWVyLmRlc3Ryb3koKTtcbiAgfSk7XG4gIFEuc3RhdGUub24oJ2NoYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgIGlmKFEuc3RhdGUuZ2V0KCdzY29yZS1hJykgPT0gNCB8fCBRLnN0YXRlLmdldCgnc2NvcmUtYicpID09IDQgfHwgUS5zdGF0ZS5nZXQoJ3Njb3JlLWMnKSA9PSA0KSB7XG4gICAgICBfLmludm9rZShbcGxheWVyYSwgcGxheWVyYiwgcGxheWVyY10sICdwYXVzZScpXG4gICAgfVxuICB9KVxuICBmdW5jdGlvbiBuZXdSb3VuZCgpIHtcbiAgICBodWQucmVzZXQoKVxuICAgIHBsYXllcmEuc2V0KHt4OiA2NCwgeTogNSozMn0pXG4gICAgcGxheWVyYi5zZXQoe3g6IDE2OCwgeTogNSozMn0pXG4gICAgcGxheWVyYy5zZXQoe3g6IDI1NiwgeTogNSozMn0pXG4gICAgXy5pbnZva2UoW3BsYXllcmEsIHBsYXllcmIsIHBsYXllcmNdLCAndW5wYXVzZScpXG4gIH1cbiAganVkZ2Uub24oJ3RhbGtFbmQnLCBuZXdSb3VuZClcbiAgbmV3Um91bmQoKVxufSlcblxudmFyIGh1ZDtcbmFzc2V0cy5sb2FkKGZ1bmN0aW9uKCkge1xuICBodWQgPSBuZXcgUS5IdWQoKVxuICBodWQuaW5pdCgpXG4gIFEuc3RhZ2VTY2VuZShcImJnXCIsIDApO1xuICBRLnN0YWdlU2NlbmUoXCJwbGF5LTFvbjJcIiwgMSk7XG59KVxuIl19
