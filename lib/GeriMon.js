var Q = require('./Q'),
    _ = require('../bower_components/underscore/underscore.js')

Q.animations('gerimon', {
  stand: { frames: [0] },
  test: { frames: [10] },
  suiheigeri: { frames: _.range(15), rate: 1/10, loop: false, trigger: 'stand' },
  manjigeri: { frames: _.range(15), rate: 1/10, loop: false, trigger: 'stand' },
  tsuisoku: { frames: _.range(11), rate: 1/10, loop: false, trigger: 'stand' },
  ninoashi: { frames: _.range(6), rate: 1/10, loop: false, trigger: 'stand' },
  taisoku: { frames: _.range(11).reverse(), rate: 1/10, loop: false, trigger: 'stand' }
});

function attack(fn) {
  return function() {
    if(this.attacking) return;
    if(this.walking) return;
    this.attacking = true
    this.p.vx = 0
    fn.apply(this, arguments)
  }
}

function walk(fn) {
  return function() {
    if(!this.landed) return;
    if(this.attacking) return;
    if(this.walking) return;
    this.walking = true
    fn.apply(this, arguments)
  }
}

Q.Sprite.extend("GeriMon",{
  instances: [],
  hitDistance: 40,
  speed: 25,

  init: function(p) {
    var w = 22, h = 32
    this._super(p, { 
      sprite: "gerimon",
      sheet: "tsuisoku",
      w: w,
      h: h,
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

    this.stand()
  },

  land: function() {
    this.landed = true
  },

  manjigeri: attack(function() {
    this.sheet("manjigeri")
    this.play('manjigeri', 1)
  }),

  suiheigeri: attack(function() {
    this.sheet("suiheigeri")
    this.play('suiheigeri', 1)
  }),

  ushiro: function() {
    if(this.p.direction === 'left') {
      this.set({flip: 'x'})
    }
    if(this.p.direction === 'right') {
      this.set({flip: ''})
    }
  },

  ninoashi: walk(function() {
    this.p.vx = this.p.direction == 'right' ? this.speed/2 : -this.speed/2;
    this.sheet("ninoashi")
    this.play('ninoashi', 1)
  }),

  taisoku: walk(function() {
    this.p.vx = this.p.direction == 'right' ? -this.speed : this.speed;
    this.sheet("tsuisoku")
    this.play('taisoku', 1)
  }),
  
  tsuisoku: walk(function() {
    this.p.vx = this.p.direction == 'right' ? this.speed : -this.speed;
    this.sheet("tsuisoku")
    this.play('tsuisoku', 1)
  }),
  
  stand: function() {
    this.p.frame = 0
    this.p.vx = 0
    this.play('stand', 1, true)
    this.sheet("tsuisoku")
    this.attacking = false;
    this.walking = false;
  },

  prestep: function() {
    if(this.p.direction !== this.prevDir) {
      this.ushiro()
    }
    this.prevDir = this.p.direction;
  }

});
