(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Q = require('./Q')
require('./GeriMon')

Q.GeriMon.extend("AnimPlayer", {

  attackSequence: ['sensogeri', 'manjigeri', 'fujogeri', 'suiheigeri', 'sentainotsuki', 'hangetsuate'],
  unsokuSequence: ['ninoashi', 'tsuisoku', 'kosoku', 'gensoku', 'taisoku', 'ushiro'],

  init: function(p) {
    this._super(_.extend({
      anim: null,
      sequence: this.attackSequence
    }, p))
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

},{"./Q":7,"./assets":9,"./audio":10}],4:[function(require,module,exports){
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

Q.GameObject.extend("ScoreBoard",{

  init: _.once(function() {
    this.scores = []
    this.el = document.getElementById('scoreboard')
    this.load()
    this.refresh()

    Q.state.on('change.round', this, 'refresh')
  }),

  load: function() {
    if(!localStorage) return;
    this.scores = JSON.parse(localStorage.getItem('scoreboard')) || []
  },

  save: function() {
    if(!localStorage) return;
    var d = new Date()
    this.scores.push({
      stage: Q.stage(1).scene.name.replace('play-', ''),
      value: Q.state.get('total-score-a'),
      date: [[d.getDate(), d.getMonth()+1, d.getFullYear()].join('.'),
             [d.getHours(), d.getMinutes()].join(':')]
             .join(' ')
    })
    this.scores = _.sortBy(this.scores, 'value').reverse().slice(0,10)
    localStorage.setItem('scoreboard', JSON.stringify(this.scores))
  },

  refresh: function() {
    while(this.el.children.length > 0) {
      this.el.children[0].remove()
    }
    this.scores.forEach(function(score) {
      var li = document.createElement('li')
      li.innerHTML = "<b>" + score.value + "</b> " + score.stage + " " + score.date
      this.el.appendChild(li)
    }.bind(this))
  },

  show: function() {
    this.el.classList.add('open')
  },
  hide: function() {
    this.el.classList.remove('open')
  }
})

},{"./Q":7}],9:[function(require,module,exports){
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

},{"./Q":7}],10:[function(require,module,exports){
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

},{"./Q":7}],11:[function(require,module,exports){
var Q = require('./Q'),
    assets = require('./assets'),
    audio = require('./audio')
require('./Player')
require('./AutoPlayer')
require('./AnimPlayer')
require('./Hud')
require('./ScoreBoard')
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
    if(Q.stage(1).scene.name == 'play-1on1' || Q.stage(1).scene.name == 'play-1on2') scoreboard.save()
    Q.stageScene('autoplay', 1)
    scoreboard.show()
  }

  function newGame() {
    if(Q.stage(1).scene.name == 'play-1on1' || Q.stage(1).scene.name == 'play-1on2') scoreboard.hide()
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

var hud,
    scoreboard
assets.load(function() {
  hud = new Q.Hud()
  hud.init()
  scoreboard = new Q.ScoreBoard()
  scoreboard.init()
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
},{"./AnimPlayer":1,"./AutoPlayer":2,"./Hud":4,"./Judge":5,"./Player":6,"./Q":7,"./ScoreBoard":8,"./assets":9,"./audio":10}]},{},[11])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvQW5pbVBsYXllci5qcyIsImxpYi9BdXRvUGxheWVyLmpzIiwibGliL0dlcmlNb24uanMiLCJsaWIvSHVkLmpzIiwibGliL0p1ZGdlLmpzIiwibGliL1BsYXllci5qcyIsImxpYi9RLmpzIiwibGliL1Njb3JlQm9hcmQuanMiLCJsaWIvYXNzZXRzLmpzIiwibGliL2F1ZGlvLmpzIiwibGliL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgUSA9IHJlcXVpcmUoJy4vUScpXG5yZXF1aXJlKCcuL0dlcmlNb24nKVxuXG5RLkdlcmlNb24uZXh0ZW5kKFwiQW5pbVBsYXllclwiLCB7XG5cbiAgYXR0YWNrU2VxdWVuY2U6IFsnc2Vuc29nZXJpJywgJ21hbmppZ2VyaScsICdmdWpvZ2VyaScsICdzdWloZWlnZXJpJywgJ3NlbnRhaW5vdHN1a2knLCAnaGFuZ2V0c3VhdGUnXSxcbiAgdW5zb2t1U2VxdWVuY2U6IFsnbmlub2FzaGknLCAndHN1aXNva3UnLCAna29zb2t1JywgJ2dlbnNva3UnLCAndGFpc29rdScsICd1c2hpcm8nXSxcblxuICBpbml0OiBmdW5jdGlvbihwKSB7XG4gICAgdGhpcy5fc3VwZXIoXy5leHRlbmQoe1xuICAgICAgYW5pbTogbnVsbCxcbiAgICAgIHNlcXVlbmNlOiB0aGlzLmF0dGFja1NlcXVlbmNlXG4gICAgfSwgcCkpXG4gIH0sXG5cbiAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIG4gPSB0aGlzLnAuc2VxdWVuY2VbdGhpcy5wLnNlcXVlbmNlLmluZGV4T2YodGhpcy5wLmFuaW0pICsgMV0gfHwgdGhpcy5wLnNlcXVlbmNlWzBdXG4gICAgaWYodGhpc1tuXSgpKSB7XG4gICAgICB0aGlzLnAuYW5pbSA9IG5cbiAgICB9XG4gIH0sXG5cbiAgc3RlcDogZnVuY3Rpb24odCkge1xuICAgIGlmKFEuaW5wdXRzLmZpcmUpIHtcbiAgICAgIHRoaXMucC5zZXF1ZW5jZSA9IHRoaXMucC5zZXF1ZW5jZSA9PSB0aGlzLmF0dGFja1NlcXVlbmNlID8gdGhpcy51bnNva3VTZXF1ZW5jZSA6IHRoaXMuYXR0YWNrU2VxdWVuY2VcbiAgICB9XG4gICAgdGhpcy5uZXh0KClcbiAgfVxuXG59KSIsInZhciBRID0gcmVxdWlyZSgnLi9RJylcbnJlcXVpcmUoJy4vR2VyaU1vbicpXG5cblxuZnVuY3Rpb24gZGlzdGFuY2UoYSwgYikge1xuICB2YXIgeCA9IE1hdGguYWJzKGEucC54IC0gYi5wLngpLFxuICAgICAgeSA9IE1hdGguYWJzKGEucC55IC0gYi5wLnkpXG4gIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5KTtcbn1cblxuZnVuY3Rpb24gc3BvdEF0dGFjayh0YXJnZXQpIHtcbiAgaWYodGFyZ2V0LnAuYXR0YWNraW5nICYmIHRhcmdldC5wLmFuaW1hdGlvbkZyYW1lID4gNCkge1xuICAgIHJldHVybiB0YXJnZXQucC5hbmltYXRpb25cbiAgfVxufVxuXG5RLkdlcmlNb24uZXh0ZW5kKFwiQXV0b1BsYXllclwiLCB7XG5cbiAgaGl0RGlzdGFuY2U6IDM1KjIsXG5cbiAgbW92ZUNsb3NlcjogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgaWYoZGlzdGFuY2UodGFyZ2V0LCB0aGlzKSA+IHRoaXMuaGl0RGlzdGFuY2UgKyB0aGlzLnAudy8yKSB7XG4gICAgICB0aGlzLnRzdWlzb2t1KClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5uaW5vYXNoaSgpXG4gICAgfVxuICB9LFxuXG4gIG1vdmVGdXJ0aGVyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICB0aGlzW18uc2FtcGxlKFsndGFpc29rdScsICdnZW5zb2t1J10pXSgpXG4gIH0sXG5cbiAgY2FuY2VsQXR0YWNrOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm5cbiAgICBpZih0aGlzLnAuYXR0YWNraW5nICYmIHRoaXMucC5hbmltYXRpb25GcmFtZSA8IDQpIHtcbiAgICAgIHRoaXMuc3RhbmQoKVxuICAgIH1cbiAgfSxcblxuICBjYW5jZWxVbnNva3U6IGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMucC53YWxraW5nKSB7XG4gICAgICBpZih0aGlzLnAuYW5pbWF0aW9uRnJhbWUgPCAzIHx8IHRoaXMucC5hbmltYXRpb25GcmFtZSA+IDYpIHtcbiAgICAgICAgdGhpcy5zdGFuZCgpXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIGF0dGFja0R1cmluZ0F0dGFjazogZnVuY3Rpb24odGFyZ2V0LCBhdHRhY2spIHtcbiAgICBpZihhdHRhY2sgPT09ICdzdWloZWlnZXJpJykge1xuICAgICAgaWYodGFyZ2V0LnAuYW5pbWF0aW9uRnJhbWUgPCA2KSB7XG4gICAgICAgIHRoaXNbXy5zYW1wbGUoWydmdWpvZ2VyaScsICdtYW5qaWdlcmknXSldKHRhcmdldClcbiAgICAgIH1cbiAgICB9XG4gICAgaWYoYXR0YWNrID09PSAnZnVqb2dlcmknKSB7XG4gICAgICBpZih0YXJnZXQucC5hbmltYXRpb25GcmFtZSA8IDEwKSB7XG4gICAgICAgIHRoaXMubWFuamlnZXJpKHRhcmdldClcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgYXR0YWNrQWZ0ZXJBdHRhY2s6IGZ1bmN0aW9uKHRhcmdldCwgYXR0YWNrKSB7XG4gICAgaWYoYXR0YWNrID09PSAnc3VpaGVpZ2VyaScpIHtcbiAgICAgIGlmKHRhcmdldC5wLmFuaW1hdGlvbkZyYW1lID4gNikge1xuICAgICAgICB0aGlzLmZ1am9nZXJpKHRhcmdldClcbiAgICAgIH1cbiAgICB9XG4gICAgaWYoYXR0YWNrID09PSAnZnVqb2dlcmknKSB7XG4gICAgICBpZih0YXJnZXQucC5hbmltYXRpb25GcmFtZSA+IDEwKSB7XG4gICAgICAgIHRoaXMubWFuamlnZXJpKHRhcmdldClcbiAgICAgIH1cbiAgICB9XG4gICAgaWYoYXR0YWNrID09PSAnbWFuamlnZXJpJykge1xuICAgICAgaWYodGFyZ2V0LnAuYW5pbWF0aW9uRnJhbWUgPiA3KSB7XG4gICAgICAgIHRoaXMuc3VpaGVpZ2VyaSh0YXJnZXQpXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIGV2YWRlOiBmdW5jdGlvbih0YXJnZXQsIGF0dGFjaykge1xuICAgIGlmKGF0dGFjaykge1xuICAgICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpXG4gICAgICB0aGlzLmNhbmNlbEF0dGFjaygpXG4gICAgICBpZihyID4gLjgpIHtcbiAgICAgICAgdGhpcy5rb3Nva3UoKVxuICAgICAgfSBlbHNlIGlmIChyID4gLjUgfHwgZGlzdGFuY2UodGFyZ2V0LCB0aGlzKSA8IHRoaXMuaGl0RGlzdGFuY2UgKiAzLzQpIHtcbiAgICAgICAgdGhpcy5nZW5zb2t1KClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudGFpc29rdSgpXG4gICAgICB9XG5cbiAgICB9XG4gIH0sXG5cbiAgYXR0YWNrOiBmdW5jdGlvbih0YXJnZXQsIGF0dGFjaykge1xuICAgIHZhciBkaXN0ID0gZGlzdGFuY2UodGFyZ2V0LCB0aGlzKVxuICAgIGlmKGRpc3QgPCAxNSoyKSB7XG4gICAgICB0aGlzW18uc2FtcGxlKFsnaGFuZ2V0c3VhdGUnLCAndHN1aXNva3UnXSldKHRhcmdldClcbiAgICB9IGVsc2UgaWYoZGlzdCA8IDI2KjIpIHtcbiAgICAgIHRoaXNbXy5zYW1wbGUoWydmdWpvZ2VyaScsICdzZW5zb2dlcmknLCAnbWFuamlnZXJpJ10pXSh0YXJnZXQpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXNbXy5zYW1wbGUoWydmdWpvZ2VyaUZvcndhcmQnLCAnc3VpaGVpZ2VyaScsICdzZW50YWlub3RzdWtpJ10pXSh0YXJnZXQpXG4gICAgfVxuICAgIC8vIGlmKGRpc3QgPiAxNCAmJiBkaXN0IDwgMjIpIHRoaXMuZnVqb2dlcmkodGFyZ2V0KVxuICAgIC8vIGlmKGRpc3QgPiAxNyAmJiBkaXN0IDwgMjYpIHRoaXMuc2Vuc29nZXJpKHRhcmdldClcbiAgICAvLyBpZihkaXN0ID4gMjAgJiYgZGlzdCA8IDI4KSB7XG4gICAgLy8gICB0aGlzW18uc2FtcGxlKFsnZnVqb2dlcmlGb3J3YXJkJywgJ21hbmppZ2VyaSddKV0odGFyZ2V0KVxuICAgIC8vIH1cbiAgICAvLyBpZihkaXN0ID4gMjcgJiYgZGlzdCA8IDM1KSB0aGlzLnN1aWhlaWdlcmkodGFyZ2V0KVxuICAgIC8vIHRoaXNbXy5zYW1wbGUoWydzdWloZWlnZXJpJywgJ21hbmppZ2VyaScsICdzZW5zb2dlcmknLCAnbWFuamlnZXJpJywgJ3NlbnNvZ2VyaScsICdmdWpvZ2VyaScsICdmdWpvZ2VyaUZvcndhcmQnXSldKHRhcmdldCkgXG4gIH0sXG5cbiAgbG9va0F0OiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICB2YXIgYXQgPSB0YXJnZXQucC54IDwgdGhpcy5wLnggPyAnbGVmdCcgOiAncmlnaHQnXG4gICAgaWYoYXQgIT0gdGhpcy5wLmRpcmVjdGlvbikgdGhpcy51c2hpcm8oKVxuICB9LFxuXG4gIHN0ZXA6IGZ1bmN0aW9uKHQpIHtcbiAgICB0aGlzLl9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG5cbiAgICBpZih0aGlzLnAucGF1c2VkKSByZXR1cm47XG4gICAgXG4gICAgdmFyIG90aGVycyA9IF8uY2hhaW4odGhpcy5zdGFnZS5saXN0cy5wbGF5ZXJzKS53aXRob3V0KHRoaXMpLmZpbHRlcihmdW5jdGlvbihpKXsgcmV0dXJuICFpLnAuaGl0IH0pLnZhbHVlKCksXG4gICAgICAgIHRhcmdldCA9IF8uc2FtcGxlKG90aGVycyksXG4gICAgICAgIGRpc3QgPSB0YXJnZXQgPyBkaXN0YW5jZSh0YXJnZXQsIHRoaXMpIDogSW5maW5pdHk7XG4gICAgXG4gICAgaWYodGFyZ2V0KSB7XG5cbiAgICAgIHRoaXMubG9va0F0KHRhcmdldClcblxuICAgICAgaWYoZGlzdCA8IHRoaXMuaGl0RGlzdGFuY2UgLyAyKSB7XG4gICAgICAgIHRoaXMubW92ZUZ1cnRoZXIodGFyZ2V0KVxuICAgICAgfVxuICAgICAgXG4gICAgICBpZihkaXN0ID4gdGhpcy5oaXREaXN0YW5jZSkge1xuICAgICAgICB0aGlzLm1vdmVDbG9zZXIodGFyZ2V0KVxuICAgICAgfVxuXG4gICAgICB2YXIgc3BvdCA9IHNwb3RBdHRhY2sodGFyZ2V0KVxuICAgICAgaWYoc3BvdCkge1xuICAgICAgICB0aGlzLmV2YWRlKHRhcmdldCwgc3BvdClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmKGRpc3QgPiA4ICYmIGRpc3QgPD0gdGhpcy5oaXREaXN0YW5jZSkge1xuICAgICAgICAgIHRoaXMuYXR0YWNrKHRhcmdldClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICB9XG5cbn0pIiwidmFyIFEgPSByZXF1aXJlKCcuL1EnKSxcbiAgICBjb2xsaXNpb25zID0gcmVxdWlyZSgnLi9hc3NldHMnKS5jb2xsaXNpb25zLFxuICAgIGF1ZGlvID0gcmVxdWlyZSgnLi9hdWRpbycpXG5cblEuYW5pbWF0aW9ucygnZ2VyaW1vbicsIHtcbiAgc3RhbmQ6IHsgZnJhbWVzOiBbMF0gfSxcbiAgc2VudGFpbm90c3VraTogeyBmcmFtZXM6IF8ucmFuZ2UoMjIpLCByYXRlOiAxLzEyLCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICBmdWpvZ2VyaTogeyBmcmFtZXM6IF8ucmFuZ2UoMTUpLCByYXRlOiAxLzEyLCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICBzdWloZWlnZXJpOiB7IGZyYW1lczogXy5yYW5nZSgxNSksIHJhdGU6IDEvMTIsIGxvb3A6IGZhbHNlLCB0cmlnZ2VyOiAnc3RhbmQnIH0sXG4gIG1hbmppZ2VyaTogeyBmcmFtZXM6IF8ucmFuZ2UoMTUpLCByYXRlOiAxLzEyLCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICBoYW5nZXRzdWF0ZTogeyBmcmFtZXM6IF8ucmFuZ2UoMjEpLCByYXRlOiAxLzEyLCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICBzZW5zb2dlcmk6IHsgZnJhbWVzOiBfLnJhbmdlKDIwKSwgcmF0ZTogMS8xMiwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAgdHN1aXNva3U6IHsgZnJhbWVzOiBfLnJhbmdlKDExKSwgcmF0ZTogMS8xMiwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAga29zb2t1OiB7IGZyYW1lczogXy5yYW5nZSgxOCksIHJhdGU6IDEvMTcsIGxvb3A6IGZhbHNlLCB0cmlnZ2VyOiAnc3RhbmQnIH0sXG4gIHVzaGlybzogeyBmcmFtZXM6IF8ucmFuZ2UoNyksIHJhdGU6IDEvMTIsIGxvb3A6IGZhbHNlLCB0cmlnZ2VyOiAnc3RhbmQnIH0sXG4gIG5pbm9hc2hpOiB7IGZyYW1lczogXy5yYW5nZSg2KSwgcmF0ZTogMS8xMiwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAgdGFpc29rdTogeyBmcmFtZXM6IF8ucmFuZ2UoMTEpLnJldmVyc2UoKSwgcmF0ZTogMS8xMiwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAgdG9yc29oaXQ6IHsgZnJhbWVzOiBbMCwxLDIsMywyLDEsMF0sIHJhdGU6IDEvMTIsIGxvb3A6IGZhbHNlLCB0cmlnZ2VyOiAnc3RhbmQnIH0sXG4gIGhlYWRvZmZoaXQ6IHsgZnJhbWVzOiBfLnJhbmdlKDEzKSwgcmF0ZTogMS8xMiwgbG9vcDogZmFsc2UgfVxufSk7XG5cblxuXG5mdW5jdGlvbiBpbnRlcnNlY3RzKGEsIGIpIHtcbiAgaWYoYS53ICsgYS5oICsgYi53ICsgYi5oID09IDApIHJldHVybiBmYWxzZTtcbiAgdmFyIHhJbnRlc2VjdHMgPSBhLnggPCBiLnggJiYgYS54K2EudyA+IGIueCB8fCBcbiAgICAgICAgICAgICAgICAgICBhLnggPCBiLngrYi53ICYmIGEueCthLncgPiBiLngrYi53LFxuICAgICAgeUludGVzZWN0cyA9IGEueSA8IGIueSAmJiBhLnkgKyBhLmggPiBiLnkgfHxcbiAgICAgICAgICAgICAgICAgICBhLnkgPCBiLnkrYi5oICYmIGEueSthLmggPiBiLnkrYi5oXG4gIHJldHVybiB4SW50ZXNlY3RzICYmIHlJbnRlc2VjdHNcbn1cbmZ1bmN0aW9uIHJlY3QoeCwgeSwgdywgaCkge1xuICByZXR1cm4ge1xuICAgIHg6IHh8fDAsXG4gICAgeTogeXx8MCxcbiAgICB3OiB3fHwwLFxuICAgIGg6IGh8fDBcbiAgfVxufVxuXG5mdW5jdGlvbiBhdHRhY2soZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHRhcmdldCkge1xuICAgIGlmKCF0aGlzLnAubGFuZGVkKSByZXR1cm4gZmFsc2U7XG4gICAgaWYodGhpcy5wLmhpdCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmKHRoaXMucC5hdHRhY2tpbmcpIHJldHVybiBmYWxzZTtcbiAgICBpZih0aGlzLnAud2Fsa2luZyAmJiB0aGlzLnAuYW5pbWF0aW9uRnJhbWUgPiA0IHx8IHRoaXMucC5hbmltYXRpb24gPT09ICd1c2hpcm8nKSByZXR1cm4gZmFsc2U7XG4gICAgdGhpcy5wLm1pc3NlZCA9IGZhbHNlXG4gICAgdGhpcy5wLnRhcmdldCA9IHRhcmdldFxuICAgIHRoaXMucC5hdHRhY2tpbmcgPSB0cnVlXG4gICAgdGhpcy5wLnZ4ID0gMFxuICAgIHZhciBkPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgaWYodHlwZW9mIGQgPT09ICd1bmRlZmluZWQnIHx8IGQpIHtcbiAgICAgIHRoaXMub24oJ3N0ZXAnLCB0aGlzLCAnaGl0U3RlcCcpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5mdW5jdGlvbiBqdW1wKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLnAuaGl0KSByZXR1cm4gZmFsc2U7XG4gICAgaWYodGhpcy5wLmp1bXBpbmcpIHJldHVybiBmYWxzZTtcbiAgICB0aGlzLnAuanVtcGluZyA9IHRydWVcbiAgICB2YXIgZD0gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgIHJldHVybiB0eXBlb2YgZCA9PT0gJ3VuZGVmaW5lZCcgfHwgZFxuICB9XG59XG5cbmZ1bmN0aW9uIHdhbGsoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMucC5oaXQpIHJldHVybiBmYWxzZTtcbiAgICBpZighdGhpcy5wLmxhbmRlZCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmKHRoaXMucC5hdHRhY2tpbmcpIHJldHVybiBmYWxzZTtcbiAgICBpZih0aGlzLnAud2Fsa2luZykgcmV0dXJuIGZhbHNlO1xuICAgIHRoaXMucC53YWxraW5nID0gdHJ1ZVxuICAgIHZhciBkPSBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgcmV0dXJuIHR5cGVvZiBkID09PSAndW5kZWZpbmVkJyB8fCBkXG4gIH1cbn1cblxuUS5Nb3ZpbmdTcHJpdGUuZXh0ZW5kKFwiSGVhZFwiLCB7XG4gIGluaXQ6IGZ1bmN0aW9uKG93bmVyLCBmb3JjZSkge1xuICAgIHRoaXMuX3N1cGVyKHt9LCB7XG4gICAgICBjb2xvcjogXCIjMDAwMDAwXCIsXG4gICAgICB3OiA0LFxuICAgICAgaDogNCxcbiAgICAgIHg6IG93bmVyLnAueCxcbiAgICAgIHk6IG93bmVyLnAueSAtIDEzLFxuICAgICAgc2NhbGU6IDIsXG4gICAgICBkaXI6IC0xKm93bmVyLnAuZGlyLFxuICAgICAgc2Vuc29yOiB0cnVlLFxuICAgICAgbGlmZTogMFxuICAgIH0pXG4gICAgdGhpcy5hZGQoJzJkJyk7XG4gICAgdGhpcy5wLnZ5ID0gLTE1MFxuICAgIHRoaXMucC52eCA9IHRoaXMucC5kaXIqZm9yY2UgKiAyXG4gICAgdGhpcy5vbihcImJ1bXAuYm90dG9tXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYodGhpcy5wLnZ5ID4gMClcbiAgICAgICAgYXVkaW8ucGxheSgnYXNzZXRzL2JvdW5jZS5tcDMnKVxuICAgIH0pO1xuICB9LFxuICBzdGVwOiBmdW5jdGlvbih0KSB7XG4gICAgdGhpcy5fc3VwZXIodClcbiAgICB0aGlzLnAubGlmZSArPSB0XG4gICAgdGhpcy5wLmFuZ2xlICs9IHRoaXMucC5kaXIgKiB0ICogNDAwXG4gICAgaWYodGhpcy5wLmxpZmUgPiA1KSB7XG4gICAgICB0aGlzLmRlc3Ryb3koKVxuICAgIH1cbiAgfVxufSlcblxuUS5Nb3ZpbmdTcHJpdGUuZXh0ZW5kKFwiR2VyaU1vblwiLCB7XG4gIFxuICBzcGVlZDogMjUqMixcbiAgZnJpY3Rpb246IDUqMixcbiAganVtcFNwZWVkOiAxMzAsXG4gIGhpdEZvcmNlOiB7XG4gICAgZnVqb2dlcmk6IDQwLFxuICAgIG1hbmppZ2VyaTogMjUsXG4gICAgc2Vuc29nZXJpOiA0MCxcbiAgICBzdWloZWlnZXJpOiAzNSxcbiAgICBzZW50YWlub3RzdWtpOiAyNSxcbiAgICBoYW5nZXRzdWF0ZTogNDBcbiAgfSxcblxuICBpbml0OiBmdW5jdGlvbihwKSB7XG4gICAgdmFyIHcgPSAyMioyLCBoID0gMzIqMlxuICAgIHRoaXMuX3N1cGVyKHAsIHsgXG4gICAgICBzcHJpdGU6IFwiZ2VyaW1vblwiLFxuICAgICAgZGlyOiAxLFxuICAgICAgdzogdyxcbiAgICAgIGg6IGgsXG4gICAgICBzdzogNDgqMixcbiAgICAgIHNoOiAzMioyLFxuICAgICAgc2Vuc29yOiB0cnVlLFxuICAgICAgbW92ZW1lbnRzOiBbXSxcbiAgICAgIHBvaW50czogW1xuICAgICAgICBbLXcvMiwgLWgvMl0sIFxuICAgICAgICBbIHcvMiwgLWgvMiBdLCBcbiAgICAgICAgWyB3LzIsICBoLzIgXSwgXG4gICAgICAgIFstdy8yLCAgaC8yIF1dLFxuICAgICAgY3g6IDEwKjJcbiAgICB9KTtcbiAgICB0aGlzLmFkZCgnMmQsIGFuaW1hdGlvbicpO1xuICAgIHRoaXMucC5pID0gdGhpcy5wLmkgfHwgJ2EnXG5cbiAgICB0aGlzLm9uKFwic3RhbmRcIiwgdGhpcywgXCJzdGFuZFwiKTtcbiAgICB0aGlzLm9uKFwicHJlc3RlcFwiLCB0aGlzLCBcInByZXN0ZXBcIilcbiAgICB0aGlzLm9uKFwiYnVtcC5ib3R0b21cIiwgdGhpcywgXCJsYW5kXCIpO1xuICAgIHRoaXMub24oXCJhbmltRW5kLnNlbnRhaW5vdHN1a2lcIiwgdGhpcywgXCJzZW50YWlub3RzdWtpRW5kXCIpXG4gICAgdGhpcy5vbihcImFuaW1FbmQudXNoaXJvXCIsIHRoaXMsIFwidXNoaXJvRW5kXCIpXG4gICAgdGhpcy5vbihcImFuaW1FbmRcIiwgdGhpcywgXCJsb2dNb3ZlbWVudFwiKVxuICAgIC8vIHRoaXMub24oXCJwb3N0ZHJhd1wiLCB0aGlzLCBcInJlbmRlckNvbGxpc2lvbnNcIilcblxuICAgIHRoaXMuc3RhbmQoKVxuICB9LFxuXG4gIGxvZ01vdmVtZW50OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAubW92ZW1lbnRzLnB1c2godGhpcy5wLmFuaW1hdGlvbilcbiAgICB0aGlzLnAubW92ZW1lbnRzID0gdGhpcy5wLm1vdmVtZW50cy5zcGxpY2UoLTMpXG4gIH0sXG5cbiAgX2Fic3g6IGZ1bmN0aW9uKHgsIHcpIHtcbiAgICByZXR1cm4gdGhpcy5wLmZsaXAgPyBcbiAgICAgIHRoaXMucC54ICsgdGhpcy5wLmN4IC0geCAtIHcgOlxuICAgICAgdGhpcy5wLnggLSB0aGlzLnAuY3ggKyB4XG4gIH0sXG5cbiAgX2Fic3k6IGZ1bmN0aW9uKHkpIHtcbiAgICByZXR1cm4gdGhpcy5wLnktdGhpcy5wLmN5ICsgeVxuICB9LFxuXG4gIHJlbmRlckNvbGxpc2lvbnM6IGZ1bmN0aW9uKGN0eCkge1xuICAgIGN0eC5zYXZlKCk7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuXG4gICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgwLDAsMCwwLjUpXCI7XG4gICAgY3R4LmZpbGxSZWN0KHRoaXMucC54LXRoaXMucC5jeCwgdGhpcy5wLnktdGhpcy5wLmN5LCB0aGlzLnAudywgdGhpcy5wLmgpO1xuICAgIGN0eC5maWxsKCk7XG4gICAgXG4gICAgdmFyIGMgPSBjb2xsaXNpb25zW3RoaXMucC5hbmltYXRpb25dIHx8IGNvbGxpc2lvbnMuc3RhbmQsXG4gICAgICAgIGZ0ID0gYy50b3Jzb1t0aGlzLnAuYW5pbWF0aW9uRnJhbWVdIHx8IGMudG9yc29bMF0sXG4gICAgICAgIGZoID0gYy5oZWFkW3RoaXMucC5hbmltYXRpb25GcmFtZV0gfHwgYy5oZWFkWzBdLFxuICAgICAgICBmaGg9IGMuaGl0ICYmIGMuaGl0W3RoaXMucC5hbmltYXRpb25GcmFtZV0gfHwge31cbiAgICBcbiAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDI1NSwwLDI1NSwwLjUpXCI7XG4gICAgY3R4LmZpbGxSZWN0KHRoaXMuX2Fic3goZnQueCwgZnQudyksIHRoaXMuX2Fic3koZnQueSksIGZ0LncsIGZ0LmgpO1xuICAgIGN0eC5maWxsKCk7XG5cbiAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDAsMjU1LDI1NSwwLjUpXCI7XG4gICAgY3R4LmZpbGxSZWN0KHRoaXMuX2Fic3goZmgueCwgZmgudyksIHRoaXMuX2Fic3koZmgueSksIGZoLncsIGZoLmgpO1xuICAgIGN0eC5maWxsKCk7XG5cbiAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDI1NSwyNTUsMCwwLjUpXCI7XG4gICAgY3R4LmZpbGxSZWN0KHRoaXMuX2Fic3goZmhoLngsIGZoaC53KSwgdGhpcy5fYWJzeShmaGgueSksIGZoaC53LCBmaGguaCk7XG4gICAgY3R4LmZpbGwoKTtcbiAgICBjdHgucmVzdG9yZSgpXG4gIH0sXG5cbiAgbGFuZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLmxhbmRlZCA9IHRydWVcbiAgICB0aGlzLnAuanVtcGluZyA9IGZhbHNlXG4gIH0sXG5cbiAgc2hlZXQ6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBpZihuYW1lKSB7XG4gICAgICByZXR1cm4gdGhpcy5fc3VwZXIobmFtZSArICctJyArIHRoaXMucC5pKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5fc3VwZXIoKVxuICAgIH1cbiAgfSxcblxuICBwYXVzZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLnBhdXNlZCA9IHRydWVcbiAgfSxcblxuICB1bnBhdXNlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAucGF1c2VkID0gZmFsc2VcbiAgICB0aGlzLnN0YW5kKClcbiAgfSxcblxuICBmdWpvZ2VyaUZvcndhcmQ6IGp1bXAoYXR0YWNrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2hlZXQoXCJmdWpvZ2VyaVwiKVxuICAgIHRoaXMucGxheSgnZnVqb2dlcmknLCAxKVxuICAgIHRoaXMub24oJ3N0ZXAnLCB0aGlzLCAnZnVqb2dlcmlGb3J3YXJkU3RlcCcpXG4gICAgdGhpcy5vbignc3RlcCcsIHRoaXMsICdmdWpvZ2VyaVN0ZXAnKVxuICB9KSksXG5cbiAgZnVqb2dlcmk6IGp1bXAoYXR0YWNrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2hlZXQoXCJmdWpvZ2VyaVwiKVxuICAgIHRoaXMucGxheSgnZnVqb2dlcmknLCAxKVxuICAgIHRoaXMub24oJ3N0ZXAnLCB0aGlzLCAnZnVqb2dlcmlTdGVwJylcbiAgfSkpLFxuXG4gIGZ1am9nZXJpRm9yd2FyZFN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMucC5hbmltYXRpb25GcmFtZSA+IDQgJiYgdGhpcy5wLmFuaW1hdGlvbkZyYW1lIDwgNykge1xuICAgICAgdGhpcy5wLnZ4ID0gdGhpcy5wLmRpciAqIHRoaXMuc3BlZWRcbiAgICAgIHRoaXMub2ZmKCdzdGVwJywgdGhpcywgJ2Z1am9nZXJpRm9yd2FyZFN0ZXAnKVxuICAgIH1cbiAgfSxcblxuICBmdWpvZ2VyaVN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMucC5hbmltYXRpb25GcmFtZSA+IDQpIHtcbiAgICAgIHRoaXMucC52eSA9IC10aGlzLmp1bXBTcGVlZFxuICAgICAgdGhpcy5wLmxhbmRlZCA9IGZhbHNlXG4gICAgICB0aGlzLnAuanVtcGluZyA9IHRydWVcbiAgICAgIHRoaXMub2ZmKCdzdGVwJywgdGhpcywgJ2Z1am9nZXJpU3RlcCcpXG4gICAgfVxuICB9LFxuXG4gIGhhbmdldHN1YXRlOiBhdHRhY2soZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zaGVldChcImhhbmdldHN1YXRlXCIpXG4gICAgdGhpcy5wbGF5KCdoYW5nZXRzdWF0ZScsIDEpXG4gIH0pLFxuXG4gIHNlbnRhaW5vdHN1a2k6IGF0dGFjayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNoZWV0KFwic2VudGFpbm90c3VraVwiKVxuICAgIHRoaXMucGxheSgnc2VudGFpbm90c3VraScsIDEpXG4gIH0pLFxuXG4gIHNlbnRhaW5vdHN1a2lFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC54ICs9IHRoaXMucC5kaXIgKiAxNSoyXG4gIH0sXG5cbiAgbWFuamlnZXJpOiBhdHRhY2soZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zaGVldChcIm1hbmppZ2VyaVwiKVxuICAgIHRoaXMucGxheSgnbWFuamlnZXJpJywgMSlcbiAgfSksXG5cbiAgc3VpaGVpZ2VyaTogYXR0YWNrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2hlZXQoXCJzdWloZWlnZXJpXCIpXG4gICAgdGhpcy5wbGF5KCdzdWloZWlnZXJpJywgMSlcbiAgfSksXG5cbiAgc2Vuc29nZXJpOiBhdHRhY2soZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zaGVldChcInNlbnNvZ2VyaVwiKVxuICAgIHRoaXMucGxheSgnc2Vuc29nZXJpJywgMSlcbiAgfSksXG5cbiAgdXNoaXJvOiB3YWxrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2hlZXQoXCJ1c2hpcm9cIilcbiAgICB0aGlzLnBsYXkoJ3VzaGlybycsIDEpXG4gIH0pLFxuXG4gIHVzaGlyb0VuZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLnggKz0gdGhpcy5wLmRpciAqIDQqMlxuICAgIHRoaXMucC5kaXJlY3Rpb24gPSB0aGlzLnAuZGlyZWN0aW9uID09PSAnbGVmdCcgPyAncmlnaHQnIDogJ2xlZnQnXG4gICAgdGhpcy5wcmVzdGVwKClcbiAgfSxcblxuICBuaW5vYXNoaTogd2FsayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAudnggPSB0aGlzLnAuZGlyICogdGhpcy5zcGVlZC8yO1xuICAgIHRoaXMuc2hlZXQoXCJuaW5vYXNoaVwiKVxuICAgIHRoaXMucGxheSgnbmlub2FzaGknLCAxKVxuICB9KSxcblxuICB0YWlzb2t1OiB3YWxrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC52eCA9IC10aGlzLnAuZGlyICogdGhpcy5zcGVlZDtcbiAgICB0aGlzLnNoZWV0KFwidHN1aXNva3VcIilcbiAgICB0aGlzLnBsYXkoJ3RhaXNva3UnLCAxKVxuICB9KSxcbiAgXG4gIHRzdWlzb2t1OiB3YWxrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC52eCA9IHRoaXMucC5kaXIgKiB0aGlzLnNwZWVkO1xuICAgIHRoaXMuc2hlZXQoXCJ0c3Vpc29rdVwiKVxuICAgIHRoaXMucGxheSgndHN1aXNva3UnLCAxKVxuICB9KSxcblxuICBrb3Nva3U6IHdhbGsoZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLnZ4ID0gdGhpcy5wLmRpciAqIHRoaXMuc3BlZWQvMjtcbiAgICB0aGlzLnNoZWV0KFwia29zb2t1XCIpXG4gICAgdGhpcy5wbGF5KCdrb3Nva3UnLCAxKVxuICB9KSxcblxuICBnZW5zb2t1OiB3YWxrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC52eCA9IC10aGlzLnAuZGlyICogdGhpcy5zcGVlZCoyLzM7XG4gICAgdGhpcy5zaGVldChcImtvc29rdVwiKVxuICAgIHRoaXMucGxheSgna29zb2t1JywgMSlcbiAgfSksXG5cbiAgaGl0U3RlcDogZnVuY3Rpb24oKSB7XG4gICAgaWYoIWNvbGxpc2lvbnNbdGhpcy5wLmFuaW1hdGlvbl0pIHJldHVybjtcbiAgICBpZighY29sbGlzaW9uc1t0aGlzLnAuYW5pbWF0aW9uXS5oaXRbdGhpcy5wLmFuaW1hdGlvbkZyYW1lXS53KSByZXR1cm47XG4gICAgdmFyIGhpdCA9IHRoaXMuaGl0VGVzdChjb2xsaXNpb25zW3RoaXMucC5hbmltYXRpb25dLmhpdFt0aGlzLnAuYW5pbWF0aW9uRnJhbWVdKVxuICAgIGlmKGhpdCkge1xuICAgICAgYXVkaW8ucGxheSgnYXNzZXRzL2hpdC0nICsgXy5zYW1wbGUoWzEsMiwzLDRdKSArICcubXAzJylcbiAgICAgIHZhciB2YWx1ZSA9IHRoaXMucC50YXJnZXQuaGl0KHRoaXMucC5kaXIgKiB0aGlzLmhpdEZvcmNlW3RoaXMucC5hbmltYXRpb25dLCBoaXQpXG5cbiAgICAgIHZhciBwcmV2TW92ZW1lbnQgPSB0aGlzLnAubW92ZW1lbnRzW3RoaXMucC5tb3ZlbWVudHMubGVuZ3RoLTFdXG4gICAgICBpZihwcmV2TW92ZW1lbnQgJiYgcHJldk1vdmVtZW50LmluZGV4T2YoJ3Nva3UnKSA+IC0xKSB7XG4gICAgICAgIHZhbHVlICs9IDFcbiAgICAgIH1cblxuICAgICAgdmFyIHNjb3JlID0gUS5zdGF0ZS5nZXQoXCJzY29yZS1cIiArIHRoaXMucC5pKSB8fCAwXG4gICAgICBRLnN0YXRlLmluYyhcInRvdGFsLXNjb3JlLVwiICsgdGhpcy5wLmksIHZhbHVlKjEwMClcbiAgICAgIFEuc3RhdGUuc2V0KFwic2NvcmUtXCIgKyB0aGlzLnAuaSwgTWF0aC5taW4oKHNjb3JlICsgdmFsdWUpLCA0KSk7XG4gICAgfSBlbHNlIGlmKCF0aGlzLnAubWlzc2VkKSB7XG4gICAgICB0aGlzLnAubWlzc2VkID0gdHJ1ZVxuICAgICAgYXVkaW8ucGxheSgnYXNzZXRzL21pc3MtJyArIF8uc2FtcGxlKFsxLDEsMSwxLDEsMSwyXSkgKyAnLm1wMycpXG4gICAgfVxuICB9LFxuXG4gIGhpdFRlc3Q6IGZ1bmN0aW9uKGNvbGwpIHtcbiAgICBpZighdGhpcy5wLnRhcmdldCkgcmV0dXJuIGZhbHNlXG4gICAgaWYodGhpcy5wLnRhcmdldC5wLmhpdCkgcmV0dXJuIGZhbHNlXG4gICAgdmFyIHQgPSB0aGlzLnAudGFyZ2V0LFxuICAgICAgICB0cCA9IHRoaXMucC50YXJnZXQucCxcbiAgICAgICAgdHQgPSBjb2xsaXNpb25zW3RwLmFuaW1hdGlvbl0udG9yc29bdHAuYW5pbWF0aW9uRnJhbWVdLFxuICAgICAgICB0aCA9IGNvbGxpc2lvbnNbdHAuYW5pbWF0aW9uXS5oZWFkW3RwLmFuaW1hdGlvbkZyYW1lXSxcbiAgICAgICAgY3IgPSByZWN0KHRoaXMuX2Fic3goY29sbC54LCBjb2xsLncpLCB0aGlzLl9hYnN5KGNvbGwueSksIGNvbGwudywgY29sbC5oKVxuXG4gICAgaWYoaW50ZXJzZWN0cyhyZWN0KHQuX2Fic3godGgueCwgdGgudyksIHQuX2Fic3kodGgueSksIHRoLncsIHR0LmgpLCBjcikpIHtcbiAgICAgIHJldHVybiAnaGVhZCdcbiAgICB9XG4gICAgXG4gICAgaWYoaW50ZXJzZWN0cyhyZWN0KHQuX2Fic3godHQueCwgdHQudyksIHQuX2Fic3kodHQueSksIHR0LncsIHR0LmgpLCBjcikpIHtcbiAgICAgIHJldHVybiAndG9yc28nXG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlXG4gIH0sXG5cbiAgaGl0OiBmdW5jdGlvbihmb3JjZSwgaGl0KSB7XG4gICAgdGhpcy5zdGFuZCgpXG4gICAgdGhpcy5wLmhpdCA9IHRydWUgXG4gICAgaWYoaGl0ID09PSAnaGVhZCcgJiYgTWF0aC5hYnMoZm9yY2UpID4gMzUgJiYgTWF0aC5yYW5kb20oKSA+IC41KSB7XG4gICAgICBhdWRpby5wbGF5KCdhc3NldHMvaGVhZC1vZmYtJyArIF8uc2FtcGxlKFsxLDIsM10pICsgJy5tcDMnKVxuICAgICAgdGhpcy5zaGVldChcImhlYWRvZmYtaGl0XCIpXG4gICAgICB0aGlzLnBsYXkoJ2hlYWRvZmZoaXQnLCAxKVxuICAgICAgdGhpcy5zdGFnZS5pbnNlcnQobmV3IFEuSGVhZCh0aGlzLCBmb3JjZSkpXG4gICAgICByZXR1cm4gNFxuICAgIH0gZWxzZSB7XG4gICAgICBhdWRpby5wbGF5KCdhc3NldHMvaHVydC0nICsgXy5zYW1wbGUoWzEsMiwzXSkgKyAnLm1wMycpXG4gICAgICB0aGlzLnAudnggKz0gZm9yY2VcbiAgICAgIHRoaXMuc2hlZXQoXCJ0b3Jzby1oaXRcIilcbiAgICAgIHRoaXMucGxheSgndG9yc29oaXQnLCAxKVxuICAgICAgcmV0dXJuIDFcbiAgICB9XG4gIH0sXG5cbiAgZmluaXNoS2lja3M6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMub2ZmKCdzdGVwJywgdGhpcywgJ2hpdFN0ZXAnKVxuICAgIHRoaXMub2ZmKCdzdGVwJywgdGhpcywgJ2Z1am9nZXJpU3RlcCcpXG4gICAgdGhpcy5vZmYoJ3N0ZXAnLCB0aGlzLCAnZnVqb2dlcmlGb3J3YXJkU3RlcCcpXG4gICAgdGhpcy5vZmYoJ3N0ZXAnLCB0aGlzLCAnc2VudGFpbm90c3VraVN0ZXAnKVxuICAgIHRoaXMub2ZmKCdwcmVzdGVwJywgdGhpcywgJ2ZpbmlzaEtpY2tzJylcbiAgfSxcblxuICBzdGFuZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLmZyYW1lID0gMFxuICAgIHRoaXMucC52eCA9IDBcbiAgICB0aGlzLnBsYXkoJ3N0YW5kJywgMSwgdHJ1ZSlcbiAgICB0aGlzLnNoZWV0KFwidHN1aXNva3VcIilcbiAgICB0aGlzLnAuanVtcGluZyA9IGZhbHNlO1xuICAgIHRoaXMucC5hdHRhY2tpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnAud2Fsa2luZyA9IGZhbHNlO1xuICAgIHRoaXMucC5oaXQgPSBmYWxzZTtcbiAgICB0aGlzLnAudGFyZ2V0ID0gbnVsbDtcbiAgICB0aGlzLmZpbmlzaEtpY2tzKClcbiAgfSxcblxuICBwcmVzdGVwOiBmdW5jdGlvbih0KSB7XG4gICAgaWYodGhpcy5wLmRpcmVjdGlvbiA9PT0gJ2xlZnQnKSB7XG4gICAgICB0aGlzLnNldCh7ZmxpcDogJ3gnfSlcbiAgICAgIHRoaXMucC5kaXIgPSAtMVxuICAgICAgdGhpcy5wLm9wcG9zaXRlRGlyZWN0aW9uID0gJ3JpZ2h0J1xuICAgICAgdGhpcy5wLmN4ID0gMTIqMlxuICAgIH1cbiAgICBpZih0aGlzLnAuZGlyZWN0aW9uID09PSAncmlnaHQnKSB7XG4gICAgICB0aGlzLnNldCh7ZmxpcDogJyd9KVxuICAgICAgdGhpcy5wLmRpciA9IDFcbiAgICAgIHRoaXMucC5vcHBvc2l0ZURpcmVjdGlvbiA9ICdsZWZ0J1xuICAgICAgdGhpcy5wLmN4ID0gMTAqMlxuICAgIH1cbiAgfVxuXG59KTtcbiIsInZhciBRID0gcmVxdWlyZSgnLi9RJylcblxuUS5HYW1lT2JqZWN0LmV4dGVuZChcIkh1ZFwiLHtcblxuICBpbml0OiBfLm9uY2UoZnVuY3Rpb24oKSB7XG5cbiAgICB0aGlzLmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLmVsLmNsYXNzTmFtZSA9ICdodWQnXG4gICAgdGhpcy5lbC5pbm5lckhUTUwgPSBcbiAgICAgICc8ZGl2IGNsYXNzPVwiaHVkLWFcIj48c3BhbiBjbGFzcz1cInNjb3JlIHNjb3JlLWEgc2NvcmUtMFwiPjwvc3Bhbj48c3BhbiBjbGFzcz1cInNjb3JlLXZhbHVlXCI+PC9zcGFuPjwvZGl2PicgK1xuICAgICAgJzxkaXYgY2xhc3M9XCJodWQtYlwiPjxzcGFuIGNsYXNzPVwic2NvcmUgc2NvcmUtYiBzY29yZS0wXCI+PC9zcGFuPjxzcGFuIGNsYXNzPVwic2NvcmUtdmFsdWVcIj48L3NwYW4+PC9kaXY+JyArXG4gICAgICAnPGRpdiBjbGFzcz1cImh1ZC1jXCI+PHNwYW4gY2xhc3M9XCJzY29yZSBzY29yZS1jIHNjb3JlLTBcIj48L3NwYW4+PHNwYW4gY2xhc3M9XCJzY29yZS12YWx1ZVwiPjwvc3Bhbj48L2Rpdj4nXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmVsKVxuXG4gICAgdGhpcy5zY29yZUEgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2NvcmUtYScpXG4gICAgdGhpcy5zY29yZUIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2NvcmUtYicpXG4gICAgdGhpcy5zY29yZUMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc2NvcmUtYycpXG5cbiAgICB0aGlzLnJlc2V0KClcbiAgfSksXG5cbiAgcmVmcmVzaDogZnVuY3Rpb24oKSB7XG4gICAgWydhJywgJ2InLCAnYyddLmZvckVhY2goXy5iaW5kKGZ1bmN0aW9uKGkpIHtcbiAgICAgIHZhciBzY29yZUVsID0gdGhpc1snc2NvcmUnICsgaS50b1VwcGVyQ2FzZSgpXSxcbiAgICAgICAgICBzY29yZVZhbHVlRWwgPSBzY29yZUVsLnBhcmVudE5vZGUucXVlcnlTZWxlY3RvcignLnNjb3JlLXZhbHVlJyksXG4gICAgICAgICAgc2NvcmUgPSBRLnN0YXRlLmdldCgnc2NvcmUtJyArIGkpIHx8IDBcbiAgICAgIHNjb3JlRWwuY2xhc3NOYW1lID0gc2NvcmVFbC5jbGFzc05hbWUucmVwbGFjZSgvc2NvcmUtXFxkL2csICcnKVxuICAgICAgc2NvcmVFbC5jbGFzc0xpc3QuYWRkKCdzY29yZS0nICsgc2NvcmUpXG4gICAgICBzY29yZVZhbHVlRWwuaW5uZXJIVE1MID0gUS5zdGF0ZS5nZXQoJ3RvdGFsLXNjb3JlLScgKyBpKVxuICAgIH0sIHRoaXMpKVxuICB9LFxuXG4gIHJlc2V0OiBmdW5jdGlvbigpIHtcbiAgICBRLnN0YXRlLnNldCh7IFxuICAgICAgJ3Njb3JlLWEnOiAwLCAnc2NvcmUtYic6IDAsICdzY29yZS1jJzogMFxuICAgIH0pO1xuICAgIFEuc3RhdGUub24oXCJjaGFuZ2VcIiwgdGhpcywgJ3JlZnJlc2gnKVxuICAgIHRoaXMucmVmcmVzaCgpXG4gIH1cbn0pXG4iLCJ2YXIgUSA9IHJlcXVpcmUoJy4vUScpXG5cblEuYW5pbWF0aW9ucygnanVkZ2UnLCB7XG4gIHN0YW5kOiB7IGZyYW1lczogWzAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMTNdLCBsb29wOiB0cnVlLCByYXRlOiAxLzEwIH0sXG4gIHdhbGs6IHsgZnJhbWVzOiBfLnJhbmdlKDExKSwgbG9vcDogdHJ1ZSwgcmF0ZTogMS8yMCB9LFxuICB0YWxrOiB7IGZyYW1lczogWzEwLDExLDEyLDExXSwgbG9vcDogdHJ1ZSwgcmF0ZTogMS8xMCAgfVxufSlcblxuUS5Nb3ZpbmdTcHJpdGUuZXh0ZW5kKFwiSnVkZ2VcIiwge1xuICBcbiAgaW5pdDogZnVuY3Rpb24ocCkge1xuICAgIHRoaXMuX3N1cGVyKHAsIHsgXG4gICAgICBzcHJpdGU6IFwianVkZ2VcIixcbiAgICAgIHNoZWV0OiBcImp1ZGdlXCIsXG4gICAgICBzZW5zb3I6IHRydWUsXG4gICAgICBjeDogMTQsXG4gICAgICBzY2FsZTogLjhcbiAgICB9KTtcbiAgICB0aGlzLmFkZCgnMmQsIGFuaW1hdGlvbicpO1xuICAgIHRoaXMuc3RhbmQoKVxuXG4gICAgdGhpcy5vbignc2F5TmV4dCcsIHRoaXMsICdzYXlOZXh0JylcbiAgICB0aGlzLm9uKCdkZXN0cm95ZWQnLCB0aGlzLCAnZGVzdCcpXG4gICAgXG4gICAgdGhpcy50ZXh0RWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICAgIHRoaXMudGV4dEVsLmNsYXNzTmFtZSA9ICdqdWRnZW1lbnQnXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLnRleHRFbClcblxuICAgIFEuc3RhdGUub24oXCJjaGFuZ2VcIiwgdGhpcywgJ2p1ZGdlJylcbiAgfSxcblxuICBlbnRlcjogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLnZ4ID0gMzAqMlxuICAgIHRoaXMucC5mbGlwID0gXCJcIlxuICAgIHRoaXMucGxheSgnd2FsaycsIDEpXG4gICAgdGhpcy5vbignc3RlcCcsIHRoaXMsICdlbnRlckVuZCcpXG4gIH0sXG5cbiAgZW50ZXJFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMucC54ID4gMTUwKSB7XG4gICAgICB0aGlzLnAudnggPSAwXG4gICAgICB0aGlzLm9mZignc3RlcCcsIHRoaXMsICdlbnRlckVuZCcpXG4gICAgICB0aGlzLnRyaWdnZXIoJ2VudGVyRW5kJylcbiAgICB9XG4gIH0sXG5cbiAgdXNoaXJvOiBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLnAuZmxpcCkge1xuICAgICAgdGhpcy5wLmZsaXAgPSBcIlwiXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucC5mbGlwID0gXCJ4XCJcbiAgICB9XG4gIH0sXG5cbiAgZXhpdDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLnZ4ID0gLTMwKjJcbiAgICB0aGlzLnAuZmxpcCA9IFwieFwiXG4gICAgdGhpcy5wbGF5KCd3YWxrJywgMSlcbiAgICB0aGlzLm9uKCdzdGVwJywgdGhpcywgJ2V4aXRFbmQnKVxuICB9LFxuXG4gIGV4aXRFbmQ6IGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMucC54IDwgMzgpIHtcbiAgICAgIHRoaXMucC52eCA9IDBcbiAgICAgIHRoaXMub2ZmKCdzdGVwJywgdGhpcywgJ2V4aXRFbmQnKVxuICAgICAgdGhpcy50cmlnZ2VyKCdleGl0RW5kJylcbiAgICAgIHRoaXMuc3RhbmQoKVxuICAgIH1cbiAgfSxcblxuICBzdGFuZDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLmZsaXAgPSBcIlwiXG4gICAgdGhpcy5wLmN4ID0gMTQqMlxuICAgIHRoaXMucGxheSgnc3RhbmQnLCAxKVxuICAgIHRoaXMub2ZmKCdlbnRlckVuZCcsIHRoaXMsICd0YWxrJylcbiAgICB0aGlzLm9mZigndGFsa0VuZCcsIHRoaXMsICdleGl0JylcbiAgICB0aGlzLm9mZignZXhpdEVuZCcsIHRoaXMsICdzdGFuZCcpXG4gICAgdGhpcy50cmlnZ2VyKCdzdGFuZCcpXG4gIH0sXG5cbiAgc2F5TmV4dDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNob2ljZXMgPSBbXCJcIl0sXG4gICAgICAgIHRleHRzID0ge1xuICAgICAgICAgIHdpbm5lcjogW1tcIlRoZSB3aW5uZXIgaXMge2NvbG9yfS5cIiwgXCJ7Y29sb3J9IHdpbnMgdGhlIHJvdW5kLlwiXV0sXG4gICAgICAgICAgc2Vjb25kOiBbW1wie2NvbG9yfSBpcyBzZWNvbmQuXCIsIFwie2NvbG9yfSBjb21lcyBpbiBzZWNvbmQuXCJdXSxcbiAgICAgICAgICBsb3NlcjogW1xuICAgICAgICAgICAgWyd7Y29sb3J9LCB5b3Ugci1yYXRlZC13b3JkLWktc2hvdWxkXFwndCBzYXkuJywgJ3tjb2xvcn0uLi4gcmVhbGx5PycsICdqdXN0Li4uIGp1c3QgZG9uXFwndCwge2NvbG9yfS4nXSxcbiAgICAgICAgICAgIFsne2NvbG9yfSwgeW91IGNhbiBzdG9wIG5vdy4nLCAne2NvbG9yfSwgeW91IGNhbiBkbyBiZXR0ZXIuJywgJ0NcXCdtb24ge2NvbG9yfSddLFxuICAgICAgICAgICAgWyd7Y29sb3J9LCBhbG1vc3QgdGhlcmUuJywgJ21heWJlIG5leHQgdGltZSB0cnkgdG8gZG8gYmV0dGVyIHtjb2xvcn0uJ10sXG4gICAgICAgICAgICBbJ1RvdWdoIGx1Y2sge2NvbG9yfS4nXVxuICAgICAgICAgIF1cbiAgICAgICAgfVxuXG4gICAgaWYgKHRoaXMucC5zYWlkID09PSAwKSBjaG9pY2VzID0gdGV4dHMud2lubmVyO1xuICAgIGVsc2Uge1xuICAgICAgaWYgKHRoaXMucC5zYWlkID09IHRoaXMuc3RhZ2UubGlzdHMucGxheWVycy5sZW5ndGgtMSkgY2hvaWNlcyA9IHRleHRzLmxvc2VyO1xuICAgICAgZWxzZSBjaG9pY2VzID0gdGV4dHMuc2Vjb25kO1xuICAgIH1cblxuICAgIHZhciBzY29yZSA9IHRoaXMucC5yZXN1bHRbdGhpcy5wLnNhaWRdLnNjb3JlLFxuICAgICAgICBjb2xvciA9IHRoaXMucC5yZXN1bHRbdGhpcy5wLnNhaWRdLmNvbG9yLFxuICAgICAgICBzY29yZVRleHRzID0gY2hvaWNlc1tzY29yZSAlIGNob2ljZXMubGVuZ3RoXSxcbiAgICAgICAgdCA9IF8uc2FtcGxlKHNjb3JlVGV4dHMpXG4gICAgdGhpcy50ZXh0RWwuaW5uZXJIVE1MID0gdC5yZXBsYWNlKCd7Y29sb3J9JywgY29sb3IpXG5cbiAgICB0aGlzLnAuc2FpZCArPSAxXG4gICAgaWYodGhpcy5wLnNhaWQgPj0gdGhpcy5zdGFnZS5saXN0cy5wbGF5ZXJzLmxlbmd0aCkge1xuICAgICAgdGhpcy5wLmQgPSBzZXRUaW1lb3V0KF8uYmluZCh0aGlzLnRhbGtFbmQsIHRoaXMpLCAyMDAwKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnAuZCA9IHNldFRpbWVvdXQoXy5iaW5kKHRoaXMudHJpZ2dlciwgdGhpcywgJ3NheU5leHQnKSwgMjAwMClcbiAgICB9XG4gIH0sXG5cbiAgdGFsazogZnVuY3Rpb24oKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMucC5kKVxuICAgIHRoaXMucGxheSgndGFsaycsIDEpXG4gICAgdGhpcy5wLnNhaWQgPSAwXG4gICAgdGhpcy5zYXlOZXh0KClcbiAgfSxcblxuICB0YWxrRW5kOiBmdW5jdGlvbigpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5wLmQpXG4gICAgdGhpcy5wLnNhaWQgPSAwXG4gICAgdGhpcy50ZXh0RWwuaW5uZXJIVE1MID0gXCJcIlxuICAgIHRoaXMuZXhpdCgpXG4gICAgdGhpcy50cmlnZ2VyKCd0YWxrRW5kJylcbiAgfSxcblxuICBqdWRnZTogZnVuY3Rpb24oKSB7XG4gICAgLy8gaWYodGhpcy5wLmFuaW1hdGlvbiAhPSAnc3RhbmQnKSByZXR1cm47XG4gICAgdGhpcy5wLnJlc3VsdCA9IF8uc29ydEJ5KHRoaXMuc3RhZ2UubGlzdHMucGxheWVycy5tYXAoZnVuY3Rpb24ocCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaTogcC5wLmksIFxuICAgICAgICBzY29yZTogUS5zdGF0ZS5nZXQoJ3Njb3JlLScgKyBwLnAuaSksIFxuICAgICAgICBjb2xvcjoge2E6ICdvcmFuZ2UnLCBiOiAnYmx1ZScsIGM6ICdncmVlbid9W3AucC5pXVxuICAgICAgfVxuICAgIH0pLCAnc2NvcmUnKS5yZXZlcnNlKClcbiAgICBpZih0aGlzLnAucmVzdWx0WzBdLnNjb3JlID09PSA0KSB7XG4gICAgICB0aGlzLmVudGVyKClcbiAgICAgIHRoaXMub24oJ2VudGVyRW5kJywgdGhpcywgJ3RhbGsnKVxuICAgICAgdGhpcy5vbigndGFsa0VuZCcsIHRoaXMsICdleGl0JylcbiAgICAgIHRoaXMub24oJ2V4aXRFbmQnLCB0aGlzLCAnc3RhbmQnKVxuICAgIH1cbiAgfSxcblxuICBkZXN0OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnRleHRFbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMudGV4dEVsKVxuICAgIHRoaXMub2ZmKCdlbnRlckVuZCcsIHRoaXMsICd0YWxrJylcbiAgICB0aGlzLm9mZigndGFsa0VuZCcsIHRoaXMsICdleGl0JylcbiAgICB0aGlzLm9mZignZXhpdEVuZCcsIHRoaXMsICdzdGFuZCcpXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMucC5kKVxuICB9XG5cbn0pXG4iLCJ2YXIgUSA9IHJlcXVpcmUoJy4vUScpLFxuICAgIEdlcmlNb24gPSByZXF1aXJlKCcuL0dlcmlNb24nKVxuXG5RLkdlcmlNb24uZXh0ZW5kKFwiUGxheWVyXCIse1xuICBpbml0OiBmdW5jdGlvbihwKSB7XG4gICAgdGhpcy5fc3VwZXIocCwge30pO1xuXG4gICAgdGhpcy5wLmRpcmVjdGlvbiA9ICdyaWdodCdcbiAgICBcbiAgICAvLyBRLmlucHV0Lm9uKFwiZmlyZVwiLCB0aGlzLCAnZmlyZScpO1xuICAgIHRoaXMub24oXCJwcmVzdGVwXCIsIHRoaXMsICdhdHRhY2snKTtcbiAgICB0aGlzLm9uKFwicHJlc3RlcFwiLCB0aGlzLCAndW5zb2t1Jyk7XG4gIH0sXG5cbiAgYXR0YWNrOiBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLnAucGF1c2VkKSByZXR1cm47XG4gICAgXG4gICAgaWYoIVEuaW5wdXRzLmZpcmUpIHJldHVyblxuXG4gICAgdmFyIHRhcmdldCwgdERpc3QgPSBJbmZpbml0eSwgZGlzdDtcbiAgICBmb3IodmFyIGk9MDsgaTx0aGlzLnN0YWdlLmxpc3RzLnBsYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmKHRoaXMuc3RhZ2UubGlzdHMucGxheWVyc1tpXSAhPSB0aGlzKSB7XG4gICAgICAgIGRpc3QgPSBNYXRoLmFicyh0aGlzLnAueCAtIHRoaXMuc3RhZ2UubGlzdHMucGxheWVyc1tpXS5wLngpXG4gICAgICAgIGlmKGRpc3QgPCB0RGlzdCkge1xuICAgICAgICAgIHRhcmdldCA9IHRoaXMuc3RhZ2UubGlzdHMucGxheWVyc1tpXVxuICAgICAgICAgIHREaXN0ID0gZGlzdFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKFEuaW5wdXRzLnVwICYmIFEuaW5wdXRzW3RoaXMucC5kaXJlY3Rpb25dKSB7XG4gICAgICB0aGlzLmZ1am9nZXJpRm9yd2FyZCh0YXJnZXQpXG4gICAgfVxuXG4gICAgaWYgKFEuaW5wdXRzLnVwKSB7XG4gICAgICB0aGlzLmZ1am9nZXJpKHRhcmdldClcbiAgICB9XG5cbiAgICBpZiAoUS5pbnB1dHMuZG93biAmJiBRLmlucHV0c1t0aGlzLnAub3Bwb3NpdGVEaXJlY3Rpb25dKSB7XG4gICAgICB0aGlzLmhhbmdldHN1YXRlKHRhcmdldClcbiAgICB9XG5cbiAgICBpZiAoUS5pbnB1dHMuZG93biAmJiBRLmlucHV0c1t0aGlzLnAuZGlyZWN0aW9uXSkge1xuICAgICAgdGhpcy5zZW50YWlub3RzdWtpKHRhcmdldClcbiAgICB9XG5cbiAgICBpZiAoUS5pbnB1dHMuZG93bikge1xuICAgICAgdGhpcy5tYW5qaWdlcmkodGFyZ2V0KVxuICAgIH1cblxuICAgIGlmIChRLmlucHV0c1t0aGlzLnAuZGlyZWN0aW9uXSkge1xuICAgICAgdGhpcy5zdWloZWlnZXJpKHRhcmdldClcbiAgICB9XG5cbiAgICBpZiAoUS5pbnB1dHNbdGhpcy5wLm9wcG9zaXRlRGlyZWN0aW9uXSkge1xuICAgICAgdGhpcy5zZW5zb2dlcmkodGFyZ2V0KVxuICAgIH1cblxuICB9LFxuXG4gIHVuc29rdTogZnVuY3Rpb24oKSB7XG4gICAgaWYodGhpcy5wLnBhdXNlZCkgcmV0dXJuO1xuXG4gICAgaWYoUS5pbnB1dHMuZmlyZSkgcmV0dXJuXG5cbiAgICBpZihRLmlucHV0cy5hY3Rpb24pIHtcbiAgICBcbiAgICAgIHRoaXMudXNoaXJvKClcbiAgICBcbiAgICB9IGVsc2Uge1xuXG4gICAgICBpZihRLmlucHV0cy51cCkge1xuICAgICAgICB0aGlzLmtvc29rdSgpXG4gICAgICB9XG5cbiAgICAgIGlmKFEuaW5wdXRzLmRvd24pIHtcbiAgICAgICAgdGhpcy5nZW5zb2t1KCkgXG4gICAgICB9XG5cbiAgICAgIC8vZm9yd2FyZFxuICAgICAgaWYoUS5pbnB1dHNbdGhpcy5wLmRpcmVjdGlvbl0pIHtcbiAgICAgICAgdGhpcy5uaW5vYXNoaSgpIFxuICAgICAgICBpZih0aGlzLnAuYW5pbWF0aW9uID09PSAnbmlub2FzaGknICYmIHRoaXMucC5hbmltYXRpb25GcmFtZSA+IDEpIHtcbiAgICAgICAgICB0aGlzLnN0YW5kKClcbiAgICAgICAgICB0aGlzLnRzdWlzb2t1KClcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy9iYWNrd2FyZFxuICAgICAgaWYoUS5pbnB1dHNbdGhpcy5wLmRpcmVjdGlvbiA9PT0gJ2xlZnQnID8gJ3JpZ2h0JyA6ICdsZWZ0J10pIHtcbiAgICAgICAgdGhpcy50YWlzb2t1KClcbiAgICAgIH1cblxuICAgIH1cblxuICAgIFxuICB9XG5cbn0pO1xuIiwiXG52YXIgUSA9IFF1aW50dXMoeyBpbWFnZVBhdGg6ICcuLycsIGF1ZGlvUGF0aDogJy4vJywgYXVkaW9TdXBwb3J0ZWQ6IFsgJ21wMycgXSB9KVxuICAuaW5jbHVkZShcIkF1ZGlvLCBTcHJpdGVzLCBTY2VuZXMsIElucHV0LCAyRCwgQW5pbVwiKVxuICAuZW5hYmxlU291bmQoKVxuICAuc2V0dXAoeyBtYXhpbWl6ZTogdHJ1ZSB9KVxuICAuY29udHJvbHMoKVxuXG5RLmlucHV0LmRpc2FibGVUb3VjaENvbnRyb2xzKClcblxuUS5FdmVudGVkLnByb3RvdHlwZS5fdHJpZ2dlciA9IFEuRXZlbnRlZC5wcm90b3R5cGUudHJpZ2dlclxuUS5FdmVudGVkLnByb3RvdHlwZS50cmlnZ2VyICA9IGZ1bmN0aW9uKGV2ZW50LGRhdGEpIHtcbiAgLy8gRmlyc3QgbWFrZSBzdXJlIHRoZXJlIGFyZSBhbnkgbGlzdGVuZXJzLCB0aGVuIGNoZWNrIGZvciBhbnkgbGlzdGVuZXJzXG4gIC8vIG9uIHRoaXMgc3BlY2lmaWMgZXZlbnQsIGlmIG5vdCwgZWFybHkgb3V0LlxuICBpZih0aGlzLmxpc3RlbmVycyAmJiB0aGlzLmxpc3RlbmVyc1tldmVudF0pIHtcbiAgICAvLyBDYWxsIGVhY2ggbGlzdGVuZXIgaW4gdGhlIGNvbnRleHQgb2YgZWl0aGVyIHRoZSB0YXJnZXQgcGFzc2VkIGludG9cbiAgICAvLyBgb25gIG9yIHRoZSBvYmplY3QgaXRzZWxmLlxuICAgIHZhciBpLCBsID0gbmV3IEFycmF5KHRoaXMubGlzdGVuZXJzW2V2ZW50XS5sZW5ndGgpLCBsZW5cbiAgICBmb3IoaT0wLGxlbiA9IHRoaXMubGlzdGVuZXJzW2V2ZW50XS5sZW5ndGg7aTxsZW47aSsrKSB7XG4gICAgICBsW2ldID0gW1xuICAgICAgICB0aGlzLmxpc3RlbmVyc1tldmVudF1baV1bMF0sIFxuICAgICAgICB0aGlzLmxpc3RlbmVyc1tldmVudF1baV1bMV1cbiAgICAgIF1cbiAgICB9XG4gICAgZm9yKGk9MCxsZW4gPSBsLmxlbmd0aDtpPGxlbjtpKyspIHtcbiAgICAgIHZhciBsaXN0ZW5lciA9IGxbaV07XG4gICAgICBsaXN0ZW5lclsxXS5jYWxsKGxpc3RlbmVyWzBdLGRhdGEpO1xuICAgIH1cbiAgfVxufVxuXG53aW5kb3cuUSA9IFFcblxubW9kdWxlLmV4cG9ydHMgPSBRXG4iLCJ2YXIgUSA9IHJlcXVpcmUoJy4vUScpXG5cblEuR2FtZU9iamVjdC5leHRlbmQoXCJTY29yZUJvYXJkXCIse1xuXG4gIGluaXQ6IF8ub25jZShmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNjb3JlcyA9IFtdXG4gICAgdGhpcy5lbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY29yZWJvYXJkJylcbiAgICB0aGlzLmxvYWQoKVxuICAgIHRoaXMucmVmcmVzaCgpXG5cbiAgICBRLnN0YXRlLm9uKCdjaGFuZ2Uucm91bmQnLCB0aGlzLCAncmVmcmVzaCcpXG4gIH0pLFxuXG4gIGxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgIGlmKCFsb2NhbFN0b3JhZ2UpIHJldHVybjtcbiAgICB0aGlzLnNjb3JlcyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Njb3JlYm9hcmQnKSkgfHwgW11cbiAgfSxcblxuICBzYXZlOiBmdW5jdGlvbigpIHtcbiAgICBpZighbG9jYWxTdG9yYWdlKSByZXR1cm47XG4gICAgdmFyIGQgPSBuZXcgRGF0ZSgpXG4gICAgdGhpcy5zY29yZXMucHVzaCh7XG4gICAgICBzdGFnZTogUS5zdGFnZSgxKS5zY2VuZS5uYW1lLnJlcGxhY2UoJ3BsYXktJywgJycpLFxuICAgICAgdmFsdWU6IFEuc3RhdGUuZ2V0KCd0b3RhbC1zY29yZS1hJyksXG4gICAgICBkYXRlOiBbW2QuZ2V0RGF0ZSgpLCBkLmdldE1vbnRoKCkrMSwgZC5nZXRGdWxsWWVhcigpXS5qb2luKCcuJyksXG4gICAgICAgICAgICAgW2QuZ2V0SG91cnMoKSwgZC5nZXRNaW51dGVzKCldLmpvaW4oJzonKV1cbiAgICAgICAgICAgICAuam9pbignICcpXG4gICAgfSlcbiAgICB0aGlzLnNjb3JlcyA9IF8uc29ydEJ5KHRoaXMuc2NvcmVzLCAndmFsdWUnKS5yZXZlcnNlKCkuc2xpY2UoMCwxMClcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnc2NvcmVib2FyZCcsIEpTT04uc3RyaW5naWZ5KHRoaXMuc2NvcmVzKSlcbiAgfSxcblxuICByZWZyZXNoOiBmdW5jdGlvbigpIHtcbiAgICB3aGlsZSh0aGlzLmVsLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMuZWwuY2hpbGRyZW5bMF0ucmVtb3ZlKClcbiAgICB9XG4gICAgdGhpcy5zY29yZXMuZm9yRWFjaChmdW5jdGlvbihzY29yZSkge1xuICAgICAgdmFyIGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKVxuICAgICAgbGkuaW5uZXJIVE1MID0gXCI8Yj5cIiArIHNjb3JlLnZhbHVlICsgXCI8L2I+IFwiICsgc2NvcmUuc3RhZ2UgKyBcIiBcIiArIHNjb3JlLmRhdGVcbiAgICAgIHRoaXMuZWwuYXBwZW5kQ2hpbGQobGkpXG4gICAgfS5iaW5kKHRoaXMpKVxuICB9LFxuXG4gIHNob3c6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZWwuY2xhc3NMaXN0LmFkZCgnb3BlbicpXG4gIH0sXG4gIGhpZGU6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZWwuY2xhc3NMaXN0LnJlbW92ZSgnb3BlbicpXG4gIH1cbn0pXG4iLCJ2YXIgUSA9IHJlcXVpcmUoJy4vUScpXG5cblxuXG5mdW5jdGlvbiBjb2xsaXNpb25zKG5hbWUsIGFzc2V0LCBzaXplKSB7XG4gIGlmKCFRLmFzc2V0KGFzc2V0KSkgeyB0aHJvdyBcIkludmFsaWQgQXNzZXQ6XCIgKyBhc3NldDsgfVxuICBcbiAgZXhwb3J0cy5jb2xsaXNpb25zW25hbWVdID0geyBoZWFkOiBbXSwgdG9yc286IFtdLCBoaXQ6IFtdIH1cblxuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyksXG4gICAgICBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyksXG4gICAgICBpbWcgPSBRLmFzc2V0KGFzc2V0KSxcbiAgICAgIGltZ0RhdGEsXG4gICAgICBoZWFkID0gMTUwLFxuICAgICAgdG9yc28gPSAyMDAsXG4gICAgICBoaXQgPSAxMDBcbiAgXG4gIGNhbnZhcy53aWR0aCA9IGltZy53aWR0aFxuICBjYW52YXMuaGVpZ2h0ID0gaW1nLmhlaWdodFxuICBjb250ZXh0LmRyYXdJbWFnZShpbWcsIDAsIDApO1xuICBcbiAgZnVuY3Rpb24gZmluZChpbWdEYXRhLCByY29sb3IpIHtcbiAgICB2YXIgYSA9IEFycmF5LnByb3RvdHlwZS5pbmRleE9mLmNhbGwoaW1nRGF0YS5kYXRhLCByY29sb3IpIC8gNCxcbiAgICAgICAgYiA9IEFycmF5LnByb3RvdHlwZS5sYXN0SW5kZXhPZi5jYWxsKGltZ0RhdGEuZGF0YSwgcmNvbG9yKSAvIDQsXG4gICAgICAgIGMgPSB7fVxuICAgIGlmKGEgPCAtMSkgcmV0dXJuIGNcbiAgICBjLnggPSBhICUgc2l6ZS50aWxld1xuICAgIGMueSA9IE1hdGguZmxvb3IoYSAvIHNpemUudGlsZXcpXG4gICAgYy53ID0gYiAlIHNpemUudGlsZXcgLSBjLnhcbiAgICBjLmggPSBNYXRoLmZsb29yKGIgLyBzaXplLnRpbGV3KSAtIGMueVxuICAgIHJldHVybiBjXG4gIH1cblxuICBmb3IodmFyIHggPSAwOyB4IDwgaW1nLndpZHRoOyB4Kz1zaXplLnRpbGV3KSB7XG4gICAgaW1nRGF0YSA9IGNvbnRleHQuZ2V0SW1hZ2VEYXRhKHgsIDAsIHNpemUudGlsZXcsIHNpemUudGlsZWgpO1xuICAgIGV4cG9ydHMuY29sbGlzaW9uc1tuYW1lXS5oZWFkLnB1c2goZmluZChpbWdEYXRhLCBoZWFkKSlcbiAgICBleHBvcnRzLmNvbGxpc2lvbnNbbmFtZV0udG9yc28ucHVzaChmaW5kKGltZ0RhdGEsIHRvcnNvKSlcbiAgICBleHBvcnRzLmNvbGxpc2lvbnNbbmFtZV0uaGl0LnB1c2goZmluZChpbWdEYXRhLCBoaXQpKVxuICB9XG59XG5leHBvcnRzLmNvbGxpc2lvbnMgPSB7fVxuXG5cblxuXG5mdW5jdGlvbiBjb2xvcml6ZShhc3NldCwgY29sb3IpIHtcbiAgaWYoIVEuYXNzZXQoYXNzZXQpKSB7IHRocm93IFwiSW52YWxpZCBBc3NldDpcIiArIGFzc2V0OyB9XG5cbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLFxuICAgICAgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpLFxuICAgICAgaW1nID0gUS5hc3NldChhc3NldCksXG4gICAgICBpbWdEYXRhLFxuICAgICAgY29sRGF0YSxcbiAgICAgIGNvbEltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbWdcIik7XG4gIFxuICBjYW52YXMud2lkdGggPSBpbWcud2lkdGhcbiAgY2FudmFzLmhlaWdodCA9IGltZy5oZWlnaHRcbiAgY29udGV4dC5kcmF3SW1hZ2UoaW1nLCAwLCAwKTtcbiAgaW1nRGF0YSA9IGNvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIGltZy53aWR0aCwgaW1nLmhlaWdodClcbiAgY29sRGF0YSA9IGNvbnRleHQuY3JlYXRlSW1hZ2VEYXRhKGltZy53aWR0aCwgaW1nLmhlaWdodClcblxuICBmdW5jdGlvbiBzZXRDb2xvcihjLCBkLCBpKSB7IGRbaSswXSA9IGNbMF07IGRbaSsxXSA9IGNbMV07IGRbaSsyXSA9IGNbMl07IGRbaSszXSA9IGNbM10gfVxuICBmdW5jdGlvbiBnZXRDb2xvcihkLCBpKSB7IHJldHVybiBbZFtpKzBdLCBkW2krMV0sIGRbaSsyXSwgZFtpKzNdXSB9XG4gIGZ1bmN0aW9uIHByZXZDb2xvcihkLCBpKSB7IHJldHVybiBbZFtpLTRdLCBkW2ktM10sIGRbaS0yXSwgZFtpLTFdXSB9XG4gIGZ1bmN0aW9uIG5leHRDb2xvcihkLCBpKSB7IHJldHVybiBbZFtpKzRdLCBkW2krNV0sIGRbaSs2XSwgZFtpKzddXSB9XG4gIGZ1bmN0aW9uIHRyYW5zcGFyZW50KGMpIHsgcmV0dXJuIGNbMF0gPT09IDAgJiYgY1sxXSA9PT0gMCAmJiBjWzJdID09PSAwICYmIGNbM10gPT09IDAgfVxuICBmdW5jdGlvbiBkYXJrMShjKSB7IHJldHVybiBbY1swXSAtICA1LCBjWzFdIC0gIDUsIGNbMl0gLSAgNSwgY1szXV0gfVxuICBmdW5jdGlvbiBkYXJrMihjKSB7IHJldHVybiBbY1swXSAtIDIwLCBjWzFdIC0gMjAsIGNbMl0gLSAyMCwgY1szXV0gfVxuICBmdW5jdGlvbiBkYXJrMyhjKSB7IHJldHVybiBbY1swXSAtIDgwLCBjWzFdIC0gODAsIGNbMl0gLSA4MCwgY1szXV0gfVxuICBmdW5jdGlvbiBsaWdodGVuKGMpIHsgcmV0dXJuIFtjWzBdICsgMzAsIGNbMV0gKyAzMCwgY1syXSArIDMwLCBjWzNdXSB9XG4gIFxuICBmb3IgKHZhciBpPTAsIGM7IGk8aW1nRGF0YS5kYXRhLmxlbmd0aDsgaSs9NCkge1xuICAgIGMgPSBnZXRDb2xvcihpbWdEYXRhLmRhdGEsIGkpXG4gICAgc2V0Q29sb3IobGlnaHRlbihjKSwgY29sRGF0YS5kYXRhLCBpKVxuICAgIGlmICghdHJhbnNwYXJlbnQoYykpIHtcbiAgICAgIGlmICh0cmFuc3BhcmVudChwcmV2Q29sb3IoaW1nRGF0YS5kYXRhLCBpLTQpKSkge1xuICAgICAgICBzZXRDb2xvcihkYXJrMihjKSwgY29sRGF0YS5kYXRhLCBpKVxuICAgICAgfVxuICAgICAgaWYgKHRyYW5zcGFyZW50KHByZXZDb2xvcihpbWdEYXRhLmRhdGEsIGkpKSkge1xuICAgICAgICBzZXRDb2xvcihkYXJrMyhkYXJrMyhjb2xvcikpLCBjb2xEYXRhLmRhdGEsIGkpXG4gICAgICB9XG4gICAgICAvLyBpZiAodHJhbnNwYXJlbnQoZ2V0Q29sb3IoaW1nRGF0YS5kYXRhLCBpKzQqMikpKSB7XG4gICAgICAvLyAgIHNldENvbG9yKGRhcmsyKGRhcmszKGNvbG9yKSksIGNvbERhdGEuZGF0YSwgaSlcbiAgICAgIC8vIH1cbiAgICAgIGlmICh0cmFuc3BhcmVudChnZXRDb2xvcihpbWdEYXRhLmRhdGEsIGkrNCkpKSB7XG4gICAgICAgIHNldENvbG9yKGNvbG9yLCBjb2xEYXRhLmRhdGEsIGkpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29udGV4dC5wdXRJbWFnZURhdGEoY29sRGF0YSwgMCwgMCk7XG4gIGNvbEltZy5zcmMgPSBjYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpO1xuICByZXR1cm4gY29sSW1nXG59XG5cblxuZXhwb3J0cy5sb2FkID0gZnVuY3Rpb24oY2IpIHtcblxuICB2YXIgcGxheWVyQXNzZXRzID0gW1xuICAgIFwic3VpaGVpZ2VyaVwiLFxuICAgIFwibWFuamlnZXJpXCIsXG4gICAgXCJ0c3Vpc29rdVwiLFxuICAgIFwidXNoaXJvXCIsXG4gICAgXCJrb3Nva3VcIixcbiAgICBcIm5pbm9hc2hpXCIsXG4gICAgXCJmdWpvZ2VyaVwiLFxuICAgIFwic2Vuc29nZXJpXCIsXG4gICAgXCJzZW50YWlub3RzdWtpXCIsXG4gICAgXCJoYW5nZXRzdWF0ZVwiLFxuICAgIFwidG9yc28taGl0XCIsXG4gICAgXCJoZWFkb2ZmLWhpdFwiXVxuXG4gIFEubG9hZChcbiAgICBfLmZsYXR0ZW4oW1xuICAgIFxuICAgICAgW1wiYXNzZXRzL2JnLTEucG5nXCIsXG4gICAgICBcImFzc2V0cy90aWxlcy5wbmdcIixcbiAgICAgIFwiYXNzZXRzL2p1ZGdlLnBuZ1wiXSxcblxuICAgICAgXy5tYXAocGxheWVyQXNzZXRzLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHJldHVybiBcImFzc2V0cy9cIiArIG5hbWUgKyBcIi5wbmdcIlxuICAgICAgfSksXG5cbiAgICAgIF8ubWFwKF8ud2l0aG91dChwbGF5ZXJBc3NldHMsIFwidG9yc28taGl0XCIsIFwiaGVhZG9mZi1oaXRcIiksIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgcmV0dXJuIFwiYXNzZXRzL1wiICsgbmFtZSArIFwiLWNvbGxpc2lvbnMucG5nXCJcbiAgICAgIH0pLFxuXG4gICAgICBbXG4gICAgICBcImFzc2V0cy9iZy1sb29wLm1wM1wiLCBcbiAgICAgIFwiYXNzZXRzL2JvdW5jZS5tcDNcIixcbiAgICAgIFwiYXNzZXRzL2hlYWQtb2ZmLTEubXAzXCIsXG4gICAgICBcImFzc2V0cy9oZWFkLW9mZi0yLm1wM1wiLFxuICAgICAgXCJhc3NldHMvaGVhZC1vZmYtMy5tcDNcIixcbiAgICAgIFwiYXNzZXRzL2hpdC0xLm1wM1wiLFxuICAgICAgXCJhc3NldHMvaGl0LTIubXAzXCIsXG4gICAgICBcImFzc2V0cy9oaXQtMy5tcDNcIixcbiAgICAgIFwiYXNzZXRzL2hpdC00Lm1wM1wiLFxuICAgICAgXCJhc3NldHMvaHVydC0xLm1wM1wiLFxuICAgICAgXCJhc3NldHMvaHVydC0yLm1wM1wiLFxuICAgICAgXCJhc3NldHMvaHVydC0zLm1wM1wiLFxuICAgICAgXCJhc3NldHMvbWlzcy0xLm1wM1wiLFxuICAgICAgXCJhc3NldHMvbWlzcy0yLm1wM1wiXG4gICAgICBdXG5cbiAgICBdKSwgZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgcGxheWVyVGlsZSA9IHsgdGlsZXc6IDQ4KjIsIHRpbGVoOiAzMioyIH1cbiAgICBRLnNoZWV0KFwidGlsZXNcIixcImFzc2V0cy90aWxlcy5wbmdcIiwgeyB0aWxldzogMzIsIHRpbGVoOiA4IH0pO1xuICAgIFEuc2hlZXQoXCJqdWRnZVwiLCBcImFzc2V0cy9qdWRnZS5wbmdcIiwge3RpbGV3OiAzMioyLCB0aWxlaDogMzIqMn0pO1xuXG4gICAgXy5lYWNoKHBsYXllckFzc2V0cywgZnVuY3Rpb24obmFtZSkge1xuICAgICAgUS5hc3NldHNbXCJhc3NldHMvXCIgKyBuYW1lICsgXCItYS5wbmdcIl0gPSBjb2xvcml6ZShcImFzc2V0cy9cIiArIG5hbWUgKyBcIi5wbmdcIiwgWzI0MCwgMTIxLCAwLCAyNTVdKTtcbiAgICAgIFEuYXNzZXRzW1wiYXNzZXRzL1wiICsgbmFtZSArIFwiLWIucG5nXCJdID0gY29sb3JpemUoXCJhc3NldHMvXCIgKyBuYW1lICsgXCIucG5nXCIsIFsxMDIsIDE1MywgMjU1LCAyNTVdKTtcbiAgICAgIFEuYXNzZXRzW1wiYXNzZXRzL1wiICsgbmFtZSArIFwiLWMucG5nXCJdID0gY29sb3JpemUoXCJhc3NldHMvXCIgKyBuYW1lICsgXCIucG5nXCIsIFs2OCwgMjIxLCA4NSwgMjU1XSk7XG4gICAgICBRLnNoZWV0KG5hbWUgKyAnLWEnLCBcImFzc2V0cy9cIiArIG5hbWUgKyBcIi1hLnBuZ1wiLCBwbGF5ZXJUaWxlKTtcbiAgICAgIFEuc2hlZXQobmFtZSArICctYicsIFwiYXNzZXRzL1wiICsgbmFtZSArIFwiLWIucG5nXCIsIHBsYXllclRpbGUpO1xuICAgICAgUS5zaGVldChuYW1lICsgJy1jJywgXCJhc3NldHMvXCIgKyBuYW1lICsgXCItYy5wbmdcIiwgcGxheWVyVGlsZSk7XG4gICAgfSlcblxuICAgIF8uZWFjaChfLndpdGhvdXQocGxheWVyQXNzZXRzLCBcInRvcnNvLWhpdFwiLCBcImhlYWRvZmYtaGl0XCIpLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICBjb2xsaXNpb25zKG5hbWUsIFwiYXNzZXRzL1wiICsgbmFtZSArIFwiLWNvbGxpc2lvbnMucG5nXCIsIHBsYXllclRpbGUpXG4gICAgfSlcblxuICAgIGV4cG9ydHMuY29sbGlzaW9ucy5zdGFuZCA9IHtcbiAgICAgIGhlYWQ6IFtleHBvcnRzLmNvbGxpc2lvbnMudHN1aXNva3UuaGVhZFswXV0sXG4gICAgICB0b3JzbzogW2V4cG9ydHMuY29sbGlzaW9ucy50c3Vpc29rdS50b3Jzb1swXV0sXG4gICAgICBoaXQ6IFtleHBvcnRzLmNvbGxpc2lvbnMudHN1aXNva3UuaGl0WzBdXVxuICAgIH1cbiAgICBleHBvcnRzLmNvbGxpc2lvbnMudGFpc29rdSA9IHtcbiAgICAgIGhlYWQ6IFtdLmNvbmNhdChleHBvcnRzLmNvbGxpc2lvbnMudHN1aXNva3UuaGVhZCkucmV2ZXJzZSgpLFxuICAgICAgdG9yc286IFtdLmNvbmNhdChleHBvcnRzLmNvbGxpc2lvbnMudHN1aXNva3UudG9yc28pLnJldmVyc2UoKSxcbiAgICAgIGhpdDogW10uY29uY2F0KGV4cG9ydHMuY29sbGlzaW9ucy50c3Vpc29rdS5oaXQpLnJldmVyc2UoKVxuICAgIH1cblxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2FkZXInKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXG4gICAgY2IoKVxuXG4gICAgUS5sb2FkKFtcImFzc2V0cy9pdCsubXAzXCJdKVxuICAgICAgXG4gIH0pO1xuXG59XG4iLCJ2YXIgUSA9IHJlcXVpcmUoJy4vUScpXG5cbnZhciBtdXRlID0gZmFsc2UsXG4gICAgbXVzaWMgPSBcIlwiO1xuXG5leHBvcnRzLm11c2ljID0gZnVuY3Rpb24oYXNzZXQpIHtcbiAgaWYobXV0ZSkgcmV0dXJuO1xuICBpZihRLmFzc2V0c1thc3NldF0gJiYgYXNzZXQgIT0gbXVzaWMpIHtcbiAgICB0cnl7IFEuYXVkaW8uc3RvcChtdXNpYykgfSBjYXRjaCAoZSl7fVxuICAgIFEuYXVkaW8ucGxheShhc3NldCwge2xvb3A6IHRydWV9KTtcbiAgICBtdXNpYyA9IGFzc2V0XG4gIH1cbn1cblxuZXhwb3J0cy5wbGF5ID0gZnVuY3Rpb24oYXNzZXQpIHtcbiAgaWYobXV0ZSkgcmV0dXJuO1xuICBRLmF1ZGlvLnBsYXkoYXNzZXQpO1xufVxuXG5leHBvcnRzLnRvZ2dsZU11dGUgPSBmdW5jdGlvbigpIHtcbiAgbXV0ZSA9ICFtdXRlO1xuICBpZihtdXRlKSBRLmF1ZGlvLnN0b3AoKVxufVxuIiwidmFyIFEgPSByZXF1aXJlKCcuL1EnKSxcbiAgICBhc3NldHMgPSByZXF1aXJlKCcuL2Fzc2V0cycpLFxuICAgIGF1ZGlvID0gcmVxdWlyZSgnLi9hdWRpbycpXG5yZXF1aXJlKCcuL1BsYXllcicpXG5yZXF1aXJlKCcuL0F1dG9QbGF5ZXInKVxucmVxdWlyZSgnLi9BbmltUGxheWVyJylcbnJlcXVpcmUoJy4vSHVkJylcbnJlcXVpcmUoJy4vU2NvcmVCb2FyZCcpXG5yZXF1aXJlKCcuL0p1ZGdlJylcblxudmFyIGxldmVsID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgUS5UaWxlTGF5ZXIoe1xuICAgdGlsZXM6IFtcbiAgIG5ldyBBcnJheSgyMCkuam9pbignMCcpLnNwbGl0KCcnKSxcbiAgIG5ldyBBcnJheSgyMCkuam9pbignMCcpLnNwbGl0KCcnKSxcbiAgIG5ldyBBcnJheSgyMCkuam9pbignMCcpLnNwbGl0KCcnKSxcbiAgIG5ldyBBcnJheSgyMCkuam9pbignMCcpLnNwbGl0KCcnKSxcbiAgIG5ldyBBcnJheSgyMCkuam9pbignMCcpLnNwbGl0KCcnKSxcbiAgIG5ldyBBcnJheSgyMCkuam9pbignMCcpLnNwbGl0KCcnKSxcbiAgIG5ldyBBcnJheSgyMCkuam9pbignMCcpLnNwbGl0KCcnKSxcbiAgIG5ldyBBcnJheSgyMCkuam9pbignMCcpLnNwbGl0KCcnKSxcbiAgIG5ldyBBcnJheSgyMCkuam9pbignMCcpLnNwbGl0KCcnKSxcbiAgIG5ldyBBcnJheSgyMCkuam9pbignMCcpLnNwbGl0KCcnKSxcbiAgIG5ldyBBcnJheSgyMCkuam9pbignMCcpLnNwbGl0KCcnKSxcbiAgIG5ldyBBcnJheSgyMCkuam9pbignMCcpLnNwbGl0KCcnKSxcbiAgIG5ldyBBcnJheSgyMCkuam9pbignMCcpLnNwbGl0KCcnKSxcbiAgIG5ldyBBcnJheSgyMCkuam9pbignMScpLnNwbGl0KCcnKVxuICAgXSwgc2hlZXQ6ICd0aWxlcycgXG4gIH0pXG59XG5cbmZ1bmN0aW9uIGdhbWVMb29wKHN0YWdlLCBqdWRnZSkge1xuICBcbiAgZnVuY3Rpb24gcGF1c2VQbGF5ZXJzKCkge1xuICAgIGlmKF8uY29udGFpbnMoW1Euc3RhdGUuZ2V0KCdzY29yZS1hJyksIFEuc3RhdGUuZ2V0KCdzY29yZS1iJyksIFEuc3RhdGUuZ2V0KCdzY29yZS1jJyldLCA0KSkge1xuICAgICAgXy5pbnZva2Uoc3RhZ2UubGlzdHMucGxheWVycywgJ3BhdXNlJylcbiAgICB9XG4gIH1cbiAgXG4gIGZ1bmN0aW9uIGNsZWFudXAoKSB7IFxuICAgIGp1ZGdlICYmIGp1ZGdlLmRlc3Ryb3koKVxuICAgIFEuc3RhdGUub2ZmKCdjaGFuZ2UnLCBwYXVzZVBsYXllcnMpXG4gICAgXy5pbnZva2Uoc3RhZ2UubGlzdHMucGxheWVycywgJ2Rlc3Ryb3knKTtcbiAgICBodWQucmVzZXQoKVxuICB9XG4gIFxuICBmdW5jdGlvbiBlbmRHYW1lKCkge1xuICAgIGlmKFEuc3RhZ2UoMSkuc2NlbmUubmFtZSA9PSAncGxheS0xb24xJyB8fCBRLnN0YWdlKDEpLnNjZW5lLm5hbWUgPT0gJ3BsYXktMW9uMicpIHNjb3JlYm9hcmQuc2F2ZSgpXG4gICAgUS5zdGFnZVNjZW5lKCdhdXRvcGxheScsIDEpXG4gICAgc2NvcmVib2FyZC5zaG93KClcbiAgfVxuXG4gIGZ1bmN0aW9uIG5ld0dhbWUoKSB7XG4gICAgaWYoUS5zdGFnZSgxKS5zY2VuZS5uYW1lID09ICdwbGF5LTFvbjEnIHx8IFEuc3RhZ2UoMSkuc2NlbmUubmFtZSA9PSAncGxheS0xb24yJykgc2NvcmVib2FyZC5oaWRlKClcbiAgICBRLnN0YXRlLnNldCh7ICd0b3RhbC1zY29yZS1hJzogMCwgJ3RvdGFsLXNjb3JlLWInOiAwLCAndG90YWwtc2NvcmUtYyc6IDAsICdyb3VuZCc6IDAgfSk7XG4gICAgYXVkaW8ubXVzaWMoJ2Fzc2V0cy9iZy1sb29wLm1wMycpO1xuICAgIG5ld1JvdW5kKClcbiAgfVxuXG4gIGZ1bmN0aW9uIG5ld1JvdW5kKCkge1xuICAgIGh1ZC5yZXNldCgpXG4gICAgdmFyIHBsYXllcnMgPSBzdGFnZS5saXN0cy5wbGF5ZXJzO1xuICAgIFsxNjQsIDMxMiwgNDEyXS5mb3JFYWNoKGZ1bmN0aW9uKHgsIGkpIHtcbiAgICAgIHBsYXllcnNbaV0gJiYgcGxheWVyc1tpXS5zZXQoe3g6IHgsIHk6IDI1KjE2LCB2eTogMH0pXG4gICAgfSlcbiAgICBRLnN0YXRlLmluYygncm91bmQnLCAxKVxuICAgIGlmKFEuc3RhdGUuZ2V0KCdyb3VuZCcpID4gMSkge1xuICAgICAgYXVkaW8ubXVzaWMoJ2Fzc2V0cy9pdCsubXAzJylcbiAgICB9XG4gICAgXy5pbnZva2Uoc3RhZ2UubGlzdHMucGxheWVycywgJ3VucGF1c2UnKVxuICB9XG5cbiAgZnVuY3Rpb24gcm91bmRFbmQoKSB7XG4gICAgdmFyIHNjb3JlcyA9IF8uc29ydEJ5KHN0YWdlLmxpc3RzLnBsYXllcnMubWFwKGZ1bmN0aW9uKHApIHtcbiAgICAgIHJldHVybiB7aTogcC5wLmksIHNjb3JlOiBRLnN0YXRlLmdldCgnc2NvcmUtJysgcC5wLmkpfVxuICAgIH0pLCAnc2NvcmUnKVxuICAgIGlmKHNjb3Jlc1swXS5pID09PSAnYScgJiYgc2NvcmVzWzBdLnNjb3JlIDwgc2NvcmVzWzFdLnNjb3JlKSB7XG4gICAgICBlbmRHYW1lKClcbiAgICB9IGVsc2Uge1xuICAgICAgbmV3Um91bmQoKVxuICAgIH1cbiAgfVxuXG4gIHN0YWdlLm9uKCdkZXN0cm95ZWQnLCBjbGVhbnVwKVxuICBRLnN0YXRlLm9uKCdjaGFuZ2UnLCBwYXVzZVBsYXllcnMpXG4gIGp1ZGdlLm9uKCd0YWxrRW5kJywgcm91bmRFbmQpXG4gIG5ld0dhbWUoKVxufVxuXG5RLnNjZW5lKCdiZycsIGZ1bmN0aW9uKHN0YWdlKSB7XG4gIHZhciBiZyA9IHN0YWdlLmluc2VydChuZXcgUS5TcHJpdGUoe1xuICAgIGFzc2V0OiBcImFzc2V0cy9iZy0xLnBuZ1wiLFxuICAgIHNjYWxlOiA2MDgvOTAwXG4gIH0pKVxuICBiZy5jZW50ZXIoKVxuICBiZy5wLnkgLT0gNSArNjRcbiAgc3RhZ2Uub24oXCJkZXN0cm95XCIsZnVuY3Rpb24oKSB7XG4gICAganVkZ2UuZGVzdHJveSgpXG4gIH0pO1xufSlcblxuUS5zY2VuZShcImFuaW1zXCIsIGZ1bmN0aW9uKHN0YWdlKSB7XG4gIHZhciBsYXllciA9IHN0YWdlLmNvbGxpc2lvbkxheWVyKGxldmVsKCkpO1xuICB2YXIgcGxheWVyYSA9IHN0YWdlLmluc2VydChuZXcgUS5BbmltUGxheWVyKHt4OiA2NCwgeTogMjUqMTZ9KSlcbiAgc3RhZ2UuYWRkKFwidmlld3BvcnRcIilcbiAgc3RhZ2Uudmlld3BvcnQuc2NhbGUgPSAxXG4gIHN0YWdlLnZpZXdwb3J0LmNlbnRlck9uKGxheWVyLnAudy8yLCBsYXllci5wLmgvMis2NClcbn0pXG5cblEuc2NlbmUoXCJwbGF5LTFvbjFcIiwgZnVuY3Rpb24oc3RhZ2UpIHtcbiAgdmFyIGxheWVyID0gc3RhZ2UuY29sbGlzaW9uTGF5ZXIobGV2ZWwoKSk7XG4gIHN0YWdlLmFkZFRvTGlzdCgncGxheWVycycsIHN0YWdlLmluc2VydChuZXcgUS5QbGF5ZXIoe2k6ICdhJ30pKSlcbiAgc3RhZ2UuYWRkVG9MaXN0KCdwbGF5ZXJzJywgc3RhZ2UuaW5zZXJ0KG5ldyBRLkF1dG9QbGF5ZXIoe2k6ICdiJ30pKSlcbiAgdmFyIGp1ZGdlID0gc3RhZ2UuaW5zZXJ0KG5ldyBRLkp1ZGdlKHt4OiAzOCwgeTogMjUqMTZ9KSlcbiAgc3RhZ2UuYWRkKFwidmlld3BvcnRcIilcbiAgc3RhZ2Uudmlld3BvcnQuc2NhbGUgPSAxXG4gIHN0YWdlLnZpZXdwb3J0LmNlbnRlck9uKGxheWVyLnAudy8yLCBsYXllci5wLmgvMis2NClcbiAgZ2FtZUxvb3Aoc3RhZ2UsIGp1ZGdlKVxufSlcblxuUS5zY2VuZShcInBsYXktMW9uMlwiLCBmdW5jdGlvbihzdGFnZSkge1xuICB2YXIgbGF5ZXIgPSBzdGFnZS5jb2xsaXNpb25MYXllcihsZXZlbCgpKTtcbiAgc3RhZ2UuYWRkVG9MaXN0KCdwbGF5ZXJzJywgc3RhZ2UuaW5zZXJ0KG5ldyBRLlBsYXllcih7aTogJ2EnfSkpKVxuICBzdGFnZS5hZGRUb0xpc3QoJ3BsYXllcnMnLCBzdGFnZS5pbnNlcnQobmV3IFEuQXV0b1BsYXllcih7aTogJ2InfSkpKVxuICBzdGFnZS5hZGRUb0xpc3QoJ3BsYXllcnMnLCBzdGFnZS5pbnNlcnQobmV3IFEuQXV0b1BsYXllcih7aTogJ2MnfSkpKVxuICB2YXIganVkZ2UgPSBzdGFnZS5pbnNlcnQobmV3IFEuSnVkZ2Uoe3g6IDM4LCB5OiAyNSoxNn0pKVxuICBzdGFnZS5hZGQoXCJ2aWV3cG9ydFwiKVxuICBzdGFnZS52aWV3cG9ydC5zY2FsZSA9IDFcbiAgc3RhZ2Uudmlld3BvcnQuY2VudGVyT24obGF5ZXIucC53LzIsIGxheWVyLnAuaC8yKzY0KVxuICBnYW1lTG9vcChzdGFnZSwganVkZ2UpXG59KVxuXG5RLnNjZW5lKFwiYXV0b3BsYXlcIiwgZnVuY3Rpb24oc3RhZ2UpIHtcbiAgdmFyIGxheWVyID0gc3RhZ2UuY29sbGlzaW9uTGF5ZXIobGV2ZWwoKSk7XG4gIHN0YWdlLmFkZFRvTGlzdCgncGxheWVycycsIHN0YWdlLmluc2VydChuZXcgUS5BdXRvUGxheWVyKHtpOiAnYSd9KSkpXG4gIHN0YWdlLmFkZFRvTGlzdCgncGxheWVycycsIHN0YWdlLmluc2VydChuZXcgUS5BdXRvUGxheWVyKHtpOiAnYid9KSkpXG4gIHN0YWdlLmFkZFRvTGlzdCgncGxheWVycycsIHN0YWdlLmluc2VydChuZXcgUS5BdXRvUGxheWVyKHtpOiAnYyd9KSkpXG4gIHZhciBqdWRnZSA9IHN0YWdlLmluc2VydChuZXcgUS5KdWRnZSh7eDogMzgsIHk6IDI1KjE2fSkpXG4gIHN0YWdlLmFkZChcInZpZXdwb3J0XCIpXG4gIHN0YWdlLnZpZXdwb3J0LnNjYWxlID0gMVxuICBzdGFnZS52aWV3cG9ydC5jZW50ZXJPbihsYXllci5wLncvMiwgbGF5ZXIucC5oLzIrNjQpXG4gIGdhbWVMb29wKHN0YWdlLCBqdWRnZSlcbn0pXG5cbnZhciBodWQsXG4gICAgc2NvcmVib2FyZFxuYXNzZXRzLmxvYWQoZnVuY3Rpb24oKSB7XG4gIGh1ZCA9IG5ldyBRLkh1ZCgpXG4gIGh1ZC5pbml0KClcbiAgc2NvcmVib2FyZCA9IG5ldyBRLlNjb3JlQm9hcmQoKVxuICBzY29yZWJvYXJkLmluaXQoKVxuICBRLnN0YWdlU2NlbmUoXCJiZ1wiLCAwKTtcbiAgUS5zdGFnZVNjZW5lKFwiYXV0b3BsYXlcIiwgMSk7XG4gIFEuc3RhdGUuc2V0KCdub211c2ljJywgZmFsc2UpXG4gIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCBmdW5jdGlvbihlKSB7XG4gICAgaWYoZS5rZXlDb2RlID09IDQ5KSB7XG4gICAgICBRLmNsZWFyU3RhZ2UoMSlcbiAgICAgIFEuc3RhZ2VTY2VuZShcInBsYXktMW9uMVwiLCAxKTtcbiAgICB9XG4gICAgaWYoZS5rZXlDb2RlID09IDUwKSB7XG4gICAgICBRLmNsZWFyU3RhZ2UoMSlcbiAgICAgIFEuc3RhZ2VTY2VuZShcInBsYXktMW9uMlwiLCAxKTtcbiAgICB9XG4gICAgaWYoZS5rZXlDb2RlID09IDc3KSB7XG4gICAgICBhdWRpby50b2dnbGVNdXRlKClcbiAgICB9XG4gIH0pXG59KVxuY29uc29sZS5sb2coUSkiXX0=
