import Q from './Q.mjs'
import loadAssets from './assets.mjs'
import { playMusic, toggleMute } from './audio.mjs'
import Player from './Player.mjs'
import AutoPlayer from './AutoPlayer.mjs'
import AnimPlayer from './AnimPlayer.mjs'
import Hud from './Hud.mjs'
import ScoreBoard from './ScoreBoard.mjs'
import Judge from './Judge.mjs'

const hud = new Hud()
const scoreboard = new ScoreBoard()

function buildLevel() {
  return new Q.TileLayer({
   tiles: [
   new Array(19).fill('0'),
   new Array(19).fill('0'),
   new Array(19).fill('0'),
   new Array(19).fill('0'),
   new Array(19).fill('0'),
   new Array(19).fill('0'),
   new Array(19).fill('0'),
   new Array(19).fill('0'),
   new Array(19).fill('0'),
   new Array(19).fill('0'),
   new Array(19).fill('0'),
   new Array(19).fill('0'),
   new Array(19).fill('0'),
   new Array(19).fill('1')
   ], sheet: 'tiles' 
  })
}

function gameLoop(stage, judge) {

  function scores() {
    return [Q.state.get('score-a'), Q.state.get('score-b'), Q.state.get('score-c')]
  }
  
  function pausePlayers() {
    if(scores().includes(4)) {
      stage.lists.players.map(p => p.pause())
    }
  }
  
  function cleanup() { 
    judge && judge.destroy()
    Q.state.off('change', pausePlayers)
    stage.lists.players.map(p => p.destroy())
    hud.reset()
  }
  
  function endGame() {
    if(Q.stage(1).scene.name == 'play-1on1' || Q.stage(1).scene.name == 'play-1on2') scoreboard.save()
    Q.stageScene('autoplay', 1)
    scoreboard.show()
  }

  function newGame() {
    if(Q.stage(1).scene.name == 'play-1on1' || Q.stage(1).scene.name == 'play-1on2') scoreboard.hide()
    Q.state.set({ 'total-score-a': 0, 'total-score-b': 0, 'total-score-c': 0, 'round': 0 })
    playMusic('assets/bg-loop.mp3')
    newRound()
  }

  function newRound() {
    hud.reset()
    const players = stage.lists.players
    const numbers = [164, 312, 412]
    numbers.map((x, i) => {
      players[i] && players[i].set({x: x, y: 25*16, vy: 0})
    })
    Q.state.inc('round', 1)
    if(Q.state.get('round') > 1) {
      playMusic('assets/it+.mp3')
    }
    stage.lists.players.map(p => p.unpause())
  }

  function roundEnd() {
    const scores = stage.lists.players
      .map(p => ({ i: p.p.i, score: Q.state.get('score-'+ p.p.i) }))
      .sort((a, b) => a.score < b.score ? -1 : a.score > b.score ? 1 : 0)
    if(scores[0].i === 'a' && scores[0].score < scores[1].score) {
      endGame()
    } else {
      newRound()
    }
  }

  stage.on('destroyed', cleanup)
  Q.state.on('change', pausePlayers)
  judge.on('talkEnd', roundEnd)
  newGame()
}

Q.scene('bg', stage => {
  const bg = stage.insert(new Q.Sprite({
    asset: "assets/bg-1.png",
    scale: 608/900
  }))
  bg.center()
  bg.p.y -= 5 +64
  stage.on("destroy",function() {
    judge.destroy()
  })
})

Q.scene("anims", stage => {
  const layer = stage.collisionLayer(buildLevel())
  const playera = stage.insert(new AnimPlayer({x: 64, y: 25*16}))
  stage.add("viewport")
  stage.viewport.scale = 1
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2+64)
})

Q.scene("play-1on1", stage => {
  const layer = stage.collisionLayer(buildLevel())
  stage.addToList('players', stage.insert(new Player({i: 'a'})))
  stage.addToList('players', stage.insert(new AutoPlayer({i: 'b'})))
  const judge = stage.insert(new Judge({x: 38, y: 25*16}))
  stage.add("viewport")
  stage.viewport.scale = 1
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2+64)
  gameLoop(stage, judge)
})

Q.scene("play-1on2", stage => {
  const layer = stage.collisionLayer(buildLevel())
  stage.addToList('players', stage.insert(new Player({i: 'a'})))
  stage.addToList('players', stage.insert(new AutoPlayer({i: 'b'})))
  stage.addToList('players', stage.insert(new AutoPlayer({i: 'c'})))
  const judge = stage.insert(new Judge({x: 38, y: 25*16}))
  stage.add("viewport")
  stage.viewport.scale = 1
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2+64)
  gameLoop(stage, judge)
})

Q.scene("autoplay", stage => {
  const layer = stage.collisionLayer(buildLevel())
  stage.addToList('players', stage.insert(new AutoPlayer({i: 'a'})))
  stage.addToList('players', stage.insert(new AutoPlayer({i: 'b'})))
  stage.addToList('players', stage.insert(new AutoPlayer({i: 'c'})))
  const judge = stage.insert(new Judge({x: 38, y: 25*16}))
  stage.add("viewport")
  stage.viewport.scale = 1
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2+64)
  gameLoop(stage, judge)
})

loadAssets(() => {
  Q.stageScene("bg", 0)
  Q.stageScene("autoplay", 1)
  Q.state.set('nomusic', false)
  document.body.addEventListener('keyup', function(e) {
    if(e.keyCode == 49) {
      Q.clearStage(1)
      Q.stageScene("play-1on1", 1)
    }
    if(e.keyCode == 50) {
      Q.clearStage(1)
      Q.stageScene("play-1on2", 1)
    }
    if(e.keyCode == 51) {
      Q.clearStage(1)
      Q.stageScene("anims", 1)
    }
    if(e.keyCode == 77) {
      toggleMute()
    }
  })
})
