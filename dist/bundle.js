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
    
    ctx.fillStyle = "rgba(255,125,125,0.5)";
    ctx.fillRect(this._absx(ft.x, ft.w), this._absy(ft.y), ft.w, ft.h);
    ctx.fill();

    ctx.fillStyle = "rgba(125,125,255,0.5)";
    ctx.fillRect(this._absx(fh.x, fh.w), this._absy(fh.y), fh.w, fh.h);
    ctx.fill();

    ctx.fillStyle = "rgba(125,255,125,0.5)";
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
      hit = 100,
      feather = 4

  canvas.width = img.width
  canvas.height = img.height
  context.drawImage(img, 0, 0);

  function find (imgData, rcolor) {
    var lookupColor = rcolor - feather
    var a, b, c = {}
    while (lookupColor < rcolor + feather) {
      a = Array.prototype.indexOf.call(imgData.data, lookupColor) / 4,
      b = Array.prototype.lastIndexOf.call(imgData.data, lookupColor) / 4
      lookupColor++
      if (a >= 0) {
        c.x = a % size.tilew
        c.y = Math.floor(a / size.tilew)
        c.w = b % size.tilew - c.x
        c.h = Math.floor(b / size.tilew) - c.y
        break
      }
    }
    return c
  }

  for(var x = 0; x < img.width; x+=size.tilew) {
    imgData = context.getImageData(x, 0, size.tilew, size.tileh);
    exports.collisions[name].head.push(find(imgData, head))
    exports.collisions[name].torso.push(find(imgData, torso))
    exports.collisions[name].hit.push(find(imgData, hit))
  }
  console.log(name, exports.collisions[name].torso)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvQW5pbVBsYXllci5qcyIsImxpYi9BdXRvUGxheWVyLmpzIiwibGliL0dlcmlNb24uanMiLCJsaWIvSHVkLmpzIiwibGliL0p1ZGdlLmpzIiwibGliL1BsYXllci5qcyIsImxpYi9RLmpzIiwibGliL1Njb3JlQm9hcmQuanMiLCJsaWIvYXNzZXRzLmpzIiwibGliL2F1ZGlvLmpzIiwibGliL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIFEgPSByZXF1aXJlKCcuL1EnKVxucmVxdWlyZSgnLi9HZXJpTW9uJylcblxuUS5HZXJpTW9uLmV4dGVuZChcIkFuaW1QbGF5ZXJcIiwge1xuXG4gIGF0dGFja1NlcXVlbmNlOiBbJ3NlbnNvZ2VyaScsICdtYW5qaWdlcmknLCAnZnVqb2dlcmknLCAnc3VpaGVpZ2VyaScsICdzZW50YWlub3RzdWtpJywgJ2hhbmdldHN1YXRlJ10sXG4gIHVuc29rdVNlcXVlbmNlOiBbJ25pbm9hc2hpJywgJ3RzdWlzb2t1JywgJ2tvc29rdScsICdnZW5zb2t1JywgJ3RhaXNva3UnLCAndXNoaXJvJ10sXG5cbiAgaW5pdDogZnVuY3Rpb24ocCkge1xuICAgIHRoaXMuX3N1cGVyKF8uZXh0ZW5kKHtcbiAgICAgIGFuaW06IG51bGwsXG4gICAgICBzZXF1ZW5jZTogdGhpcy5hdHRhY2tTZXF1ZW5jZVxuICAgIH0sIHApKVxuICB9LFxuXG4gIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBuID0gdGhpcy5wLnNlcXVlbmNlW3RoaXMucC5zZXF1ZW5jZS5pbmRleE9mKHRoaXMucC5hbmltKSArIDFdIHx8IHRoaXMucC5zZXF1ZW5jZVswXVxuICAgIGlmKHRoaXNbbl0oKSkge1xuICAgICAgdGhpcy5wLmFuaW0gPSBuXG4gICAgfVxuICB9LFxuXG4gIHN0ZXA6IGZ1bmN0aW9uKHQpIHtcbiAgICBpZihRLmlucHV0cy5maXJlKSB7XG4gICAgICB0aGlzLnAuc2VxdWVuY2UgPSB0aGlzLnAuc2VxdWVuY2UgPT0gdGhpcy5hdHRhY2tTZXF1ZW5jZSA/IHRoaXMudW5zb2t1U2VxdWVuY2UgOiB0aGlzLmF0dGFja1NlcXVlbmNlXG4gICAgfVxuICAgIHRoaXMubmV4dCgpXG4gIH1cblxufSkiLCJ2YXIgUSA9IHJlcXVpcmUoJy4vUScpXG5yZXF1aXJlKCcuL0dlcmlNb24nKVxuXG5cbmZ1bmN0aW9uIGRpc3RhbmNlKGEsIGIpIHtcbiAgdmFyIHggPSBNYXRoLmFicyhhLnAueCAtIGIucC54KSxcbiAgICAgIHkgPSBNYXRoLmFicyhhLnAueSAtIGIucC55KVxuICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSk7XG59XG5cbmZ1bmN0aW9uIHNwb3RBdHRhY2sodGFyZ2V0KSB7XG4gIGlmKHRhcmdldC5wLmF0dGFja2luZyAmJiB0YXJnZXQucC5hbmltYXRpb25GcmFtZSA+IDQpIHtcbiAgICByZXR1cm4gdGFyZ2V0LnAuYW5pbWF0aW9uXG4gIH1cbn1cblxuUS5HZXJpTW9uLmV4dGVuZChcIkF1dG9QbGF5ZXJcIiwge1xuXG4gIGhpdERpc3RhbmNlOiAzNSoyLFxuXG4gIG1vdmVDbG9zZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgIGlmKGRpc3RhbmNlKHRhcmdldCwgdGhpcykgPiB0aGlzLmhpdERpc3RhbmNlICsgdGhpcy5wLncvMikge1xuICAgICAgdGhpcy50c3Vpc29rdSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMubmlub2FzaGkoKVxuICAgIH1cbiAgfSxcblxuICBtb3ZlRnVydGhlcjogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgdGhpc1tfLnNhbXBsZShbJ3RhaXNva3UnLCAnZ2Vuc29rdSddKV0oKVxuICB9LFxuXG4gIGNhbmNlbEF0dGFjazogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuXG4gICAgaWYodGhpcy5wLmF0dGFja2luZyAmJiB0aGlzLnAuYW5pbWF0aW9uRnJhbWUgPCA0KSB7XG4gICAgICB0aGlzLnN0YW5kKClcbiAgICB9XG4gIH0sXG5cbiAgY2FuY2VsVW5zb2t1OiBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLnAud2Fsa2luZykge1xuICAgICAgaWYodGhpcy5wLmFuaW1hdGlvbkZyYW1lIDwgMyB8fCB0aGlzLnAuYW5pbWF0aW9uRnJhbWUgPiA2KSB7XG4gICAgICAgIHRoaXMuc3RhbmQoKVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBhdHRhY2tEdXJpbmdBdHRhY2s6IGZ1bmN0aW9uKHRhcmdldCwgYXR0YWNrKSB7XG4gICAgaWYoYXR0YWNrID09PSAnc3VpaGVpZ2VyaScpIHtcbiAgICAgIGlmKHRhcmdldC5wLmFuaW1hdGlvbkZyYW1lIDwgNikge1xuICAgICAgICB0aGlzW18uc2FtcGxlKFsnZnVqb2dlcmknLCAnbWFuamlnZXJpJ10pXSh0YXJnZXQpXG4gICAgICB9XG4gICAgfVxuICAgIGlmKGF0dGFjayA9PT0gJ2Z1am9nZXJpJykge1xuICAgICAgaWYodGFyZ2V0LnAuYW5pbWF0aW9uRnJhbWUgPCAxMCkge1xuICAgICAgICB0aGlzLm1hbmppZ2VyaSh0YXJnZXQpXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIGF0dGFja0FmdGVyQXR0YWNrOiBmdW5jdGlvbih0YXJnZXQsIGF0dGFjaykge1xuICAgIGlmKGF0dGFjayA9PT0gJ3N1aWhlaWdlcmknKSB7XG4gICAgICBpZih0YXJnZXQucC5hbmltYXRpb25GcmFtZSA+IDYpIHtcbiAgICAgICAgdGhpcy5mdWpvZ2VyaSh0YXJnZXQpXG4gICAgICB9XG4gICAgfVxuICAgIGlmKGF0dGFjayA9PT0gJ2Z1am9nZXJpJykge1xuICAgICAgaWYodGFyZ2V0LnAuYW5pbWF0aW9uRnJhbWUgPiAxMCkge1xuICAgICAgICB0aGlzLm1hbmppZ2VyaSh0YXJnZXQpXG4gICAgICB9XG4gICAgfVxuICAgIGlmKGF0dGFjayA9PT0gJ21hbmppZ2VyaScpIHtcbiAgICAgIGlmKHRhcmdldC5wLmFuaW1hdGlvbkZyYW1lID4gNykge1xuICAgICAgICB0aGlzLnN1aWhlaWdlcmkodGFyZ2V0KVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICBldmFkZTogZnVuY3Rpb24odGFyZ2V0LCBhdHRhY2spIHtcbiAgICBpZihhdHRhY2spIHtcbiAgICAgIHZhciByID0gTWF0aC5yYW5kb20oKVxuICAgICAgdGhpcy5jYW5jZWxBdHRhY2soKVxuICAgICAgaWYociA+IC44KSB7XG4gICAgICAgIHRoaXMua29zb2t1KClcbiAgICAgIH0gZWxzZSBpZiAociA+IC41IHx8IGRpc3RhbmNlKHRhcmdldCwgdGhpcykgPCB0aGlzLmhpdERpc3RhbmNlICogMy80KSB7XG4gICAgICAgIHRoaXMuZ2Vuc29rdSgpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRhaXNva3UoKVxuICAgICAgfVxuXG4gICAgfVxuICB9LFxuXG4gIGF0dGFjazogZnVuY3Rpb24odGFyZ2V0LCBhdHRhY2spIHtcbiAgICB2YXIgZGlzdCA9IGRpc3RhbmNlKHRhcmdldCwgdGhpcylcbiAgICBpZihkaXN0IDwgMTUqMikge1xuICAgICAgdGhpc1tfLnNhbXBsZShbJ2hhbmdldHN1YXRlJywgJ3RzdWlzb2t1J10pXSh0YXJnZXQpXG4gICAgfSBlbHNlIGlmKGRpc3QgPCAyNioyKSB7XG4gICAgICB0aGlzW18uc2FtcGxlKFsnZnVqb2dlcmknLCAnc2Vuc29nZXJpJywgJ21hbmppZ2VyaSddKV0odGFyZ2V0KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzW18uc2FtcGxlKFsnZnVqb2dlcmlGb3J3YXJkJywgJ3N1aWhlaWdlcmknLCAnc2VudGFpbm90c3VraSddKV0odGFyZ2V0KVxuICAgIH1cbiAgICAvLyBpZihkaXN0ID4gMTQgJiYgZGlzdCA8IDIyKSB0aGlzLmZ1am9nZXJpKHRhcmdldClcbiAgICAvLyBpZihkaXN0ID4gMTcgJiYgZGlzdCA8IDI2KSB0aGlzLnNlbnNvZ2VyaSh0YXJnZXQpXG4gICAgLy8gaWYoZGlzdCA+IDIwICYmIGRpc3QgPCAyOCkge1xuICAgIC8vICAgdGhpc1tfLnNhbXBsZShbJ2Z1am9nZXJpRm9yd2FyZCcsICdtYW5qaWdlcmknXSldKHRhcmdldClcbiAgICAvLyB9XG4gICAgLy8gaWYoZGlzdCA+IDI3ICYmIGRpc3QgPCAzNSkgdGhpcy5zdWloZWlnZXJpKHRhcmdldClcbiAgICAvLyB0aGlzW18uc2FtcGxlKFsnc3VpaGVpZ2VyaScsICdtYW5qaWdlcmknLCAnc2Vuc29nZXJpJywgJ21hbmppZ2VyaScsICdzZW5zb2dlcmknLCAnZnVqb2dlcmknLCAnZnVqb2dlcmlGb3J3YXJkJ10pXSh0YXJnZXQpIFxuICB9LFxuXG4gIGxvb2tBdDogZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgdmFyIGF0ID0gdGFyZ2V0LnAueCA8IHRoaXMucC54ID8gJ2xlZnQnIDogJ3JpZ2h0J1xuICAgIGlmKGF0ICE9IHRoaXMucC5kaXJlY3Rpb24pIHRoaXMudXNoaXJvKClcbiAgfSxcblxuICBzdGVwOiBmdW5jdGlvbih0KSB7XG4gICAgdGhpcy5fc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuXG4gICAgaWYodGhpcy5wLnBhdXNlZCkgcmV0dXJuO1xuICAgIFxuICAgIHZhciBvdGhlcnMgPSBfLmNoYWluKHRoaXMuc3RhZ2UubGlzdHMucGxheWVycykud2l0aG91dCh0aGlzKS5maWx0ZXIoZnVuY3Rpb24oaSl7IHJldHVybiAhaS5wLmhpdCB9KS52YWx1ZSgpLFxuICAgICAgICB0YXJnZXQgPSBfLnNhbXBsZShvdGhlcnMpLFxuICAgICAgICBkaXN0ID0gdGFyZ2V0ID8gZGlzdGFuY2UodGFyZ2V0LCB0aGlzKSA6IEluZmluaXR5O1xuICAgIFxuICAgIGlmKHRhcmdldCkge1xuXG4gICAgICB0aGlzLmxvb2tBdCh0YXJnZXQpXG5cbiAgICAgIGlmKGRpc3QgPCB0aGlzLmhpdERpc3RhbmNlIC8gMikge1xuICAgICAgICB0aGlzLm1vdmVGdXJ0aGVyKHRhcmdldClcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYoZGlzdCA+IHRoaXMuaGl0RGlzdGFuY2UpIHtcbiAgICAgICAgdGhpcy5tb3ZlQ2xvc2VyKHRhcmdldClcbiAgICAgIH1cblxuICAgICAgdmFyIHNwb3QgPSBzcG90QXR0YWNrKHRhcmdldClcbiAgICAgIGlmKHNwb3QpIHtcbiAgICAgICAgdGhpcy5ldmFkZSh0YXJnZXQsIHNwb3QpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZihkaXN0ID4gOCAmJiBkaXN0IDw9IHRoaXMuaGl0RGlzdGFuY2UpIHtcbiAgICAgICAgICB0aGlzLmF0dGFjayh0YXJnZXQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgfVxuXG59KSIsInZhciBRID0gcmVxdWlyZSgnLi9RJyksXG4gICAgY29sbGlzaW9ucyA9IHJlcXVpcmUoJy4vYXNzZXRzJykuY29sbGlzaW9ucyxcbiAgICBhdWRpbyA9IHJlcXVpcmUoJy4vYXVkaW8nKVxuXG5RLmFuaW1hdGlvbnMoJ2dlcmltb24nLCB7XG4gIHN0YW5kOiB7IGZyYW1lczogWzBdIH0sXG4gIHNlbnRhaW5vdHN1a2k6IHsgZnJhbWVzOiBfLnJhbmdlKDIyKSwgcmF0ZTogMS8xMiwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAgZnVqb2dlcmk6IHsgZnJhbWVzOiBfLnJhbmdlKDE1KSwgcmF0ZTogMS8xMiwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAgc3VpaGVpZ2VyaTogeyBmcmFtZXM6IF8ucmFuZ2UoMTUpLCByYXRlOiAxLzEyLCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICBtYW5qaWdlcmk6IHsgZnJhbWVzOiBfLnJhbmdlKDE1KSwgcmF0ZTogMS8xMiwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAgaGFuZ2V0c3VhdGU6IHsgZnJhbWVzOiBfLnJhbmdlKDIxKSwgcmF0ZTogMS8xMiwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAgc2Vuc29nZXJpOiB7IGZyYW1lczogXy5yYW5nZSgyMCksIHJhdGU6IDEvMTIsIGxvb3A6IGZhbHNlLCB0cmlnZ2VyOiAnc3RhbmQnIH0sXG4gIHRzdWlzb2t1OiB7IGZyYW1lczogXy5yYW5nZSgxMSksIHJhdGU6IDEvMTIsIGxvb3A6IGZhbHNlLCB0cmlnZ2VyOiAnc3RhbmQnIH0sXG4gIGtvc29rdTogeyBmcmFtZXM6IF8ucmFuZ2UoMTgpLCByYXRlOiAxLzE3LCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICB1c2hpcm86IHsgZnJhbWVzOiBfLnJhbmdlKDcpLCByYXRlOiAxLzEyLCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICBuaW5vYXNoaTogeyBmcmFtZXM6IF8ucmFuZ2UoNiksIHJhdGU6IDEvMTIsIGxvb3A6IGZhbHNlLCB0cmlnZ2VyOiAnc3RhbmQnIH0sXG4gIHRhaXNva3U6IHsgZnJhbWVzOiBfLnJhbmdlKDExKS5yZXZlcnNlKCksIHJhdGU6IDEvMTIsIGxvb3A6IGZhbHNlLCB0cmlnZ2VyOiAnc3RhbmQnIH0sXG4gIHRvcnNvaGl0OiB7IGZyYW1lczogWzAsMSwyLDMsMiwxLDBdLCByYXRlOiAxLzEyLCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICBoZWFkb2ZmaGl0OiB7IGZyYW1lczogXy5yYW5nZSgxMyksIHJhdGU6IDEvMTIsIGxvb3A6IGZhbHNlIH1cbn0pO1xuXG5cblxuZnVuY3Rpb24gaW50ZXJzZWN0cyhhLCBiKSB7XG4gIGlmKGEudyArIGEuaCArIGIudyArIGIuaCA9PSAwKSByZXR1cm4gZmFsc2U7XG4gIHZhciB4SW50ZXNlY3RzID0gYS54IDwgYi54ICYmIGEueCthLncgPiBiLnggfHwgXG4gICAgICAgICAgICAgICAgICAgYS54IDwgYi54K2IudyAmJiBhLngrYS53ID4gYi54K2IudyxcbiAgICAgIHlJbnRlc2VjdHMgPSBhLnkgPCBiLnkgJiYgYS55ICsgYS5oID4gYi55IHx8XG4gICAgICAgICAgICAgICAgICAgYS55IDwgYi55K2IuaCAmJiBhLnkrYS5oID4gYi55K2IuaFxuICByZXR1cm4geEludGVzZWN0cyAmJiB5SW50ZXNlY3RzXG59XG5mdW5jdGlvbiByZWN0KHgsIHksIHcsIGgpIHtcbiAgcmV0dXJuIHtcbiAgICB4OiB4fHwwLFxuICAgIHk6IHl8fDAsXG4gICAgdzogd3x8MCxcbiAgICBoOiBofHwwXG4gIH1cbn1cblxuZnVuY3Rpb24gYXR0YWNrKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICBpZighdGhpcy5wLmxhbmRlZCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmKHRoaXMucC5oaXQpIHJldHVybiBmYWxzZTtcbiAgICBpZih0aGlzLnAuYXR0YWNraW5nKSByZXR1cm4gZmFsc2U7XG4gICAgaWYodGhpcy5wLndhbGtpbmcgJiYgdGhpcy5wLmFuaW1hdGlvbkZyYW1lID4gNCB8fCB0aGlzLnAuYW5pbWF0aW9uID09PSAndXNoaXJvJykgcmV0dXJuIGZhbHNlO1xuICAgIHRoaXMucC5taXNzZWQgPSBmYWxzZVxuICAgIHRoaXMucC50YXJnZXQgPSB0YXJnZXRcbiAgICB0aGlzLnAuYXR0YWNraW5nID0gdHJ1ZVxuICAgIHRoaXMucC52eCA9IDBcbiAgICB2YXIgZD0gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgIGlmKHR5cGVvZiBkID09PSAndW5kZWZpbmVkJyB8fCBkKSB7XG4gICAgICB0aGlzLm9uKCdzdGVwJywgdGhpcywgJ2hpdFN0ZXAnKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZnVuY3Rpb24ganVtcChmbikge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgaWYodGhpcy5wLmhpdCkgcmV0dXJuIGZhbHNlO1xuICAgIGlmKHRoaXMucC5qdW1waW5nKSByZXR1cm4gZmFsc2U7XG4gICAgdGhpcy5wLmp1bXBpbmcgPSB0cnVlXG4gICAgdmFyIGQ9IGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICByZXR1cm4gdHlwZW9mIGQgPT09ICd1bmRlZmluZWQnIHx8IGRcbiAgfVxufVxuXG5mdW5jdGlvbiB3YWxrKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLnAuaGl0KSByZXR1cm4gZmFsc2U7XG4gICAgaWYoIXRoaXMucC5sYW5kZWQpIHJldHVybiBmYWxzZTtcbiAgICBpZih0aGlzLnAuYXR0YWNraW5nKSByZXR1cm4gZmFsc2U7XG4gICAgaWYodGhpcy5wLndhbGtpbmcpIHJldHVybiBmYWxzZTtcbiAgICB0aGlzLnAud2Fsa2luZyA9IHRydWVcbiAgICB2YXIgZD0gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgIHJldHVybiB0eXBlb2YgZCA9PT0gJ3VuZGVmaW5lZCcgfHwgZFxuICB9XG59XG5cblEuTW92aW5nU3ByaXRlLmV4dGVuZChcIkhlYWRcIiwge1xuICBpbml0OiBmdW5jdGlvbihvd25lciwgZm9yY2UpIHtcbiAgICB0aGlzLl9zdXBlcih7fSwge1xuICAgICAgY29sb3I6IFwiIzAwMDAwMFwiLFxuICAgICAgdzogNCxcbiAgICAgIGg6IDQsXG4gICAgICB4OiBvd25lci5wLngsXG4gICAgICB5OiBvd25lci5wLnkgLSAxMyxcbiAgICAgIHNjYWxlOiAyLFxuICAgICAgZGlyOiAtMSpvd25lci5wLmRpcixcbiAgICAgIHNlbnNvcjogdHJ1ZSxcbiAgICAgIGxpZmU6IDBcbiAgICB9KVxuICAgIHRoaXMuYWRkKCcyZCcpO1xuICAgIHRoaXMucC52eSA9IC0xNTBcbiAgICB0aGlzLnAudnggPSB0aGlzLnAuZGlyKmZvcmNlICogMlxuICAgIHRoaXMub24oXCJidW1wLmJvdHRvbVwiLCBmdW5jdGlvbigpIHtcbiAgICAgIGlmKHRoaXMucC52eSA+IDApXG4gICAgICAgIGF1ZGlvLnBsYXkoJ2Fzc2V0cy9ib3VuY2UubXAzJylcbiAgICB9KTtcbiAgfSxcbiAgc3RlcDogZnVuY3Rpb24odCkge1xuICAgIHRoaXMuX3N1cGVyKHQpXG4gICAgdGhpcy5wLmxpZmUgKz0gdFxuICAgIHRoaXMucC5hbmdsZSArPSB0aGlzLnAuZGlyICogdCAqIDQwMFxuICAgIGlmKHRoaXMucC5saWZlID4gNSkge1xuICAgICAgdGhpcy5kZXN0cm95KClcbiAgICB9XG4gIH1cbn0pXG5cblEuTW92aW5nU3ByaXRlLmV4dGVuZChcIkdlcmlNb25cIiwge1xuICBcbiAgc3BlZWQ6IDI1KjIsXG4gIGZyaWN0aW9uOiA1KjIsXG4gIGp1bXBTcGVlZDogMTMwLFxuICBoaXRGb3JjZToge1xuICAgIGZ1am9nZXJpOiA0MCxcbiAgICBtYW5qaWdlcmk6IDI1LFxuICAgIHNlbnNvZ2VyaTogNDAsXG4gICAgc3VpaGVpZ2VyaTogMzUsXG4gICAgc2VudGFpbm90c3VraTogMjUsXG4gICAgaGFuZ2V0c3VhdGU6IDQwXG4gIH0sXG5cbiAgaW5pdDogZnVuY3Rpb24ocCkge1xuICAgIHZhciB3ID0gMjIqMiwgaCA9IDMyKjJcbiAgICB0aGlzLl9zdXBlcihwLCB7IFxuICAgICAgc3ByaXRlOiBcImdlcmltb25cIixcbiAgICAgIGRpcjogMSxcbiAgICAgIHc6IHcsXG4gICAgICBoOiBoLFxuICAgICAgc3c6IDQ4KjIsXG4gICAgICBzaDogMzIqMixcbiAgICAgIHNlbnNvcjogdHJ1ZSxcbiAgICAgIG1vdmVtZW50czogW10sXG4gICAgICBwb2ludHM6IFtcbiAgICAgICAgWy13LzIsIC1oLzJdLCBcbiAgICAgICAgWyB3LzIsIC1oLzIgXSwgXG4gICAgICAgIFsgdy8yLCAgaC8yIF0sIFxuICAgICAgICBbLXcvMiwgIGgvMiBdXSxcbiAgICAgIGN4OiAxMCoyXG4gICAgfSk7XG4gICAgdGhpcy5hZGQoJzJkLCBhbmltYXRpb24nKTtcbiAgICB0aGlzLnAuaSA9IHRoaXMucC5pIHx8ICdhJ1xuXG4gICAgdGhpcy5vbihcInN0YW5kXCIsIHRoaXMsIFwic3RhbmRcIik7XG4gICAgdGhpcy5vbihcInByZXN0ZXBcIiwgdGhpcywgXCJwcmVzdGVwXCIpXG4gICAgdGhpcy5vbihcImJ1bXAuYm90dG9tXCIsIHRoaXMsIFwibGFuZFwiKTtcbiAgICB0aGlzLm9uKFwiYW5pbUVuZC5zZW50YWlub3RzdWtpXCIsIHRoaXMsIFwic2VudGFpbm90c3VraUVuZFwiKVxuICAgIHRoaXMub24oXCJhbmltRW5kLnVzaGlyb1wiLCB0aGlzLCBcInVzaGlyb0VuZFwiKVxuICAgIHRoaXMub24oXCJhbmltRW5kXCIsIHRoaXMsIFwibG9nTW92ZW1lbnRcIilcbiAgICAvLyB0aGlzLm9uKFwicG9zdGRyYXdcIiwgdGhpcywgXCJyZW5kZXJDb2xsaXNpb25zXCIpXG5cbiAgICB0aGlzLnN0YW5kKClcbiAgfSxcblxuICBsb2dNb3ZlbWVudDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLm1vdmVtZW50cy5wdXNoKHRoaXMucC5hbmltYXRpb24pXG4gICAgdGhpcy5wLm1vdmVtZW50cyA9IHRoaXMucC5tb3ZlbWVudHMuc3BsaWNlKC0zKVxuICB9LFxuXG4gIF9hYnN4OiBmdW5jdGlvbih4LCB3KSB7XG4gICAgcmV0dXJuIHRoaXMucC5mbGlwID8gXG4gICAgICB0aGlzLnAueCArIHRoaXMucC5jeCAtIHggLSB3IDpcbiAgICAgIHRoaXMucC54IC0gdGhpcy5wLmN4ICsgeFxuICB9LFxuXG4gIF9hYnN5OiBmdW5jdGlvbih5KSB7XG4gICAgcmV0dXJuIHRoaXMucC55LXRoaXMucC5jeSArIHlcbiAgfSxcblxuICByZW5kZXJDb2xsaXNpb25zOiBmdW5jdGlvbihjdHgpIHtcbiAgICBjdHguc2F2ZSgpO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcblxuICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwwLDAsMC41KVwiO1xuICAgIGN0eC5maWxsUmVjdCh0aGlzLnAueC10aGlzLnAuY3gsIHRoaXMucC55LXRoaXMucC5jeSwgdGhpcy5wLncsIHRoaXMucC5oKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIFxuICAgIHZhciBjID0gY29sbGlzaW9uc1t0aGlzLnAuYW5pbWF0aW9uXSB8fCBjb2xsaXNpb25zLnN0YW5kLFxuICAgICAgICBmdCA9IGMudG9yc29bdGhpcy5wLmFuaW1hdGlvbkZyYW1lXSB8fCBjLnRvcnNvWzBdLFxuICAgICAgICBmaCA9IGMuaGVhZFt0aGlzLnAuYW5pbWF0aW9uRnJhbWVdIHx8IGMuaGVhZFswXSxcbiAgICAgICAgZmhoPSBjLmhpdCAmJiBjLmhpdFt0aGlzLnAuYW5pbWF0aW9uRnJhbWVdIHx8IHt9XG4gICAgXG4gICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgyNTUsMTI1LDEyNSwwLjUpXCI7XG4gICAgY3R4LmZpbGxSZWN0KHRoaXMuX2Fic3goZnQueCwgZnQudyksIHRoaXMuX2Fic3koZnQueSksIGZ0LncsIGZ0LmgpO1xuICAgIGN0eC5maWxsKCk7XG5cbiAgICBjdHguZmlsbFN0eWxlID0gXCJyZ2JhKDEyNSwxMjUsMjU1LDAuNSlcIjtcbiAgICBjdHguZmlsbFJlY3QodGhpcy5fYWJzeChmaC54LCBmaC53KSwgdGhpcy5fYWJzeShmaC55KSwgZmgudywgZmguaCk7XG4gICAgY3R4LmZpbGwoKTtcblxuICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMTI1LDI1NSwxMjUsMC41KVwiO1xuICAgIGN0eC5maWxsUmVjdCh0aGlzLl9hYnN4KGZoaC54LCBmaGgudyksIHRoaXMuX2Fic3koZmhoLnkpLCBmaGgudywgZmhoLmgpO1xuICAgIGN0eC5maWxsKCk7XG4gICAgY3R4LnJlc3RvcmUoKVxuICB9LFxuXG4gIGxhbmQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC5sYW5kZWQgPSB0cnVlXG4gICAgdGhpcy5wLmp1bXBpbmcgPSBmYWxzZVxuICB9LFxuXG4gIHNoZWV0OiBmdW5jdGlvbihuYW1lKSB7XG4gICAgaWYobmFtZSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3N1cGVyKG5hbWUgKyAnLScgKyB0aGlzLnAuaSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuX3N1cGVyKClcbiAgICB9XG4gIH0sXG5cbiAgcGF1c2U6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC5wYXVzZWQgPSB0cnVlXG4gIH0sXG5cbiAgdW5wYXVzZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLnBhdXNlZCA9IGZhbHNlXG4gICAgdGhpcy5zdGFuZCgpXG4gIH0sXG5cbiAgZnVqb2dlcmlGb3J3YXJkOiBqdW1wKGF0dGFjayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNoZWV0KFwiZnVqb2dlcmlcIilcbiAgICB0aGlzLnBsYXkoJ2Z1am9nZXJpJywgMSlcbiAgICB0aGlzLm9uKCdzdGVwJywgdGhpcywgJ2Z1am9nZXJpRm9yd2FyZFN0ZXAnKVxuICAgIHRoaXMub24oJ3N0ZXAnLCB0aGlzLCAnZnVqb2dlcmlTdGVwJylcbiAgfSkpLFxuXG4gIGZ1am9nZXJpOiBqdW1wKGF0dGFjayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNoZWV0KFwiZnVqb2dlcmlcIilcbiAgICB0aGlzLnBsYXkoJ2Z1am9nZXJpJywgMSlcbiAgICB0aGlzLm9uKCdzdGVwJywgdGhpcywgJ2Z1am9nZXJpU3RlcCcpXG4gIH0pKSxcblxuICBmdWpvZ2VyaUZvcndhcmRTdGVwOiBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLnAuYW5pbWF0aW9uRnJhbWUgPiA0ICYmIHRoaXMucC5hbmltYXRpb25GcmFtZSA8IDcpIHtcbiAgICAgIHRoaXMucC52eCA9IHRoaXMucC5kaXIgKiB0aGlzLnNwZWVkXG4gICAgICB0aGlzLm9mZignc3RlcCcsIHRoaXMsICdmdWpvZ2VyaUZvcndhcmRTdGVwJylcbiAgICB9XG4gIH0sXG5cbiAgZnVqb2dlcmlTdGVwOiBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLnAuYW5pbWF0aW9uRnJhbWUgPiA0KSB7XG4gICAgICB0aGlzLnAudnkgPSAtdGhpcy5qdW1wU3BlZWRcbiAgICAgIHRoaXMucC5sYW5kZWQgPSBmYWxzZVxuICAgICAgdGhpcy5wLmp1bXBpbmcgPSB0cnVlXG4gICAgICB0aGlzLm9mZignc3RlcCcsIHRoaXMsICdmdWpvZ2VyaVN0ZXAnKVxuICAgIH1cbiAgfSxcblxuICBoYW5nZXRzdWF0ZTogYXR0YWNrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2hlZXQoXCJoYW5nZXRzdWF0ZVwiKVxuICAgIHRoaXMucGxheSgnaGFuZ2V0c3VhdGUnLCAxKVxuICB9KSxcblxuICBzZW50YWlub3RzdWtpOiBhdHRhY2soZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zaGVldChcInNlbnRhaW5vdHN1a2lcIilcbiAgICB0aGlzLnBsYXkoJ3NlbnRhaW5vdHN1a2knLCAxKVxuICB9KSxcblxuICBzZW50YWlub3RzdWtpRW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAueCArPSB0aGlzLnAuZGlyICogMTUqMlxuICB9LFxuXG4gIG1hbmppZ2VyaTogYXR0YWNrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2hlZXQoXCJtYW5qaWdlcmlcIilcbiAgICB0aGlzLnBsYXkoJ21hbmppZ2VyaScsIDEpXG4gIH0pLFxuXG4gIHN1aWhlaWdlcmk6IGF0dGFjayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNoZWV0KFwic3VpaGVpZ2VyaVwiKVxuICAgIHRoaXMucGxheSgnc3VpaGVpZ2VyaScsIDEpXG4gIH0pLFxuXG4gIHNlbnNvZ2VyaTogYXR0YWNrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2hlZXQoXCJzZW5zb2dlcmlcIilcbiAgICB0aGlzLnBsYXkoJ3NlbnNvZ2VyaScsIDEpXG4gIH0pLFxuXG4gIHVzaGlybzogd2FsayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNoZWV0KFwidXNoaXJvXCIpXG4gICAgdGhpcy5wbGF5KCd1c2hpcm8nLCAxKVxuICB9KSxcblxuICB1c2hpcm9FbmQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC54ICs9IHRoaXMucC5kaXIgKiA0KjJcbiAgICB0aGlzLnAuZGlyZWN0aW9uID0gdGhpcy5wLmRpcmVjdGlvbiA9PT0gJ2xlZnQnID8gJ3JpZ2h0JyA6ICdsZWZ0J1xuICAgIHRoaXMucHJlc3RlcCgpXG4gIH0sXG5cbiAgbmlub2FzaGk6IHdhbGsoZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLnZ4ID0gdGhpcy5wLmRpciAqIHRoaXMuc3BlZWQvMjtcbiAgICB0aGlzLnNoZWV0KFwibmlub2FzaGlcIilcbiAgICB0aGlzLnBsYXkoJ25pbm9hc2hpJywgMSlcbiAgfSksXG5cbiAgdGFpc29rdTogd2FsayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAudnggPSAtdGhpcy5wLmRpciAqIHRoaXMuc3BlZWQ7XG4gICAgdGhpcy5zaGVldChcInRzdWlzb2t1XCIpXG4gICAgdGhpcy5wbGF5KCd0YWlzb2t1JywgMSlcbiAgfSksXG4gIFxuICB0c3Vpc29rdTogd2FsayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAudnggPSB0aGlzLnAuZGlyICogdGhpcy5zcGVlZDtcbiAgICB0aGlzLnNoZWV0KFwidHN1aXNva3VcIilcbiAgICB0aGlzLnBsYXkoJ3RzdWlzb2t1JywgMSlcbiAgfSksXG5cbiAga29zb2t1OiB3YWxrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC52eCA9IHRoaXMucC5kaXIgKiB0aGlzLnNwZWVkLzI7XG4gICAgdGhpcy5zaGVldChcImtvc29rdVwiKVxuICAgIHRoaXMucGxheSgna29zb2t1JywgMSlcbiAgfSksXG5cbiAgZ2Vuc29rdTogd2FsayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAudnggPSAtdGhpcy5wLmRpciAqIHRoaXMuc3BlZWQqMi8zO1xuICAgIHRoaXMuc2hlZXQoXCJrb3Nva3VcIilcbiAgICB0aGlzLnBsYXkoJ2tvc29rdScsIDEpXG4gIH0pLFxuXG4gIGhpdFN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgIGlmKCFjb2xsaXNpb25zW3RoaXMucC5hbmltYXRpb25dKSByZXR1cm47XG4gICAgaWYoIWNvbGxpc2lvbnNbdGhpcy5wLmFuaW1hdGlvbl0uaGl0W3RoaXMucC5hbmltYXRpb25GcmFtZV0udykgcmV0dXJuO1xuICAgIHZhciBoaXQgPSB0aGlzLmhpdFRlc3QoY29sbGlzaW9uc1t0aGlzLnAuYW5pbWF0aW9uXS5oaXRbdGhpcy5wLmFuaW1hdGlvbkZyYW1lXSlcbiAgICBpZihoaXQpIHtcbiAgICAgIGF1ZGlvLnBsYXkoJ2Fzc2V0cy9oaXQtJyArIF8uc2FtcGxlKFsxLDIsMyw0XSkgKyAnLm1wMycpXG4gICAgICB2YXIgdmFsdWUgPSB0aGlzLnAudGFyZ2V0LmhpdCh0aGlzLnAuZGlyICogdGhpcy5oaXRGb3JjZVt0aGlzLnAuYW5pbWF0aW9uXSwgaGl0KVxuXG4gICAgICB2YXIgcHJldk1vdmVtZW50ID0gdGhpcy5wLm1vdmVtZW50c1t0aGlzLnAubW92ZW1lbnRzLmxlbmd0aC0xXVxuICAgICAgaWYocHJldk1vdmVtZW50ICYmIHByZXZNb3ZlbWVudC5pbmRleE9mKCdzb2t1JykgPiAtMSkge1xuICAgICAgICB2YWx1ZSArPSAxXG4gICAgICB9XG5cbiAgICAgIHZhciBzY29yZSA9IFEuc3RhdGUuZ2V0KFwic2NvcmUtXCIgKyB0aGlzLnAuaSkgfHwgMFxuICAgICAgUS5zdGF0ZS5pbmMoXCJ0b3RhbC1zY29yZS1cIiArIHRoaXMucC5pLCB2YWx1ZSoxMDApXG4gICAgICBRLnN0YXRlLnNldChcInNjb3JlLVwiICsgdGhpcy5wLmksIE1hdGgubWluKChzY29yZSArIHZhbHVlKSwgNCkpO1xuICAgIH0gZWxzZSBpZighdGhpcy5wLm1pc3NlZCkge1xuICAgICAgdGhpcy5wLm1pc3NlZCA9IHRydWVcbiAgICAgIGF1ZGlvLnBsYXkoJ2Fzc2V0cy9taXNzLScgKyBfLnNhbXBsZShbMSwxLDEsMSwxLDEsMl0pICsgJy5tcDMnKVxuICAgIH1cbiAgfSxcblxuICBoaXRUZXN0OiBmdW5jdGlvbihjb2xsKSB7XG4gICAgaWYoIXRoaXMucC50YXJnZXQpIHJldHVybiBmYWxzZVxuICAgIGlmKHRoaXMucC50YXJnZXQucC5oaXQpIHJldHVybiBmYWxzZVxuICAgIHZhciB0ID0gdGhpcy5wLnRhcmdldCxcbiAgICAgICAgdHAgPSB0aGlzLnAudGFyZ2V0LnAsXG4gICAgICAgIHR0ID0gY29sbGlzaW9uc1t0cC5hbmltYXRpb25dLnRvcnNvW3RwLmFuaW1hdGlvbkZyYW1lXSxcbiAgICAgICAgdGggPSBjb2xsaXNpb25zW3RwLmFuaW1hdGlvbl0uaGVhZFt0cC5hbmltYXRpb25GcmFtZV0sXG4gICAgICAgIGNyID0gcmVjdCh0aGlzLl9hYnN4KGNvbGwueCwgY29sbC53KSwgdGhpcy5fYWJzeShjb2xsLnkpLCBjb2xsLncsIGNvbGwuaClcblxuICAgIGlmKGludGVyc2VjdHMocmVjdCh0Ll9hYnN4KHRoLngsIHRoLncpLCB0Ll9hYnN5KHRoLnkpLCB0aC53LCB0dC5oKSwgY3IpKSB7XG4gICAgICByZXR1cm4gJ2hlYWQnXG4gICAgfVxuICAgIFxuICAgIGlmKGludGVyc2VjdHMocmVjdCh0Ll9hYnN4KHR0LngsIHR0LncpLCB0Ll9hYnN5KHR0LnkpLCB0dC53LCB0dC5oKSwgY3IpKSB7XG4gICAgICByZXR1cm4gJ3RvcnNvJ1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZVxuICB9LFxuXG4gIGhpdDogZnVuY3Rpb24oZm9yY2UsIGhpdCkge1xuICAgIHRoaXMuc3RhbmQoKVxuICAgIHRoaXMucC5oaXQgPSB0cnVlIFxuICAgIGlmKGhpdCA9PT0gJ2hlYWQnICYmIE1hdGguYWJzKGZvcmNlKSA+IDM1ICYmIE1hdGgucmFuZG9tKCkgPiAuNSkge1xuICAgICAgYXVkaW8ucGxheSgnYXNzZXRzL2hlYWQtb2ZmLScgKyBfLnNhbXBsZShbMSwyLDNdKSArICcubXAzJylcbiAgICAgIHRoaXMuc2hlZXQoXCJoZWFkb2ZmLWhpdFwiKVxuICAgICAgdGhpcy5wbGF5KCdoZWFkb2ZmaGl0JywgMSlcbiAgICAgIHRoaXMuc3RhZ2UuaW5zZXJ0KG5ldyBRLkhlYWQodGhpcywgZm9yY2UpKVxuICAgICAgcmV0dXJuIDRcbiAgICB9IGVsc2Uge1xuICAgICAgYXVkaW8ucGxheSgnYXNzZXRzL2h1cnQtJyArIF8uc2FtcGxlKFsxLDIsM10pICsgJy5tcDMnKVxuICAgICAgdGhpcy5wLnZ4ICs9IGZvcmNlXG4gICAgICB0aGlzLnNoZWV0KFwidG9yc28taGl0XCIpXG4gICAgICB0aGlzLnBsYXkoJ3RvcnNvaGl0JywgMSlcbiAgICAgIHJldHVybiAxXG4gICAgfVxuICB9LFxuXG4gIGZpbmlzaEtpY2tzOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLm9mZignc3RlcCcsIHRoaXMsICdoaXRTdGVwJylcbiAgICB0aGlzLm9mZignc3RlcCcsIHRoaXMsICdmdWpvZ2VyaVN0ZXAnKVxuICAgIHRoaXMub2ZmKCdzdGVwJywgdGhpcywgJ2Z1am9nZXJpRm9yd2FyZFN0ZXAnKVxuICAgIHRoaXMub2ZmKCdzdGVwJywgdGhpcywgJ3NlbnRhaW5vdHN1a2lTdGVwJylcbiAgICB0aGlzLm9mZigncHJlc3RlcCcsIHRoaXMsICdmaW5pc2hLaWNrcycpXG4gIH0sXG5cbiAgc3RhbmQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC5mcmFtZSA9IDBcbiAgICB0aGlzLnAudnggPSAwXG4gICAgdGhpcy5wbGF5KCdzdGFuZCcsIDEsIHRydWUpXG4gICAgdGhpcy5zaGVldChcInRzdWlzb2t1XCIpXG4gICAgdGhpcy5wLmp1bXBpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnAuYXR0YWNraW5nID0gZmFsc2U7XG4gICAgdGhpcy5wLndhbGtpbmcgPSBmYWxzZTtcbiAgICB0aGlzLnAuaGl0ID0gZmFsc2U7XG4gICAgdGhpcy5wLnRhcmdldCA9IG51bGw7XG4gICAgdGhpcy5maW5pc2hLaWNrcygpXG4gIH0sXG5cbiAgcHJlc3RlcDogZnVuY3Rpb24odCkge1xuICAgIGlmKHRoaXMucC5kaXJlY3Rpb24gPT09ICdsZWZ0Jykge1xuICAgICAgdGhpcy5zZXQoe2ZsaXA6ICd4J30pXG4gICAgICB0aGlzLnAuZGlyID0gLTFcbiAgICAgIHRoaXMucC5vcHBvc2l0ZURpcmVjdGlvbiA9ICdyaWdodCdcbiAgICAgIHRoaXMucC5jeCA9IDEyKjJcbiAgICB9XG4gICAgaWYodGhpcy5wLmRpcmVjdGlvbiA9PT0gJ3JpZ2h0Jykge1xuICAgICAgdGhpcy5zZXQoe2ZsaXA6ICcnfSlcbiAgICAgIHRoaXMucC5kaXIgPSAxXG4gICAgICB0aGlzLnAub3Bwb3NpdGVEaXJlY3Rpb24gPSAnbGVmdCdcbiAgICAgIHRoaXMucC5jeCA9IDEwKjJcbiAgICB9XG4gIH1cblxufSk7XG4iLCJ2YXIgUSA9IHJlcXVpcmUoJy4vUScpXG5cblEuR2FtZU9iamVjdC5leHRlbmQoXCJIdWRcIix7XG5cbiAgaW5pdDogXy5vbmNlKGZ1bmN0aW9uKCkge1xuXG4gICAgdGhpcy5lbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgdGhpcy5lbC5jbGFzc05hbWUgPSAnaHVkJ1xuICAgIHRoaXMuZWwuaW5uZXJIVE1MID0gXG4gICAgICAnPGRpdiBjbGFzcz1cImh1ZC1hXCI+PHNwYW4gY2xhc3M9XCJzY29yZSBzY29yZS1hIHNjb3JlLTBcIj48L3NwYW4+PHNwYW4gY2xhc3M9XCJzY29yZS12YWx1ZVwiPjwvc3Bhbj48L2Rpdj4nICtcbiAgICAgICc8ZGl2IGNsYXNzPVwiaHVkLWJcIj48c3BhbiBjbGFzcz1cInNjb3JlIHNjb3JlLWIgc2NvcmUtMFwiPjwvc3Bhbj48c3BhbiBjbGFzcz1cInNjb3JlLXZhbHVlXCI+PC9zcGFuPjwvZGl2PicgK1xuICAgICAgJzxkaXYgY2xhc3M9XCJodWQtY1wiPjxzcGFuIGNsYXNzPVwic2NvcmUgc2NvcmUtYyBzY29yZS0wXCI+PC9zcGFuPjxzcGFuIGNsYXNzPVwic2NvcmUtdmFsdWVcIj48L3NwYW4+PC9kaXY+J1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5lbClcblxuICAgIHRoaXMuc2NvcmVBID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNjb3JlLWEnKVxuICAgIHRoaXMuc2NvcmVCID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNjb3JlLWInKVxuICAgIHRoaXMuc2NvcmVDID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNjb3JlLWMnKVxuXG4gICAgdGhpcy5yZXNldCgpXG4gIH0pLFxuXG4gIHJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuICAgIFsnYScsICdiJywgJ2MnXS5mb3JFYWNoKF8uYmluZChmdW5jdGlvbihpKSB7XG4gICAgICB2YXIgc2NvcmVFbCA9IHRoaXNbJ3Njb3JlJyArIGkudG9VcHBlckNhc2UoKV0sXG4gICAgICAgICAgc2NvcmVWYWx1ZUVsID0gc2NvcmVFbC5wYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3IoJy5zY29yZS12YWx1ZScpLFxuICAgICAgICAgIHNjb3JlID0gUS5zdGF0ZS5nZXQoJ3Njb3JlLScgKyBpKSB8fCAwXG4gICAgICBzY29yZUVsLmNsYXNzTmFtZSA9IHNjb3JlRWwuY2xhc3NOYW1lLnJlcGxhY2UoL3Njb3JlLVxcZC9nLCAnJylcbiAgICAgIHNjb3JlRWwuY2xhc3NMaXN0LmFkZCgnc2NvcmUtJyArIHNjb3JlKVxuICAgICAgc2NvcmVWYWx1ZUVsLmlubmVySFRNTCA9IFEuc3RhdGUuZ2V0KCd0b3RhbC1zY29yZS0nICsgaSlcbiAgICB9LCB0aGlzKSlcbiAgfSxcblxuICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgUS5zdGF0ZS5zZXQoeyBcbiAgICAgICdzY29yZS1hJzogMCwgJ3Njb3JlLWInOiAwLCAnc2NvcmUtYyc6IDBcbiAgICB9KTtcbiAgICBRLnN0YXRlLm9uKFwiY2hhbmdlXCIsIHRoaXMsICdyZWZyZXNoJylcbiAgICB0aGlzLnJlZnJlc2goKVxuICB9XG59KVxuIiwidmFyIFEgPSByZXF1aXJlKCcuL1EnKVxuXG5RLmFuaW1hdGlvbnMoJ2p1ZGdlJywge1xuICBzdGFuZDogeyBmcmFtZXM6IFswLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDAsMCwwLDEzXSwgbG9vcDogdHJ1ZSwgcmF0ZTogMS8xMCB9LFxuICB3YWxrOiB7IGZyYW1lczogXy5yYW5nZSgxMSksIGxvb3A6IHRydWUsIHJhdGU6IDEvMjAgfSxcbiAgdGFsazogeyBmcmFtZXM6IFsxMCwxMSwxMiwxMV0sIGxvb3A6IHRydWUsIHJhdGU6IDEvMTAgIH1cbn0pXG5cblEuTW92aW5nU3ByaXRlLmV4dGVuZChcIkp1ZGdlXCIsIHtcbiAgXG4gIGluaXQ6IGZ1bmN0aW9uKHApIHtcbiAgICB0aGlzLl9zdXBlcihwLCB7IFxuICAgICAgc3ByaXRlOiBcImp1ZGdlXCIsXG4gICAgICBzaGVldDogXCJqdWRnZVwiLFxuICAgICAgc2Vuc29yOiB0cnVlLFxuICAgICAgY3g6IDE0LFxuICAgICAgc2NhbGU6IC44XG4gICAgfSk7XG4gICAgdGhpcy5hZGQoJzJkLCBhbmltYXRpb24nKTtcbiAgICB0aGlzLnN0YW5kKClcblxuICAgIHRoaXMub24oJ3NheU5leHQnLCB0aGlzLCAnc2F5TmV4dCcpXG4gICAgdGhpcy5vbignZGVzdHJveWVkJywgdGhpcywgJ2Rlc3QnKVxuICAgIFxuICAgIHRoaXMudGV4dEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICB0aGlzLnRleHRFbC5jbGFzc05hbWUgPSAnanVkZ2VtZW50J1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy50ZXh0RWwpXG5cbiAgICBRLnN0YXRlLm9uKFwiY2hhbmdlXCIsIHRoaXMsICdqdWRnZScpXG4gIH0sXG5cbiAgZW50ZXI6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC52eCA9IDMwKjJcbiAgICB0aGlzLnAuZmxpcCA9IFwiXCJcbiAgICB0aGlzLnBsYXkoJ3dhbGsnLCAxKVxuICAgIHRoaXMub24oJ3N0ZXAnLCB0aGlzLCAnZW50ZXJFbmQnKVxuICB9LFxuXG4gIGVudGVyRW5kOiBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLnAueCA+IDE1MCkge1xuICAgICAgdGhpcy5wLnZ4ID0gMFxuICAgICAgdGhpcy5vZmYoJ3N0ZXAnLCB0aGlzLCAnZW50ZXJFbmQnKVxuICAgICAgdGhpcy50cmlnZ2VyKCdlbnRlckVuZCcpXG4gICAgfVxuICB9LFxuXG4gIHVzaGlybzogZnVuY3Rpb24oKSB7XG4gICAgaWYodGhpcy5wLmZsaXApIHtcbiAgICAgIHRoaXMucC5mbGlwID0gXCJcIlxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnAuZmxpcCA9IFwieFwiXG4gICAgfVxuICB9LFxuXG4gIGV4aXQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC52eCA9IC0zMCoyXG4gICAgdGhpcy5wLmZsaXAgPSBcInhcIlxuICAgIHRoaXMucGxheSgnd2FsaycsIDEpXG4gICAgdGhpcy5vbignc3RlcCcsIHRoaXMsICdleGl0RW5kJylcbiAgfSxcblxuICBleGl0RW5kOiBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLnAueCA8IDM4KSB7XG4gICAgICB0aGlzLnAudnggPSAwXG4gICAgICB0aGlzLm9mZignc3RlcCcsIHRoaXMsICdleGl0RW5kJylcbiAgICAgIHRoaXMudHJpZ2dlcignZXhpdEVuZCcpXG4gICAgICB0aGlzLnN0YW5kKClcbiAgICB9XG4gIH0sXG5cbiAgc3RhbmQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC5mbGlwID0gXCJcIlxuICAgIHRoaXMucC5jeCA9IDE0KjJcbiAgICB0aGlzLnBsYXkoJ3N0YW5kJywgMSlcbiAgICB0aGlzLm9mZignZW50ZXJFbmQnLCB0aGlzLCAndGFsaycpXG4gICAgdGhpcy5vZmYoJ3RhbGtFbmQnLCB0aGlzLCAnZXhpdCcpXG4gICAgdGhpcy5vZmYoJ2V4aXRFbmQnLCB0aGlzLCAnc3RhbmQnKVxuICAgIHRoaXMudHJpZ2dlcignc3RhbmQnKVxuICB9LFxuXG4gIHNheU5leHQ6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjaG9pY2VzID0gW1wiXCJdLFxuICAgICAgICB0ZXh0cyA9IHtcbiAgICAgICAgICB3aW5uZXI6IFtbXCJUaGUgd2lubmVyIGlzIHtjb2xvcn0uXCIsIFwie2NvbG9yfSB3aW5zIHRoZSByb3VuZC5cIl1dLFxuICAgICAgICAgIHNlY29uZDogW1tcIntjb2xvcn0gaXMgc2Vjb25kLlwiLCBcIntjb2xvcn0gY29tZXMgaW4gc2Vjb25kLlwiXV0sXG4gICAgICAgICAgbG9zZXI6IFtcbiAgICAgICAgICAgIFsne2NvbG9yfSwgeW91IHItcmF0ZWQtd29yZC1pLXNob3VsZFxcJ3Qgc2F5LicsICd7Y29sb3J9Li4uIHJlYWxseT8nLCAnanVzdC4uLiBqdXN0IGRvblxcJ3QsIHtjb2xvcn0uJ10sXG4gICAgICAgICAgICBbJ3tjb2xvcn0sIHlvdSBjYW4gc3RvcCBub3cuJywgJ3tjb2xvcn0sIHlvdSBjYW4gZG8gYmV0dGVyLicsICdDXFwnbW9uIHtjb2xvcn0nXSxcbiAgICAgICAgICAgIFsne2NvbG9yfSwgYWxtb3N0IHRoZXJlLicsICdtYXliZSBuZXh0IHRpbWUgdHJ5IHRvIGRvIGJldHRlciB7Y29sb3J9LiddLFxuICAgICAgICAgICAgWydUb3VnaCBsdWNrIHtjb2xvcn0uJ11cbiAgICAgICAgICBdXG4gICAgICAgIH1cblxuICAgIGlmICh0aGlzLnAuc2FpZCA9PT0gMCkgY2hvaWNlcyA9IHRleHRzLndpbm5lcjtcbiAgICBlbHNlIHtcbiAgICAgIGlmICh0aGlzLnAuc2FpZCA9PSB0aGlzLnN0YWdlLmxpc3RzLnBsYXllcnMubGVuZ3RoLTEpIGNob2ljZXMgPSB0ZXh0cy5sb3NlcjtcbiAgICAgIGVsc2UgY2hvaWNlcyA9IHRleHRzLnNlY29uZDtcbiAgICB9XG5cbiAgICB2YXIgc2NvcmUgPSB0aGlzLnAucmVzdWx0W3RoaXMucC5zYWlkXS5zY29yZSxcbiAgICAgICAgY29sb3IgPSB0aGlzLnAucmVzdWx0W3RoaXMucC5zYWlkXS5jb2xvcixcbiAgICAgICAgc2NvcmVUZXh0cyA9IGNob2ljZXNbc2NvcmUgJSBjaG9pY2VzLmxlbmd0aF0sXG4gICAgICAgIHQgPSBfLnNhbXBsZShzY29yZVRleHRzKVxuICAgIHRoaXMudGV4dEVsLmlubmVySFRNTCA9IHQucmVwbGFjZSgne2NvbG9yfScsIGNvbG9yKVxuXG4gICAgdGhpcy5wLnNhaWQgKz0gMVxuICAgIGlmKHRoaXMucC5zYWlkID49IHRoaXMuc3RhZ2UubGlzdHMucGxheWVycy5sZW5ndGgpIHtcbiAgICAgIHRoaXMucC5kID0gc2V0VGltZW91dChfLmJpbmQodGhpcy50YWxrRW5kLCB0aGlzKSwgMjAwMClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wLmQgPSBzZXRUaW1lb3V0KF8uYmluZCh0aGlzLnRyaWdnZXIsIHRoaXMsICdzYXlOZXh0JyksIDIwMDApXG4gICAgfVxuICB9LFxuXG4gIHRhbGs6IGZ1bmN0aW9uKCkge1xuICAgIGNsZWFyVGltZW91dCh0aGlzLnAuZClcbiAgICB0aGlzLnBsYXkoJ3RhbGsnLCAxKVxuICAgIHRoaXMucC5zYWlkID0gMFxuICAgIHRoaXMuc2F5TmV4dCgpXG4gIH0sXG5cbiAgdGFsa0VuZDogZnVuY3Rpb24oKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMucC5kKVxuICAgIHRoaXMucC5zYWlkID0gMFxuICAgIHRoaXMudGV4dEVsLmlubmVySFRNTCA9IFwiXCJcbiAgICB0aGlzLmV4aXQoKVxuICAgIHRoaXMudHJpZ2dlcigndGFsa0VuZCcpXG4gIH0sXG5cbiAganVkZ2U6IGZ1bmN0aW9uKCkge1xuICAgIC8vIGlmKHRoaXMucC5hbmltYXRpb24gIT0gJ3N0YW5kJykgcmV0dXJuO1xuICAgIHRoaXMucC5yZXN1bHQgPSBfLnNvcnRCeSh0aGlzLnN0YWdlLmxpc3RzLnBsYXllcnMubWFwKGZ1bmN0aW9uKHApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGk6IHAucC5pLCBcbiAgICAgICAgc2NvcmU6IFEuc3RhdGUuZ2V0KCdzY29yZS0nICsgcC5wLmkpLCBcbiAgICAgICAgY29sb3I6IHthOiAnb3JhbmdlJywgYjogJ2JsdWUnLCBjOiAnZ3JlZW4nfVtwLnAuaV1cbiAgICAgIH1cbiAgICB9KSwgJ3Njb3JlJykucmV2ZXJzZSgpXG4gICAgaWYodGhpcy5wLnJlc3VsdFswXS5zY29yZSA9PT0gNCkge1xuICAgICAgdGhpcy5lbnRlcigpXG4gICAgICB0aGlzLm9uKCdlbnRlckVuZCcsIHRoaXMsICd0YWxrJylcbiAgICAgIHRoaXMub24oJ3RhbGtFbmQnLCB0aGlzLCAnZXhpdCcpXG4gICAgICB0aGlzLm9uKCdleGl0RW5kJywgdGhpcywgJ3N0YW5kJylcbiAgICB9XG4gIH0sXG5cbiAgZGVzdDogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy50ZXh0RWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLnRleHRFbClcbiAgICB0aGlzLm9mZignZW50ZXJFbmQnLCB0aGlzLCAndGFsaycpXG4gICAgdGhpcy5vZmYoJ3RhbGtFbmQnLCB0aGlzLCAnZXhpdCcpXG4gICAgdGhpcy5vZmYoJ2V4aXRFbmQnLCB0aGlzLCAnc3RhbmQnKVxuICAgIGNsZWFyVGltZW91dCh0aGlzLnAuZClcbiAgfVxuXG59KVxuIiwidmFyIFEgPSByZXF1aXJlKCcuL1EnKSxcbiAgICBHZXJpTW9uID0gcmVxdWlyZSgnLi9HZXJpTW9uJylcblxuUS5HZXJpTW9uLmV4dGVuZChcIlBsYXllclwiLHtcbiAgaW5pdDogZnVuY3Rpb24ocCkge1xuICAgIHRoaXMuX3N1cGVyKHAsIHt9KTtcblxuICAgIHRoaXMucC5kaXJlY3Rpb24gPSAncmlnaHQnXG4gICAgXG4gICAgLy8gUS5pbnB1dC5vbihcImZpcmVcIiwgdGhpcywgJ2ZpcmUnKTtcbiAgICB0aGlzLm9uKFwicHJlc3RlcFwiLCB0aGlzLCAnYXR0YWNrJyk7XG4gICAgdGhpcy5vbihcInByZXN0ZXBcIiwgdGhpcywgJ3Vuc29rdScpO1xuICB9LFxuXG4gIGF0dGFjazogZnVuY3Rpb24oKSB7XG4gICAgaWYodGhpcy5wLnBhdXNlZCkgcmV0dXJuO1xuICAgIFxuICAgIGlmKCFRLmlucHV0cy5maXJlKSByZXR1cm5cblxuICAgIHZhciB0YXJnZXQsIHREaXN0ID0gSW5maW5pdHksIGRpc3Q7XG4gICAgZm9yKHZhciBpPTA7IGk8dGhpcy5zdGFnZS5saXN0cy5wbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZih0aGlzLnN0YWdlLmxpc3RzLnBsYXllcnNbaV0gIT0gdGhpcykge1xuICAgICAgICBkaXN0ID0gTWF0aC5hYnModGhpcy5wLnggLSB0aGlzLnN0YWdlLmxpc3RzLnBsYXllcnNbaV0ucC54KVxuICAgICAgICBpZihkaXN0IDwgdERpc3QpIHtcbiAgICAgICAgICB0YXJnZXQgPSB0aGlzLnN0YWdlLmxpc3RzLnBsYXllcnNbaV1cbiAgICAgICAgICB0RGlzdCA9IGRpc3RcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChRLmlucHV0cy51cCAmJiBRLmlucHV0c1t0aGlzLnAuZGlyZWN0aW9uXSkge1xuICAgICAgdGhpcy5mdWpvZ2VyaUZvcndhcmQodGFyZ2V0KVxuICAgIH1cblxuICAgIGlmIChRLmlucHV0cy51cCkge1xuICAgICAgdGhpcy5mdWpvZ2VyaSh0YXJnZXQpXG4gICAgfVxuXG4gICAgaWYgKFEuaW5wdXRzLmRvd24gJiYgUS5pbnB1dHNbdGhpcy5wLm9wcG9zaXRlRGlyZWN0aW9uXSkge1xuICAgICAgdGhpcy5oYW5nZXRzdWF0ZSh0YXJnZXQpXG4gICAgfVxuXG4gICAgaWYgKFEuaW5wdXRzLmRvd24gJiYgUS5pbnB1dHNbdGhpcy5wLmRpcmVjdGlvbl0pIHtcbiAgICAgIHRoaXMuc2VudGFpbm90c3VraSh0YXJnZXQpXG4gICAgfVxuXG4gICAgaWYgKFEuaW5wdXRzLmRvd24pIHtcbiAgICAgIHRoaXMubWFuamlnZXJpKHRhcmdldClcbiAgICB9XG5cbiAgICBpZiAoUS5pbnB1dHNbdGhpcy5wLmRpcmVjdGlvbl0pIHtcbiAgICAgIHRoaXMuc3VpaGVpZ2VyaSh0YXJnZXQpXG4gICAgfVxuXG4gICAgaWYgKFEuaW5wdXRzW3RoaXMucC5vcHBvc2l0ZURpcmVjdGlvbl0pIHtcbiAgICAgIHRoaXMuc2Vuc29nZXJpKHRhcmdldClcbiAgICB9XG5cbiAgfSxcblxuICB1bnNva3U6IGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMucC5wYXVzZWQpIHJldHVybjtcblxuICAgIGlmKFEuaW5wdXRzLmZpcmUpIHJldHVyblxuXG4gICAgaWYoUS5pbnB1dHMuYWN0aW9uKSB7XG4gICAgXG4gICAgICB0aGlzLnVzaGlybygpXG4gICAgXG4gICAgfSBlbHNlIHtcblxuICAgICAgaWYoUS5pbnB1dHMudXApIHtcbiAgICAgICAgdGhpcy5rb3Nva3UoKVxuICAgICAgfVxuXG4gICAgICBpZihRLmlucHV0cy5kb3duKSB7XG4gICAgICAgIHRoaXMuZ2Vuc29rdSgpIFxuICAgICAgfVxuXG4gICAgICAvL2ZvcndhcmRcbiAgICAgIGlmKFEuaW5wdXRzW3RoaXMucC5kaXJlY3Rpb25dKSB7XG4gICAgICAgIHRoaXMubmlub2FzaGkoKSBcbiAgICAgICAgaWYodGhpcy5wLmFuaW1hdGlvbiA9PT0gJ25pbm9hc2hpJyAmJiB0aGlzLnAuYW5pbWF0aW9uRnJhbWUgPiAxKSB7XG4gICAgICAgICAgdGhpcy5zdGFuZCgpXG4gICAgICAgICAgdGhpcy50c3Vpc29rdSgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIC8vYmFja3dhcmRcbiAgICAgIGlmKFEuaW5wdXRzW3RoaXMucC5kaXJlY3Rpb24gPT09ICdsZWZ0JyA/ICdyaWdodCcgOiAnbGVmdCddKSB7XG4gICAgICAgIHRoaXMudGFpc29rdSgpXG4gICAgICB9XG5cbiAgICB9XG5cbiAgICBcbiAgfVxuXG59KTtcbiIsIlxudmFyIFEgPSBRdWludHVzKHsgaW1hZ2VQYXRoOiAnLi8nLCBhdWRpb1BhdGg6ICcuLycsIGF1ZGlvU3VwcG9ydGVkOiBbICdtcDMnIF0gfSlcbiAgLmluY2x1ZGUoXCJBdWRpbywgU3ByaXRlcywgU2NlbmVzLCBJbnB1dCwgMkQsIEFuaW1cIilcbiAgLmVuYWJsZVNvdW5kKClcbiAgLnNldHVwKHsgbWF4aW1pemU6IHRydWUgfSlcbiAgLmNvbnRyb2xzKClcblxuUS5pbnB1dC5kaXNhYmxlVG91Y2hDb250cm9scygpXG5cblEuRXZlbnRlZC5wcm90b3R5cGUuX3RyaWdnZXIgPSBRLkV2ZW50ZWQucHJvdG90eXBlLnRyaWdnZXJcblEuRXZlbnRlZC5wcm90b3R5cGUudHJpZ2dlciAgPSBmdW5jdGlvbihldmVudCxkYXRhKSB7XG4gIC8vIEZpcnN0IG1ha2Ugc3VyZSB0aGVyZSBhcmUgYW55IGxpc3RlbmVycywgdGhlbiBjaGVjayBmb3IgYW55IGxpc3RlbmVyc1xuICAvLyBvbiB0aGlzIHNwZWNpZmljIGV2ZW50LCBpZiBub3QsIGVhcmx5IG91dC5cbiAgaWYodGhpcy5saXN0ZW5lcnMgJiYgdGhpcy5saXN0ZW5lcnNbZXZlbnRdKSB7XG4gICAgLy8gQ2FsbCBlYWNoIGxpc3RlbmVyIGluIHRoZSBjb250ZXh0IG9mIGVpdGhlciB0aGUgdGFyZ2V0IHBhc3NlZCBpbnRvXG4gICAgLy8gYG9uYCBvciB0aGUgb2JqZWN0IGl0c2VsZi5cbiAgICB2YXIgaSwgbCA9IG5ldyBBcnJheSh0aGlzLmxpc3RlbmVyc1tldmVudF0ubGVuZ3RoKSwgbGVuXG4gICAgZm9yKGk9MCxsZW4gPSB0aGlzLmxpc3RlbmVyc1tldmVudF0ubGVuZ3RoO2k8bGVuO2krKykge1xuICAgICAgbFtpXSA9IFtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnNbZXZlbnRdW2ldWzBdLCBcbiAgICAgICAgdGhpcy5saXN0ZW5lcnNbZXZlbnRdW2ldWzFdXG4gICAgICBdXG4gICAgfVxuICAgIGZvcihpPTAsbGVuID0gbC5sZW5ndGg7aTxsZW47aSsrKSB7XG4gICAgICB2YXIgbGlzdGVuZXIgPSBsW2ldO1xuICAgICAgbGlzdGVuZXJbMV0uY2FsbChsaXN0ZW5lclswXSxkYXRhKTtcbiAgICB9XG4gIH1cbn1cblxud2luZG93LlEgPSBRXG5cbm1vZHVsZS5leHBvcnRzID0gUVxuIiwidmFyIFEgPSByZXF1aXJlKCcuL1EnKVxuXG5RLkdhbWVPYmplY3QuZXh0ZW5kKFwiU2NvcmVCb2FyZFwiLHtcblxuICBpbml0OiBfLm9uY2UoZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zY29yZXMgPSBbXVxuICAgIHRoaXMuZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NvcmVib2FyZCcpXG4gICAgdGhpcy5sb2FkKClcbiAgICB0aGlzLnJlZnJlc2goKVxuXG4gICAgUS5zdGF0ZS5vbignY2hhbmdlLnJvdW5kJywgdGhpcywgJ3JlZnJlc2gnKVxuICB9KSxcblxuICBsb2FkOiBmdW5jdGlvbigpIHtcbiAgICBpZighbG9jYWxTdG9yYWdlKSByZXR1cm47XG4gICAgdGhpcy5zY29yZXMgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdzY29yZWJvYXJkJykpIHx8IFtdXG4gIH0sXG5cbiAgc2F2ZTogZnVuY3Rpb24oKSB7XG4gICAgaWYoIWxvY2FsU3RvcmFnZSkgcmV0dXJuO1xuICAgIHZhciBkID0gbmV3IERhdGUoKVxuICAgIHRoaXMuc2NvcmVzLnB1c2goe1xuICAgICAgc3RhZ2U6IFEuc3RhZ2UoMSkuc2NlbmUubmFtZS5yZXBsYWNlKCdwbGF5LScsICcnKSxcbiAgICAgIHZhbHVlOiBRLnN0YXRlLmdldCgndG90YWwtc2NvcmUtYScpLFxuICAgICAgZGF0ZTogW1tkLmdldERhdGUoKSwgZC5nZXRNb250aCgpKzEsIGQuZ2V0RnVsbFllYXIoKV0uam9pbignLicpLFxuICAgICAgICAgICAgIFtkLmdldEhvdXJzKCksIGQuZ2V0TWludXRlcygpXS5qb2luKCc6JyldXG4gICAgICAgICAgICAgLmpvaW4oJyAnKVxuICAgIH0pXG4gICAgdGhpcy5zY29yZXMgPSBfLnNvcnRCeSh0aGlzLnNjb3JlcywgJ3ZhbHVlJykucmV2ZXJzZSgpLnNsaWNlKDAsMTApXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3Njb3JlYm9hcmQnLCBKU09OLnN0cmluZ2lmeSh0aGlzLnNjb3JlcykpXG4gIH0sXG5cbiAgcmVmcmVzaDogZnVuY3Rpb24oKSB7XG4gICAgd2hpbGUodGhpcy5lbC5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLmVsLmNoaWxkcmVuWzBdLnJlbW92ZSgpXG4gICAgfVxuICAgIHRoaXMuc2NvcmVzLmZvckVhY2goZnVuY3Rpb24oc2NvcmUpIHtcbiAgICAgIHZhciBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJylcbiAgICAgIGxpLmlubmVySFRNTCA9IFwiPGI+XCIgKyBzY29yZS52YWx1ZSArIFwiPC9iPiBcIiArIHNjb3JlLnN0YWdlICsgXCIgXCIgKyBzY29yZS5kYXRlXG4gICAgICB0aGlzLmVsLmFwcGVuZENoaWxkKGxpKVxuICAgIH0uYmluZCh0aGlzKSlcbiAgfSxcblxuICBzaG93OiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmVsLmNsYXNzTGlzdC5hZGQoJ29wZW4nKVxuICB9LFxuICBoaWRlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmVsLmNsYXNzTGlzdC5yZW1vdmUoJ29wZW4nKVxuICB9XG59KVxuIiwidmFyIFEgPSByZXF1aXJlKCcuL1EnKVxuXG5cblxuZnVuY3Rpb24gY29sbGlzaW9ucyhuYW1lLCBhc3NldCwgc2l6ZSkge1xuICBpZighUS5hc3NldChhc3NldCkpIHsgdGhyb3cgXCJJbnZhbGlkIEFzc2V0OlwiICsgYXNzZXQ7IH1cbiAgXG4gIGV4cG9ydHMuY29sbGlzaW9uc1tuYW1lXSA9IHsgaGVhZDogW10sIHRvcnNvOiBbXSwgaGl0OiBbXSB9XG5cbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLFxuICAgICAgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpLFxuICAgICAgaW1nID0gUS5hc3NldChhc3NldCksXG4gICAgICBpbWdEYXRhLFxuICAgICAgaGVhZCA9IDE1MCxcbiAgICAgIHRvcnNvID0gMjAwLFxuICAgICAgaGl0ID0gMTAwLFxuICAgICAgZmVhdGhlciA9IDRcblxuICBjYW52YXMud2lkdGggPSBpbWcud2lkdGhcbiAgY2FudmFzLmhlaWdodCA9IGltZy5oZWlnaHRcbiAgY29udGV4dC5kcmF3SW1hZ2UoaW1nLCAwLCAwKTtcblxuICBmdW5jdGlvbiBmaW5kIChpbWdEYXRhLCByY29sb3IpIHtcbiAgICB2YXIgbG9va3VwQ29sb3IgPSByY29sb3IgLSBmZWF0aGVyXG4gICAgdmFyIGEsIGIsIGMgPSB7fVxuICAgIHdoaWxlIChsb29rdXBDb2xvciA8IHJjb2xvciArIGZlYXRoZXIpIHtcbiAgICAgIGEgPSBBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGltZ0RhdGEuZGF0YSwgbG9va3VwQ29sb3IpIC8gNCxcbiAgICAgIGIgPSBBcnJheS5wcm90b3R5cGUubGFzdEluZGV4T2YuY2FsbChpbWdEYXRhLmRhdGEsIGxvb2t1cENvbG9yKSAvIDRcbiAgICAgIGxvb2t1cENvbG9yKytcbiAgICAgIGlmIChhID49IDApIHtcbiAgICAgICAgYy54ID0gYSAlIHNpemUudGlsZXdcbiAgICAgICAgYy55ID0gTWF0aC5mbG9vcihhIC8gc2l6ZS50aWxldylcbiAgICAgICAgYy53ID0gYiAlIHNpemUudGlsZXcgLSBjLnhcbiAgICAgICAgYy5oID0gTWF0aC5mbG9vcihiIC8gc2l6ZS50aWxldykgLSBjLnlcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNcbiAgfVxuXG4gIGZvcih2YXIgeCA9IDA7IHggPCBpbWcud2lkdGg7IHgrPXNpemUudGlsZXcpIHtcbiAgICBpbWdEYXRhID0gY29udGV4dC5nZXRJbWFnZURhdGEoeCwgMCwgc2l6ZS50aWxldywgc2l6ZS50aWxlaCk7XG4gICAgZXhwb3J0cy5jb2xsaXNpb25zW25hbWVdLmhlYWQucHVzaChmaW5kKGltZ0RhdGEsIGhlYWQpKVxuICAgIGV4cG9ydHMuY29sbGlzaW9uc1tuYW1lXS50b3Jzby5wdXNoKGZpbmQoaW1nRGF0YSwgdG9yc28pKVxuICAgIGV4cG9ydHMuY29sbGlzaW9uc1tuYW1lXS5oaXQucHVzaChmaW5kKGltZ0RhdGEsIGhpdCkpXG4gIH1cbiAgY29uc29sZS5sb2cobmFtZSwgZXhwb3J0cy5jb2xsaXNpb25zW25hbWVdLnRvcnNvKVxufVxuZXhwb3J0cy5jb2xsaXNpb25zID0ge31cblxuXG5cblxuZnVuY3Rpb24gY29sb3JpemUoYXNzZXQsIGNvbG9yKSB7XG4gIGlmKCFRLmFzc2V0KGFzc2V0KSkgeyB0aHJvdyBcIkludmFsaWQgQXNzZXQ6XCIgKyBhc3NldDsgfVxuXG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSxcbiAgICAgIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKSxcbiAgICAgIGltZyA9IFEuYXNzZXQoYXNzZXQpLFxuICAgICAgaW1nRGF0YSxcbiAgICAgIGNvbERhdGEsXG4gICAgICBjb2xJbWcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW1nXCIpO1xuICBcbiAgY2FudmFzLndpZHRoID0gaW1nLndpZHRoXG4gIGNhbnZhcy5oZWlnaHQgPSBpbWcuaGVpZ2h0XG4gIGNvbnRleHQuZHJhd0ltYWdlKGltZywgMCwgMCk7XG4gIGltZ0RhdGEgPSBjb250ZXh0LmdldEltYWdlRGF0YSgwLCAwLCBpbWcud2lkdGgsIGltZy5oZWlnaHQpXG4gIGNvbERhdGEgPSBjb250ZXh0LmNyZWF0ZUltYWdlRGF0YShpbWcud2lkdGgsIGltZy5oZWlnaHQpXG5cbiAgZnVuY3Rpb24gc2V0Q29sb3IoYywgZCwgaSkgeyBkW2krMF0gPSBjWzBdOyBkW2krMV0gPSBjWzFdOyBkW2krMl0gPSBjWzJdOyBkW2krM10gPSBjWzNdIH1cbiAgZnVuY3Rpb24gZ2V0Q29sb3IoZCwgaSkgeyByZXR1cm4gW2RbaSswXSwgZFtpKzFdLCBkW2krMl0sIGRbaSszXV0gfVxuICBmdW5jdGlvbiBwcmV2Q29sb3IoZCwgaSkgeyByZXR1cm4gW2RbaS00XSwgZFtpLTNdLCBkW2ktMl0sIGRbaS0xXV0gfVxuICBmdW5jdGlvbiBuZXh0Q29sb3IoZCwgaSkgeyByZXR1cm4gW2RbaSs0XSwgZFtpKzVdLCBkW2krNl0sIGRbaSs3XV0gfVxuICBmdW5jdGlvbiB0cmFuc3BhcmVudChjKSB7IHJldHVybiBjWzBdID09PSAwICYmIGNbMV0gPT09IDAgJiYgY1syXSA9PT0gMCAmJiBjWzNdID09PSAwIH1cbiAgZnVuY3Rpb24gZGFyazEoYykgeyByZXR1cm4gW2NbMF0gLSAgNSwgY1sxXSAtICA1LCBjWzJdIC0gIDUsIGNbM11dIH1cbiAgZnVuY3Rpb24gZGFyazIoYykgeyByZXR1cm4gW2NbMF0gLSAyMCwgY1sxXSAtIDIwLCBjWzJdIC0gMjAsIGNbM11dIH1cbiAgZnVuY3Rpb24gZGFyazMoYykgeyByZXR1cm4gW2NbMF0gLSA4MCwgY1sxXSAtIDgwLCBjWzJdIC0gODAsIGNbM11dIH1cbiAgZnVuY3Rpb24gbGlnaHRlbihjKSB7IHJldHVybiBbY1swXSArIDMwLCBjWzFdICsgMzAsIGNbMl0gKyAzMCwgY1szXV0gfVxuICBcbiAgZm9yICh2YXIgaT0wLCBjOyBpPGltZ0RhdGEuZGF0YS5sZW5ndGg7IGkrPTQpIHtcbiAgICBjID0gZ2V0Q29sb3IoaW1nRGF0YS5kYXRhLCBpKVxuICAgIHNldENvbG9yKGxpZ2h0ZW4oYyksIGNvbERhdGEuZGF0YSwgaSlcbiAgICBpZiAoIXRyYW5zcGFyZW50KGMpKSB7XG4gICAgICBpZiAodHJhbnNwYXJlbnQocHJldkNvbG9yKGltZ0RhdGEuZGF0YSwgaS00KSkpIHtcbiAgICAgICAgc2V0Q29sb3IoZGFyazIoYyksIGNvbERhdGEuZGF0YSwgaSlcbiAgICAgIH1cbiAgICAgIGlmICh0cmFuc3BhcmVudChwcmV2Q29sb3IoaW1nRGF0YS5kYXRhLCBpKSkpIHtcbiAgICAgICAgc2V0Q29sb3IoZGFyazMoZGFyazMoY29sb3IpKSwgY29sRGF0YS5kYXRhLCBpKVxuICAgICAgfVxuICAgICAgLy8gaWYgKHRyYW5zcGFyZW50KGdldENvbG9yKGltZ0RhdGEuZGF0YSwgaSs0KjIpKSkge1xuICAgICAgLy8gICBzZXRDb2xvcihkYXJrMihkYXJrMyhjb2xvcikpLCBjb2xEYXRhLmRhdGEsIGkpXG4gICAgICAvLyB9XG4gICAgICBpZiAodHJhbnNwYXJlbnQoZ2V0Q29sb3IoaW1nRGF0YS5kYXRhLCBpKzQpKSkge1xuICAgICAgICBzZXRDb2xvcihjb2xvciwgY29sRGF0YS5kYXRhLCBpKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnRleHQucHV0SW1hZ2VEYXRhKGNvbERhdGEsIDAsIDApO1xuICBjb2xJbWcuc3JjID0gY2FudmFzLnRvRGF0YVVSTChcImltYWdlL3BuZ1wiKTtcbiAgcmV0dXJuIGNvbEltZ1xufVxuXG5cbmV4cG9ydHMubG9hZCA9IGZ1bmN0aW9uKGNiKSB7XG5cbiAgdmFyIHBsYXllckFzc2V0cyA9IFtcbiAgICBcInN1aWhlaWdlcmlcIixcbiAgICBcIm1hbmppZ2VyaVwiLFxuICAgIFwidHN1aXNva3VcIixcbiAgICBcInVzaGlyb1wiLFxuICAgIFwia29zb2t1XCIsXG4gICAgXCJuaW5vYXNoaVwiLFxuICAgIFwiZnVqb2dlcmlcIixcbiAgICBcInNlbnNvZ2VyaVwiLFxuICAgIFwic2VudGFpbm90c3VraVwiLFxuICAgIFwiaGFuZ2V0c3VhdGVcIixcbiAgICBcInRvcnNvLWhpdFwiLFxuICAgIFwiaGVhZG9mZi1oaXRcIl1cblxuICBRLmxvYWQoXG4gICAgXy5mbGF0dGVuKFtcbiAgICBcbiAgICAgIFtcImFzc2V0cy9iZy0xLnBuZ1wiLFxuICAgICAgXCJhc3NldHMvdGlsZXMucG5nXCIsXG4gICAgICBcImFzc2V0cy9qdWRnZS5wbmdcIl0sXG5cbiAgICAgIF8ubWFwKHBsYXllckFzc2V0cywgZnVuY3Rpb24obmFtZSkge1xuICAgICAgICByZXR1cm4gXCJhc3NldHMvXCIgKyBuYW1lICsgXCIucG5nXCJcbiAgICAgIH0pLFxuXG4gICAgICBfLm1hcChfLndpdGhvdXQocGxheWVyQXNzZXRzLCBcInRvcnNvLWhpdFwiLCBcImhlYWRvZmYtaGl0XCIpLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHJldHVybiBcImFzc2V0cy9cIiArIG5hbWUgKyBcIi1jb2xsaXNpb25zLnBuZ1wiXG4gICAgICB9KSxcblxuICAgICAgW1xuICAgICAgXCJhc3NldHMvYmctbG9vcC5tcDNcIiwgXG4gICAgICBcImFzc2V0cy9ib3VuY2UubXAzXCIsXG4gICAgICBcImFzc2V0cy9oZWFkLW9mZi0xLm1wM1wiLFxuICAgICAgXCJhc3NldHMvaGVhZC1vZmYtMi5tcDNcIixcbiAgICAgIFwiYXNzZXRzL2hlYWQtb2ZmLTMubXAzXCIsXG4gICAgICBcImFzc2V0cy9oaXQtMS5tcDNcIixcbiAgICAgIFwiYXNzZXRzL2hpdC0yLm1wM1wiLFxuICAgICAgXCJhc3NldHMvaGl0LTMubXAzXCIsXG4gICAgICBcImFzc2V0cy9oaXQtNC5tcDNcIixcbiAgICAgIFwiYXNzZXRzL2h1cnQtMS5tcDNcIixcbiAgICAgIFwiYXNzZXRzL2h1cnQtMi5tcDNcIixcbiAgICAgIFwiYXNzZXRzL2h1cnQtMy5tcDNcIixcbiAgICAgIFwiYXNzZXRzL21pc3MtMS5tcDNcIixcbiAgICAgIFwiYXNzZXRzL21pc3MtMi5tcDNcIlxuICAgICAgXVxuXG4gICAgXSksIGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHBsYXllclRpbGUgPSB7IHRpbGV3OiA0OCoyLCB0aWxlaDogMzIqMiB9XG4gICAgUS5zaGVldChcInRpbGVzXCIsXCJhc3NldHMvdGlsZXMucG5nXCIsIHsgdGlsZXc6IDMyLCB0aWxlaDogOCB9KTtcbiAgICBRLnNoZWV0KFwianVkZ2VcIiwgXCJhc3NldHMvanVkZ2UucG5nXCIsIHt0aWxldzogMzIqMiwgdGlsZWg6IDMyKjJ9KTtcblxuICAgIF8uZWFjaChwbGF5ZXJBc3NldHMsIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIFEuYXNzZXRzW1wiYXNzZXRzL1wiICsgbmFtZSArIFwiLWEucG5nXCJdID0gY29sb3JpemUoXCJhc3NldHMvXCIgKyBuYW1lICsgXCIucG5nXCIsIFsyNDAsIDEyMSwgMCwgMjU1XSk7XG4gICAgICBRLmFzc2V0c1tcImFzc2V0cy9cIiArIG5hbWUgKyBcIi1iLnBuZ1wiXSA9IGNvbG9yaXplKFwiYXNzZXRzL1wiICsgbmFtZSArIFwiLnBuZ1wiLCBbMTAyLCAxNTMsIDI1NSwgMjU1XSk7XG4gICAgICBRLmFzc2V0c1tcImFzc2V0cy9cIiArIG5hbWUgKyBcIi1jLnBuZ1wiXSA9IGNvbG9yaXplKFwiYXNzZXRzL1wiICsgbmFtZSArIFwiLnBuZ1wiLCBbNjgsIDIyMSwgODUsIDI1NV0pO1xuICAgICAgUS5zaGVldChuYW1lICsgJy1hJywgXCJhc3NldHMvXCIgKyBuYW1lICsgXCItYS5wbmdcIiwgcGxheWVyVGlsZSk7XG4gICAgICBRLnNoZWV0KG5hbWUgKyAnLWInLCBcImFzc2V0cy9cIiArIG5hbWUgKyBcIi1iLnBuZ1wiLCBwbGF5ZXJUaWxlKTtcbiAgICAgIFEuc2hlZXQobmFtZSArICctYycsIFwiYXNzZXRzL1wiICsgbmFtZSArIFwiLWMucG5nXCIsIHBsYXllclRpbGUpO1xuICAgIH0pXG5cbiAgICBfLmVhY2goXy53aXRob3V0KHBsYXllckFzc2V0cywgXCJ0b3Jzby1oaXRcIiwgXCJoZWFkb2ZmLWhpdFwiKSwgZnVuY3Rpb24obmFtZSkge1xuICAgICAgY29sbGlzaW9ucyhuYW1lLCBcImFzc2V0cy9cIiArIG5hbWUgKyBcIi1jb2xsaXNpb25zLnBuZ1wiLCBwbGF5ZXJUaWxlKVxuICAgIH0pXG5cbiAgICBleHBvcnRzLmNvbGxpc2lvbnMuc3RhbmQgPSB7XG4gICAgICBoZWFkOiBbZXhwb3J0cy5jb2xsaXNpb25zLnRzdWlzb2t1LmhlYWRbMF1dLFxuICAgICAgdG9yc286IFtleHBvcnRzLmNvbGxpc2lvbnMudHN1aXNva3UudG9yc29bMF1dLFxuICAgICAgaGl0OiBbZXhwb3J0cy5jb2xsaXNpb25zLnRzdWlzb2t1LmhpdFswXV1cbiAgICB9XG4gICAgZXhwb3J0cy5jb2xsaXNpb25zLnRhaXNva3UgPSB7XG4gICAgICBoZWFkOiBbXS5jb25jYXQoZXhwb3J0cy5jb2xsaXNpb25zLnRzdWlzb2t1LmhlYWQpLnJldmVyc2UoKSxcbiAgICAgIHRvcnNvOiBbXS5jb25jYXQoZXhwb3J0cy5jb2xsaXNpb25zLnRzdWlzb2t1LnRvcnNvKS5yZXZlcnNlKCksXG4gICAgICBoaXQ6IFtdLmNvbmNhdChleHBvcnRzLmNvbGxpc2lvbnMudHN1aXNva3UuaGl0KS5yZXZlcnNlKClcbiAgICB9XG5cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9hZGVyJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcblxuICAgIGNiKClcblxuICAgIFEubG9hZChbXCJhc3NldHMvaXQrLm1wM1wiXSlcbiAgICAgIFxuICB9KTtcblxufVxuIiwidmFyIFEgPSByZXF1aXJlKCcuL1EnKVxuXG52YXIgbXV0ZSA9IGZhbHNlLFxuICAgIG11c2ljID0gXCJcIjtcblxuZXhwb3J0cy5tdXNpYyA9IGZ1bmN0aW9uKGFzc2V0KSB7XG4gIGlmKG11dGUpIHJldHVybjtcbiAgaWYoUS5hc3NldHNbYXNzZXRdICYmIGFzc2V0ICE9IG11c2ljKSB7XG4gICAgdHJ5eyBRLmF1ZGlvLnN0b3AobXVzaWMpIH0gY2F0Y2ggKGUpe31cbiAgICBRLmF1ZGlvLnBsYXkoYXNzZXQsIHtsb29wOiB0cnVlfSk7XG4gICAgbXVzaWMgPSBhc3NldFxuICB9XG59XG5cbmV4cG9ydHMucGxheSA9IGZ1bmN0aW9uKGFzc2V0KSB7XG4gIGlmKG11dGUpIHJldHVybjtcbiAgUS5hdWRpby5wbGF5KGFzc2V0KTtcbn1cblxuZXhwb3J0cy50b2dnbGVNdXRlID0gZnVuY3Rpb24oKSB7XG4gIG11dGUgPSAhbXV0ZTtcbiAgaWYobXV0ZSkgUS5hdWRpby5zdG9wKClcbn1cbiIsInZhciBRID0gcmVxdWlyZSgnLi9RJyksXG4gICAgYXNzZXRzID0gcmVxdWlyZSgnLi9hc3NldHMnKSxcbiAgICBhdWRpbyA9IHJlcXVpcmUoJy4vYXVkaW8nKVxucmVxdWlyZSgnLi9QbGF5ZXInKVxucmVxdWlyZSgnLi9BdXRvUGxheWVyJylcbnJlcXVpcmUoJy4vQW5pbVBsYXllcicpXG5yZXF1aXJlKCcuL0h1ZCcpXG5yZXF1aXJlKCcuL1Njb3JlQm9hcmQnKVxucmVxdWlyZSgnLi9KdWRnZScpXG5cbnZhciBsZXZlbCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFEuVGlsZUxheWVyKHtcbiAgIHRpbGVzOiBbXG4gICBuZXcgQXJyYXkoMjApLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gICBuZXcgQXJyYXkoMjApLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gICBuZXcgQXJyYXkoMjApLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gICBuZXcgQXJyYXkoMjApLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gICBuZXcgQXJyYXkoMjApLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gICBuZXcgQXJyYXkoMjApLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gICBuZXcgQXJyYXkoMjApLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gICBuZXcgQXJyYXkoMjApLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gICBuZXcgQXJyYXkoMjApLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gICBuZXcgQXJyYXkoMjApLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gICBuZXcgQXJyYXkoMjApLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gICBuZXcgQXJyYXkoMjApLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gICBuZXcgQXJyYXkoMjApLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gICBuZXcgQXJyYXkoMjApLmpvaW4oJzEnKS5zcGxpdCgnJylcbiAgIF0sIHNoZWV0OiAndGlsZXMnIFxuICB9KVxufVxuXG5mdW5jdGlvbiBnYW1lTG9vcChzdGFnZSwganVkZ2UpIHtcbiAgXG4gIGZ1bmN0aW9uIHBhdXNlUGxheWVycygpIHtcbiAgICBpZihfLmNvbnRhaW5zKFtRLnN0YXRlLmdldCgnc2NvcmUtYScpLCBRLnN0YXRlLmdldCgnc2NvcmUtYicpLCBRLnN0YXRlLmdldCgnc2NvcmUtYycpXSwgNCkpIHtcbiAgICAgIF8uaW52b2tlKHN0YWdlLmxpc3RzLnBsYXllcnMsICdwYXVzZScpXG4gICAgfVxuICB9XG4gIFxuICBmdW5jdGlvbiBjbGVhbnVwKCkgeyBcbiAgICBqdWRnZSAmJiBqdWRnZS5kZXN0cm95KClcbiAgICBRLnN0YXRlLm9mZignY2hhbmdlJywgcGF1c2VQbGF5ZXJzKVxuICAgIF8uaW52b2tlKHN0YWdlLmxpc3RzLnBsYXllcnMsICdkZXN0cm95Jyk7XG4gICAgaHVkLnJlc2V0KClcbiAgfVxuICBcbiAgZnVuY3Rpb24gZW5kR2FtZSgpIHtcbiAgICBpZihRLnN0YWdlKDEpLnNjZW5lLm5hbWUgPT0gJ3BsYXktMW9uMScgfHwgUS5zdGFnZSgxKS5zY2VuZS5uYW1lID09ICdwbGF5LTFvbjInKSBzY29yZWJvYXJkLnNhdmUoKVxuICAgIFEuc3RhZ2VTY2VuZSgnYXV0b3BsYXknLCAxKVxuICAgIHNjb3JlYm9hcmQuc2hvdygpXG4gIH1cblxuICBmdW5jdGlvbiBuZXdHYW1lKCkge1xuICAgIGlmKFEuc3RhZ2UoMSkuc2NlbmUubmFtZSA9PSAncGxheS0xb24xJyB8fCBRLnN0YWdlKDEpLnNjZW5lLm5hbWUgPT0gJ3BsYXktMW9uMicpIHNjb3JlYm9hcmQuaGlkZSgpXG4gICAgUS5zdGF0ZS5zZXQoeyAndG90YWwtc2NvcmUtYSc6IDAsICd0b3RhbC1zY29yZS1iJzogMCwgJ3RvdGFsLXNjb3JlLWMnOiAwLCAncm91bmQnOiAwIH0pO1xuICAgIGF1ZGlvLm11c2ljKCdhc3NldHMvYmctbG9vcC5tcDMnKTtcbiAgICBuZXdSb3VuZCgpXG4gIH1cblxuICBmdW5jdGlvbiBuZXdSb3VuZCgpIHtcbiAgICBodWQucmVzZXQoKVxuICAgIHZhciBwbGF5ZXJzID0gc3RhZ2UubGlzdHMucGxheWVycztcbiAgICBbMTY0LCAzMTIsIDQxMl0uZm9yRWFjaChmdW5jdGlvbih4LCBpKSB7XG4gICAgICBwbGF5ZXJzW2ldICYmIHBsYXllcnNbaV0uc2V0KHt4OiB4LCB5OiAyNSoxNiwgdnk6IDB9KVxuICAgIH0pXG4gICAgUS5zdGF0ZS5pbmMoJ3JvdW5kJywgMSlcbiAgICBpZihRLnN0YXRlLmdldCgncm91bmQnKSA+IDEpIHtcbiAgICAgIGF1ZGlvLm11c2ljKCdhc3NldHMvaXQrLm1wMycpXG4gICAgfVxuICAgIF8uaW52b2tlKHN0YWdlLmxpc3RzLnBsYXllcnMsICd1bnBhdXNlJylcbiAgfVxuXG4gIGZ1bmN0aW9uIHJvdW5kRW5kKCkge1xuICAgIHZhciBzY29yZXMgPSBfLnNvcnRCeShzdGFnZS5saXN0cy5wbGF5ZXJzLm1hcChmdW5jdGlvbihwKSB7XG4gICAgICByZXR1cm4ge2k6IHAucC5pLCBzY29yZTogUS5zdGF0ZS5nZXQoJ3Njb3JlLScrIHAucC5pKX1cbiAgICB9KSwgJ3Njb3JlJylcbiAgICBpZihzY29yZXNbMF0uaSA9PT0gJ2EnICYmIHNjb3Jlc1swXS5zY29yZSA8IHNjb3Jlc1sxXS5zY29yZSkge1xuICAgICAgZW5kR2FtZSgpXG4gICAgfSBlbHNlIHtcbiAgICAgIG5ld1JvdW5kKClcbiAgICB9XG4gIH1cblxuICBzdGFnZS5vbignZGVzdHJveWVkJywgY2xlYW51cClcbiAgUS5zdGF0ZS5vbignY2hhbmdlJywgcGF1c2VQbGF5ZXJzKVxuICBqdWRnZS5vbigndGFsa0VuZCcsIHJvdW5kRW5kKVxuICBuZXdHYW1lKClcbn1cblxuUS5zY2VuZSgnYmcnLCBmdW5jdGlvbihzdGFnZSkge1xuICB2YXIgYmcgPSBzdGFnZS5pbnNlcnQobmV3IFEuU3ByaXRlKHtcbiAgICBhc3NldDogXCJhc3NldHMvYmctMS5wbmdcIixcbiAgICBzY2FsZTogNjA4LzkwMFxuICB9KSlcbiAgYmcuY2VudGVyKClcbiAgYmcucC55IC09IDUgKzY0XG4gIHN0YWdlLm9uKFwiZGVzdHJveVwiLGZ1bmN0aW9uKCkge1xuICAgIGp1ZGdlLmRlc3Ryb3koKVxuICB9KTtcbn0pXG5cblEuc2NlbmUoXCJhbmltc1wiLCBmdW5jdGlvbihzdGFnZSkge1xuICB2YXIgbGF5ZXIgPSBzdGFnZS5jb2xsaXNpb25MYXllcihsZXZlbCgpKTtcbiAgdmFyIHBsYXllcmEgPSBzdGFnZS5pbnNlcnQobmV3IFEuQW5pbVBsYXllcih7eDogNjQsIHk6IDI1KjE2fSkpXG4gIHN0YWdlLmFkZChcInZpZXdwb3J0XCIpXG4gIHN0YWdlLnZpZXdwb3J0LnNjYWxlID0gMVxuICBzdGFnZS52aWV3cG9ydC5jZW50ZXJPbihsYXllci5wLncvMiwgbGF5ZXIucC5oLzIrNjQpXG59KVxuXG5RLnNjZW5lKFwicGxheS0xb24xXCIsIGZ1bmN0aW9uKHN0YWdlKSB7XG4gIHZhciBsYXllciA9IHN0YWdlLmNvbGxpc2lvbkxheWVyKGxldmVsKCkpO1xuICBzdGFnZS5hZGRUb0xpc3QoJ3BsYXllcnMnLCBzdGFnZS5pbnNlcnQobmV3IFEuUGxheWVyKHtpOiAnYSd9KSkpXG4gIHN0YWdlLmFkZFRvTGlzdCgncGxheWVycycsIHN0YWdlLmluc2VydChuZXcgUS5BdXRvUGxheWVyKHtpOiAnYid9KSkpXG4gIHZhciBqdWRnZSA9IHN0YWdlLmluc2VydChuZXcgUS5KdWRnZSh7eDogMzgsIHk6IDI1KjE2fSkpXG4gIHN0YWdlLmFkZChcInZpZXdwb3J0XCIpXG4gIHN0YWdlLnZpZXdwb3J0LnNjYWxlID0gMVxuICBzdGFnZS52aWV3cG9ydC5jZW50ZXJPbihsYXllci5wLncvMiwgbGF5ZXIucC5oLzIrNjQpXG4gIGdhbWVMb29wKHN0YWdlLCBqdWRnZSlcbn0pXG5cblEuc2NlbmUoXCJwbGF5LTFvbjJcIiwgZnVuY3Rpb24oc3RhZ2UpIHtcbiAgdmFyIGxheWVyID0gc3RhZ2UuY29sbGlzaW9uTGF5ZXIobGV2ZWwoKSk7XG4gIHN0YWdlLmFkZFRvTGlzdCgncGxheWVycycsIHN0YWdlLmluc2VydChuZXcgUS5QbGF5ZXIoe2k6ICdhJ30pKSlcbiAgc3RhZ2UuYWRkVG9MaXN0KCdwbGF5ZXJzJywgc3RhZ2UuaW5zZXJ0KG5ldyBRLkF1dG9QbGF5ZXIoe2k6ICdiJ30pKSlcbiAgc3RhZ2UuYWRkVG9MaXN0KCdwbGF5ZXJzJywgc3RhZ2UuaW5zZXJ0KG5ldyBRLkF1dG9QbGF5ZXIoe2k6ICdjJ30pKSlcbiAgdmFyIGp1ZGdlID0gc3RhZ2UuaW5zZXJ0KG5ldyBRLkp1ZGdlKHt4OiAzOCwgeTogMjUqMTZ9KSlcbiAgc3RhZ2UuYWRkKFwidmlld3BvcnRcIilcbiAgc3RhZ2Uudmlld3BvcnQuc2NhbGUgPSAxXG4gIHN0YWdlLnZpZXdwb3J0LmNlbnRlck9uKGxheWVyLnAudy8yLCBsYXllci5wLmgvMis2NClcbiAgZ2FtZUxvb3Aoc3RhZ2UsIGp1ZGdlKVxufSlcblxuUS5zY2VuZShcImF1dG9wbGF5XCIsIGZ1bmN0aW9uKHN0YWdlKSB7XG4gIHZhciBsYXllciA9IHN0YWdlLmNvbGxpc2lvbkxheWVyKGxldmVsKCkpO1xuICBzdGFnZS5hZGRUb0xpc3QoJ3BsYXllcnMnLCBzdGFnZS5pbnNlcnQobmV3IFEuQXV0b1BsYXllcih7aTogJ2EnfSkpKVxuICBzdGFnZS5hZGRUb0xpc3QoJ3BsYXllcnMnLCBzdGFnZS5pbnNlcnQobmV3IFEuQXV0b1BsYXllcih7aTogJ2InfSkpKVxuICBzdGFnZS5hZGRUb0xpc3QoJ3BsYXllcnMnLCBzdGFnZS5pbnNlcnQobmV3IFEuQXV0b1BsYXllcih7aTogJ2MnfSkpKVxuICB2YXIganVkZ2UgPSBzdGFnZS5pbnNlcnQobmV3IFEuSnVkZ2Uoe3g6IDM4LCB5OiAyNSoxNn0pKVxuICBzdGFnZS5hZGQoXCJ2aWV3cG9ydFwiKVxuICBzdGFnZS52aWV3cG9ydC5zY2FsZSA9IDFcbiAgc3RhZ2Uudmlld3BvcnQuY2VudGVyT24obGF5ZXIucC53LzIsIGxheWVyLnAuaC8yKzY0KVxuICBnYW1lTG9vcChzdGFnZSwganVkZ2UpXG59KVxuXG52YXIgaHVkLFxuICAgIHNjb3JlYm9hcmRcbmFzc2V0cy5sb2FkKGZ1bmN0aW9uKCkge1xuICBodWQgPSBuZXcgUS5IdWQoKVxuICBodWQuaW5pdCgpXG4gIHNjb3JlYm9hcmQgPSBuZXcgUS5TY29yZUJvYXJkKClcbiAgc2NvcmVib2FyZC5pbml0KClcbiAgUS5zdGFnZVNjZW5lKFwiYmdcIiwgMCk7XG4gIFEuc3RhZ2VTY2VuZShcImF1dG9wbGF5XCIsIDEpO1xuICBRLnN0YXRlLnNldCgnbm9tdXNpYycsIGZhbHNlKVxuICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24oZSkge1xuICAgIGlmKGUua2V5Q29kZSA9PSA0OSkge1xuICAgICAgUS5jbGVhclN0YWdlKDEpXG4gICAgICBRLnN0YWdlU2NlbmUoXCJwbGF5LTFvbjFcIiwgMSk7XG4gICAgfVxuICAgIGlmKGUua2V5Q29kZSA9PSA1MCkge1xuICAgICAgUS5jbGVhclN0YWdlKDEpXG4gICAgICBRLnN0YWdlU2NlbmUoXCJwbGF5LTFvbjJcIiwgMSk7XG4gICAgfVxuICAgIGlmKGUua2V5Q29kZSA9PSA3Nykge1xuICAgICAgYXVkaW8udG9nZ2xlTXV0ZSgpXG4gICAgfVxuICB9KVxufSlcbmNvbnNvbGUubG9nKFEpIl19
