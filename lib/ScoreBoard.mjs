import Q from './Q.mjs'

class ScoreBoard extends Q.GameObject {

  constructor () {
    super()

    this.scores = []
    this.el = document.getElementById('scoreboard')
    this.load()
    this.refresh()

    Q.state.on('change.round', this, 'refresh')
  }

  load () {
    if(!localStorage) return;
    this.scores = JSON.parse(localStorage.getItem('scoreboard')) || []
  }

  save () {
    if(!localStorage) return;
    const d = new Date()
    this.scores.push({
      stage: Q.stage(1).scene.name.replace('play-', ''),
      value: Q.state.get('total-score-a'),
      date: [[d.getDate(), d.getMonth()+1, d.getFullYear()].join('.'),
             [d.getHours(), d.getMinutes()].join(':')]
             .join(' ')
    })
    this.scores = this.scores.sort((a, b) => a.value < b.value ? 1 : a.value > b.value ? -1 : 0).slice(0,10)
    localStorage.setItem('scoreboard', JSON.stringify(this.scores))
  }

  refresh () {
    while(this.el.children.length > 0) {
      this.el.children[0].remove()
    }
    this.scores.forEach(function(score) {
      const li = document.createElement('li')
      li.innerHTML = "<b>" + score.value + "</b> " + score.stage + " " + score.date
      this.el.appendChild(li)
    }.bind(this))
  }

  show () {
    this.el.classList.add('open')
  }

  hide () {
    this.el.classList.remove('open')
  }
}

export default ScoreBoard