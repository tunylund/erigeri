import Q from './Q.mjs'
import { Ball } from './GeriMon.mjs'

function sample(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

Q.animations('judge', {
  stand: { frames: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,13], loop: true, rate: 1/10 },
  walk: { frames: [0,1,2,3,4,5,6,7,8,9,10], loop: true, rate: 1/20 },
  talk: { frames: [10,11,12,11], loop: true, rate: 1/10  }
})

class Judge extends Q.MovingSprite {
  
  constructor (p) {
    super(p, {
      sprite: "judge",
      sheet: "judge",
      sensor: true,
      cx: 14,
      scale: .8
    })
    this.add('2d, animation')
    this.stand()

    this.on('sayNext', this, 'sayNext')
    this.on('destroyed', this, 'dest')
    
    this.textEl = document.createElement('div')
    this.textEl.className = 'judgement'
    document.body.appendChild(this.textEl)

    this.on('step', this, 'tryCancel')

    Q.state.on("change", this, 'judge')
  }

  tryCancel () {
    if(this.p.x > 150 && Q.inputs.fire) {
      this.off('step', this, 'enterEnd')
      this.off('step', this, 'exitEnd')
      this.talkEnd()
    }
  }

  enter () {
    this.p.vx = 30*2
    this.p.flip = ""
    this.play('walk', 1)
    this.on('step', this, 'enterEnd')
  }

  enterEnd () {
    if(this.p.x > 150) {
      this.p.vx = 0
      this.off('step', this, 'enterEnd')
      this.trigger('enterEnd')
    }
  }

  ushiro () {
    if(this.p.flip) {
      this.p.flip = ""
    } else {
      this.p.flip = "x"
    }
  }

  exit () {
    this.p.vx = -30*2
    this.p.flip = "x"
    this.play('walk', 1)
    this.on('step', this, 'exitEnd')
  }

  exitEnd () {
    if(this.p.x < 38) {
      this.p.vx = 0
      this.off('step', this, 'exitEnd')
      this.trigger('exitEnd')
      this.stand()
    }
  }

  stand () {
    this.p.flip = ""
    this.p.cx = 14*2
    this.play('stand', 1)
    this.off('enterEnd', this, 'talk')
    this.off('talkEnd', this, 'exit')
    this.off('exitEnd', this, 'stand')
    this.trigger('stand')
  }

  throwBalls () {
    this.p.ballTimeout = setTimeout(() => this.throwBall(3000), 4000)
  }

  stopThrowingBalls() {
    clearTimeout(this.p.ballTimeout)
  }

  throwBall (nextBallIn) {
    const b = Ball[sample(['slow', 'medium', 'fast'])]({
      x: this.p.x,
      y: this.p.y
    })
    this.stage.addToList('balls', b)
    this.stage.insert(b)
    this.p.ballTimeout = setTimeout(() => this.throwBall(Math.max(nextBallIn - 250, 1000)), nextBallIn)
  }

  sayNext () {
    let choices = [""],
        texts = {
          ball: [["Oh dear...", "...are you ok?", "Gosh! That probably hurt.", "Maybe we should reconsider this..."]],
          winner: [["The winner is {color}.", "{color} wins the round."]],
          second: [["{color} is second.", "{color} comes in second."]],
          loser: [
            ['{color} you r-rated-word-i-should\'t say.', '{color}... really?', 'just... just don\'t, {color}.'],
            ['{color} you can stop now.', '{color} you can do better.', 'C\'mon {color}'],
            ['{color} almost there.', 'maybe next time try to do better {color}.'],
            ['Tough luck {color}.']
          ]
        }
    
    if (this.p.said === 0) {
      if (Q.state.get('ballround')) choices = texts.ball
      else choices = texts.winner
    } else {
      if (this.p.said == this.stage.lists.players.length-1) choices = texts.loser
      else choices = texts.second
    }

    let score = this.p.result[this.p.said].score,
        color = this.p.result[this.p.said].color,
        scoreTexts = choices[score % choices.length],
        t = sample(scoreTexts)
    this.textEl.innerHTML = t.replace('{color}', color)

    this.p.said += 1
    if(Q.state.get('ballround') || this.p.said >= this.stage.lists.players.length) {
      this.p.d = setTimeout(() => this.talkEnd(), 2000)
    } else {
      this.p.d = setTimeout(() => this.trigger('sayNext'), 2000)
    }
  }

  talk () {
    clearTimeout(this.p.d)
    this.play('talk', 1)
    this.p.said = 0
    this.sayNext()
  }

  talkEnd () {
    clearTimeout(this.p.d)
    this.stopThrowingBalls()
    this.p.said = 0
    this.textEl.innerHTML = ""
    this.exit()
    this.trigger('talkEnd')
  }

  judge () {
    this.p.result = this.stage.lists.players
      .map(p => ({
        i: p.p.i,
        score: Q.state.get('score-' + p.p.i),
        color: {a: 'orange', b: 'blue', c: 'green'}[p.p.i]
      }))
      .sort((a, b) => a.score < b.score ? 1 : a.score > b.score ? -1 : 0)
    if (this.p.result[0].score === 4) {
      this.stopThrowingBalls()
      this.enter()
      this.on('enterEnd', this, 'talk')
      this.on('talkEnd', this, 'exit')
      this.on('exitEnd', this, 'stand')
    }
  }

  dest () {
    this.textEl.parentNode.removeChild(this.textEl)
    this.off('enterEnd', this, 'talk')
    this.off('talkEnd', this, 'exit')
    this.off('exitEnd', this, 'stand')
    this.stopThrowingBalls()
    clearTimeout(this.p.d)
  }

}

export default Judge
