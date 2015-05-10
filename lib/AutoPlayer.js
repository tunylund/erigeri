var Q = require('./Q'),
    _ = require('../bower_components/underscore/underscore.js')
require('./GeriMon')


function distance(a, b) {
  return Math.abs(a.p.x - b.p.x);
}

function spotAttack(target) {
  if(target.p.animation === 'suiheigeri') {
    if(target.p.animationFrame > 0 && 
      target.p.animationFrame < 8)
      return 'suiheigeri'
  }
  if(target.p.animation === 'manjigeri') {
    if(target.p.animationFrame > 0 && 
      target.p.animationFrame < 8)
      return 'manjigeri'
  } 
}

Q.GeriMon.extend("AutoPlayer", {

  lookAt: function(target) {
    this.p.direction = target.p.x < this.p.x ? 'left' : 'right'
  },

  moveCloser: function(target) {
    if(distance(target, this) > this.hitDistance + this.p.w/2) {
      this.tsuisoku()
    } else {
      this.ninoashi()
    }
  },

  cancelAttack: function() {
    if(this.attacking && this.p.animationFrame < 8) {
      this.stand()
    }
  },

  counterAttack: function(target, attack) {
    if(attack === 'suiheigeri') {
      this.manjigeri()
    }
  },

  evade: function(target, attack) {
    if(attack) {
      this.cancelAttack()
      this.counterAttack(target, attack)
      this.taisoku()
    }
  },

  attack: function(target) {
    var attackMethod = _.sample(['suiheigeri', 'manjigeri'])
    this[attackMethod]()
  },

  step: function() {
    var others = _.without(this.instances, this),
        target;
    if(others.length > 0) {
      target = _.sample(others)

      if(target) {

        this.lookAt(target)
        
        if(distance(target, this) > this.hitDistance) {
          this.moveCloser(target)
        }

        this.evade(target, spotAttack(target))
        
        if(distance(target, this) <= this.hitDistance) {
          this.attack(target)
        }

      }
    }
  }

})