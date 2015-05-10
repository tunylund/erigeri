var Q = require('./Q'),
    GeriMon = require('./GeriMon'),
    _ = require('../bower_components/underscore/underscore.js')

Q.GeriMon.extend("Player",{
  init: function(p) {
    this._super(p, {});
    this.add('platformerControls');
    
    Q.input.on("fire", this, 'fire');
    Q.input.on("right", this, 'unsoku');
    Q.input.on("left", this, 'unsoku');
  },

  fire: function() {
    if (Q.inputs.down) {
      this.manjigeri()
    } else {
      this.suiheigeri()
    }
  },

  unsoku: function() {
    //forward
    if(Q.inputs[this.p.direction]) {
      this.tsuisoku()
    }
    //backward
    if(Q.inputs[this.p.direction === 'left' ? 'right' : 'left']) {
      this.taisoku()
    }
  }

});
