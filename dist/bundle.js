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

  hitDistance: 35*2,

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
    if(dist < 15*2) {
      this[_.sample(['hangetsuate', 'tsuisoku'])](target)
    } else if(dist < 26*2) {
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
    collisions = require('./assets').collisions,
    audio = require('./audio')

Q.animations('gerimon', {
  stand: { frames: [0] },
  sentainotsuki: { frames: _.range(22), rate: 1/12, loop: false, trigger: 'stand' },
  fujogeri: { frames: _.range(15), rate: 1/12, loop: false, trigger: 'stand' },
  suiheigeri: { frames: _.range(15), rate: 1/12, loop: false, trigger: 'stand' },
  manjigeri: { frames: _.range(15), rate: 1/12, loop: false, trigger: 'stand' },
  hangetsuate: { frames: _.range(21), rate: 1/12, loop: false, trigger: 'stand' },
  sensogeri: { frames: _.range(20), rate: 1/12, loop: false, trigger: 'stand' },
  tsuisoku: { frames: _.range(11), rate: 1/12, loop: false, trigger: 'stand' },
  kosoku: { frames: _.range(18), rate: 1/17, loop: false, trigger: 'stand' },
  ushiro: { frames: _.range(7), rate: 1/12, loop: false, trigger: 'stand' },
  ninoashi: { frames: _.range(6), rate: 1/12, loop: false, trigger: 'stand' },
  taisoku: { frames: _.range(11).reverse(), rate: 1/12, loop: false, trigger: 'stand' },
  torsohit: { frames: [0,1,2,3,2,1,0], rate: 1/12, loop: false, trigger: 'stand' },
  headoffhit: { frames: _.range(13), rate: 1/12, loop: false }
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
      scale: 2,
      dir: -1*owner.p.dir,
      sensor: true,
      life: 0
    })
    this.add('2d');
    this.p.vy = -150
    this.p.vx = this.p.dir*force * 2
    this.on("bump.bottom", function() {
      if(this.p.vy > 0)
        audio.play('assets/bounce.mp3')
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
  
  speed: 25*2,
  friction: 5*2,
  jumpSpeed: 130,
  hitForce: {
    fujogeri: 40,
    manjigeri: 25,
    sensogeri: 40,
    suiheigeri: 35,
    sentainotsuki: 25,
    hangetsuate: 40
  },

  init: function(p) {
    var w = 22*2, h = 32*2
    this._super(p, { 
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
    this.p.x += this.p.dir * 15*2
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
    this.p.x += this.p.dir * 4*2
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
      audio.play('assets/hit-' + _.sample([1,2,3,4]) + '.mp3')
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
      audio.play('assets/miss-' + _.sample([1,1,1,1,1,1,2]) + '.mp3')
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
    this.p.hit = true 
    if(hit === 'head' && Math.abs(force) > 35 && Math.random() > .5) {
      audio.play('assets/head-off-' + _.sample([1,2,3]) + '.mp3')
      this.sheet("headoff-hit")
      this.play('headoffhit', 1)
      this.stage.insert(new Q.Head(this, force))
      return 4
    } else {
      audio.play('assets/hurt-' + _.sample([1,2,3]) + '.mp3')
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
      this.p.cx = 12*2
    }
    if(this.p.direction === 'right') {
      this.set({flip: ''})
      this.p.dir = 1
      this.p.oppositeDirection = 'left'
      this.p.cx = 10*2
    }
  }

});

},{"./Q":7,"./assets":8,"./audio":9}],4:[function(require,module,exports){
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
    this.p.vx = 30*2
    this.p.flip = ""
    this.play('walk', 1)
    this.on('step', this, 'enterEnd')
  },

  enterEnd: function() {
    if(this.p.x > 150) {
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
    this.p.vx = -30*2
    this.p.flip = "x"
    this.play('walk', 1)
    this.on('step', this, 'exitEnd')
  },

  exitEnd: function() {
    if(this.p.x < 38) {
      this.p.vx = 0
      this.off('step', this, 'exitEnd')
      this.trigger('exitEnd')
      this.stand()
    }
  },

  stand: function() {
    this.p.flip = ""
    this.p.cx = 14*2
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
    clearTimeout(this.p.d)
    this.play('talk', 1)
    this.p.said = 0
    this.sayNext()
  },

  talkEnd: function() {
    clearTimeout(this.p.d)
    this.p.said = 0
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

    var playerTile = { tilew: 48*2, tileh: 32*2 }
    Q.sheet("tiles","assets/tiles.png", { tilew: 32, tileh: 8 });
    Q.sheet("judge", "assets/judge.png", {tilew: 32*2, tileh: 32*2});

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

    Q.load(["assets/it+.mp3"])
      
  });

}

},{"./Q":7}],9:[function(require,module,exports){
var Q = require('./Q')

var mute = false,
    music = "";

exports.music = function(asset) {
  if(mute) return;
  if(Q.assets[asset] && asset != music) {
    try{ Q.audio.stop(music) } catch (e){}
    Q.audio.play(asset, {loop: true});
    music = asset
  }
}

exports.play = function(asset) {
  if(mute) return;
  Q.audio.play(asset);
}

exports.toggleMute = function() {
  mute = !mute;
  if(mute) Q.audio.stop()
}

},{"./Q":7}],10:[function(require,module,exports){
var Q = require('./Q'),
    assets = require('./assets'),
    audio = require('./audio')
require('./Player')
require('./AutoPlayer')
require('./AnimPlayer')
require('./Hud')
require('./Judge')

var level = function() {
  return new Q.TileLayer({
   tiles: [
   new Array(20).join('0').split(''),
   new Array(20).join('0').split(''),
   new Array(20).join('0').split(''),
   new Array(20).join('0').split(''),
   new Array(20).join('0').split(''),
   new Array(20).join('0').split(''),
   new Array(20).join('0').split(''),
   new Array(20).join('0').split(''),
   new Array(20).join('0').split(''),
   new Array(20).join('0').split(''),
   new Array(20).join('0').split(''),
   new Array(20).join('0').split(''),
   new Array(20).join('0').split(''),
   new Array(20).join('1').split('')
   ], sheet: 'tiles' 
  })
}

function gameLoop(stage, judge) {
  
  function pausePlayers() {
    if(_.contains([Q.state.get('score-a'), Q.state.get('score-b'), Q.state.get('score-c')], 4)) {
      _.invoke(stage.lists.players, 'pause')
    }
  }
  
  function cleanup() { 
    judge && judge.destroy()
    Q.state.off('change', pausePlayers)
    _.invoke(stage.lists.players, 'destroy');
    hud.reset()
  }
  
  function endGame() {
    Q.stageScene('autoplay', 1)
  }

  function newGame() {
    Q.state.set({ 'total-score-a': 0, 'total-score-b': 0, 'total-score-c': 0, 'round': 0 });
    audio.music('assets/bg-loop.mp3');
    newRound()
  }

  function newRound() {
    hud.reset()
    var players = stage.lists.players;
    [164, 312, 412].forEach(function(x, i) {
      players[i] && players[i].set({x: x, y: 25*16, vy: 0})
    })
    Q.state.inc('round', 1)
    if(Q.state.get('round') > 1) {
      audio.music('assets/it+.mp3')
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

  stage.on('destroyed', cleanup)
  Q.state.on('change', pausePlayers)
  judge.on('talkEnd', roundEnd)
  newGame()
}

Q.scene('bg', function(stage) {
  var bg = stage.insert(new Q.Sprite({
    asset: "assets/bg-1.png",
    scale: 608/900
  }))
  bg.center()
  bg.p.y -= 5 +64
  stage.on("destroy",function() {
    judge.destroy()
  });
})

Q.scene("anims", function(stage) {
  var layer = stage.collisionLayer(level());
  var playera = stage.insert(new Q.AnimPlayer({x: 64, y: 25*16}))
  stage.add("viewport")
  stage.viewport.scale = 1
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2+64)
})

Q.scene("play-1on1", function(stage) {
  var layer = stage.collisionLayer(level());
  stage.addToList('players', stage.insert(new Q.Player({i: 'a'})))
  stage.addToList('players', stage.insert(new Q.AutoPlayer({i: 'b'})))
  var judge = stage.insert(new Q.Judge({x: 38, y: 25*16}))
  stage.add("viewport")
  stage.viewport.scale = 1
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2+64)
  gameLoop(stage, judge)
})

Q.scene("play-1on2", function(stage) {
  var layer = stage.collisionLayer(level());
  stage.addToList('players', stage.insert(new Q.Player({i: 'a'})))
  stage.addToList('players', stage.insert(new Q.AutoPlayer({i: 'b'})))
  stage.addToList('players', stage.insert(new Q.AutoPlayer({i: 'c'})))
  var judge = stage.insert(new Q.Judge({x: 38, y: 25*16}))
  stage.add("viewport")
  stage.viewport.scale = 1
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2+64)
  gameLoop(stage, judge)
})

Q.scene("autoplay", function(stage) {
  var layer = stage.collisionLayer(level());
  stage.addToList('players', stage.insert(new Q.AutoPlayer({i: 'a'})))
  stage.addToList('players', stage.insert(new Q.AutoPlayer({i: 'b'})))
  stage.addToList('players', stage.insert(new Q.AutoPlayer({i: 'c'})))
  var judge = stage.insert(new Q.Judge({x: 38, y: 25*16}))
  stage.add("viewport")
  stage.viewport.scale = 1
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2+64)
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
      audio.toggleMute()
    }
  })
})
console.log(Q)
},{"./AnimPlayer":1,"./AutoPlayer":2,"./Hud":4,"./Judge":5,"./Player":6,"./Q":7,"./assets":8,"./audio":9}]},{},[10])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvQW5pbVBsYXllci5qcyIsImxpYi9BdXRvUGxheWVyLmpzIiwibGliL0dlcmlNb24uanMiLCJsaWIvSHVkLmpzIiwibGliL0p1ZGdlLmpzIiwibGliL1BsYXllci5qcyIsImxpYi9RLmpzIiwibGliL2Fzc2V0cy5qcyIsImxpYi9hdWRpby5qcyIsImxpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbGFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgUSA9IHJlcXVpcmUoJy4vUScpXG5yZXF1aXJlKCcuL0dlcmlNb24nKVxuXG5cbmZ1bmN0aW9uIGRpc3RhbmNlKGEsIGIpIHtcbiAgdmFyIHggPSBNYXRoLmFicyhhLnAueCAtIGIucC54KSxcbiAgICAgIHkgPSBNYXRoLmFicyhhLnAueSAtIGIucC55KVxuICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSk7XG59XG5cbmZ1bmN0aW9uIHNwb3RBdHRhY2sodGFyZ2V0KSB7XG4gIGlmKHRhcmdldC5wLmFuaW1hdGlvbiA9PT0gJ2Z1am9nZXJpJykge1xuICAgIGlmKHRhcmdldC5wLmFuaW1hdGlvbkZyYW1lID4gNClcbiAgICAgIHJldHVybiAnZnVqb2dlcmknXG4gIH1cbiAgaWYodGFyZ2V0LnAuYW5pbWF0aW9uID09PSAnc3VpaGVpZ2VyaScpIHtcbiAgICBpZih0YXJnZXQucC5hbmltYXRpb25GcmFtZSA+IDQpXG4gICAgICByZXR1cm4gJ3N1aWhlaWdlcmknXG4gIH1cbiAgaWYodGFyZ2V0LnAuYW5pbWF0aW9uID09PSAnbWFuamlnZXJpJykge1xuICAgIGlmKHRhcmdldC5wLmFuaW1hdGlvbkZyYW1lID4gNClcbiAgICAgIHJldHVybiAnbWFuamlnZXJpJ1xuICB9IFxufVxuXG5RLkdlcmlNb24uZXh0ZW5kKFwiQW5pbVBsYXllclwiLCB7XG5cbiAgYXR0YWNrU2VxdWVuY2U6IFsnc2Vuc29nZXJpJywgJ21hbmppZ2VyaScsICdmdWpvZ2VyaScsICdzdWloZWlnZXJpJywgJ3NlbnRhaW5vdHN1a2knLCAnaGFuZ2V0c3VhdGUnXSxcbiAgdW5zb2t1U2VxdWVuY2U6IFsnbmlub2FzaGknLCAndHN1aXNva3UnLCAna29zb2t1JywgJ2dlbnNva3UnLCAndGFpc29rdScsICd1c2hpcm8nXSxcblxuICBpbml0OiBmdW5jdGlvbihwKSB7XG4gICAgdGhpcy5fc3VwZXIoXy5leHRlbmQoe1xuICAgICAgYW5pbTogbnVsbCxcbiAgICAgIHNlcXVlbmNlOiB0aGlzLmF0dGFja1NlcXVlbmNlXG4gICAgfSwgcCkpXG4gICAgLy8gdGhpcy5vbignc3RhbmQnLCB0aGlzLCAnbmV4dCcpXG4gICAgLy8gdGhpcy5uZXh0KClcbiAgfSxcblxuICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgbiA9IHRoaXMucC5zZXF1ZW5jZVt0aGlzLnAuc2VxdWVuY2UuaW5kZXhPZih0aGlzLnAuYW5pbSkgKyAxXSB8fCB0aGlzLnAuc2VxdWVuY2VbMF1cbiAgICBpZih0aGlzW25dKCkpIHtcbiAgICAgIHRoaXMucC5hbmltID0gblxuICAgIH1cbiAgfSxcblxuICBzdGVwOiBmdW5jdGlvbih0KSB7XG4gICAgaWYoUS5pbnB1dHMuZmlyZSkge1xuICAgICAgdGhpcy5wLnNlcXVlbmNlID0gdGhpcy5wLnNlcXVlbmNlID09IHRoaXMuYXR0YWNrU2VxdWVuY2UgPyB0aGlzLnVuc29rdVNlcXVlbmNlIDogdGhpcy5hdHRhY2tTZXF1ZW5jZVxuICAgIH1cbiAgICB0aGlzLm5leHQoKVxuICB9XG5cbn0pIiwidmFyIFEgPSByZXF1aXJlKCcuL1EnKVxucmVxdWlyZSgnLi9HZXJpTW9uJylcblxuXG5mdW5jdGlvbiBkaXN0YW5jZShhLCBiKSB7XG4gIHZhciB4ID0gTWF0aC5hYnMoYS5wLnggLSBiLnAueCksXG4gICAgICB5ID0gTWF0aC5hYnMoYS5wLnkgLSBiLnAueSlcbiAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkpO1xufVxuXG5mdW5jdGlvbiBzcG90QXR0YWNrKHRhcmdldCkge1xuICBpZih0YXJnZXQucC5hdHRhY2tpbmcgJiYgdGFyZ2V0LnAuYW5pbWF0aW9uRnJhbWUgPiA0KSB7XG4gICAgcmV0dXJuIHRhcmdldC5wLmFuaW1hdGlvblxuICB9XG59XG5cblEuR2VyaU1vbi5leHRlbmQoXCJBdXRvUGxheWVyXCIsIHtcblxuICBoaXREaXN0YW5jZTogMzUqMixcblxuICBtb3ZlQ2xvc2VyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICBpZihkaXN0YW5jZSh0YXJnZXQsIHRoaXMpID4gdGhpcy5oaXREaXN0YW5jZSArIHRoaXMucC53LzIpIHtcbiAgICAgIHRoaXMudHN1aXNva3UoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm5pbm9hc2hpKClcbiAgICB9XG4gIH0sXG5cbiAgbW92ZUZ1cnRoZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgIHRoaXNbXy5zYW1wbGUoWyd0YWlzb2t1JywgJ2dlbnNva3UnXSldKClcbiAgfSxcblxuICBjYW5jZWxBdHRhY2s6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVyblxuICAgIGlmKHRoaXMucC5hdHRhY2tpbmcgJiYgdGhpcy5wLmFuaW1hdGlvbkZyYW1lIDwgNCkge1xuICAgICAgdGhpcy5zdGFuZCgpXG4gICAgfVxuICB9LFxuXG4gIGNhbmNlbFVuc29rdTogZnVuY3Rpb24oKSB7XG4gICAgaWYodGhpcy5wLndhbGtpbmcpIHtcbiAgICAgIGlmKHRoaXMucC5hbmltYXRpb25GcmFtZSA8IDMgfHwgdGhpcy5wLmFuaW1hdGlvbkZyYW1lID4gNikge1xuICAgICAgICB0aGlzLnN0YW5kKClcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgYXR0YWNrRHVyaW5nQXR0YWNrOiBmdW5jdGlvbih0YXJnZXQsIGF0dGFjaykge1xuICAgIGlmKGF0dGFjayA9PT0gJ3N1aWhlaWdlcmknKSB7XG4gICAgICBpZih0YXJnZXQucC5hbmltYXRpb25GcmFtZSA8IDYpIHtcbiAgICAgICAgdGhpc1tfLnNhbXBsZShbJ2Z1am9nZXJpJywgJ21hbmppZ2VyaSddKV0odGFyZ2V0KVxuICAgICAgfVxuICAgIH1cbiAgICBpZihhdHRhY2sgPT09ICdmdWpvZ2VyaScpIHtcbiAgICAgIGlmKHRhcmdldC5wLmFuaW1hdGlvbkZyYW1lIDwgMTApIHtcbiAgICAgICAgdGhpcy5tYW5qaWdlcmkodGFyZ2V0KVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBhdHRhY2tBZnRlckF0dGFjazogZnVuY3Rpb24odGFyZ2V0LCBhdHRhY2spIHtcbiAgICBpZihhdHRhY2sgPT09ICdzdWloZWlnZXJpJykge1xuICAgICAgaWYodGFyZ2V0LnAuYW5pbWF0aW9uRnJhbWUgPiA2KSB7XG4gICAgICAgIHRoaXMuZnVqb2dlcmkodGFyZ2V0KVxuICAgICAgfVxuICAgIH1cbiAgICBpZihhdHRhY2sgPT09ICdmdWpvZ2VyaScpIHtcbiAgICAgIGlmKHRhcmdldC5wLmFuaW1hdGlvbkZyYW1lID4gMTApIHtcbiAgICAgICAgdGhpcy5tYW5qaWdlcmkodGFyZ2V0KVxuICAgICAgfVxuICAgIH1cbiAgICBpZihhdHRhY2sgPT09ICdtYW5qaWdlcmknKSB7XG4gICAgICBpZih0YXJnZXQucC5hbmltYXRpb25GcmFtZSA+IDcpIHtcbiAgICAgICAgdGhpcy5zdWloZWlnZXJpKHRhcmdldClcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgZXZhZGU6IGZ1bmN0aW9uKHRhcmdldCwgYXR0YWNrKSB7XG4gICAgaWYoYXR0YWNrKSB7XG4gICAgICB2YXIgciA9IE1hdGgucmFuZG9tKClcbiAgICAgIHRoaXMuY2FuY2VsQXR0YWNrKClcbiAgICAgIGlmKHIgPiAuOCkge1xuICAgICAgICB0aGlzLmtvc29rdSgpXG4gICAgICB9IGVsc2UgaWYgKHIgPiAuNSB8fCBkaXN0YW5jZSh0YXJnZXQsIHRoaXMpIDwgdGhpcy5oaXREaXN0YW5jZSAqIDMvNCkge1xuICAgICAgICB0aGlzLmdlbnNva3UoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy50YWlzb2t1KClcbiAgICAgIH1cblxuICAgIH1cbiAgfSxcblxuICBhdHRhY2s6IGZ1bmN0aW9uKHRhcmdldCwgYXR0YWNrKSB7XG4gICAgdmFyIGRpc3QgPSBkaXN0YW5jZSh0YXJnZXQsIHRoaXMpXG4gICAgaWYoZGlzdCA8IDE1KjIpIHtcbiAgICAgIHRoaXNbXy5zYW1wbGUoWydoYW5nZXRzdWF0ZScsICd0c3Vpc29rdSddKV0odGFyZ2V0KVxuICAgIH0gZWxzZSBpZihkaXN0IDwgMjYqMikge1xuICAgICAgdGhpc1tfLnNhbXBsZShbJ2Z1am9nZXJpJywgJ3NlbnNvZ2VyaScsICdtYW5qaWdlcmknXSldKHRhcmdldClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpc1tfLnNhbXBsZShbJ2Z1am9nZXJpRm9yd2FyZCcsICdzdWloZWlnZXJpJywgJ3NlbnRhaW5vdHN1a2knXSldKHRhcmdldClcbiAgICB9XG4gICAgLy8gaWYoZGlzdCA+IDE0ICYmIGRpc3QgPCAyMikgdGhpcy5mdWpvZ2VyaSh0YXJnZXQpXG4gICAgLy8gaWYoZGlzdCA+IDE3ICYmIGRpc3QgPCAyNikgdGhpcy5zZW5zb2dlcmkodGFyZ2V0KVxuICAgIC8vIGlmKGRpc3QgPiAyMCAmJiBkaXN0IDwgMjgpIHtcbiAgICAvLyAgIHRoaXNbXy5zYW1wbGUoWydmdWpvZ2VyaUZvcndhcmQnLCAnbWFuamlnZXJpJ10pXSh0YXJnZXQpXG4gICAgLy8gfVxuICAgIC8vIGlmKGRpc3QgPiAyNyAmJiBkaXN0IDwgMzUpIHRoaXMuc3VpaGVpZ2VyaSh0YXJnZXQpXG4gICAgLy8gdGhpc1tfLnNhbXBsZShbJ3N1aWhlaWdlcmknLCAnbWFuamlnZXJpJywgJ3NlbnNvZ2VyaScsICdtYW5qaWdlcmknLCAnc2Vuc29nZXJpJywgJ2Z1am9nZXJpJywgJ2Z1am9nZXJpRm9yd2FyZCddKV0odGFyZ2V0KSBcbiAgfSxcblxuICBsb29rQXQ6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgIHZhciBhdCA9IHRhcmdldC5wLnggPCB0aGlzLnAueCA/ICdsZWZ0JyA6ICdyaWdodCdcbiAgICBpZihhdCAhPSB0aGlzLnAuZGlyZWN0aW9uKSB0aGlzLnVzaGlybygpXG4gIH0sXG5cbiAgc3RlcDogZnVuY3Rpb24odCkge1xuICAgIHRoaXMuX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcblxuICAgIGlmKHRoaXMucC5wYXVzZWQpIHJldHVybjtcbiAgICBcbiAgICB2YXIgb3RoZXJzID0gXy5jaGFpbih0aGlzLnN0YWdlLmxpc3RzLnBsYXllcnMpLndpdGhvdXQodGhpcykuZmlsdGVyKGZ1bmN0aW9uKGkpeyByZXR1cm4gIWkucC5oaXQgfSkudmFsdWUoKSxcbiAgICAgICAgdGFyZ2V0ID0gXy5zYW1wbGUob3RoZXJzKSxcbiAgICAgICAgZGlzdCA9IHRhcmdldCA/IGRpc3RhbmNlKHRhcmdldCwgdGhpcykgOiBJbmZpbml0eTtcbiAgICBcbiAgICBpZih0YXJnZXQpIHtcblxuICAgICAgdGhpcy5sb29rQXQodGFyZ2V0KVxuXG4gICAgICBpZihkaXN0IDwgdGhpcy5oaXREaXN0YW5jZSAvIDIpIHtcbiAgICAgICAgdGhpcy5tb3ZlRnVydGhlcih0YXJnZXQpXG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmKGRpc3QgPiB0aGlzLmhpdERpc3RhbmNlKSB7XG4gICAgICAgIHRoaXMubW92ZUNsb3Nlcih0YXJnZXQpXG4gICAgICB9XG5cbiAgICAgIHZhciBzcG90ID0gc3BvdEF0dGFjayh0YXJnZXQpXG4gICAgICBpZihzcG90KSB7XG4gICAgICAgIHRoaXMuZXZhZGUodGFyZ2V0LCBzcG90KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYoZGlzdCA+IDggJiYgZGlzdCA8PSB0aGlzLmhpdERpc3RhbmNlKSB7XG4gICAgICAgICAgdGhpcy5hdHRhY2sodGFyZ2V0KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gIH1cblxufSkiLCJ2YXIgUSA9IHJlcXVpcmUoJy4vUScpLFxuICAgIGNvbGxpc2lvbnMgPSByZXF1aXJlKCcuL2Fzc2V0cycpLmNvbGxpc2lvbnMsXG4gICAgYXVkaW8gPSByZXF1aXJlKCcuL2F1ZGlvJylcblxuUS5hbmltYXRpb25zKCdnZXJpbW9uJywge1xuICBzdGFuZDogeyBmcmFtZXM6IFswXSB9LFxuICBzZW50YWlub3RzdWtpOiB7IGZyYW1lczogXy5yYW5nZSgyMiksIHJhdGU6IDEvMTIsIGxvb3A6IGZhbHNlLCB0cmlnZ2VyOiAnc3RhbmQnIH0sXG4gIGZ1am9nZXJpOiB7IGZyYW1lczogXy5yYW5nZSgxNSksIHJhdGU6IDEvMTIsIGxvb3A6IGZhbHNlLCB0cmlnZ2VyOiAnc3RhbmQnIH0sXG4gIHN1aWhlaWdlcmk6IHsgZnJhbWVzOiBfLnJhbmdlKDE1KSwgcmF0ZTogMS8xMiwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAgbWFuamlnZXJpOiB7IGZyYW1lczogXy5yYW5nZSgxNSksIHJhdGU6IDEvMTIsIGxvb3A6IGZhbHNlLCB0cmlnZ2VyOiAnc3RhbmQnIH0sXG4gIGhhbmdldHN1YXRlOiB7IGZyYW1lczogXy5yYW5nZSgyMSksIHJhdGU6IDEvMTIsIGxvb3A6IGZhbHNlLCB0cmlnZ2VyOiAnc3RhbmQnIH0sXG4gIHNlbnNvZ2VyaTogeyBmcmFtZXM6IF8ucmFuZ2UoMjApLCByYXRlOiAxLzEyLCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICB0c3Vpc29rdTogeyBmcmFtZXM6IF8ucmFuZ2UoMTEpLCByYXRlOiAxLzEyLCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICBrb3Nva3U6IHsgZnJhbWVzOiBfLnJhbmdlKDE4KSwgcmF0ZTogMS8xNywgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAgdXNoaXJvOiB7IGZyYW1lczogXy5yYW5nZSg3KSwgcmF0ZTogMS8xMiwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAgbmlub2FzaGk6IHsgZnJhbWVzOiBfLnJhbmdlKDYpLCByYXRlOiAxLzEyLCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICB0YWlzb2t1OiB7IGZyYW1lczogXy5yYW5nZSgxMSkucmV2ZXJzZSgpLCByYXRlOiAxLzEyLCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICB0b3Jzb2hpdDogeyBmcmFtZXM6IFswLDEsMiwzLDIsMSwwXSwgcmF0ZTogMS8xMiwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAgaGVhZG9mZmhpdDogeyBmcmFtZXM6IF8ucmFuZ2UoMTMpLCByYXRlOiAxLzEyLCBsb29wOiBmYWxzZSB9XG59KTtcblxuXG5cbmZ1bmN0aW9uIGludGVyc2VjdHMoYSwgYikge1xuICBpZihhLncgKyBhLmggKyBiLncgKyBiLmggPT0gMCkgcmV0dXJuIGZhbHNlO1xuICB2YXIgeEludGVzZWN0cyA9IGEueCA8IGIueCAmJiBhLngrYS53ID4gYi54IHx8IFxuICAgICAgICAgICAgICAgICAgIGEueCA8IGIueCtiLncgJiYgYS54K2EudyA+IGIueCtiLncsXG4gICAgICB5SW50ZXNlY3RzID0gYS55IDwgYi55ICYmIGEueSArIGEuaCA+IGIueSB8fFxuICAgICAgICAgICAgICAgICAgIGEueSA8IGIueStiLmggJiYgYS55K2EuaCA+IGIueStiLmhcbiAgcmV0dXJuIHhJbnRlc2VjdHMgJiYgeUludGVzZWN0c1xufVxuZnVuY3Rpb24gcmVjdCh4LCB5LCB3LCBoKSB7XG4gIHJldHVybiB7XG4gICAgeDogeHx8MCxcbiAgICB5OiB5fHwwLFxuICAgIHc6IHd8fDAsXG4gICAgaDogaHx8MFxuICB9XG59XG5cbmZ1bmN0aW9uIGF0dGFjayhmbikge1xuICByZXR1cm4gZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgaWYoIXRoaXMucC5sYW5kZWQpIHJldHVybiBmYWxzZTtcbiAgICBpZih0aGlzLnAuaGl0KSByZXR1cm4gZmFsc2U7XG4gICAgaWYodGhpcy5wLmF0dGFja2luZykgcmV0dXJuIGZhbHNlO1xuICAgIGlmKHRoaXMucC53YWxraW5nICYmIHRoaXMucC5hbmltYXRpb25GcmFtZSA+IDQgfHwgdGhpcy5wLmFuaW1hdGlvbiA9PT0gJ3VzaGlybycpIHJldHVybiBmYWxzZTtcbiAgICB0aGlzLnAubWlzc2VkID0gZmFsc2VcbiAgICB0aGlzLnAudGFyZ2V0ID0gdGFyZ2V0XG4gICAgdGhpcy5wLmF0dGFja2luZyA9IHRydWVcbiAgICB0aGlzLnAudnggPSAwXG4gICAgdmFyIGQ9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICBpZih0eXBlb2YgZCA9PT0gJ3VuZGVmaW5lZCcgfHwgZCkge1xuICAgICAgdGhpcy5vbignc3RlcCcsIHRoaXMsICdoaXRTdGVwJylcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbmZ1bmN0aW9uIGp1bXAoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMucC5oaXQpIHJldHVybiBmYWxzZTtcbiAgICBpZih0aGlzLnAuanVtcGluZykgcmV0dXJuIGZhbHNlO1xuICAgIHRoaXMucC5qdW1waW5nID0gdHJ1ZVxuICAgIHZhciBkPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgcmV0dXJuIHR5cGVvZiBkID09PSAndW5kZWZpbmVkJyB8fCBkXG4gIH1cbn1cblxuZnVuY3Rpb24gd2Fsayhmbikge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgaWYodGhpcy5wLmhpdCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmKCF0aGlzLnAubGFuZGVkKSByZXR1cm4gZmFsc2U7XG4gICAgaWYodGhpcy5wLmF0dGFja2luZykgcmV0dXJuIGZhbHNlO1xuICAgIGlmKHRoaXMucC53YWxraW5nKSByZXR1cm4gZmFsc2U7XG4gICAgdGhpcy5wLndhbGtpbmcgPSB0cnVlXG4gICAgdmFyIGQ9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICByZXR1cm4gdHlwZW9mIGQgPT09ICd1bmRlZmluZWQnIHx8IGRcbiAgfVxufVxuXG5RLk1vdmluZ1Nwcml0ZS5leHRlbmQoXCJIZWFkXCIsIHtcbiAgaW5pdDogZnVuY3Rpb24ob3duZXIsIGZvcmNlKSB7XG4gICAgdGhpcy5fc3VwZXIoe30sIHtcbiAgICAgIGNvbG9yOiBcIiMwMDAwMDBcIixcbiAgICAgIHc6IDQsXG4gICAgICBoOiA0LFxuICAgICAgeDogb3duZXIucC54LFxuICAgICAgeTogb3duZXIucC55IC0gMTMsXG4gICAgICBzY2FsZTogMixcbiAgICAgIGRpcjogLTEqb3duZXIucC5kaXIsXG4gICAgICBzZW5zb3I6IHRydWUsXG4gICAgICBsaWZlOiAwXG4gICAgfSlcbiAgICB0aGlzLmFkZCgnMmQnKTtcbiAgICB0aGlzLnAudnkgPSAtMTUwXG4gICAgdGhpcy5wLnZ4ID0gdGhpcy5wLmRpcipmb3JjZSAqIDJcbiAgICB0aGlzLm9uKFwiYnVtcC5ib3R0b21cIiwgZnVuY3Rpb24oKSB7XG4gICAgICBpZih0aGlzLnAudnkgPiAwKVxuICAgICAgICBhdWRpby5wbGF5KCdhc3NldHMvYm91bmNlLm1wMycpXG4gICAgfSk7XG4gIH0sXG4gIHN0ZXA6IGZ1bmN0aW9uKHQpIHtcbiAgICB0aGlzLl9zdXBlcih0KVxuICAgIHRoaXMucC5saWZlICs9IHRcbiAgICB0aGlzLnAuYW5nbGUgKz0gdGhpcy5wLmRpciAqIHQgKiA0MDBcbiAgICBpZih0aGlzLnAubGlmZSA+IDUpIHtcbiAgICAgIHRoaXMuZGVzdHJveSgpXG4gICAgfVxuICB9XG59KVxuXG5RLk1vdmluZ1Nwcml0ZS5leHRlbmQoXCJHZXJpTW9uXCIsIHtcbiAgXG4gIHNwZWVkOiAyNSoyLFxuICBmcmljdGlvbjogNSoyLFxuICBqdW1wU3BlZWQ6IDEzMCxcbiAgaGl0Rm9yY2U6IHtcbiAgICBmdWpvZ2VyaTogNDAsXG4gICAgbWFuamlnZXJpOiAyNSxcbiAgICBzZW5zb2dlcmk6IDQwLFxuICAgIHN1aWhlaWdlcmk6IDM1LFxuICAgIHNlbnRhaW5vdHN1a2k6IDI1LFxuICAgIGhhbmdldHN1YXRlOiA0MFxuICB9LFxuXG4gIGluaXQ6IGZ1bmN0aW9uKHApIHtcbiAgICB2YXIgdyA9IDIyKjIsIGggPSAzMioyXG4gICAgdGhpcy5fc3VwZXIocCwgeyBcbiAgICAgIHNwcml0ZTogXCJnZXJpbW9uXCIsXG4gICAgICBkaXI6IDEsXG4gICAgICB3OiB3LFxuICAgICAgaDogaCxcbiAgICAgIHN3OiA0OCoyLFxuICAgICAgc2g6IDMyKjIsXG4gICAgICBzZW5zb3I6IHRydWUsXG4gICAgICBtb3ZlbWVudHM6IFtdLFxuICAgICAgcG9pbnRzOiBbXG4gICAgICAgIFstdy8yLCAtaC8yXSwgXG4gICAgICAgIFsgdy8yLCAtaC8yIF0sIFxuICAgICAgICBbIHcvMiwgIGgvMiBdLCBcbiAgICAgICAgWy13LzIsICBoLzIgXV0sXG4gICAgICBjeDogMTAqMlxuICAgIH0pO1xuICAgIHRoaXMuYWRkKCcyZCwgYW5pbWF0aW9uJyk7XG4gICAgdGhpcy5wLmkgPSB0aGlzLnAuaSB8fCAnYSdcblxuICAgIHRoaXMub24oXCJzdGFuZFwiLCB0aGlzLCBcInN0YW5kXCIpO1xuICAgIHRoaXMub24oXCJwcmVzdGVwXCIsIHRoaXMsIFwicHJlc3RlcFwiKVxuICAgIHRoaXMub24oXCJidW1wLmJvdHRvbVwiLCB0aGlzLCBcImxhbmRcIik7XG4gICAgdGhpcy5vbihcImFuaW1FbmQuc2VudGFpbm90c3VraVwiLCB0aGlzLCBcInNlbnRhaW5vdHN1a2lFbmRcIilcbiAgICB0aGlzLm9uKFwiYW5pbUVuZC51c2hpcm9cIiwgdGhpcywgXCJ1c2hpcm9FbmRcIilcbiAgICB0aGlzLm9uKFwiYW5pbUVuZFwiLCB0aGlzLCBcImxvZ01vdmVtZW50XCIpXG4gICAgLy8gdGhpcy5vbihcInBvc3RkcmF3XCIsIHRoaXMsIFwicmVuZGVyQ29sbGlzaW9uc1wiKVxuXG4gICAgdGhpcy5zdGFuZCgpXG4gIH0sXG5cbiAgbG9nTW92ZW1lbnQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC5tb3ZlbWVudHMucHVzaCh0aGlzLnAuYW5pbWF0aW9uKVxuICAgIHRoaXMucC5tb3ZlbWVudHMgPSB0aGlzLnAubW92ZW1lbnRzLnNwbGljZSgtMylcbiAgfSxcblxuICBfYWJzeDogZnVuY3Rpb24oeCwgdykge1xuICAgIHJldHVybiB0aGlzLnAuZmxpcCA/IFxuICAgICAgdGhpcy5wLnggKyB0aGlzLnAuY3ggLSB4IC0gdyA6XG4gICAgICB0aGlzLnAueCAtIHRoaXMucC5jeCArIHhcbiAgfSxcblxuICBfYWJzeTogZnVuY3Rpb24oeSkge1xuICAgIHJldHVybiB0aGlzLnAueS10aGlzLnAuY3kgKyB5XG4gIH0sXG5cbiAgcmVuZGVyQ29sbGlzaW9uczogZnVuY3Rpb24oY3R4KSB7XG4gICAgY3R4LnNhdmUoKTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG5cbiAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsMCwwLDAuNSlcIjtcbiAgICBjdHguZmlsbFJlY3QodGhpcy5wLngtdGhpcy5wLmN4LCB0aGlzLnAueS10aGlzLnAuY3ksIHRoaXMucC53LCB0aGlzLnAuaCk7XG4gICAgY3R4LmZpbGwoKTtcbiAgICBcbiAgICB2YXIgYyA9IGNvbGxpc2lvbnNbdGhpcy5wLmFuaW1hdGlvbl0gfHwgY29sbGlzaW9ucy5zdGFuZCxcbiAgICAgICAgZnQgPSBjLnRvcnNvW3RoaXMucC5hbmltYXRpb25GcmFtZV0gfHwgYy50b3Jzb1swXSxcbiAgICAgICAgZmggPSBjLmhlYWRbdGhpcy5wLmFuaW1hdGlvbkZyYW1lXSB8fCBjLmhlYWRbMF0sXG4gICAgICAgIGZoaD0gYy5oaXQgJiYgYy5oaXRbdGhpcy5wLmFuaW1hdGlvbkZyYW1lXSB8fCB7fVxuICAgIFxuICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMjU1LDAsMjU1LDAuNSlcIjtcbiAgICBjdHguZmlsbFJlY3QodGhpcy5fYWJzeChmdC54LCBmdC53KSwgdGhpcy5fYWJzeShmdC55KSwgZnQudywgZnQuaCk7XG4gICAgY3R4LmZpbGwoKTtcblxuICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwyNTUsMjU1LDAuNSlcIjtcbiAgICBjdHguZmlsbFJlY3QodGhpcy5fYWJzeChmaC54LCBmaC53KSwgdGhpcy5fYWJzeShmaC55KSwgZmgudywgZmguaCk7XG4gICAgY3R4LmZpbGwoKTtcblxuICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMjU1LDI1NSwwLDAuNSlcIjtcbiAgICBjdHguZmlsbFJlY3QodGhpcy5fYWJzeChmaGgueCwgZmhoLncpLCB0aGlzLl9hYnN5KGZoaC55KSwgZmhoLncsIGZoaC5oKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIGN0eC5yZXN0b3JlKClcbiAgfSxcblxuICBsYW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAubGFuZGVkID0gdHJ1ZVxuICAgIHRoaXMucC5qdW1waW5nID0gZmFsc2VcbiAgfSxcblxuICBzaGVldDogZnVuY3Rpb24obmFtZSkge1xuICAgIGlmKG5hbWUpIHtcbiAgICAgIHJldHVybiB0aGlzLl9zdXBlcihuYW1lICsgJy0nICsgdGhpcy5wLmkpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLl9zdXBlcigpXG4gICAgfVxuICB9LFxuXG4gIHBhdXNlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAucGF1c2VkID0gdHJ1ZVxuICB9LFxuXG4gIHVucGF1c2U6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC5wYXVzZWQgPSBmYWxzZVxuICAgIHRoaXMuc3RhbmQoKVxuICB9LFxuXG4gIGZ1am9nZXJpRm9yd2FyZDoganVtcChhdHRhY2soZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zaGVldChcImZ1am9nZXJpXCIpXG4gICAgdGhpcy5wbGF5KCdmdWpvZ2VyaScsIDEpXG4gICAgdGhpcy5vbignc3RlcCcsIHRoaXMsICdmdWpvZ2VyaUZvcndhcmRTdGVwJylcbiAgICB0aGlzLm9uKCdzdGVwJywgdGhpcywgJ2Z1am9nZXJpU3RlcCcpXG4gIH0pKSxcblxuICBmdWpvZ2VyaToganVtcChhdHRhY2soZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zaGVldChcImZ1am9nZXJpXCIpXG4gICAgdGhpcy5wbGF5KCdmdWpvZ2VyaScsIDEpXG4gICAgdGhpcy5vbignc3RlcCcsIHRoaXMsICdmdWpvZ2VyaVN0ZXAnKVxuICB9KSksXG5cbiAgZnVqb2dlcmlGb3J3YXJkU3RlcDogZnVuY3Rpb24oKSB7XG4gICAgaWYodGhpcy5wLmFuaW1hdGlvbkZyYW1lID4gNCAmJiB0aGlzLnAuYW5pbWF0aW9uRnJhbWUgPCA3KSB7XG4gICAgICB0aGlzLnAudnggPSB0aGlzLnAuZGlyICogdGhpcy5zcGVlZFxuICAgICAgdGhpcy5vZmYoJ3N0ZXAnLCB0aGlzLCAnZnVqb2dlcmlGb3J3YXJkU3RlcCcpXG4gICAgfVxuICB9LFxuXG4gIGZ1am9nZXJpU3RlcDogZnVuY3Rpb24oKSB7XG4gICAgaWYodGhpcy5wLmFuaW1hdGlvbkZyYW1lID4gNCkge1xuICAgICAgdGhpcy5wLnZ5ID0gLXRoaXMuanVtcFNwZWVkXG4gICAgICB0aGlzLnAubGFuZGVkID0gZmFsc2VcbiAgICAgIHRoaXMucC5qdW1waW5nID0gdHJ1ZVxuICAgICAgdGhpcy5vZmYoJ3N0ZXAnLCB0aGlzLCAnZnVqb2dlcmlTdGVwJylcbiAgICB9XG4gIH0sXG5cbiAgaGFuZ2V0c3VhdGU6IGF0dGFjayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNoZWV0KFwiaGFuZ2V0c3VhdGVcIilcbiAgICB0aGlzLnBsYXkoJ2hhbmdldHN1YXRlJywgMSlcbiAgfSksXG5cbiAgc2VudGFpbm90c3VraTogYXR0YWNrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2hlZXQoXCJzZW50YWlub3RzdWtpXCIpXG4gICAgdGhpcy5wbGF5KCdzZW50YWlub3RzdWtpJywgMSlcbiAgfSksXG5cbiAgc2VudGFpbm90c3VraUVuZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLnggKz0gdGhpcy5wLmRpciAqIDE1KjJcbiAgfSxcblxuICBtYW5qaWdlcmk6IGF0dGFjayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNoZWV0KFwibWFuamlnZXJpXCIpXG4gICAgdGhpcy5wbGF5KCdtYW5qaWdlcmknLCAxKVxuICB9KSxcblxuICBzdWloZWlnZXJpOiBhdHRhY2soZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zaGVldChcInN1aWhlaWdlcmlcIilcbiAgICB0aGlzLnBsYXkoJ3N1aWhlaWdlcmknLCAxKVxuICB9KSxcblxuICBzZW5zb2dlcmk6IGF0dGFjayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNoZWV0KFwic2Vuc29nZXJpXCIpXG4gICAgdGhpcy5wbGF5KCdzZW5zb2dlcmknLCAxKVxuICB9KSxcblxuICB1c2hpcm86IHdhbGsoZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zaGVldChcInVzaGlyb1wiKVxuICAgIHRoaXMucGxheSgndXNoaXJvJywgMSlcbiAgfSksXG5cbiAgdXNoaXJvRW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAueCArPSB0aGlzLnAuZGlyICogNCoyXG4gICAgdGhpcy5wLmRpcmVjdGlvbiA9IHRoaXMucC5kaXJlY3Rpb24gPT09ICdsZWZ0JyA/ICdyaWdodCcgOiAnbGVmdCdcbiAgICB0aGlzLnByZXN0ZXAoKVxuICB9LFxuXG4gIG5pbm9hc2hpOiB3YWxrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC52eCA9IHRoaXMucC5kaXIgKiB0aGlzLnNwZWVkLzI7XG4gICAgdGhpcy5zaGVldChcIm5pbm9hc2hpXCIpXG4gICAgdGhpcy5wbGF5KCduaW5vYXNoaScsIDEpXG4gIH0pLFxuXG4gIHRhaXNva3U6IHdhbGsoZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLnZ4ID0gLXRoaXMucC5kaXIgKiB0aGlzLnNwZWVkO1xuICAgIHRoaXMuc2hlZXQoXCJ0c3Vpc29rdVwiKVxuICAgIHRoaXMucGxheSgndGFpc29rdScsIDEpXG4gIH0pLFxuICBcbiAgdHN1aXNva3U6IHdhbGsoZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLnZ4ID0gdGhpcy5wLmRpciAqIHRoaXMuc3BlZWQ7XG4gICAgdGhpcy5zaGVldChcInRzdWlzb2t1XCIpXG4gICAgdGhpcy5wbGF5KCd0c3Vpc29rdScsIDEpXG4gIH0pLFxuXG4gIGtvc29rdTogd2FsayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAudnggPSB0aGlzLnAuZGlyICogdGhpcy5zcGVlZC8yO1xuICAgIHRoaXMuc2hlZXQoXCJrb3Nva3VcIilcbiAgICB0aGlzLnBsYXkoJ2tvc29rdScsIDEpXG4gIH0pLFxuXG4gIGdlbnNva3U6IHdhbGsoZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLnZ4ID0gLXRoaXMucC5kaXIgKiB0aGlzLnNwZWVkKjIvMztcbiAgICB0aGlzLnNoZWV0KFwia29zb2t1XCIpXG4gICAgdGhpcy5wbGF5KCdrb3Nva3UnLCAxKVxuICB9KSxcblxuICBoaXRTdGVwOiBmdW5jdGlvbigpIHtcbiAgICBpZighY29sbGlzaW9uc1t0aGlzLnAuYW5pbWF0aW9uXSkgcmV0dXJuO1xuICAgIGlmKCFjb2xsaXNpb25zW3RoaXMucC5hbmltYXRpb25dLmhpdFt0aGlzLnAuYW5pbWF0aW9uRnJhbWVdLncpIHJldHVybjtcbiAgICB2YXIgaGl0ID0gdGhpcy5oaXRUZXN0KGNvbGxpc2lvbnNbdGhpcy5wLmFuaW1hdGlvbl0uaGl0W3RoaXMucC5hbmltYXRpb25GcmFtZV0pXG4gICAgaWYoaGl0KSB7XG4gICAgICBhdWRpby5wbGF5KCdhc3NldHMvaGl0LScgKyBfLnNhbXBsZShbMSwyLDMsNF0pICsgJy5tcDMnKVxuICAgICAgdmFyIHZhbHVlID0gdGhpcy5wLnRhcmdldC5oaXQodGhpcy5wLmRpciAqIHRoaXMuaGl0Rm9yY2VbdGhpcy5wLmFuaW1hdGlvbl0sIGhpdClcblxuICAgICAgdmFyIHByZXZNb3ZlbWVudCA9IHRoaXMucC5tb3ZlbWVudHNbdGhpcy5wLm1vdmVtZW50cy5sZW5ndGgtMV1cbiAgICAgIGlmKHByZXZNb3ZlbWVudCAmJiBwcmV2TW92ZW1lbnQuaW5kZXhPZignc29rdScpID4gLTEpIHtcbiAgICAgICAgdmFsdWUgKz0gMVxuICAgICAgfVxuXG4gICAgICB2YXIgc2NvcmUgPSBRLnN0YXRlLmdldChcInNjb3JlLVwiICsgdGhpcy5wLmkpIHx8IDBcbiAgICAgIFEuc3RhdGUuaW5jKFwidG90YWwtc2NvcmUtXCIgKyB0aGlzLnAuaSwgdmFsdWUqMTAwKVxuICAgICAgUS5zdGF0ZS5zZXQoXCJzY29yZS1cIiArIHRoaXMucC5pLCBNYXRoLm1pbigoc2NvcmUgKyB2YWx1ZSksIDQpKTtcbiAgICB9IGVsc2UgaWYoIXRoaXMucC5taXNzZWQpIHtcbiAgICAgIHRoaXMucC5taXNzZWQgPSB0cnVlXG4gICAgICBhdWRpby5wbGF5KCdhc3NldHMvbWlzcy0nICsgXy5zYW1wbGUoWzEsMSwxLDEsMSwxLDJdKSArICcubXAzJylcbiAgICB9XG4gIH0sXG5cbiAgaGl0VGVzdDogZnVuY3Rpb24oY29sbCkge1xuICAgIGlmKCF0aGlzLnAudGFyZ2V0KSByZXR1cm4gZmFsc2VcbiAgICBpZih0aGlzLnAudGFyZ2V0LnAuaGl0KSByZXR1cm4gZmFsc2VcbiAgICB2YXIgdCA9IHRoaXMucC50YXJnZXQsXG4gICAgICAgIHRwID0gdGhpcy5wLnRhcmdldC5wLFxuICAgICAgICB0dCA9IGNvbGxpc2lvbnNbdHAuYW5pbWF0aW9uXS50b3Jzb1t0cC5hbmltYXRpb25GcmFtZV0sXG4gICAgICAgIHRoID0gY29sbGlzaW9uc1t0cC5hbmltYXRpb25dLmhlYWRbdHAuYW5pbWF0aW9uRnJhbWVdLFxuICAgICAgICBjciA9IHJlY3QodGhpcy5fYWJzeChjb2xsLngsIGNvbGwudyksIHRoaXMuX2Fic3koY29sbC55KSwgY29sbC53LCBjb2xsLmgpXG5cbiAgICBpZihpbnRlcnNlY3RzKHJlY3QodC5fYWJzeCh0aC54LCB0aC53KSwgdC5fYWJzeSh0aC55KSwgdGgudywgdHQuaCksIGNyKSkge1xuICAgICAgcmV0dXJuICdoZWFkJ1xuICAgIH1cbiAgICBcbiAgICBpZihpbnRlcnNlY3RzKHJlY3QodC5fYWJzeCh0dC54LCB0dC53KSwgdC5fYWJzeSh0dC55KSwgdHQudywgdHQuaCksIGNyKSkge1xuICAgICAgcmV0dXJuICd0b3JzbydcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2VcbiAgfSxcblxuICBoaXQ6IGZ1bmN0aW9uKGZvcmNlLCBoaXQpIHtcbiAgICB0aGlzLnN0YW5kKClcbiAgICB0aGlzLnAuaGl0ID0gdHJ1ZSBcbiAgICBpZihoaXQgPT09ICdoZWFkJyAmJiBNYXRoLmFicyhmb3JjZSkgPiAzNSAmJiBNYXRoLnJhbmRvbSgpID4gLjUpIHtcbiAgICAgIGF1ZGlvLnBsYXkoJ2Fzc2V0cy9oZWFkLW9mZi0nICsgXy5zYW1wbGUoWzEsMiwzXSkgKyAnLm1wMycpXG4gICAgICB0aGlzLnNoZWV0KFwiaGVhZG9mZi1oaXRcIilcbiAgICAgIHRoaXMucGxheSgnaGVhZG9mZmhpdCcsIDEpXG4gICAgICB0aGlzLnN0YWdlLmluc2VydChuZXcgUS5IZWFkKHRoaXMsIGZvcmNlKSlcbiAgICAgIHJldHVybiA0XG4gICAgfSBlbHNlIHtcbiAgICAgIGF1ZGlvLnBsYXkoJ2Fzc2V0cy9odXJ0LScgKyBfLnNhbXBsZShbMSwyLDNdKSArICcubXAzJylcbiAgICAgIHRoaXMucC52eCArPSBmb3JjZVxuICAgICAgdGhpcy5zaGVldChcInRvcnNvLWhpdFwiKVxuICAgICAgdGhpcy5wbGF5KCd0b3Jzb2hpdCcsIDEpXG4gICAgICByZXR1cm4gMVxuICAgIH1cbiAgfSxcblxuICBmaW5pc2hLaWNrczogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5vZmYoJ3N0ZXAnLCB0aGlzLCAnaGl0U3RlcCcpXG4gICAgdGhpcy5vZmYoJ3N0ZXAnLCB0aGlzLCAnZnVqb2dlcmlTdGVwJylcbiAgICB0aGlzLm9mZignc3RlcCcsIHRoaXMsICdmdWpvZ2VyaUZvcndhcmRTdGVwJylcbiAgICB0aGlzLm9mZignc3RlcCcsIHRoaXMsICdzZW50YWlub3RzdWtpU3RlcCcpXG4gICAgdGhpcy5vZmYoJ3ByZXN0ZXAnLCB0aGlzLCAnZmluaXNoS2lja3MnKVxuICB9LFxuXG4gIHN0YW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAuZnJhbWUgPSAwXG4gICAgdGhpcy5wLnZ4ID0gMFxuICAgIHRoaXMucGxheSgnc3RhbmQnLCAxLCB0cnVlKVxuICAgIHRoaXMuc2hlZXQoXCJ0c3Vpc29rdVwiKVxuICAgIHRoaXMucC5qdW1waW5nID0gZmFsc2U7XG4gICAgdGhpcy5wLmF0dGFja2luZyA9IGZhbHNlO1xuICAgIHRoaXMucC53YWxraW5nID0gZmFsc2U7XG4gICAgdGhpcy5wLmhpdCA9IGZhbHNlO1xuICAgIHRoaXMucC50YXJnZXQgPSBudWxsO1xuICAgIHRoaXMuZmluaXNoS2lja3MoKVxuICB9LFxuXG4gIHByZXN0ZXA6IGZ1bmN0aW9uKHQpIHtcbiAgICBpZih0aGlzLnAuZGlyZWN0aW9uID09PSAnbGVmdCcpIHtcbiAgICAgIHRoaXMuc2V0KHtmbGlwOiAneCd9KVxuICAgICAgdGhpcy5wLmRpciA9IC0xXG4gICAgICB0aGlzLnAub3Bwb3NpdGVEaXJlY3Rpb24gPSAncmlnaHQnXG4gICAgICB0aGlzLnAuY3ggPSAxMioyXG4gICAgfVxuICAgIGlmKHRoaXMucC5kaXJlY3Rpb24gPT09ICdyaWdodCcpIHtcbiAgICAgIHRoaXMuc2V0KHtmbGlwOiAnJ30pXG4gICAgICB0aGlzLnAuZGlyID0gMVxuICAgICAgdGhpcy5wLm9wcG9zaXRlRGlyZWN0aW9uID0gJ2xlZnQnXG4gICAgICB0aGlzLnAuY3ggPSAxMCoyXG4gICAgfVxuICB9XG5cbn0pO1xuIiwidmFyIFEgPSByZXF1aXJlKCcuL1EnKVxuXG5RLkdhbWVPYmplY3QuZXh0ZW5kKFwiSHVkXCIse1xuXG4gIGluaXQ6IF8ub25jZShmdW5jdGlvbigpIHtcblxuICAgIHRoaXMuZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHRoaXMuZWwuY2xhc3NOYW1lID0gJ2h1ZCdcbiAgICB0aGlzLmVsLmlubmVySFRNTCA9IFxuICAgICAgJzxkaXYgY2xhc3M9XCJodWQtYVwiPjxzcGFuIGNsYXNzPVwic2NvcmUgc2NvcmUtYSBzY29yZS0wXCI+PC9zcGFuPjxzcGFuIGNsYXNzPVwic2NvcmUtdmFsdWVcIj48L3NwYW4+PC9kaXY+JyArXG4gICAgICAnPGRpdiBjbGFzcz1cImh1ZC1iXCI+PHNwYW4gY2xhc3M9XCJzY29yZSBzY29yZS1iIHNjb3JlLTBcIj48L3NwYW4+PHNwYW4gY2xhc3M9XCJzY29yZS12YWx1ZVwiPjwvc3Bhbj48L2Rpdj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwiaHVkLWNcIj48c3BhbiBjbGFzcz1cInNjb3JlIHNjb3JlLWMgc2NvcmUtMFwiPjwvc3Bhbj48c3BhbiBjbGFzcz1cInNjb3JlLXZhbHVlXCI+PC9zcGFuPjwvZGl2PidcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuZWwpXG5cbiAgICB0aGlzLnNjb3JlQSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zY29yZS1hJylcbiAgICB0aGlzLnNjb3JlQiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zY29yZS1iJylcbiAgICB0aGlzLnNjb3JlQyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zY29yZS1jJylcblxuICAgIHRoaXMucmVzZXQoKVxuICB9KSxcblxuICByZWZyZXNoOiBmdW5jdGlvbigpIHtcbiAgICBbJ2EnLCAnYicsICdjJ10uZm9yRWFjaChfLmJpbmQoZnVuY3Rpb24oaSkge1xuICAgICAgdmFyIHNjb3JlRWwgPSB0aGlzWydzY29yZScgKyBpLnRvVXBwZXJDYXNlKCldLFxuICAgICAgICAgIHNjb3JlVmFsdWVFbCA9IHNjb3JlRWwucGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yKCcuc2NvcmUtdmFsdWUnKSxcbiAgICAgICAgICBzY29yZSA9IFEuc3RhdGUuZ2V0KCdzY29yZS0nICsgaSkgfHwgMFxuICAgICAgc2NvcmVFbC5jbGFzc05hbWUgPSBzY29yZUVsLmNsYXNzTmFtZS5yZXBsYWNlKC9zY29yZS1cXGQvZywgJycpXG4gICAgICBzY29yZUVsLmNsYXNzTGlzdC5hZGQoJ3Njb3JlLScgKyBzY29yZSlcbiAgICAgIHNjb3JlVmFsdWVFbC5pbm5lckhUTUwgPSBRLnN0YXRlLmdldCgndG90YWwtc2NvcmUtJyArIGkpXG4gICAgfSwgdGhpcykpXG4gIH0sXG5cbiAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xuICAgIFEuc3RhdGUuc2V0KHsgXG4gICAgICAnc2NvcmUtYSc6IDAsICdzY29yZS1iJzogMCwgJ3Njb3JlLWMnOiAwXG4gICAgfSk7XG4gICAgUS5zdGF0ZS5vbihcImNoYW5nZVwiLCB0aGlzLCAncmVmcmVzaCcpXG4gICAgdGhpcy5yZWZyZXNoKClcbiAgfVxufSlcbiIsInZhciBRID0gcmVxdWlyZSgnLi9RJylcblxuUS5hbmltYXRpb25zKCdqdWRnZScsIHtcbiAgc3RhbmQ6IHsgZnJhbWVzOiBbMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwxM10sIGxvb3A6IHRydWUsIHJhdGU6IDEvMTAgfSxcbiAgd2FsazogeyBmcmFtZXM6IF8ucmFuZ2UoMTEpLCBsb29wOiB0cnVlLCByYXRlOiAxLzIwIH0sXG4gIHRhbGs6IHsgZnJhbWVzOiBbMTAsMTEsMTIsMTFdLCBsb29wOiB0cnVlLCByYXRlOiAxLzEwICB9XG59KVxuXG5RLk1vdmluZ1Nwcml0ZS5leHRlbmQoXCJKdWRnZVwiLCB7XG4gIFxuICBpbml0OiBmdW5jdGlvbihwKSB7XG4gICAgdGhpcy5fc3VwZXIocCwgeyBcbiAgICAgIHNwcml0ZTogXCJqdWRnZVwiLFxuICAgICAgc2hlZXQ6IFwianVkZ2VcIixcbiAgICAgIHNlbnNvcjogdHJ1ZSxcbiAgICAgIGN4OiAxNCxcbiAgICAgIHNjYWxlOiAuOFxuICAgIH0pO1xuICAgIHRoaXMuYWRkKCcyZCwgYW5pbWF0aW9uJyk7XG4gICAgdGhpcy5zdGFuZCgpXG5cbiAgICB0aGlzLm9uKCdzYXlOZXh0JywgdGhpcywgJ3NheU5leHQnKVxuICAgIHRoaXMub24oJ2Rlc3Ryb3llZCcsIHRoaXMsICdkZXN0JylcbiAgICBcbiAgICB0aGlzLnRleHRFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgdGhpcy50ZXh0RWwuY2xhc3NOYW1lID0gJ2p1ZGdlbWVudCdcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMudGV4dEVsKVxuXG4gICAgUS5zdGF0ZS5vbihcImNoYW5nZVwiLCB0aGlzLCAnanVkZ2UnKVxuICB9LFxuXG4gIGVudGVyOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAudnggPSAzMCoyXG4gICAgdGhpcy5wLmZsaXAgPSBcIlwiXG4gICAgdGhpcy5wbGF5KCd3YWxrJywgMSlcbiAgICB0aGlzLm9uKCdzdGVwJywgdGhpcywgJ2VudGVyRW5kJylcbiAgfSxcblxuICBlbnRlckVuZDogZnVuY3Rpb24oKSB7XG4gICAgaWYodGhpcy5wLnggPiAxNTApIHtcbiAgICAgIHRoaXMucC52eCA9IDBcbiAgICAgIHRoaXMub2ZmKCdzdGVwJywgdGhpcywgJ2VudGVyRW5kJylcbiAgICAgIHRoaXMudHJpZ2dlcignZW50ZXJFbmQnKVxuICAgIH1cbiAgfSxcblxuICB1c2hpcm86IGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMucC5mbGlwKSB7XG4gICAgICB0aGlzLnAuZmxpcCA9IFwiXCJcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wLmZsaXAgPSBcInhcIlxuICAgIH1cbiAgfSxcblxuICBleGl0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAudnggPSAtMzAqMlxuICAgIHRoaXMucC5mbGlwID0gXCJ4XCJcbiAgICB0aGlzLnBsYXkoJ3dhbGsnLCAxKVxuICAgIHRoaXMub24oJ3N0ZXAnLCB0aGlzLCAnZXhpdEVuZCcpXG4gIH0sXG5cbiAgZXhpdEVuZDogZnVuY3Rpb24oKSB7XG4gICAgaWYodGhpcy5wLnggPCAzOCkge1xuICAgICAgdGhpcy5wLnZ4ID0gMFxuICAgICAgdGhpcy5vZmYoJ3N0ZXAnLCB0aGlzLCAnZXhpdEVuZCcpXG4gICAgICB0aGlzLnRyaWdnZXIoJ2V4aXRFbmQnKVxuICAgICAgdGhpcy5zdGFuZCgpXG4gICAgfVxuICB9LFxuXG4gIHN0YW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAuZmxpcCA9IFwiXCJcbiAgICB0aGlzLnAuY3ggPSAxNCoyXG4gICAgdGhpcy5wbGF5KCdzdGFuZCcsIDEpXG4gICAgdGhpcy5vZmYoJ2VudGVyRW5kJywgdGhpcywgJ3RhbGsnKVxuICAgIHRoaXMub2ZmKCd0YWxrRW5kJywgdGhpcywgJ2V4aXQnKVxuICAgIHRoaXMub2ZmKCdleGl0RW5kJywgdGhpcywgJ3N0YW5kJylcbiAgICB0aGlzLnRyaWdnZXIoJ3N0YW5kJylcbiAgfSxcblxuICBzYXlOZXh0OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2hvaWNlcyA9IFtcIlwiXSxcbiAgICAgICAgdGV4dHMgPSB7XG4gICAgICAgICAgd2lubmVyOiBbW1wiVGhlIHdpbm5lciBpcyB7Y29sb3J9LlwiLCBcIntjb2xvcn0gd2lucyB0aGUgcm91bmQuXCJdXSxcbiAgICAgICAgICBzZWNvbmQ6IFtbXCJ7Y29sb3J9IGlzIHNlY29uZC5cIiwgXCJ7Y29sb3J9IGNvbWVzIGluIHNlY29uZC5cIl1dLFxuICAgICAgICAgIGxvc2VyOiBbXG4gICAgICAgICAgICBbJ3tjb2xvcn0sIHlvdSByLXJhdGVkLXdvcmQtaS1zaG91bGRcXCd0IHNheS4nLCAne2NvbG9yfS4uLiByZWFsbHk/JywgJ2p1c3QuLi4ganVzdCBkb25cXCd0LCB7Y29sb3J9LiddLFxuICAgICAgICAgICAgWyd7Y29sb3J9LCB5b3UgY2FuIHN0b3Agbm93LicsICd7Y29sb3J9LCB5b3UgY2FuIGRvIGJldHRlci4nLCAnQ1xcJ21vbiB7Y29sb3J9J10sXG4gICAgICAgICAgICBbJ3tjb2xvcn0sIGFsbW9zdCB0aGVyZS4nLCAnbWF5YmUgbmV4dCB0aW1lIHRyeSB0byBkbyBiZXR0ZXIge2NvbG9yfS4nXSxcbiAgICAgICAgICAgIFsnVG91Z2ggbHVjayB7Y29sb3J9LiddXG4gICAgICAgICAgXVxuICAgICAgICB9XG5cbiAgICBpZiAodGhpcy5wLnNhaWQgPT09IDApIGNob2ljZXMgPSB0ZXh0cy53aW5uZXI7XG4gICAgZWxzZSB7XG4gICAgICBpZiAodGhpcy5wLnNhaWQgPT0gdGhpcy5zdGFnZS5saXN0cy5wbGF5ZXJzLmxlbmd0aC0xKSBjaG9pY2VzID0gdGV4dHMubG9zZXI7XG4gICAgICBlbHNlIGNob2ljZXMgPSB0ZXh0cy5zZWNvbmQ7XG4gICAgfVxuXG4gICAgdmFyIHNjb3JlID0gdGhpcy5wLnJlc3VsdFt0aGlzLnAuc2FpZF0uc2NvcmUsXG4gICAgICAgIGNvbG9yID0gdGhpcy5wLnJlc3VsdFt0aGlzLnAuc2FpZF0uY29sb3IsXG4gICAgICAgIHNjb3JlVGV4dHMgPSBjaG9pY2VzW3Njb3JlICUgY2hvaWNlcy5sZW5ndGhdLFxuICAgICAgICB0ID0gXy5zYW1wbGUoc2NvcmVUZXh0cylcbiAgICB0aGlzLnRleHRFbC5pbm5lckhUTUwgPSB0LnJlcGxhY2UoJ3tjb2xvcn0nLCBjb2xvcilcblxuICAgIHRoaXMucC5zYWlkICs9IDFcbiAgICBpZih0aGlzLnAuc2FpZCA+PSB0aGlzLnN0YWdlLmxpc3RzLnBsYXllcnMubGVuZ3RoKSB7XG4gICAgICB0aGlzLnAuZCA9IHNldFRpbWVvdXQoXy5iaW5kKHRoaXMudGFsa0VuZCwgdGhpcyksIDIwMDApXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucC5kID0gc2V0VGltZW91dChfLmJpbmQodGhpcy50cmlnZ2VyLCB0aGlzLCAnc2F5TmV4dCcpLCAyMDAwKVxuICAgIH1cbiAgfSxcblxuICB0YWxrOiBmdW5jdGlvbigpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5wLmQpXG4gICAgdGhpcy5wbGF5KCd0YWxrJywgMSlcbiAgICB0aGlzLnAuc2FpZCA9IDBcbiAgICB0aGlzLnNheU5leHQoKVxuICB9LFxuXG4gIHRhbGtFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLnAuZClcbiAgICB0aGlzLnAuc2FpZCA9IDBcbiAgICB0aGlzLnRleHRFbC5pbm5lckhUTUwgPSBcIlwiXG4gICAgdGhpcy5leGl0KClcbiAgICB0aGlzLnRyaWdnZXIoJ3RhbGtFbmQnKVxuICB9LFxuXG4gIGp1ZGdlOiBmdW5jdGlvbigpIHtcbiAgICAvLyBpZih0aGlzLnAuYW5pbWF0aW9uICE9ICdzdGFuZCcpIHJldHVybjtcbiAgICB0aGlzLnAucmVzdWx0ID0gXy5zb3J0QnkodGhpcy5zdGFnZS5saXN0cy5wbGF5ZXJzLm1hcChmdW5jdGlvbihwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBpOiBwLnAuaSwgXG4gICAgICAgIHNjb3JlOiBRLnN0YXRlLmdldCgnc2NvcmUtJyArIHAucC5pKSwgXG4gICAgICAgIGNvbG9yOiB7YTogJ29yYW5nZScsIGI6ICdibHVlJywgYzogJ2dyZWVuJ31bcC5wLmldXG4gICAgICB9XG4gICAgfSksICdzY29yZScpLnJldmVyc2UoKVxuICAgIGlmKHRoaXMucC5yZXN1bHRbMF0uc2NvcmUgPT09IDQpIHtcbiAgICAgIHRoaXMuZW50ZXIoKVxuICAgICAgdGhpcy5vbignZW50ZXJFbmQnLCB0aGlzLCAndGFsaycpXG4gICAgICB0aGlzLm9uKCd0YWxrRW5kJywgdGhpcywgJ2V4aXQnKVxuICAgICAgdGhpcy5vbignZXhpdEVuZCcsIHRoaXMsICdzdGFuZCcpXG4gICAgfVxuICB9LFxuXG4gIGRlc3Q6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudGV4dEVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy50ZXh0RWwpXG4gICAgdGhpcy5vZmYoJ2VudGVyRW5kJywgdGhpcywgJ3RhbGsnKVxuICAgIHRoaXMub2ZmKCd0YWxrRW5kJywgdGhpcywgJ2V4aXQnKVxuICAgIHRoaXMub2ZmKCdleGl0RW5kJywgdGhpcywgJ3N0YW5kJylcbiAgICBjbGVhclRpbWVvdXQodGhpcy5wLmQpXG4gIH1cblxufSlcbiIsInZhciBRID0gcmVxdWlyZSgnLi9RJyksXG4gICAgR2VyaU1vbiA9IHJlcXVpcmUoJy4vR2VyaU1vbicpXG5cblEuR2VyaU1vbi5leHRlbmQoXCJQbGF5ZXJcIix7XG4gIGluaXQ6IGZ1bmN0aW9uKHApIHtcbiAgICB0aGlzLl9zdXBlcihwLCB7fSk7XG5cbiAgICB0aGlzLnAuZGlyZWN0aW9uID0gJ3JpZ2h0J1xuICAgIFxuICAgIC8vIFEuaW5wdXQub24oXCJmaXJlXCIsIHRoaXMsICdmaXJlJyk7XG4gICAgdGhpcy5vbihcInByZXN0ZXBcIiwgdGhpcywgJ2F0dGFjaycpO1xuICAgIHRoaXMub24oXCJwcmVzdGVwXCIsIHRoaXMsICd1bnNva3UnKTtcbiAgfSxcblxuICBhdHRhY2s6IGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMucC5wYXVzZWQpIHJldHVybjtcbiAgICBcbiAgICBpZighUS5pbnB1dHMuZmlyZSkgcmV0dXJuXG5cbiAgICB2YXIgdGFyZ2V0LCB0RGlzdCA9IEluZmluaXR5LCBkaXN0O1xuICAgIGZvcih2YXIgaT0wOyBpPHRoaXMuc3RhZ2UubGlzdHMucGxheWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYodGhpcy5zdGFnZS5saXN0cy5wbGF5ZXJzW2ldICE9IHRoaXMpIHtcbiAgICAgICAgZGlzdCA9IE1hdGguYWJzKHRoaXMucC54IC0gdGhpcy5zdGFnZS5saXN0cy5wbGF5ZXJzW2ldLnAueClcbiAgICAgICAgaWYoZGlzdCA8IHREaXN0KSB7XG4gICAgICAgICAgdGFyZ2V0ID0gdGhpcy5zdGFnZS5saXN0cy5wbGF5ZXJzW2ldXG4gICAgICAgICAgdERpc3QgPSBkaXN0XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoUS5pbnB1dHMudXAgJiYgUS5pbnB1dHNbdGhpcy5wLmRpcmVjdGlvbl0pIHtcbiAgICAgIHRoaXMuZnVqb2dlcmlGb3J3YXJkKHRhcmdldClcbiAgICB9XG5cbiAgICBpZiAoUS5pbnB1dHMudXApIHtcbiAgICAgIHRoaXMuZnVqb2dlcmkodGFyZ2V0KVxuICAgIH1cblxuICAgIGlmIChRLmlucHV0cy5kb3duICYmIFEuaW5wdXRzW3RoaXMucC5vcHBvc2l0ZURpcmVjdGlvbl0pIHtcbiAgICAgIHRoaXMuaGFuZ2V0c3VhdGUodGFyZ2V0KVxuICAgIH1cblxuICAgIGlmIChRLmlucHV0cy5kb3duICYmIFEuaW5wdXRzW3RoaXMucC5kaXJlY3Rpb25dKSB7XG4gICAgICB0aGlzLnNlbnRhaW5vdHN1a2kodGFyZ2V0KVxuICAgIH1cblxuICAgIGlmIChRLmlucHV0cy5kb3duKSB7XG4gICAgICB0aGlzLm1hbmppZ2VyaSh0YXJnZXQpXG4gICAgfVxuXG4gICAgaWYgKFEuaW5wdXRzW3RoaXMucC5kaXJlY3Rpb25dKSB7XG4gICAgICB0aGlzLnN1aWhlaWdlcmkodGFyZ2V0KVxuICAgIH1cblxuICAgIGlmIChRLmlucHV0c1t0aGlzLnAub3Bwb3NpdGVEaXJlY3Rpb25dKSB7XG4gICAgICB0aGlzLnNlbnNvZ2VyaSh0YXJnZXQpXG4gICAgfVxuXG4gIH0sXG5cbiAgdW5zb2t1OiBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLnAucGF1c2VkKSByZXR1cm47XG5cbiAgICBpZihRLmlucHV0cy5maXJlKSByZXR1cm5cblxuICAgIGlmKFEuaW5wdXRzLmFjdGlvbikge1xuICAgIFxuICAgICAgdGhpcy51c2hpcm8oKVxuICAgIFxuICAgIH0gZWxzZSB7XG5cbiAgICAgIGlmKFEuaW5wdXRzLnVwKSB7XG4gICAgICAgIHRoaXMua29zb2t1KClcbiAgICAgIH1cblxuICAgICAgaWYoUS5pbnB1dHMuZG93bikge1xuICAgICAgICB0aGlzLmdlbnNva3UoKSBcbiAgICAgIH1cblxuICAgICAgLy9mb3J3YXJkXG4gICAgICBpZihRLmlucHV0c1t0aGlzLnAuZGlyZWN0aW9uXSkge1xuICAgICAgICB0aGlzLm5pbm9hc2hpKCkgXG4gICAgICAgIGlmKHRoaXMucC5hbmltYXRpb24gPT09ICduaW5vYXNoaScgJiYgdGhpcy5wLmFuaW1hdGlvbkZyYW1lID4gMSkge1xuICAgICAgICAgIHRoaXMuc3RhbmQoKVxuICAgICAgICAgIHRoaXMudHN1aXNva3UoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvL2JhY2t3YXJkXG4gICAgICBpZihRLmlucHV0c1t0aGlzLnAuZGlyZWN0aW9uID09PSAnbGVmdCcgPyAncmlnaHQnIDogJ2xlZnQnXSkge1xuICAgICAgICB0aGlzLnRhaXNva3UoKVxuICAgICAgfVxuXG4gICAgfVxuXG4gICAgXG4gIH1cblxufSk7XG4iLCJcbnZhciBRID0gUXVpbnR1cyh7IGltYWdlUGF0aDogJy4vJywgYXVkaW9QYXRoOiAnLi8nLCBhdWRpb1N1cHBvcnRlZDogWyAnbXAzJyBdIH0pXG4gIC5pbmNsdWRlKFwiQXVkaW8sIFNwcml0ZXMsIFNjZW5lcywgSW5wdXQsIDJELCBBbmltXCIpXG4gIC5lbmFibGVTb3VuZCgpXG4gIC5zZXR1cCh7IG1heGltaXplOiB0cnVlIH0pXG4gIC5jb250cm9scygpXG5cblEuaW5wdXQuZGlzYWJsZVRvdWNoQ29udHJvbHMoKVxuXG5RLkV2ZW50ZWQucHJvdG90eXBlLl90cmlnZ2VyID0gUS5FdmVudGVkLnByb3RvdHlwZS50cmlnZ2VyXG5RLkV2ZW50ZWQucHJvdG90eXBlLnRyaWdnZXIgID0gZnVuY3Rpb24oZXZlbnQsZGF0YSkge1xuICAvLyBGaXJzdCBtYWtlIHN1cmUgdGhlcmUgYXJlIGFueSBsaXN0ZW5lcnMsIHRoZW4gY2hlY2sgZm9yIGFueSBsaXN0ZW5lcnNcbiAgLy8gb24gdGhpcyBzcGVjaWZpYyBldmVudCwgaWYgbm90LCBlYXJseSBvdXQuXG4gIGlmKHRoaXMubGlzdGVuZXJzICYmIHRoaXMubGlzdGVuZXJzW2V2ZW50XSkge1xuICAgIC8vIENhbGwgZWFjaCBsaXN0ZW5lciBpbiB0aGUgY29udGV4dCBvZiBlaXRoZXIgdGhlIHRhcmdldCBwYXNzZWQgaW50b1xuICAgIC8vIGBvbmAgb3IgdGhlIG9iamVjdCBpdHNlbGYuXG4gICAgdmFyIGksIGwgPSBuZXcgQXJyYXkodGhpcy5saXN0ZW5lcnNbZXZlbnRdLmxlbmd0aCksIGxlblxuICAgIGZvcihpPTAsbGVuID0gdGhpcy5saXN0ZW5lcnNbZXZlbnRdLmxlbmd0aDtpPGxlbjtpKyspIHtcbiAgICAgIGxbaV0gPSBbXG4gICAgICAgIHRoaXMubGlzdGVuZXJzW2V2ZW50XVtpXVswXSwgXG4gICAgICAgIHRoaXMubGlzdGVuZXJzW2V2ZW50XVtpXVsxXVxuICAgICAgXVxuICAgIH1cbiAgICBmb3IoaT0wLGxlbiA9IGwubGVuZ3RoO2k8bGVuO2krKykge1xuICAgICAgdmFyIGxpc3RlbmVyID0gbFtpXTtcbiAgICAgIGxpc3RlbmVyWzFdLmNhbGwobGlzdGVuZXJbMF0sZGF0YSk7XG4gICAgfVxuICB9XG59XG5cbndpbmRvdy5RID0gUVxuXG5tb2R1bGUuZXhwb3J0cyA9IFFcbiIsInZhciBRID0gcmVxdWlyZSgnLi9RJylcblxuXG5cbmZ1bmN0aW9uIGNvbGxpc2lvbnMobmFtZSwgYXNzZXQsIHNpemUpIHtcbiAgaWYoIVEuYXNzZXQoYXNzZXQpKSB7IHRocm93IFwiSW52YWxpZCBBc3NldDpcIiArIGFzc2V0OyB9XG4gIFxuICBleHBvcnRzLmNvbGxpc2lvbnNbbmFtZV0gPSB7IGhlYWQ6IFtdLCB0b3JzbzogW10sIGhpdDogW10gfVxuXG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSxcbiAgICAgIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKSxcbiAgICAgIGltZyA9IFEuYXNzZXQoYXNzZXQpLFxuICAgICAgaW1nRGF0YSxcbiAgICAgIGhlYWQgPSAxNTAsXG4gICAgICB0b3JzbyA9IDIwMCxcbiAgICAgIGhpdCA9IDEwMFxuICBcbiAgY2FudmFzLndpZHRoID0gaW1nLndpZHRoXG4gIGNhbnZhcy5oZWlnaHQgPSBpbWcuaGVpZ2h0XG4gIGNvbnRleHQuZHJhd0ltYWdlKGltZywgMCwgMCk7XG4gIFxuICBmdW5jdGlvbiBmaW5kKGltZ0RhdGEsIHJjb2xvcikge1xuICAgIHZhciBhID0gQXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbChpbWdEYXRhLmRhdGEsIHJjb2xvcikgLyA0LFxuICAgICAgICBiID0gQXJyYXkucHJvdG90eXBlLmxhc3RJbmRleE9mLmNhbGwoaW1nRGF0YS5kYXRhLCByY29sb3IpIC8gNCxcbiAgICAgICAgYyA9IHt9XG4gICAgaWYoYSA8IC0xKSByZXR1cm4gY1xuICAgIGMueCA9IGEgJSBzaXplLnRpbGV3XG4gICAgYy55ID0gTWF0aC5mbG9vcihhIC8gc2l6ZS50aWxldylcbiAgICBjLncgPSBiICUgc2l6ZS50aWxldyAtIGMueFxuICAgIGMuaCA9IE1hdGguZmxvb3IoYiAvIHNpemUudGlsZXcpIC0gYy55XG4gICAgcmV0dXJuIGNcbiAgfVxuXG4gIGZvcih2YXIgeCA9IDA7IHggPCBpbWcud2lkdGg7IHgrPXNpemUudGlsZXcpIHtcbiAgICBpbWdEYXRhID0gY29udGV4dC5nZXRJbWFnZURhdGEoeCwgMCwgc2l6ZS50aWxldywgc2l6ZS50aWxlaCk7XG4gICAgZXhwb3J0cy5jb2xsaXNpb25zW25hbWVdLmhlYWQucHVzaChmaW5kKGltZ0RhdGEsIGhlYWQpKVxuICAgIGV4cG9ydHMuY29sbGlzaW9uc1tuYW1lXS50b3Jzby5wdXNoKGZpbmQoaW1nRGF0YSwgdG9yc28pKVxuICAgIGV4cG9ydHMuY29sbGlzaW9uc1tuYW1lXS5oaXQucHVzaChmaW5kKGltZ0RhdGEsIGhpdCkpXG4gIH1cbn1cbmV4cG9ydHMuY29sbGlzaW9ucyA9IHt9XG5cblxuXG5cbmZ1bmN0aW9uIGNvbG9yaXplKGFzc2V0LCBjb2xvcikge1xuICBpZighUS5hc3NldChhc3NldCkpIHsgdGhyb3cgXCJJbnZhbGlkIEFzc2V0OlwiICsgYXNzZXQ7IH1cblxuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyksXG4gICAgICBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyksXG4gICAgICBpbWcgPSBRLmFzc2V0KGFzc2V0KSxcbiAgICAgIGltZ0RhdGEsXG4gICAgICBjb2xEYXRhLFxuICAgICAgY29sSW1nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImltZ1wiKTtcbiAgXG4gIGNhbnZhcy53aWR0aCA9IGltZy53aWR0aFxuICBjYW52YXMuaGVpZ2h0ID0gaW1nLmhlaWdodFxuICBjb250ZXh0LmRyYXdJbWFnZShpbWcsIDAsIDApO1xuICBpbWdEYXRhID0gY29udGV4dC5nZXRJbWFnZURhdGEoMCwgMCwgaW1nLndpZHRoLCBpbWcuaGVpZ2h0KVxuICBjb2xEYXRhID0gY29udGV4dC5jcmVhdGVJbWFnZURhdGEoaW1nLndpZHRoLCBpbWcuaGVpZ2h0KVxuXG4gIGZ1bmN0aW9uIHNldENvbG9yKGMsIGQsIGkpIHsgZFtpKzBdID0gY1swXTsgZFtpKzFdID0gY1sxXTsgZFtpKzJdID0gY1syXTsgZFtpKzNdID0gY1szXSB9XG4gIGZ1bmN0aW9uIGdldENvbG9yKGQsIGkpIHsgcmV0dXJuIFtkW2krMF0sIGRbaSsxXSwgZFtpKzJdLCBkW2krM11dIH1cbiAgZnVuY3Rpb24gcHJldkNvbG9yKGQsIGkpIHsgcmV0dXJuIFtkW2ktNF0sIGRbaS0zXSwgZFtpLTJdLCBkW2ktMV1dIH1cbiAgZnVuY3Rpb24gbmV4dENvbG9yKGQsIGkpIHsgcmV0dXJuIFtkW2krNF0sIGRbaSs1XSwgZFtpKzZdLCBkW2krN11dIH1cbiAgZnVuY3Rpb24gdHJhbnNwYXJlbnQoYykgeyByZXR1cm4gY1swXSA9PT0gMCAmJiBjWzFdID09PSAwICYmIGNbMl0gPT09IDAgJiYgY1szXSA9PT0gMCB9XG4gIGZ1bmN0aW9uIGRhcmsxKGMpIHsgcmV0dXJuIFtjWzBdIC0gIDUsIGNbMV0gLSAgNSwgY1syXSAtICA1LCBjWzNdXSB9XG4gIGZ1bmN0aW9uIGRhcmsyKGMpIHsgcmV0dXJuIFtjWzBdIC0gMjAsIGNbMV0gLSAyMCwgY1syXSAtIDIwLCBjWzNdXSB9XG4gIGZ1bmN0aW9uIGRhcmszKGMpIHsgcmV0dXJuIFtjWzBdIC0gODAsIGNbMV0gLSA4MCwgY1syXSAtIDgwLCBjWzNdXSB9XG4gIGZ1bmN0aW9uIGxpZ2h0ZW4oYykgeyByZXR1cm4gW2NbMF0gKyAzMCwgY1sxXSArIDMwLCBjWzJdICsgMzAsIGNbM11dIH1cbiAgXG4gIGZvciAodmFyIGk9MCwgYzsgaTxpbWdEYXRhLmRhdGEubGVuZ3RoOyBpKz00KSB7XG4gICAgYyA9IGdldENvbG9yKGltZ0RhdGEuZGF0YSwgaSlcbiAgICBzZXRDb2xvcihsaWdodGVuKGMpLCBjb2xEYXRhLmRhdGEsIGkpXG4gICAgaWYgKCF0cmFuc3BhcmVudChjKSkge1xuICAgICAgaWYgKHRyYW5zcGFyZW50KHByZXZDb2xvcihpbWdEYXRhLmRhdGEsIGktNCkpKSB7XG4gICAgICAgIHNldENvbG9yKGRhcmsyKGMpLCBjb2xEYXRhLmRhdGEsIGkpXG4gICAgICB9XG4gICAgICBpZiAodHJhbnNwYXJlbnQocHJldkNvbG9yKGltZ0RhdGEuZGF0YSwgaSkpKSB7XG4gICAgICAgIHNldENvbG9yKGRhcmszKGRhcmszKGNvbG9yKSksIGNvbERhdGEuZGF0YSwgaSlcbiAgICAgIH1cbiAgICAgIC8vIGlmICh0cmFuc3BhcmVudChnZXRDb2xvcihpbWdEYXRhLmRhdGEsIGkrNCoyKSkpIHtcbiAgICAgIC8vICAgc2V0Q29sb3IoZGFyazIoZGFyazMoY29sb3IpKSwgY29sRGF0YS5kYXRhLCBpKVxuICAgICAgLy8gfVxuICAgICAgaWYgKHRyYW5zcGFyZW50KGdldENvbG9yKGltZ0RhdGEuZGF0YSwgaSs0KSkpIHtcbiAgICAgICAgc2V0Q29sb3IoY29sb3IsIGNvbERhdGEuZGF0YSwgaSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb250ZXh0LnB1dEltYWdlRGF0YShjb2xEYXRhLCAwLCAwKTtcbiAgY29sSW1nLnNyYyA9IGNhbnZhcy50b0RhdGFVUkwoXCJpbWFnZS9wbmdcIik7XG4gIHJldHVybiBjb2xJbWdcbn1cblxuXG5leHBvcnRzLmxvYWQgPSBmdW5jdGlvbihjYikge1xuXG4gIHZhciBwbGF5ZXJBc3NldHMgPSBbXG4gICAgXCJzdWloZWlnZXJpXCIsXG4gICAgXCJtYW5qaWdlcmlcIixcbiAgICBcInRzdWlzb2t1XCIsXG4gICAgXCJ1c2hpcm9cIixcbiAgICBcImtvc29rdVwiLFxuICAgIFwibmlub2FzaGlcIixcbiAgICBcImZ1am9nZXJpXCIsXG4gICAgXCJzZW5zb2dlcmlcIixcbiAgICBcInNlbnRhaW5vdHN1a2lcIixcbiAgICBcImhhbmdldHN1YXRlXCIsXG4gICAgXCJ0b3Jzby1oaXRcIixcbiAgICBcImhlYWRvZmYtaGl0XCJdXG5cbiAgUS5sb2FkKFxuICAgIF8uZmxhdHRlbihbXG4gICAgXG4gICAgICBbXCJhc3NldHMvYmctMS5wbmdcIixcbiAgICAgIFwiYXNzZXRzL3RpbGVzLnBuZ1wiLFxuICAgICAgXCJhc3NldHMvanVkZ2UucG5nXCJdLFxuXG4gICAgICBfLm1hcChwbGF5ZXJBc3NldHMsIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIFwiYXNzZXRzL1wiICsgbmFtZSArIFwiLnBuZ1wiXG4gICAgICB9KSxcblxuICAgICAgXy5tYXAoXy53aXRob3V0KHBsYXllckFzc2V0cywgXCJ0b3Jzby1oaXRcIiwgXCJoZWFkb2ZmLWhpdFwiKSwgZnVuY3Rpb24obmFtZSkge1xuICAgICAgICByZXR1cm4gXCJhc3NldHMvXCIgKyBuYW1lICsgXCItY29sbGlzaW9ucy5wbmdcIlxuICAgICAgfSksXG5cbiAgICAgIFtcbiAgICAgIFwiYXNzZXRzL2JnLWxvb3AubXAzXCIsIFxuICAgICAgXCJhc3NldHMvYm91bmNlLm1wM1wiLFxuICAgICAgXCJhc3NldHMvaGVhZC1vZmYtMS5tcDNcIixcbiAgICAgIFwiYXNzZXRzL2hlYWQtb2ZmLTIubXAzXCIsXG4gICAgICBcImFzc2V0cy9oZWFkLW9mZi0zLm1wM1wiLFxuICAgICAgXCJhc3NldHMvaGl0LTEubXAzXCIsXG4gICAgICBcImFzc2V0cy9oaXQtMi5tcDNcIixcbiAgICAgIFwiYXNzZXRzL2hpdC0zLm1wM1wiLFxuICAgICAgXCJhc3NldHMvaGl0LTQubXAzXCIsXG4gICAgICBcImFzc2V0cy9odXJ0LTEubXAzXCIsXG4gICAgICBcImFzc2V0cy9odXJ0LTIubXAzXCIsXG4gICAgICBcImFzc2V0cy9odXJ0LTMubXAzXCIsXG4gICAgICBcImFzc2V0cy9taXNzLTEubXAzXCIsXG4gICAgICBcImFzc2V0cy9taXNzLTIubXAzXCJcbiAgICAgIF1cblxuICAgIF0pLCBmdW5jdGlvbigpIHtcblxuICAgIHZhciBwbGF5ZXJUaWxlID0geyB0aWxldzogNDgqMiwgdGlsZWg6IDMyKjIgfVxuICAgIFEuc2hlZXQoXCJ0aWxlc1wiLFwiYXNzZXRzL3RpbGVzLnBuZ1wiLCB7IHRpbGV3OiAzMiwgdGlsZWg6IDggfSk7XG4gICAgUS5zaGVldChcImp1ZGdlXCIsIFwiYXNzZXRzL2p1ZGdlLnBuZ1wiLCB7dGlsZXc6IDMyKjIsIHRpbGVoOiAzMioyfSk7XG5cbiAgICBfLmVhY2gocGxheWVyQXNzZXRzLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICBRLmFzc2V0c1tcImFzc2V0cy9cIiArIG5hbWUgKyBcIi1hLnBuZ1wiXSA9IGNvbG9yaXplKFwiYXNzZXRzL1wiICsgbmFtZSArIFwiLnBuZ1wiLCBbMjQwLCAxMjEsIDAsIDI1NV0pO1xuICAgICAgUS5hc3NldHNbXCJhc3NldHMvXCIgKyBuYW1lICsgXCItYi5wbmdcIl0gPSBjb2xvcml6ZShcImFzc2V0cy9cIiArIG5hbWUgKyBcIi5wbmdcIiwgWzEwMiwgMTUzLCAyNTUsIDI1NV0pO1xuICAgICAgUS5hc3NldHNbXCJhc3NldHMvXCIgKyBuYW1lICsgXCItYy5wbmdcIl0gPSBjb2xvcml6ZShcImFzc2V0cy9cIiArIG5hbWUgKyBcIi5wbmdcIiwgWzY4LCAyMjEsIDg1LCAyNTVdKTtcbiAgICAgIFEuc2hlZXQobmFtZSArICctYScsIFwiYXNzZXRzL1wiICsgbmFtZSArIFwiLWEucG5nXCIsIHBsYXllclRpbGUpO1xuICAgICAgUS5zaGVldChuYW1lICsgJy1iJywgXCJhc3NldHMvXCIgKyBuYW1lICsgXCItYi5wbmdcIiwgcGxheWVyVGlsZSk7XG4gICAgICBRLnNoZWV0KG5hbWUgKyAnLWMnLCBcImFzc2V0cy9cIiArIG5hbWUgKyBcIi1jLnBuZ1wiLCBwbGF5ZXJUaWxlKTtcbiAgICB9KVxuXG4gICAgXy5lYWNoKF8ud2l0aG91dChwbGF5ZXJBc3NldHMsIFwidG9yc28taGl0XCIsIFwiaGVhZG9mZi1oaXRcIiksIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIGNvbGxpc2lvbnMobmFtZSwgXCJhc3NldHMvXCIgKyBuYW1lICsgXCItY29sbGlzaW9ucy5wbmdcIiwgcGxheWVyVGlsZSlcbiAgICB9KVxuXG4gICAgZXhwb3J0cy5jb2xsaXNpb25zLnN0YW5kID0ge1xuICAgICAgaGVhZDogW2V4cG9ydHMuY29sbGlzaW9ucy50c3Vpc29rdS5oZWFkWzBdXSxcbiAgICAgIHRvcnNvOiBbZXhwb3J0cy5jb2xsaXNpb25zLnRzdWlzb2t1LnRvcnNvWzBdXSxcbiAgICAgIGhpdDogW2V4cG9ydHMuY29sbGlzaW9ucy50c3Vpc29rdS5oaXRbMF1dXG4gICAgfVxuICAgIGV4cG9ydHMuY29sbGlzaW9ucy50YWlzb2t1ID0ge1xuICAgICAgaGVhZDogW10uY29uY2F0KGV4cG9ydHMuY29sbGlzaW9ucy50c3Vpc29rdS5oZWFkKS5yZXZlcnNlKCksXG4gICAgICB0b3JzbzogW10uY29uY2F0KGV4cG9ydHMuY29sbGlzaW9ucy50c3Vpc29rdS50b3JzbykucmV2ZXJzZSgpLFxuICAgICAgaGl0OiBbXS5jb25jYXQoZXhwb3J0cy5jb2xsaXNpb25zLnRzdWlzb2t1LmhpdCkucmV2ZXJzZSgpXG4gICAgfVxuXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvYWRlcicpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cbiAgICBjYigpXG5cbiAgICBRLmxvYWQoW1wiYXNzZXRzL2l0Ky5tcDNcIl0pXG4gICAgICBcbiAgfSk7XG5cbn1cbiIsInZhciBRID0gcmVxdWlyZSgnLi9RJylcblxudmFyIG11dGUgPSBmYWxzZSxcbiAgICBtdXNpYyA9IFwiXCI7XG5cbmV4cG9ydHMubXVzaWMgPSBmdW5jdGlvbihhc3NldCkge1xuICBpZihtdXRlKSByZXR1cm47XG4gIGlmKFEuYXNzZXRzW2Fzc2V0XSAmJiBhc3NldCAhPSBtdXNpYykge1xuICAgIHRyeXsgUS5hdWRpby5zdG9wKG11c2ljKSB9IGNhdGNoIChlKXt9XG4gICAgUS5hdWRpby5wbGF5KGFzc2V0LCB7bG9vcDogdHJ1ZX0pO1xuICAgIG11c2ljID0gYXNzZXRcbiAgfVxufVxuXG5leHBvcnRzLnBsYXkgPSBmdW5jdGlvbihhc3NldCkge1xuICBpZihtdXRlKSByZXR1cm47XG4gIFEuYXVkaW8ucGxheShhc3NldCk7XG59XG5cbmV4cG9ydHMudG9nZ2xlTXV0ZSA9IGZ1bmN0aW9uKCkge1xuICBtdXRlID0gIW11dGU7XG4gIGlmKG11dGUpIFEuYXVkaW8uc3RvcCgpXG59XG4iLCJ2YXIgUSA9IHJlcXVpcmUoJy4vUScpLFxuICAgIGFzc2V0cyA9IHJlcXVpcmUoJy4vYXNzZXRzJyksXG4gICAgYXVkaW8gPSByZXF1aXJlKCcuL2F1ZGlvJylcbnJlcXVpcmUoJy4vUGxheWVyJylcbnJlcXVpcmUoJy4vQXV0b1BsYXllcicpXG5yZXF1aXJlKCcuL0FuaW1QbGF5ZXInKVxucmVxdWlyZSgnLi9IdWQnKVxucmVxdWlyZSgnLi9KdWRnZScpXG5cbnZhciBsZXZlbCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFEuVGlsZUxheWVyKHtcbiAgIHRpbGVzOiBbXG4gICBuZXcgQXJyYXkoMjApLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gICBuZXcgQXJyYXkoMjApLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gICBuZXcgQXJyYXkoMjApLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gICBuZXcgQXJyYXkoMjApLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gICBuZXcgQXJyYXkoMjApLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gICBuZXcgQXJyYXkoMjApLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gICBuZXcgQXJyYXkoMjApLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gICBuZXcgQXJyYXkoMjApLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gICBuZXcgQXJyYXkoMjApLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gICBuZXcgQXJyYXkoMjApLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gICBuZXcgQXJyYXkoMjApLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gICBuZXcgQXJyYXkoMjApLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gICBuZXcgQXJyYXkoMjApLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gICBuZXcgQXJyYXkoMjApLmpvaW4oJzEnKS5zcGxpdCgnJylcbiAgIF0sIHNoZWV0OiAndGlsZXMnIFxuICB9KVxufVxuXG5mdW5jdGlvbiBnYW1lTG9vcChzdGFnZSwganVkZ2UpIHtcbiAgXG4gIGZ1bmN0aW9uIHBhdXNlUGxheWVycygpIHtcbiAgICBpZihfLmNvbnRhaW5zKFtRLnN0YXRlLmdldCgnc2NvcmUtYScpLCBRLnN0YXRlLmdldCgnc2NvcmUtYicpLCBRLnN0YXRlLmdldCgnc2NvcmUtYycpXSwgNCkpIHtcbiAgICAgIF8uaW52b2tlKHN0YWdlLmxpc3RzLnBsYXllcnMsICdwYXVzZScpXG4gICAgfVxuICB9XG4gIFxuICBmdW5jdGlvbiBjbGVhbnVwKCkgeyBcbiAgICBqdWRnZSAmJiBqdWRnZS5kZXN0cm95KClcbiAgICBRLnN0YXRlLm9mZignY2hhbmdlJywgcGF1c2VQbGF5ZXJzKVxuICAgIF8uaW52b2tlKHN0YWdlLmxpc3RzLnBsYXllcnMsICdkZXN0cm95Jyk7XG4gICAgaHVkLnJlc2V0KClcbiAgfVxuICBcbiAgZnVuY3Rpb24gZW5kR2FtZSgpIHtcbiAgICBRLnN0YWdlU2NlbmUoJ2F1dG9wbGF5JywgMSlcbiAgfVxuXG4gIGZ1bmN0aW9uIG5ld0dhbWUoKSB7XG4gICAgUS5zdGF0ZS5zZXQoeyAndG90YWwtc2NvcmUtYSc6IDAsICd0b3RhbC1zY29yZS1iJzogMCwgJ3RvdGFsLXNjb3JlLWMnOiAwLCAncm91bmQnOiAwIH0pO1xuICAgIGF1ZGlvLm11c2ljKCdhc3NldHMvYmctbG9vcC5tcDMnKTtcbiAgICBuZXdSb3VuZCgpXG4gIH1cblxuICBmdW5jdGlvbiBuZXdSb3VuZCgpIHtcbiAgICBodWQucmVzZXQoKVxuICAgIHZhciBwbGF5ZXJzID0gc3RhZ2UubGlzdHMucGxheWVycztcbiAgICBbMTY0LCAzMTIsIDQxMl0uZm9yRWFjaChmdW5jdGlvbih4LCBpKSB7XG4gICAgICBwbGF5ZXJzW2ldICYmIHBsYXllcnNbaV0uc2V0KHt4OiB4LCB5OiAyNSoxNiwgdnk6IDB9KVxuICAgIH0pXG4gICAgUS5zdGF0ZS5pbmMoJ3JvdW5kJywgMSlcbiAgICBpZihRLnN0YXRlLmdldCgncm91bmQnKSA+IDEpIHtcbiAgICAgIGF1ZGlvLm11c2ljKCdhc3NldHMvaXQrLm1wMycpXG4gICAgfVxuICAgIF8uaW52b2tlKHN0YWdlLmxpc3RzLnBsYXllcnMsICd1bnBhdXNlJylcbiAgfVxuXG4gIGZ1bmN0aW9uIHJvdW5kRW5kKCkge1xuICAgIHZhciBzY29yZXMgPSBfLnNvcnRCeShzdGFnZS5saXN0cy5wbGF5ZXJzLm1hcChmdW5jdGlvbihwKSB7XG4gICAgICByZXR1cm4ge2k6IHAucC5pLCBzY29yZTogUS5zdGF0ZS5nZXQoJ3Njb3JlLScrIHAucC5pKX1cbiAgICB9KSwgJ3Njb3JlJylcbiAgICBpZihzY29yZXNbMF0uaSA9PT0gJ2EnICYmIHNjb3Jlc1swXS5zY29yZSA8IHNjb3Jlc1sxXS5zY29yZSkge1xuICAgICAgZW5kR2FtZSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIG5ld1JvdW5kKClcbiAgICB9XG4gIH1cblxuICBzdGFnZS5vbignZGVzdHJveWVkJywgY2xlYW51cClcbiAgUS5zdGF0ZS5vbignY2hhbmdlJywgcGF1c2VQbGF5ZXJzKVxuICBqdWRnZS5vbigndGFsa0VuZCcsIHJvdW5kRW5kKVxuICBuZXdHYW1lKClcbn1cblxuUS5zY2VuZSgnYmcnLCBmdW5jdGlvbihzdGFnZSkge1xuICB2YXIgYmcgPSBzdGFnZS5pbnNlcnQobmV3IFEuU3ByaXRlKHtcbiAgICBhc3NldDogXCJhc3NldHMvYmctMS5wbmdcIixcbiAgICBzY2FsZTogNjA4LzkwMFxuICB9KSlcbiAgYmcuY2VudGVyKClcbiAgYmcucC55IC09IDUgKzY0XG4gIHN0YWdlLm9uKFwiZGVzdHJveVwiLGZ1bmN0aW9uKCkge1xuICAgIGp1ZGdlLmRlc3Ryb3koKVxuICB9KTtcbn0pXG5cblEuc2NlbmUoXCJhbmltc1wiLCBmdW5jdGlvbihzdGFnZSkge1xuICB2YXIgbGF5ZXIgPSBzdGFnZS5jb2xsaXNpb25MYXllcihsZXZlbCgpKTtcbiAgdmFyIHBsYXllcmEgPSBzdGFnZS5pbnNlcnQobmV3IFEuQW5pbVBsYXllcih7eDogNjQsIHk6IDI1KjE2fSkpXG4gIHN0YWdlLmFkZChcInZpZXdwb3J0XCIpXG4gIHN0YWdlLnZpZXdwb3J0LnNjYWxlID0gMVxuICBzdGFnZS52aWV3cG9ydC5jZW50ZXJPbihsYXllci5wLncvMiwgbGF5ZXIucC5oLzIrNjQpXG59KVxuXG5RLnNjZW5lKFwicGxheS0xb24xXCIsIGZ1bmN0aW9uKHN0YWdlKSB7XG4gIHZhciBsYXllciA9IHN0YWdlLmNvbGxpc2lvbkxheWVyKGxldmVsKCkpO1xuICBzdGFnZS5hZGRUb0xpc3QoJ3BsYXllcnMnLCBzdGFnZS5pbnNlcnQobmV3IFEuUGxheWVyKHtpOiAnYSd9KSkpXG4gIHN0YWdlLmFkZFRvTGlzdCgncGxheWVycycsIHN0YWdlLmluc2VydChuZXcgUS5BdXRvUGxheWVyKHtpOiAnYid9KSkpXG4gIHZhciBqdWRnZSA9IHN0YWdlLmluc2VydChuZXcgUS5KdWRnZSh7eDogMzgsIHk6IDI1KjE2fSkpXG4gIHN0YWdlLmFkZChcInZpZXdwb3J0XCIpXG4gIHN0YWdlLnZpZXdwb3J0LnNjYWxlID0gMVxuICBzdGFnZS52aWV3cG9ydC5jZW50ZXJPbihsYXllci5wLncvMiwgbGF5ZXIucC5oLzIrNjQpXG4gIGdhbWVMb29wKHN0YWdlLCBqdWRnZSlcbn0pXG5cblEuc2NlbmUoXCJwbGF5LTFvbjJcIiwgZnVuY3Rpb24oc3RhZ2UpIHtcbiAgdmFyIGxheWVyID0gc3RhZ2UuY29sbGlzaW9uTGF5ZXIobGV2ZWwoKSk7XG4gIHN0YWdlLmFkZFRvTGlzdCgncGxheWVycycsIHN0YWdlLmluc2VydChuZXcgUS5QbGF5ZXIoe2k6ICdhJ30pKSlcbiAgc3RhZ2UuYWRkVG9MaXN0KCdwbGF5ZXJzJywgc3RhZ2UuaW5zZXJ0KG5ldyBRLkF1dG9QbGF5ZXIoe2k6ICdiJ30pKSlcbiAgc3RhZ2UuYWRkVG9MaXN0KCdwbGF5ZXJzJywgc3RhZ2UuaW5zZXJ0KG5ldyBRLkF1dG9QbGF5ZXIoe2k6ICdjJ30pKSlcbiAgdmFyIGp1ZGdlID0gc3RhZ2UuaW5zZXJ0KG5ldyBRLkp1ZGdlKHt4OiAzOCwgeTogMjUqMTZ9KSlcbiAgc3RhZ2UuYWRkKFwidmlld3BvcnRcIilcbiAgc3RhZ2Uudmlld3BvcnQuc2NhbGUgPSAxXG4gIHN0YWdlLnZpZXdwb3J0LmNlbnRlck9uKGxheWVyLnAudy8yLCBsYXllci5wLmgvMis2NClcbiAgZ2FtZUxvb3Aoc3RhZ2UsIGp1ZGdlKVxufSlcblxuUS5zY2VuZShcImF1dG9wbGF5XCIsIGZ1bmN0aW9uKHN0YWdlKSB7XG4gIHZhciBsYXllciA9IHN0YWdlLmNvbGxpc2lvbkxheWVyKGxldmVsKCkpO1xuICBzdGFnZS5hZGRUb0xpc3QoJ3BsYXllcnMnLCBzdGFnZS5pbnNlcnQobmV3IFEuQXV0b1BsYXllcih7aTogJ2EnfSkpKVxuICBzdGFnZS5hZGRUb0xpc3QoJ3BsYXllcnMnLCBzdGFnZS5pbnNlcnQobmV3IFEuQXV0b1BsYXllcih7aTogJ2InfSkpKVxuICBzdGFnZS5hZGRUb0xpc3QoJ3BsYXllcnMnLCBzdGFnZS5pbnNlcnQobmV3IFEuQXV0b1BsYXllcih7aTogJ2MnfSkpKVxuICB2YXIganVkZ2UgPSBzdGFnZS5pbnNlcnQobmV3IFEuSnVkZ2Uoe3g6IDM4LCB5OiAyNSoxNn0pKVxuICBzdGFnZS5hZGQoXCJ2aWV3cG9ydFwiKVxuICBzdGFnZS52aWV3cG9ydC5zY2FsZSA9IDFcbiAgc3RhZ2Uudmlld3BvcnQuY2VudGVyT24obGF5ZXIucC53LzIsIGxheWVyLnAuaC8yKzY0KVxuICBnYW1lTG9vcChzdGFnZSwganVkZ2UpXG59KVxuXG52YXIgaHVkXG5hc3NldHMubG9hZChmdW5jdGlvbigpIHtcbiAgaHVkID0gbmV3IFEuSHVkKClcbiAgaHVkLmluaXQoKVxuICBRLnN0YWdlU2NlbmUoXCJiZ1wiLCAwKTtcbiAgUS5zdGFnZVNjZW5lKFwiYXV0b3BsYXlcIiwgMSk7XG4gIFEuc3RhdGUuc2V0KCdub211c2ljJywgZmFsc2UpXG4gIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBmdW5jdGlvbihlKSB7XG4gICAgaWYoZS5rZXlDb2RlID09IDQ5KSB7XG4gICAgICBRLmNsZWFyU3RhZ2UoMSlcbiAgICAgIFEuc3RhZ2VTY2VuZShcInBsYXktMW9uMVwiLCAxKTtcbiAgICB9XG4gICAgaWYoZS5rZXlDb2RlID09IDUwKSB7XG4gICAgICBRLmNsZWFyU3RhZ2UoMSlcbiAgICAgIFEuc3RhZ2VTY2VuZShcInBsYXktMW9uMlwiLCAxKTtcbiAgICB9XG4gICAgaWYoZS5rZXlDb2RlID09IDc3KSB7XG4gICAgICBhdWRpby50b2dnbGVNdXRlKClcbiAgICB9XG4gIH0pXG59KVxuY29uc29sZS5sb2coUSkiXX0=
