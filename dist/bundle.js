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
            ['{color}, you bitch.', '{color}... really?', 'just... just don\'t, {color}.'],
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
      this.p.d = setTimeout(_.bind(this.talkEnd, this), 2500)
    } else {
      this.p.d = setTimeout(_.bind(this.trigger, this, 'sayNext'), 2500)
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
    if(this.p.animation != 'stand') return;
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
      if (transparent(prevColor(imgData.data, i-4))) {
        setColor(dark3(c), colData.data, i)
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
    Q.audio.stop("assets/bg-loop.mp3");
    Q.audio.stop("assets/it+.mp3");
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
      Q.audio.stop("assets/bg-loop.mp3");
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
  bg.p.y = 230
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvQW5pbVBsYXllci5qcyIsImxpYi9BdXRvUGxheWVyLmpzIiwibGliL0dlcmlNb24uanMiLCJsaWIvSHVkLmpzIiwibGliL0p1ZGdlLmpzIiwibGliL1BsYXllci5qcyIsImxpYi9RLmpzIiwibGliL2Fzc2V0cy5qcyIsImxpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgUSA9IHJlcXVpcmUoJy4vUScpXG5yZXF1aXJlKCcuL0dlcmlNb24nKVxuXG5cbmZ1bmN0aW9uIGRpc3RhbmNlKGEsIGIpIHtcbiAgdmFyIHggPSBNYXRoLmFicyhhLnAueCAtIGIucC54KSxcbiAgICAgIHkgPSBNYXRoLmFicyhhLnAueSAtIGIucC55KVxuICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSk7XG59XG5cbmZ1bmN0aW9uIHNwb3RBdHRhY2sodGFyZ2V0KSB7XG4gIGlmKHRhcmdldC5wLmFuaW1hdGlvbiA9PT0gJ2Z1am9nZXJpJykge1xuICAgIGlmKHRhcmdldC5wLmFuaW1hdGlvbkZyYW1lID4gNClcbiAgICAgIHJldHVybiAnZnVqb2dlcmknXG4gIH1cbiAgaWYodGFyZ2V0LnAuYW5pbWF0aW9uID09PSAnc3VpaGVpZ2VyaScpIHtcbiAgICBpZih0YXJnZXQucC5hbmltYXRpb25GcmFtZSA+IDQpXG4gICAgICByZXR1cm4gJ3N1aWhlaWdlcmknXG4gIH1cbiAgaWYodGFyZ2V0LnAuYW5pbWF0aW9uID09PSAnbWFuamlnZXJpJykge1xuICAgIGlmKHRhcmdldC5wLmFuaW1hdGlvbkZyYW1lID4gNClcbiAgICAgIHJldHVybiAnbWFuamlnZXJpJ1xuICB9IFxufVxuXG5RLkdlcmlNb24uZXh0ZW5kKFwiQW5pbVBsYXllclwiLCB7XG5cbiAgYXR0YWNrU2VxdWVuY2U6IFsnc2Vuc29nZXJpJywgJ21hbmppZ2VyaScsICdmdWpvZ2VyaScsICdzdWloZWlnZXJpJywgJ3NlbnRhaW5vdHN1a2knLCAnaGFuZ2V0c3VhdGUnXSxcbiAgdW5zb2t1U2VxdWVuY2U6IFsnbmlub2FzaGknLCAndHN1aXNva3UnLCAna29zb2t1JywgJ2dlbnNva3UnLCAndGFpc29rdScsICd1c2hpcm8nXSxcblxuICBpbml0OiBmdW5jdGlvbihwKSB7XG4gICAgdGhpcy5fc3VwZXIoXy5leHRlbmQoe1xuICAgICAgYW5pbTogbnVsbCxcbiAgICAgIHNlcXVlbmNlOiB0aGlzLmF0dGFja1NlcXVlbmNlXG4gICAgfSwgcCkpXG4gICAgLy8gdGhpcy5vbignc3RhbmQnLCB0aGlzLCAnbmV4dCcpXG4gICAgLy8gdGhpcy5uZXh0KClcbiAgfSxcblxuICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgbiA9IHRoaXMucC5zZXF1ZW5jZVt0aGlzLnAuc2VxdWVuY2UuaW5kZXhPZih0aGlzLnAuYW5pbSkgKyAxXSB8fCB0aGlzLnAuc2VxdWVuY2VbMF1cbiAgICBpZih0aGlzW25dKCkpIHtcbiAgICAgIHRoaXMucC5hbmltID0gblxuICAgIH1cbiAgfSxcblxuICBzdGVwOiBmdW5jdGlvbih0KSB7XG4gICAgaWYoUS5pbnB1dHMuZmlyZSkge1xuICAgICAgdGhpcy5wLnNlcXVlbmNlID0gdGhpcy5wLnNlcXVlbmNlID09IHRoaXMuYXR0YWNrU2VxdWVuY2UgPyB0aGlzLnVuc29rdVNlcXVlbmNlIDogdGhpcy5hdHRhY2tTZXF1ZW5jZVxuICAgIH1cbiAgICB0aGlzLm5leHQoKVxuICB9XG5cbn0pIiwidmFyIFEgPSByZXF1aXJlKCcuL1EnKVxucmVxdWlyZSgnLi9HZXJpTW9uJylcblxuXG5mdW5jdGlvbiBkaXN0YW5jZShhLCBiKSB7XG4gIHZhciB4ID0gTWF0aC5hYnMoYS5wLnggLSBiLnAueCksXG4gICAgICB5ID0gTWF0aC5hYnMoYS5wLnkgLSBiLnAueSlcbiAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkpO1xufVxuXG5mdW5jdGlvbiBzcG90QXR0YWNrKHRhcmdldCkge1xuICBpZih0YXJnZXQucC5hdHRhY2tpbmcgJiYgdGFyZ2V0LnAuYW5pbWF0aW9uRnJhbWUgPiA0KSB7XG4gICAgcmV0dXJuIHRhcmdldC5wLmFuaW1hdGlvblxuICB9XG59XG5cblEuR2VyaU1vbi5leHRlbmQoXCJBdXRvUGxheWVyXCIsIHtcblxuICBoaXREaXN0YW5jZTogMzUsXG5cbiAgbW92ZUNsb3NlcjogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgaWYoZGlzdGFuY2UodGFyZ2V0LCB0aGlzKSA+IHRoaXMuaGl0RGlzdGFuY2UgKyB0aGlzLnAudy8yKSB7XG4gICAgICB0aGlzLnRzdWlzb2t1KClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5uaW5vYXNoaSgpXG4gICAgfVxuICB9LFxuXG4gIG1vdmVGdXJ0aGVyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICB0aGlzW18uc2FtcGxlKFsndGFpc29rdScsICdnZW5zb2t1J10pXSgpXG4gIH0sXG5cbiAgY2FuY2VsQXR0YWNrOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm5cbiAgICBpZih0aGlzLnAuYXR0YWNraW5nICYmIHRoaXMucC5hbmltYXRpb25GcmFtZSA8IDQpIHtcbiAgICAgIHRoaXMuc3RhbmQoKVxuICAgIH1cbiAgfSxcblxuICBjYW5jZWxVbnNva3U6IGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMucC53YWxraW5nKSB7XG4gICAgICBpZih0aGlzLnAuYW5pbWF0aW9uRnJhbWUgPCAzIHx8IHRoaXMucC5hbmltYXRpb25GcmFtZSA+IDYpIHtcbiAgICAgICAgdGhpcy5zdGFuZCgpXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIGF0dGFja0R1cmluZ0F0dGFjazogZnVuY3Rpb24odGFyZ2V0LCBhdHRhY2spIHtcbiAgICBpZihhdHRhY2sgPT09ICdzdWloZWlnZXJpJykge1xuICAgICAgaWYodGFyZ2V0LnAuYW5pbWF0aW9uRnJhbWUgPCA2KSB7XG4gICAgICAgIHRoaXNbXy5zYW1wbGUoWydmdWpvZ2VyaScsICdtYW5qaWdlcmknXSldKHRhcmdldClcbiAgICAgIH1cbiAgICB9XG4gICAgaWYoYXR0YWNrID09PSAnZnVqb2dlcmknKSB7XG4gICAgICBpZih0YXJnZXQucC5hbmltYXRpb25GcmFtZSA8IDEwKSB7XG4gICAgICAgIHRoaXMubWFuamlnZXJpKHRhcmdldClcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgYXR0YWNrQWZ0ZXJBdHRhY2s6IGZ1bmN0aW9uKHRhcmdldCwgYXR0YWNrKSB7XG4gICAgaWYoYXR0YWNrID09PSAnc3VpaGVpZ2VyaScpIHtcbiAgICAgIGlmKHRhcmdldC5wLmFuaW1hdGlvbkZyYW1lID4gNikge1xuICAgICAgICB0aGlzLmZ1am9nZXJpKHRhcmdldClcbiAgICAgIH1cbiAgICB9XG4gICAgaWYoYXR0YWNrID09PSAnZnVqb2dlcmknKSB7XG4gICAgICBpZih0YXJnZXQucC5hbmltYXRpb25GcmFtZSA+IDEwKSB7XG4gICAgICAgIHRoaXMubWFuamlnZXJpKHRhcmdldClcbiAgICAgIH1cbiAgICB9XG4gICAgaWYoYXR0YWNrID09PSAnbWFuamlnZXJpJykge1xuICAgICAgaWYodGFyZ2V0LnAuYW5pbWF0aW9uRnJhbWUgPiA3KSB7XG4gICAgICAgIHRoaXMuc3VpaGVpZ2VyaSh0YXJnZXQpXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIGV2YWRlOiBmdW5jdGlvbih0YXJnZXQsIGF0dGFjaykge1xuICAgIGlmKGF0dGFjaykge1xuICAgICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpXG4gICAgICB0aGlzLmNhbmNlbEF0dGFjaygpXG4gICAgICBpZihyID4gLjgpIHtcbiAgICAgICAgdGhpcy5rb3Nva3UoKVxuICAgICAgfSBlbHNlIGlmIChyID4gLjUgfHwgZGlzdGFuY2UodGFyZ2V0LCB0aGlzKSA8IHRoaXMuaGl0RGlzdGFuY2UgKiAzLzQpIHtcbiAgICAgICAgdGhpcy5nZW5zb2t1KClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudGFpc29rdSgpXG4gICAgICB9XG5cbiAgICB9XG4gIH0sXG5cbiAgYXR0YWNrOiBmdW5jdGlvbih0YXJnZXQsIGF0dGFjaykge1xuICAgIHZhciBkaXN0ID0gZGlzdGFuY2UodGFyZ2V0LCB0aGlzKVxuICAgIGlmKGRpc3QgPCAxNSkge1xuICAgICAgdGhpc1tfLnNhbXBsZShbJ2hhbmdldHN1YXRlJywgJ3RzdWlzb2t1J10pXSh0YXJnZXQpXG4gICAgfSBlbHNlIGlmKGRpc3QgPCAyNikge1xuICAgICAgdGhpc1tfLnNhbXBsZShbJ2Z1am9nZXJpJywgJ3NlbnNvZ2VyaScsICdtYW5qaWdlcmknXSldKHRhcmdldClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpc1tfLnNhbXBsZShbJ2Z1am9nZXJpRm9yd2FyZCcsICdzdWloZWlnZXJpJywgJ3NlbnRhaW5vdHN1a2knXSldKHRhcmdldClcbiAgICB9XG4gICAgLy8gaWYoZGlzdCA+IDE0ICYmIGRpc3QgPCAyMikgdGhpcy5mdWpvZ2VyaSh0YXJnZXQpXG4gICAgLy8gaWYoZGlzdCA+IDE3ICYmIGRpc3QgPCAyNikgdGhpcy5zZW5zb2dlcmkodGFyZ2V0KVxuICAgIC8vIGlmKGRpc3QgPiAyMCAmJiBkaXN0IDwgMjgpIHtcbiAgICAvLyAgIHRoaXNbXy5zYW1wbGUoWydmdWpvZ2VyaUZvcndhcmQnLCAnbWFuamlnZXJpJ10pXSh0YXJnZXQpXG4gICAgLy8gfVxuICAgIC8vIGlmKGRpc3QgPiAyNyAmJiBkaXN0IDwgMzUpIHRoaXMuc3VpaGVpZ2VyaSh0YXJnZXQpXG4gICAgLy8gdGhpc1tfLnNhbXBsZShbJ3N1aWhlaWdlcmknLCAnbWFuamlnZXJpJywgJ3NlbnNvZ2VyaScsICdtYW5qaWdlcmknLCAnc2Vuc29nZXJpJywgJ2Z1am9nZXJpJywgJ2Z1am9nZXJpRm9yd2FyZCddKV0odGFyZ2V0KSBcbiAgfSxcblxuICBsb29rQXQ6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgIHZhciBhdCA9IHRhcmdldC5wLnggPCB0aGlzLnAueCA/ICdsZWZ0JyA6ICdyaWdodCdcbiAgICBpZihhdCAhPSB0aGlzLnAuZGlyZWN0aW9uKSB0aGlzLnVzaGlybygpXG4gIH0sXG5cbiAgc3RlcDogZnVuY3Rpb24odCkge1xuICAgIHRoaXMuX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcblxuICAgIGlmKHRoaXMucC5wYXVzZWQpIHJldHVybjtcbiAgICBcbiAgICB2YXIgb3RoZXJzID0gXy5jaGFpbih0aGlzLnN0YWdlLmxpc3RzLnBsYXllcnMpLndpdGhvdXQodGhpcykuZmlsdGVyKGZ1bmN0aW9uKGkpeyByZXR1cm4gIWkucC5oaXQgfSkudmFsdWUoKSxcbiAgICAgICAgdGFyZ2V0ID0gXy5zYW1wbGUob3RoZXJzKSxcbiAgICAgICAgZGlzdCA9IHRhcmdldCA/IGRpc3RhbmNlKHRhcmdldCwgdGhpcykgOiBJbmZpbml0eTtcbiAgICBcbiAgICBpZih0YXJnZXQpIHtcblxuICAgICAgdGhpcy5sb29rQXQodGFyZ2V0KVxuXG4gICAgICBpZihkaXN0IDwgdGhpcy5oaXREaXN0YW5jZSAvIDIpIHtcbiAgICAgICAgdGhpcy5tb3ZlRnVydGhlcih0YXJnZXQpXG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmKGRpc3QgPiB0aGlzLmhpdERpc3RhbmNlKSB7XG4gICAgICAgIHRoaXMubW92ZUNsb3Nlcih0YXJnZXQpXG4gICAgICB9XG5cbiAgICAgIHZhciBzcG90ID0gc3BvdEF0dGFjayh0YXJnZXQpXG4gICAgICBpZihzcG90KSB7XG4gICAgICAgIHRoaXMuZXZhZGUodGFyZ2V0LCBzcG90KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYoZGlzdCA+IDggJiYgZGlzdCA8PSB0aGlzLmhpdERpc3RhbmNlKSB7XG4gICAgICAgICAgdGhpcy5hdHRhY2sodGFyZ2V0KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gIH1cblxufSkiLCJ2YXIgUSA9IHJlcXVpcmUoJy4vUScpLFxuICAgIGNvbGxpc2lvbnMgPSByZXF1aXJlKCcuL2Fzc2V0cycpLmNvbGxpc2lvbnNcblxuUS5hbmltYXRpb25zKCdnZXJpbW9uJywge1xuICBzdGFuZDogeyBmcmFtZXM6IFswXSB9LFxuICBzZW50YWlub3RzdWtpOiB7IGZyYW1lczogXy5yYW5nZSgyMiksIHJhdGU6IDEvMTAsIGxvb3A6IGZhbHNlLCB0cmlnZ2VyOiAnc3RhbmQnIH0sXG4gIGZ1am9nZXJpOiB7IGZyYW1lczogXy5yYW5nZSgxNSksIHJhdGU6IDEvMTAsIGxvb3A6IGZhbHNlLCB0cmlnZ2VyOiAnc3RhbmQnIH0sXG4gIHN1aWhlaWdlcmk6IHsgZnJhbWVzOiBfLnJhbmdlKDE1KSwgcmF0ZTogMS8xMCwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAgbWFuamlnZXJpOiB7IGZyYW1lczogXy5yYW5nZSgxNSksIHJhdGU6IDEvMTAsIGxvb3A6IGZhbHNlLCB0cmlnZ2VyOiAnc3RhbmQnIH0sXG4gIGhhbmdldHN1YXRlOiB7IGZyYW1lczogXy5yYW5nZSgyMSksIHJhdGU6IDEvMTAsIGxvb3A6IGZhbHNlLCB0cmlnZ2VyOiAnc3RhbmQnIH0sXG4gIHNlbnNvZ2VyaTogeyBmcmFtZXM6IF8ucmFuZ2UoMjApLCByYXRlOiAxLzEyLCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICB0c3Vpc29rdTogeyBmcmFtZXM6IF8ucmFuZ2UoMTEpLCByYXRlOiAxLzEwLCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICBrb3Nva3U6IHsgZnJhbWVzOiBfLnJhbmdlKDE4KSwgcmF0ZTogMS8xNSwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAgdXNoaXJvOiB7IGZyYW1lczogXy5yYW5nZSg3KSwgcmF0ZTogMS8xMiwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAgbmlub2FzaGk6IHsgZnJhbWVzOiBfLnJhbmdlKDYpLCByYXRlOiAxLzEwLCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICB0YWlzb2t1OiB7IGZyYW1lczogXy5yYW5nZSgxMSkucmV2ZXJzZSgpLCByYXRlOiAxLzEwLCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICB0b3Jzb2hpdDogeyBmcmFtZXM6IFswLDEsMiwzLDIsMSwwXSwgcmF0ZTogMS8xMCwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAgaGVhZG9mZmhpdDogeyBmcmFtZXM6IF8ucmFuZ2UoMTIpLmNvbmNhdChbMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTJdKSwgcmF0ZTogMS8xMCwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfVxufSk7XG5cblxuXG5mdW5jdGlvbiBpbnRlcnNlY3RzKGEsIGIpIHtcbiAgaWYoYS53ICsgYS5oICsgYi53ICsgYi5oID09IDApIHJldHVybiBmYWxzZTtcbiAgdmFyIHhJbnRlc2VjdHMgPSBhLnggPCBiLnggJiYgYS54K2EudyA+IGIueCB8fCBcbiAgICAgICAgICAgICAgICAgICBhLnggPCBiLngrYi53ICYmIGEueCthLncgPiBiLngrYi53LFxuICAgICAgeUludGVzZWN0cyA9IGEueSA8IGIueSAmJiBhLnkgKyBhLmggPiBiLnkgfHxcbiAgICAgICAgICAgICAgICAgICBhLnkgPCBiLnkrYi5oICYmIGEueSthLmggPiBiLnkrYi5oXG4gIHJldHVybiB4SW50ZXNlY3RzICYmIHlJbnRlc2VjdHNcbn1cbmZ1bmN0aW9uIHJlY3QoeCwgeSwgdywgaCkge1xuICByZXR1cm4ge1xuICAgIHg6IHh8fDAsXG4gICAgeTogeXx8MCxcbiAgICB3OiB3fHwwLFxuICAgIGg6IGh8fDBcbiAgfVxufVxuXG5mdW5jdGlvbiBhdHRhY2soZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHRhcmdldCkge1xuICAgIGlmKCF0aGlzLnAubGFuZGVkKSByZXR1cm4gZmFsc2U7XG4gICAgaWYodGhpcy5wLmhpdCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmKHRoaXMucC5hdHRhY2tpbmcpIHJldHVybiBmYWxzZTtcbiAgICBpZih0aGlzLnAud2Fsa2luZyAmJiB0aGlzLnAuYW5pbWF0aW9uRnJhbWUgPiA0IHx8IHRoaXMucC5hbmltYXRpb24gPT09ICd1c2hpcm8nKSByZXR1cm4gZmFsc2U7XG4gICAgdGhpcy5wLm1pc3NlZCA9IGZhbHNlXG4gICAgdGhpcy5wLnRhcmdldCA9IHRhcmdldFxuICAgIHRoaXMucC5hdHRhY2tpbmcgPSB0cnVlXG4gICAgdGhpcy5wLnZ4ID0gMFxuICAgIHZhciBkPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgaWYodHlwZW9mIGQgPT09ICd1bmRlZmluZWQnIHx8IGQpIHtcbiAgICAgIHRoaXMub24oJ3N0ZXAnLCB0aGlzLCAnaGl0U3RlcCcpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5mdW5jdGlvbiBqdW1wKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLnAuaGl0KSByZXR1cm4gZmFsc2U7XG4gICAgaWYodGhpcy5wLmp1bXBpbmcpIHJldHVybiBmYWxzZTtcbiAgICB0aGlzLnAuanVtcGluZyA9IHRydWVcbiAgICB2YXIgZD0gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgIHJldHVybiB0eXBlb2YgZCA9PT0gJ3VuZGVmaW5lZCcgfHwgZFxuICB9XG59XG5cbmZ1bmN0aW9uIHdhbGsoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMucC5oaXQpIHJldHVybiBmYWxzZTtcbiAgICBpZighdGhpcy5wLmxhbmRlZCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmKHRoaXMucC5hdHRhY2tpbmcpIHJldHVybiBmYWxzZTtcbiAgICBpZih0aGlzLnAud2Fsa2luZykgcmV0dXJuIGZhbHNlO1xuICAgIHRoaXMucC53YWxraW5nID0gdHJ1ZVxuICAgIHZhciBkPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgcmV0dXJuIHR5cGVvZiBkID09PSAndW5kZWZpbmVkJyB8fCBkXG4gIH1cbn1cblxuUS5Nb3ZpbmdTcHJpdGUuZXh0ZW5kKFwiSGVhZFwiLCB7XG4gIGluaXQ6IGZ1bmN0aW9uKG93bmVyLCBmb3JjZSkge1xuICAgIHRoaXMuX3N1cGVyKHt9LCB7XG4gICAgICBjb2xvcjogXCIjMDAwMDAwXCIsXG4gICAgICB3OiA0LFxuICAgICAgaDogNCxcbiAgICAgIHg6IG93bmVyLnAueCxcbiAgICAgIHk6IG93bmVyLnAueSAtIDEzLFxuICAgICAgZGlyOiAtMSpvd25lci5wLmRpcixcbiAgICAgIHNlbnNvcjogdHJ1ZSxcbiAgICAgIGxpZmU6IDBcbiAgICB9KVxuICAgIHRoaXMuYWRkKCcyZCcpO1xuICAgIHRoaXMucC52eSA9IC0xNTBcbiAgICB0aGlzLnAudnggPSB0aGlzLnAuZGlyKmZvcmNlICogMlxuICAgIHRoaXMub24oXCJidW1wLmJvdHRvbVwiLCBmdW5jdGlvbigpIHtcbiAgICAgIGlmKHRoaXMucC52eSAhPSAwKVxuICAgICAgICAhUS5zdGF0ZS5nZXQoJ25vbXVzaWMnKSAmJiBRLmF1ZGlvLnBsYXkoJ2Fzc2V0cy9ib3VuY2UubXAzJylcbiAgICB9KTtcbiAgfSxcbiAgc3RlcDogZnVuY3Rpb24odCkge1xuICAgIHRoaXMuX3N1cGVyKHQpXG4gICAgdGhpcy5wLmxpZmUgKz0gdFxuICAgIHRoaXMucC5hbmdsZSArPSB0aGlzLnAuZGlyICogdCAqIDQwMFxuICAgIGlmKHRoaXMucC5saWZlID4gNSkge1xuICAgICAgdGhpcy5kZXN0cm95KClcbiAgICB9XG4gIH1cbn0pXG5cblEuTW92aW5nU3ByaXRlLmV4dGVuZChcIkdlcmlNb25cIiwge1xuICBcbiAgc3BlZWQ6IDI1LFxuICBmcmljdGlvbjogNSxcbiAganVtcFNwZWVkOiAxMDAsXG4gIGhpdEZvcmNlOiB7XG4gICAgZnVqb2dlcmk6IDQwLFxuICAgIG1hbmppZ2VyaTogMjUsXG4gICAgc2Vuc29nZXJpOiA0MCxcbiAgICBzdWloZWlnZXJpOiAzNSxcbiAgICBzZW50YWlub3RzdWtpOiAyNSxcbiAgICBoYW5nZXRzdWF0ZTogNDBcbiAgfSxcblxuICBpbml0OiBmdW5jdGlvbihwKSB7XG4gICAgdmFyIHcgPSAyMiwgaCA9IDMyXG4gICAgdGhpcy5fc3VwZXIocCwgeyBcbiAgICAgIHNwcml0ZTogXCJnZXJpbW9uXCIsXG4gICAgICBkaXI6IDEsXG4gICAgICB3OiB3LFxuICAgICAgaDogaCxcbiAgICAgIHN3OiA0OCxcbiAgICAgIHNoOiAzMixcbiAgICAgIHNlbnNvcjogdHJ1ZSxcbiAgICAgIG1vdmVtZW50czogW10sXG4gICAgICBwb2ludHM6IFtcbiAgICAgICAgWy13LzIsIC1oLzJdLCBcbiAgICAgICAgWyB3LzIsIC1oLzIgXSwgXG4gICAgICAgIFsgdy8yLCAgaC8yIF0sIFxuICAgICAgICBbLXcvMiwgIGgvMiBdXSxcbiAgICAgIGN4OiAxMFxuICAgIH0pO1xuICAgIHRoaXMuYWRkKCcyZCwgYW5pbWF0aW9uJyk7XG4gICAgdGhpcy5wLmkgPSB0aGlzLnAuaSB8fCAnYSdcblxuICAgIHRoaXMub24oXCJzdGFuZFwiLCB0aGlzLCBcInN0YW5kXCIpO1xuICAgIHRoaXMub24oXCJwcmVzdGVwXCIsIHRoaXMsIFwicHJlc3RlcFwiKVxuICAgIHRoaXMub24oXCJidW1wLmJvdHRvbVwiLCB0aGlzLCBcImxhbmRcIik7XG4gICAgdGhpcy5vbihcImFuaW1FbmQuc2VudGFpbm90c3VraVwiLCB0aGlzLCBcInNlbnRhaW5vdHN1a2lFbmRcIilcbiAgICB0aGlzLm9uKFwiYW5pbUVuZC51c2hpcm9cIiwgdGhpcywgXCJ1c2hpcm9FbmRcIilcbiAgICB0aGlzLm9uKFwiYW5pbUVuZFwiLCB0aGlzLCBcImxvZ01vdmVtZW50XCIpXG4gICAgLy8gdGhpcy5vbihcInBvc3RkcmF3XCIsIHRoaXMsIFwicmVuZGVyQ29sbGlzaW9uc1wiKVxuXG4gICAgdGhpcy5zdGFuZCgpXG4gIH0sXG5cbiAgbG9nTW92ZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC5tb3ZlbWVudHMucHVzaCh0aGlzLnAuYW5pbWF0aW9uKVxuICAgIHRoaXMucC5tb3ZlbWVudHMgPSB0aGlzLnAubW92ZW1lbnRzLnNwbGljZSgtMylcbiAgfSxcblxuICBfYWJzeDogZnVuY3Rpb24oeCwgdykge1xuICAgIHJldHVybiB0aGlzLnAuZmxpcCA/IFxuICAgICAgdGhpcy5wLnggKyB0aGlzLnAuY3ggLSB4IC0gdyA6XG4gICAgICB0aGlzLnAueCAtIHRoaXMucC5jeCArIHhcbiAgfSxcblxuICBfYWJzeTogZnVuY3Rpb24oeSkge1xuICAgIHJldHVybiB0aGlzLnAueS10aGlzLnAuY3kgKyB5XG4gIH0sXG5cbiAgcmVuZGVyQ29sbGlzaW9uczogZnVuY3Rpb24oY3R4KSB7XG4gICAgY3R4LnNhdmUoKTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG5cbiAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsMCwwLDAuNSlcIjtcbiAgICBjdHguZmlsbFJlY3QodGhpcy5wLngtdGhpcy5wLmN4LCB0aGlzLnAueS10aGlzLnAuY3ksIHRoaXMucC53LCB0aGlzLnAuaCk7XG4gICAgY3R4LmZpbGwoKTtcbiAgICBcbiAgICB2YXIgYyA9IGNvbGxpc2lvbnNbdGhpcy5wLmFuaW1hdGlvbl0gfHwgY29sbGlzaW9ucy5zdGFuZCxcbiAgICAgICAgZnQgPSBjLnRvcnNvW3RoaXMucC5hbmltYXRpb25GcmFtZV0gfHwgYy50b3Jzb1swXSxcbiAgICAgICAgZmggPSBjLmhlYWRbdGhpcy5wLmFuaW1hdGlvbkZyYW1lXSB8fCBjLmhlYWRbMF0sXG4gICAgICAgIGZoaD0gYy5oaXQgJiYgYy5oaXRbdGhpcy5wLmFuaW1hdGlvbkZyYW1lXSB8fCB7fVxuICAgIFxuICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMjU1LDAsMjU1LDAuNSlcIjtcbiAgICBjdHguZmlsbFJlY3QodGhpcy5fYWJzeChmdC54LCBmdC53KSwgdGhpcy5fYWJzeShmdC55KSwgZnQudywgZnQuaCk7XG4gICAgY3R4LmZpbGwoKTtcblxuICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwyNTUsMjU1LDAuNSlcIjtcbiAgICBjdHguZmlsbFJlY3QodGhpcy5fYWJzeChmaC54LCBmaC53KSwgdGhpcy5fYWJzeShmaC55KSwgZmgudywgZmguaCk7XG4gICAgY3R4LmZpbGwoKTtcblxuICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMjU1LDI1NSwwLDAuNSlcIjtcbiAgICBjdHguZmlsbFJlY3QodGhpcy5fYWJzeChmaGgueCwgZmhoLncpLCB0aGlzLl9hYnN5KGZoaC55KSwgZmhoLncsIGZoaC5oKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIGN0eC5yZXN0b3JlKClcbiAgfSxcblxuICBsYW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAubGFuZGVkID0gdHJ1ZVxuICAgIHRoaXMucC5qdW1waW5nID0gZmFsc2VcbiAgfSxcblxuICBzaGVldDogZnVuY3Rpb24obmFtZSkge1xuICAgIGlmKG5hbWUpIHtcbiAgICAgIHJldHVybiB0aGlzLl9zdXBlcihuYW1lICsgJy0nICsgdGhpcy5wLmkpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9zdXBlcigpXG4gICAgfVxuICB9LFxuXG4gIHBhdXNlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAucGF1c2VkID0gdHJ1ZVxuICB9LFxuXG4gIHVucGF1c2U6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC5wYXVzZWQgPSBmYWxzZVxuICAgIHRoaXMuc3RhbmQoKVxuICB9LFxuXG4gIGZ1am9nZXJpRm9yd2FyZDoganVtcChhdHRhY2soZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zaGVldChcImZ1am9nZXJpXCIpXG4gICAgdGhpcy5wbGF5KCdmdWpvZ2VyaScsIDEpXG4gICAgdGhpcy5vbignc3RlcCcsIHRoaXMsICdmdWpvZ2VyaUZvcndhcmRTdGVwJylcbiAgICB0aGlzLm9uKCdzdGVwJywgdGhpcywgJ2Z1am9nZXJpU3RlcCcpXG4gIH0pKSxcblxuICBmdWpvZ2VyaToganVtcChhdHRhY2soZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zaGVldChcImZ1am9nZXJpXCIpXG4gICAgdGhpcy5wbGF5KCdmdWpvZ2VyaScsIDEpXG4gICAgdGhpcy5vbignc3RlcCcsIHRoaXMsICdmdWpvZ2VyaVN0ZXAnKVxuICB9KSksXG5cbiAgZnVqb2dlcmlGb3J3YXJkU3RlcDogZnVuY3Rpb24oKSB7XG4gICAgaWYodGhpcy5wLmFuaW1hdGlvbkZyYW1lID4gNCAmJiB0aGlzLnAuYW5pbWF0aW9uRnJhbWUgPCA3KSB7XG4gICAgICB0aGlzLnAudnggPSB0aGlzLnAuZGlyICogdGhpcy5zcGVlZFxuICAgICAgdGhpcy5vZmYoJ3N0ZXAnLCB0aGlzLCAnZnVqb2dlcmlGb3J3YXJkU3RlcCcpXG4gICAgfVxuICB9LFxuXG4gIGZ1am9nZXJpU3RlcDogZnVuY3Rpb24oKSB7XG4gICAgaWYodGhpcy5wLmFuaW1hdGlvbkZyYW1lID4gNCkge1xuICAgICAgdGhpcy5wLnZ5ID0gLXRoaXMuanVtcFNwZWVkXG4gICAgICB0aGlzLnAubGFuZGVkID0gZmFsc2VcbiAgICAgIHRoaXMucC5qdW1waW5nID0gdHJ1ZVxuICAgICAgdGhpcy5vZmYoJ3N0ZXAnLCB0aGlzLCAnZnVqb2dlcmlTdGVwJylcbiAgICB9XG4gIH0sXG5cbiAgaGFuZ2V0c3VhdGU6IGF0dGFjayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNoZWV0KFwiaGFuZ2V0c3VhdGVcIilcbiAgICB0aGlzLnBsYXkoJ2hhbmdldHN1YXRlJywgMSlcbiAgfSksXG5cbiAgc2VudGFpbm90c3VraTogYXR0YWNrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2hlZXQoXCJzZW50YWlub3RzdWtpXCIpXG4gICAgdGhpcy5wbGF5KCdzZW50YWlub3RzdWtpJywgMSlcbiAgfSksXG5cbiAgc2VudGFpbm90c3VraUVuZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLnggKz0gdGhpcy5wLmRpciAqIDE1XG4gIH0sXG5cbiAgbWFuamlnZXJpOiBhdHRhY2soZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zaGVldChcIm1hbmppZ2VyaVwiKVxuICAgIHRoaXMucGxheSgnbWFuamlnZXJpJywgMSlcbiAgfSksXG5cbiAgc3VpaGVpZ2VyaTogYXR0YWNrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2hlZXQoXCJzdWloZWlnZXJpXCIpXG4gICAgdGhpcy5wbGF5KCdzdWloZWlnZXJpJywgMSlcbiAgfSksXG5cbiAgc2Vuc29nZXJpOiBhdHRhY2soZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zaGVldChcInNlbnNvZ2VyaVwiKVxuICAgIHRoaXMucGxheSgnc2Vuc29nZXJpJywgMSlcbiAgfSksXG5cbiAgdXNoaXJvOiB3YWxrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2hlZXQoXCJ1c2hpcm9cIilcbiAgICB0aGlzLnBsYXkoJ3VzaGlybycsIDEpXG4gIH0pLFxuXG4gIHVzaGlyb0VuZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLnggKz0gdGhpcy5wLmRpciAqIDRcbiAgICB0aGlzLnAuZGlyZWN0aW9uID0gdGhpcy5wLmRpcmVjdGlvbiA9PT0gJ2xlZnQnID8gJ3JpZ2h0JyA6ICdsZWZ0J1xuICAgIHRoaXMucHJlc3RlcCgpXG4gIH0sXG5cbiAgbmlub2FzaGk6IHdhbGsoZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLnZ4ID0gdGhpcy5wLmRpciAqIHRoaXMuc3BlZWQvMjtcbiAgICB0aGlzLnNoZWV0KFwibmlub2FzaGlcIilcbiAgICB0aGlzLnBsYXkoJ25pbm9hc2hpJywgMSlcbiAgfSksXG5cbiAgdGFpc29rdTogd2FsayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAudnggPSAtdGhpcy5wLmRpciAqIHRoaXMuc3BlZWQ7XG4gICAgdGhpcy5zaGVldChcInRzdWlzb2t1XCIpXG4gICAgdGhpcy5wbGF5KCd0YWlzb2t1JywgMSlcbiAgfSksXG4gIFxuICB0c3Vpc29rdTogd2FsayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAudnggPSB0aGlzLnAuZGlyICogdGhpcy5zcGVlZDtcbiAgICB0aGlzLnNoZWV0KFwidHN1aXNva3VcIilcbiAgICB0aGlzLnBsYXkoJ3RzdWlzb2t1JywgMSlcbiAgfSksXG5cbiAga29zb2t1OiB3YWxrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC52eCA9IHRoaXMucC5kaXIgKiB0aGlzLnNwZWVkLzI7XG4gICAgdGhpcy5zaGVldChcImtvc29rdVwiKVxuICAgIHRoaXMucGxheSgna29zb2t1JywgMSlcbiAgfSksXG5cbiAgZ2Vuc29rdTogd2FsayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAudnggPSAtdGhpcy5wLmRpciAqIHRoaXMuc3BlZWQqMi8zO1xuICAgIHRoaXMuc2hlZXQoXCJrb3Nva3VcIilcbiAgICB0aGlzLnBsYXkoJ2tvc29rdScsIDEpXG4gIH0pLFxuXG4gIGhpdFN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgIGlmKCFjb2xsaXNpb25zW3RoaXMucC5hbmltYXRpb25dKSByZXR1cm47XG4gICAgaWYoIWNvbGxpc2lvbnNbdGhpcy5wLmFuaW1hdGlvbl0uaGl0W3RoaXMucC5hbmltYXRpb25GcmFtZV0udykgcmV0dXJuO1xuICAgIHZhciBoaXQgPSB0aGlzLmhpdFRlc3QoY29sbGlzaW9uc1t0aGlzLnAuYW5pbWF0aW9uXS5oaXRbdGhpcy5wLmFuaW1hdGlvbkZyYW1lXSlcbiAgICBpZihoaXQpIHtcbiAgICAgICFRLnN0YXRlLmdldCgnbm9tdXNpYycpICYmIFEuYXVkaW8ucGxheSgnYXNzZXRzL2hpdC0nICsgXy5zYW1wbGUoWzEsMiwzLDRdKSArICcubXAzJylcbiAgICAgIHZhciB2YWx1ZSA9IHRoaXMucC50YXJnZXQuaGl0KHRoaXMucC5kaXIgKiB0aGlzLmhpdEZvcmNlW3RoaXMucC5hbmltYXRpb25dLCBoaXQpXG5cbiAgICAgIHZhciBwcmV2TW92ZW1lbnQgPSB0aGlzLnAubW92ZW1lbnRzW3RoaXMucC5tb3ZlbWVudHMubGVuZ3RoLTFdXG4gICAgICBpZihwcmV2TW92ZW1lbnQgJiYgcHJldk1vdmVtZW50LmluZGV4T2YoJ3Nva3UnKSA+IC0xKSB7XG4gICAgICAgIHZhbHVlICs9IDFcbiAgICAgIH1cblxuICAgICAgdmFyIHNjb3JlID0gUS5zdGF0ZS5nZXQoXCJzY29yZS1cIiArIHRoaXMucC5pKSB8fCAwXG4gICAgICBRLnN0YXRlLmluYyhcInRvdGFsLXNjb3JlLVwiICsgdGhpcy5wLmksIHZhbHVlKjEwMClcbiAgICAgIFEuc3RhdGUuc2V0KFwic2NvcmUtXCIgKyB0aGlzLnAuaSwgTWF0aC5taW4oKHNjb3JlICsgdmFsdWUpLCA0KSk7XG4gICAgfSBlbHNlIGlmKCF0aGlzLnAubWlzc2VkKSB7XG4gICAgICB0aGlzLnAubWlzc2VkID0gdHJ1ZVxuICAgICAgIVEuc3RhdGUuZ2V0KCdub211c2ljJykgJiYgUS5hdWRpby5wbGF5KCdhc3NldHMvbWlzcy0nICsgXy5zYW1wbGUoWzEsMSwxLDEsMSwxLDJdKSArICcubXAzJylcbiAgICB9XG4gIH0sXG5cbiAgaGl0VGVzdDogZnVuY3Rpb24oY29sbCkge1xuICAgIGlmKCF0aGlzLnAudGFyZ2V0KSByZXR1cm4gZmFsc2VcbiAgICBpZih0aGlzLnAudGFyZ2V0LnAuaGl0KSByZXR1cm4gZmFsc2VcbiAgICB2YXIgdCA9IHRoaXMucC50YXJnZXQsXG4gICAgICAgIHRwID0gdGhpcy5wLnRhcmdldC5wLFxuICAgICAgICB0dCA9IGNvbGxpc2lvbnNbdHAuYW5pbWF0aW9uXS50b3Jzb1t0cC5hbmltYXRpb25GcmFtZV0sXG4gICAgICAgIHRoID0gY29sbGlzaW9uc1t0cC5hbmltYXRpb25dLmhlYWRbdHAuYW5pbWF0aW9uRnJhbWVdLFxuICAgICAgICBjciA9IHJlY3QodGhpcy5fYWJzeChjb2xsLngsIGNvbGwudyksIHRoaXMuX2Fic3koY29sbC55KSwgY29sbC53LCBjb2xsLmgpXG5cbiAgICBpZihpbnRlcnNlY3RzKHJlY3QodC5fYWJzeCh0aC54LCB0aC53KSwgdC5fYWJzeSh0aC55KSwgdGgudywgdHQuaCksIGNyKSkge1xuICAgICAgcmV0dXJuICdoZWFkJ1xuICAgIH1cbiAgICBcbiAgICBpZihpbnRlcnNlY3RzKHJlY3QodC5fYWJzeCh0dC54LCB0dC53KSwgdC5fYWJzeSh0dC55KSwgdHQudywgdHQuaCksIGNyKSkge1xuICAgICAgcmV0dXJuICd0b3JzbydcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2VcbiAgfSxcblxuICBoaXQ6IGZ1bmN0aW9uKGZvcmNlLCBoaXQpIHtcbiAgICB0aGlzLnN0YW5kKClcbiAgICB0aGlzLnAuaGl0ID0gdHJ1ZSAvLyYmIE1hdGgucmFuZG9tKCkgPiAuOFxuICAgIGlmKGhpdCA9PT0gJ2hlYWQnICYmIE1hdGguYWJzKGZvcmNlKSA+IDM1ICkge1xuICAgICAgIVEuc3RhdGUuZ2V0KCdub211c2ljJykgJiYgUS5hdWRpby5wbGF5KCdhc3NldHMvaGVhZC1vZmYtJyArIF8uc2FtcGxlKFsxLDIsM10pICsgJy5tcDMnKVxuICAgICAgdGhpcy5zaGVldChcImhlYWRvZmYtaGl0XCIpXG4gICAgICB0aGlzLnBsYXkoJ2hlYWRvZmZoaXQnLCAxKVxuICAgICAgdGhpcy5zdGFnZS5pbnNlcnQobmV3IFEuSGVhZCh0aGlzLCBmb3JjZSkpXG4gICAgICByZXR1cm4gNFxuICAgIH0gZWxzZSB7XG4gICAgICAhUS5zdGF0ZS5nZXQoJ25vbXVzaWMnKSAmJiBRLmF1ZGlvLnBsYXkoJ2Fzc2V0cy9odXJ0LScgKyBfLnNhbXBsZShbMSwyLDNdKSArICcubXAzJylcbiAgICAgIHRoaXMucC52eCArPSBmb3JjZVxuICAgICAgdGhpcy5zaGVldChcInRvcnNvLWhpdFwiKVxuICAgICAgdGhpcy5wbGF5KCd0b3Jzb2hpdCcsIDEpXG4gICAgICByZXR1cm4gMVxuICAgIH1cbiAgfSxcblxuICBmaW5pc2hLaWNrczogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5vZmYoJ3N0ZXAnLCB0aGlzLCAnaGl0U3RlcCcpXG4gICAgdGhpcy5vZmYoJ3N0ZXAnLCB0aGlzLCAnZnVqb2dlcmlTdGVwJylcbiAgICB0aGlzLm9mZignc3RlcCcsIHRoaXMsICdmdWpvZ2VyaUZvcndhcmRTdGVwJylcbiAgICB0aGlzLm9mZignc3RlcCcsIHRoaXMsICdzZW50YWlub3RzdWtpU3RlcCcpXG4gICAgdGhpcy5vZmYoJ3ByZXN0ZXAnLCB0aGlzLCAnZmluaXNoS2lja3MnKVxuICB9LFxuXG4gIHN0YW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAuZnJhbWUgPSAwXG4gICAgdGhpcy5wLnZ4ID0gMFxuICAgIHRoaXMucGxheSgnc3RhbmQnLCAxLCB0cnVlKVxuICAgIHRoaXMuc2hlZXQoXCJ0c3Vpc29rdVwiKVxuICAgIHRoaXMucC5qdW1waW5nID0gZmFsc2U7XG4gICAgdGhpcy5wLmF0dGFja2luZyA9IGZhbHNlO1xuICAgIHRoaXMucC53YWxraW5nID0gZmFsc2U7XG4gICAgdGhpcy5wLmhpdCA9IGZhbHNlO1xuICAgIHRoaXMucC50YXJnZXQgPSBudWxsO1xuICAgIHRoaXMuZmluaXNoS2lja3MoKVxuICB9LFxuXG4gIHByZXN0ZXA6IGZ1bmN0aW9uKHQpIHtcbiAgICBpZih0aGlzLnAuZGlyZWN0aW9uID09PSAnbGVmdCcpIHtcbiAgICAgIHRoaXMuc2V0KHtmbGlwOiAneCd9KVxuICAgICAgdGhpcy5wLmRpciA9IC0xXG4gICAgICB0aGlzLnAub3Bwb3NpdGVEaXJlY3Rpb24gPSAncmlnaHQnXG4gICAgICB0aGlzLnAuY3ggPSAxMlxuICAgIH1cbiAgICBpZih0aGlzLnAuZGlyZWN0aW9uID09PSAncmlnaHQnKSB7XG4gICAgICB0aGlzLnNldCh7ZmxpcDogJyd9KVxuICAgICAgdGhpcy5wLmRpciA9IDFcbiAgICAgIHRoaXMucC5vcHBvc2l0ZURpcmVjdGlvbiA9ICdsZWZ0J1xuICAgICAgdGhpcy5wLmN4ID0gMTBcbiAgICB9XG4gIH1cblxufSk7XG4iLCJ2YXIgUSA9IHJlcXVpcmUoJy4vUScpXG5cblEuR2FtZU9iamVjdC5leHRlbmQoXCJIdWRcIix7XG5cbiAgaW5pdDogXy5vbmNlKGZ1bmN0aW9uKCkge1xuXG4gICAgdGhpcy5lbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgdGhpcy5lbC5jbGFzc05hbWUgPSAnaHVkJ1xuICAgIHRoaXMuZWwuaW5uZXJIVE1MID0gXG4gICAgICAnPGRpdiBjbGFzcz1cImh1ZC1hXCI+PHNwYW4gY2xhc3M9XCJzY29yZSBzY29yZS1hIHNjb3JlLTBcIj48L3NwYW4+PHNwYW4gY2xhc3M9XCJzY29yZS12YWx1ZVwiPjwvc3Bhbj48L2Rpdj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwiaHVkLWJcIj48c3BhbiBjbGFzcz1cInNjb3JlIHNjb3JlLWIgc2NvcmUtMFwiPjwvc3Bhbj48c3BhbiBjbGFzcz1cInNjb3JlLXZhbHVlXCI+PC9zcGFuPjwvZGl2PicgK1xuICAgICAgJzxkaXYgY2xhc3M9XCJodWQtY1wiPjxzcGFuIGNsYXNzPVwic2NvcmUgc2NvcmUtYyBzY29yZS0wXCI+PC9zcGFuPjxzcGFuIGNsYXNzPVwic2NvcmUtdmFsdWVcIj48L3NwYW4+PC9kaXY+J1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5lbClcblxuICAgIHRoaXMuc2NvcmVBID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNjb3JlLWEnKVxuICAgIHRoaXMuc2NvcmVCID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNjb3JlLWInKVxuICAgIHRoaXMuc2NvcmVDID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNjb3JlLWMnKVxuXG4gICAgdGhpcy5yZXNldCgpXG4gIH0pLFxuXG4gIHJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuICAgIFsnYScsICdiJywgJ2MnXS5mb3JFYWNoKF8uYmluZChmdW5jdGlvbihpKSB7XG4gICAgICB2YXIgc2NvcmVFbCA9IHRoaXNbJ3Njb3JlJyArIGkudG9VcHBlckNhc2UoKV0sXG4gICAgICAgICAgc2NvcmVWYWx1ZUVsID0gc2NvcmVFbC5wYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3IoJy5zY29yZS12YWx1ZScpLFxuICAgICAgICAgIHNjb3JlID0gUS5zdGF0ZS5nZXQoJ3Njb3JlLScgKyBpKSB8fCAwXG4gICAgICBzY29yZUVsLmNsYXNzTmFtZSA9IHNjb3JlRWwuY2xhc3NOYW1lLnJlcGxhY2UoL3Njb3JlLVxcZC9nLCAnJylcbiAgICAgIHNjb3JlRWwuY2xhc3NMaXN0LmFkZCgnc2NvcmUtJyArIHNjb3JlKVxuICAgICAgc2NvcmVWYWx1ZUVsLmlubmVySFRNTCA9IFEuc3RhdGUuZ2V0KCd0b3RhbC1zY29yZS0nICsgaSlcbiAgICB9LCB0aGlzKSlcbiAgfSxcblxuICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgUS5zdGF0ZS5zZXQoeyBcbiAgICAgICdzY29yZS1hJzogMCwgJ3Njb3JlLWInOiAwLCAnc2NvcmUtYyc6IDBcbiAgICB9KTtcbiAgICBRLnN0YXRlLm9uKFwiY2hhbmdlXCIsIHRoaXMsICdyZWZyZXNoJylcbiAgICB0aGlzLnJlZnJlc2goKVxuICB9XG59KVxuIiwidmFyIFEgPSByZXF1aXJlKCcuL1EnKVxuXG5RLmFuaW1hdGlvbnMoJ2p1ZGdlJywge1xuICBzdGFuZDogeyBmcmFtZXM6IFswLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDEzXSwgbG9vcDogdHJ1ZSwgcmF0ZTogMS8xMCB9LFxuICB3YWxrOiB7IGZyYW1lczogXy5yYW5nZSgxMSksIGxvb3A6IHRydWUsIHJhdGU6IDEvMjAgfSxcbiAgdGFsazogeyBmcmFtZXM6IFsxMCwxMSwxMiwxMV0sIGxvb3A6IHRydWUsIHJhdGU6IDEvMTAgIH1cbn0pXG5cblEuTW92aW5nU3ByaXRlLmV4dGVuZChcIkp1ZGdlXCIsIHtcbiAgXG4gIGluaXQ6IGZ1bmN0aW9uKHApIHtcbiAgICB0aGlzLl9zdXBlcihwLCB7IFxuICAgICAgc3ByaXRlOiBcImp1ZGdlXCIsXG4gICAgICBzaGVldDogXCJqdWRnZVwiLFxuICAgICAgc2Vuc29yOiB0cnVlLFxuICAgICAgY3g6IDE0LFxuICAgICAgc2NhbGU6IC44XG4gICAgfSk7XG4gICAgdGhpcy5hZGQoJzJkLCBhbmltYXRpb24nKTtcbiAgICB0aGlzLnN0YW5kKClcblxuICAgIHRoaXMub24oJ3NheU5leHQnLCB0aGlzLCAnc2F5TmV4dCcpXG4gICAgdGhpcy5vbignZGVzdHJveWVkJywgdGhpcywgJ2Rlc3QnKVxuICAgIFxuICAgIHRoaXMudGV4dEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLnRleHRFbC5jbGFzc05hbWUgPSAnanVkZ2VtZW50J1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy50ZXh0RWwpXG5cbiAgICBRLnN0YXRlLm9uKFwiY2hhbmdlXCIsIHRoaXMsICdqdWRnZScpXG4gIH0sXG5cbiAgZW50ZXI6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC52eCA9IDMwXG4gICAgdGhpcy5wLmZsaXAgPSBcIlwiXG4gICAgdGhpcy5wbGF5KCd3YWxrJywgMSlcbiAgICB0aGlzLm9uKCdzdGVwJywgdGhpcywgJ2VudGVyRW5kJylcbiAgfSxcblxuICBlbnRlckVuZDogZnVuY3Rpb24oKSB7XG4gICAgaWYodGhpcy5wLnggPiAxMDApIHtcbiAgICAgIHRoaXMucC52eCA9IDBcbiAgICAgIHRoaXMub2ZmKCdzdGVwJywgdGhpcywgJ2VudGVyRW5kJylcbiAgICAgIHRoaXMudHJpZ2dlcignZW50ZXJFbmQnKVxuICAgIH1cbiAgfSxcblxuICB1c2hpcm86IGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMucC5mbGlwKSB7XG4gICAgICB0aGlzLnAuZmxpcCA9IFwiXCJcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wLmZsaXAgPSBcInhcIlxuICAgIH1cbiAgfSxcblxuICBleGl0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAudnggPSAtMzBcbiAgICB0aGlzLnAuZmxpcCA9IFwieFwiXG4gICAgdGhpcy5wbGF5KCd3YWxrJywgMSlcbiAgICB0aGlzLm9uKCdzdGVwJywgdGhpcywgJ2V4aXRFbmQnKVxuICB9LFxuXG4gIGV4aXRFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMucC54IDwgMTUpIHtcbiAgICAgIHRoaXMucC52eCA9IDBcbiAgICAgIHRoaXMub2ZmKCdzdGVwJywgdGhpcywgJ2V4aXRFbmQnKVxuICAgICAgdGhpcy50cmlnZ2VyKCdleGl0RW5kJylcbiAgICAgIHRoaXMuc3RhbmQoKVxuICAgIH1cbiAgfSxcblxuICBzdGFuZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLmZsaXAgPSBcIlwiXG4gICAgdGhpcy5wLmN4ID0gMTRcbiAgICB0aGlzLnBsYXkoJ3N0YW5kJywgMSlcbiAgICB0aGlzLm9mZignZW50ZXJFbmQnLCB0aGlzLCAndGFsaycpXG4gICAgdGhpcy5vZmYoJ3RhbGtFbmQnLCB0aGlzLCAnZXhpdCcpXG4gICAgdGhpcy5vZmYoJ2V4aXRFbmQnLCB0aGlzLCAnc3RhbmQnKVxuICAgIHRoaXMudHJpZ2dlcignc3RhbmQnKVxuICB9LFxuXG4gIHNheU5leHQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjaG9pY2VzID0gW1wiXCJdLFxuICAgICAgICB0ZXh0cyA9IHtcbiAgICAgICAgICB3aW5uZXI6IFtbXCJUaGUgd2lubmVyIGlzIHtjb2xvcn0uXCIsIFwie2NvbG9yfSB3aW5zIHRoZSByb3VuZC5cIl1dLFxuICAgICAgICAgIHNlY29uZDogW1tcIntjb2xvcn0gaXMgc2Vjb25kLlwiLCBcIntjb2xvcn0gY29tZXMgaW4gc2Vjb25kLlwiXV0sXG4gICAgICAgICAgbG9zZXI6IFtcbiAgICAgICAgICAgIFsne2NvbG9yfSwgeW91IGJpdGNoLicsICd7Y29sb3J9Li4uIHJlYWxseT8nLCAnanVzdC4uLiBqdXN0IGRvblxcJ3QsIHtjb2xvcn0uJ10sXG4gICAgICAgICAgICBbJ3tjb2xvcn0sIHlvdSBjYW4gc3RvcCBub3cuJywgJ3tjb2xvcn0sIHlvdSBjYW4gZG8gYmV0dGVyLicsICdDXFwnbW9uIHtjb2xvcn0nXSxcbiAgICAgICAgICAgIFsne2NvbG9yfSwgYWxtb3N0IHRoZXJlLicsICdtYXliZSBuZXh0IHRpbWUgdHJ5IHRvIGRvIGJldHRlciB7Y29sb3J9LiddLFxuICAgICAgICAgICAgWydUb3VnaCBsdWNrIHtjb2xvcn0uJ11cbiAgICAgICAgICBdXG4gICAgICAgIH1cblxuICAgIGlmICh0aGlzLnAuc2FpZCA9PT0gMCkgY2hvaWNlcyA9IHRleHRzLndpbm5lcjtcbiAgICBlbHNlIHtcbiAgICAgIGlmICh0aGlzLnAuc2FpZCA9PSB0aGlzLnN0YWdlLmxpc3RzLnBsYXllcnMubGVuZ3RoLTEpIGNob2ljZXMgPSB0ZXh0cy5sb3NlcjtcbiAgICAgIGVsc2UgY2hvaWNlcyA9IHRleHRzLnNlY29uZDtcbiAgICB9XG5cbiAgICB2YXIgc2NvcmUgPSB0aGlzLnAucmVzdWx0W3RoaXMucC5zYWlkXS5zY29yZSxcbiAgICAgICAgY29sb3IgPSB0aGlzLnAucmVzdWx0W3RoaXMucC5zYWlkXS5jb2xvcixcbiAgICAgICAgc2NvcmVUZXh0cyA9IGNob2ljZXNbc2NvcmUgJSBjaG9pY2VzLmxlbmd0aF0sXG4gICAgICAgIHQgPSBfLnNhbXBsZShzY29yZVRleHRzKVxuICAgIHRoaXMudGV4dEVsLmlubmVySFRNTCA9IHQucmVwbGFjZSgne2NvbG9yfScsIGNvbG9yKVxuXG4gICAgdGhpcy5wLnNhaWQgKz0gMVxuICAgIGlmKHRoaXMucC5zYWlkID49IHRoaXMuc3RhZ2UubGlzdHMucGxheWVycy5sZW5ndGgpIHtcbiAgICAgIHRoaXMucC5kID0gc2V0VGltZW91dChfLmJpbmQodGhpcy50YWxrRW5kLCB0aGlzKSwgMjUwMClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wLmQgPSBzZXRUaW1lb3V0KF8uYmluZCh0aGlzLnRyaWdnZXIsIHRoaXMsICdzYXlOZXh0JyksIDI1MDApXG4gICAgfVxuICB9LFxuXG4gIHRhbGs6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucGxheSgndGFsaycsIDEpXG4gICAgdGhpcy5wLnNhaWQgPSAwXG4gICAgdGhpcy5zYXlOZXh0KClcbiAgfSxcblxuICB0YWxrRW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnRleHRFbC5pbm5lckhUTUwgPSBcIlwiXG4gICAgdGhpcy5leGl0KClcbiAgICB0aGlzLnRyaWdnZXIoJ3RhbGtFbmQnKVxuICB9LFxuXG4gIGp1ZGdlOiBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLnAuYW5pbWF0aW9uICE9ICdzdGFuZCcpIHJldHVybjtcbiAgICB0aGlzLnAucmVzdWx0ID0gXy5zb3J0QnkodGhpcy5zdGFnZS5saXN0cy5wbGF5ZXJzLm1hcChmdW5jdGlvbihwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpOiBwLnAuaSwgXG4gICAgICAgIHNjb3JlOiBRLnN0YXRlLmdldCgnc2NvcmUtJyArIHAucC5pKSwgXG4gICAgICAgIGNvbG9yOiB7YTogJ29yYW5nZScsIGI6ICdibHVlJywgYzogJ2dyZWVuJ31bcC5wLmldXG4gICAgICB9XG4gICAgfSksICdzY29yZScpLnJldmVyc2UoKVxuICAgIGlmKHRoaXMucC5yZXN1bHRbMF0uc2NvcmUgPT09IDQpIHtcbiAgICAgIHRoaXMuZW50ZXIoKVxuICAgICAgdGhpcy5vbignZW50ZXJFbmQnLCB0aGlzLCAndGFsaycpXG4gICAgICB0aGlzLm9uKCd0YWxrRW5kJywgdGhpcywgJ2V4aXQnKVxuICAgICAgdGhpcy5vbignZXhpdEVuZCcsIHRoaXMsICdzdGFuZCcpXG4gICAgfVxuICB9LFxuXG4gIGRlc3Q6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudGV4dEVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy50ZXh0RWwpXG4gICAgdGhpcy5vZmYoJ2VudGVyRW5kJywgdGhpcywgJ3RhbGsnKVxuICAgIHRoaXMub2ZmKCd0YWxrRW5kJywgdGhpcywgJ2V4aXQnKVxuICAgIHRoaXMub2ZmKCdleGl0RW5kJywgdGhpcywgJ3N0YW5kJylcbiAgICBjbGVhclRpbWVvdXQodGhpcy5wLmQpXG4gIH1cblxufSlcbiIsInZhciBRID0gcmVxdWlyZSgnLi9RJyksXG4gICAgR2VyaU1vbiA9IHJlcXVpcmUoJy4vR2VyaU1vbicpXG5cblEuR2VyaU1vbi5leHRlbmQoXCJQbGF5ZXJcIix7XG4gIGluaXQ6IGZ1bmN0aW9uKHApIHtcbiAgICB0aGlzLl9zdXBlcihwLCB7fSk7XG5cbiAgICB0aGlzLnAuZGlyZWN0aW9uID0gJ3JpZ2h0J1xuICAgIFxuICAgIC8vIFEuaW5wdXQub24oXCJmaXJlXCIsIHRoaXMsICdmaXJlJyk7XG4gICAgdGhpcy5vbihcInByZXN0ZXBcIiwgdGhpcywgJ2F0dGFjaycpO1xuICAgIHRoaXMub24oXCJwcmVzdGVwXCIsIHRoaXMsICd1bnNva3UnKTtcbiAgfSxcblxuICBhdHRhY2s6IGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMucC5wYXVzZWQpIHJldHVybjtcbiAgICBcbiAgICBpZighUS5pbnB1dHMuZmlyZSkgcmV0dXJuXG5cbiAgICB2YXIgdGFyZ2V0LCB0RGlzdCA9IEluZmluaXR5LCBkaXN0O1xuICAgIGZvcih2YXIgaT0wOyBpPHRoaXMuc3RhZ2UubGlzdHMucGxheWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYodGhpcy5zdGFnZS5saXN0cy5wbGF5ZXJzW2ldICE9IHRoaXMpIHtcbiAgICAgICAgZGlzdCA9IE1hdGguYWJzKHRoaXMucC54IC0gdGhpcy5zdGFnZS5saXN0cy5wbGF5ZXJzW2ldLnAueClcbiAgICAgICAgaWYoZGlzdCA8IHREaXN0KSB7XG4gICAgICAgICAgdGFyZ2V0ID0gdGhpcy5zdGFnZS5saXN0cy5wbGF5ZXJzW2ldXG4gICAgICAgICAgdERpc3QgPSBkaXN0XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoUS5pbnB1dHMudXAgJiYgUS5pbnB1dHNbdGhpcy5wLmRpcmVjdGlvbl0pIHtcbiAgICAgIHRoaXMuZnVqb2dlcmlGb3J3YXJkKHRhcmdldClcbiAgICB9XG5cbiAgICBpZiAoUS5pbnB1dHMudXApIHtcbiAgICAgIHRoaXMuZnVqb2dlcmkodGFyZ2V0KVxuICAgIH1cblxuICAgIGlmIChRLmlucHV0cy5kb3duICYmIFEuaW5wdXRzW3RoaXMucC5vcHBvc2l0ZURpcmVjdGlvbl0pIHtcbiAgICAgIHRoaXMuaGFuZ2V0c3VhdGUodGFyZ2V0KVxuICAgIH1cblxuICAgIGlmIChRLmlucHV0cy5kb3duICYmIFEuaW5wdXRzW3RoaXMucC5kaXJlY3Rpb25dKSB7XG4gICAgICB0aGlzLnNlbnRhaW5vdHN1a2kodGFyZ2V0KVxuICAgIH1cblxuICAgIGlmIChRLmlucHV0cy5kb3duKSB7XG4gICAgICB0aGlzLm1hbmppZ2VyaSh0YXJnZXQpXG4gICAgfVxuXG4gICAgaWYgKFEuaW5wdXRzW3RoaXMucC5kaXJlY3Rpb25dKSB7XG4gICAgICB0aGlzLnN1aWhlaWdlcmkodGFyZ2V0KVxuICAgIH1cblxuICAgIGlmIChRLmlucHV0c1t0aGlzLnAub3Bwb3NpdGVEaXJlY3Rpb25dKSB7XG4gICAgICB0aGlzLnNlbnNvZ2VyaSh0YXJnZXQpXG4gICAgfVxuXG4gIH0sXG5cbiAgdW5zb2t1OiBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLnAucGF1c2VkKSByZXR1cm47XG5cbiAgICBpZihRLmlucHV0cy5maXJlKSByZXR1cm5cblxuICAgIGlmKFEuaW5wdXRzLmFjdGlvbikge1xuICAgIFxuICAgICAgdGhpcy51c2hpcm8oKVxuICAgIFxuICAgIH0gZWxzZSB7XG5cbiAgICAgIGlmKFEuaW5wdXRzLnVwKSB7XG4gICAgICAgIHRoaXMua29zb2t1KClcbiAgICAgIH1cblxuICAgICAgaWYoUS5pbnB1dHMuZG93bikge1xuICAgICAgICB0aGlzLmdlbnNva3UoKSBcbiAgICAgIH1cblxuICAgICAgLy9mb3J3YXJkXG4gICAgICBpZihRLmlucHV0c1t0aGlzLnAuZGlyZWN0aW9uXSkge1xuICAgICAgICB0aGlzLm5pbm9hc2hpKCkgXG4gICAgICAgIGlmKHRoaXMucC5hbmltYXRpb24gPT09ICduaW5vYXNoaScgJiYgdGhpcy5wLmFuaW1hdGlvbkZyYW1lID4gMSkge1xuICAgICAgICAgIHRoaXMuc3RhbmQoKVxuICAgICAgICAgIHRoaXMudHN1aXNva3UoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvL2JhY2t3YXJkXG4gICAgICBpZihRLmlucHV0c1t0aGlzLnAuZGlyZWN0aW9uID09PSAnbGVmdCcgPyAncmlnaHQnIDogJ2xlZnQnXSkge1xuICAgICAgICB0aGlzLnRhaXNva3UoKVxuICAgICAgfVxuXG4gICAgfVxuXG4gICAgXG4gIH1cblxufSk7XG4iLCJcbnZhciBRID0gUXVpbnR1cyh7IGltYWdlUGF0aDogJy4vJywgYXVkaW9QYXRoOiAnLi8nLCBhdWRpb1N1cHBvcnRlZDogWyAnbXAzJyBdIH0pXG4gIC5pbmNsdWRlKFwiQXVkaW8sIFNwcml0ZXMsIFNjZW5lcywgSW5wdXQsIDJELCBBbmltXCIpXG4gIC5lbmFibGVTb3VuZCgpXG4gIC5zZXR1cCh7IG1heGltaXplOiB0cnVlIH0pXG4gIC5jb250cm9scygpXG5cblEuRXZlbnRlZC5wcm90b3R5cGUuX3RyaWdnZXIgPSBRLkV2ZW50ZWQucHJvdG90eXBlLnRyaWdnZXJcblEuRXZlbnRlZC5wcm90b3R5cGUudHJpZ2dlciAgPSBmdW5jdGlvbihldmVudCxkYXRhKSB7XG4gIC8vIEZpcnN0IG1ha2Ugc3VyZSB0aGVyZSBhcmUgYW55IGxpc3RlbmVycywgdGhlbiBjaGVjayBmb3IgYW55IGxpc3RlbmVyc1xuICAvLyBvbiB0aGlzIHNwZWNpZmljIGV2ZW50LCBpZiBub3QsIGVhcmx5IG91dC5cbiAgaWYodGhpcy5saXN0ZW5lcnMgJiYgdGhpcy5saXN0ZW5lcnNbZXZlbnRdKSB7XG4gICAgLy8gQ2FsbCBlYWNoIGxpc3RlbmVyIGluIHRoZSBjb250ZXh0IG9mIGVpdGhlciB0aGUgdGFyZ2V0IHBhc3NlZCBpbnRvXG4gICAgLy8gYG9uYCBvciB0aGUgb2JqZWN0IGl0c2VsZi5cbiAgICB2YXIgaSwgbCA9IG5ldyBBcnJheSh0aGlzLmxpc3RlbmVyc1tldmVudF0ubGVuZ3RoKSwgbGVuXG4gICAgZm9yKGk9MCxsZW4gPSB0aGlzLmxpc3RlbmVyc1tldmVudF0ubGVuZ3RoO2k8bGVuO2krKykge1xuICAgICAgbFtpXSA9IFtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnNbZXZlbnRdW2ldWzBdLCBcbiAgICAgICAgdGhpcy5saXN0ZW5lcnNbZXZlbnRdW2ldWzFdXG4gICAgICBdXG4gICAgfVxuICAgIGZvcihpPTAsbGVuID0gbC5sZW5ndGg7aTxsZW47aSsrKSB7XG4gICAgICB2YXIgbGlzdGVuZXIgPSBsW2ldO1xuICAgICAgbGlzdGVuZXJbMV0uY2FsbChsaXN0ZW5lclswXSxkYXRhKTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBRXG4iLCJ2YXIgUSA9IHJlcXVpcmUoJy4vUScpXG5cblxuXG5mdW5jdGlvbiBjb2xsaXNpb25zKG5hbWUsIGFzc2V0LCBzaXplKSB7XG4gIGlmKCFRLmFzc2V0KGFzc2V0KSkgeyB0aHJvdyBcIkludmFsaWQgQXNzZXQ6XCIgKyBhc3NldDsgfVxuICBcbiAgZXhwb3J0cy5jb2xsaXNpb25zW25hbWVdID0geyBoZWFkOiBbXSwgdG9yc286IFtdLCBoaXQ6IFtdIH1cblxuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyksXG4gICAgICBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyksXG4gICAgICBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKSxcbiAgICAgIGltZ0RhdGEsXG4gICAgICBoZWFkID0gMTUwLFxuICAgICAgdG9yc28gPSAyMDAsXG4gICAgICBoaXQgPSAxMDBcbiAgXG4gIGltZy5zcmMgPSBhc3NldDtcbiAgY2FudmFzLndpZHRoID0gaW1nLndpZHRoXG4gIGNhbnZhcy5oZWlnaHQgPSBpbWcuaGVpZ2h0XG4gIGNvbnRleHQuZHJhd0ltYWdlKGltZywgMCwgMCk7XG4gIFxuICBmdW5jdGlvbiBmaW5kKGltZ0RhdGEsIHJjb2xvcikge1xuICAgIHZhciBhID0gQXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbChpbWdEYXRhLmRhdGEsIHJjb2xvcikgLyA0LFxuICAgICAgICBiID0gQXJyYXkucHJvdG90eXBlLmxhc3RJbmRleE9mLmNhbGwoaW1nRGF0YS5kYXRhLCByY29sb3IpIC8gNCxcbiAgICAgICAgYyA9IHt9XG4gICAgaWYoYSA8IC0xKSByZXR1cm4gY1xuICAgIGMueCA9IGEgJSBzaXplLnRpbGV3XG4gICAgYy55ID0gTWF0aC5mbG9vcihhIC8gc2l6ZS50aWxldylcbiAgICBjLncgPSBiICUgc2l6ZS50aWxldyAtIGMueFxuICAgIGMuaCA9IE1hdGguZmxvb3IoYiAvIHNpemUudGlsZXcpIC0gYy55XG4gICAgcmV0dXJuIGNcbiAgfVxuXG4gIGZvcih2YXIgeCA9IDA7IHggPCBpbWcud2lkdGg7IHgrPXNpemUudGlsZXcpIHtcbiAgICBpbWdEYXRhID0gY29udGV4dC5nZXRJbWFnZURhdGEoeCwgMCwgc2l6ZS50aWxldywgc2l6ZS50aWxlaCk7XG4gICAgZXhwb3J0cy5jb2xsaXNpb25zW25hbWVdLmhlYWQucHVzaChmaW5kKGltZ0RhdGEsIGhlYWQpKVxuICAgIGV4cG9ydHMuY29sbGlzaW9uc1tuYW1lXS50b3Jzby5wdXNoKGZpbmQoaW1nRGF0YSwgdG9yc28pKVxuICAgIGV4cG9ydHMuY29sbGlzaW9uc1tuYW1lXS5oaXQucHVzaChmaW5kKGltZ0RhdGEsIGhpdCkpXG4gIH1cbn1cbmV4cG9ydHMuY29sbGlzaW9ucyA9IHt9XG5cblxuXG5cbmZ1bmN0aW9uIGNvbG9yaXplKGFzc2V0LCBjb2xvcikge1xuICBpZighUS5hc3NldChhc3NldCkpIHsgdGhyb3cgXCJJbnZhbGlkIEFzc2V0OlwiICsgYXNzZXQ7IH1cblxuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyksXG4gICAgICBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyksXG4gICAgICBpbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbWcnKSxcbiAgICAgIGltZ0RhdGEsXG4gICAgICBjb2xEYXRhLFxuICAgICAgY29sSW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbiAgXG4gIGltZy5zcmMgPSBhc3NldDtcbiAgY2FudmFzLndpZHRoID0gaW1nLndpZHRoXG4gIGNhbnZhcy5oZWlnaHQgPSBpbWcuaGVpZ2h0XG4gIGNvbnRleHQuZHJhd0ltYWdlKGltZywgMCwgMCk7XG4gIGltZ0RhdGEgPSBjb250ZXh0LmdldEltYWdlRGF0YSgwLCAwLCBpbWcud2lkdGgsIGltZy5oZWlnaHQpXG4gIGNvbERhdGEgPSBjb250ZXh0LmNyZWF0ZUltYWdlRGF0YShpbWcud2lkdGgsIGltZy5oZWlnaHQpXG5cbiAgZnVuY3Rpb24gc2V0Q29sb3IoYywgZCwgaSkgeyBkW2krMF0gPSBjWzBdOyBkW2krMV0gPSBjWzFdOyBkW2krMl0gPSBjWzJdOyBkW2krM10gPSBjWzNdIH1cbiAgZnVuY3Rpb24gZ2V0Q29sb3IoZCwgaSkgeyByZXR1cm4gW2RbaSswXSwgZFtpKzFdLCBkW2krMl0sIGRbaSszXV0gfVxuICBmdW5jdGlvbiBwcmV2Q29sb3IoZCwgaSkgeyByZXR1cm4gW2RbaS00XSwgZFtpLTNdLCBkW2ktMl0sIGRbaS0xXV0gfVxuICBmdW5jdGlvbiBuZXh0Q29sb3IoZCwgaSkgeyByZXR1cm4gW2RbaSs0XSwgZFtpKzVdLCBkW2krNl0sIGRbaSs3XV0gfVxuICBmdW5jdGlvbiB0cmFuc3BhcmVudChjKSB7IHJldHVybiBjWzBdID09PSAwICYmIGNbMV0gPT09IDAgJiYgY1syXSA9PT0gMCAmJiBjWzNdID09PSAwIH1cbiAgZnVuY3Rpb24gZGFyazEoYykgeyByZXR1cm4gW2NbMF0gLSAgNSwgY1sxXSAtICA1LCBjWzJdIC0gIDUsIGNbM11dIH1cbiAgZnVuY3Rpb24gZGFyazIoYykgeyByZXR1cm4gW2NbMF0gLSAxMCwgY1sxXSAtIDEwLCBjWzJdIC0gMTAsIGNbM11dIH1cbiAgZnVuY3Rpb24gZGFyazMoYykgeyByZXR1cm4gW2NbMF0gLSA4MCwgY1sxXSAtIDgwLCBjWzJdIC0gODAsIGNbM11dIH1cbiAgZnVuY3Rpb24gbGlnaHRlbihjKSB7IHJldHVybiBbY1swXSArIDMwLCBjWzFdICsgMzAsIGNbMl0gKyAzMCwgY1szXV0gfVxuICBcbiAgZm9yICh2YXIgaT0wLCBjOyBpPGltZ0RhdGEuZGF0YS5sZW5ndGg7IGkrPTQpIHtcbiAgICBjID0gZ2V0Q29sb3IoaW1nRGF0YS5kYXRhLCBpKVxuICAgIHNldENvbG9yKGxpZ2h0ZW4oYyksIGNvbERhdGEuZGF0YSwgaSlcbiAgICBpZiAoIXRyYW5zcGFyZW50KGMpKSB7XG4gICAgICBpZiAodHJhbnNwYXJlbnQocHJldkNvbG9yKGltZ0RhdGEuZGF0YSwgaS00KSkpIHtcbiAgICAgICAgc2V0Q29sb3IoZGFyazMoYyksIGNvbERhdGEuZGF0YSwgaSlcbiAgICAgIH1cbiAgICAgIGlmICh0cmFuc3BhcmVudChwcmV2Q29sb3IoaW1nRGF0YS5kYXRhLCBpKSkpIHtcbiAgICAgICAgc2V0Q29sb3IoZGFyazMoZGFyazMoY29sb3IpKSwgY29sRGF0YS5kYXRhLCBpKVxuICAgICAgfVxuICAgICAgLy8gaWYgKHRyYW5zcGFyZW50KGdldENvbG9yKGltZ0RhdGEuZGF0YSwgaSs0KjIpKSkge1xuICAgICAgLy8gICBzZXRDb2xvcihkYXJrMihkYXJrMyhjb2xvcikpLCBjb2xEYXRhLmRhdGEsIGkpXG4gICAgICAvLyB9XG4gICAgICBpZiAodHJhbnNwYXJlbnQoZ2V0Q29sb3IoaW1nRGF0YS5kYXRhLCBpKzQpKSkge1xuICAgICAgICBzZXRDb2xvcihjb2xvciwgY29sRGF0YS5kYXRhLCBpKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnRleHQucHV0SW1hZ2VEYXRhKGNvbERhdGEsIDAsIDApO1xuICBjb2xJbWcuc3JjID0gY2FudmFzLnRvRGF0YVVSTChcImltYWdlL3BuZ1wiKTtcbiAgcmV0dXJuIGNvbEltZ1xufVxuXG5cbmV4cG9ydHMubG9hZCA9IGZ1bmN0aW9uKGNiKSB7XG5cbiAgdmFyIHBsYXllckFzc2V0cyA9IFtcbiAgICBcInN1aWhlaWdlcmlcIixcbiAgICBcIm1hbmppZ2VyaVwiLFxuICAgIFwidHN1aXNva3VcIixcbiAgICBcInVzaGlyb1wiLFxuICAgIFwia29zb2t1XCIsXG4gICAgXCJuaW5vYXNoaVwiLFxuICAgIFwiZnVqb2dlcmlcIixcbiAgICBcInNlbnNvZ2VyaVwiLFxuICAgIFwic2VudGFpbm90c3VraVwiLFxuICAgIFwiaGFuZ2V0c3VhdGVcIixcbiAgICBcInRvcnNvLWhpdFwiLFxuICAgIFwiaGVhZG9mZi1oaXRcIl1cblxuICBRLmxvYWQoXG4gICAgXy5mbGF0dGVuKFtcbiAgICBcbiAgICAgIFtcImFzc2V0cy9iZy0xLnBuZ1wiLFxuICAgICAgXCJhc3NldHMvdGlsZXMucG5nXCIsXG4gICAgICBcImFzc2V0cy9qdWRnZS5wbmdcIl0sXG5cbiAgICAgIF8ubWFwKHBsYXllckFzc2V0cywgZnVuY3Rpb24obmFtZSkge1xuICAgICAgICByZXR1cm4gXCJhc3NldHMvXCIgKyBuYW1lICsgXCIucG5nXCJcbiAgICAgIH0pLFxuXG4gICAgICBfLm1hcChfLndpdGhvdXQocGxheWVyQXNzZXRzLCBcInRvcnNvLWhpdFwiLCBcImhlYWRvZmYtaGl0XCIpLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHJldHVybiBcImFzc2V0cy9cIiArIG5hbWUgKyBcIi1jb2xsaXNpb25zLnBuZ1wiXG4gICAgICB9KSxcblxuICAgICAgW1xuICAgICAgXCJhc3NldHMvYmctbG9vcC5tcDNcIiwgXG4gICAgICBcImFzc2V0cy9ib3VuY2UubXAzXCIsXG4gICAgICBcImFzc2V0cy9pdCsubXAzXCIsXG4gICAgICBcImFzc2V0cy9oZWFkLW9mZi0xLm1wM1wiLFxuICAgICAgXCJhc3NldHMvaGVhZC1vZmYtMi5tcDNcIixcbiAgICAgIFwiYXNzZXRzL2hlYWQtb2ZmLTMubXAzXCIsXG4gICAgICBcImFzc2V0cy9oaXQtMS5tcDNcIixcbiAgICAgIFwiYXNzZXRzL2hpdC0yLm1wM1wiLFxuICAgICAgXCJhc3NldHMvaGl0LTMubXAzXCIsXG4gICAgICBcImFzc2V0cy9oaXQtNC5tcDNcIixcbiAgICAgIFwiYXNzZXRzL2h1cnQtMS5tcDNcIixcbiAgICAgIFwiYXNzZXRzL2h1cnQtMi5tcDNcIixcbiAgICAgIFwiYXNzZXRzL2h1cnQtMy5tcDNcIixcbiAgICAgIFwiYXNzZXRzL21pc3MtMS5tcDNcIixcbiAgICAgIFwiYXNzZXRzL21pc3MtMi5tcDNcIlxuICAgICAgXVxuXG4gICAgXSksIGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHBsYXllclRpbGUgPSB7IHRpbGV3OiA0OCwgdGlsZWg6IDMyIH1cbiAgICBRLnNoZWV0KFwidGlsZXNcIixcImFzc2V0cy90aWxlcy5wbmdcIiwgeyB0aWxldzogMzIsIHRpbGVoOiA4IH0pO1xuICAgIFEuc2hlZXQoXCJqdWRnZVwiLCBcImFzc2V0cy9qdWRnZS5wbmdcIiwge3RpbGV3OiAzMiwgdGlsZWg6IDMyfSk7XG5cbiAgICBfLmVhY2gocGxheWVyQXNzZXRzLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICBRLmFzc2V0c1tcImFzc2V0cy9cIiArIG5hbWUgKyBcIi1hLnBuZ1wiXSA9IGNvbG9yaXplKFwiYXNzZXRzL1wiICsgbmFtZSArIFwiLnBuZ1wiLCBbMjQwLCAxMjEsIDAsIDI1NV0pO1xuICAgICAgUS5hc3NldHNbXCJhc3NldHMvXCIgKyBuYW1lICsgXCItYi5wbmdcIl0gPSBjb2xvcml6ZShcImFzc2V0cy9cIiArIG5hbWUgKyBcIi5wbmdcIiwgWzEwMiwgMTUzLCAyNTUsIDI1NV0pO1xuICAgICAgUS5hc3NldHNbXCJhc3NldHMvXCIgKyBuYW1lICsgXCItYy5wbmdcIl0gPSBjb2xvcml6ZShcImFzc2V0cy9cIiArIG5hbWUgKyBcIi5wbmdcIiwgWzY4LCAyMjEsIDg1LCAyNTVdKTtcbiAgICAgIFEuc2hlZXQobmFtZSArICctYScsIFwiYXNzZXRzL1wiICsgbmFtZSArIFwiLWEucG5nXCIsIHBsYXllclRpbGUpO1xuICAgICAgUS5zaGVldChuYW1lICsgJy1iJywgXCJhc3NldHMvXCIgKyBuYW1lICsgXCItYi5wbmdcIiwgcGxheWVyVGlsZSk7XG4gICAgICBRLnNoZWV0KG5hbWUgKyAnLWMnLCBcImFzc2V0cy9cIiArIG5hbWUgKyBcIi1jLnBuZ1wiLCBwbGF5ZXJUaWxlKTtcbiAgICB9KVxuXG4gICAgXy5lYWNoKF8ud2l0aG91dChwbGF5ZXJBc3NldHMsIFwidG9yc28taGl0XCIsIFwiaGVhZG9mZi1oaXRcIiksIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIGNvbGxpc2lvbnMobmFtZSwgXCJhc3NldHMvXCIgKyBuYW1lICsgXCItY29sbGlzaW9ucy5wbmdcIiwgcGxheWVyVGlsZSlcbiAgICB9KVxuXG4gICAgZXhwb3J0cy5jb2xsaXNpb25zLnN0YW5kID0ge1xuICAgICAgaGVhZDogW2V4cG9ydHMuY29sbGlzaW9ucy50c3Vpc29rdS5oZWFkWzBdXSxcbiAgICAgIHRvcnNvOiBbZXhwb3J0cy5jb2xsaXNpb25zLnRzdWlzb2t1LnRvcnNvWzBdXSxcbiAgICAgIGhpdDogW2V4cG9ydHMuY29sbGlzaW9ucy50c3Vpc29rdS5oaXRbMF1dXG4gICAgfVxuICAgIGV4cG9ydHMuY29sbGlzaW9ucy50YWlzb2t1ID0ge1xuICAgICAgaGVhZDogW10uY29uY2F0KGV4cG9ydHMuY29sbGlzaW9ucy50c3Vpc29rdS5oZWFkKS5yZXZlcnNlKCksXG4gICAgICB0b3JzbzogW10uY29uY2F0KGV4cG9ydHMuY29sbGlzaW9ucy50c3Vpc29rdS50b3JzbykucmV2ZXJzZSgpLFxuICAgICAgaGl0OiBbXS5jb25jYXQoZXhwb3J0cy5jb2xsaXNpb25zLnRzdWlzb2t1LmhpdCkucmV2ZXJzZSgpXG4gICAgfVxuXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvYWRlcicpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cbiAgICBjYigpXG4gIH0pO1xuXG59XG4iLCJ2YXIgUSA9IHJlcXVpcmUoJy4vUScpLFxuICAgIGFzc2V0cyA9IHJlcXVpcmUoJy4vYXNzZXRzJylcbnJlcXVpcmUoJy4vUGxheWVyJylcbnJlcXVpcmUoJy4vQXV0b1BsYXllcicpXG5yZXF1aXJlKCcuL0FuaW1QbGF5ZXInKVxucmVxdWlyZSgnLi9IdWQnKVxucmVxdWlyZSgnLi9KdWRnZScpXG5cbnZhciBsZXZlbCA9IG5ldyBRLlRpbGVMYXllcih7XG4gdGlsZXM6IFtcbiBuZXcgQXJyYXkoMTApLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gbmV3IEFycmF5KDEwKS5qb2luKCcwJykuc3BsaXQoJycpLFxuIG5ldyBBcnJheSgxMCkuam9pbignMCcpLnNwbGl0KCcnKSxcbiBuZXcgQXJyYXkoMTApLmpvaW4oJzEnKS5zcGxpdCgnJylcbiBdLCBzaGVldDogJ3RpbGVzJyBcbn0pXG5cbmZ1bmN0aW9uIGdhbWVMb29wKHN0YWdlLCBqdWRnZSkge1xuICBmdW5jdGlvbiBwYXVzZVBsYXllcnMoKSB7XG4gICAgaWYoXy5jb250YWlucyhbUS5zdGF0ZS5nZXQoJ3Njb3JlLWEnKSwgUS5zdGF0ZS5nZXQoJ3Njb3JlLWInKSwgUS5zdGF0ZS5nZXQoJ3Njb3JlLWMnKV0sIDQpKSB7XG4gICAgICBfLmludm9rZShzdGFnZS5saXN0cy5wbGF5ZXJzLCAncGF1c2UnKVxuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBjbGVhbnVwKCkgeyBcbiAgICBqdWRnZSAmJiBqdWRnZS5kZXN0cm95KClcbiAgICBRLmF1ZGlvLnN0b3AoXCJhc3NldHMvYmctbG9vcC5tcDNcIik7XG4gICAgUS5hdWRpby5zdG9wKFwiYXNzZXRzL2l0Ky5tcDNcIik7XG4gICAgUS5zdGF0ZS5vZmYoJ2NoYW5nZScsIHBhdXNlUGxheWVycylcbiAgICBfLmludm9rZShzdGFnZS5saXN0cy5wbGF5ZXJzLCAnZGVzdHJveScpO1xuICAgIGh1ZC5yZXNldCgpXG4gIH1cbiAgc3RhZ2Uub24oJ2Rlc3Ryb3llZCcsIGNsZWFudXApXG4gIFxuICBmdW5jdGlvbiBlbmRHYW1lKCkge1xuICAgIFEuc3RhZ2VTY2VuZSgnYXV0b3BsYXknLCAxKVxuICB9XG4gIGZ1bmN0aW9uIG5ld0dhbWUoKSB7XG4gICAgUS5zdGF0ZS5zZXQoeyAndG90YWwtc2NvcmUtYSc6IDAsICd0b3RhbC1zY29yZS1iJzogMCwgJ3RvdGFsLXNjb3JlLWMnOiAwLCAncm91bmQnOiAwIH0pO1xuICAgICFRLnN0YXRlLmdldCgnbm9tdXNpYycpICYmIFEuYXVkaW8ucGxheSgnYXNzZXRzL2JnLWxvb3AubXAzJywge2xvb3A6IHRydWV9KTtcbiAgICBuZXdSb3VuZCgpXG4gIH1cbiAgZnVuY3Rpb24gbmV3Um91bmQoKSB7XG4gICAgaHVkLnJlc2V0KClcbiAgICB2YXIgcGxheWVycyA9IHN0YWdlLmxpc3RzLnBsYXllcnM7XG4gICAgWzY0LCAxNjgsIDI1Nl0uZm9yRWFjaChmdW5jdGlvbih4LCBpKSB7XG4gICAgICBwbGF5ZXJzW2ldICYmIHBsYXllcnNbaV0uc2V0KHt4OiB4LCB5OiAzKjMyLCB2eTogMH0pXG4gICAgfSlcbiAgICBRLnN0YXRlLmluYygncm91bmQnLCAxKVxuICAgIGlmKFEuc3RhdGUuZ2V0KCdyb3VuZCcpID09IDIpIHtcbiAgICAgIFEuYXVkaW8uc3RvcChcImFzc2V0cy9iZy1sb29wLm1wM1wiKTtcbiAgICAgICFRLnN0YXRlLmdldCgnbm9tdXNpYycpICYmIFEuYXVkaW8ucGxheShcImFzc2V0cy9pdCsubXAzXCIsIHtsb29wOiB0cnVlfSk7XG4gICAgfVxuICAgIF8uaW52b2tlKHN0YWdlLmxpc3RzLnBsYXllcnMsICd1bnBhdXNlJylcbiAgfVxuICBmdW5jdGlvbiByb3VuZEVuZCgpIHtcbiAgICB2YXIgc2NvcmVzID0gXy5zb3J0Qnkoc3RhZ2UubGlzdHMucGxheWVycy5tYXAoZnVuY3Rpb24ocCkge1xuICAgICAgcmV0dXJuIHtpOiBwLnAuaSwgc2NvcmU6IFEuc3RhdGUuZ2V0KCdzY29yZS0nKyBwLnAuaSl9XG4gICAgfSksICdzY29yZScpXG4gICAgaWYoc2NvcmVzWzBdLmkgPT09ICdhJyAmJiBzY29yZXNbMF0uc2NvcmUgPCBzY29yZXNbMV0uc2NvcmUpIHtcbiAgICAgIGVuZEdhbWUoKVxuICAgIH0gZWxzZSB7XG4gICAgICBuZXdSb3VuZCgpXG4gICAgfVxuICB9XG4gIFEuc3RhdGUub24oJ2NoYW5nZScsIHBhdXNlUGxheWVycylcbiAganVkZ2Uub24oJ3RhbGtFbmQnLCByb3VuZEVuZClcbiAgbmV3R2FtZSgpXG59XG5cblEuc2NlbmUoJ2JnJywgZnVuY3Rpb24oc3RhZ2UpIHtcbiAgdmFyIGJnID0gc3RhZ2UuaW5zZXJ0KG5ldyBRLlNwcml0ZSh7XG4gICAgYXNzZXQ6IFwiYXNzZXRzL2JnLTEucG5nXCIsXG4gICAgc2NhbGU6IDU3Ni85MDBcbiAgfSkpXG4gIGJnLmNlbnRlcigpXG4gIGJnLnAueSA9IDIzMFxuICBzdGFnZS5vbihcImRlc3Ryb3lcIixmdW5jdGlvbigpIHtcbiAgICBqdWRnZS5kZXN0cm95KClcbiAgfSk7XG59KVxuXG5RLnNjZW5lKFwiYW5pbXNcIiwgZnVuY3Rpb24oc3RhZ2UpIHtcbiAgdmFyIGxheWVyID0gc3RhZ2UuY29sbGlzaW9uTGF5ZXIobGV2ZWwpO1xuICB2YXIgcGxheWVyYSA9IHN0YWdlLmluc2VydChuZXcgUS5BbmltUGxheWVyKHt4OiA2NCwgeTogMyozMn0pKVxuICBzdGFnZS5hZGQoXCJ2aWV3cG9ydFwiKVxuICBzdGFnZS52aWV3cG9ydC5zY2FsZSA9IDJcbiAgc3RhZ2Uudmlld3BvcnQuY2VudGVyT24obGF5ZXIucC53LzIsIGxheWVyLnAuaC8yKVxufSlcblxuUS5zY2VuZShcInBsYXktMW9uMVwiLCBmdW5jdGlvbihzdGFnZSkge1xuICB2YXIgbGF5ZXIgPSBzdGFnZS5jb2xsaXNpb25MYXllcihsZXZlbCk7XG4gIHN0YWdlLmFkZFRvTGlzdCgncGxheWVycycsIHN0YWdlLmluc2VydChuZXcgUS5QbGF5ZXIoe2k6ICdhJ30pKSlcbiAgc3RhZ2UuYWRkVG9MaXN0KCdwbGF5ZXJzJywgc3RhZ2UuaW5zZXJ0KG5ldyBRLkF1dG9QbGF5ZXIoe2k6ICdiJ30pKSlcbiAgdmFyIGp1ZGdlID0gc3RhZ2UuaW5zZXJ0KG5ldyBRLkp1ZGdlKHt4OiAyNCwgeTogMyozMn0pKVxuICBzdGFnZS5hZGQoXCJ2aWV3cG9ydFwiKVxuICBzdGFnZS52aWV3cG9ydC5zY2FsZSA9IDJcbiAgc3RhZ2Uudmlld3BvcnQuY2VudGVyT24obGF5ZXIucC53LzIsIGxheWVyLnAuaC8yKVxuICBnYW1lTG9vcChzdGFnZSwganVkZ2UpXG59KVxuXG5RLnNjZW5lKFwicGxheS0xb24yXCIsIGZ1bmN0aW9uKHN0YWdlKSB7XG4gIHZhciBsYXllciA9IHN0YWdlLmNvbGxpc2lvbkxheWVyKGxldmVsKTtcbiAgc3RhZ2UuYWRkVG9MaXN0KCdwbGF5ZXJzJywgc3RhZ2UuaW5zZXJ0KG5ldyBRLlBsYXllcih7aTogJ2EnfSkpKVxuICBzdGFnZS5hZGRUb0xpc3QoJ3BsYXllcnMnLCBzdGFnZS5pbnNlcnQobmV3IFEuQXV0b1BsYXllcih7aTogJ2InfSkpKVxuICBzdGFnZS5hZGRUb0xpc3QoJ3BsYXllcnMnLCBzdGFnZS5pbnNlcnQobmV3IFEuQXV0b1BsYXllcih7aTogJ2MnfSkpKVxuICB2YXIganVkZ2UgPSBzdGFnZS5pbnNlcnQobmV3IFEuSnVkZ2Uoe3g6IDI0LCB5OiAzKjMyfSkpXG4gIHN0YWdlLmFkZChcInZpZXdwb3J0XCIpXG4gIHN0YWdlLnZpZXdwb3J0LnNjYWxlID0gMlxuICBzdGFnZS52aWV3cG9ydC5jZW50ZXJPbihsYXllci5wLncvMiwgbGF5ZXIucC5oLzIpXG4gIGdhbWVMb29wKHN0YWdlLCBqdWRnZSlcbn0pXG5cblEuc2NlbmUoXCJhdXRvcGxheVwiLCBmdW5jdGlvbihzdGFnZSkge1xuICB2YXIgbGF5ZXIgPSBzdGFnZS5jb2xsaXNpb25MYXllcihsZXZlbCk7XG4gIHN0YWdlLmFkZFRvTGlzdCgncGxheWVycycsIHN0YWdlLmluc2VydChuZXcgUS5BdXRvUGxheWVyKHtpOiAnYSd9KSkpXG4gIHN0YWdlLmFkZFRvTGlzdCgncGxheWVycycsIHN0YWdlLmluc2VydChuZXcgUS5BdXRvUGxheWVyKHtpOiAnYid9KSkpXG4gIHN0YWdlLmFkZFRvTGlzdCgncGxheWVycycsIHN0YWdlLmluc2VydChuZXcgUS5BdXRvUGxheWVyKHtpOiAnYyd9KSkpXG4gIHZhciBqdWRnZSA9IHN0YWdlLmluc2VydChuZXcgUS5KdWRnZSh7eDogMjQsIHk6IDMqMzJ9KSlcbiAgc3RhZ2UuYWRkKFwidmlld3BvcnRcIilcbiAgc3RhZ2Uudmlld3BvcnQuc2NhbGUgPSAyXG4gIHN0YWdlLnZpZXdwb3J0LmNlbnRlck9uKGxheWVyLnAudy8yLCBsYXllci5wLmgvMilcbiAgZ2FtZUxvb3Aoc3RhZ2UsIGp1ZGdlKVxufSlcblxudmFyIGh1ZFxuYXNzZXRzLmxvYWQoZnVuY3Rpb24oKSB7XG4gIGh1ZCA9IG5ldyBRLkh1ZCgpXG4gIGh1ZC5pbml0KClcbiAgUS5zdGFnZVNjZW5lKFwiYmdcIiwgMCk7XG4gIFEuc3RhZ2VTY2VuZShcImF1dG9wbGF5XCIsIDEpO1xuICBRLnN0YXRlLnNldCgnbm9tdXNpYycsIGZhbHNlKVxuICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24oZSkge1xuICAgIGlmKGUua2V5Q29kZSA9PSA0OSkge1xuICAgICAgUS5jbGVhclN0YWdlKDEpXG4gICAgICBRLnN0YWdlU2NlbmUoXCJwbGF5LTFvbjFcIiwgMSk7XG4gICAgfVxuICAgIGlmKGUua2V5Q29kZSA9PSA1MCkge1xuICAgICAgUS5jbGVhclN0YWdlKDEpXG4gICAgICBRLnN0YWdlU2NlbmUoXCJwbGF5LTFvbjJcIiwgMSk7XG4gICAgfVxuICAgIGlmKGUua2V5Q29kZSA9PSA3Nykge1xuICAgICAgaWYoUS5zdGF0ZS5nZXQoJ25vbXVzaWMnKSkge1xuICAgICAgICBRLnN0YXRlLnNldCgnbm9tdXNpYycsIGZhbHNlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgUS5zdGF0ZS5zZXQoJ25vbXVzaWMnLCB0cnVlKVxuICAgICAgICBRLmF1ZGlvLnN0b3AoKVxuICAgICAgfVxuICAgIH1cbiAgfSlcbn0pXG5jb25zb2xlLmxvZyhRKSJdfQ==
