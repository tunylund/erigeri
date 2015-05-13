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
    if(target.p.animationFrame > 2)
      return 'fujogeri'
  }
  if(target.p.animation === 'suiheigeri') {
    if(target.p.animationFrame > 2)
      return 'suiheigeri'
  }
  if(target.p.animation === 'manjigeri') {
    if(target.p.animationFrame > 2)
      return 'manjigeri'
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
    this.taisoku()
  },

  cancelAttack: function() {
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
      } else if (r > .5) {
        this.gensoku()
      } else {
        this.taisoku()
      }

    }
  },

  attack: function(target, attack) {
    this[_.sample(['suiheigeri', 'manjigeri', 'suiheigeri', 'manjigeri', 'fujogeri', 'fujogeriForward'])](target) 
  },

  lookAt: function(target) {
    var at = target.p.x < this.p.x ? 'left' : 'right'
    if(at != this.p.direction) this.ushiro()
  },

  step: function(t) {
    this._super.apply(this, arguments)
    
    var others = _.without(this.instances, this),
        target;
    
    if(others.length > 0) {
      target = _.sample(others)

      if(target) {

        this.lookAt(target)

        if(distance(target, this) < this.hitDistance /2) {
          this.moveFurther(target)
        }
        
        if(distance(target, this) > this.hitDistance) {
          this.moveCloser(target)
        }

        var spot = spotAttack(target)
        if(spot) {
          this.evade(target, spot)
        } else {
          if(distance(target, this) <= this.hitDistance) {
            this.attack(target)
          }
        }
      }
    }

  }

})
},{"./GeriMon":2,"./Q":4}],2:[function(require,module,exports){
var Q = require('./Q'),
    collisions = require('./assets').collisions

Q.animations('gerimon', {
  stand: { frames: [0] },
  fujogeri: { frames: _.range(15), rate: 1/10, loop: false, trigger: 'stand' },
  suiheigeri: { frames: _.range(15), rate: 1/10, loop: false, trigger: 'stand' },
  manjigeri: { frames: _.range(15), rate: 1/10, loop: false, trigger: 'stand' },
  tsuisoku: { frames: _.range(11), rate: 1/10, loop: false, trigger: 'stand' },
  kosoku: { frames: _.range(18), rate: 1/15, loop: false, trigger: 'stand' },
  ushiro: { frames: _.range(2,9), rate: 1/10, loop: false, trigger: 'stand' },
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
    if(!this.p.landed) return;
    if(this.p.hit) return;
    if(this.p.attacking) return;
    if(this.p.walking && this.p.animationFrame > 4) return;
    this.p.target = target
    this.p.attacking = true
    this.p.vx = 0
    fn.apply(this, arguments)
  }
}

function jump(fn) {
  return function() {
    if(this.p.hit) return;
    if(this.p.jumping) return;
    fn.apply(this, arguments)
  }
}

function walk(fn) {
  return function() {
    if(this.p.hit) return false;
    if(!this.p.landed) return false;
    if(this.p.attacking) return false;
    if(this.p.walking) return false;
    this.p.walking = true
    fn.apply(this, arguments)
    return true
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

  init: function(p) {
    var w = 22, h = 32
    this._super(p, { 
      sprite: "gerimon",
      sheet: "tsuisoku",
      dir: 1,
      w: w,
      h: h,
      sw: 48,
      sh: 32,
      sensor: true,
      points: [
        [-w/2, -h/2], 
        [ w/2, -h/2 ], 
        [ w/2,  h/2 ], 
        [-w/2,  h/2 ]],
      cx: 10
    });
    this.add('2d, animation');
    this.instances.push(this)
    
    this.on("stand", this, "stand");
    this.on("prestep", this, "prestep")
    this.on("bump.bottom", this, "land");
    // this.on("postdraw", this, "renderCollisions")

    this.stand()
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
    if(this.p.animationFrame === 6) {
      this.p.vx = this.p.dir * this.speed * 2/3
    }
  },

  fujogeriStep: function() {
    if(this.p.animationFrame === 5) {
      this.p.vy = -this.jumpSpeed
      this.p.landed = false
      this.p.jumping = true
    }
    var hit = this.hitTest(collisions.fujogeri.hit[this.p.animationFrame])
    if(hit) {
      this.p.target.hit(this.p.dir * 40, hit)
    }
  },

  manjigeri: attack(function() {
    this.sheet("manjigeri")
    this.play('manjigeri', 1)
    this.on('step', this, 'manjigeriStep')
  }),

  manjigeriStep: function() {
    var hit = this.hitTest(collisions.manjigeri.hit[this.p.animationFrame])
    if(hit) {
      this.p.target.hit(this.p.dir * 20, hit)
    }
  },

  suiheigeri: attack(function() {
    this.sheet("suiheigeri")
    this.play('suiheigeri', 1)
    this.on('step', this, 'suiheigeriStep')
  }),

  suiheigeriStep: function() {
    var hit = this.hitTest(collisions.suiheigeri.hit[this.p.animationFrame])
    if(hit) {
      this.p.target.hit(this.p.dir * 30, hit)
    }
  },
  
  ushiro: walk(function() {
    this.p.direction = this.p.direction === 'left' ? 'right' : 'left'
    this.sheet("tsuisoku")
    this.play('ushiro', 1)
  }),

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
    if(hit === 'head') {
      this.sheet("headoff-hit")
      this.play('headoffhit', 1)
      this.stage.insert(new Q.Head(this, force))
    } else {
      this.p.vx += force
      this.sheet("torso-hit")
      this.play('torsohit', 1)
    }
  },

  finishKicks: function() {
    this.off('step', this, 'manjigeriStep')
    this.off('step', this, 'fujogeriStep')
    this.off('step', this, 'fujogeriForwardStep')
    this.off('step', this, 'suiheigeriStep')
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

},{"./Q":4,"./assets":5}],3:[function(require,module,exports){
var Q = require('./Q'),
    GeriMon = require('./GeriMon')

function vector(a, b) {
  return a.x - b.x
}
Q.GeriMon.extend("Player",{
  init: function(p) {
    this._super(p, {});

    this.p.direction = 'right'
    
    // Q.input.on("fire", this, 'fire');
    this.on("prestep", this, 'attack');
    this.on("prestep", this, 'unsoku');
  },

  attack: function() {
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

    if (Q.inputs.up) {
      if (Q.inputs[this.p.direction]) {
        this.fujogeriForward(target)
      }
      this.fujogeri(target)
    }

    if (Q.inputs.down) {
      this.manjigeri(target)
    }

    this.suiheigeri(target)
  },

  unsoku: function() {
    if(Q.inputs.fire) return


    if(Q.inputs.action) {
      
      // if (Q.inputs[this.p.oppositeDirection]) {
      //   this.ushiro()
      // }

    } else {

      if(Q.inputs.up || Q.inputs.down) {
        if(Q.inputs[this.p.oppositeDirection]) {
          this.gensoku() 
        } else {
          this.kosoku()
        }
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

},{"./GeriMon":2,"./Q":4}],4:[function(require,module,exports){

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

},{}],5:[function(require,module,exports){
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

exports.load = function(cb) {

  Q.load([
    "/assets/tiles.png",
    "/assets/tsuisoku.png",
    "/assets/kosoku.png",
    "/assets/ninoashi.png",
    "/assets/fujogeri.png",
    "/assets/suiheigeri.png",
    "/assets/manjigeri.png",
    "/assets/torso-hit.png",
    "/assets/headoff-hit.png",
    "/assets/kosoku-collisions.png",
    "/assets/ninoashi-collisions.png",
    "/assets/tsuisoku-collisions.png",
    "/assets/fujogeri-collisions.png",
    "/assets/suiheigeri-collisions.png",
    "/assets/manjigeri-collisions.png"], function() {

    Q.sheet("tiles","/assets/tiles.png", { tilew: 32, tileh: 32 });

    var playerTile = { tilew: 48, tileh: 32 }
    Q.sheet("suiheigeri", "/assets/suiheigeri.png", playerTile);
    Q.sheet("manjigeri", "/assets/manjigeri.png", playerTile);
    Q.sheet("tsuisoku", "/assets/tsuisoku.png", playerTile);
    Q.sheet("kosoku", "/assets/kosoku.png", playerTile);
    Q.sheet("ninoashi", "/assets/ninoashi.png", playerTile);
    Q.sheet("fujogeri", "/assets/fujogeri.png", playerTile);
    
    Q.sheet("torso-hit", "/assets/torso-hit.png", playerTile);
    Q.sheet("headoff-hit", "/assets/headoff-hit.png", playerTile);

    collisions('fujogeri', "/assets/fujogeri-collisions.png", playerTile)
    collisions('manjigeri', "/assets/manjigeri-collisions.png", playerTile)
    collisions('suiheigeri', "/assets/suiheigeri-collisions.png", playerTile)
    collisions('ninoashi', "/assets/ninoashi-collisions.png", playerTile)
    collisions('tsuisoku', "/assets/tsuisoku-collisions.png", playerTile)
    collisions('kosoku', "/assets/kosoku-collisions.png", playerTile)
    exports.collisions.stand = {
      head: [exports.collisions.tsuisoku.head[0]],
      torso: [exports.collisions.tsuisoku.torso[0]],
      hit: [exports.collisions.tsuisoku.hit[0]]
    }
    exports.collisions.ushiro = {
      head: exports.collisions.tsuisoku.head.slice(2,9),
      torso: exports.collisions.tsuisoku.torso.slice(2,9),
      hit: exports.collisions.tsuisoku.hit.slice(2,9)
    }
    exports.collisions.taisoku = {
      head: [].concat(exports.collisions.tsuisoku.head).reverse(),
      torso: [].concat(exports.collisions.tsuisoku.torso).reverse(),
      hit: [].concat(exports.collisions.tsuisoku.hit).reverse()
    }

    cb()
  });

}

},{"./Q":4}],6:[function(require,module,exports){
var Q = require('./Q'),
    assets = require('./assets')
require('./Player')
require('./AutoPlayer')

Q.scene("level1",function(stage) {
  stage.collisionLayer(new Q.TileLayer({
                             tiles: [
                             new Array(12).join('0').split(''),
                             new Array(12).join('0').split(''),
                             new Array(12).join('0').split(''),
                             new Array(12).join('0').split(''),
                             new Array(12).join('0').split(''),
                             new Array(12).join('0').split(''),
                             new Array(12).join('1').split('')
                             ], sheet: 'tiles' }));
  var playera = stage.insert(new Q.AutoPlayer({x: 64, y: 64}))
  var playerb = stage.insert(new Q.AutoPlayer({x: 256, y: 64}));
  stage.add("viewport").follow(playera);
  stage.on("destroy",function() {
    playera.destroy();
  });
});

Q.scene("test",function(stage) {
  stage.collisionLayer(new Q.TileLayer({
                             tiles: [
                             new Array(24).join('0').split(''),
                             new Array(24).join('0').split(''),
                             new Array(24).join('0').split(''),
                             new Array(24).join('0').split(''),
                             new Array(24).join('0').split(''),
                             new Array(24).join('0').split(''),
                             new Array(24).join('0').split(''),
                             new Array(24).join('0').split(''),
                             ('1' + (new Array(22).join('0')) + '1').split(''),
                             ('1' + (new Array(22).join('0')) + '1').split(''),
                             ('1' + (new Array(22).join('0')) + '1').split(''),
                             ('1' + (new Array(22).join('1')) + '1').split(''),
                             ('1' + (new Array(22).join('0')) + '1').split(''),
                             ('1' + (new Array(22).join('0')) + '1').split(''),
                             ('1' + (new Array(22).join('0')) + '1').split(''),
                             ('1' + (new Array(22).join('1')) + '1').split('')
                             ], sheet: 'tiles' }));
  var playera = stage.insert(new Q.AutoPlayer({x: 64, y: 6*64})),
      playerb = stage.insert(new Q.AutoPlayer({x: 128, y: 6*64}));
  playera.on('step', _.bind(playera.tsuisoku, playera))
  playerb.on('step', _.bind(playerb.taisoku, playerb))
  stage.add("viewport")
  stage.on("destroy",function() {
    playera.destroy();
  });
});

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

assets.load(function() {
  Q.stageScene("level1");
})

},{"./AutoPlayer":1,"./Player":3,"./Q":4,"./assets":5}]},{},[6])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvQXV0b1BsYXllci5qcyIsImxpYi9HZXJpTW9uLmpzIiwibGliL1BsYXllci5qcyIsImxpYi9RLmpzIiwibGliL2Fzc2V0cy5qcyIsImxpYi9tYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIFEgPSByZXF1aXJlKCcuL1EnKVxucmVxdWlyZSgnLi9HZXJpTW9uJylcblxuXG5mdW5jdGlvbiBkaXN0YW5jZShhLCBiKSB7XG4gIHZhciB4ID0gTWF0aC5hYnMoYS5wLnggLSBiLnAueCksXG4gICAgICB5ID0gTWF0aC5hYnMoYS5wLnkgLSBiLnAueSlcbiAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkpO1xufVxuXG5mdW5jdGlvbiBzcG90QXR0YWNrKHRhcmdldCkge1xuICBpZih0YXJnZXQucC5hbmltYXRpb24gPT09ICdmdWpvZ2VyaScpIHtcbiAgICBpZih0YXJnZXQucC5hbmltYXRpb25GcmFtZSA+IDIpXG4gICAgICByZXR1cm4gJ2Z1am9nZXJpJ1xuICB9XG4gIGlmKHRhcmdldC5wLmFuaW1hdGlvbiA9PT0gJ3N1aWhlaWdlcmknKSB7XG4gICAgaWYodGFyZ2V0LnAuYW5pbWF0aW9uRnJhbWUgPiAyKVxuICAgICAgcmV0dXJuICdzdWloZWlnZXJpJ1xuICB9XG4gIGlmKHRhcmdldC5wLmFuaW1hdGlvbiA9PT0gJ21hbmppZ2VyaScpIHtcbiAgICBpZih0YXJnZXQucC5hbmltYXRpb25GcmFtZSA+IDIpXG4gICAgICByZXR1cm4gJ21hbmppZ2VyaSdcbiAgfSBcbn1cblxuUS5HZXJpTW9uLmV4dGVuZChcIkF1dG9QbGF5ZXJcIiwge1xuXG4gIGhpdERpc3RhbmNlOiAzNSxcblxuICBtb3ZlQ2xvc2VyOiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICBpZihkaXN0YW5jZSh0YXJnZXQsIHRoaXMpID4gdGhpcy5oaXREaXN0YW5jZSArIHRoaXMucC53LzIpIHtcbiAgICAgIHRoaXMudHN1aXNva3UoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm5pbm9hc2hpKClcbiAgICB9XG4gIH0sXG5cbiAgbW92ZUZ1cnRoZXI6IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgIHRoaXMudGFpc29rdSgpXG4gIH0sXG5cbiAgY2FuY2VsQXR0YWNrOiBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLnAuYXR0YWNraW5nICYmIHRoaXMucC5hbmltYXRpb25GcmFtZSA8IDQpIHtcbiAgICAgIHRoaXMuc3RhbmQoKVxuICAgIH1cbiAgfSxcblxuICBjYW5jZWxVbnNva3U6IGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMucC53YWxraW5nKSB7XG4gICAgICBpZih0aGlzLnAuYW5pbWF0aW9uRnJhbWUgPCAzIHx8IHRoaXMucC5hbmltYXRpb25GcmFtZSA+IDYpIHtcbiAgICAgICAgdGhpcy5zdGFuZCgpXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIGF0dGFja0R1cmluZ0F0dGFjazogZnVuY3Rpb24odGFyZ2V0LCBhdHRhY2spIHtcbiAgICBpZihhdHRhY2sgPT09ICdzdWloZWlnZXJpJykge1xuICAgICAgaWYodGFyZ2V0LnAuYW5pbWF0aW9uRnJhbWUgPCA2KSB7XG4gICAgICAgIHRoaXNbXy5zYW1wbGUoWydmdWpvZ2VyaScsICdtYW5qaWdlcmknXSldKHRhcmdldClcbiAgICAgIH1cbiAgICB9XG4gICAgaWYoYXR0YWNrID09PSAnZnVqb2dlcmknKSB7XG4gICAgICBpZih0YXJnZXQucC5hbmltYXRpb25GcmFtZSA8IDEwKSB7XG4gICAgICAgIHRoaXMubWFuamlnZXJpKHRhcmdldClcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgYXR0YWNrQWZ0ZXJBdHRhY2s6IGZ1bmN0aW9uKHRhcmdldCwgYXR0YWNrKSB7XG4gICAgaWYoYXR0YWNrID09PSAnc3VpaGVpZ2VyaScpIHtcbiAgICAgIGlmKHRhcmdldC5wLmFuaW1hdGlvbkZyYW1lID4gNikge1xuICAgICAgICB0aGlzLmZ1am9nZXJpKHRhcmdldClcbiAgICAgIH1cbiAgICB9XG4gICAgaWYoYXR0YWNrID09PSAnZnVqb2dlcmknKSB7XG4gICAgICBpZih0YXJnZXQucC5hbmltYXRpb25GcmFtZSA+IDEwKSB7XG4gICAgICAgIHRoaXMubWFuamlnZXJpKHRhcmdldClcbiAgICAgIH1cbiAgICB9XG4gICAgaWYoYXR0YWNrID09PSAnbWFuamlnZXJpJykge1xuICAgICAgaWYodGFyZ2V0LnAuYW5pbWF0aW9uRnJhbWUgPiA3KSB7XG4gICAgICAgIHRoaXMuc3VpaGVpZ2VyaSh0YXJnZXQpXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIGV2YWRlOiBmdW5jdGlvbih0YXJnZXQsIGF0dGFjaykge1xuICAgIGlmKGF0dGFjaykge1xuICAgICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpXG4gICAgICB0aGlzLmNhbmNlbEF0dGFjaygpXG4gICAgICBpZihyID4gLjgpIHtcbiAgICAgICAgdGhpcy5rb3Nva3UoKVxuICAgICAgfSBlbHNlIGlmIChyID4gLjUpIHtcbiAgICAgICAgdGhpcy5nZW5zb2t1KClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudGFpc29rdSgpXG4gICAgICB9XG5cbiAgICB9XG4gIH0sXG5cbiAgYXR0YWNrOiBmdW5jdGlvbih0YXJnZXQsIGF0dGFjaykge1xuICAgIHRoaXNbXy5zYW1wbGUoWydzdWloZWlnZXJpJywgJ21hbmppZ2VyaScsICdzdWloZWlnZXJpJywgJ21hbmppZ2VyaScsICdmdWpvZ2VyaScsICdmdWpvZ2VyaUZvcndhcmQnXSldKHRhcmdldCkgXG4gIH0sXG5cbiAgbG9va0F0OiBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICB2YXIgYXQgPSB0YXJnZXQucC54IDwgdGhpcy5wLnggPyAnbGVmdCcgOiAncmlnaHQnXG4gICAgaWYoYXQgIT0gdGhpcy5wLmRpcmVjdGlvbikgdGhpcy51c2hpcm8oKVxuICB9LFxuXG4gIHN0ZXA6IGZ1bmN0aW9uKHQpIHtcbiAgICB0aGlzLl9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgXG4gICAgdmFyIG90aGVycyA9IF8ud2l0aG91dCh0aGlzLmluc3RhbmNlcywgdGhpcyksXG4gICAgICAgIHRhcmdldDtcbiAgICBcbiAgICBpZihvdGhlcnMubGVuZ3RoID4gMCkge1xuICAgICAgdGFyZ2V0ID0gXy5zYW1wbGUob3RoZXJzKVxuXG4gICAgICBpZih0YXJnZXQpIHtcblxuICAgICAgICB0aGlzLmxvb2tBdCh0YXJnZXQpXG5cbiAgICAgICAgaWYoZGlzdGFuY2UodGFyZ2V0LCB0aGlzKSA8IHRoaXMuaGl0RGlzdGFuY2UgLzIpIHtcbiAgICAgICAgICB0aGlzLm1vdmVGdXJ0aGVyKHRhcmdldClcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoZGlzdGFuY2UodGFyZ2V0LCB0aGlzKSA+IHRoaXMuaGl0RGlzdGFuY2UpIHtcbiAgICAgICAgICB0aGlzLm1vdmVDbG9zZXIodGFyZ2V0KVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNwb3QgPSBzcG90QXR0YWNrKHRhcmdldClcbiAgICAgICAgaWYoc3BvdCkge1xuICAgICAgICAgIHRoaXMuZXZhZGUodGFyZ2V0LCBzcG90KVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmKGRpc3RhbmNlKHRhcmdldCwgdGhpcykgPD0gdGhpcy5oaXREaXN0YW5jZSkge1xuICAgICAgICAgICAgdGhpcy5hdHRhY2sodGFyZ2V0KVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICB9XG5cbn0pIiwidmFyIFEgPSByZXF1aXJlKCcuL1EnKSxcbiAgICBjb2xsaXNpb25zID0gcmVxdWlyZSgnLi9hc3NldHMnKS5jb2xsaXNpb25zXG5cblEuYW5pbWF0aW9ucygnZ2VyaW1vbicsIHtcbiAgc3RhbmQ6IHsgZnJhbWVzOiBbMF0gfSxcbiAgZnVqb2dlcmk6IHsgZnJhbWVzOiBfLnJhbmdlKDE1KSwgcmF0ZTogMS8xMCwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAgc3VpaGVpZ2VyaTogeyBmcmFtZXM6IF8ucmFuZ2UoMTUpLCByYXRlOiAxLzEwLCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICBtYW5qaWdlcmk6IHsgZnJhbWVzOiBfLnJhbmdlKDE1KSwgcmF0ZTogMS8xMCwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAgdHN1aXNva3U6IHsgZnJhbWVzOiBfLnJhbmdlKDExKSwgcmF0ZTogMS8xMCwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAga29zb2t1OiB7IGZyYW1lczogXy5yYW5nZSgxOCksIHJhdGU6IDEvMTUsIGxvb3A6IGZhbHNlLCB0cmlnZ2VyOiAnc3RhbmQnIH0sXG4gIHVzaGlybzogeyBmcmFtZXM6IF8ucmFuZ2UoMiw5KSwgcmF0ZTogMS8xMCwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAgbmlub2FzaGk6IHsgZnJhbWVzOiBfLnJhbmdlKDYpLCByYXRlOiAxLzEwLCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICB0YWlzb2t1OiB7IGZyYW1lczogXy5yYW5nZSgxMSkucmV2ZXJzZSgpLCByYXRlOiAxLzEwLCBsb29wOiBmYWxzZSwgdHJpZ2dlcjogJ3N0YW5kJyB9LFxuICB0b3Jzb2hpdDogeyBmcmFtZXM6IFswLDEsMiwzLDIsMSwwXSwgcmF0ZTogMS8xMCwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfSxcbiAgaGVhZG9mZmhpdDogeyBmcmFtZXM6IF8ucmFuZ2UoMTIpLmNvbmNhdChbMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTIsMTJdKSwgcmF0ZTogMS8xMCwgbG9vcDogZmFsc2UsIHRyaWdnZXI6ICdzdGFuZCcgfVxufSk7XG5cbmZ1bmN0aW9uIGludGVyc2VjdHMoYSwgYikge1xuICBpZihhLncgKyBhLmggKyBiLncgKyBiLmggPT0gMCkgcmV0dXJuIGZhbHNlO1xuICB2YXIgeEludGVzZWN0cyA9IGEueCA8IGIueCAmJiBhLngrYS53ID4gYi54IHx8IFxuICAgICAgICAgICAgICAgICAgIGEueCA8IGIueCtiLncgJiYgYS54K2EudyA+IGIueCtiLncsXG4gICAgICB5SW50ZXNlY3RzID0gYS55IDwgYi55ICYmIGEueSArIGEuaCA+IGIueSB8fFxuICAgICAgICAgICAgICAgICAgIGEueSA8IGIueStiLmggJiYgYS55K2EuaCA+IGIueStiLmhcbiAgcmV0dXJuIHhJbnRlc2VjdHMgJiYgeUludGVzZWN0c1xufVxuZnVuY3Rpb24gcmVjdCh4LCB5LCB3LCBoKSB7XG4gIHJldHVybiB7XG4gICAgeDogeHx8MCxcbiAgICB5OiB5fHwwLFxuICAgIHc6IHd8fDAsXG4gICAgaDogaHx8MFxuICB9XG59XG5cbmZ1bmN0aW9uIGF0dGFjayhmbikge1xuICByZXR1cm4gZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgaWYoIXRoaXMucC5sYW5kZWQpIHJldHVybjtcbiAgICBpZih0aGlzLnAuaGl0KSByZXR1cm47XG4gICAgaWYodGhpcy5wLmF0dGFja2luZykgcmV0dXJuO1xuICAgIGlmKHRoaXMucC53YWxraW5nICYmIHRoaXMucC5hbmltYXRpb25GcmFtZSA+IDQpIHJldHVybjtcbiAgICB0aGlzLnAudGFyZ2V0ID0gdGFyZ2V0XG4gICAgdGhpcy5wLmF0dGFja2luZyA9IHRydWVcbiAgICB0aGlzLnAudnggPSAwXG4gICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICB9XG59XG5cbmZ1bmN0aW9uIGp1bXAoZm4pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMucC5oaXQpIHJldHVybjtcbiAgICBpZih0aGlzLnAuanVtcGluZykgcmV0dXJuO1xuICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgfVxufVxuXG5mdW5jdGlvbiB3YWxrKGZuKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLnAuaGl0KSByZXR1cm4gZmFsc2U7XG4gICAgaWYoIXRoaXMucC5sYW5kZWQpIHJldHVybiBmYWxzZTtcbiAgICBpZih0aGlzLnAuYXR0YWNraW5nKSByZXR1cm4gZmFsc2U7XG4gICAgaWYodGhpcy5wLndhbGtpbmcpIHJldHVybiBmYWxzZTtcbiAgICB0aGlzLnAud2Fsa2luZyA9IHRydWVcbiAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgcmV0dXJuIHRydWVcbiAgfVxufVxuXG5RLk1vdmluZ1Nwcml0ZS5leHRlbmQoXCJIZWFkXCIsIHtcbiAgaW5pdDogZnVuY3Rpb24ob3duZXIsIGZvcmNlKSB7XG4gICAgdGhpcy5fc3VwZXIoe30sIHtcbiAgICAgIGNvbG9yOiBcIiMwMDAwMDBcIixcbiAgICAgIHc6IDQsXG4gICAgICBoOiA0LFxuICAgICAgeDogb3duZXIucC54LFxuICAgICAgeTogb3duZXIucC55IC0gMTMsXG4gICAgICBkaXI6IC0xKm93bmVyLnAuZGlyLFxuICAgICAgbGlmZTogMFxuICAgIH0pXG4gICAgdGhpcy5hZGQoJzJkJyk7XG4gICAgdGhpcy5wLnZ5ID0gLTE1MFxuICAgIHRoaXMucC52eCA9IHRoaXMucC5kaXIqZm9yY2UgKiAyXG4gIH0sXG4gIHN0ZXA6IGZ1bmN0aW9uKHQpIHtcbiAgICB0aGlzLl9zdXBlcih0KVxuICAgIHRoaXMucC5saWZlICs9IHRcbiAgICB0aGlzLnAuYW5nbGUgKz0gdGhpcy5wLmRpciAqIHQgKiA0MDBcbiAgICBpZih0aGlzLnAubGlmZSA+IDUpIHtcbiAgICAgIHRoaXMuZGVzdHJveSgpXG4gICAgfVxuICB9XG59KVxuXG5RLk1vdmluZ1Nwcml0ZS5leHRlbmQoXCJHZXJpTW9uXCIsIHtcbiAgaW5zdGFuY2VzOiBbXSxcbiAgc3BlZWQ6IDI1LFxuICBmcmljdGlvbjogNSxcbiAganVtcFNwZWVkOiAxMDAsXG5cbiAgaW5pdDogZnVuY3Rpb24ocCkge1xuICAgIHZhciB3ID0gMjIsIGggPSAzMlxuICAgIHRoaXMuX3N1cGVyKHAsIHsgXG4gICAgICBzcHJpdGU6IFwiZ2VyaW1vblwiLFxuICAgICAgc2hlZXQ6IFwidHN1aXNva3VcIixcbiAgICAgIGRpcjogMSxcbiAgICAgIHc6IHcsXG4gICAgICBoOiBoLFxuICAgICAgc3c6IDQ4LFxuICAgICAgc2g6IDMyLFxuICAgICAgc2Vuc29yOiB0cnVlLFxuICAgICAgcG9pbnRzOiBbXG4gICAgICAgIFstdy8yLCAtaC8yXSwgXG4gICAgICAgIFsgdy8yLCAtaC8yIF0sIFxuICAgICAgICBbIHcvMiwgIGgvMiBdLCBcbiAgICAgICAgWy13LzIsICBoLzIgXV0sXG4gICAgICBjeDogMTBcbiAgICB9KTtcbiAgICB0aGlzLmFkZCgnMmQsIGFuaW1hdGlvbicpO1xuICAgIHRoaXMuaW5zdGFuY2VzLnB1c2godGhpcylcbiAgICBcbiAgICB0aGlzLm9uKFwic3RhbmRcIiwgdGhpcywgXCJzdGFuZFwiKTtcbiAgICB0aGlzLm9uKFwicHJlc3RlcFwiLCB0aGlzLCBcInByZXN0ZXBcIilcbiAgICB0aGlzLm9uKFwiYnVtcC5ib3R0b21cIiwgdGhpcywgXCJsYW5kXCIpO1xuICAgIC8vIHRoaXMub24oXCJwb3N0ZHJhd1wiLCB0aGlzLCBcInJlbmRlckNvbGxpc2lvbnNcIilcblxuICAgIHRoaXMuc3RhbmQoKVxuICB9LFxuXG4gIF9hYnN4OiBmdW5jdGlvbih4LCB3KSB7XG4gICAgcmV0dXJuIHRoaXMucC5mbGlwID8gXG4gICAgICB0aGlzLnAueCArIHRoaXMucC5jeCAtIHggLSB3IDpcbiAgICAgIHRoaXMucC54IC0gdGhpcy5wLmN4ICsgeFxuICB9LFxuXG4gIF9hYnN5OiBmdW5jdGlvbih5KSB7XG4gICAgcmV0dXJuIHRoaXMucC55LXRoaXMucC5jeSArIHlcbiAgfSxcblxuICByZW5kZXJDb2xsaXNpb25zOiBmdW5jdGlvbihjdHgpIHtcbiAgICBjdHguc2F2ZSgpO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcblxuICAgIGN0eC5maWxsU3R5bGUgPSBcInJnYmEoMCwwLDAsMC41KVwiO1xuICAgIGN0eC5maWxsUmVjdCh0aGlzLnAueC10aGlzLnAuY3gsIHRoaXMucC55LXRoaXMucC5jeSwgdGhpcy5wLncsIHRoaXMucC5oKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIFxuICAgIHZhciBjID0gY29sbGlzaW9uc1t0aGlzLnAuYW5pbWF0aW9uXSB8fCBjb2xsaXNpb25zLnN0YW5kLFxuICAgICAgICBmdCA9IGMudG9yc29bdGhpcy5wLmFuaW1hdGlvbkZyYW1lXSB8fCBjLnRvcnNvWzBdLFxuICAgICAgICBmaCA9IGMuaGVhZFt0aGlzLnAuYW5pbWF0aW9uRnJhbWVdIHx8IGMuaGVhZFswXSxcbiAgICAgICAgZmhoPSBjLmhpdCAmJiBjLmhpdFt0aGlzLnAuYW5pbWF0aW9uRnJhbWVdIHx8IHt9XG4gICAgXG4gICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgyNTUsMCwyNTUsMC41KVwiO1xuICAgIGN0eC5maWxsUmVjdCh0aGlzLl9hYnN4KGZ0LngsIGZ0LncpLCB0aGlzLl9hYnN5KGZ0LnkpLCBmdC53LCBmdC5oKTtcbiAgICBjdHguZmlsbCgpO1xuXG4gICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgwLDI1NSwyNTUsMC41KVwiO1xuICAgIGN0eC5maWxsUmVjdCh0aGlzLl9hYnN4KGZoLngsIGZoLncpLCB0aGlzLl9hYnN5KGZoLnkpLCBmaC53LCBmaC5oKTtcbiAgICBjdHguZmlsbCgpO1xuXG4gICAgY3R4LmZpbGxTdHlsZSA9IFwicmdiYSgyNTUsMjU1LDAsMC41KVwiO1xuICAgIGN0eC5maWxsUmVjdCh0aGlzLl9hYnN4KGZoaC54LCBmaGgudyksIHRoaXMuX2Fic3koZmhoLnkpLCBmaGgudywgZmhoLmgpO1xuICAgIGN0eC5maWxsKCk7XG4gICAgY3R4LnJlc3RvcmUoKVxuICB9LFxuXG4gIGxhbmQ6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC5sYW5kZWQgPSB0cnVlXG4gIH0sXG5cbiAgZnVqb2dlcmlGb3J3YXJkOiBqdW1wKGF0dGFjayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAudnggPSAwXG4gICAgdGhpcy5zaGVldChcImZ1am9nZXJpXCIpXG4gICAgdGhpcy5wbGF5KCdmdWpvZ2VyaScsIDEpXG4gICAgdGhpcy5vbignc3RlcCcsIHRoaXMsICdmdWpvZ2VyaUZvcndhcmRTdGVwJylcbiAgICB0aGlzLm9uKCdzdGVwJywgdGhpcywgJ2Z1am9nZXJpU3RlcCcpXG4gIH0pKSxcblxuICBmdWpvZ2VyaToganVtcChhdHRhY2soZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLnZ4ID0gMFxuICAgIHRoaXMuc2hlZXQoXCJmdWpvZ2VyaVwiKVxuICAgIHRoaXMucGxheSgnZnVqb2dlcmknLCAxKVxuICAgIHRoaXMub24oJ3N0ZXAnLCB0aGlzLCAnZnVqb2dlcmlTdGVwJylcbiAgfSkpLFxuXG4gIGZ1am9nZXJpRm9yd2FyZFN0ZXA6IGZ1bmN0aW9uKCkge1xuICAgIGlmKHRoaXMucC5hbmltYXRpb25GcmFtZSA9PT0gNikge1xuICAgICAgdGhpcy5wLnZ4ID0gdGhpcy5wLmRpciAqIHRoaXMuc3BlZWQgKiAyLzNcbiAgICB9XG4gIH0sXG5cbiAgZnVqb2dlcmlTdGVwOiBmdW5jdGlvbigpIHtcbiAgICBpZih0aGlzLnAuYW5pbWF0aW9uRnJhbWUgPT09IDUpIHtcbiAgICAgIHRoaXMucC52eSA9IC10aGlzLmp1bXBTcGVlZFxuICAgICAgdGhpcy5wLmxhbmRlZCA9IGZhbHNlXG4gICAgICB0aGlzLnAuanVtcGluZyA9IHRydWVcbiAgICB9XG4gICAgdmFyIGhpdCA9IHRoaXMuaGl0VGVzdChjb2xsaXNpb25zLmZ1am9nZXJpLmhpdFt0aGlzLnAuYW5pbWF0aW9uRnJhbWVdKVxuICAgIGlmKGhpdCkge1xuICAgICAgdGhpcy5wLnRhcmdldC5oaXQodGhpcy5wLmRpciAqIDQwLCBoaXQpXG4gICAgfVxuICB9LFxuXG4gIG1hbmppZ2VyaTogYXR0YWNrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2hlZXQoXCJtYW5qaWdlcmlcIilcbiAgICB0aGlzLnBsYXkoJ21hbmppZ2VyaScsIDEpXG4gICAgdGhpcy5vbignc3RlcCcsIHRoaXMsICdtYW5qaWdlcmlTdGVwJylcbiAgfSksXG5cbiAgbWFuamlnZXJpU3RlcDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGhpdCA9IHRoaXMuaGl0VGVzdChjb2xsaXNpb25zLm1hbmppZ2VyaS5oaXRbdGhpcy5wLmFuaW1hdGlvbkZyYW1lXSlcbiAgICBpZihoaXQpIHtcbiAgICAgIHRoaXMucC50YXJnZXQuaGl0KHRoaXMucC5kaXIgKiAyMCwgaGl0KVxuICAgIH1cbiAgfSxcblxuICBzdWloZWlnZXJpOiBhdHRhY2soZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zaGVldChcInN1aWhlaWdlcmlcIilcbiAgICB0aGlzLnBsYXkoJ3N1aWhlaWdlcmknLCAxKVxuICAgIHRoaXMub24oJ3N0ZXAnLCB0aGlzLCAnc3VpaGVpZ2VyaVN0ZXAnKVxuICB9KSxcblxuICBzdWloZWlnZXJpU3RlcDogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGhpdCA9IHRoaXMuaGl0VGVzdChjb2xsaXNpb25zLnN1aWhlaWdlcmkuaGl0W3RoaXMucC5hbmltYXRpb25GcmFtZV0pXG4gICAgaWYoaGl0KSB7XG4gICAgICB0aGlzLnAudGFyZ2V0LmhpdCh0aGlzLnAuZGlyICogMzAsIGhpdClcbiAgICB9XG4gIH0sXG4gIFxuICB1c2hpcm86IHdhbGsoZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLmRpcmVjdGlvbiA9IHRoaXMucC5kaXJlY3Rpb24gPT09ICdsZWZ0JyA/ICdyaWdodCcgOiAnbGVmdCdcbiAgICB0aGlzLnNoZWV0KFwidHN1aXNva3VcIilcbiAgICB0aGlzLnBsYXkoJ3VzaGlybycsIDEpXG4gIH0pLFxuXG4gIG5pbm9hc2hpOiB3YWxrKGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucC52eCA9IHRoaXMucC5kaXIgKiB0aGlzLnNwZWVkLzI7XG4gICAgdGhpcy5zaGVldChcIm5pbm9hc2hpXCIpXG4gICAgdGhpcy5wbGF5KCduaW5vYXNoaScsIDEpXG4gIH0pLFxuXG4gIHRhaXNva3U6IHdhbGsoZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLnZ4ID0gLXRoaXMucC5kaXIgKiB0aGlzLnNwZWVkO1xuICAgIHRoaXMuc2hlZXQoXCJ0c3Vpc29rdVwiKVxuICAgIHRoaXMucGxheSgndGFpc29rdScsIDEpXG4gIH0pLFxuICBcbiAgdHN1aXNva3U6IHdhbGsoZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLnZ4ID0gdGhpcy5wLmRpciAqIHRoaXMuc3BlZWQ7XG4gICAgdGhpcy5zaGVldChcInRzdWlzb2t1XCIpXG4gICAgdGhpcy5wbGF5KCd0c3Vpc29rdScsIDEpXG4gIH0pLFxuXG4gIGtvc29rdTogd2FsayhmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAudnggPSB0aGlzLnAuZGlyICogdGhpcy5zcGVlZC8yO1xuICAgIHRoaXMuc2hlZXQoXCJrb3Nva3VcIilcbiAgICB0aGlzLnBsYXkoJ2tvc29rdScsIDEpXG4gIH0pLFxuXG4gIGdlbnNva3U6IHdhbGsoZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wLnZ4ID0gLXRoaXMucC5kaXIgKiB0aGlzLnNwZWVkKjIvMztcbiAgICB0aGlzLnNoZWV0KFwia29zb2t1XCIpXG4gICAgdGhpcy5wbGF5KCdrb3Nva3UnLCAxKVxuICB9KSxcblxuICBoaXRUZXN0OiBmdW5jdGlvbihjb2xsKSB7XG4gICAgaWYoIXRoaXMucC50YXJnZXQpIHJldHVybiBmYWxzZVxuICAgIGlmKHRoaXMucC50YXJnZXQucC5oaXQpIHJldHVybiBmYWxzZVxuICAgIHZhciB0ID0gdGhpcy5wLnRhcmdldCxcbiAgICAgICAgdHAgPSB0aGlzLnAudGFyZ2V0LnAsXG4gICAgICAgIHR0ID0gY29sbGlzaW9uc1t0cC5hbmltYXRpb25dLnRvcnNvW3RwLmFuaW1hdGlvbkZyYW1lXSxcbiAgICAgICAgdGggPSBjb2xsaXNpb25zW3RwLmFuaW1hdGlvbl0uaGVhZFt0cC5hbmltYXRpb25GcmFtZV0sXG4gICAgICAgIGNyID0gcmVjdCh0aGlzLl9hYnN4KGNvbGwueCwgY29sbC53KSwgdGhpcy5fYWJzeShjb2xsLnkpLCBjb2xsLncsIGNvbGwuaClcbiAgICBcbiAgICBpZihpbnRlcnNlY3RzKHJlY3QodC5fYWJzeCh0dC54LCB0dC53KSwgdC5fYWJzeSh0dC55KSwgdHQudywgdHQuaCksIGNyKSkge1xuICAgICAgcmV0dXJuICd0b3JzbydcbiAgICB9XG5cbiAgICBpZihpbnRlcnNlY3RzKHJlY3QodC5fYWJzeCh0aC54LCB0aC53KSwgdC5fYWJzeSh0aC55KSwgdGgudywgdHQuaCksIGNyKSkge1xuICAgICAgcmV0dXJuICdoZWFkJ1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZVxuICB9LFxuXG4gIGhpdDogZnVuY3Rpb24oZm9yY2UsIGhpdCkge1xuICAgIHRoaXMuc3RhbmQoKVxuICAgIHRoaXMucC5oaXQgPSB0cnVlXG4gICAgaWYoaGl0ID09PSAnaGVhZCcpIHtcbiAgICAgIHRoaXMuc2hlZXQoXCJoZWFkb2ZmLWhpdFwiKVxuICAgICAgdGhpcy5wbGF5KCdoZWFkb2ZmaGl0JywgMSlcbiAgICAgIHRoaXMuc3RhZ2UuaW5zZXJ0KG5ldyBRLkhlYWQodGhpcywgZm9yY2UpKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnAudnggKz0gZm9yY2VcbiAgICAgIHRoaXMuc2hlZXQoXCJ0b3Jzby1oaXRcIilcbiAgICAgIHRoaXMucGxheSgndG9yc29oaXQnLCAxKVxuICAgIH1cbiAgfSxcblxuICBmaW5pc2hLaWNrczogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5vZmYoJ3N0ZXAnLCB0aGlzLCAnbWFuamlnZXJpU3RlcCcpXG4gICAgdGhpcy5vZmYoJ3N0ZXAnLCB0aGlzLCAnZnVqb2dlcmlTdGVwJylcbiAgICB0aGlzLm9mZignc3RlcCcsIHRoaXMsICdmdWpvZ2VyaUZvcndhcmRTdGVwJylcbiAgICB0aGlzLm9mZignc3RlcCcsIHRoaXMsICdzdWloZWlnZXJpU3RlcCcpXG4gICAgdGhpcy5vZmYoJ3ByZXN0ZXAnLCB0aGlzLCAnZmluaXNoS2lja3MnKVxuICB9LFxuXG4gIHN0YW5kOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnAuZnJhbWUgPSAwXG4gICAgdGhpcy5wLnZ4ID0gMFxuICAgIHRoaXMucGxheSgnc3RhbmQnLCAxLCB0cnVlKVxuICAgIHRoaXMuc2hlZXQoXCJ0c3Vpc29rdVwiKVxuICAgIHRoaXMucC5qdW1waW5nID0gZmFsc2U7XG4gICAgdGhpcy5wLmF0dGFja2luZyA9IGZhbHNlO1xuICAgIHRoaXMucC53YWxraW5nID0gZmFsc2U7XG4gICAgdGhpcy5wLmhpdCA9IGZhbHNlO1xuICAgIHRoaXMucC50YXJnZXQgPSBudWxsO1xuICAgIHRoaXMub24oJ3ByZXN0ZXAnLCB0aGlzLCAnZmluaXNoS2lja3MnKVxuICB9LFxuXG4gIHByZXN0ZXA6IGZ1bmN0aW9uKHQpIHtcbiAgICBpZih0aGlzLnAuZGlyZWN0aW9uID09PSAnbGVmdCcpIHtcbiAgICAgIHRoaXMuc2V0KHtmbGlwOiAneCd9KVxuICAgICAgdGhpcy5wLmRpciA9IC0xXG4gICAgICB0aGlzLnAub3Bwb3NpdGVEaXJlY3Rpb24gPSAncmlnaHQnXG4gICAgICB0aGlzLnAuY3ggPSAxMlxuICAgIH1cbiAgICBpZih0aGlzLnAuZGlyZWN0aW9uID09PSAncmlnaHQnKSB7XG4gICAgICB0aGlzLnNldCh7ZmxpcDogJyd9KVxuICAgICAgdGhpcy5wLmRpciA9IDFcbiAgICAgIHRoaXMucC5vcHBvc2l0ZURpcmVjdGlvbiA9ICdsZWZ0J1xuICAgICAgdGhpcy5wLmN4ID0gMTBcbiAgICB9XG4gIH1cblxufSk7XG4iLCJ2YXIgUSA9IHJlcXVpcmUoJy4vUScpLFxuICAgIEdlcmlNb24gPSByZXF1aXJlKCcuL0dlcmlNb24nKVxuXG5mdW5jdGlvbiB2ZWN0b3IoYSwgYikge1xuICByZXR1cm4gYS54IC0gYi54XG59XG5RLkdlcmlNb24uZXh0ZW5kKFwiUGxheWVyXCIse1xuICBpbml0OiBmdW5jdGlvbihwKSB7XG4gICAgdGhpcy5fc3VwZXIocCwge30pO1xuXG4gICAgdGhpcy5wLmRpcmVjdGlvbiA9ICdyaWdodCdcbiAgICBcbiAgICAvLyBRLmlucHV0Lm9uKFwiZmlyZVwiLCB0aGlzLCAnZmlyZScpO1xuICAgIHRoaXMub24oXCJwcmVzdGVwXCIsIHRoaXMsICdhdHRhY2snKTtcbiAgICB0aGlzLm9uKFwicHJlc3RlcFwiLCB0aGlzLCAndW5zb2t1Jyk7XG4gIH0sXG5cbiAgYXR0YWNrOiBmdW5jdGlvbigpIHtcbiAgICBpZighUS5pbnB1dHMuZmlyZSkgcmV0dXJuXG5cbiAgICB2YXIgdGFyZ2V0LCB0RGlzdCA9IEluZmluaXR5LCBkaXN0O1xuICAgIGZvcih2YXIgaT0wOyBpPHRoaXMuaW5zdGFuY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZih0aGlzLmluc3RhbmNlc1tpXSAhPSB0aGlzKSB7XG4gICAgICAgIGRpc3QgPSBNYXRoLmFicyh0aGlzLnAueCAtIHRoaXMuaW5zdGFuY2VzW2ldLnAueClcbiAgICAgICAgaWYoZGlzdCA8IHREaXN0KSB7XG4gICAgICAgICAgdGFyZ2V0ID0gdGhpcy5pbnN0YW5jZXNbaV1cbiAgICAgICAgICB0RGlzdCA9IGRpc3RcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChRLmlucHV0cy51cCkge1xuICAgICAgaWYgKFEuaW5wdXRzW3RoaXMucC5kaXJlY3Rpb25dKSB7XG4gICAgICAgIHRoaXMuZnVqb2dlcmlGb3J3YXJkKHRhcmdldClcbiAgICAgIH1cbiAgICAgIHRoaXMuZnVqb2dlcmkodGFyZ2V0KVxuICAgIH1cblxuICAgIGlmIChRLmlucHV0cy5kb3duKSB7XG4gICAgICB0aGlzLm1hbmppZ2VyaSh0YXJnZXQpXG4gICAgfVxuXG4gICAgdGhpcy5zdWloZWlnZXJpKHRhcmdldClcbiAgfSxcblxuICB1bnNva3U6IGZ1bmN0aW9uKCkge1xuICAgIGlmKFEuaW5wdXRzLmZpcmUpIHJldHVyblxuXG5cbiAgICBpZihRLmlucHV0cy5hY3Rpb24pIHtcbiAgICAgIFxuICAgICAgLy8gaWYgKFEuaW5wdXRzW3RoaXMucC5vcHBvc2l0ZURpcmVjdGlvbl0pIHtcbiAgICAgIC8vICAgdGhpcy51c2hpcm8oKVxuICAgICAgLy8gfVxuXG4gICAgfSBlbHNlIHtcblxuICAgICAgaWYoUS5pbnB1dHMudXAgfHwgUS5pbnB1dHMuZG93bikge1xuICAgICAgICBpZihRLmlucHV0c1t0aGlzLnAub3Bwb3NpdGVEaXJlY3Rpb25dKSB7XG4gICAgICAgICAgdGhpcy5nZW5zb2t1KCkgXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5rb3Nva3UoKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vZm9yd2FyZFxuICAgICAgaWYoUS5pbnB1dHNbdGhpcy5wLmRpcmVjdGlvbl0pIHtcbiAgICAgICAgdGhpcy5uaW5vYXNoaSgpIFxuICAgICAgICBpZih0aGlzLnAuYW5pbWF0aW9uID09PSAnbmlub2FzaGknICYmIHRoaXMucC5hbmltYXRpb25GcmFtZSA+IDEpIHtcbiAgICAgICAgICB0aGlzLnN0YW5kKClcbiAgICAgICAgICB0aGlzLnRzdWlzb2t1KClcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy9iYWNrd2FyZFxuICAgICAgaWYoUS5pbnB1dHNbdGhpcy5wLmRpcmVjdGlvbiA9PT0gJ2xlZnQnID8gJ3JpZ2h0JyA6ICdsZWZ0J10pIHtcbiAgICAgICAgdGhpcy50YWlzb2t1KClcbiAgICAgIH1cblxuICAgIH1cblxuICAgIFxuICB9XG5cbn0pO1xuIiwiXG52YXIgUSA9IFF1aW50dXMoKVxuICAuaW5jbHVkZShcIlNwcml0ZXMsIFNjZW5lcywgSW5wdXQsIDJELCBUb3VjaCwgVUksIEFuaW1cIilcbiAgLnNldHVwKHsgbWF4aW1pemU6IHRydWUgfSlcbiAgLmNvbnRyb2xzKClcbiAgLnRvdWNoKCk7XG5cblEuRXZlbnRlZC5wcm90b3R5cGUuX3RyaWdnZXIgPSBRLkV2ZW50ZWQucHJvdG90eXBlLnRyaWdnZXJcblEuRXZlbnRlZC5wcm90b3R5cGUudHJpZ2dlciAgPSBmdW5jdGlvbihldmVudCxkYXRhKSB7XG4gIC8vIEZpcnN0IG1ha2Ugc3VyZSB0aGVyZSBhcmUgYW55IGxpc3RlbmVycywgdGhlbiBjaGVjayBmb3IgYW55IGxpc3RlbmVyc1xuICAvLyBvbiB0aGlzIHNwZWNpZmljIGV2ZW50LCBpZiBub3QsIGVhcmx5IG91dC5cbiAgaWYodGhpcy5saXN0ZW5lcnMgJiYgdGhpcy5saXN0ZW5lcnNbZXZlbnRdKSB7XG4gICAgLy8gQ2FsbCBlYWNoIGxpc3RlbmVyIGluIHRoZSBjb250ZXh0IG9mIGVpdGhlciB0aGUgdGFyZ2V0IHBhc3NlZCBpbnRvXG4gICAgLy8gYG9uYCBvciB0aGUgb2JqZWN0IGl0c2VsZi5cbiAgICB2YXIgaSwgbCA9IG5ldyBBcnJheSh0aGlzLmxpc3RlbmVyc1tldmVudF0ubGVuZ3RoKSwgbGVuXG4gICAgZm9yKGk9MCxsZW4gPSB0aGlzLmxpc3RlbmVyc1tldmVudF0ubGVuZ3RoO2k8bGVuO2krKykge1xuICAgICAgbFtpXSA9IFtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnNbZXZlbnRdW2ldWzBdLCBcbiAgICAgICAgdGhpcy5saXN0ZW5lcnNbZXZlbnRdW2ldWzFdXG4gICAgICBdXG4gICAgfVxuICAgIGZvcihpPTAsbGVuID0gbC5sZW5ndGg7aTxsZW47aSsrKSB7XG4gICAgICB2YXIgbGlzdGVuZXIgPSBsW2ldO1xuICAgICAgbGlzdGVuZXJbMV0uY2FsbChsaXN0ZW5lclswXSxkYXRhKTtcbiAgICB9XG4gIH1cbn1cblxuY29uc29sZS5sb2coUSlcblxubW9kdWxlLmV4cG9ydHMgPSBRXG4iLCJ2YXIgUSA9IHJlcXVpcmUoJy4vUScpXG5cbmZ1bmN0aW9uIGNvbGxpc2lvbnMobmFtZSwgYXNzZXQsIHNpemUpIHtcbiAgaWYoIVEuYXNzZXQoYXNzZXQpKSB7IHRocm93IFwiSW52YWxpZCBBc3NldDpcIiArIGFzc2V0OyB9XG4gIFxuICBleHBvcnRzLmNvbGxpc2lvbnNbbmFtZV0gPSB7IGhlYWQ6IFtdLCB0b3JzbzogW10sIGhpdDogW10gfVxuXG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSxcbiAgICAgIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKSxcbiAgICAgIGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpLFxuICAgICAgaW1nRGF0YSxcbiAgICAgIGhlYWQgPSAxNTAsXG4gICAgICB0b3JzbyA9IDIwMCxcbiAgICAgIGhpdCA9IDEwMFxuICBcbiAgaW1nLnNyYyA9IGFzc2V0O1xuICBjYW52YXMud2lkdGggPSBpbWcud2lkdGhcbiAgY2FudmFzLmhlaWdodCA9IGltZy5oZWlnaHRcbiAgY29udGV4dC5kcmF3SW1hZ2UoaW1nLCAwLCAwKTtcbiAgXG4gIGZ1bmN0aW9uIGZpbmQoaW1nRGF0YSwgcmNvbG9yKSB7XG4gICAgdmFyIGEgPSBBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGltZ0RhdGEuZGF0YSwgcmNvbG9yKSAvIDQsXG4gICAgICAgIGIgPSBBcnJheS5wcm90b3R5cGUubGFzdEluZGV4T2YuY2FsbChpbWdEYXRhLmRhdGEsIHJjb2xvcikgLyA0LFxuICAgICAgICBjID0ge31cbiAgICBpZihhIDwgLTEpIHJldHVybiBjXG4gICAgYy54ID0gYSAlIHNpemUudGlsZXdcbiAgICBjLnkgPSBNYXRoLmZsb29yKGEgLyBzaXplLnRpbGV3KVxuICAgIGMudyA9IGIgJSBzaXplLnRpbGV3IC0gYy54XG4gICAgYy5oID0gTWF0aC5mbG9vcihiIC8gc2l6ZS50aWxldykgLSBjLnlcbiAgICByZXR1cm4gY1xuICB9XG5cbiAgZm9yKHZhciB4ID0gMDsgeCA8IGltZy53aWR0aDsgeCs9c2l6ZS50aWxldykge1xuICAgIGltZ0RhdGEgPSBjb250ZXh0LmdldEltYWdlRGF0YSh4LCAwLCBzaXplLnRpbGV3LCBzaXplLnRpbGVoKTtcbiAgICBleHBvcnRzLmNvbGxpc2lvbnNbbmFtZV0uaGVhZC5wdXNoKGZpbmQoaW1nRGF0YSwgaGVhZCkpXG4gICAgZXhwb3J0cy5jb2xsaXNpb25zW25hbWVdLnRvcnNvLnB1c2goZmluZChpbWdEYXRhLCB0b3JzbykpXG4gICAgZXhwb3J0cy5jb2xsaXNpb25zW25hbWVdLmhpdC5wdXNoKGZpbmQoaW1nRGF0YSwgaGl0KSlcbiAgfVxuXG59XG5leHBvcnRzLmNvbGxpc2lvbnMgPSB7fVxuXG5leHBvcnRzLmxvYWQgPSBmdW5jdGlvbihjYikge1xuXG4gIFEubG9hZChbXG4gICAgXCIvYXNzZXRzL3RpbGVzLnBuZ1wiLFxuICAgIFwiL2Fzc2V0cy90c3Vpc29rdS5wbmdcIixcbiAgICBcIi9hc3NldHMva29zb2t1LnBuZ1wiLFxuICAgIFwiL2Fzc2V0cy9uaW5vYXNoaS5wbmdcIixcbiAgICBcIi9hc3NldHMvZnVqb2dlcmkucG5nXCIsXG4gICAgXCIvYXNzZXRzL3N1aWhlaWdlcmkucG5nXCIsXG4gICAgXCIvYXNzZXRzL21hbmppZ2VyaS5wbmdcIixcbiAgICBcIi9hc3NldHMvdG9yc28taGl0LnBuZ1wiLFxuICAgIFwiL2Fzc2V0cy9oZWFkb2ZmLWhpdC5wbmdcIixcbiAgICBcIi9hc3NldHMva29zb2t1LWNvbGxpc2lvbnMucG5nXCIsXG4gICAgXCIvYXNzZXRzL25pbm9hc2hpLWNvbGxpc2lvbnMucG5nXCIsXG4gICAgXCIvYXNzZXRzL3RzdWlzb2t1LWNvbGxpc2lvbnMucG5nXCIsXG4gICAgXCIvYXNzZXRzL2Z1am9nZXJpLWNvbGxpc2lvbnMucG5nXCIsXG4gICAgXCIvYXNzZXRzL3N1aWhlaWdlcmktY29sbGlzaW9ucy5wbmdcIixcbiAgICBcIi9hc3NldHMvbWFuamlnZXJpLWNvbGxpc2lvbnMucG5nXCJdLCBmdW5jdGlvbigpIHtcblxuICAgIFEuc2hlZXQoXCJ0aWxlc1wiLFwiL2Fzc2V0cy90aWxlcy5wbmdcIiwgeyB0aWxldzogMzIsIHRpbGVoOiAzMiB9KTtcblxuICAgIHZhciBwbGF5ZXJUaWxlID0geyB0aWxldzogNDgsIHRpbGVoOiAzMiB9XG4gICAgUS5zaGVldChcInN1aWhlaWdlcmlcIiwgXCIvYXNzZXRzL3N1aWhlaWdlcmkucG5nXCIsIHBsYXllclRpbGUpO1xuICAgIFEuc2hlZXQoXCJtYW5qaWdlcmlcIiwgXCIvYXNzZXRzL21hbmppZ2VyaS5wbmdcIiwgcGxheWVyVGlsZSk7XG4gICAgUS5zaGVldChcInRzdWlzb2t1XCIsIFwiL2Fzc2V0cy90c3Vpc29rdS5wbmdcIiwgcGxheWVyVGlsZSk7XG4gICAgUS5zaGVldChcImtvc29rdVwiLCBcIi9hc3NldHMva29zb2t1LnBuZ1wiLCBwbGF5ZXJUaWxlKTtcbiAgICBRLnNoZWV0KFwibmlub2FzaGlcIiwgXCIvYXNzZXRzL25pbm9hc2hpLnBuZ1wiLCBwbGF5ZXJUaWxlKTtcbiAgICBRLnNoZWV0KFwiZnVqb2dlcmlcIiwgXCIvYXNzZXRzL2Z1am9nZXJpLnBuZ1wiLCBwbGF5ZXJUaWxlKTtcbiAgICBcbiAgICBRLnNoZWV0KFwidG9yc28taGl0XCIsIFwiL2Fzc2V0cy90b3Jzby1oaXQucG5nXCIsIHBsYXllclRpbGUpO1xuICAgIFEuc2hlZXQoXCJoZWFkb2ZmLWhpdFwiLCBcIi9hc3NldHMvaGVhZG9mZi1oaXQucG5nXCIsIHBsYXllclRpbGUpO1xuXG4gICAgY29sbGlzaW9ucygnZnVqb2dlcmknLCBcIi9hc3NldHMvZnVqb2dlcmktY29sbGlzaW9ucy5wbmdcIiwgcGxheWVyVGlsZSlcbiAgICBjb2xsaXNpb25zKCdtYW5qaWdlcmknLCBcIi9hc3NldHMvbWFuamlnZXJpLWNvbGxpc2lvbnMucG5nXCIsIHBsYXllclRpbGUpXG4gICAgY29sbGlzaW9ucygnc3VpaGVpZ2VyaScsIFwiL2Fzc2V0cy9zdWloZWlnZXJpLWNvbGxpc2lvbnMucG5nXCIsIHBsYXllclRpbGUpXG4gICAgY29sbGlzaW9ucygnbmlub2FzaGknLCBcIi9hc3NldHMvbmlub2FzaGktY29sbGlzaW9ucy5wbmdcIiwgcGxheWVyVGlsZSlcbiAgICBjb2xsaXNpb25zKCd0c3Vpc29rdScsIFwiL2Fzc2V0cy90c3Vpc29rdS1jb2xsaXNpb25zLnBuZ1wiLCBwbGF5ZXJUaWxlKVxuICAgIGNvbGxpc2lvbnMoJ2tvc29rdScsIFwiL2Fzc2V0cy9rb3Nva3UtY29sbGlzaW9ucy5wbmdcIiwgcGxheWVyVGlsZSlcbiAgICBleHBvcnRzLmNvbGxpc2lvbnMuc3RhbmQgPSB7XG4gICAgICBoZWFkOiBbZXhwb3J0cy5jb2xsaXNpb25zLnRzdWlzb2t1LmhlYWRbMF1dLFxuICAgICAgdG9yc286IFtleHBvcnRzLmNvbGxpc2lvbnMudHN1aXNva3UudG9yc29bMF1dLFxuICAgICAgaGl0OiBbZXhwb3J0cy5jb2xsaXNpb25zLnRzdWlzb2t1LmhpdFswXV1cbiAgICB9XG4gICAgZXhwb3J0cy5jb2xsaXNpb25zLnVzaGlybyA9IHtcbiAgICAgIGhlYWQ6IGV4cG9ydHMuY29sbGlzaW9ucy50c3Vpc29rdS5oZWFkLnNsaWNlKDIsOSksXG4gICAgICB0b3JzbzogZXhwb3J0cy5jb2xsaXNpb25zLnRzdWlzb2t1LnRvcnNvLnNsaWNlKDIsOSksXG4gICAgICBoaXQ6IGV4cG9ydHMuY29sbGlzaW9ucy50c3Vpc29rdS5oaXQuc2xpY2UoMiw5KVxuICAgIH1cbiAgICBleHBvcnRzLmNvbGxpc2lvbnMudGFpc29rdSA9IHtcbiAgICAgIGhlYWQ6IFtdLmNvbmNhdChleHBvcnRzLmNvbGxpc2lvbnMudHN1aXNva3UuaGVhZCkucmV2ZXJzZSgpLFxuICAgICAgdG9yc286IFtdLmNvbmNhdChleHBvcnRzLmNvbGxpc2lvbnMudHN1aXNva3UudG9yc28pLnJldmVyc2UoKSxcbiAgICAgIGhpdDogW10uY29uY2F0KGV4cG9ydHMuY29sbGlzaW9ucy50c3Vpc29rdS5oaXQpLnJldmVyc2UoKVxuICAgIH1cblxuICAgIGNiKClcbiAgfSk7XG5cbn1cbiIsInZhciBRID0gcmVxdWlyZSgnLi9RJyksXG4gICAgYXNzZXRzID0gcmVxdWlyZSgnLi9hc3NldHMnKVxucmVxdWlyZSgnLi9QbGF5ZXInKVxucmVxdWlyZSgnLi9BdXRvUGxheWVyJylcblxuUS5zY2VuZShcImxldmVsMVwiLGZ1bmN0aW9uKHN0YWdlKSB7XG4gIHN0YWdlLmNvbGxpc2lvbkxheWVyKG5ldyBRLlRpbGVMYXllcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBBcnJheSgxMikuam9pbignMCcpLnNwbGl0KCcnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEFycmF5KDEyKS5qb2luKCcwJykuc3BsaXQoJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgQXJyYXkoMTIpLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBBcnJheSgxMikuam9pbignMCcpLnNwbGl0KCcnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEFycmF5KDEyKS5qb2luKCcwJykuc3BsaXQoJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgQXJyYXkoMTIpLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBBcnJheSgxMikuam9pbignMScpLnNwbGl0KCcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdLCBzaGVldDogJ3RpbGVzJyB9KSk7XG4gIHZhciBwbGF5ZXJhID0gc3RhZ2UuaW5zZXJ0KG5ldyBRLkF1dG9QbGF5ZXIoe3g6IDY0LCB5OiA2NH0pKVxuICB2YXIgcGxheWVyYiA9IHN0YWdlLmluc2VydChuZXcgUS5BdXRvUGxheWVyKHt4OiAyNTYsIHk6IDY0fSkpO1xuICBzdGFnZS5hZGQoXCJ2aWV3cG9ydFwiKS5mb2xsb3cocGxheWVyYSk7XG4gIHN0YWdlLm9uKFwiZGVzdHJveVwiLGZ1bmN0aW9uKCkge1xuICAgIHBsYXllcmEuZGVzdHJveSgpO1xuICB9KTtcbn0pO1xuXG5RLnNjZW5lKFwidGVzdFwiLGZ1bmN0aW9uKHN0YWdlKSB7XG4gIHN0YWdlLmNvbGxpc2lvbkxheWVyKG5ldyBRLlRpbGVMYXllcih7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpbGVzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBBcnJheSgyNCkuam9pbignMCcpLnNwbGl0KCcnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEFycmF5KDI0KS5qb2luKCcwJykuc3BsaXQoJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgQXJyYXkoMjQpLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBBcnJheSgyNCkuam9pbignMCcpLnNwbGl0KCcnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEFycmF5KDI0KS5qb2luKCcwJykuc3BsaXQoJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXcgQXJyYXkoMjQpLmpvaW4oJzAnKS5zcGxpdCgnJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5ldyBBcnJheSgyNCkuam9pbignMCcpLnNwbGl0KCcnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IEFycmF5KDI0KS5qb2luKCcwJykuc3BsaXQoJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoJzEnICsgKG5ldyBBcnJheSgyMikuam9pbignMCcpKSArICcxJykuc3BsaXQoJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoJzEnICsgKG5ldyBBcnJheSgyMikuam9pbignMCcpKSArICcxJykuc3BsaXQoJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoJzEnICsgKG5ldyBBcnJheSgyMikuam9pbignMCcpKSArICcxJykuc3BsaXQoJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoJzEnICsgKG5ldyBBcnJheSgyMikuam9pbignMScpKSArICcxJykuc3BsaXQoJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoJzEnICsgKG5ldyBBcnJheSgyMikuam9pbignMCcpKSArICcxJykuc3BsaXQoJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoJzEnICsgKG5ldyBBcnJheSgyMikuam9pbignMCcpKSArICcxJykuc3BsaXQoJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoJzEnICsgKG5ldyBBcnJheSgyMikuam9pbignMCcpKSArICcxJykuc3BsaXQoJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoJzEnICsgKG5ldyBBcnJheSgyMikuam9pbignMScpKSArICcxJykuc3BsaXQoJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIF0sIHNoZWV0OiAndGlsZXMnIH0pKTtcbiAgdmFyIHBsYXllcmEgPSBzdGFnZS5pbnNlcnQobmV3IFEuQXV0b1BsYXllcih7eDogNjQsIHk6IDYqNjR9KSksXG4gICAgICBwbGF5ZXJiID0gc3RhZ2UuaW5zZXJ0KG5ldyBRLkF1dG9QbGF5ZXIoe3g6IDEyOCwgeTogNio2NH0pKTtcbiAgcGxheWVyYS5vbignc3RlcCcsIF8uYmluZChwbGF5ZXJhLnRzdWlzb2t1LCBwbGF5ZXJhKSlcbiAgcGxheWVyYi5vbignc3RlcCcsIF8uYmluZChwbGF5ZXJiLnRhaXNva3UsIHBsYXllcmIpKVxuICBzdGFnZS5hZGQoXCJ2aWV3cG9ydFwiKVxuICBzdGFnZS5vbihcImRlc3Ryb3lcIixmdW5jdGlvbigpIHtcbiAgICBwbGF5ZXJhLmRlc3Ryb3koKTtcbiAgfSk7XG59KTtcblxuUS5zY2VuZSgnZW5kR2FtZScsZnVuY3Rpb24oc3RhZ2UpIHtcbiAgdmFyIGNvbnRhaW5lciA9IHN0YWdlLmluc2VydChuZXcgUS5VSS5Db250YWluZXIoe1xuICAgIHg6IFEud2lkdGgvMiwgeTogUS5oZWlnaHQvMiwgZmlsbDogXCJyZ2JhKDAsMCwwLDAuNSlcIlxuICB9KSk7XG4gIFxuICB2YXIgYnV0dG9uID0gY29udGFpbmVyLmluc2VydChuZXcgUS5VSS5CdXR0b24oeyB4OiAwLCB5OiAwLCBmaWxsOiBcIiNDQ0NDQ0NcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IFwiUGxheSBBZ2FpblwiIH0pKSAgICAgICAgIFxuICB2YXIgbGFiZWwgPSBjb250YWluZXIuaW5zZXJ0KG5ldyBRLlVJLlRleHQoe3g6MTAsIHk6IC0xMCAtIGJ1dHRvbi5wLmgsIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IHN0YWdlLm9wdGlvbnMubGFiZWwgfSkpO1xuXG4gIGJ1dHRvbi5vbihcImNsaWNrXCIsZnVuY3Rpb24oKSB7XG4gICAgUS5jbGVhclN0YWdlcygpO1xuICAgIFEuc3RhZ2VTY2VuZSgnbGV2ZWwxJyk7XG4gIH0pO1xuICBjb250YWluZXIuZml0KDIwKTtcbn0pO1xuXG5hc3NldHMubG9hZChmdW5jdGlvbigpIHtcbiAgUS5zdGFnZVNjZW5lKFwibGV2ZWwxXCIpO1xufSlcbiJdfQ==
