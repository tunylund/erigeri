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
