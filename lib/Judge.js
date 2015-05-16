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
    this.play('stand', 1)
    this.off('enterEnd', this, 'talk')
    this.off('talkEnd', this, 'exit')
    this.off('exitEnd', this, 'stand')
    this.trigger('stand')
  },

  sayNext: function() {
    var text = "";
    if(this.p.said === 0) { text = "The winner is {color}." }
    if(this.p.said === 1) { text = "{color} is second." }
    if(this.p.said === 2) {
      text = _.sample([
        ['{color}, you bitch.', '{color}... really?', 'just... just don\'t, {color}.'],
        ['{color}, you can stop now.', '{color}, you can do better.', 'C\'mon {color}'],
        ['{color}, almost there.', 'maybe next time try to do better {color}.'],
        ['Tough luck {color}.']
      ][this.p.result[this.p.said].score])
    }
    this.textEl.innerHTML = text.replace('{color}', this.p.result[this.p.said] ? this.p.result[this.p.said].color : "")
    this.p.said += 1
    if(this.p.said > 3) {
      this.exit()
      this.trigger('talkEnd')
    } else {
      _.delay(_.bind(this.trigger, this, 'sayNext'), 2500)
    }
  },

  talk: function() {
    this.play('talk', 1)
    this.p.said = 0
    this.sayNext()
  },

  judge: function() {
    if(this.p.animation != 'stand') return;
    this.p.result = _.sortBy([
      {i: 'a', score: Q.state.get('score-a'), color: 'orange'},
      {i: 'b', score: Q.state.get('score-b'), color: 'blue'},
      {i: 'c', score: Q.state.get('score-c'), color: 'green'}
    ], 'score').reverse()
    if(this.p.result[0].score === 4) {
      this.enter()
      this.on('enterEnd', this, 'talk')
      this.on('talkEnd', this, 'exit')
      this.on('exitEnd', this, 'stand')
    }
  }

})
