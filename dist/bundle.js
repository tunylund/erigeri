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
    
    var others = _.chain(this.stage.lists.players).without(this).filter(function(i){ return !i.p.hit }).value(),
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
    this.p.missed = false
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
    this.p.jumping = true
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
    this.on("bump.bottom", function() {
      if(this.p.vy != 0)
        !Q.state.get('nomusic') && Q.audio.play('assets/bounce.mp3')
    });
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
    this.p.i = this.p.i || 'a'

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
    this.p.jumping = false
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
    this.sheet("fujogeri")
    this.play('fujogeri', 1)
    this.on('step', this, 'fujogeriForwardStep')
    this.on('step', this, 'fujogeriStep')
  })),

  fujogeri: jump(attack(function() {
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
    if(this.p.animationFrame > 4) {
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
    if(!collisions[this.p.animation].hit[this.p.animationFrame].w) return;
    var hit = this.hitTest(collisions[this.p.animation].hit[this.p.animationFrame])
    if(hit) {
      !Q.state.get('nomusic') && Q.audio.play('assets/hit-' + _.sample([1,2,3,4]) + '.mp3')
      var value = this.p.target.hit(this.p.dir * this.hitForce[this.p.animation], hit)

      var prevMovement = this.p.movements[this.p.movements.length-1]
      if(prevMovement && prevMovement.indexOf('soku') > -1) {
        value += 1
      }

      var score = Q.state.get("score-" + this.p.i) || 0
      Q.state.inc("total-score-" + this.p.i, value*100)
      Q.state.set("score-" + this.p.i, Math.min((score + value), 4));
    } else if(!this.p.missed) {
      this.p.missed = true
      !Q.state.get('nomusic') && Q.audio.play('assets/miss-' + _.sample([1,1,1,1,1,1,2]) + '.mp3')
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

    if(intersects(rect(t._absx(th.x, th.w), t._absy(th.y), th.w, tt.h), cr)) {
      return 'head'
    }
    
    if(intersects(rect(t._absx(tt.x, tt.w), t._absy(tt.y), tt.w, tt.h), cr)) {
      return 'torso'
    }

    return false
  },

  hit: function(force, hit) {
    this.stand()
    this.p.hit = true //&& Math.random() > .8
    if(hit === 'head' && Math.abs(force) > 35 ) {
      !Q.state.get('nomusic') && Q.audio.play('assets/head-off-' + _.sample([1,2,3]) + '.mp3')
      this.sheet("headoff-hit")
      this.play('headoffhit', 1)
      this.stage.insert(new Q.Head(this, force))
      return 4
    } else {
      !Q.state.get('nomusic') && Q.audio.play('assets/hurt-' + _.sample([1,2,3]) + '.mp3')
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
    this.finishKicks()
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
    this.on('destroyed', this, 'dest')
    
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

  ushiro: function() {
    if(this.p.flip) {
      this.p.flip = ""
    } else {
      this.p.flip = "x"
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
    this.p.cx = 14
    this.play('stand', 1)
    this.off('enterEnd', this, 'talk')
    this.off('talkEnd', this, 'exit')
    this.off('exitEnd', this, 'stand')
    this.trigger('stand')
  },

  sayNext: function() {
    var choices = [""],
        texts = {
          winner: [["The winner is {color}.", "{color} wins the round."]],
          second: [["{color} is second.", "{color} comes in second."]],
          loser: [
            ['{color}, you r-rated-word-i-should\'t say.', '{color}... really?', 'just... just don\'t, {color}.'],
            ['{color}, you can stop now.', '{color}, you can do better.', 'C\'mon {color}'],
            ['{color}, almost there.', 'maybe next time try to do better {color}.'],
            ['Tough luck {color}.']
          ]
        }

    if (this.p.said === 0) choices = texts.winner;
    else {
      if (this.p.said == this.stage.lists.players.length-1) choices = texts.loser;
      else choices = texts.second;
    }

    var score = this.p.result[this.p.said].score,
        color = this.p.result[this.p.said].color,
        scoreTexts = choices[score % choices.length],
        t = _.sample(scoreTexts)
    this.textEl.innerHTML = t.replace('{color}', color)

    this.p.said += 1
    if(this.p.said >= this.stage.lists.players.length) {
      this.p.d = setTimeout(_.bind(this.talkEnd, this), 2000)
    } else {
      this.p.d = setTimeout(_.bind(this.trigger, this, 'sayNext'), 2000)
    }
  },

  talk: function() {
    this.play('talk', 1)
    this.p.said = 0
    this.sayNext()
  },

  talkEnd: function() {
    this.textEl.innerHTML = ""
    this.exit()
    this.trigger('talkEnd')
  },

  judge: function() {
    // if(this.p.animation != 'stand') return;
    this.p.result = _.sortBy(this.stage.lists.players.map(function(p) {
      return {
        i: p.p.i, 
        score: Q.state.get('score-' + p.p.i), 
        color: {a: 'orange', b: 'blue', c: 'green'}[p.p.i]
      }
    }), 'score').reverse()
    if(this.p.result[0].score === 4) {
      this.enter()
      this.on('enterEnd', this, 'talk')
      this.on('talkEnd', this, 'exit')
      this.on('exitEnd', this, 'stand')
    }
  },

  dest: function() {
    this.textEl.parentNode.removeChild(this.textEl)
    this.off('enterEnd', this, 'talk')
    this.off('talkEnd', this, 'exit')
    this.off('exitEnd', this, 'stand')
    clearTimeout(this.p.d)
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
    for(var i=0; i<this.stage.lists.players.length; i++) {
      if(this.stage.lists.players[i] != this) {
        dist = Math.abs(this.p.x - this.stage.lists.players[i].p.x)
        if(dist < tDist) {
          target = this.stage.lists.players[i]
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

var Q = Quintus({ imagePath: './', audioPath: './', audioSupported: [ 'mp3' ] })
  .include("Audio, Sprites, Scenes, Input, 2D, Anim")
  .enableSound()
  .setup({ maximize: true })
  .controls()

Q.input.disableTouchControls()

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

window.Q = Q

module.exports = Q

},{}],8:[function(require,module,exports){
var Q = require('./Q')



function collisions(name, asset, size) {
  if(!Q.asset(asset)) { throw "Invalid Asset:" + asset; }
  
  exports.collisions[name] = { head: [], torso: [], hit: [] }

  var canvas = document.createElement('canvas'),
      context = canvas.getContext('2d'),
      img = Q.asset(asset),
      imgData,
      head = 150,
      torso = 200,
      hit = 100
  
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
      img = Q.asset(asset),
      imgData,
      colData,
      colImg = document.createElement("img");
  
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
  function dark2(c) { return [c[0] - 20, c[1] - 20, c[2] - 20, c[3]] }
  function dark3(c) { return [c[0] - 80, c[1] - 80, c[2] - 80, c[3]] }
  function lighten(c) { return [c[0] + 30, c[1] + 30, c[2] + 30, c[3]] }
  
  for (var i=0, c; i<imgData.data.length; i+=4) {
    c = getColor(imgData.data, i)
    setColor(lighten(c), colData.data, i)
    if (!transparent(c)) {
      if (transparent(prevColor(imgData.data, i-4))) {
        setColor(dark2(c), colData.data, i)
      }
      if (transparent(prevColor(imgData.data, i))) {
        setColor(dark3(dark3(color)), colData.data, i)
      }
      // if (transparent(getColor(imgData.data, i+4*2))) {
      //   setColor(dark2(dark3(color)), colData.data, i)
      // }
      if (transparent(getColor(imgData.data, i+4))) {
        setColor(color, colData.data, i)
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
      }),

      [
      "assets/bg-loop.mp3", 
      "assets/bounce.mp3",
      "assets/it+.mp3",
      "assets/head-off-1.mp3",
      "assets/head-off-2.mp3",
      "assets/head-off-3.mp3",
      "assets/hit-1.mp3",
      "assets/hit-2.mp3",
      "assets/hit-3.mp3",
      "assets/hit-4.mp3",
      "assets/hurt-1.mp3",
      "assets/hurt-2.mp3",
      "assets/hurt-3.mp3",
      "assets/miss-1.mp3",
      "assets/miss-2.mp3"
      ]

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

    document.getElementById('loader').style.display = 'none';

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
 new Array(10).join('0').split(''),
 new Array(10).join('0').split(''),
 new Array(10).join('0').split(''),
 new Array(10).join('1').split('')
 ], sheet: 'tiles' 
})

function gameLoop(stage, judge) {
  function pausePlayers() {
    if(_.contains([Q.state.get('score-a'), Q.state.get('score-b'), Q.state.get('score-c')], 4)) {
      _.invoke(stage.lists.players, 'pause')
    }
  }
  function cleanup() { 
    judge && judge.destroy()
    try{
      Q.audio.stop("assets/bg-loop.mp3");
      Q.audio.stop("assets/it+.mp3");
    } catch (e) {}
    Q.state.off('change', pausePlayers)
    _.invoke(stage.lists.players, 'destroy');
    hud.reset()
  }
  stage.on('destroyed', cleanup)
  
  function endGame() {
    Q.stageScene('autoplay', 1)
  }
  function newGame() {
    Q.state.set({ 'total-score-a': 0, 'total-score-b': 0, 'total-score-c': 0, 'round': 0 });
    !Q.state.get('nomusic') && Q.audio.play('assets/bg-loop.mp3', {loop: true});
    newRound()
  }
  function newRound() {
    hud.reset()
    var players = stage.lists.players;
    [64, 168, 256].forEach(function(x, i) {
      players[i] && players[i].set({x: x, y: 3*32, vy: 0})
    })
    Q.state.inc('round', 1)
    if(Q.state.get('round') == 2) {
      try{ Q.audio.stop("assets/bg-loop.mp3") } catch (e){}
      !Q.state.get('nomusic') && Q.audio.play("assets/it+.mp3", {loop: true});
    }
    _.invoke(stage.lists.players, 'unpause')
  }
  function roundEnd() {
    var scores = _.sortBy(stage.lists.players.map(function(p) {
      return {i: p.p.i, score: Q.state.get('score-'+ p.p.i)}
    }), 'score')
    if(scores[0].i === 'a' && scores[0].score < scores[1].score) {
      endGame()
    } else {
      newRound()
    }
  }
  Q.state.on('change', pausePlayers)
  judge.on('talkEnd', roundEnd)
  newGame()
}

Q.scene('bg', function(stage) {
  var bg = stage.insert(new Q.Sprite({
    asset: "assets/bg-1.png",
    scale: 576/900
  }))
  bg.center()
  bg.p.y = 235
  stage.on("destroy",function() {
    judge.destroy()
  });
})

Q.scene("anims", function(stage) {
  var layer = stage.collisionLayer(level);
  var playera = stage.insert(new Q.AnimPlayer({x: 64, y: 3*32}))
  stage.add("viewport")
  stage.viewport.scale = 2
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2)
})

Q.scene("play-1on1", function(stage) {
  var layer = stage.collisionLayer(level);
  stage.addToList('players', stage.insert(new Q.Player({i: 'a'})))
  stage.addToList('players', stage.insert(new Q.AutoPlayer({i: 'b'})))
  var judge = stage.insert(new Q.Judge({x: 24, y: 3*32}))
  stage.add("viewport")
  stage.viewport.scale = 2
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2)
  gameLoop(stage, judge)
})

Q.scene("play-1on2", function(stage) {
  var layer = stage.collisionLayer(level);
  stage.addToList('players', stage.insert(new Q.Player({i: 'a'})))
  stage.addToList('players', stage.insert(new Q.AutoPlayer({i: 'b'})))
  stage.addToList('players', stage.insert(new Q.AutoPlayer({i: 'c'})))
  var judge = stage.insert(new Q.Judge({x: 24, y: 3*32}))
  stage.add("viewport")
  stage.viewport.scale = 2
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2)
  gameLoop(stage, judge)
})

Q.scene("autoplay", function(stage) {
  var layer = stage.collisionLayer(level);
  stage.addToList('players', stage.insert(new Q.AutoPlayer({i: 'a'})))
  stage.addToList('players', stage.insert(new Q.AutoPlayer({i: 'b'})))
  stage.addToList('players', stage.insert(new Q.AutoPlayer({i: 'c'})))
  var judge = stage.insert(new Q.Judge({x: 24, y: 3*32}))
  stage.add("viewport")
  stage.viewport.scale = 2
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2)
  gameLoop(stage, judge)
})

var hud
assets.load(function() {
  hud = new Q.Hud()
  hud.init()
  Q.stageScene("bg", 0);
  Q.stageScene("autoplay", 1);
  Q.state.set('nomusic', false)
  document.body.addEventListener('keyup', function(e) {
    if(e.keyCode == 49) {
      Q.clearStage(1)
      Q.stageScene("play-1on1", 1);
    }
    if(e.keyCode == 50) {
      Q.clearStage(1)
      Q.stageScene("play-1on2", 1);
    }
    if(e.keyCode == 77) {
      if(Q.state.get('nomusic')) {
        Q.state.set('nomusic', false)
      } else {
        Q.state.set('nomusic', true)
        Q.audio.stop()
      }
    }
  })
})
console.log(Q)
},{"./AnimPlayer":1,"./AutoPlayer":2,"./Hud":4,"./Judge":5,"./Player":6,"./Q":7,"./assets":8}]},{},[9])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvQW5pbVBsYXllci5qcyIsImxpYi9BdXRvUGxheWVyLmpzIiwibGliL0dlcmlNb24uanMiLCJsaWIvSHVkLmpzIiwibGliL0p1ZGdlLmpzIiwibGliL1BsYXllci5qcyIsImxpYi9RLmpzIiwibGliL2Fzc2V0cy5qcyIsImxpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBRID0gcmVxdWlyZSgnLi9RJylcbnJlcXVpcmUoJy4vR2VyaU1vbicpXG5cblxuZnVuY3Rpb24gZGlzdGFuY2UoYSwgYikge1xuICB2YXIgeCA9IE1hdGguYWJzKGEucC54IC0gYi5wLngpLFxuICAgICAgeSA9IE1hdGguYWJzKGEucC55IC0gYi5wLnkpXG4gIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5KTtcbn1cblxuZnVuY3Rpb24gc3BvdEF0dGFjayh0YXJnZXQpIHtcbiAgaWYodGFyZ2V0LnAuYW5pbWF0aW9uID09PSAnZnVqb2dlcmknKSB7XG4gICAgaWYodGFyZ2V0LnAuYW5pbWF0aW9uRnJhbWUgPiA0KVxuICAgICAgcmV0dXJuICdmdWpvZ2VyaSdcbiAgfVxuICBpZih0YXJnZXQucC5hbmltYXRpb24gPT09ICdzdWloZWlnZXJpJykge1xuICAgIGlmKHRhcmdldC5wLmFuaW1hdGlvbkZyYW1lID4gNClcbiAgICAgIHJldHVybiAnc3VpaGVpZ2VyaSdcbiAgfVxuICBpZih0YXJnZXQucC5hbmltYXRpb24gPT09ICdtYW5qaWdlcmknKSB7XG4gICAgaWYodGFyZ2V0LnAuYW5pbWF0aW9uRnJhbWUgPiA0KVxuICAgICAgcmV0dXJuICdtYW5qaWdlcmknXG4gIH0gXG59XG5cblEuR2VyaU1vbi5leHRlbmQoXCJBbmltUGxheWVyXCIsIHtcblxuICBhdHRhY2tTZXF1ZW5jZTogWydzZW5zb2dlcmknLCAnbWFuamlnZXJpJywgJ2Z1am9nZXJpJywgJ3N1aWhlaWdlcmknLCAnc2VudGFpbm90c3VraScsICdoYW5nZXRzdWF0ZSddLFxuICB1bnNva3VTZXF1ZW5jZTogWyduaW5vYXNoaScsICd0c3Vpc29rdScsICdrb3Nva3UnLCAnZ2Vuc29rdScsICd0YWlzb2t1JywgJ3VzaGlybyddLFxuXG4gIGluaXQ6IGZ1bmN0aW9uKHApIHtcbiAgICB0aGlzLl9zdXBlcihfLmV4dGVuZCh7XG4gICAgICBhbmltOiBudWxsLFxuICAgICAgc2VxdWVuY2U6IHRoaXMuYXR0YWNrU2VxdWVuY2VcbiAgICB9LCBwKSlcbiAgICAvLyB0aGlzLm9uKCdzdGFuZCcsIHRoaXMsICduZXh0JylcbiAgICAvLyB0aGlzLm5leHQoKVxuICB9LFxuXG4gIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBuID0gdGhpcy5wLnNlcXVlbmNlW3RoaXMucC5zZXF1ZW5jZS5pbmRleE9mKHRoaXMucC5hbmltKSArIDFdIHx8IHRoaXMucC5zZXF1ZW5jZVswXVxuICAgIGlmKHRoaXNbbl0oKSkge1xuICAgICAgdGhpcy5wLmFuaW0gPSBuXG4gICAgfVxuICB9LFxuXG4gIHN0ZXA6IGZ1bmN0aW9uKHQpIHtcbiAgICBpZihRLmlucHV0cy5maXJlKSB7XG4gICAgICB0aGlzLnAuc2VxdWVuY2UgPSB0aGlzLnAuc2VxdWVuY2UgPT0gdGhpcy5hdHRhY2tTZXF1ZW5jZSA/IHRoaXMudW5zb2t1U2VxdWVuY2UgOiB0aGlzLmF0dGFja1NlcXVlbmNlXG4gICAgfVxuICAgIHRoaXMubmV4dCgpXG4gIH1cblxufSkiLCJ2YXIgUSA9IHJlcXVpcmUoJy4vUScpXG5yZXF1aXJlKCcuL0dlcmlNb24nKVxuXG5cbmZ1bmN0aW9uIGRpc3RhbmNlKGEsIGIpIHtcbiAgdmFyIHggPSBNYXRoLmFicyhhLnAueCAtIGIucC54KSxcbiAgICAgIHkgPSBNYXRoLmFicyhhLnAueSAtIGIucC55KVxuICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSk7XG59XG5cbmZ1bmN0aW9uIHNwb3RBdHRhY2sodGFyZ2V0KSB7XG4gIGlmKHRhcmdldC5wLmF0dGFja2luZyAmJiB0YXJnZXQucC5hbmltYXRpb25GcmFtZSA+IDQpIHtcbiAgICByZXR1cm4gdGFyZ2V0LnAuYW5pbWF0aW9uXG4gIH1cbn1cblxuUS5HZXJpTW9uLmV4dGVuZChcIkF1dG9QbGF5ZXJcIiwge1xuXG4gIGhpdERpc3RhbmNlOiAzNSxcblxuICBtb3ZlQ2xvc2VyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICBpZihkaXN0YW5jZSh0YXJnZXQsIHRoaXMpID4gdGhpcy5oaXREaXN0YW5jZSArIHRoaXMucC53LzIpIHtcbiAgICAgIHRoaXMudHN1aXNva3UoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm5pbm9hc2hpKClcbiAgICB9XG4gIH0sXG5cbiAgbW92ZUZ1cnRoZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgIHRoaXNbXy5zYW1wbGUoWyd0YWlzb2t1JywgJ2dlbnNva3UnXSldKClcbiAgfSxcblxuICBjYW5jZWxBdHRhY2s6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVyblxuICAgIGlmKHRoaXMucC5hdHRhY2tpbmcgJiYgdGhpcy5wLmFuaW1hdGlvbkZyYW1lIDwgNCkge1xuICAgICAgdGhpcy5zdGFuZCgpXG4gICAgfVxuICB9LFxuXG4gIGNhbmNlbFVuc29rdTogZnVuY3Rpb24oKSB7XG4gICAgaWYodGhpcy5wLndhbGtpbmcpIHtcbiAgICAgIGlmKHRoaXMucC5hbmltYXRpb25GcmFtZSA8IDMgfHwgdGhpcy5wLmFuaW1hdGlvbkZyYW1lID4gNikge1xuICAgICAgICB0aGlzLnN0YW5kKClcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgYXR0YWNrRHVyaW5nQXR0YWNrOiBmdW5jdGlvbih0YXJnZXQsIGF0dGFjaykge1xuICAgIGlmKGF0dGFjayA9PT0gJ3N1aWhlaWdlcmknKSB7XG4gICAgICBpZih0YXJnZXQucC5hbmltYXRpb25GcmFtZSA8IDYpIHtcbiAgICAgICAgdGhpc1tfLnNhbXBsZShbJ2Z1am9nZXJpJywgJ21hbmppZ2VyaSddKV0odGFyZ2V0KVxuICAgICAgfVxuICAgIH1cbiAgICBpZihhdHRhY2sgPT09ICdmdWpvZ2VyaScpIHtcbiAgICAgIGlmKHRhcmdldC5wLmFuaW1hdGlvbkZyYW1lIDwgMTApIHtcbiAgICAgICAgdGhpcy5tYW5qaWdlcmkodGFyZ2V0KVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBhdHRhY2tBZnRlckF0dGFjazogZnVuY3Rpb24odGFyZ2V0LCBhdHRhY2spIHtcbiAgICBpZihhdHRhY2sgPT09ICdzdWloZWlnZXJpJykge1xuICAgICAgaWYodGFyZ2V0LnAuYW5pbWF0aW9uRnJhbWUgPiA2KSB7XG4gICAgICAgIHRoaXMuZnVqb2dlcmkodGFyZ2V0KVxuICAgICAgfVxuICAgIH1cbiAgICBpZihhdHRhY2sgPT09ICdmdWpvZ2VyaScpIHtcbiAgICAgIGlmKHRhcmdldC5wLmFuaW1hdGlvbkZyYW1lID4gMTApIHtcbiAgICAgICAgdGhpcy5tYW5qaWdlcmkodGFyZ2V0KVxuICAgICAgfVxuICAgIH1cbiAgICBpZihhdHRhY2sgPT09ICdtYW5qaWdlcmknKSB7XG4gICAgICBpZih0YXJnZXQucC5hbmltYXRpb25GcmFtZSA+IDcpIHtcbiAgICAgICAgdGhpcy5zdWloZWlnZXJpKHRhcmdldClcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgZXZhZGU6IGZ1bmN0aW9uKHRhcmdldCwgYXR0YWNrKSB7XG4gICAgaWYoYXR0YWNrKSB7XG4gICAgICB2YXIgciA9IE1hdGgucmFuZG9tKClcbiAgICAgIHRoaXMuY2FuY2VsQXR0YWNrKClcbiAgICAgIGlmKHIgPiAuOCkge1xuICAgICAgICB0aGlzLmtvc29rdSgpXG4gICAgICB9IGVsc2UgaWYgKHIgPiAuNSB8fCBkaXN0YW5jZSh0YXJnZXQsIHRoaXMpIDwgdGhpcy5oaXREaXN0YW5jZSAqIDMvNCkge1xuICAgICAgICB0aGlzLmdlbnNva3UoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy50YWlzb2t1KClcbiAgICAgIH1cblxuICAgIH1cbiAgfSxcblxuICBhdHRhY2s6IGZ1bmN0aW9uKHRhcmdldCwgYXR0YWNrKSB7XG4gICAgdmFyIGRpc3QgPSBkaXN0YW5jZSh0YXJnZXQsIHRoaXMpXG4gICAgaWYoZGlzdCA8IDE1KSB7XG4gICAgICB0aGlzW18uc2FtcGxlKFsnaGFuZ2V0c3VhdGUnLCAndHN1aXNva3UnXSldKHRhcmdldClcbiAgICB9IGVsc2UgaWYoZGlzdCA8IDI2KSB7XG4gICAgICB0aGlzW18uc2FtcGxlKFsnZnVqb2dlcmknLCAnc2Vuc29nZXJpJywgJ21hbmppZ2VyaSddKV0odGFyZ2V0KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzW18uc2FtcGxlKFsnZnVqb2dlcmlGb3J3YXJkJywgJ3N1aWhlaWdlcmknLCAnc2VudGFpbm90c3VraSddKV0odGFyZ2V0KVxuICAgIH1cbiAgICAvLyBpZihkaXN0ID4gMTQgJiYgZGlzdCA8IDIyKSB0aGlzLmZ1am9nZXJpKHRhcmdldClcbiAgICAvLyBpZihkaXN0ID4gMTcgJiYgZGlzdCA8IDI2KSB0aGlzLnNlbnNvZ2VyaSh0YXJnZXQpXG4gICAgLy8gaWYoZGlzdCA+IDIwICYmIGRpc3QgPCAyOCkge1xuICAgIC8vICAgdGhpc1tfLnNhbXBsZShbJ2Z1am9nZXJpRm9yd2FyZCcsICdtYW5qaWdlcmknXSldKHRhcmdldClcbiAgICAvLyB9XG4gICAgLy8gaWYoZGlzdCA+IDI3ICYmIGRpc3QgPCAzNSkgdGhpcy5zdWloZWlnZXJpKHRhcmdldClcbiAgICAvLyB0aGlzW18uc2FtcGxlKFsnc3VpaGVpZ2VyaScsICdtYW5qaWdlcmknLCAnc2Vuc29nZXJpJywgJ21hbmppZ2VyaScsICdzZW5zb2dlcmknLCAnZnVqb2dlcmknLCAnZnVqb2dlcmlGb3J3YXJkJ10pXSh0YXJnZXQpIFxuICB9LFxuXG4gIGxvb2tBdDogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgdmFyIGF0ID0gdGFyZ2V0LnAueCA8IHRoaXMucC54ID8gJ2xlZnQnIDogJ3JpZ2h0J1xuICAgIGlmKGF0ICE9IHRoaXMucC5kaXJlY3Rpb24pIHRoaXMudXNoaXJvKClcbiAgfSxcblxuICBzdGVwOiBmdW5jdGlvbih0KSB7XG4gICAgdGhpcy5fc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuXG4gICAgaWYodGhpcy5wLnBhdXNlZCkgcmV0dXJuO1xuICAgIFxuICAgIHZhciBvdGhlcnMgPSBfLmNoYWluKHRoaXMuc3RhZ2UubGlzdHMucGxheWVycykud2l0aG91dCh0aGlzKS5maWx0ZXIoZnVuY3Rpb24oaSl7IHJldHVybiAhaS5wLmhpdCB9KS52YWx1ZSgpLFxuICAgICAgICB0YXJnZXQgPSBfLnNhbXBsZShvdGhlcnMpLFxuICAgICAgICBkaXN0ID0gdGFyZ2V0ID8gZGlzdGFuY2UodGFyZ2V0LCB0aGlzKSA6IEluZmluaXR5O1xuICAgIFxuICAgIGlmKHRhcmdldCkge1xuXG4gICAgICB0aGlzLmxvb2tBdCh0YXJnZXQpXG5cbiAgICAgIGlmKGRpc3QgPCB0aGlzLmhpdERpc3RhbmNlIC8gMikge1xuICAgICAgICB0aGlzLm1vdmVGdXJ0aGVyKHRhcmdldClcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYoZGlzdCA+IHRoaXMuaGl0RGlzdGFuY2UpIHtcbiAgICAgICAgdGhpcy5tb3ZlQ2xvc2VyKHRhcmdldClcbiAgICAgIH1cblxuICAgICAgdmFyIHNwb3QgPSBzcG90QXR0YWNrKHRhcmdldClcbiAgICAgIGlmKHNwb3QpIHtcbiAgICAgICAgdGhpcy5ldmFkZSh0YXJnZXQsIHNwb3QpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZihkaXN0ID4gOCAmJiBkaXN0IDw9IHRoaXMuaGl0RGlzdGFuY2UpIHtcbiAgICAgICAgICB0aGlzLmF0dGFjayh0YXJnZXQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgfVxuXG59KSIsInZhciBRID0gcmVxdWlyZSgnLi9RJyksXG4gICAgY29sbGlzaW9ucyA9IHJlcXVpcmUoJy4vYXNzZXRzJykuY29sbGlzaW9uc1xuXG5RLmFuaW1hdGlvbnMoJ2dlcmltb24nLCB7XG4gIHN0YW5kOiB7IGZyYW1lczogWzBdIH0sXG4gIHNlbnRhaW5vdHN1a2k6IHsgZnJhbWVzOiBfLnJhbmdlKDIyKSwgcmF0ZTogMS8xMCwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAgZnVqb2dlcmk6IHsgZnJhbWVzOiBfLnJhbmdlKDE1KSwgcmF0ZTogMS8xMCwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAgc3VpaGVpZ2VyaTogeyBmcmFtZXM6IF8ucmFuZ2UoMTUpLCByYXRlOiAxLzEwLCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICBtYW5qaWdlcmk6IHsgZnJhbWVzOiBfLnJhbmdlKDE1KSwgcmF0ZTogMS8xMCwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAgaGFuZ2V0c3VhdGU6IHsgZnJhbWVzOiBfLnJhbmdlKDIxKSwgcmF0ZTogMS8xMCwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAgc2Vuc29nZXJpOiB7IGZyYW1lczogXy5yYW5nZSgyMCksIHJhdGU6IDEvMTIsIGxvb3A6IGZhbHNlLCB0cmlnZ2VyOiAnc3RhbmQnIH0sXG4gIHRzdWlzb2t1OiB7IGZyYW1lczogXy5yYW5nZSgxMSksIHJhdGU6IDEvMTAsIGxvb3A6IGZhbHNlLCB0cmlnZ2VyOiAnc3RhbmQnIH0sXG4gIGtvc29rdTogeyBmcmFtZXM6IF8ucmFuZ2UoMTgpLCByYXRlOiAxLzE1LCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICB1c2hpcm86IHsgZnJhbWVzOiBfLnJhbmdlKDcpLCByYXRlOiAxLzEyLCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICBuaW5vYXNoaTogeyBmcmFtZXM6IF8ucmFuZ2UoNiksIHJhdGU6IDEvMTAsIGxvb3A6IGZhbHNlLCB0cmlnZ2VyOiAnc3RhbmQnIH0sXG4gIHRhaXNva3U6IHsgZnJhbWVzOiBfLnJhbmdlKDExKS5yZXZlcnNlKCksIHJhdGU6IDEvMTAsIGxvb3A6IGZhbHNlLCB0cmlnZ2VyOiAnc3RhbmQnIH0sXG4gIHRvcnNvaGl0OiB7IGZyYW1lczogWzAsMSwyLDMsMiwxLDBdLCByYXRlOiAxLzEwLCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICBoZWFkb2ZmaGl0OiB7IGZyYW1lczogXy5yYW5nZSgxMikuY29uY2F0KFsxMiwxMiwxMiwxMiwxMiwxMiwxMiwxMiwxMiwxMiwxMiwxMiwxMiwxMiwxMiwxMiwxMiwxMiwxMiwxMl0pLCByYXRlOiAxLzEwLCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9XG59KTtcblxuXG5cbmZ1bmN0aW9uIGludGVyc2VjdHMoYSwgYikge1xuICBpZihhLncgKyBhLmggKyBiLncgKyBiLmggPT0gMCkgcmV0dXJuIGZhbHNlO1xuICB2YXIgeEludGVzZWN0cyA9IGEueCA8IGIueCAmJiBhLngrYS53ID4gYi54IHx8IFxuICAgICAgICAgICAgICAgICAgIGEueCA8IGIueCtiLncgJiYgYS54K2EudyA+IGIueCtiLncsXG4gICAgICB5SW50ZXNlY3RzID0gYS55IDwgYi55ICYmIGEueSArIGEuaCA+IGIueSB8fFxuICAgICAgICAgICAgICAgICAgIGEueSA8IGIueStiLmggJiYgYS55K2EuaCA+IGIueStiLmhcbiAgcmV0dXJuIHhJbnRlc2VjdHMgJiYgeUludGVzZWN0c1xufVxuZnVuY3Rpb24gcmVjdCh4LCB5LCB3LCBoKSB7XG4gIHJldHVybiB7XG4gICAgeDogeHx8MCxcbiAgICB5OiB5fHwwLFxuICAgIHc6IHd8fDAsXG4gICAgaDogaHx8MFxuICB9XG59XG5cbmZ1bmN0aW9uIGF0dGFjayhmbikge1xuICByZXR1cm4gZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgaWYoIXRoaXMucC5sYW5kZWQpIHJldHVybiBmYWxzZTtcbiAgICBpZih0aGlzLnAuaGl0KSByZXR1cm4gZmFsc2U7XG4gICAgaWYodGhpcy5wLmF0dGFja2luZykgcmV0dXJuIGZhbHNlO1xuICAgIGlmKHRoaXMucC53YWxraW5nICYmIHRoaXMucC5hbmltYXRpb25GcmFtZSA+IDQgfHwgdGhpcy5wLmFuaW1hdGlvbiA9PT0gJ3VzaGlybycpIHJldHVybiBmYWxzZTtcbiAgICB0aGlzLnAubWlzc2VkID0gZmFsc2VcbiAgICB0aGlzLnAudGFyZ2V0ID0gdGFyZ2V0XG4gICAgdGhpcy5wLmF0dGFja2luZyA9IHRydWVcbiAgICB0aGlzLnAudnggPSAwXG4gICAgdmFyIGQ9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICBpZih0eXBlb2YgZCA9PT0gJ3VuZGVmaW5lZCcgfHwgZCkge1xuICAgICAgdGhpcy5vbignc3RlcCcsIHRoaXMsICdoaXRTdGVwJylcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbmZ1bmN0aW9uIGp1bXAoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMucC5oaXQpIHJldHVybiBmYWxzZTtcbiAgICBpZih0aGlzLnAuanVtcGluZykgcmV0dXJuIGZhbHNlO1xuICAgIHRoaXMucC5qdW1waW5nID0gdHJ1ZVxuICAgIHZhciBkPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgcmV0dXJuIHR5cGVvZiBkID09PSAndW5kZWZpbmVkJyB8fCBkXG4gIH1cbn1cblxuZnVuY3Rpb24gd2Fsayhmbikge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgaWYodGhpcy5wLmhpdCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmKCF0aGlzLnAubGFuZGVkKSByZXR1cm4gZmFsc2U7XG4gICAgaWYodGhpcy5wLmF0dGFja2luZykgcmV0dXJuIGZhbHNlO1xuICAgIGlmKHRoaXMucC53YWxraW5nKSByZXR1cm4gZmFsc2U7XG4gICAgdGhpcy5wLndhbGtpbmcgPSB0cnVlXG4gICAgdmFyIGQ9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICByZXR1cm4gdHlwZW9mIGQgPT09ICd1bmRlZmluZWQnIHx8IGRcbiAgfVxufVxuXG5RLk1vdmluZ1Nwcml0ZS5leHRlbmQoXCJIZWFkXCIsIHtcbiAgaW5pdDogZnVuY3Rpb24ob3duZXIsIGZvcmNlKSB7XG4gICAgdGhpcy5fc3VwZXIoe30sIHtcbiAgICAgIGNvbG9yOiBcIiMwMDAwMDBcIixcbiAgICAgIHc6IDQsXG4gICAgICBoOiA0LFxuICAgICAgeDogb3duZXIucC54LFxuICAgICAgeTogb3duZXIucC55IC0gMTMsXG4gICAgICBkaXI6IC0xKm93bmVyLnAuZGlyLFxuICAgICAgc2Vuc29yOiB0cnVlLFxuICAgICAgbGlmZTogMFxuICAgIH0pXG4gICAgdGhpcy5hZGQoJzJkJyk7XG4gICAgdGhpcy5wLnZ5ID0gLTE1MFxuICAgIHRoaXMucC52eCA9IHRoaXMucC5kaXIqZm9yY2UgKiAyXG4gICAgdGhpcy5vbihcImJ1bXAuYm90dG9tXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYodGhpcy5wLnZ5ICE9IDApXG4gICAgICAgICFRLnN0YXRlLmdldCgnbm9tdXNpYycpICYmIFEuYXVkaW8ucGxheSgnYXNzZXRzL2JvdW5jZS5tcDMnKVxuICAgIH0pO1xuICB9LFxuICBzdGVwOiBmdW5jdGlvbih0KSB7XG4gICAgdGhpcy5fc3VwZXIodClcbiAgICB0aGlzLnAubGlmZSArPSB0XG4gICAgdGhpcy5wLmFuZ2xlICs9IHRoaXMucC5kaXIgKiB0ICogNDAwXG4gICAgaWYodGhpcy5wLmxpZmUgPiA1KSB7XG4gICAgICB0aGlzLmRlc3Ryb3koKVxuICAgIH1cbiAgfVxufSlcblxuUS5Nb3ZpbmdTcHJpdGUuZXh0ZW5kKFwiR2VyaU1vblwiLCB7XG4gIFxuICBzcGVlZDogMjUsXG4gIGZyaWN0aW9uOiA1LFxuICBqdW1wU3BlZWQ6IDEwMCxcbiAgaGl0Rm9yY2U6IHtcbiAgICBmdWpvZ2VyaTogNDAsXG4gICAgbWFuamlnZXJpOiAyNSxcbiAgICBzZW5zb2dlcmk6IDQwLFxuICAgIHN1aWhlaWdlcmk6IDM1LFxuICAgIHNlbnRhaW5vdHN1a2k6IDI1LFxuICAgIGhhbmdldHN1YXRlOiA0MFxuICB9LFxuXG4gIGluaXQ6IGZ1bmN0aW9uKHApIHtcbiAgICB2YXIgdyA9IDIyLCBoID0gMzJcbiAgICB0aGlzLl9zdXBlcihwLCB7IFxuICAgICAgc3ByaXRlOiBcImdlcmltb25cIixcbiAgICAgIGRpcjogMSxcbiAgICAgIHc6IHcsXG4gICAgICBoOiBoLFxuICAgICAgc3c6IDQ4LFxuICAgICAgc2g6IDMyLFxuICAgICAgc2Vuc29yOiB0cnVlLFxuICAgICAgbW92ZW1lbnRzOiBbXSxcbiAgICAgIHBvaW50czogW1xuICAgICAgICBbLXcvMiwgLWgvMl0sIFxuICAgICAgICBbIHcvMiwgLWgvMiBdLCBcbiAgICAgICAgWyB3LzIsICBoLzIgXSwgXG4gICAgICAgIFstdy8yLCAgaC8yIF1dLFxuICAgICAgY3g6IDEwXG4gICAgfSk7XG4gICAgdGhpcy5hZGQoJzJkLCBhbmltYXRpb24nKTtcbiAgICB0aGlzLnAuaSA9IHRoaXMucC5pIHx8ICdhJ1xuXG4gICAgdGhpcy5vbihcInN0YW5kXCIsIHRoaXMsIFwic3RhbmRcIik7XG4gICAgdGhpcy5vbihcInByZXN0ZXBcIiwgdGhpcywgXCJwcmVzdGVwXCIpXG4gICAgdGhpcy5vbihcImJ1bXAuYm90dG9tXCIsIHRoaXMsIFwibGFuZFwiKTtcbiAgICB0aGlzLm9uKFwiYW5pbUVuZC5zZW50YWlub3RzdWtpXCIsIHRoaXMsIFwic2VudGFpbm90c3VraUVuZFwiKVxuICAgIHRoaXMub24oXCJhbmltRW5kLnVzaGlyb1wiLCB0aGlzLCBcInVzaGlyb0VuZFwiKVxuICAgIHRoaXMub24oXCJhbmltRW5kXCIsIHRoaXMsIFwibG9nTW92ZW1lbnRcIilcbiAgICAvLyB0aGlzLm9uKFwicG9zdGRyYXdcIiwgdGhpcywgXCJyZW5kZXJDb2xsaXNpb25zXCIpXG5cbiAgICB0aGlzLnN0YW5kKClcbiAgfSxcblxuICBsb2dNb3ZlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLm1vdmVtZW50cy5wdXNoKHRoaXMucC5hbmltYXRpb24pXG4gICAgdGhpcy5wLm1vdmVtZW50cyA9IHRoaXMucC5tb3ZlbWVudHMuc3BsaWNlKC0zKVxuICB9LFxuXG4gIF9hYnN4OiBmdW5jdGlvbih4LCB3KSB7XG4gICAgcmV0dXJuIHRoaXMucC5mbGlwID8gXG4gICAgICB0aGlzLnAueCArIHRoaXMucC5jeCAtIHggLSB3IDpcbiAgICAgIHRoaXMucC54IC0gdGhpcy5wLmN4ICsgeFxuICB9LFxuXG4gIF9hYnN5OiBmdW5jdGlvbih5KSB7XG4gICAgcmV0dXJuIHRoaXMucC55LXRoaXMucC5jeSArIHlcbiAgfSxcblxuICByZW5kZXJDb2xsaXNpb25zOiBmdW5jdGlvbihjdHgpIHtcbiAgICBjdHguc2F2ZSgpO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcblxuICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwwLDAsMC41KVwiO1xuICAgIGN0eC5maWxsUmVjdCh0aGlzLnAueC10aGlzLnAuY3gsIHRoaXMucC55LXRoaXMucC5jeSwgdGhpcy5wLncsIHRoaXMucC5oKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIFxuICAgIHZhciBjID0gY29sbGlzaW9uc1t0aGlzLnAuYW5pbWF0aW9uXSB8fCBjb2xsaXNpb25zLnN0YW5kLFxuICAgICAgICBmdCA9IGMudG9yc29bdGhpcy5wLmFuaW1hdGlvbkZyYW1lXSB8fCBjLnRvcnNvWzBdLFxuICAgICAgICBmaCA9IGMuaGVhZFt0aGlzLnAuYW5pbWF0aW9uRnJhbWVdIHx8IGMuaGVhZFswXSxcbiAgICAgICAgZmhoPSBjLmhpdCAmJiBjLmhpdFt0aGlzLnAuYW5pbWF0aW9uRnJhbWVdIHx8IHt9XG4gICAgXG4gICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgyNTUsMCwyNTUsMC41KVwiO1xuICAgIGN0eC5maWxsUmVjdCh0aGlzLl9hYnN4KGZ0LngsIGZ0LncpLCB0aGlzLl9hYnN5KGZ0LnkpLCBmdC53LCBmdC5oKTtcbiAgICBjdHguZmlsbCgpO1xuXG4gICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgwLDI1NSwyNTUsMC41KVwiO1xuICAgIGN0eC5maWxsUmVjdCh0aGlzLl9hYnN4KGZoLngsIGZoLncpLCB0aGlzLl9hYnN5KGZoLnkpLCBmaC53LCBmaC5oKTtcbiAgICBjdHguZmlsbCgpO1xuXG4gICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgyNTUsMjU1LDAsMC41KVwiO1xuICAgIGN0eC5maWxsUmVjdCh0aGlzLl9hYnN4KGZoaC54LCBmaGgudyksIHRoaXMuX2Fic3koZmhoLnkpLCBmaGgudywgZmhoLmgpO1xuICAgIGN0eC5maWxsKCk7XG4gICAgY3R4LnJlc3RvcmUoKVxuICB9LFxuXG4gIGxhbmQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC5sYW5kZWQgPSB0cnVlXG4gICAgdGhpcy5wLmp1bXBpbmcgPSBmYWxzZVxuICB9LFxuXG4gIHNoZWV0OiBmdW5jdGlvbihuYW1lKSB7XG4gICAgaWYobmFtZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3N1cGVyKG5hbWUgKyAnLScgKyB0aGlzLnAuaSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuX3N1cGVyKClcbiAgICB9XG4gIH0sXG5cbiAgcGF1c2U6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC5wYXVzZWQgPSB0cnVlXG4gIH0sXG5cbiAgdW5wYXVzZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLnBhdXNlZCA9IGZhbHNlXG4gICAgdGhpcy5zdGFuZCgpXG4gIH0sXG5cbiAgZnVqb2dlcmlGb3J3YXJkOiBqdW1wKGF0dGFjayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNoZWV0KFwiZnVqb2dlcmlcIilcbiAgICB0aGlzLnBsYXkoJ2Z1am9nZXJpJywgMSlcbiAgICB0aGlzLm9uKCdzdGVwJywgdGhpcywgJ2Z1am9nZXJpRm9yd2FyZFN0ZXAnKVxuICAgIHRoaXMub24oJ3N0ZXAnLCB0aGlzLCAnZnVqb2dlcmlTdGVwJylcbiAgfSkpLFxuXG4gIGZ1am9nZXJpOiBqdW1wKGF0dGFjayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNoZWV0KFwiZnVqb2dlcmlcIilcbiAgICB0aGlzLnBsYXkoJ2Z1am9nZXJpJywgMSlcbiAgICB0aGlzLm9uKCdzdGVwJywgdGhpcywgJ2Z1am9nZXJpU3RlcCcpXG4gIH0pKSxcblxuICBmdWpvZ2VyaUZvcndhcmRTdGVwOiBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLnAuYW5pbWF0aW9uRnJhbWUgPiA0ICYmIHRoaXMucC5hbmltYXRpb25GcmFtZSA8IDcpIHtcbiAgICAgIHRoaXMucC52eCA9IHRoaXMucC5kaXIgKiB0aGlzLnNwZWVkXG4gICAgICB0aGlzLm9mZignc3RlcCcsIHRoaXMsICdmdWpvZ2VyaUZvcndhcmRTdGVwJylcbiAgICB9XG4gIH0sXG5cbiAgZnVqb2dlcmlTdGVwOiBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLnAuYW5pbWF0aW9uRnJhbWUgPiA0KSB7XG4gICAgICB0aGlzLnAudnkgPSAtdGhpcy5qdW1wU3BlZWRcbiAgICAgIHRoaXMucC5sYW5kZWQgPSBmYWxzZVxuICAgICAgdGhpcy5wLmp1bXBpbmcgPSB0cnVlXG4gICAgICB0aGlzLm9mZignc3RlcCcsIHRoaXMsICdmdWpvZ2VyaVN0ZXAnKVxuICAgIH1cbiAgfSxcblxuICBoYW5nZXRzdWF0ZTogYXR0YWNrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2hlZXQoXCJoYW5nZXRzdWF0ZVwiKVxuICAgIHRoaXMucGxheSgnaGFuZ2V0c3VhdGUnLCAxKVxuICB9KSxcblxuICBzZW50YWlub3RzdWtpOiBhdHRhY2soZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zaGVldChcInNlbnRhaW5vdHN1a2lcIilcbiAgICB0aGlzLnBsYXkoJ3NlbnRhaW5vdHN1a2knLCAxKVxuICB9KSxcblxuICBzZW50YWlub3RzdWtpRW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAueCArPSB0aGlzLnAuZGlyICogMTVcbiAgfSxcblxuICBtYW5qaWdlcmk6IGF0dGFjayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNoZWV0KFwibWFuamlnZXJpXCIpXG4gICAgdGhpcy5wbGF5KCdtYW5qaWdlcmknLCAxKVxuICB9KSxcblxuICBzdWloZWlnZXJpOiBhdHRhY2soZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zaGVldChcInN1aWhlaWdlcmlcIilcbiAgICB0aGlzLnBsYXkoJ3N1aWhlaWdlcmknLCAxKVxuICB9KSxcblxuICBzZW5zb2dlcmk6IGF0dGFjayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNoZWV0KFwic2Vuc29nZXJpXCIpXG4gICAgdGhpcy5wbGF5KCdzZW5zb2dlcmknLCAxKVxuICB9KSxcblxuICB1c2hpcm86IHdhbGsoZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zaGVldChcInVzaGlyb1wiKVxuICAgIHRoaXMucGxheSgndXNoaXJvJywgMSlcbiAgfSksXG5cbiAgdXNoaXJvRW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAueCArPSB0aGlzLnAuZGlyICogNFxuICAgIHRoaXMucC5kaXJlY3Rpb24gPSB0aGlzLnAuZGlyZWN0aW9uID09PSAnbGVmdCcgPyAncmlnaHQnIDogJ2xlZnQnXG4gICAgdGhpcy5wcmVzdGVwKClcbiAgfSxcblxuICBuaW5vYXNoaTogd2FsayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAudnggPSB0aGlzLnAuZGlyICogdGhpcy5zcGVlZC8yO1xuICAgIHRoaXMuc2hlZXQoXCJuaW5vYXNoaVwiKVxuICAgIHRoaXMucGxheSgnbmlub2FzaGknLCAxKVxuICB9KSxcblxuICB0YWlzb2t1OiB3YWxrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC52eCA9IC10aGlzLnAuZGlyICogdGhpcy5zcGVlZDtcbiAgICB0aGlzLnNoZWV0KFwidHN1aXNva3VcIilcbiAgICB0aGlzLnBsYXkoJ3RhaXNva3UnLCAxKVxuICB9KSxcbiAgXG4gIHRzdWlzb2t1OiB3YWxrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC52eCA9IHRoaXMucC5kaXIgKiB0aGlzLnNwZWVkO1xuICAgIHRoaXMuc2hlZXQoXCJ0c3Vpc29rdVwiKVxuICAgIHRoaXMucGxheSgndHN1aXNva3UnLCAxKVxuICB9KSxcblxuICBrb3Nva3U6IHdhbGsoZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLnZ4ID0gdGhpcy5wLmRpciAqIHRoaXMuc3BlZWQvMjtcbiAgICB0aGlzLnNoZWV0KFwia29zb2t1XCIpXG4gICAgdGhpcy5wbGF5KCdrb3Nva3UnLCAxKVxuICB9KSxcblxuICBnZW5zb2t1OiB3YWxrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC52eCA9IC10aGlzLnAuZGlyICogdGhpcy5zcGVlZCoyLzM7XG4gICAgdGhpcy5zaGVldChcImtvc29rdVwiKVxuICAgIHRoaXMucGxheSgna29zb2t1JywgMSlcbiAgfSksXG5cbiAgaGl0U3RlcDogZnVuY3Rpb24oKSB7XG4gICAgaWYoIWNvbGxpc2lvbnNbdGhpcy5wLmFuaW1hdGlvbl0pIHJldHVybjtcbiAgICBpZighY29sbGlzaW9uc1t0aGlzLnAuYW5pbWF0aW9uXS5oaXRbdGhpcy5wLmFuaW1hdGlvbkZyYW1lXS53KSByZXR1cm47XG4gICAgdmFyIGhpdCA9IHRoaXMuaGl0VGVzdChjb2xsaXNpb25zW3RoaXMucC5hbmltYXRpb25dLmhpdFt0aGlzLnAuYW5pbWF0aW9uRnJhbWVdKVxuICAgIGlmKGhpdCkge1xuICAgICAgIVEuc3RhdGUuZ2V0KCdub211c2ljJykgJiYgUS5hdWRpby5wbGF5KCdhc3NldHMvaGl0LScgKyBfLnNhbXBsZShbMSwyLDMsNF0pICsgJy5tcDMnKVxuICAgICAgdmFyIHZhbHVlID0gdGhpcy5wLnRhcmdldC5oaXQodGhpcy5wLmRpciAqIHRoaXMuaGl0Rm9yY2VbdGhpcy5wLmFuaW1hdGlvbl0sIGhpdClcblxuICAgICAgdmFyIHByZXZNb3ZlbWVudCA9IHRoaXMucC5tb3ZlbWVudHNbdGhpcy5wLm1vdmVtZW50cy5sZW5ndGgtMV1cbiAgICAgIGlmKHByZXZNb3ZlbWVudCAmJiBwcmV2TW92ZW1lbnQuaW5kZXhPZignc29rdScpID4gLTEpIHtcbiAgICAgICAgdmFsdWUgKz0gMVxuICAgICAgfVxuXG4gICAgICB2YXIgc2NvcmUgPSBRLnN0YXRlLmdldChcInNjb3JlLVwiICsgdGhpcy5wLmkpIHx8IDBcbiAgICAgIFEuc3RhdGUuaW5jKFwidG90YWwtc2NvcmUtXCIgKyB0aGlzLnAuaSwgdmFsdWUqMTAwKVxuICAgICAgUS5zdGF0ZS5zZXQoXCJzY29yZS1cIiArIHRoaXMucC5pLCBNYXRoLm1pbigoc2NvcmUgKyB2YWx1ZSksIDQpKTtcbiAgICB9IGVsc2UgaWYoIXRoaXMucC5taXNzZWQpIHtcbiAgICAgIHRoaXMucC5taXNzZWQgPSB0cnVlXG4gICAgICAhUS5zdGF0ZS5nZXQoJ25vbXVzaWMnKSAmJiBRLmF1ZGlvLnBsYXkoJ2Fzc2V0cy9taXNzLScgKyBfLnNhbXBsZShbMSwxLDEsMSwxLDEsMl0pICsgJy5tcDMnKVxuICAgIH1cbiAgfSxcblxuICBoaXRUZXN0OiBmdW5jdGlvbihjb2xsKSB7XG4gICAgaWYoIXRoaXMucC50YXJnZXQpIHJldHVybiBmYWxzZVxuICAgIGlmKHRoaXMucC50YXJnZXQucC5oaXQpIHJldHVybiBmYWxzZVxuICAgIHZhciB0ID0gdGhpcy5wLnRhcmdldCxcbiAgICAgICAgdHAgPSB0aGlzLnAudGFyZ2V0LnAsXG4gICAgICAgIHR0ID0gY29sbGlzaW9uc1t0cC5hbmltYXRpb25dLnRvcnNvW3RwLmFuaW1hdGlvbkZyYW1lXSxcbiAgICAgICAgdGggPSBjb2xsaXNpb25zW3RwLmFuaW1hdGlvbl0uaGVhZFt0cC5hbmltYXRpb25GcmFtZV0sXG4gICAgICAgIGNyID0gcmVjdCh0aGlzLl9hYnN4KGNvbGwueCwgY29sbC53KSwgdGhpcy5fYWJzeShjb2xsLnkpLCBjb2xsLncsIGNvbGwuaClcblxuICAgIGlmKGludGVyc2VjdHMocmVjdCh0Ll9hYnN4KHRoLngsIHRoLncpLCB0Ll9hYnN5KHRoLnkpLCB0aC53LCB0dC5oKSwgY3IpKSB7XG4gICAgICByZXR1cm4gJ2hlYWQnXG4gICAgfVxuICAgIFxuICAgIGlmKGludGVyc2VjdHMocmVjdCh0Ll9hYnN4KHR0LngsIHR0LncpLCB0Ll9hYnN5KHR0LnkpLCB0dC53LCB0dC5oKSwgY3IpKSB7XG4gICAgICByZXR1cm4gJ3RvcnNvJ1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZVxuICB9LFxuXG4gIGhpdDogZnVuY3Rpb24oZm9yY2UsIGhpdCkge1xuICAgIHRoaXMuc3RhbmQoKVxuICAgIHRoaXMucC5oaXQgPSB0cnVlIC8vJiYgTWF0aC5yYW5kb20oKSA+IC44XG4gICAgaWYoaGl0ID09PSAnaGVhZCcgJiYgTWF0aC5hYnMoZm9yY2UpID4gMzUgKSB7XG4gICAgICAhUS5zdGF0ZS5nZXQoJ25vbXVzaWMnKSAmJiBRLmF1ZGlvLnBsYXkoJ2Fzc2V0cy9oZWFkLW9mZi0nICsgXy5zYW1wbGUoWzEsMiwzXSkgKyAnLm1wMycpXG4gICAgICB0aGlzLnNoZWV0KFwiaGVhZG9mZi1oaXRcIilcbiAgICAgIHRoaXMucGxheSgnaGVhZG9mZmhpdCcsIDEpXG4gICAgICB0aGlzLnN0YWdlLmluc2VydChuZXcgUS5IZWFkKHRoaXMsIGZvcmNlKSlcbiAgICAgIHJldHVybiA0XG4gICAgfSBlbHNlIHtcbiAgICAgICFRLnN0YXRlLmdldCgnbm9tdXNpYycpICYmIFEuYXVkaW8ucGxheSgnYXNzZXRzL2h1cnQtJyArIF8uc2FtcGxlKFsxLDIsM10pICsgJy5tcDMnKVxuICAgICAgdGhpcy5wLnZ4ICs9IGZvcmNlXG4gICAgICB0aGlzLnNoZWV0KFwidG9yc28taGl0XCIpXG4gICAgICB0aGlzLnBsYXkoJ3RvcnNvaGl0JywgMSlcbiAgICAgIHJldHVybiAxXG4gICAgfVxuICB9LFxuXG4gIGZpbmlzaEtpY2tzOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLm9mZignc3RlcCcsIHRoaXMsICdoaXRTdGVwJylcbiAgICB0aGlzLm9mZignc3RlcCcsIHRoaXMsICdmdWpvZ2VyaVN0ZXAnKVxuICAgIHRoaXMub2ZmKCdzdGVwJywgdGhpcywgJ2Z1am9nZXJpRm9yd2FyZFN0ZXAnKVxuICAgIHRoaXMub2ZmKCdzdGVwJywgdGhpcywgJ3NlbnRhaW5vdHN1a2lTdGVwJylcbiAgICB0aGlzLm9mZigncHJlc3RlcCcsIHRoaXMsICdmaW5pc2hLaWNrcycpXG4gIH0sXG5cbiAgc3RhbmQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC5mcmFtZSA9IDBcbiAgICB0aGlzLnAudnggPSAwXG4gICAgdGhpcy5wbGF5KCdzdGFuZCcsIDEsIHRydWUpXG4gICAgdGhpcy5zaGVldChcInRzdWlzb2t1XCIpXG4gICAgdGhpcy5wLmp1bXBpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnAuYXR0YWNraW5nID0gZmFsc2U7XG4gICAgdGhpcy5wLndhbGtpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnAuaGl0ID0gZmFsc2U7XG4gICAgdGhpcy5wLnRhcmdldCA9IG51bGw7XG4gICAgdGhpcy5maW5pc2hLaWNrcygpXG4gIH0sXG5cbiAgcHJlc3RlcDogZnVuY3Rpb24odCkge1xuICAgIGlmKHRoaXMucC5kaXJlY3Rpb24gPT09ICdsZWZ0Jykge1xuICAgICAgdGhpcy5zZXQoe2ZsaXA6ICd4J30pXG4gICAgICB0aGlzLnAuZGlyID0gLTFcbiAgICAgIHRoaXMucC5vcHBvc2l0ZURpcmVjdGlvbiA9ICdyaWdodCdcbiAgICAgIHRoaXMucC5jeCA9IDEyXG4gICAgfVxuICAgIGlmKHRoaXMucC5kaXJlY3Rpb24gPT09ICdyaWdodCcpIHtcbiAgICAgIHRoaXMuc2V0KHtmbGlwOiAnJ30pXG4gICAgICB0aGlzLnAuZGlyID0gMVxuICAgICAgdGhpcy5wLm9wcG9zaXRlRGlyZWN0aW9uID0gJ2xlZnQnXG4gICAgICB0aGlzLnAuY3ggPSAxMFxuICAgIH1cbiAgfVxuXG59KTtcbiIsInZhciBRID0gcmVxdWlyZSgnLi9RJylcblxuUS5HYW1lT2JqZWN0LmV4dGVuZChcIkh1ZFwiLHtcblxuICBpbml0OiBfLm9uY2UoZnVuY3Rpb24oKSB7XG5cbiAgICB0aGlzLmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLmVsLmNsYXNzTmFtZSA9ICdodWQnXG4gICAgdGhpcy5lbC5pbm5lckhUTUwgPSBcbiAgICAgICc8ZGl2IGNsYXNzPVwiaHVkLWFcIj48c3BhbiBjbGFzcz1cInNjb3JlIHNjb3JlLWEgc2NvcmUtMFwiPjwvc3Bhbj48c3BhbiBjbGFzcz1cInNjb3JlLXZhbHVlXCI+PC9zcGFuPjwvZGl2PicgK1xuICAgICAgJzxkaXYgY2xhc3M9XCJodWQtYlwiPjxzcGFuIGNsYXNzPVwic2NvcmUgc2NvcmUtYiBzY29yZS0wXCI+PC9zcGFuPjxzcGFuIGNsYXNzPVwic2NvcmUtdmFsdWVcIj48L3NwYW4+PC9kaXY+JyArXG4gICAgICAnPGRpdiBjbGFzcz1cImh1ZC1jXCI+PHNwYW4gY2xhc3M9XCJzY29yZSBzY29yZS1jIHNjb3JlLTBcIj48L3NwYW4+PHNwYW4gY2xhc3M9XCJzY29yZS12YWx1ZVwiPjwvc3Bhbj48L2Rpdj4nXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmVsKVxuXG4gICAgdGhpcy5zY29yZUEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2NvcmUtYScpXG4gICAgdGhpcy5zY29yZUIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2NvcmUtYicpXG4gICAgdGhpcy5zY29yZUMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2NvcmUtYycpXG5cbiAgICB0aGlzLnJlc2V0KClcbiAgfSksXG5cbiAgcmVmcmVzaDogZnVuY3Rpb24oKSB7XG4gICAgWydhJywgJ2InLCAnYyddLmZvckVhY2goXy5iaW5kKGZ1bmN0aW9uKGkpIHtcbiAgICAgIHZhciBzY29yZUVsID0gdGhpc1snc2NvcmUnICsgaS50b1VwcGVyQ2FzZSgpXSxcbiAgICAgICAgICBzY29yZVZhbHVlRWwgPSBzY29yZUVsLnBhcmVudE5vZGUucXVlcnlTZWxlY3RvcignLnNjb3JlLXZhbHVlJyksXG4gICAgICAgICAgc2NvcmUgPSBRLnN0YXRlLmdldCgnc2NvcmUtJyArIGkpIHx8IDBcbiAgICAgIHNjb3JlRWwuY2xhc3NOYW1lID0gc2NvcmVFbC5jbGFzc05hbWUucmVwbGFjZSgvc2NvcmUtXFxkL2csICcnKVxuICAgICAgc2NvcmVFbC5jbGFzc0xpc3QuYWRkKCdzY29yZS0nICsgc2NvcmUpXG4gICAgICBzY29yZVZhbHVlRWwuaW5uZXJIVE1MID0gUS5zdGF0ZS5nZXQoJ3RvdGFsLXNjb3JlLScgKyBpKVxuICAgIH0sIHRoaXMpKVxuICB9LFxuXG4gIHJlc2V0OiBmdW5jdGlvbigpIHtcbiAgICBRLnN0YXRlLnNldCh7IFxuICAgICAgJ3Njb3JlLWEnOiAwLCAnc2NvcmUtYic6IDAsICdzY29yZS1jJzogMFxuICAgIH0pO1xuICAgIFEuc3RhdGUub24oXCJjaGFuZ2VcIiwgdGhpcywgJ3JlZnJlc2gnKVxuICAgIHRoaXMucmVmcmVzaCgpXG4gIH1cbn0pXG4iLCJ2YXIgUSA9IHJlcXVpcmUoJy4vUScpXG5cblEuYW5pbWF0aW9ucygnanVkZ2UnLCB7XG4gIHN0YW5kOiB7IGZyYW1lczogWzAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMTNdLCBsb29wOiB0cnVlLCByYXRlOiAxLzEwIH0sXG4gIHdhbGs6IHsgZnJhbWVzOiBfLnJhbmdlKDExKSwgbG9vcDogdHJ1ZSwgcmF0ZTogMS8yMCB9LFxuICB0YWxrOiB7IGZyYW1lczogWzEwLDExLDEyLDExXSwgbG9vcDogdHJ1ZSwgcmF0ZTogMS8xMCAgfVxufSlcblxuUS5Nb3ZpbmdTcHJpdGUuZXh0ZW5kKFwiSnVkZ2VcIiwge1xuICBcbiAgaW5pdDogZnVuY3Rpb24ocCkge1xuICAgIHRoaXMuX3N1cGVyKHAsIHsgXG4gICAgICBzcHJpdGU6IFwianVkZ2VcIixcbiAgICAgIHNoZWV0OiBcImp1ZGdlXCIsXG4gICAgICBzZW5zb3I6IHRydWUsXG4gICAgICBjeDogMTQsXG4gICAgICBzY2FsZTogLjhcbiAgICB9KTtcbiAgICB0aGlzLmFkZCgnMmQsIGFuaW1hdGlvbicpO1xuICAgIHRoaXMuc3RhbmQoKVxuXG4gICAgdGhpcy5vbignc2F5TmV4dCcsIHRoaXMsICdzYXlOZXh0JylcbiAgICB0aGlzLm9uKCdkZXN0cm95ZWQnLCB0aGlzLCAnZGVzdCcpXG4gICAgXG4gICAgdGhpcy50ZXh0RWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHRoaXMudGV4dEVsLmNsYXNzTmFtZSA9ICdqdWRnZW1lbnQnXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLnRleHRFbClcblxuICAgIFEuc3RhdGUub24oXCJjaGFuZ2VcIiwgdGhpcywgJ2p1ZGdlJylcbiAgfSxcblxuICBlbnRlcjogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLnZ4ID0gMzBcbiAgICB0aGlzLnAuZmxpcCA9IFwiXCJcbiAgICB0aGlzLnBsYXkoJ3dhbGsnLCAxKVxuICAgIHRoaXMub24oJ3N0ZXAnLCB0aGlzLCAnZW50ZXJFbmQnKVxuICB9LFxuXG4gIGVudGVyRW5kOiBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLnAueCA+IDEwMCkge1xuICAgICAgdGhpcy5wLnZ4ID0gMFxuICAgICAgdGhpcy5vZmYoJ3N0ZXAnLCB0aGlzLCAnZW50ZXJFbmQnKVxuICAgICAgdGhpcy50cmlnZ2VyKCdlbnRlckVuZCcpXG4gICAgfVxuICB9LFxuXG4gIHVzaGlybzogZnVuY3Rpb24oKSB7XG4gICAgaWYodGhpcy5wLmZsaXApIHtcbiAgICAgIHRoaXMucC5mbGlwID0gXCJcIlxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnAuZmxpcCA9IFwieFwiXG4gICAgfVxuICB9LFxuXG4gIGV4aXQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC52eCA9IC0zMFxuICAgIHRoaXMucC5mbGlwID0gXCJ4XCJcbiAgICB0aGlzLnBsYXkoJ3dhbGsnLCAxKVxuICAgIHRoaXMub24oJ3N0ZXAnLCB0aGlzLCAnZXhpdEVuZCcpXG4gIH0sXG5cbiAgZXhpdEVuZDogZnVuY3Rpb24oKSB7XG4gICAgaWYodGhpcy5wLnggPCAxNSkge1xuICAgICAgdGhpcy5wLnZ4ID0gMFxuICAgICAgdGhpcy5vZmYoJ3N0ZXAnLCB0aGlzLCAnZXhpdEVuZCcpXG4gICAgICB0aGlzLnRyaWdnZXIoJ2V4aXRFbmQnKVxuICAgICAgdGhpcy5zdGFuZCgpXG4gICAgfVxuICB9LFxuXG4gIHN0YW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAuZmxpcCA9IFwiXCJcbiAgICB0aGlzLnAuY3ggPSAxNFxuICAgIHRoaXMucGxheSgnc3RhbmQnLCAxKVxuICAgIHRoaXMub2ZmKCdlbnRlckVuZCcsIHRoaXMsICd0YWxrJylcbiAgICB0aGlzLm9mZigndGFsa0VuZCcsIHRoaXMsICdleGl0JylcbiAgICB0aGlzLm9mZignZXhpdEVuZCcsIHRoaXMsICdzdGFuZCcpXG4gICAgdGhpcy50cmlnZ2VyKCdzdGFuZCcpXG4gIH0sXG5cbiAgc2F5TmV4dDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNob2ljZXMgPSBbXCJcIl0sXG4gICAgICAgIHRleHRzID0ge1xuICAgICAgICAgIHdpbm5lcjogW1tcIlRoZSB3aW5uZXIgaXMge2NvbG9yfS5cIiwgXCJ7Y29sb3J9IHdpbnMgdGhlIHJvdW5kLlwiXV0sXG4gICAgICAgICAgc2Vjb25kOiBbW1wie2NvbG9yfSBpcyBzZWNvbmQuXCIsIFwie2NvbG9yfSBjb21lcyBpbiBzZWNvbmQuXCJdXSxcbiAgICAgICAgICBsb3NlcjogW1xuICAgICAgICAgICAgWyd7Y29sb3J9LCB5b3Ugci1yYXRlZC13b3JkLWktc2hvdWxkXFwndCBzYXkuJywgJ3tjb2xvcn0uLi4gcmVhbGx5PycsICdqdXN0Li4uIGp1c3QgZG9uXFwndCwge2NvbG9yfS4nXSxcbiAgICAgICAgICAgIFsne2NvbG9yfSwgeW91IGNhbiBzdG9wIG5vdy4nLCAne2NvbG9yfSwgeW91IGNhbiBkbyBiZXR0ZXIuJywgJ0NcXCdtb24ge2NvbG9yfSddLFxuICAgICAgICAgICAgWyd7Y29sb3J9LCBhbG1vc3QgdGhlcmUuJywgJ21heWJlIG5leHQgdGltZSB0cnkgdG8gZG8gYmV0dGVyIHtjb2xvcn0uJ10sXG4gICAgICAgICAgICBbJ1RvdWdoIGx1Y2sge2NvbG9yfS4nXVxuICAgICAgICAgIF1cbiAgICAgICAgfVxuXG4gICAgaWYgKHRoaXMucC5zYWlkID09PSAwKSBjaG9pY2VzID0gdGV4dHMud2lubmVyO1xuICAgIGVsc2Uge1xuICAgICAgaWYgKHRoaXMucC5zYWlkID09IHRoaXMuc3RhZ2UubGlzdHMucGxheWVycy5sZW5ndGgtMSkgY2hvaWNlcyA9IHRleHRzLmxvc2VyO1xuICAgICAgZWxzZSBjaG9pY2VzID0gdGV4dHMuc2Vjb25kO1xuICAgIH1cblxuICAgIHZhciBzY29yZSA9IHRoaXMucC5yZXN1bHRbdGhpcy5wLnNhaWRdLnNjb3JlLFxuICAgICAgICBjb2xvciA9IHRoaXMucC5yZXN1bHRbdGhpcy5wLnNhaWRdLmNvbG9yLFxuICAgICAgICBzY29yZVRleHRzID0gY2hvaWNlc1tzY29yZSAlIGNob2ljZXMubGVuZ3RoXSxcbiAgICAgICAgdCA9IF8uc2FtcGxlKHNjb3JlVGV4dHMpXG4gICAgdGhpcy50ZXh0RWwuaW5uZXJIVE1MID0gdC5yZXBsYWNlKCd7Y29sb3J9JywgY29sb3IpXG5cbiAgICB0aGlzLnAuc2FpZCArPSAxXG4gICAgaWYodGhpcy5wLnNhaWQgPj0gdGhpcy5zdGFnZS5saXN0cy5wbGF5ZXJzLmxlbmd0aCkge1xuICAgICAgdGhpcy5wLmQgPSBzZXRUaW1lb3V0KF8uYmluZCh0aGlzLnRhbGtFbmQsIHRoaXMpLCAyMDAwKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnAuZCA9IHNldFRpbWVvdXQoXy5iaW5kKHRoaXMudHJpZ2dlciwgdGhpcywgJ3NheU5leHQnKSwgMjAwMClcbiAgICB9XG4gIH0sXG5cbiAgdGFsazogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wbGF5KCd0YWxrJywgMSlcbiAgICB0aGlzLnAuc2FpZCA9IDBcbiAgICB0aGlzLnNheU5leHQoKVxuICB9LFxuXG4gIHRhbGtFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudGV4dEVsLmlubmVySFRNTCA9IFwiXCJcbiAgICB0aGlzLmV4aXQoKVxuICAgIHRoaXMudHJpZ2dlcigndGFsa0VuZCcpXG4gIH0sXG5cbiAganVkZ2U6IGZ1bmN0aW9uKCkge1xuICAgIC8vIGlmKHRoaXMucC5hbmltYXRpb24gIT0gJ3N0YW5kJykgcmV0dXJuO1xuICAgIHRoaXMucC5yZXN1bHQgPSBfLnNvcnRCeSh0aGlzLnN0YWdlLmxpc3RzLnBsYXllcnMubWFwKGZ1bmN0aW9uKHApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGk6IHAucC5pLCBcbiAgICAgICAgc2NvcmU6IFEuc3RhdGUuZ2V0KCdzY29yZS0nICsgcC5wLmkpLCBcbiAgICAgICAgY29sb3I6IHthOiAnb3JhbmdlJywgYjogJ2JsdWUnLCBjOiAnZ3JlZW4nfVtwLnAuaV1cbiAgICAgIH1cbiAgICB9KSwgJ3Njb3JlJykucmV2ZXJzZSgpXG4gICAgaWYodGhpcy5wLnJlc3VsdFswXS5zY29yZSA9PT0gNCkge1xuICAgICAgdGhpcy5lbnRlcigpXG4gICAgICB0aGlzLm9uKCdlbnRlckVuZCcsIHRoaXMsICd0YWxrJylcbiAgICAgIHRoaXMub24oJ3RhbGtFbmQnLCB0aGlzLCAnZXhpdCcpXG4gICAgICB0aGlzLm9uKCdleGl0RW5kJywgdGhpcywgJ3N0YW5kJylcbiAgICB9XG4gIH0sXG5cbiAgZGVzdDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy50ZXh0RWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLnRleHRFbClcbiAgICB0aGlzLm9mZignZW50ZXJFbmQnLCB0aGlzLCAndGFsaycpXG4gICAgdGhpcy5vZmYoJ3RhbGtFbmQnLCB0aGlzLCAnZXhpdCcpXG4gICAgdGhpcy5vZmYoJ2V4aXRFbmQnLCB0aGlzLCAnc3RhbmQnKVxuICAgIGNsZWFyVGltZW91dCh0aGlzLnAuZClcbiAgfVxuXG59KVxuIiwidmFyIFEgPSByZXF1aXJlKCcuL1EnKSxcbiAgICBHZXJpTW9uID0gcmVxdWlyZSgnLi9HZXJpTW9uJylcblxuUS5HZXJpTW9uLmV4dGVuZChcIlBsYXllclwiLHtcbiAgaW5pdDogZnVuY3Rpb24ocCkge1xuICAgIHRoaXMuX3N1cGVyKHAsIHt9KTtcblxuICAgIHRoaXMucC5kaXJlY3Rpb24gPSAncmlnaHQnXG4gICAgXG4gICAgLy8gUS5pbnB1dC5vbihcImZpcmVcIiwgdGhpcywgJ2ZpcmUnKTtcbiAgICB0aGlzLm9uKFwicHJlc3RlcFwiLCB0aGlzLCAnYXR0YWNrJyk7XG4gICAgdGhpcy5vbihcInByZXN0ZXBcIiwgdGhpcywgJ3Vuc29rdScpO1xuICB9LFxuXG4gIGF0dGFjazogZnVuY3Rpb24oKSB7XG4gICAgaWYodGhpcy5wLnBhdXNlZCkgcmV0dXJuO1xuICAgIFxuICAgIGlmKCFRLmlucHV0cy5maXJlKSByZXR1cm5cblxuICAgIHZhciB0YXJnZXQsIHREaXN0ID0gSW5maW5pdHksIGRpc3Q7XG4gICAgZm9yKHZhciBpPTA7IGk8dGhpcy5zdGFnZS5saXN0cy5wbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZih0aGlzLnN0YWdlLmxpc3RzLnBsYXllcnNbaV0gIT0gdGhpcykge1xuICAgICAgICBkaXN0ID0gTWF0aC5hYnModGhpcy5wLnggLSB0aGlzLnN0YWdlLmxpc3RzLnBsYXllcnNbaV0ucC54KVxuICAgICAgICBpZihkaXN0IDwgdERpc3QpIHtcbiAgICAgICAgICB0YXJnZXQgPSB0aGlzLnN0YWdlLmxpc3RzLnBsYXllcnNbaV1cbiAgICAgICAgICB0RGlzdCA9IGRpc3RcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChRLmlucHV0cy51cCAmJiBRLmlucHV0c1t0aGlzLnAuZGlyZWN0aW9uXSkge1xuICAgICAgdGhpcy5mdWpvZ2VyaUZvcndhcmQodGFyZ2V0KVxuICAgIH1cblxuICAgIGlmIChRLmlucHV0cy51cCkge1xuICAgICAgdGhpcy5mdWpvZ2VyaSh0YXJnZXQpXG4gICAgfVxuXG4gICAgaWYgKFEuaW5wdXRzLmRvd24gJiYgUS5pbnB1dHNbdGhpcy5wLm9wcG9zaXRlRGlyZWN0aW9uXSkge1xuICAgICAgdGhpcy5oYW5nZXRzdWF0ZSh0YXJnZXQpXG4gICAgfVxuXG4gICAgaWYgKFEuaW5wdXRzLmRvd24gJiYgUS5pbnB1dHNbdGhpcy5wLmRpcmVjdGlvbl0pIHtcbiAgICAgIHRoaXMuc2VudGFpbm90c3VraSh0YXJnZXQpXG4gICAgfVxuXG4gICAgaWYgKFEuaW5wdXRzLmRvd24pIHtcbiAgICAgIHRoaXMubWFuamlnZXJpKHRhcmdldClcbiAgICB9XG5cbiAgICBpZiAoUS5pbnB1dHNbdGhpcy5wLmRpcmVjdGlvbl0pIHtcbiAgICAgIHRoaXMuc3VpaGVpZ2VyaSh0YXJnZXQpXG4gICAgfVxuXG4gICAgaWYgKFEuaW5wdXRzW3RoaXMucC5vcHBvc2l0ZURpcmVjdGlvbl0pIHtcbiAgICAgIHRoaXMuc2Vuc29nZXJpKHRhcmdldClcbiAgICB9XG5cbiAgfSxcblxuICB1bnNva3U6IGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMucC5wYXVzZWQpIHJldHVybjtcblxuICAgIGlmKFEuaW5wdXRzLmZpcmUpIHJldHVyblxuXG4gICAgaWYoUS5pbnB1dHMuYWN0aW9uKSB7XG4gICAgXG4gICAgICB0aGlzLnVzaGlybygpXG4gICAgXG4gICAgfSBlbHNlIHtcblxuICAgICAgaWYoUS5pbnB1dHMudXApIHtcbiAgICAgICAgdGhpcy5rb3Nva3UoKVxuICAgICAgfVxuXG4gICAgICBpZihRLmlucHV0cy5kb3duKSB7XG4gICAgICAgIHRoaXMuZ2Vuc29rdSgpIFxuICAgICAgfVxuXG4gICAgICAvL2ZvcndhcmRcbiAgICAgIGlmKFEuaW5wdXRzW3RoaXMucC5kaXJlY3Rpb25dKSB7XG4gICAgICAgIHRoaXMubmlub2FzaGkoKSBcbiAgICAgICAgaWYodGhpcy5wLmFuaW1hdGlvbiA9PT0gJ25pbm9hc2hpJyAmJiB0aGlzLnAuYW5pbWF0aW9uRnJhbWUgPiAxKSB7XG4gICAgICAgICAgdGhpcy5zdGFuZCgpXG4gICAgICAgICAgdGhpcy50c3Vpc29rdSgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vYmFja3dhcmRcbiAgICAgIGlmKFEuaW5wdXRzW3RoaXMucC5kaXJlY3Rpb24gPT09ICdsZWZ0JyA/ICdyaWdodCcgOiAnbGVmdCddKSB7XG4gICAgICAgIHRoaXMudGFpc29rdSgpXG4gICAgICB9XG5cbiAgICB9XG5cbiAgICBcbiAgfVxuXG59KTtcbiIsIlxudmFyIFEgPSBRdWludHVzKHsgaW1hZ2VQYXRoOiAnLi8nLCBhdWRpb1BhdGg6ICcuLycsIGF1ZGlvU3VwcG9ydGVkOiBbICdtcDMnIF0gfSlcbiAgLmluY2x1ZGUoXCJBdWRpbywgU3ByaXRlcywgU2NlbmVzLCBJbnB1dCwgMkQsIEFuaW1cIilcbiAgLmVuYWJsZVNvdW5kKClcbiAgLnNldHVwKHsgbWF4aW1pemU6IHRydWUgfSlcbiAgLmNvbnRyb2xzKClcblxuUS5pbnB1dC5kaXNhYmxlVG91Y2hDb250cm9scygpXG5cblEuRXZlbnRlZC5wcm90b3R5cGUuX3RyaWdnZXIgPSBRLkV2ZW50ZWQucHJvdG90eXBlLnRyaWdnZXJcblEuRXZlbnRlZC5wcm90b3R5cGUudHJpZ2dlciAgPSBmdW5jdGlvbihldmVudCxkYXRhKSB7XG4gIC8vIEZpcnN0IG1ha2Ugc3VyZSB0aGVyZSBhcmUgYW55IGxpc3RlbmVycywgdGhlbiBjaGVjayBmb3IgYW55IGxpc3RlbmVyc1xuICAvLyBvbiB0aGlzIHNwZWNpZmljIGV2ZW50LCBpZiBub3QsIGVhcmx5IG91dC5cbiAgaWYodGhpcy5saXN0ZW5lcnMgJiYgdGhpcy5saXN0ZW5lcnNbZXZlbnRdKSB7XG4gICAgLy8gQ2FsbCBlYWNoIGxpc3RlbmVyIGluIHRoZSBjb250ZXh0IG9mIGVpdGhlciB0aGUgdGFyZ2V0IHBhc3NlZCBpbnRvXG4gICAgLy8gYG9uYCBvciB0aGUgb2JqZWN0IGl0c2VsZi5cbiAgICB2YXIgaSwgbCA9IG5ldyBBcnJheSh0aGlzLmxpc3RlbmVyc1tldmVudF0ubGVuZ3RoKSwgbGVuXG4gICAgZm9yKGk9MCxsZW4gPSB0aGlzLmxpc3RlbmVyc1tldmVudF0ubGVuZ3RoO2k8bGVuO2krKykge1xuICAgICAgbFtpXSA9IFtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnNbZXZlbnRdW2ldWzBdLCBcbiAgICAgICAgdGhpcy5saXN0ZW5lcnNbZXZlbnRdW2ldWzFdXG4gICAgICBdXG4gICAgfVxuICAgIGZvcihpPTAsbGVuID0gbC5sZW5ndGg7aTxsZW47aSsrKSB7XG4gICAgICB2YXIgbGlzdGVuZXIgPSBsW2ldO1xuICAgICAgbGlzdGVuZXJbMV0uY2FsbChsaXN0ZW5lclswXSxkYXRhKTtcbiAgICB9XG4gIH1cbn1cblxud2luZG93LlEgPSBRXG5cbm1vZHVsZS5leHBvcnRzID0gUVxuIiwidmFyIFEgPSByZXF1aXJlKCcuL1EnKVxuXG5cblxuZnVuY3Rpb24gY29sbGlzaW9ucyhuYW1lLCBhc3NldCwgc2l6ZSkge1xuICBpZighUS5hc3NldChhc3NldCkpIHsgdGhyb3cgXCJJbnZhbGlkIEFzc2V0OlwiICsgYXNzZXQ7IH1cbiAgXG4gIGV4cG9ydHMuY29sbGlzaW9uc1tuYW1lXSA9IHsgaGVhZDogW10sIHRvcnNvOiBbXSwgaGl0OiBbXSB9XG5cbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLFxuICAgICAgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpLFxuICAgICAgaW1nID0gUS5hc3NldChhc3NldCksXG4gICAgICBpbWdEYXRhLFxuICAgICAgaGVhZCA9IDE1MCxcbiAgICAgIHRvcnNvID0gMjAwLFxuICAgICAgaGl0ID0gMTAwXG4gIFxuICBjYW52YXMud2lkdGggPSBpbWcud2lkdGhcbiAgY2FudmFzLmhlaWdodCA9IGltZy5oZWlnaHRcbiAgY29udGV4dC5kcmF3SW1hZ2UoaW1nLCAwLCAwKTtcbiAgXG4gIGZ1bmN0aW9uIGZpbmQoaW1nRGF0YSwgcmNvbG9yKSB7XG4gICAgdmFyIGEgPSBBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGltZ0RhdGEuZGF0YSwgcmNvbG9yKSAvIDQsXG4gICAgICAgIGIgPSBBcnJheS5wcm90b3R5cGUubGFzdEluZGV4T2YuY2FsbChpbWdEYXRhLmRhdGEsIHJjb2xvcikgLyA0LFxuICAgICAgICBjID0ge31cbiAgICBpZihhIDwgLTEpIHJldHVybiBjXG4gICAgYy54ID0gYSAlIHNpemUudGlsZXdcbiAgICBjLnkgPSBNYXRoLmZsb29yKGEgLyBzaXplLnRpbGV3KVxuICAgIGMudyA9IGIgJSBzaXplLnRpbGV3IC0gYy54XG4gICAgYy5oID0gTWF0aC5mbG9vcihiIC8gc2l6ZS50aWxldykgLSBjLnlcbiAgICByZXR1cm4gY1xuICB9XG5cbiAgZm9yKHZhciB4ID0gMDsgeCA8IGltZy53aWR0aDsgeCs9c2l6ZS50aWxldykge1xuICAgIGltZ0RhdGEgPSBjb250ZXh0LmdldEltYWdlRGF0YSh4LCAwLCBzaXplLnRpbGV3LCBzaXplLnRpbGVoKTtcbiAgICBleHBvcnRzLmNvbGxpc2lvbnNbbmFtZV0uaGVhZC5wdXNoKGZpbmQoaW1nRGF0YSwgaGVhZCkpXG4gICAgZXhwb3J0cy5jb2xsaXNpb25zW25hbWVdLnRvcnNvLnB1c2goZmluZChpbWdEYXRhLCB0b3JzbykpXG4gICAgZXhwb3J0cy5jb2xsaXNpb25zW25hbWVdLmhpdC5wdXNoKGZpbmQoaW1nRGF0YSwgaGl0KSlcbiAgfVxufVxuZXhwb3J0cy5jb2xsaXNpb25zID0ge31cblxuXG5cblxuZnVuY3Rpb24gY29sb3JpemUoYXNzZXQsIGNvbG9yKSB7XG4gIGlmKCFRLmFzc2V0KGFzc2V0KSkgeyB0aHJvdyBcIkludmFsaWQgQXNzZXQ6XCIgKyBhc3NldDsgfVxuXG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSxcbiAgICAgIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKSxcbiAgICAgIGltZyA9IFEuYXNzZXQoYXNzZXQpLFxuICAgICAgaW1nRGF0YSxcbiAgICAgIGNvbERhdGEsXG4gICAgICBjb2xJbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuICBcbiAgY2FudmFzLndpZHRoID0gaW1nLndpZHRoXG4gIGNhbnZhcy5oZWlnaHQgPSBpbWcuaGVpZ2h0XG4gIGNvbnRleHQuZHJhd0ltYWdlKGltZywgMCwgMCk7XG4gIGltZ0RhdGEgPSBjb250ZXh0LmdldEltYWdlRGF0YSgwLCAwLCBpbWcud2lkdGgsIGltZy5oZWlnaHQpXG4gIGNvbERhdGEgPSBjb250ZXh0LmNyZWF0ZUltYWdlRGF0YShpbWcud2lkdGgsIGltZy5oZWlnaHQpXG5cbiAgZnVuY3Rpb24gc2V0Q29sb3IoYywgZCwgaSkgeyBkW2krMF0gPSBjWzBdOyBkW2krMV0gPSBjWzFdOyBkW2krMl0gPSBjWzJdOyBkW2krM10gPSBjWzNdIH1cbiAgZnVuY3Rpb24gZ2V0Q29sb3IoZCwgaSkgeyByZXR1cm4gW2RbaSswXSwgZFtpKzFdLCBkW2krMl0sIGRbaSszXV0gfVxuICBmdW5jdGlvbiBwcmV2Q29sb3IoZCwgaSkgeyByZXR1cm4gW2RbaS00XSwgZFtpLTNdLCBkW2ktMl0sIGRbaS0xXV0gfVxuICBmdW5jdGlvbiBuZXh0Q29sb3IoZCwgaSkgeyByZXR1cm4gW2RbaSs0XSwgZFtpKzVdLCBkW2krNl0sIGRbaSs3XV0gfVxuICBmdW5jdGlvbiB0cmFuc3BhcmVudChjKSB7IHJldHVybiBjWzBdID09PSAwICYmIGNbMV0gPT09IDAgJiYgY1syXSA9PT0gMCAmJiBjWzNdID09PSAwIH1cbiAgZnVuY3Rpb24gZGFyazEoYykgeyByZXR1cm4gW2NbMF0gLSAgNSwgY1sxXSAtICA1LCBjWzJdIC0gIDUsIGNbM11dIH1cbiAgZnVuY3Rpb24gZGFyazIoYykgeyByZXR1cm4gW2NbMF0gLSAyMCwgY1sxXSAtIDIwLCBjWzJdIC0gMjAsIGNbM11dIH1cbiAgZnVuY3Rpb24gZGFyazMoYykgeyByZXR1cm4gW2NbMF0gLSA4MCwgY1sxXSAtIDgwLCBjWzJdIC0gODAsIGNbM11dIH1cbiAgZnVuY3Rpb24gbGlnaHRlbihjKSB7IHJldHVybiBbY1swXSArIDMwLCBjWzFdICsgMzAsIGNbMl0gKyAzMCwgY1szXV0gfVxuICBcbiAgZm9yICh2YXIgaT0wLCBjOyBpPGltZ0RhdGEuZGF0YS5sZW5ndGg7IGkrPTQpIHtcbiAgICBjID0gZ2V0Q29sb3IoaW1nRGF0YS5kYXRhLCBpKVxuICAgIHNldENvbG9yKGxpZ2h0ZW4oYyksIGNvbERhdGEuZGF0YSwgaSlcbiAgICBpZiAoIXRyYW5zcGFyZW50KGMpKSB7XG4gICAgICBpZiAodHJhbnNwYXJlbnQocHJldkNvbG9yKGltZ0RhdGEuZGF0YSwgaS00KSkpIHtcbiAgICAgICAgc2V0Q29sb3IoZGFyazIoYyksIGNvbERhdGEuZGF0YSwgaSlcbiAgICAgIH1cbiAgICAgIGlmICh0cmFuc3BhcmVudChwcmV2Q29sb3IoaW1nRGF0YS5kYXRhLCBpKSkpIHtcbiAgICAgICAgc2V0Q29sb3IoZGFyazMoZGFyazMoY29sb3IpKSwgY29sRGF0YS5kYXRhLCBpKVxuICAgICAgfVxuICAgICAgLy8gaWYgKHRyYW5zcGFyZW50KGdldENvbG9yKGltZ0RhdGEuZGF0YSwgaSs0KjIpKSkge1xuICAgICAgLy8gICBzZXRDb2xvcihkYXJrMihkYXJrMyhjb2xvcikpLCBjb2xEYXRhLmRhdGEsIGkpXG4gICAgICAvLyB9XG4gICAgICBpZiAodHJhbnNwYXJlbnQoZ2V0Q29sb3IoaW1nRGF0YS5kYXRhLCBpKzQpKSkge1xuICAgICAgICBzZXRDb2xvcihjb2xvciwgY29sRGF0YS5kYXRhLCBpKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnRleHQucHV0SW1hZ2VEYXRhKGNvbERhdGEsIDAsIDApO1xuICBjb2xJbWcuc3JjID0gY2FudmFzLnRvRGF0YVVSTChcImltYWdlL3BuZ1wiKTtcbiAgcmV0dXJuIGNvbEltZ1xufVxuXG5cbmV4cG9ydHMubG9hZCA9IGZ1bmN0aW9uKGNiKSB7XG5cbiAgdmFyIHBsYXllckFzc2V0cyA9IFtcbiAgICBcInN1aWhlaWdlcmlcIixcbiAgICBcIm1hbmppZ2VyaVwiLFxuICAgIFwidHN1aXNva3VcIixcbiAgICBcInVzaGlyb1wiLFxuICAgIFwia29zb2t1XCIsXG4gICAgXCJuaW5vYXNoaVwiLFxuICAgIFwiZnVqb2dlcmlcIixcbiAgICBcInNlbnNvZ2VyaVwiLFxuICAgIFwic2VudGFpbm90c3VraVwiLFxuICAgIFwiaGFuZ2V0c3VhdGVcIixcbiAgICBcInRvcnNvLWhpdFwiLFxuICAgIFwiaGVhZG9mZi1oaXRcIl1cblxuICBRLmxvYWQoXG4gICAgXy5mbGF0dGVuKFtcbiAgICBcbiAgICAgIFtcImFzc2V0cy9iZy0xLnBuZ1wiLFxuICAgICAgXCJhc3NldHMvdGlsZXMucG5nXCIsXG4gICAgICBcImFzc2V0cy9qdWRnZS5wbmdcIl0sXG5cbiAgICAgIF8ubWFwKHBsYXllckFzc2V0cywgZnVuY3Rpb24obmFtZSkge1xuICAgICAgICByZXR1cm4gXCJhc3NldHMvXCIgKyBuYW1lICsgXCIucG5nXCJcbiAgICAgIH0pLFxuXG4gICAgICBfLm1hcChfLndpdGhvdXQocGxheWVyQXNzZXRzLCBcInRvcnNvLWhpdFwiLCBcImhlYWRvZmYtaGl0XCIpLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHJldHVybiBcImFzc2V0cy9cIiArIG5hbWUgKyBcIi1jb2xsaXNpb25zLnBuZ1wiXG4gICAgICB9KSxcblxuICAgICAgW1xuICAgICAgXCJhc3NldHMvYmctbG9vcC5tcDNcIiwgXG4gICAgICBcImFzc2V0cy9ib3VuY2UubXAzXCIsXG4gICAgICBcImFzc2V0cy9pdCsubXAzXCIsXG4gICAgICBcImFzc2V0cy9oZWFkLW9mZi0xLm1wM1wiLFxuICAgICAgXCJhc3NldHMvaGVhZC1vZmYtMi5tcDNcIixcbiAgICAgIFwiYXNzZXRzL2hlYWQtb2ZmLTMubXAzXCIsXG4gICAgICBcImFzc2V0cy9oaXQtMS5tcDNcIixcbiAgICAgIFwiYXNzZXRzL2hpdC0yLm1wM1wiLFxuICAgICAgXCJhc3NldHMvaGl0LTMubXAzXCIsXG4gICAgICBcImFzc2V0cy9oaXQtNC5tcDNcIixcbiAgICAgIFwiYXNzZXRzL2h1cnQtMS5tcDNcIixcbiAgICAgIFwiYXNzZXRzL2h1cnQtMi5tcDNcIixcbiAgICAgIFwiYXNzZXRzL2h1cnQtMy5tcDNcIixcbiAgICAgIFwiYXNzZXRzL21pc3MtMS5tcDNcIixcbiAgICAgIFwiYXNzZXRzL21pc3MtMi5tcDNcIlxuICAgICAgXVxuXG4gICAgXSksIGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHBsYXllclRpbGUgPSB7IHRpbGV3OiA0OCwgdGlsZWg6IDMyIH1cbiAgICBRLnNoZWV0KFwidGlsZXNcIixcImFzc2V0cy90aWxlcy5wbmdcIiwgeyB0aWxldzogMzIsIHRpbGVoOiA4IH0pO1xuICAgIFEuc2hlZXQoXCJqdWRnZVwiLCBcImFzc2V0cy9qdWRnZS5wbmdcIiwge3RpbGV3OiAzMiwgdGlsZWg6IDMyfSk7XG5cbiAgICBfLmVhY2gocGxheWVyQXNzZXRzLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICBRLmFzc2V0c1tcImFzc2V0cy9cIiArIG5hbWUgKyBcIi1hLnBuZ1wiXSA9IGNvbG9yaXplKFwiYXNzZXRzL1wiICsgbmFtZSArIFwiLnBuZ1wiLCBbMjQwLCAxMjEsIDAsIDI1NV0pO1xuICAgICAgUS5hc3NldHNbXCJhc3NldHMvXCIgKyBuYW1lICsgXCItYi5wbmdcIl0gPSBjb2xvcml6ZShcImFzc2V0cy9cIiArIG5hbWUgKyBcIi5wbmdcIiwgWzEwMiwgMTUzLCAyNTUsIDI1NV0pO1xuICAgICAgUS5hc3NldHNbXCJhc3NldHMvXCIgKyBuYW1lICsgXCItYy5wbmdcIl0gPSBjb2xvcml6ZShcImFzc2V0cy9cIiArIG5hbWUgKyBcIi5wbmdcIiwgWzY4LCAyMjEsIDg1LCAyNTVdKTtcbiAgICAgIFEuc2hlZXQobmFtZSArICctYScsIFwiYXNzZXRzL1wiICsgbmFtZSArIFwiLWEucG5nXCIsIHBsYXllclRpbGUpO1xuICAgICAgUS5zaGVldChuYW1lICsgJy1iJywgXCJhc3NldHMvXCIgKyBuYW1lICsgXCItYi5wbmdcIiwgcGxheWVyVGlsZSk7XG4gICAgICBRLnNoZWV0KG5hbWUgKyAnLWMnLCBcImFzc2V0cy9cIiArIG5hbWUgKyBcIi1jLnBuZ1wiLCBwbGF5ZXJUaWxlKTtcbiAgICB9KVxuXG4gICAgXy5lYWNoKF8ud2l0aG91dChwbGF5ZXJBc3NldHMsIFwidG9yc28taGl0XCIsIFwiaGVhZG9mZi1oaXRcIiksIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIGNvbGxpc2lvbnMobmFtZSwgXCJhc3NldHMvXCIgKyBuYW1lICsgXCItY29sbGlzaW9ucy5wbmdcIiwgcGxheWVyVGlsZSlcbiAgICB9KVxuXG4gICAgZXhwb3J0cy5jb2xsaXNpb25zLnN0YW5kID0ge1xuICAgICAgaGVhZDogW2V4cG9ydHMuY29sbGlzaW9ucy50c3Vpc29rdS5oZWFkWzBdXSxcbiAgICAgIHRvcnNvOiBbZXhwb3J0cy5jb2xsaXNpb25zLnRzdWlzb2t1LnRvcnNvWzBdXSxcbiAgICAgIGhpdDogW2V4cG9ydHMuY29sbGlzaW9ucy50c3Vpc29rdS5oaXRbMF1dXG4gICAgfVxuICAgIGV4cG9ydHMuY29sbGlzaW9ucy50YWlzb2t1ID0ge1xuICAgICAgaGVhZDogW10uY29uY2F0KGV4cG9ydHMuY29sbGlzaW9ucy50c3Vpc29rdS5oZWFkKS5yZXZlcnNlKCksXG4gICAgICB0b3JzbzogW10uY29uY2F0KGV4cG9ydHMuY29sbGlzaW9ucy50c3Vpc29rdS50b3JzbykucmV2ZXJzZSgpLFxuICAgICAgaGl0OiBbXS5jb25jYXQoZXhwb3J0cy5jb2xsaXNpb25zLnRzdWlzb2t1LmhpdCkucmV2ZXJzZSgpXG4gICAgfVxuXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvYWRlcicpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cbiAgICBjYigpXG4gIH0pO1xuXG59XG4iLCJ2YXIgUSA9IHJlcXVpcmUoJy4vUScpLFxuICAgIGFzc2V0cyA9IHJlcXVpcmUoJy4vYXNzZXRzJylcbnJlcXVpcmUoJy4vUGxheWVyJylcbnJlcXVpcmUoJy4vQXV0b1BsYXllcicpXG5yZXF1aXJlKCcuL0FuaW1QbGF5ZXInKVxucmVxdWlyZSgnLi9IdWQnKVxucmVxdWlyZSgnLi9KdWRnZScpXG5cbnZhciBsZXZlbCA9IG5ldyBRLlRpbGVMYXllcih7XG4gdGlsZXM6IFtcbiBuZXcgQXJyYXkoMTApLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gbmV3IEFycmF5KDEwKS5qb2luKCcwJykuc3BsaXQoJycpLFxuIG5ldyBBcnJheSgxMCkuam9pbignMCcpLnNwbGl0KCcnKSxcbiBuZXcgQXJyYXkoMTApLmpvaW4oJzEnKS5zcGxpdCgnJylcbiBdLCBzaGVldDogJ3RpbGVzJyBcbn0pXG5cbmZ1bmN0aW9uIGdhbWVMb29wKHN0YWdlLCBqdWRnZSkge1xuICBmdW5jdGlvbiBwYXVzZVBsYXllcnMoKSB7XG4gICAgaWYoXy5jb250YWlucyhbUS5zdGF0ZS5nZXQoJ3Njb3JlLWEnKSwgUS5zdGF0ZS5nZXQoJ3Njb3JlLWInKSwgUS5zdGF0ZS5nZXQoJ3Njb3JlLWMnKV0sIDQpKSB7XG4gICAgICBfLmludm9rZShzdGFnZS5saXN0cy5wbGF5ZXJzLCAncGF1c2UnKVxuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBjbGVhbnVwKCkgeyBcbiAgICBqdWRnZSAmJiBqdWRnZS5kZXN0cm95KClcbiAgICB0cnl7XG4gICAgICBRLmF1ZGlvLnN0b3AoXCJhc3NldHMvYmctbG9vcC5tcDNcIik7XG4gICAgICBRLmF1ZGlvLnN0b3AoXCJhc3NldHMvaXQrLm1wM1wiKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICAgIFEuc3RhdGUub2ZmKCdjaGFuZ2UnLCBwYXVzZVBsYXllcnMpXG4gICAgXy5pbnZva2Uoc3RhZ2UubGlzdHMucGxheWVycywgJ2Rlc3Ryb3knKTtcbiAgICBodWQucmVzZXQoKVxuICB9XG4gIHN0YWdlLm9uKCdkZXN0cm95ZWQnLCBjbGVhbnVwKVxuICBcbiAgZnVuY3Rpb24gZW5kR2FtZSgpIHtcbiAgICBRLnN0YWdlU2NlbmUoJ2F1dG9wbGF5JywgMSlcbiAgfVxuICBmdW5jdGlvbiBuZXdHYW1lKCkge1xuICAgIFEuc3RhdGUuc2V0KHsgJ3RvdGFsLXNjb3JlLWEnOiAwLCAndG90YWwtc2NvcmUtYic6IDAsICd0b3RhbC1zY29yZS1jJzogMCwgJ3JvdW5kJzogMCB9KTtcbiAgICAhUS5zdGF0ZS5nZXQoJ25vbXVzaWMnKSAmJiBRLmF1ZGlvLnBsYXkoJ2Fzc2V0cy9iZy1sb29wLm1wMycsIHtsb29wOiB0cnVlfSk7XG4gICAgbmV3Um91bmQoKVxuICB9XG4gIGZ1bmN0aW9uIG5ld1JvdW5kKCkge1xuICAgIGh1ZC5yZXNldCgpXG4gICAgdmFyIHBsYXllcnMgPSBzdGFnZS5saXN0cy5wbGF5ZXJzO1xuICAgIFs2NCwgMTY4LCAyNTZdLmZvckVhY2goZnVuY3Rpb24oeCwgaSkge1xuICAgICAgcGxheWVyc1tpXSAmJiBwbGF5ZXJzW2ldLnNldCh7eDogeCwgeTogMyozMiwgdnk6IDB9KVxuICAgIH0pXG4gICAgUS5zdGF0ZS5pbmMoJ3JvdW5kJywgMSlcbiAgICBpZihRLnN0YXRlLmdldCgncm91bmQnKSA9PSAyKSB7XG4gICAgICB0cnl7IFEuYXVkaW8uc3RvcChcImFzc2V0cy9iZy1sb29wLm1wM1wiKSB9IGNhdGNoIChlKXt9XG4gICAgICAhUS5zdGF0ZS5nZXQoJ25vbXVzaWMnKSAmJiBRLmF1ZGlvLnBsYXkoXCJhc3NldHMvaXQrLm1wM1wiLCB7bG9vcDogdHJ1ZX0pO1xuICAgIH1cbiAgICBfLmludm9rZShzdGFnZS5saXN0cy5wbGF5ZXJzLCAndW5wYXVzZScpXG4gIH1cbiAgZnVuY3Rpb24gcm91bmRFbmQoKSB7XG4gICAgdmFyIHNjb3JlcyA9IF8uc29ydEJ5KHN0YWdlLmxpc3RzLnBsYXllcnMubWFwKGZ1bmN0aW9uKHApIHtcbiAgICAgIHJldHVybiB7aTogcC5wLmksIHNjb3JlOiBRLnN0YXRlLmdldCgnc2NvcmUtJysgcC5wLmkpfVxuICAgIH0pLCAnc2NvcmUnKVxuICAgIGlmKHNjb3Jlc1swXS5pID09PSAnYScgJiYgc2NvcmVzWzBdLnNjb3JlIDwgc2NvcmVzWzFdLnNjb3JlKSB7XG4gICAgICBlbmRHYW1lKClcbiAgICB9IGVsc2Uge1xuICAgICAgbmV3Um91bmQoKVxuICAgIH1cbiAgfVxuICBRLnN0YXRlLm9uKCdjaGFuZ2UnLCBwYXVzZVBsYXllcnMpXG4gIGp1ZGdlLm9uKCd0YWxrRW5kJywgcm91bmRFbmQpXG4gIG5ld0dhbWUoKVxufVxuXG5RLnNjZW5lKCdiZycsIGZ1bmN0aW9uKHN0YWdlKSB7XG4gIHZhciBiZyA9IHN0YWdlLmluc2VydChuZXcgUS5TcHJpdGUoe1xuICAgIGFzc2V0OiBcImFzc2V0cy9iZy0xLnBuZ1wiLFxuICAgIHNjYWxlOiA1NzYvOTAwXG4gIH0pKVxuICBiZy5jZW50ZXIoKVxuICBiZy5wLnkgPSAyMzVcbiAgc3RhZ2Uub24oXCJkZXN0cm95XCIsZnVuY3Rpb24oKSB7XG4gICAganVkZ2UuZGVzdHJveSgpXG4gIH0pO1xufSlcblxuUS5zY2VuZShcImFuaW1zXCIsIGZ1bmN0aW9uKHN0YWdlKSB7XG4gIHZhciBsYXllciA9IHN0YWdlLmNvbGxpc2lvbkxheWVyKGxldmVsKTtcbiAgdmFyIHBsYXllcmEgPSBzdGFnZS5pbnNlcnQobmV3IFEuQW5pbVBsYXllcih7eDogNjQsIHk6IDMqMzJ9KSlcbiAgc3RhZ2UuYWRkKFwidmlld3BvcnRcIilcbiAgc3RhZ2Uudmlld3BvcnQuc2NhbGUgPSAyXG4gIHN0YWdlLnZpZXdwb3J0LmNlbnRlck9uKGxheWVyLnAudy8yLCBsYXllci5wLmgvMilcbn0pXG5cblEuc2NlbmUoXCJwbGF5LTFvbjFcIiwgZnVuY3Rpb24oc3RhZ2UpIHtcbiAgdmFyIGxheWVyID0gc3RhZ2UuY29sbGlzaW9uTGF5ZXIobGV2ZWwpO1xuICBzdGFnZS5hZGRUb0xpc3QoJ3BsYXllcnMnLCBzdGFnZS5pbnNlcnQobmV3IFEuUGxheWVyKHtpOiAnYSd9KSkpXG4gIHN0YWdlLmFkZFRvTGlzdCgncGxheWVycycsIHN0YWdlLmluc2VydChuZXcgUS5BdXRvUGxheWVyKHtpOiAnYid9KSkpXG4gIHZhciBqdWRnZSA9IHN0YWdlLmluc2VydChuZXcgUS5KdWRnZSh7eDogMjQsIHk6IDMqMzJ9KSlcbiAgc3RhZ2UuYWRkKFwidmlld3BvcnRcIilcbiAgc3RhZ2Uudmlld3BvcnQuc2NhbGUgPSAyXG4gIHN0YWdlLnZpZXdwb3J0LmNlbnRlck9uKGxheWVyLnAudy8yLCBsYXllci5wLmgvMilcbiAgZ2FtZUxvb3Aoc3RhZ2UsIGp1ZGdlKVxufSlcblxuUS5zY2VuZShcInBsYXktMW9uMlwiLCBmdW5jdGlvbihzdGFnZSkge1xuICB2YXIgbGF5ZXIgPSBzdGFnZS5jb2xsaXNpb25MYXllcihsZXZlbCk7XG4gIHN0YWdlLmFkZFRvTGlzdCgncGxheWVycycsIHN0YWdlLmluc2VydChuZXcgUS5QbGF5ZXIoe2k6ICdhJ30pKSlcbiAgc3RhZ2UuYWRkVG9MaXN0KCdwbGF5ZXJzJywgc3RhZ2UuaW5zZXJ0KG5ldyBRLkF1dG9QbGF5ZXIoe2k6ICdiJ30pKSlcbiAgc3RhZ2UuYWRkVG9MaXN0KCdwbGF5ZXJzJywgc3RhZ2UuaW5zZXJ0KG5ldyBRLkF1dG9QbGF5ZXIoe2k6ICdjJ30pKSlcbiAgdmFyIGp1ZGdlID0gc3RhZ2UuaW5zZXJ0KG5ldyBRLkp1ZGdlKHt4OiAyNCwgeTogMyozMn0pKVxuICBzdGFnZS5hZGQoXCJ2aWV3cG9ydFwiKVxuICBzdGFnZS52aWV3cG9ydC5zY2FsZSA9IDJcbiAgc3RhZ2Uudmlld3BvcnQuY2VudGVyT24obGF5ZXIucC53LzIsIGxheWVyLnAuaC8yKVxuICBnYW1lTG9vcChzdGFnZSwganVkZ2UpXG59KVxuXG5RLnNjZW5lKFwiYXV0b3BsYXlcIiwgZnVuY3Rpb24oc3RhZ2UpIHtcbiAgdmFyIGxheWVyID0gc3RhZ2UuY29sbGlzaW9uTGF5ZXIobGV2ZWwpO1xuICBzdGFnZS5hZGRUb0xpc3QoJ3BsYXllcnMnLCBzdGFnZS5pbnNlcnQobmV3IFEuQXV0b1BsYXllcih7aTogJ2EnfSkpKVxuICBzdGFnZS5hZGRUb0xpc3QoJ3BsYXllcnMnLCBzdGFnZS5pbnNlcnQobmV3IFEuQXV0b1BsYXllcih7aTogJ2InfSkpKVxuICBzdGFnZS5hZGRUb0xpc3QoJ3BsYXllcnMnLCBzdGFnZS5pbnNlcnQobmV3IFEuQXV0b1BsYXllcih7aTogJ2MnfSkpKVxuICB2YXIganVkZ2UgPSBzdGFnZS5pbnNlcnQobmV3IFEuSnVkZ2Uoe3g6IDI0LCB5OiAzKjMyfSkpXG4gIHN0YWdlLmFkZChcInZpZXdwb3J0XCIpXG4gIHN0YWdlLnZpZXdwb3J0LnNjYWxlID0gMlxuICBzdGFnZS52aWV3cG9ydC5jZW50ZXJPbihsYXllci5wLncvMiwgbGF5ZXIucC5oLzIpXG4gIGdhbWVMb29wKHN0YWdlLCBqdWRnZSlcbn0pXG5cbnZhciBodWRcbmFzc2V0cy5sb2FkKGZ1bmN0aW9uKCkge1xuICBodWQgPSBuZXcgUS5IdWQoKVxuICBodWQuaW5pdCgpXG4gIFEuc3RhZ2VTY2VuZShcImJnXCIsIDApO1xuICBRLnN0YWdlU2NlbmUoXCJhdXRvcGxheVwiLCAxKTtcbiAgUS5zdGF0ZS5zZXQoJ25vbXVzaWMnLCBmYWxzZSlcbiAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIGZ1bmN0aW9uKGUpIHtcbiAgICBpZihlLmtleUNvZGUgPT0gNDkpIHtcbiAgICAgIFEuY2xlYXJTdGFnZSgxKVxuICAgICAgUS5zdGFnZVNjZW5lKFwicGxheS0xb24xXCIsIDEpO1xuICAgIH1cbiAgICBpZihlLmtleUNvZGUgPT0gNTApIHtcbiAgICAgIFEuY2xlYXJTdGFnZSgxKVxuICAgICAgUS5zdGFnZVNjZW5lKFwicGxheS0xb24yXCIsIDEpO1xuICAgIH1cbiAgICBpZihlLmtleUNvZGUgPT0gNzcpIHtcbiAgICAgIGlmKFEuc3RhdGUuZ2V0KCdub211c2ljJykpIHtcbiAgICAgICAgUS5zdGF0ZS5zZXQoJ25vbXVzaWMnLCBmYWxzZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIFEuc3RhdGUuc2V0KCdub211c2ljJywgdHJ1ZSlcbiAgICAgICAgUS5hdWRpby5zdG9wKClcbiAgICAgIH1cbiAgICB9XG4gIH0pXG59KVxuY29uc29sZS5sb2coUSkiXX0=
