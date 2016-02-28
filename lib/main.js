var Q = require('./Q'),
    assets = require('./assets'),
    audio = require('./audio')
require('./Player')
require('./AutoPlayer')
require('./AnimPlayer')
require('./Hud')
require('./ScoreBoard')
require('./Judge')

var level = function() {
  return new Q.TileLayer({
   tiles: [
   new Array(20).join('0').split(''),
   new Array(20).join('0').split(''),
   new Array(20).join('0').split(''),
   new Array(20).join('0').split(''),
   new Array(20).join('0').split(''),
   new Array(20).join('0').split(''),
   new Array(20).join('0').split(''),
   new Array(20).join('0').split(''),
   new Array(20).join('0').split(''),
   new Array(20).join('0').split(''),
   new Array(20).join('0').split(''),
   new Array(20).join('0').split(''),
   new Array(20).join('0').split(''),
   new Array(20).join('1').split('')
   ], sheet: 'tiles' 
  })
}

function gameLoop(stage, judge) {
  
  function pausePlayers() {
    if(_.contains([Q.state.get('score-a'), Q.state.get('score-b'), Q.state.get('score-c')], 4)) {
      _.invoke(stage.lists.players, 'pause')
    }
  }
  
  function cleanup() { 
    judge && judge.destroy()
    Q.state.off('change', pausePlayers)
    _.invoke(stage.lists.players, 'destroy');
    hud.reset()
  }
  
  function endGame() {
    if(Q.stage(1).scene.name == 'play-1on1' || Q.stage(1).scene.name == 'play-1on2') scoreboard.save()
    Q.stageScene('autoplay', 1)
    scoreboard.show()
  }

  function newGame() {
    if(Q.stage(1).scene.name == 'play-1on1' || Q.stage(1).scene.name == 'play-1on2') scoreboard.hide()
    Q.state.set({ 'total-score-a': 0, 'total-score-b': 0, 'total-score-c': 0, 'round': 0 });
    audio.music('assets/bg-loop.mp3');
    newRound()
  }

  function newRound() {
    hud.reset()
    var players = stage.lists.players;
    [164, 312, 412].forEach(function(x, i) {
      players[i] && players[i].set({x: x, y: 25*16, vy: 0})
    })
    Q.state.inc('round', 1)
    if(Q.state.get('round') > 1) {
      audio.music('assets/it+.mp3')
    }
    _.invoke(stage.lists.players, 'unpause')
  }

  function roundEnd() {
    var scores = _.sortBy(stage.lists.players.map(function(p) {
      return {i: p.p.i, score: Q.state.get('score-'+ p.p.i)}
    }), 'score')
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

Q.scene('bg', function(stage) {
  var bg = stage.insert(new Q.Sprite({
    asset: "assets/bg-1.png",
    scale: 608/900
  }))
  bg.center()
  bg.p.y -= 5 +64
  stage.on("destroy",function() {
    judge.destroy()
  });
})

Q.scene("anims", function(stage) {
  var layer = stage.collisionLayer(level());
  var playera = stage.insert(new Q.AnimPlayer({x: 64, y: 25*16}))
  stage.add("viewport")
  stage.viewport.scale = 1
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2+64)
})

Q.scene("play-1on1", function(stage) {
  var layer = stage.collisionLayer(level());
  stage.addToList('players', stage.insert(new Q.Player({i: 'a'})))
  stage.addToList('players', stage.insert(new Q.AutoPlayer({i: 'b'})))
  var judge = stage.insert(new Q.Judge({x: 38, y: 25*16}))
  stage.add("viewport")
  stage.viewport.scale = 1
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2+64)
  gameLoop(stage, judge)
})

Q.scene("play-1on2", function(stage) {
  var layer = stage.collisionLayer(level());
  stage.addToList('players', stage.insert(new Q.Player({i: 'a'})))
  stage.addToList('players', stage.insert(new Q.AutoPlayer({i: 'b'})))
  stage.addToList('players', stage.insert(new Q.AutoPlayer({i: 'c'})))
  var judge = stage.insert(new Q.Judge({x: 38, y: 25*16}))
  stage.add("viewport")
  stage.viewport.scale = 1
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2+64)
  gameLoop(stage, judge)
})

Q.scene("autoplay", function(stage) {
  var layer = stage.collisionLayer(level());
  stage.addToList('players', stage.insert(new Q.AutoPlayer({i: 'a'})))
  stage.addToList('players', stage.insert(new Q.AutoPlayer({i: 'b'})))
  stage.addToList('players', stage.insert(new Q.AutoPlayer({i: 'c'})))
  var judge = stage.insert(new Q.Judge({x: 38, y: 25*16}))
  stage.add("viewport")
  stage.viewport.scale = 1
  stage.viewport.centerOn(layer.p.w/2, layer.p.h/2+64)
  gameLoop(stage, judge)
})

var hud,
    scoreboard
assets.load(function() {
  hud = new Q.Hud()
  hud.init()
  scoreboard = new Q.ScoreBoard()
  scoreboard.init()
  Q.stageScene("bg", 0);
  Q.stageScene("autoplay", 1);
  Q.state.set('nomusic', false)
  document.body.addEventListener('keyup', function(e) {
    if(e.keyCode == 49) {
      Q.clearStage(1)
      Q.stageScene("play-1on1", 1);
    }
    if(e.keyCode == 50) {
      Q.clearStage(1)
      Q.stageScene("play-1on2", 1);
    }
    if(e.keyCode == 51) {
      Q.clearStage(1)
      Q.stageScene("anims", 1);
    }
    if(e.keyCode == 77) {
      audio.toggleMute()
    }
  })
})
console.log(Q)