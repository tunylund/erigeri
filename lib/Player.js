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
