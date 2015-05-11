var Q = require('./Q'),
    _ = require('../bower_components/underscore/underscore.js')

Q.animations('gerimon', {
  stand: { frames: [0] },
  test: { frames: [10] },
  fujogeri: { frames: _.range(15), rate: 1/10, loop: false, trigger: 'stand' },
  suiheigeri: { frames: _.range(15), rate: 1/10, loop: false, trigger: 'stand' },
  manjigeri: { frames: _.range(15), rate: 1/10, loop: false, trigger: 'stand' },
  tsuisoku: { frames: _.range(11), rate: 1/10, loop: false, trigger: 'stand' },
  ninoashi: { frames: _.range(6), rate: 1/10, loop: false, trigger: 'stand' },
  taisoku: { frames: _.range(11).reverse(), rate: 1/10, loop: false, trigger: 'stand' }
});

function attack(fn) {
  return function() {
    if(this.p.attacking) return;
    if(this.p.walking) return;
    this.p.attacking = true
    this.p.vx = 0
    fn.apply(this, arguments)
  }
}

function jump(fn) {
  return function() {
    if(this.p.jumping) return;
    fn.apply(this, arguments)
  }
}

function walk(fn) {
  return function() {
    if(!this.p.landed) return;
    if(this.p.attacking) return;
    if(this.p.walking) return;
    this.walking = true
    fn.apply(this, arguments)
  }
}

Q.MovingSprite.extend("GeriMon",{
  instances: [],
  hitDistance: 40,
  speed: 25,
  jumpSpeed: 100,
  
  init: function(p) {
    var w = 22, h = 32
    this._super(p, { 
      sprite: "gerimon",
      sheet: "tsuisoku",
      dir: 1,
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
    this.p.landed = true
  },

  fujogeri: jump(attack(function() {
    this.sheet("fujogeri")
    this.play('fujogeri', 1)
    this.on('prestep', this, 'fujogeriStep')
  })),

  fujogeriStep: function() {
    if(this.p.animationFrame === 5) {
      // this.p.vx = this.p.dir * this.speed * 2/3
    }
    if(this.p.animationFrame === 7) {
      this.p.vy = -this.jumpSpeed
      this.p.landed = false
      this.p.jumping = true
    }
  },

  manjigeri: attack(function() {
    this.sheet("manjigeri")
    this.play('manjigeri', 1)
  }),

  suiheigeri: attack(function() {
    this.sheet("suiheigeri")
    this.play('suiheigeri', 1)
  }),
  
  ushiro: walk(function() {
    this.p.direction = this.p.direction === 'left' ? 'right' : 'left'
    this.stand()
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
  
  stand: function() {
    this.p.frame = 0
    this.p.vx = 0
    this.play('stand', 1, true)
    this.sheet("tsuisoku")
    this.p.jumping = false;
    this.p.attacking = false;
    this.p.walking = false;
    this.off('prestep', this, 'fujogeriStep')
  },

  prestep: function(t) {
    if(this.p.direction === 'left') {
      this.set({flip: 'x'})
      this.p.dir = -1
    }
    if(this.p.direction === 'right') {
      this.set({flip: ''})
      this.p.dir = 1
    }
  }

});
